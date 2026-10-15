import { useEffect, useRef, useState } from 'react'
import {
  putDownDoodle,
  registerDoodleTray,
  roomToDoodle,
  setDoodleMarks,
  toggleDoodle,
  useDoodleUp,
} from './doodle-state'
import { strokePath, type Point } from './doodle-path'
import { subscribeSmudgeCue } from './tray-state'

/**
 * The doodle chalk in the tray (mockups/2026-10-15/Doodle.html): a fat white
 * stick with a kraft-paper sleeve, just left of Smudge. A button: pressed
 * while the chalk is up, when its slot shows a dashed outline instead.
 */
export function DoodleStick() {
  const up = useDoodleUp()
  return (
    <button
      ref={registerDoodleTray}
      type="button"
      className="tray-doodle"
      aria-pressed={up}
      onClick={toggleDoodle}
    >
      <span className="sr-only">Doodle chalk</span>
      <svg
        className="tray-doodle-stick"
        viewBox="0 0 62 22"
        aria-hidden="true"
        focusable="false"
      >
        {up ? (
          <rect
            className="tray-doodle-slot"
            x="2"
            y="4"
            width="56"
            height="14"
            rx="7"
          />
        ) : (
          <>
            <ellipse
              className="tray-doodle-shadow"
              cx="30"
              cy="20"
              rx="26"
              ry="2"
            />
            <rect
              className="tray-doodle-chalk"
              x="2"
              y="4"
              width="56"
              height="14"
              rx="7"
            />
            <rect
              className="tray-doodle-sleeve"
              x="24"
              y="4"
              width="34"
              height="14"
              rx="4"
            />
            <path className="tray-doodle-lines" d="M30 6v10M36 6v10" />
          </>
        )}
      </svg>
    </button>
  )
}

interface Stroke {
  readonly id: number
  readonly d: string
}
interface Marks {
  /** The page the marks were made on; a new page takes them away. */
  readonly page: string
  readonly strokes: readonly Stroke[]
  /** The last marks, on their way out. */
  readonly dust: readonly Stroke[]
}

/** Where the wipe would be a cut anyway, the marks go without dust. */
const cut = '(prefers-reduced-motion: reduce), (forced-colors: active)'
const cutNow = () => window.matchMedia?.(cut).matches ?? false
/** The dust is gone after the Erase's own 400 ms. */
const dustLength = 400
/** Points closer than this to the last one add nothing to the line. */
const step = 2

/**
 * The drawing layer over the content while the chalk is up: an svg the size
 * of the content, anchored to it, so the marks scroll with the text. One
 * pointer draws; two fingers scroll; the wheel still scrolls; links under it
 * are out of reach. The marks live only here: never stored, never sent. A
 * sweep (Smudge clicked, or the Erase between controls), a page change and a
 * resize that changes the content's width take them away; the first two as
 * dust, unless motion is reduced.
 */
