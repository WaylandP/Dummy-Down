import { Fragment, type ReactNode } from 'react'
import { glossaryTerms } from '../../data/content'
import { ChalkTerm } from '../control/ChalkTerm'
import { SixtyBoard } from './SixtyBoard'
import {
  formatTime,
  sixtyChapters,
  sixtyLength,
  sixtyNote,
  sixtySpeeds,
  type SixtyChapter,
} from './sixty-script'
import type { SixtyPlayerApi } from './useSixtyPlayer'

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
 * The board with its player under it, as the mockup lays them out: the
 * play/pause/replay button, the chaptered scrub bar (a slider whose value
 * text names the part), the time in mono and the speed; then the eyebrow
 * and the caption; then the note. A click on the board pauses and plays.
 */
export function SixtyPlayer({ player }: { readonly player: SixtyPlayerApi }) {
  const { playing, second, chapter, speed, narrow } = player
  const ended = !playing && second >= sixtyLength
  const current = sixtyChapters[chapter]!
  return (
    <>
      <div className="sixty-screen" onClick={player.toggle}>
        <SixtyBoard id={player.id} narrow={narrow} />
      </div>
      <div className="sixty-dock">
        <div className="sixty-player">
          <button
            type="button"
            className="sixty-play"
            data-autofocus=""
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
            <div
              className="sixty-track"
              style={{ gridTemplateColumns: columns }}
            >
              {sixtyChapters.map((item) => (
                <span key={item.name} className="sixty-seg">
                  <i />
                </span>
              ))}
              <span className="sixty-knob" />
            </div>
            <div
              className="sixty-labels"
              aria-hidden="true"
              style={{ gridTemplateColumns: columns }}
            >
              {sixtyChapters.map((item, index) => (
                <span
                  key={item.name}
                  className={index === chapter ? 'is-on' : undefined}
                >
                  {item.short}
                </span>
              ))}
            </div>
          </div>
          <span className="sixty-time mono">
            {formatTime(second)} / {formatTime(sixtyLength)}
          </span>
          <button
            type="button"
            className="sixty-speed"
            aria-label={`Playback speed ${sixtySpeeds[speed]} times`}
            onClick={player.cycleSpeed}
          >
            <span className="sixty-speed-pill mono">{sixtySpeeds[speed]}×</span>
          </button>
        </div>
        <div className="sixty-cap">
          <p className="sixty-eyebrow">
            Part {chapter + 1} of {sixtyChapters.length} · {current.name}
          </p>
          <p className="sixty-caption" aria-live="polite">
            <Caption chapter={current} />
          </p>
        </div>
      </div>
      <p className="sixty-note">
        {sixtyNote} <a href="/timeline">Timeline</a>
      </p>
    </>
  )
}
