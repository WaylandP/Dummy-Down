import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { glossaryTerms } from '../../data/content'
import { playUrl } from '../../state/play'
import { cueSmudge } from '../board/tray-state'
import { ChalkTerm } from '../control/ChalkTerm'
import { SixtyBoard } from './SixtyBoard'
import { SixtyShare } from './SixtyShare'
import {
  formatTime,
  sixtyBlurb,
  sixtyChapters,
  sixtyLength,
  sixtyNote,
  sixtySpeeds,
  sixtyTitle,
  type SixtyChapter,
} from './sixty-script'
import { useSixtyPlayer } from './useSixtyPlayer'
import './sixty.css'

const motionQuery = '(prefers-reduced-motion: reduce)'

/** Whether the visitor asked for less motion, now and as it changes. */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.(motionQuery).matches ?? false,
  )
  useEffect(() => {
    const preference = window.matchMedia?.(motionQuery)
    if (!preference) return
    const changed = (event: MediaQueryListEvent) => setReduced(event.matches)
    preference.addEventListener('change', changed)
    return () => preference.removeEventListener('change', changed)
  }, [])
  return reduced
}

/** The chapters' shares of the scrub bar, by their length. */
const columns = sixtyChapters
  .map((chapter) => `${chapter.end - chapter.start}fr`)
  .join(' ')

