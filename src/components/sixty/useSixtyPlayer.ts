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
  alongWipe,
  boardModel,
  dustAt,
  stickAt,
  type BoardModel,
  type Scheduled,
} from './sixty-model'
import {
  chapterAt,
  sixtyChapters,
  sixtyLength,
  sixtySpeeds,
} from './sixty-script'
import { between, ease, pathOf } from './sixty-strokes'

/** How far one key press skips. */
const skip = 5
/** The stick's resting lean, and how far it leans toward where it is going. */
const REST_ANGLE = -38
const LEAN = 20
/** How far ahead the stick looks to lean, in seconds, and the distance that leans it fully. */
const LOOK_AHEAD = 0.1
const LEAN_DISTANCE = 12
/** The bright tip: the newest few units of the stroke under the chalk. */
const FRESH = 6

/** A pen stroke in a mask, with its length and the dash length that hides it. */
interface Pen {
  readonly el: SVGPathElement
  readonly length: number
  readonly full: number
}

/** One mark on the board: its element, its schedule, its pens in piece order, its glyphs. */
interface Entry {
  readonly el: SVGElement
  readonly item: Scheduled
  readonly pens: readonly Pen[]
  readonly glyphs: readonly SVGElement[]
  readonly glyphLengths: readonly number[]
  drawn: 'none' | 'part' | 'done' | ''
}

/** The elements the frames write, found once inside the player's root. */
interface Nodes {
  readonly svg: SVGSVGElement
  readonly model: BoardModel
  readonly entries: readonly Entry[]
  readonly hand: SVGGElement | null
  readonly wedge: SVGPathElement | null
  readonly glow: SVGCircleElement | null
  readonly stick: SVGGElement | null
  readonly stickArm: SVGGElement | null
  readonly stickBody: SVGGElement | null
  readonly shadow: SVGEllipseElement | null
  readonly fresh: SVGPathElement | null
  readonly dust: readonly SVGCircleElement[]
  readonly eraser: SVGGElement | null
  readonly erase: SVGPathElement | null
  readonly haze: SVGPathElement | null
  readonly clear: SVGPathElement | null
  readonly segments: readonly HTMLElement[]
  readonly knob: HTMLElement | null
}

