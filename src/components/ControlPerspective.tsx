import { useState } from 'react'
import { explanationModes } from '../data/content'
import type { ExplanationMode, LessonIdentity } from '../types/content'
import type { ControlPerspectiveDraft } from '../types/perspectives'
import { LearningModes } from './LearningModes'
import { trackUsage } from '../analytics/usage'

interface ControlPerspectiveProps {
  draft: ControlPerspectiveDraft
  lesson: LessonIdentity
  mode: ExplanationMode
  onChange: (mode: ExplanationMode) => void
}

function Reflection({
  lesson,
  mode,
}: Pick<ControlPerspectiveProps, 'lesson' | 'mode'>) {
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
          'Try explaining the idea in your own words, then compare it with the requirement above.'}
        {answer === false &&
          'Try another perspective above. For the complete assessment guidance, open the cited guide below.'}
      </p>
    </div>
  )
}

/** Three ways to understand one control; none replaces its official requirement. */
export function ControlPerspective({
  draft,
  lesson,
  mode,
  onChange,
}: ControlPerspectiveProps) {
  const description = explanationModes.find(
    (item) => item.id === mode,
  )?.description
  return (
    <section
      className="control-perspective"
      aria-label="Control teaching perspectives"
    >
      <div className="perspective-heading">
        <div>
          <p className="instruction-eyebrow">Decode the control</p>
          <p className="mode-label">Choose your perspective</p>
        </div>
      </div>
      <LearningModes value={mode} onChange={onChange} idPrefix="reference" />
      <div
        className="explanation-panel"
        role="tabpanel"
        id="reference-panel"
        aria-labelledby={`reference-tab-${mode}`}
        tabIndex={0}
      >
        <p className="perspective-purpose">{description}</p>
        {mode === 'beginner' ? (
          <>
            <h4>The idea in everyday terms.</h4>
            <p className="perspective-meaning">{draft.beginner.meaning}</p>
            <div className="perspective-example teaching-note">
              <h5>Imagine this at work</h5>
              <p>{draft.beginner.example}</p>
            </div>
          </>
        ) : mode === 'it-cyber' ? (
          <>
            <h4>Make it work in a real system.</h4>
            <p className="perspective-meaning">{draft.technical.focus}</p>
            <div className="perspective-example teaching-note">
              <h5>One possible approach</h5>
              <p>{draft.technical.example}</p>
            </div>
            <div className="perspective-watch teaching-note">
              <h5>Watch for</h5>
              <p>{draft.technical.watchFor}</p>
            </div>
          </>
        ) : (
          <>
            <h4>Read it with assessment in mind.</h4>
            <p className="perspective-meaning">{draft.compliance.focus}</p>
            <div className="perspective-questions">
              <h5>Questions to bring to the guide</h5>
              <ul>
                {draft.compliance.reviewQuestions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>
            <details className="source-details perspective-evidence">
              <summary>Possible evidence to discuss</summary>
              <div className="source-content">
                <p>
                  Examples to bring to the conversation, not a checklist. Scope,
                  interviews and testing decide what an assessor examines.
                </p>
                <ul>
                  {draft.compliance.evidenceExamples.map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </div>
            </details>
          </>
        )}
        <p className="perspective-context">
          Written by Cipher &amp; Chalk from the cited September 2024 guide.
          Questions and examples are teaching aids, not official assessment
          objectives.
        </p>
        <Reflection
          key={`${lesson.frameworkId}/${lesson.editionId}/${lesson.controlKey}/${mode}`}
          lesson={lesson}
          mode={mode}
        />
      </div>
    </section>
  )
}