export function DoodleLayer({ page }: { readonly page: string }) {
  const layer = useRef<SVGSVGElement>(null)
  const live = useRef<SVGPathElement>(null)
  /** Every pointer on the layer, where it is on the screen. */
  const pointers = useRef(new Map<number, Point>())
  const drawing = useRef<{ id: number; points: Point[] } | null>(null)
  const width = useRef<number | null>(null)
  const [marks, setMarks] = useState<Marks>({ page, strokes: [], dust: [] })
  if (marks.page !== page)
    setMarks({ page, strokes: [], dust: cutNow() ? [] : marks.strokes })

  function local(event: { clientX: number; clientY: number }): Point {
    const box = layer.current?.getBoundingClientRect()
    return {
      x: event.clientX - (box?.left ?? 0),
      y: event.clientY - (box?.top ?? 0),
    }
  }
  function scroller(): { scrollBy: (x: number, y: number) => void } | null {
    const main = layer.current?.parentElement
    if (!main) return null
    const scrolls =
      main.scrollHeight > main.clientHeight &&
      /auto|scroll/.test(getComputedStyle(main).overflowY)
    const target = scrolls ? main : window
    return typeof target.scrollBy === 'function' ? target : null
  }
  /** The layer is the content's height, measured without the layer itself. */
  function fit() {
    const svg = layer.current
    const main = svg?.parentElement
    if (!svg || !main) return
    svg.style.height = '0px'
    svg.style.height = `${main.scrollHeight}px`
  }
  function wipe(how: 'dust' | 'cut') {
    drawing.current = null
    live.current?.removeAttribute('d')
    setMarks((before) => ({
      page: before.page,
      strokes: [],
      dust: how === 'dust' ? before.strokes : [],
    }))
  }

  // The layer fits the content: on each page, and whenever the content
  // under it grows or shrinks (a panel opening, a chunk arriving).
  useEffect(() => {
    fit()
    const svg = layer.current
    const main = svg?.parentElement
    if (!main || typeof ResizeObserver === 'undefined') return
    const sizes = new ResizeObserver(() => fit())
    const watch = () => {
      sizes.disconnect()
      for (const child of main.children) if (child !== svg) sizes.observe(child)
    }
    watch()
    const children = new MutationObserver(watch)
    children.observe(main, { childList: true })
    return () => {
      sizes.disconnect()
      children.disconnect()
    }
  }, [page])
  // A resize that changes the content's width clears the marks; a screen
  // that loses the room puts the chalk down.
  useEffect(() => {
    width.current = layer.current?.parentElement?.clientWidth ?? 0
    const resized = () => {
      if (!roomToDoodle()) {
        putDownDoodle()
        return
      }
      const now = layer.current?.parentElement?.clientWidth ?? 0
      if (width.current !== now) wipe('cut')
      width.current = now
      fit()
    }
    window.addEventListener('resize', resized)
    return () => window.removeEventListener('resize', resized)
  }, [])
  // Smudge's sweep: his click, or the Erase between controls.
  useEffect(
    () =>
      subscribeSmudgeCue((cue) => {
        if (cue.kind !== 'sweep') return
        wipe(cutNow() ? 'cut' : 'dust')
        fit()
      }),
    [],
  )
  useEffect(() => {
    if (!marks.dust.length) return
    const timer = window.setTimeout(
      () => setMarks((before) => ({ ...before, dust: [] })),
      dustLength,
    )
    return () => window.clearTimeout(timer)
  }, [marks.dust])
  useEffect(() => {
    setDoodleMarks(marks.strokes.length)
  }, [marks.strokes])
  useEffect(() => () => setDoodleMarks(0), [])

  return (
    <svg
      ref={layer}
      className="doodle-layer"
      aria-hidden="true"
      focusable="false"
      onPointerDown={(event) => {
        // Only the main button draws; a right click is the browser's.
        if (event.pointerType === 'mouse' && event.button !== 0) return
        pointers.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        })
        if (pointers.current.size > 1) {
          // A second finger scrolls: the line in progress is not a mark.
          drawing.current = null
          live.current?.removeAttribute('d')
          return
        }
        const point = local(event)
        drawing.current = { id: event.pointerId, points: [point] }
        live.current?.setAttribute('d', strokePath([point]))
        const target = event.currentTarget
        if (typeof target.setPointerCapture === 'function')
          target.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        const touching = pointers.current.get(event.pointerId)
        if (!touching) return
        pointers.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        })
        if (pointers.current.size > 1) {
          // Two fingers: the content scrolls by their movement on the screen,
          // as it would; each finger's move counts for its share.
          scroller()?.scrollBy(
            0,
            (touching.y - event.clientY) / pointers.current.size,
          )
          return
        }
        const point = local(event)
        const stroke = drawing.current
        if (!stroke || stroke.id !== event.pointerId) return
        const last = stroke.points[stroke.points.length - 1]!
        if (Math.hypot(point.x - last.x, point.y - last.y) < step) return
        stroke.points.push(point)
        live.current?.setAttribute('d', strokePath(stroke.points))
      }}
      onPointerUp={(event) => {
        pointers.current.delete(event.pointerId)
        const stroke = drawing.current
        if (!stroke || stroke.id !== event.pointerId) return
        drawing.current = null
        live.current?.removeAttribute('d')
        const d = strokePath(stroke.points)
        setMarks((before) => ({
          ...before,
          strokes: [
            ...before.strokes,
            { id: Date.now() + before.strokes.length, d },
          ],
        }))
      }}
      onPointerCancel={(event) => {
        pointers.current.delete(event.pointerId)
        if (drawing.current?.id === event.pointerId) {
          drawing.current = null
          live.current?.removeAttribute('d')
        }
      }}
    >
      {marks.dust.length > 0 && (
        <g className="doodle-marks doodle-dust chalk">
          {marks.dust.map((stroke) => (
            <path key={stroke.id} d={stroke.d} />
          ))}
        </g>
      )}
      <g className="doodle-marks chalk">
        {marks.strokes.map((stroke) => (
          <path key={stroke.id} d={stroke.d} />
        ))}
      </g>
      {/* The line being drawn, outside the filter until it is a mark. */}
      <path ref={live} className="doodle-marks doodle-live" />
    </svg>
  )
}
