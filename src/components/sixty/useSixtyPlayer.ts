import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  CLEAR_SECONDS,
  ERASE_END,
  ERASE_START,
  HAND_END,
  HAND_START,
  NARROW_BELOW,
  PULSES,
  boards,
  clamp,
  handAngle,
  sectorPath,
} from './sixty-drawing'
import {
  chapterAt,
  sixtyChapters,
  sixtyLength,
  sixtySpeeds,
} from './sixty-script'

const ns = 'http://www.w3.org/2000/svg'
/** How far one key press skips. */
const skip = 5

/** One timed stroke or label on the board. */
interface Item {
  readonly el: SVGGraphicsElement
  readonly start: number
  readonly seconds: number
  /** A stroke: its length, drawn along it with a dash offset. */
  readonly length?: number
  /** A dashed stroke draws through a mask, so the dashes keep their pattern. */
  readonly mask?: SVGPathElement
  /** A label: wiped in from the left by a clip rectangle. */
  readonly rect?: SVGRectElement
  readonly box?: { x: number; y: number; width: number; height: number }
  drawn: 'none' | 'part' | 'done' | ''
}

/** A wiping stroke: its path, its length, and the figure that rides it. */
interface Wipe {
  readonly path: SVGPathElement
  readonly length: number
}

/** The elements the frames write, found once inside the player's root. */
interface Nodes {
  readonly svg: SVGSVGElement
  readonly defs: SVGDefsElement
  readonly hand: SVGGElement | null
  readonly wedge: SVGPathElement | null
  readonly glow: SVGCircleElement | null
  readonly stick: SVGGElement | null
  readonly eraser: SVGGElement | null
  readonly erase: Wipe | null
  readonly haze: SVGPathElement | null
  readonly clear: Wipe | null
  readonly segments: readonly HTMLElement[]
  readonly knob: HTMLElement | null
}

interface Engine {
  /** Seconds into the drawing; negative while Smudge clears the board before 0:00. */
  t: number
  playing: boolean
  last: number
  speed: number
  narrow: boolean
  /** Once the visitor has played or scrubbed; resting, the board stands finished. */
  started: boolean
  dragging: boolean
  wasPlaying: boolean
  nodes: Nodes | null
  items: Item[]
  frame: number
  /** Smudge is cued once per run, when the drawing reaches the end on its own. */
  cued: boolean
}

export interface SixtyPlayerOptions {
  readonly reduced: boolean
  /** Called once each time the drawing plays through to 1:00. */
  readonly onEnded?: () => void
}

/** What the player's controls need: the state that changes seldom, and the actions. */
export interface SixtyPlayerApi {
  /** Unique to this player: the board's title, description, masks and filter ids. */
  readonly id: string
  readonly playing: boolean
  /** Whole seconds into the drawing. */
  readonly second: number
  readonly chapter: number
  /** Index into sixtySpeeds. */
  readonly speed: number
  /** The narrow arrangement: the board is narrower than NARROW_BELOW pixels. */
  readonly narrow: boolean
  /** False while the board rests, finished, before anyone has played or scrubbed. */
  readonly started: boolean
  /** The drawing has reached 1:00 and stopped there. */
  readonly ended: boolean
  readonly toggle: () => void
  readonly seek: (seconds: number) => void
  readonly cycleSpeed: () => void
  readonly onScrubDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  readonly onScrubMove: (event: ReactPointerEvent<HTMLDivElement>) => void
  readonly onScrubUp: () => void
  readonly onKeyDown: (event: ReactKeyboardEvent) => void
}

/** A path's length, or one where the browser cannot measure (jsdom). */
function lengthOf(path: SVGPathElement): number {
  return typeof path.getTotalLength === 'function' ? path.getTotalLength() : 1
}

/**
 * The player, scoped to one board in its panel: a requestAnimationFrame
 * loop that reads every `data-t` element once the fonts are in (paths by
 * their length, labels by their box) and, each frame, sets how much of
 * each is on the board, moves the chalk stick to the tip of the current
 * stroke, wipes scene 1 off with Smudge, turns the hand, fills the swept
 * sector, pulses the hub, and fills the chaptered scrub bar. It never
 * plays on its own: resting, the board stands finished, and Play, Replay
 * or a click on the board clears it with a quick pass of Smudge, then
 * draws from 0:00. Under reduced motion each element stands finished from
 * its start time, the erase is a cut, and there is no stick, sector or
 * pulse. Only the second, the chapter, playing, started, ended, the speed
 * and the arrangement are React state; the frames write the DOM directly,
 * inside the element the returned ref is given.
 */
