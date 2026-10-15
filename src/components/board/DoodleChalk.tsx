import { useEffect, useRef, useState } from 'react'
import {
  addMark,
  eraseMarks,
  putDownDoodle,
  registerDoodleTray,
  roomToDoodle,
  setDoodleRoom,
  toggleDoodle,
  useDoodle,
  useDoodleUp,
  type Mark,
} from './doodle-state'
import { strokePath, type Point } from './doodle-path'
import { eraserReach, inkScale, strokeTouches } from './ink'
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

/** Where the wipe would be a cut anyway, the marks go without dust. */
const cut = '(prefers-reduced-motion: reduce), (forced-colors: active)'
const cutNow = () => window.matchMedia?.(cut).matches ?? false
/** The dust is gone after the sweep's 400 ms. */
const dustLength = 400
/** Points closer than this to the last one add nothing to the line. */
const step = 2

/**
 * The layer over the content whenever the page has marks or a hand holds
 * the chalk or Smudge: an svg the size of the content, anchored to it, so
 * the marks scroll with the text. With the chalk, one pointer draws and two
 * fingers scroll; with Smudge, rubbing takes each stroke it touches away as
 * dust; with neither in hand the layer only shows the marks and the page
 * underneath keeps its links. The marks live in memory, per page, and in the
 * page's own link: never stored, never sent.
 */
export function DoodleLayer() {
  const state = useDoodle()
  const { up, eraser, page, marks, width, room, full } = state
  const scale = marks.length ? inkScale(width, room) : 1
  const layer = useRef<SVGSVGElement>(null)
  const live = useRef<SVGPathElement>(null)
  /** Every pointer on the layer, where it is on the screen. */
  const pointers = useRef(new Map<number, Point>())
  const drawing = useRef<{ id: number; points: Point[] } | null>(null)
  const rubbing = useRef<number | null>(null)
  const [dust, setDust] = useState<readonly Mark[]>([])
  // The marks last drawn: any of this page's that are gone become dust.
  const [seen, setSeen] = useState({ page, marks })
  if (seen.marks !== marks || seen.page !== page) {
    setSeen({ page, marks })
    if (seen.page === page && scale !== null && !cutNow()) {
      const kept = new Set(marks.map((item) => item.id))
      const gone = seen.marks.filter((item) => !kept.has(item.id))
      if (gone.length) setDust((before) => [...before, ...gone])
    }
  }

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
    setDoodleRoom(main.clientWidth)
  }
  function rub(point: Point) {
    if (scale === null) return
    const at = { x: point.x / scale, y: point.y / scale }
    const touched = marks.filter((item) =>
      strokeTouches(item.points, at, eraserReach / scale),
    )
    if (touched.length) eraseMarks(touched.map((item) => item.id))
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
  // A resize re-measures the content: the marks scale with a small change
  // and wait out a large one. A screen that loses the room puts the chalk
  // down.
  useEffect(() => {
    const resized = () => {
      if (!roomToDoodle()) putDownDoodle()
      fit()
    }
    window.addEventListener('resize', resized)
    return () => window.removeEventListener('resize', resized)
  }, [])
  // Smudge's sweep from the tray (Wipe all): the layer only refits.
  useEffect(
    () =>
      subscribeSmudgeCue((cue) => {
        if (cue.kind === 'sweep') fit()
      }),
    [],
  )
  useEffect(() => {
    if (!dust.length) return
    const timer = window.setTimeout(() => setDust([]), dustLength)
    return () => window.clearTimeout(timer)
  }, [dust])

  const mode = up ? 'chalk' : eraser ? 'eraser' : undefined
  const transform =
    scale !== null && scale !== 1 ? `scale(${scale})` : undefined
  return (
    <svg
      ref={layer}
      className="doodle-layer"
      data-mode={mode}
      aria-hidden="true"
      focusable="false"
      onPointerDown={(event) => {
        if (!mode) return
        // Only the main button draws or rubs; a right click is the browser's.
        if (event.pointerType === 'mouse' && event.button !== 0) return
        pointers.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        })
        if (pointers.current.size > 1) {
          // A second finger scrolls: the line in progress is not a mark.
          drawing.current = null
          rubbing.current = null
          live.current?.removeAttribute('d')
          return
        }
        const point = local(event)
        const target = event.currentTarget
        if (typeof target.setPointerCapture === 'function')
          target.setPointerCapture(event.pointerId)
        if (mode === 'eraser') {
          rubbing.current = event.pointerId
          rub(point)
          return
        }
        // The board is full: no stroke starts until one is erased.
        if (full) return
        drawing.current = { id: event.pointerId, points: [point] }
        live.current?.setAttribute('d', strokePath([point]))
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
        if (rubbing.current === event.pointerId) {
          rub(point)
          return
        }
        const stroke = drawing.current
        if (!stroke || stroke.id !== event.pointerId) return
        const last = stroke.points[stroke.points.length - 1]!
        if (Math.hypot(point.x - last.x, point.y - last.y) < step) return
        stroke.points.push(point)
        live.current?.setAttribute('d', strokePath(stroke.points))
      }}
      onPointerUp={(event) => {
        pointers.current.delete(event.pointerId)
        if (rubbing.current === event.pointerId) rubbing.current = null
        const stroke = drawing.current
        if (!stroke || stroke.id !== event.pointerId) return
        drawing.current = null
        live.current?.removeAttribute('d')
        // The stroke joins the page in the page's own pixels.
        const factor = scale ?? 1
        addMark(
          stroke.points.map((item) => ({
            x: item.x / factor,
            y: item.y / factor,
          })),
        )
      }}
      onPointerCancel={(event) => {
        pointers.current.delete(event.pointerId)
        if (rubbing.current === event.pointerId) rubbing.current = null
        if (drawing.current?.id === event.pointerId) {
          drawing.current = null
          live.current?.removeAttribute('d')
        }
      }}
    >
      {dust.length > 0 && (
        <g className="doodle-marks doodle-dust chalk" transform={transform}>
          {dust.map((item) => (
            <path key={item.id} d={strokePath(item.points)} />
          ))}
        </g>
      )}
      {scale !== null && (
        <g className="doodle-marks chalk" transform={transform}>
          {marks.map((item) => (
            <path key={item.id} d={strokePath(item.points)} />
          ))}
        </g>
      )}
      {/* The line being drawn, outside the filter until it is a mark. */}
      <path ref={live} className="doodle-marks doodle-live" />
    </svg>
  )
}
