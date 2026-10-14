import { useEffect, useState } from 'react'
import type { LessonIdentity } from '../types/content'

type PlayerModule = typeof import('./VisualExplanation')

function RequestedPlayer({ lesson }: { lesson: LessonIdentity }) {
  const [module, setModule] = useState<PlayerModule | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    import('./VisualExplanation')
      .then((loaded) => {
        if (active) setModule(loaded)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [])
  if (module) {
    const Player = module.VisualExplanation
    return <Player lesson={lesson} />
  }
  return (
    <div className="visual-load-state">
      <p role="status" aria-busy={!failed}>
        {failed
          ? 'The visual explanation could not load. The source, perspectives and practice are still available.'
          : 'Loading the visual explanation…'}
      </p>
      {failed && (
        <button
          type="button"
          className="practice-action"
          onClick={() => window.location.reload()}
        >
          Reload this lesson
        </button>
      )}
    </div>
  )
}

/** Closing the disclosure unmounts the player and cancels its animation frame. */
export function VisualLesson({ lesson }: { lesson: LessonIdentity }) {
  const [open, setOpen] = useState(false)
  return (
    <details
      className="practice-disclosure visual-lesson"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>Watch the idea · 40 seconds</summary>
      {open && <RequestedPlayer lesson={lesson} />}
    </details>
  )
}