interface Engine {
  /** Seconds into the drawing; negative while Smudge clears the board before 0:00. */
  t: number
  playing: boolean
  /** Frames stopped while the tab is hidden or the panel is out of view; the time stands. */
  suspended: boolean
  last: number
  speed: number
  narrow: boolean
  /** Once the visitor has played or scrubbed; resting, the board stands finished. */
  started: boolean
  dragging: boolean
  wasPlaying: boolean
  nodes: Nodes | null
  frame: number
  /** Smudge is cued once per run, when the drawing reaches the end on its own. */
  cued: boolean
  /** How many dust specks were shown last frame, so only those are hidden. */
  dustShown: number
  stickShown: boolean
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

const dustSlots = Array.from({ length: 40 }, () => ({
  x: 0,
  y: 0,
  r: 0,
  opacity: 0,
}))

/** Sets a mark's pens and glyphs to all drawn or none, once. */
function settle(entry: Entry, drawn: 'none' | 'done') {
  for (const pen of entry.pens)
    pen.el.style.strokeDashoffset = drawn === 'done' ? '0' : String(pen.full)
  const p = drawn === 'done' ? '1' : '0'
  for (const glyph of entry.glyphs) glyph.setAttribute('data-p', p)
  entry.el.setAttribute('data-p', p)
}

/** Draws a mark part way: each pen along its piece's eased share of its time. */
function draw(entry: Entry, t: number) {
  const { item, pens, glyphs, glyphLengths } = entry
  const drawnOf: number[] = glyphLengths.map(() => 0)
  let total = 0
  let penIndex = 0
  for (const piece of item.pieces) {
    if (piece.kind !== 'stroke') continue
    const pen = pens[penIndex]
    penIndex += 1
    if (!pen) continue
    const p =
      t >= piece.t1
        ? 1
        : t <= piece.t0
          ? 0
          : ease((t - piece.t0) / (piece.t1 - piece.t0))
    const length = pen.length * p
    pen.el.style.strokeDashoffset = (pen.full - length).toFixed(3)
    total += length
    if (drawnOf.length)
      drawnOf[piece.glyph] = (drawnOf[piece.glyph] ?? 0) + length
  }
  glyphs.forEach((glyph, index) => {
    const length = glyphLengths[index] ?? 0
    glyph.setAttribute(
      'data-p',
      (length > 0 ? Math.min(1, (drawnOf[index] ?? 0) / length) : 1).toFixed(3),
    )
  })
  entry.el.setAttribute(
    'data-p',
    (item.length > 0 ? Math.min(1, total / item.length) : 1).toFixed(3),
  )
}

/**
 * The player, scoped to one board in its panel: a requestAnimationFrame
 * loop that reads the board's model once (every stroke measured, every
 * mark scheduled, the stick's every move) and, each frame, sets how far
 * each pen has drawn, puts the chalk stick where the model says (drawing,
 * hopping, travelling, resting, or off the board), sheds its dust, wipes
 * scene 1 off with Smudge, turns the hand, fills the swept sector, pulses
 * the hub, and fills the chaptered scrub bar. It never plays on its own:
 * resting, the board stands finished, and Play, Replay or a click on the
 * board clears it with a quick pass of Smudge, then draws from 0:00. The
 * frames stop while the tab is hidden or the panel is out of view, and the
 * time stands with them. Under reduced motion each mark stands finished
 * from its start time, the erase is a cut, and there is no stick, dust,
 * sector or pulse. Only the second, the chapter, playing, started, ended,
 * the speed and the arrangement are React state; the frames write the DOM
 * directly, inside the element the returned ref is given.
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
    suspended: false,
    last: 0,
    speed: 0,
    narrow: false,
    started: false,
    dragging: false,
    wasPlaying: false,
    nodes: null,
    frame: 0,
    cued: false,
    dustShown: 0,
    stickShown: false,
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
    const { model } = nodes
    const t = e.t
    // Before 0:00 the finished board stands while Smudge clears it.
    const clearing = t < 0
    nodes.svg.setAttribute('data-time', t.toFixed(3))

    // Every mark: none, part way, or done.
    for (const entry of nodes.entries) {
      const { item } = entry
      const drawn: Entry['drawn'] =
        clearing || t >= item.end
          ? 'done'
          : reduced
            ? t >= item.start
              ? 'done'
              : 'none'
            : t < item.start
              ? 'none'
              : 'part'
      if (drawn === 'part') draw(entry, t)
      else if (drawn !== entry.drawn) settle(entry, drawn)
      if (drawn !== entry.drawn) {
        entry.drawn = drawn
        entry.el.setAttribute('data-drawn', drawn)
      }
    }

    // The chalk stick: a hand's, on the board from 0:00 to 1:00 (off it
    // while Smudge wipes), leaning the way it goes, lower while it draws.
    const stick = stickAt(model, t)
    const showStick =
      !reduced && e.started && !clearing && t < sixtyLength && !stick.away
    if (nodes.stick) {
      nodes.stick.setAttribute('data-state', stick.move.kind)
      if (showStick) {
        const ahead = stickAt(model, t + LOOK_AHEAD)
        const lean = Math.max(
          -1,
          Math.min(1, (ahead.x - stick.x) / LEAN_DISTANCE),
        )
        nodes.stick.setAttribute(
          'transform',
          `translate(${stick.x.toFixed(2)} ${stick.y.toFixed(2)})`,
        )
        nodes.stick.setAttribute('data-x', stick.x.toFixed(2))
        nodes.stick.setAttribute('data-y', stick.y.toFixed(2))
        nodes.stickArm?.setAttribute(
          'transform',
          `rotate(${(REST_ANGLE + LEAN * lean).toFixed(2)})`,
        )
        nodes.stickBody?.setAttribute(
          'transform',
          `translate(0 ${(-7 * stick.lift).toFixed(2)})`,
        )
        if (nodes.shadow) {
          nodes.shadow.setAttribute('rx', (2.6 + 3.4 * stick.lift).toFixed(2))
          nodes.shadow.setAttribute('ry', (1.1 + 1.4 * stick.lift).toFixed(2))
          nodes.shadow.style.opacity = (0.34 - 0.22 * stick.lift).toFixed(3)
        }
      }
      if (showStick !== e.stickShown) {
        e.stickShown = showStick
        nodes.stick.style.opacity = showStick ? '1' : '0'
      }
    }
    // The newest few units of the stroke under the chalk, a touch brighter.
    if (nodes.fresh) {
      if (showStick && stick.drawing && stick.move.stroke) {
        nodes.fresh.setAttribute(
          'd',
          pathOf(between(stick.move.stroke, stick.drawn - FRESH, stick.drawn)),
        )
        nodes.fresh.style.strokeWidth = (stick.move.width ?? 2).toFixed(2)
        nodes.fresh.style.opacity = '1'
      } else nodes.fresh.style.opacity = '0'
    }
    // Dust, only while it draws.
    if (nodes.dust.length) {
      const count = showStick ? dustAt(model, t, dustSlots) : 0
      for (let index = 0; index < count; index += 1) {
        const slot = dustSlots[index]!
        const speck = nodes.dust[index]
        if (!speck) break
        speck.setAttribute('cx', slot.x.toFixed(1))
        speck.setAttribute('cy', slot.y.toFixed(1))
        speck.setAttribute('r', slot.r.toFixed(2))
        speck.style.opacity = slot.opacity.toFixed(2)
      }
      for (let index = count; index < e.dustShown; index += 1)
        nodes.dust[index]!.style.opacity = '0'
      e.dustShown = count
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
      nodes.erase.style.strokeDashoffset = String(
        model.erase.length * (1 - erased),
      )
    if (nodes.haze)
      nodes.haze.style.strokeDashoffset = String(
        model.erase.length * (1 - erased),
      )
    if (nodes.clear)
      nodes.clear.style.strokeDashoffset = String(
        model.clear.length * (1 - cleared),
      )
    if (nodes.eraser) {
      const wipe = clearing ? model.clear : model.erase
      const along = clearing ? cleared : erased
      const shown = !reduced && along > 0 && along < 1
      if (shown) {
        const [x, y] = alongWipe(wipe, wipe.length * along)
        nodes.eraser.setAttribute(
          'transform',
          `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(-6)`,
        )
      }
      nodes.eraser.style.opacity = shown ? '1' : '0'
    }

    // The clock hand: still until day one, then three years in thirty seconds.
    const dial = boards[model.arrangement].dial
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

  /** The frames, while playing and not suspended. */
  const loop = useCallback(() => {
    const e = engine.current
    cancelAnimationFrame(e.frame)
    function step(now: number) {
      if (!e.playing || e.suspended) return
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
    if (!e.suspended) loop()
  }, [loop, render])

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

  // The board's elements are found once it is on the screen, and again
  // when its arrangement changes; it stands at the time in hand (finished,
  // at rest). Unmounting stops the frames and drops what was found.
  useEffect(() => {
    const rootEl = root.current
    const svg = rootEl?.querySelector<SVGSVGElement>('svg.sixty-board')
    if (!rootEl || !svg) return
    const e = engine.current
    const model = boardModel(e.narrow ? 'narrow' : 'wide')
    const elements = Array.from(
      svg.querySelectorAll<SVGElement>('g.sixty-word, g.sixty-mark'),
    )
    const entries: Entry[] = model.marks.map((item, index) => {
      const el = elements[index]!
      const pens = Array.from(
        el.querySelectorAll<SVGPathElement>('path.sixty-pen'),
      ).map((pen) => {
        const length = Number(pen.getAttribute('data-len')) || 0
        return { el: pen, length, full: length + 2 }
      })
      const glyphs = Array.from(el.querySelectorAll<SVGElement>('.sixty-glyph'))
      return {
        el,
        item,
        pens,
        glyphs,
        glyphLengths:
          item.mark.kind === 'word'
            ? item.mark.glyphs.map((glyph) => glyph.length)
            : [],
        drawn: '',
      }
    })
    e.nodes = {
      svg,
      model,
      entries,
      hand: svg.querySelector('g.sixty-hand'),
      wedge: svg.querySelector('path.sixty-wedge'),
      glow: svg.querySelector('circle.sixty-glow'),
      stick: svg.querySelector('g.sixty-stick'),
      stickArm: svg.querySelector('g.sixty-stick-arm'),
      stickBody: svg.querySelector('g.sixty-stick-body'),
      shadow: svg.querySelector('ellipse.sixty-stick-shadow'),
      fresh: svg.querySelector('path.sixty-fresh'),
      dust: Array.from(
        svg.querySelectorAll<SVGCircleElement>('g.sixty-dust circle'),
      ),
      eraser: svg.querySelector('g.sixty-eraser'),
      erase: svg.querySelector('path.sixty-erase-stroke'),
      haze: svg.querySelector('path.sixty-haze'),
      clear: svg.querySelector('path.sixty-clear-stroke'),
      segments: Array.from(
        rootEl.querySelectorAll<HTMLElement>('.sixty-track .sixty-seg'),
      ),
      knob: rootEl.querySelector<HTMLElement>('.sixty-knob'),
    }
    e.dustShown = 0
    e.stickShown = false
    render()
    return () => {
      e.nodes = null
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

  // The frames stop while the tab is hidden or the panel is out of view,
  // and the time stands; they resume where they stopped.
  useEffect(() => {
    const rootEl = root.current
    if (!rootEl) return
    const e = engine.current
    let hidden = document.visibilityState === 'hidden'
    let offscreen = false
    const settle = () => {
      const suspended = hidden || offscreen
      if (suspended === e.suspended) return
      e.suspended = suspended
      if (suspended) cancelAnimationFrame(e.frame)
      else if (e.playing) {
        e.last = performance.now()
        loop()
      }
    }
    const onVisibility = () => {
      hidden = document.visibilityState === 'hidden'
      settle()
    }
    document.addEventListener('visibilitychange', onVisibility)
    let observer: IntersectionObserver | null = null
    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1]
        if (!entry) return
        offscreen = !entry.isIntersecting
        settle()
      })
      observer.observe(rootEl)
    }
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      observer?.disconnect()
    }
  }, [loop])

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