export function useSixtyPlayer({ reduced, onEnded }: SixtyPlayerOptions): {
  readonly root: React.RefObject<HTMLElement | null>
  readonly player: SixtyPlayerApi
} {
  const id = useId()
  const root = useRef<HTMLElement>(null)
  const engine = useRef<Engine>({
    t: sixtyLength,
    playing: false,
    last: 0,
    speed: 0,
    narrow: false,
    started: false,
    dragging: false,
    wasPlaying: false,
    nodes: null,
    items: [],
    frame: 0,
    cued: false,
  })
  const latest = useRef({ reduced, onEnded })
  useEffect(() => {
    latest.current = { reduced, onEnded }
  })
  const [playing, setPlaying] = useState(false)
  const [second, setSecond] = useState(0)
  const [chapter, setChapter] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [narrow, setNarrow] = useState(false)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)

  const render = useCallback(() => {
    const e = engine.current
    const nodes = e.nodes
    if (!nodes) return
    const { reduced } = latest.current
    const t = e.t
    // Before 0:00 the finished board stands while Smudge clears it.
    const clearing = t < 0
    let tip: readonly [SVGGraphicsElement, number, number] | null = null
    for (const item of e.items) {
      const p = clearing
        ? 1
        : reduced
          ? t >= item.start
            ? 1
            : 0
          : clamp(Math.round(((t - item.start) / item.seconds) * 1e6) / 1e6)
      if (item.length != null) {
        ;(item.mask ?? item.el).style.strokeDashoffset = String(
          item.length * (1 - p),
        )
        if (p > 0 && p < 1 && 'getPointAtLength' in item.el) {
          const at = (item.el as SVGPathElement).getPointAtLength(
            item.length * p,
          )
          tip = [item.el, at.x, at.y]
        }
      } else if (item.rect && item.box) {
        item.rect.setAttribute(
          'width',
          String(Math.max(0, (item.box.width + 8) * p)),
        )
        if (p > 0 && p < 1)
          tip = [
            item.el,
            item.box.x + item.box.width * p,
            item.box.y + item.box.height * 0.75,
          ]
      }
      const drawn = p >= 1 ? 'done' : p <= 0 ? 'none' : 'part'
      if (drawn !== item.drawn) {
        item.drawn = drawn
        item.el.setAttribute('data-drawn', drawn)
      }
    }

    // The chalk stick, at the tip of what is being drawn.
    if (nodes.stick) {
      let placed = false
      if (
        tip &&
        e.playing &&
        !reduced &&
        typeof nodes.svg.getScreenCTM === 'function' &&
        typeof DOMPoint === 'function'
      ) {
        const outer = nodes.svg.getScreenCTM()
        const own = tip[0].getScreenCTM()
        if (outer && own) {
          const point = new DOMPoint(tip[1], tip[2]).matrixTransform(
            outer.inverse().multiply(own),
          )
          nodes.stick.setAttribute(
            'transform',
            `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`,
          )
          placed = true
        }
      }
      nodes.stick.style.opacity = placed ? '1' : '0'
    }

    // Smudge wipes scene 1 off, then the haze stays; before 0:00 he clears
    // the finished board. Under reduced motion both are cuts and he stays
    // in the tray.
    const erased = clearing
      ? 1
      : reduced
        ? t >= ERASE_START
          ? 1
          : 0
        : clamp((t - ERASE_START) / (ERASE_END - ERASE_START))
    const cleared = clearing ? clamp((t + CLEAR_SECONDS) / CLEAR_SECONDS) : 0
    if (nodes.erase)
      nodes.erase.path.style.strokeDashoffset = String(
        nodes.erase.length * (1 - erased),
      )
    if (nodes.haze)
      nodes.haze.style.strokeDashoffset = String(
        (nodes.erase?.length ?? 1) * (1 - erased),
      )
    if (nodes.clear)
      nodes.clear.path.style.strokeDashoffset = String(
        nodes.clear.length * (1 - cleared),
      )
    if (nodes.eraser) {
      const wipe = clearing ? nodes.clear : nodes.erase
      const along = clearing ? cleared : erased
      const shown = !reduced && wipe != null && along > 0 && along < 1
      if (shown && wipe && typeof wipe.path.getPointAtLength === 'function') {
        const point = wipe.path.getPointAtLength(wipe.length * along)
        nodes.eraser.setAttribute(
          'transform',
          `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)}) rotate(-6)`,
        )
      }
      nodes.eraser.style.opacity = shown ? '1' : '0'
    }

    // The clock hand: still until day one, then three years in thirty seconds.
    const dial = boards[e.narrow ? 'narrow' : 'wide'].dial
    const angle = clearing ? 360 : handAngle(t, reduced)
    if (nodes.hand) {
      nodes.hand.setAttribute(
        'transform',
        `rotate(${angle.toFixed(2)} ${dial.cx} ${dial.cy})`,
      )
      nodes.hand.style.opacity = clearing
        ? '1'
        : clamp((t - 22.9) / 0.5).toFixed(2)
    }
    const swept =
      reduced || clearing
        ? 0
        : t < HAND_START
          ? 0
          : t < HAND_END
            ? 1
            : 1 - clamp((t - HAND_END) / 1.5)
    if (nodes.wedge) {
      nodes.wedge.style.opacity = String(swept)
      if (swept > 0) nodes.wedge.setAttribute('d', sectorPath(dial, angle))
    }
    let pulse = 0
    if (!reduced && !clearing)
      for (const at of PULSES)
        pulse = Math.max(pulse, 1 - Math.abs(t - at) / 0.9)
    if (nodes.glow) nodes.glow.style.opacity = (pulse * 0.6).toFixed(3)

    // The scrub bar: each chapter's segment fills, the knob rides the
    // current one; resting, the bar is empty.
    const shown = e.started ? Math.max(0, t) : 0
    const index = chapterAt(shown)
    if (nodes.segments.length === sixtyChapters.length) {
      sixtyChapters.forEach((ch, i) => {
        const fill = nodes.segments[i]!.firstElementChild as HTMLElement | null
        if (fill)
          fill.style.width = `${clamp((shown - ch.start) / (ch.end - ch.start)) * 100}%`
      })
      const current = nodes.segments[index]!
      const ch = sixtyChapters[index]!
      const fraction = clamp((shown - ch.start) / (ch.end - ch.start))
      if (nodes.knob)
        nodes.knob.style.left = `${current.offsetLeft + fraction * current.offsetWidth}px`
    }
    setSecond(Math.floor(shown))
    setChapter(index)
    setStarted(e.started)
    setEnded(e.started && !e.playing && e.t >= sixtyLength)
  }, [])

  const play = useCallback(() => {
    const e = engine.current
    // From rest or the end, Smudge clears the board first (at once under
    // reduced motion), and the drawing starts from 0:00.
    if (!e.started || e.t >= sixtyLength) {
      e.t = latest.current.reduced ? 0 : -CLEAR_SECONDS
      e.cued = false
    }
    e.started = true
    e.playing = true
    e.last = performance.now()
    setPlaying(true)
    render()
    cancelAnimationFrame(e.frame)
    function step(now: number) {
      if (!e.playing) return
      const dt = Math.min(0.1, (now - e.last) / 1000)
      e.last = now
      // To the microsecond, so a frame that lands on a mark's start or end
      // is not a hair short of it.
      e.t = Math.round((e.t + dt * sixtySpeeds[e.speed]!) * 1e6) / 1e6
      if (e.t >= sixtyLength) {
        e.t = sixtyLength
        e.playing = false
        setPlaying(false)
        render()
        if (!e.cued) {
          e.cued = true
          latest.current.onEnded?.()
        }
        return
      }
      render()
      e.frame = requestAnimationFrame(step)
    }
    e.frame = requestAnimationFrame(step)
  }, [render])

  const pause = useCallback(() => {
    const e = engine.current
    e.playing = false
    cancelAnimationFrame(e.frame)
    setPlaying(false)
    render()
  }, [render])

  const toggle = useCallback(() => {
    if (engine.current.playing) pause()
    else play()
  }, [pause, play])

  const seek = useCallback(
    (seconds: number) => {
      const e = engine.current
      e.t = Math.max(0, Math.min(sixtyLength, seconds))
      e.started = true
      e.last = performance.now()
      render()
    },
    [render],
  )

  const cycleSpeed = useCallback(() => {
    const e = engine.current
    e.speed = (e.speed + 1) % sixtySpeeds.length
    setSpeed(e.speed)
  }, [])

  // The board is read once the fonts are in and it is on the screen, and
  // again when its arrangement changes; it stands at the time in hand
  // (finished, at rest). Unmounting stops the frames and drops what was built.
  useEffect(() => {
    const rootEl = root.current
    const svg = rootEl?.querySelector<SVGSVGElement>('svg.sixty-board')
    const defs = svg?.querySelector<SVGDefsElement>('defs.sixty-defs')
    if (!rootEl || !svg || !defs) return
    const e = engine.current
    let gone = false
    const fonts: Promise<unknown> = document.fonts?.ready ?? Promise.resolve()
    fonts.then(() => {
      if (gone) return
      const items: Item[] = []
      let n = 0
      svg.querySelectorAll<SVGGraphicsElement>('[data-t]').forEach((el) => {
        const [start = 0, seconds = 0] = (el.getAttribute('data-t') ?? '')
          .split(',')
          .map(Number)
        if (el.tagName.toLowerCase() === 'path') {
          const path = el as SVGPathElement
          const length = lengthOf(path)
          if (el.classList.contains('dash')) {
            const mask = document.createElementNS(ns, 'mask')
            const maskId = `${id}m${n++}`
            mask.setAttribute('id', maskId)
            mask.setAttribute('maskUnits', 'userSpaceOnUse')
            const stroke = document.createElementNS(ns, 'path')
            stroke.setAttribute('d', el.getAttribute('d') ?? '')
            stroke.setAttribute('fill', 'none')
            stroke.setAttribute('stroke', '#fff')
            stroke.setAttribute('stroke-width', '10')
            stroke.setAttribute('stroke-linecap', 'round')
            stroke.style.strokeDasharray = String(length)
            mask.appendChild(stroke)
            defs.appendChild(mask)
            el.setAttribute('mask', `url(#${maskId})`)
            items.push({
              el,
              start,
              seconds,
              length,
              mask: stroke,
              drawn: '',
            })
          } else {
            el.style.strokeDasharray = String(length)
            items.push({ el, start, seconds, length, drawn: '' })
          }
          return
        }
        const box =
          typeof el.getBBox === 'function'
            ? el.getBBox()
            : { x: 0, y: 0, width: 0, height: 0 }
        const clip = document.createElementNS(ns, 'clipPath')
        const clipId = `${id}c${n++}`
        clip.setAttribute('id', clipId)
        clip.setAttribute('clipPathUnits', 'userSpaceOnUse')
        const rect = document.createElementNS(ns, 'rect')
        rect.setAttribute('x', String(box.x - 4))
        rect.setAttribute('y', String(box.y - 6))
        rect.setAttribute('width', '0')
        rect.setAttribute('height', String(box.height + 12))
        clip.appendChild(rect)
        defs.appendChild(clip)
        el.setAttribute('clip-path', `url(#${clipId})`)
        items.push({
          el,
          start,
          seconds,
          rect,
          box: { x: box.x, y: box.y, width: box.width, height: box.height },
          drawn: '',
        })
      })
      const wipeOf = (selector: string): Wipe | null => {
        const path = svg.querySelector<SVGPathElement>(selector)
        if (!path) return null
        const length = lengthOf(path)
        path.style.strokeDasharray = String(length)
        return { path, length }
      }
      const erase = wipeOf('path.sixty-erase-stroke')
      const haze = svg.querySelector<SVGPathElement>('path.sixty-haze')
      if (haze && erase) haze.style.strokeDasharray = String(erase.length)
      e.items = items
      e.nodes = {
        svg,
        defs,
        hand: svg.querySelector('g.sixty-hand'),
        wedge: svg.querySelector('path.sixty-wedge'),
        glow: svg.querySelector('circle.sixty-glow'),
        stick: svg.querySelector('g.sixty-stick'),
        eraser: svg.querySelector('g.sixty-eraser'),
        erase,
        haze,
        clear: wipeOf('path.sixty-clear-stroke'),
        segments: Array.from(
          rootEl.querySelectorAll<HTMLElement>('.sixty-track .sixty-seg'),
        ),
        knob: rootEl.querySelector<HTMLElement>('.sixty-knob'),
      }
      render()
    })
    return () => {
      gone = true
      e.nodes = null
      e.items = []
      defs.replaceChildren()
    }
  }, [id, narrow, render])

  // Unmounting stops the frames.
  useEffect(() => {
    const e = engine.current
    return () => {
      e.playing = false
      cancelAnimationFrame(e.frame)
    }
  }, [])

  // Narrower than NARROW_BELOW pixels the board takes the narrow arrangement.
  useEffect(() => {
    const screen = root.current?.querySelector<HTMLElement>('.sixty-screen')
    if (!screen) return
    const e = engine.current
    const layout = () => {
      const width = screen.clientWidth
      // A width the browser cannot measure (jsdom) keeps the wide arrangement.
      const next = width > 0 && width < NARROW_BELOW
      if (next === e.narrow) return
      e.narrow = next
      setNarrow(next)
    }
    layout()
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(layout)
      observer.observe(screen)
      return () => observer.disconnect()
    }
    window.addEventListener('resize', layout)
    return () => window.removeEventListener('resize', layout)
  }, [])

  // A change of the motion preference redraws the board in the new way.
  useEffect(() => {
    render()
  }, [reduced, render])

  /** Drag anywhere on the bar to scrub; the gaps between parts snap to the next. */
  const timeAt = useCallback((x: number) => {
    const segments = engine.current.nodes?.segments ?? []
    if (segments.length !== sixtyChapters.length) return 0
    const first = segments[0]!.getBoundingClientRect()
    const last = segments[segments.length - 1]!.getBoundingClientRect()
    if (x <= first.left) return 0
    if (x >= last.right) return sixtyLength
    for (let i = 0; i < segments.length; i += 1) {
      const box = segments[i]!.getBoundingClientRect()
      const ch = sixtyChapters[i]!
      if (x < box.left) return ch.start
      if (x <= box.right)
        return ch.start + ((x - box.left) / box.width) * (ch.end - ch.start)
    }
    return sixtyLength
  }, [])

  const onScrubDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const e = engine.current
      e.dragging = true
      e.wasPlaying = e.playing
      e.playing = false
      cancelAnimationFrame(e.frame)
      setPlaying(false)
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // Pointer capture is a convenience; the drag still follows the pointer over the bar.
      }
      seek(timeAt(event.clientX))
      event.preventDefault()
    },
    [seek, timeAt],
  )
  const onScrubMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (engine.current.dragging) seek(timeAt(event.clientX))
    },
    [seek, timeAt],
  )
  const onScrubUp = useCallback(() => {
    const e = engine.current
    if (!e.dragging) return
    e.dragging = false
    if (e.wasPlaying && e.t < sixtyLength) play()
    else render()
  }, [play, render])

  /**
   * The player's keys, for the panel they live in: Space or K plays and
   * pauses, the arrows skip five seconds, Home and End go to either end,
   * Page Up and Page Down change part. They answer only while focus is in
   * the player, and a key the player takes never reaches the site's own
   * keys. A button or a link keeps Space and Enter.
   */
  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (event.defaultPrevented) return
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const key = event.key
      const target = event.target instanceof Element ? event.target : null
      if (
        (key === ' ' || key === 'Enter') &&
        target?.closest('button, a, [role="button"]')
      )
        return
      const e = engine.current
      const now = Math.max(0, e.t)
      const index = chapterAt(now)
      const current = sixtyChapters[index]!
      let act: (() => void) | null = null
      if (key === ' ' || key === 'k' || key === 'K') act = toggle
      else if (key === 'ArrowLeft') act = () => seek(now - skip)
      else if (key === 'ArrowRight') act = () => seek(now + skip)
      else if (key === 'Home') act = () => seek(0)
      else if (key === 'End') act = () => seek(sixtyLength)
      else if (key === 'PageDown')
        act = () =>
          seek(
            index < sixtyChapters.length - 1
              ? sixtyChapters[index + 1]!.start
              : sixtyLength,
          )
      else if (key === 'PageUp')
        act = () =>
          seek(
            now - current.start > 1.5
              ? current.start
              : sixtyChapters[Math.max(0, index - 1)]!.start,
          )
      if (!act) return
      event.preventDefault()
      event.stopPropagation()
      act()
    },
    [seek, toggle],
  )

  return {
    root,
    player: {
      id,
      playing,
      second,
      chapter,
      speed,
      narrow,
      started,
      ended,
      toggle,
      seek,
      cycleSpeed,
      onScrubDown,
      onScrubMove,
      onScrubUp,
      onKeyDown,
    },
  }
}
