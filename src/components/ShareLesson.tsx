import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Check, Link } from 'lucide-react'

interface ShareLessonProps {
  url: string
}

type CopyPhase = 'idle' | 'pending' | 'copied' | 'fallback'

/** A new keyed lifetime invalidates obsolete writes, including A → B → A. */
export function ShareLesson({ url }: ShareLessonProps) {
  return <ShareLessonSession key={url} url={url} />
}

function ShareLessonSession({ url }: ShareLessonProps) {
  const prefix = useId()
  const [feedback, setFeedback] = useState<{ phase: CopyPhase }>({
    phase: 'idle',
  })
  const alive = useRef(false)
  const pending = useRef(false)
  const button = useRef<HTMLButtonElement>(null)
  const fallback = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useLayoutEffect(() => {
    if (
      feedback.phase === 'fallback' &&
      document.activeElement === button.current
    ) {
      fallback.current?.focus()
      fallback.current?.select()
    }
  }, [feedback])

  async function copyLesson() {
    if (pending.current) return
    pending.current = true
    setFeedback({ phase: 'pending' })

    try {
      if (typeof navigator.clipboard?.writeText !== 'function') {
        if (alive.current) setFeedback({ phase: 'fallback' })
        return
      }
      await navigator.clipboard.writeText(url)
      if (alive.current) setFeedback({ phase: 'copied' })
    } catch {
      if (alive.current) setFeedback({ phase: 'fallback' })
    } finally {
      pending.current = false
    }
  }

  return (
    <div className="share-lesson">
      <button
        ref={button}
        className="share-button"
        type="button"
        onClick={copyLesson}
        disabled={feedback.phase === 'pending'}
      >
        {feedback.phase === 'copied' ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <Link size={16} aria-hidden="true" />
        )}
        {feedback.phase === 'pending' ? 'Copying…' : 'Copy lesson link'}
      </button>
      <p className="share-feedback" role="status" aria-live="polite">
        {feedback.phase === 'copied' && 'Lesson link copied.'}
        {feedback.phase === 'fallback' &&
          "Copy isn't available. Select the link below."}
      </p>
      {feedback.phase === 'fallback' && (
        <div className="share-fallback">
          <label htmlFor={`${prefix}-link`}>Lesson link</label>
          <textarea
            ref={fallback}
            id={`${prefix}-link`}
            value={url}
            readOnly
            rows={3}
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
      )}
    </div>
  )
}
