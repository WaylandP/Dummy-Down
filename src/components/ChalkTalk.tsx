import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { glossaryTerms } from '../data/content'
import {
  chalkTalkScenes,
  chalkTalkTitle,
  sceneSeconds,
  type ChalkTalkPart,
  type ChalkTalkScene,
} from '../data/chalk-talk'
import { cueLengths, cueSmudge } from './board/tray-state'
import { ChalkTerm } from './control/ChalkTerm'
import './chalk-talk.css'

const motionQuery = '(prefers-reduced-motion: reduce)'
const sceneMs = sceneSeconds * 1000
const total = chalkTalkScenes.length * sceneMs
/** Each scene draws its parts in the first part of its time, then the caption reads. */
const drawShare = 0.6
/**
 * A frame later than this is a stall (a hidden tab, a busy page): the talk
 * moves on by this much, never by the whole gap.
 */
const longestFrame = 250

function timeLabel(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

/** The scene a part belongs to, and its place among that scene's parts. */
const partPlace = new Map<
  ChalkTalkPart,
  { scene: number; at: number; of: number }
>()
chalkTalkScenes.forEach((scene, index) =>
  scene.parts.forEach((part, at) =>
    partPlace.set(part, { scene: index, at, of: scene.parts.length }),
  ),
)

/** How much of a part is on the board at this moment, 0 to 1. */
function drawn(
  part: ChalkTalkPart,
  elapsed: number,
  finished: boolean,
): number {
  const place = partPlace.get(part)
  if (!place || finished) return 1
  const scene = Math.floor(elapsed / sceneMs)
  if (place.scene < scene) return 1
  if (place.scene > scene) return 0
  const progress = (elapsed - scene * sceneMs) / sceneMs
  const start = (place.at / place.of) * drawShare
  const end = ((place.at + 1) / place.of) * drawShare
  return Math.max(0, Math.min(1, (progress - start) / (end - start)))
}

/** A chalk line that draws itself along its length. */
function Line({
  d,
  at,
  className,
}: {
  readonly d: string
  readonly at: number
  readonly className?: string
}) {
  return (
    <path
      d={d}
      className={className}
      pathLength={1}
      strokeDasharray="1"
      strokeDashoffset={1 - at}
      style={at === 0 ? { visibility: 'hidden' } : undefined}
    />
  )
}

/** Hand lettering, or a dashed line, that appears left to right. */
function Written({
  at,
  children,
}: {
  readonly at: number
  readonly children: ReactNode
}) {
  return (
    <g
      style={
        at === 0
          ? { visibility: 'hidden' }
          : at < 1
            ? { clipPath: `inset(0 ${((1 - at) * 100).toFixed(1)}% 0 0)` }
            : undefined
      }
    >
      {children}
    </g>
  )
}

/** The one drawing, from the mockup: each scene adds its parts and earlier parts stay. */
function Drawing({
  elapsed,
  finished,
  preview,
}: {
  readonly elapsed: number
  readonly finished: boolean
  /** Not yet played: the finished drawing, faintly. */
  readonly preview: boolean
}) {
  const at = (part: ChalkTalkPart) => drawn(part, elapsed, finished || preview)
  return (
    <svg
      className={`chalk-talk-drawing chalk${preview ? ' is-preview' : ''}`}
      viewBox="0 0 392 250"
      aria-hidden="true"
      focusable="false"
    >
      <g className="chalk-talk-boxes">
        <Line
          d="M8 10h76a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V18a8 8 0 0 1 8-8z"
          at={at('dod')}
        />
        <Written at={at('dod')}>
          <text x="46" y="36" textAnchor="middle" className="chalk-talk-label">
            DoD
          </text>
        </Written>
        <Line
          d="M236 10h134a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H236a8 8 0 0 1-8-8V18a8 8 0 0 1 8-8z"
          at={at('contractor')}
        />
        <Written at={at('contractor')}>
          <text x="303" y="36" textAnchor="middle" className="chalk-talk-label">
            a contractor
          </text>
        </Written>
        <Line
          d="M28 192h154a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8v-24a8 8 0 0 1 8-8z"
          at={at('status')}
        />
        <Written at={at('status')}>
          <text
            x="105"
            y="218"
            textAnchor="middle"
            className="chalk-talk-label"
          >
            status in SPRS
          </text>
        </Written>
      </g>
      <g className="chalk-talk-arrows">
        <Line d="M98 30C160 24 160 36 222 30" at={at('shares')} />
        <Line d="M213 24l9 6-9 6" at={at('shares')} />
        <Line d="M268 79C284 73 284 85 300 79" at={at('level-1')} />
        <Line d="M291 73l9 6-9 6" at={at('level-1')} />
        <Line d="M268 113C284 107 284 119 300 113" at={at('level-2')} />
        <Line d="M291 107l9 6-9 6" at={at('level-2')} />
        <Line d="M40 228c38 2 78 0 130 1" at={at('current')} />
      </g>
      <Written at={at('shares')}>
        <text x="108" y="20" className="chalk-talk-note">
          shares information
        </text>
      </Written>
      <Written at={at('fci')}>
        <text x="232" y="84" className="chalk-talk-word">
          FCI
        </text>
      </Written>
      <Written at={at('cui')}>
        <text x="232" y="118" className="chalk-talk-word">
          CUI
        </text>
      </Written>
      <Written at={at('level-1')}>
        <text x="306" y="84" className="chalk-talk-level">
          Level 1
        </text>
      </Written>
      <Written at={at('level-2')}>
        <text x="306" y="118" className="chalk-talk-level">
          Level 2
        </text>
      </Written>
      <Written at={at('level-3')}>
        <path
          d="M232 138c40 2 90 0 140 2"
          className="chalk-talk-dashed chalk-talk-dashed-thin"
        />
        <text x="306" y="156" className="chalk-talk-level">
          Level 3
        </text>
      </Written>
      <Written at={at('assessed')}>
        <path d="M180 182c40 0 100-10 120-40" className="chalk-talk-dashed" />
        <text x="140" y="172" className="chalk-talk-note">
          assessed
        </text>
      </Written>
      <Written at={at('current')}>
        <text x="200" y="222" className="chalk-talk-level">
          current
        </text>
      </Written>
    </svg>
  )
}

/**
 * A caption with its glossary words and links in it. Only the current one
 * is live: the rest are listed for a screen reader as plain text, so that a
 * caption off the screen holds nothing to tab to.
 */
function Caption({
  scene,
  live,
}: {
  readonly scene: ChalkTalkScene
  readonly live: boolean
}) {
  if (!live) return <>{scene.caption}</>
  const pieces: {
    readonly start: number
    readonly end: number
    readonly node: ReactNode
  }[] = []
  for (const word of scene.words) {
    const term = glossaryTerms.find((item) => item.id === word.term)
    const start = scene.caption.indexOf(word.phrase)
    if (!term || start < 0) continue
    pieces.push({
      start,
      end: start + word.phrase.length,
      node: (
        <ChalkTerm key={word.term} term={term}>
          {word.phrase}
        </ChalkTerm>
      ),
    })
  }
  for (const link of scene.links ?? []) {
    const start = scene.caption.indexOf(link.label)
    if (start < 0) continue
    pieces.push({
      start,
      end: start + link.label.length,
      node: (
        <a key={link.href} href={link.href}>
          {link.label}
        </a>
      ),
    })
  }
  pieces.sort((a, b) => a.start - b.start)
  const runs: ReactNode[] = []
  let position = 0
  pieces.forEach((piece, index) => {
    if (piece.start < position) return
    if (piece.start > position)
      runs.push(
        <Fragment key={`text-${index}`}>
          {scene.caption.slice(position, piece.start)}
        </Fragment>,
      )
    runs.push(piece.node)
    position = piece.end
  })
  if (position < scene.caption.length)
    runs.push(<Fragment key="tail">{scene.caption.slice(position)}</Fragment>)
  return <>{runs}</>
}

interface ChalkTalkProps {
  /** Desktop: the talk plays once when Home loads. Elsewhere it waits for play. */
  readonly autoplay: boolean
}

/**
 * "CMMC in sixty seconds" (mockups/2026-10-15/HomeChalkTalk.html): the board
 * draws itself in eight scenes of about seven and a half seconds, one caption
 * each. A play/pause button, a chalk dash per scene that jumps to it, the
 * time in mono, and the caption under the drawing; no audio, ever. It plays
 * once, never loops, ends on the full drawing with "Watch again", which has
 * Smudge sweep the board clean before it starts over, and pauses while the
 * tab is hidden, and while a caption's word has focus, so a popover opened
 * from the keyboard stays. A jump while paused shows that scene drawn, and
 * play goes on from there. Under reduced motion nothing draws: the finished
 * drawing stands with the captions as a stepped list. The drawing is hidden
 * from assistive technology; the eight captions are an ordered list in the
 * DOM, the current one marked, and nothing is announced as it plays.
 */
export function ChalkTalk({ autoplay }: ChalkTalkProps) {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.(motionQuery).matches ?? false,
  )
  const [elapsed, setElapsed] = useState(0)
  // Opened in a background tab, it waits for the tab.
  const [playing, setPlaying] = useState(
    () => autoplay && !reduced && !document.hidden,
  )
  const [sweeping, setSweeping] = useState(false)
  // After a jump while paused the scene stands drawn; play goes on from there.
  const [settled, setSettled] = useState(false)
  const [step, setStep] = useState(0)
  const titleId = useId()
  const at = useRef(0)
  const scene = Math.min(
    chalkTalkScenes.length - 1,
    Math.floor(elapsed / sceneMs),
  )
  const done = elapsed >= total

  // Motion turned off while it plays stops it; the drawing is finished then.
  useEffect(() => {
    const preference = window.matchMedia?.(motionQuery)
    if (!preference) return
    const changed = (event: MediaQueryListEvent) => {
      setReduced(event.matches)
      if (event.matches) setPlaying(false)
    }
    preference.addEventListener('change', changed)
    return () => preference.removeEventListener('change', changed)
  }, [])
  // A hidden tab pauses it; play picks it up where it stopped.
  useEffect(() => {
    const changed = () => {
      if (document.hidden) setPlaying(false)
    }
    document.addEventListener('visibilitychange', changed)
    return () => document.removeEventListener('visibilitychange', changed)
  }, [])
  useEffect(() => {
    if (!playing || reduced) return
    let frame = 0
    let before = performance.now()
    const tick = (now: number) => {
      const next = Math.min(
        total,
        at.current + Math.max(0, Math.min(now - before, longestFrame)),
      )
      before = now
      at.current = next
      setElapsed(next)
      if (next >= total) setPlaying(false)
      else frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, reduced])
  // Watch again: the drawing stands while Smudge sweeps; the board is clean
  // when he is done, and it plays from the start, once the tab is in view.
  useEffect(() => {
    if (!sweeping) return
    const timer = window.setTimeout(() => {
      at.current = 0
      setElapsed(0)
      setSweeping(false)
      setPlaying(!document.hidden)
    }, cueLengths.sweep)
    return () => window.clearTimeout(timer)
  }, [sweeping])

  function toggle() {
    if (sweeping) return
    if (done) {
      cueSmudge('sweep')
      setSweeping(true)
      return
    }
    if (playing) {
      setPlaying(false)
      return
    }
    if (settled) {
      // The scene stands drawn: play goes on past its drawing.
      at.current = Math.min(total, (scene + drawShare) * sceneMs)
      setElapsed(at.current)
      setSettled(false)
    }
    setPlaying(true)
  }
  function jump(index: number) {
    if (sweeping) return
    at.current = index * sceneMs
    setElapsed(at.current)
    setSettled(!playing)
  }

  const label = done ? 'Watch again' : playing ? 'Pause' : 'Play'
  const shown = settled
    ? Math.min(total, (scene + drawShare) * sceneMs)
    : elapsed
  return (
    <section className="chalk-talk" aria-labelledby={titleId}>
      <h2 id={titleId} className="chalk-talk-title hand">
        {chalkTalkTitle}
      </h2>
      <Drawing
        elapsed={shown}
        finished={reduced}
        preview={!reduced && !playing && !sweeping && !settled && elapsed === 0}
      />
      {reduced ? (
        <>
          <ol className="chalk-talk-script" role="list">
            {chalkTalkScenes.map((item, index) => (
              <li
                key={item.id}
                className={index === step ? undefined : 'sr-only'}
                aria-current={index === step ? 'step' : undefined}
              >
                <Caption scene={item} live={index === step} />
              </li>
            ))}
          </ol>
          <div className="chalk-talk-steps">
            <button
              type="button"
              className="chalk-talk-step"
              aria-disabled={step === 0 ? 'true' : undefined}
              onClick={() => step > 0 && setStep(step - 1)}
            >
              Previous
            </button>
            <span className="chalk-talk-time mono">
              {step + 1} / {chalkTalkScenes.length}
            </span>
            <button
              type="button"
              className="chalk-talk-step"
              aria-disabled={
                step === chalkTalkScenes.length - 1 ? 'true' : undefined
              }
              onClick={() =>
                step < chalkTalkScenes.length - 1 && setStep(step + 1)
              }
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="chalk-talk-controls">
            <button
              type="button"
              className={`chalk-talk-play${done ? ' is-again' : ''}`}
              aria-label={done ? undefined : label}
              onClick={toggle}
            >
              {done ? (
                <span className="hand">Watch again</span>
              ) : playing ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  aria-hidden="true"
                >
                  <path d="M3 2v10M10 2v10" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  aria-hidden="true"
                >
                  <path d="M3 2l9 5-9 5z" />
                </svg>
              )}
            </button>
            <ol className="chalk-talk-dashes" role="list" aria-label="Scenes">
              {chalkTalkScenes.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="chalk-talk-dash"
                    aria-label={`Scene ${index + 1}: ${item.caption}`}
                    aria-current={index === scene ? 'step' : undefined}
                    data-drawn={index <= scene ? 'true' : undefined}
                    onClick={() => jump(index)}
                  >
                    <span aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
            <span className="chalk-talk-time mono">
              {timeLabel(elapsed)} / {timeLabel(total)}
            </span>
          </div>
          {/* Focus on a caption's word pauses it: the word, and a popover
              opened from the keyboard, stay until play. */}
          <ol
            className="chalk-talk-script"
            role="list"
            onFocusCapture={() => setPlaying(false)}
          >
            {chalkTalkScenes.map((item, index) => (
              <li
                key={item.id}
                className={index === scene ? undefined : 'sr-only'}
                aria-current={index === scene ? 'step' : undefined}
              >
                <Caption scene={item} live={index === scene} />
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
