import { useState } from 'react'
import type { ExplanationMode, LessonIdentity } from '../../types/content'
import { trackUsage } from '../../analytics/usage'

/** One question after an explanation; the answer is a category, never text. */
export function Reflection({
  lesson,
  mode,
}: {
  readonly lesson: LessonIdentity
  readonly mode: ExplanationMode
}) {
  const [answer, setAnswer] = useState<boolean | null>(null)
  function reflect(helpful: boolean) {
    if (answer === helpful) return
    setAnswer(helpful)
    trackUsage({ name: 'perspective_feedback', lesson, mode, helpful })
  }
  return (
    <div className="perspective-reflection">
      <span>Did this make sense?</span>
      <div className="reflection-actions">
        <button
          type="button"
          className="inline-action"
          aria-pressed={answer === true}
          onClick={() => reflect(true)}
        >
          Yes, it clicked
        </button>
        <button
          type="button"
          className="inline-action"
          aria-pressed={answer === false}
          onClick={() => reflect(false)}
        >
          Still unclear
        </button>
      </div>
      <p role="status">
        {answer === true &&
          'Try explaining the idea in your own words, then compare it with the requirement on the Decode tab.'}
        {answer === false &&
          'Try another chalk. For the complete assessment guidance, open the cited guide from the Related tab.'}
      </p>
    </div>
  )
}