/** A caption with its glossary words carrying their chalk popovers. */
function Caption({ chapter }: { readonly chapter: SixtyChapter }) {
  const pieces: {
    readonly start: number
    readonly end: number
    readonly node: ReactNode
  }[] = []
  for (const word of chapter.words) {
    const term = glossaryTerms.find((item) => item.id === word.term)
    const start = chapter.caption.indexOf(word.phrase)
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
  pieces.sort((a, b) => a.start - b.start)
  const runs: ReactNode[] = []
  let position = 0
  pieces.forEach((piece, index) => {
    if (piece.start < position) return
    if (piece.start > position)
      runs.push(
        <Fragment key={`text-${index}`}>
          {chapter.caption.slice(position, piece.start)}
        </Fragment>,
      )
    runs.push(piece.node)
    position = piece.end
  })
  if (position < chapter.caption.length)
    runs.push(<Fragment key="tail">{chapter.caption.slice(position)}</Fragment>)
  return <>{runs}</>
}

/**
 * "CMMC in sixty seconds" on Home, playing in its own panel: the title in
 * yellow chalk (the h2 that names the region), the board, the player row
 * (play/pause/replay, the chaptered scrub bar, the time in mono, the
 * speed), then the caption with the Phase 2 note under it. It is the same
 * panel resting and playing, so nothing moves when Play is pressed and the
 * address does not change. Resting, the board shows the finished clock and
 * the caption slot says what the drawing is; Play, Replay or a click on
 * the board clears it with a quick pass of Smudge, then draws in place;
 * at 1:00 the finished clock stays, and Smudge sweeps. The keys (Space, K,
 * the arrows, Home, End, Page Up, Page Down) work only while focus is in
 * the panel. Nothing plays on its own, except from `/?play=sixty`, which
 * opens Home with the panel in view and plays from 0:00 (under reduced
 * motion it shows the finished board instead). Share, at the end of the
 * player row, sends the video, copies that address or downloads the MP4.
 */
export function SixtySeconds({ autoplay = false }: { autoplay?: boolean }) {
  const reduced = useReducedMotion()
  const { root, player } = useSixtyPlayer({
    reduced,
    onEnded: () => cueSmudge('sweep'),
  })
  const titleId = useId()
  const { playing, second, chapter, speed, narrow, started, ended } = player
  const current = sixtyChapters[chapter]!
  // The deep link: once, on arrival, the panel comes into view and plays.
  const arrival = useRef({ autoplay, reduced, toggle: player.toggle })
  useEffect(() => {
    const { autoplay, reduced, toggle } = arrival.current
    if (!autoplay) return
    const panel = root.current
    if (panel && typeof panel.scrollIntoView === 'function')
      panel.scrollIntoView({ block: 'start' })
    if (!reduced) toggle()
  }, [root])
  return (
    <section
      ref={root}
      className="sixty"
      aria-labelledby={titleId}
      onKeyDown={player.onKeyDown}
    >
      <h2 id={titleId} className="sixty-title hand">
        {sixtyTitle}
      </h2>
      {/* The board: a click plays and pauses, for the pointer; the button
          under it does so for everyone. */}
      <div className="sixty-screen" onClick={player.toggle}>
        <SixtyBoard id={player.id} arrangement={narrow ? 'narrow' : 'wide'} />
      </div>
      <div className="sixty-player">
        <button
          type="button"
          className="sixty-play"
          aria-label={playing ? 'Pause' : ended ? 'Replay' : 'Play'}
          onClick={player.toggle}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {playing ? (
              <>
                <rect x="6.5" y="5" width="3.6" height="14" rx="1" />
                <rect x="13.9" y="5" width="3.6" height="14" rx="1" />
              </>
            ) : ended ? (
              <>
                <path
                  className="sixty-icon-line"
                  d="M12 4.5a7.5 7.5 0 1 1-7.1 5.1"
                />
                <path
                  className="sixty-icon-line"
                  d="M3.4 4.4l1.5 5.3 5.2-1.6"
                />
              </>
            ) : (
              <path d="M7 4.5v15l12.5-7.5z" />
            )}
          </svg>
        </button>
        <div
          className="sixty-scrub"
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={sixtyLength}
          aria-valuenow={second}
          aria-valuetext={`${formatTime(second)}, ${current.name}`}
          onPointerDown={player.onScrubDown}
          onPointerMove={player.onScrubMove}
          onPointerUp={player.onScrubUp}
          onPointerCancel={player.onScrubUp}
        >
          <div className="sixty-track" style={{ gridTemplateColumns: columns }}>
            {sixtyChapters.map((item) => (
              <span key={item.name} className="sixty-seg">
                <i />
              </span>
            ))}
            <span className="sixty-knob" />
          </div>
        </div>
        {/* Resting, the length; playing, the time, with the length where there is room. */}
        <span className="sixty-time mono">
          <span className="sixty-time-now">
            {formatTime(started ? second : sixtyLength)}
          </span>
          {started && (
            <span className="sixty-time-length">
              {' '}
              / {formatTime(sixtyLength)}
            </span>
          )}
        </span>
        <button
          type="button"
          className="sixty-speed"
          aria-label={`Playback speed ${sixtySpeeds[speed]} times`}
          onClick={player.cycleSpeed}
        >
          <span className="sixty-speed-pill mono">{sixtySpeeds[speed]}×</span>
        </button>
        <SixtyShare
          video="/media/cmmc-in-sixty-seconds.mp4"
          link={playUrl(window.location.origin)}
        />
      </div>
      <div className="sixty-cap">
        <p className="sixty-eyebrow">
          {started
            ? `Part ${chapter + 1} of ${sixtyChapters.length} · ${current.name}`
            : `${sixtyLength} seconds · ${sixtyChapters.length} parts`}
        </p>
        {/* The caption's slot is as tall as the longest caption at this
            width, so the panel keeps its height from part to part: every
            caption sits under the shown one, unseen and inert. */}
        <div className="sixty-captions">
          <p className="sixty-caption" aria-live="polite">
            {started ? <Caption chapter={current} /> : sixtyBlurb}
          </p>
          <div className="sixty-caption-sizer" aria-hidden="true" inert>
            <p className="sixty-caption">{sixtyBlurb}</p>
            {sixtyChapters.map((chapter) => (
              <p key={chapter.name} className="sixty-caption">
                <Caption chapter={chapter} />
              </p>
            ))}
          </div>
        </div>
      </div>
      <p className="sixty-note">
        {sixtyNote} <a href="/timeline">Timeline</a>
      </p>
    </section>
  )
}
