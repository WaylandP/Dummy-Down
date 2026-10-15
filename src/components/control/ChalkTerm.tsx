import {
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type { GlossaryTerm } from '../../types/content'
import type { TextRun } from './term-matching'

type Opened = 'hover' | 'pinned'

const hoverDelay = 120
const leaveDelay = 240
/** Space kept between the popover and the edge of the screen. */
const edge = 12
const gap = 8

function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Under the word when it fits, above it when the screen ends, never off the
 * screen. False when the word itself has scrolled off the screen.
 */
function place(word: HTMLElement, popover: HTMLElement): boolean {
  const at = word.getBoundingClientRect()
  const box = popover.getBoundingClientRect()
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight
  if (at.bottom < 0 || (height > 0 && at.top > height)) return false
  const left = Math.max(edge, Math.min(at.left, width - box.width - edge))
  const below = at.bottom + gap
  const above = at.top - gap - box.height
  const side =
    below + box.height + edge <= height || above < edge ? 'below' : 'above'
  const top = Math.max(
    edge,
    Math.min(side === 'below' ? below : above, height - box.height - edge),
  )
  popover.style.top = `${Math.round(top)}px`
  popover.style.left = `${Math.round(left)}px`
  popover.dataset.side = side
  return true
}

interface ChalkTermProps {
  readonly term: GlossaryTerm
  readonly children: string
}

/**
 * A word of the explanation that carries its definition and source: shown on
 * hover without taking focus, pinned by a tap, Enter or Space with focus
 * inside, closed by Escape (focus comes back), by a press elsewhere or by
 * leaving it. The word is a span so that a phrase wraps like the text around it.
 */
export function ChalkTerm({ term, children }: ChalkTermProps) {
  const id = useId()
  const [open, setOpen] = useState<Opened | null>(null)
  const trigger = useRef<HTMLSpanElement>(null)
  const popover = useRef<HTMLSpanElement>(null)
  const timer = useRef(0)

  function cancel() {
    window.clearTimeout(timer.current)
  }
  // Focus never falls to the page: when it was inside, it goes back to the word.
  function dismiss() {
    if (popover.current?.contains(document.activeElement))
      trigger.current?.focus({ preventScroll: true })
    setOpen(null)
  }
  function later(next: Opened | null, delay: number) {
    cancel()
    timer.current = window.setTimeout(
      () => (next ? setOpen(next) : dismiss()),
      delay,
    )
  }
  function toggle() {
    cancel()
    if (open === 'pinned') dismiss()
    else setOpen('pinned')
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  useLayoutEffect(() => {
    const word = trigger.current
    const box = popover.current
    if (!open || !word || !box) return
    place(word, box)
    if (open === 'pinned') box.focus({ preventScroll: true })
    const follow = () => {
      if (place(word, box)) return
      // The word scrolled away; the popover goes with it.
      if (box.contains(document.activeElement))
        word.focus({ preventScroll: true })
      setOpen(null)
    }
    window.addEventListener('scroll', follow, true)
    window.addEventListener('resize', follow)
    return () => {
      window.removeEventListener('scroll', follow, true)
      window.removeEventListener('resize', follow)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const within = (target: EventTarget | null) =>
      target instanceof Node &&
      Boolean(
        trigger.current?.contains(target) || popover.current?.contains(target),
      )
    const onPress = (event: PointerEvent) => {
      if (!within(event.target)) setOpen(null)
      else if (
        open === 'hover' &&
        event.target instanceof Node &&
        popover.current?.contains(event.target)
      )
        setOpen('pinned')
    }
    const onFocus = (event: FocusEvent) => {
      if (!within(event.target)) setOpen(null)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      if (
        open === 'pinned' ||
        popover.current?.contains(document.activeElement)
      )
        trigger.current?.focus({ preventScroll: true })
      setOpen(null)
    }
    document.addEventListener('pointerdown', onPress)
    document.addEventListener('focusin', onFocus)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPress)
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <span className="term-chalk-wrap">
      <span
        ref={trigger}
        role="button"
        tabIndex={0}
        className="term-chalk"
        aria-expanded={open !== null}
        aria-haspopup="dialog"
        aria-controls={open ? `${id}-popover` : undefined}
        onMouseEnter={() => {
          cancel()
          if (!open) later('hover', hoverDelay)
        }}
        onMouseLeave={() => {
          if (open === 'hover') later(null, leaveDelay)
          else cancel()
        }}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          toggle()
        }}
      >
        {children}
      </span>
      {open && (
        <span
          ref={popover}
          id={`${id}-popover`}
          role="dialog"
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-definition`}
          tabIndex={-1}
          className="chalk-popover"
          onMouseEnter={cancel}
          onMouseLeave={() => {
            if (open === 'hover') later(null, leaveDelay)
          }}
        >
          <span id={`${id}-title`} className="chalk-popover-title hand">
            {term.title}
          </span>
          <span id={`${id}-definition`} className="chalk-popover-definition">
            {term.definition}
          </span>
          <span className="chalk-popover-source">
            {term.sources.length > 1 ? 'Sources: ' : 'Source: '}
            {term.sources.map((source, index) => (
              <Fragment key={source.id}>
                {index > 0 && '; '}
                {isHttps(source.url) ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {source.title}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  source.title
                )}
              </Fragment>
            ))}
            .
          </span>
        </span>
      )}
    </span>
  )
}

interface ChalkTextProps {
  readonly runs: readonly TextRun[]
}

/** One block of explanation text, verbatim, with the lesson's words carrying their definitions. */
export function ChalkText({ runs }: ChalkTextProps) {
  return (
    <>
      {runs.map((run, index) =>
        run.term ? (
          <ChalkTerm key={index} term={run.term}>
            {run.text}
          </ChalkTerm>
        ) : (
          <Fragment key={index}>{run.text}</Fragment>
        ),
      )}
    </>
  )
}
