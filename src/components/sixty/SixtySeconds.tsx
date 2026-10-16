import { useId, useRef, useState } from 'react'
import { SixtyStill } from './SixtyBoard'
import { SixtyDialog } from './SixtyDialog'
import { formatTime, sixtyBlurb, sixtyLength, sixtyTitle } from './sixty-script'
import './sixty.css'

/**
 * "CMMC in sixty seconds" on Home (mockups/2026-10-15/SixtySeconds.html,
 * which is drawn for a stage a thousand pixels wide): a still of the
 * finished clock, cropped to the dial, under the title in yellow chalk; a
 * 44px play button, the length and one line under it. Play, or a click on
 * the still, opens the whole drawing in a modal dialog from 0:00; closing it
 * brings focus back to the play button. Nothing plays on its own.
 */
export function SixtySeconds() {
  const [open, setOpen] = useState(false)
  const play = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  return (
    <section className="sixty" aria-labelledby={titleId}>
      <h2 id={titleId} className="sixty-title hand">
        {sixtyTitle}
      </h2>
      {/* The still is the drawing's own cover: a click opens it for the
          pointer, and the play button under it does so for everyone. */}
      <div
        className="sixty-still"
        aria-hidden="true"
        onClick={() => setOpen(true)}
      >
        <SixtyStill />
      </div>
      <div className="sixty-row">
        <button
          ref={play}
          type="button"
          className="sixty-play"
          aria-label="Play"
          onClick={() => setOpen(true)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M7 4.5v15l12.5-7.5z" />
          </svg>
        </button>
        <span className="sixty-length mono">{formatTime(sixtyLength)}</span>
        <p className="sixty-blurb">{sixtyBlurb}</p>
      </div>
      {open && (
        <SixtyDialog
          onClose={() => {
            setOpen(false)
            play.current?.focus()
          }}
        />
      )}
    </section>
  )
}
