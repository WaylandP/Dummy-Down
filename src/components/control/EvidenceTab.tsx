import type { ReferenceControl } from '../../types/content'
import { assessmentMethodsFor } from '../../data/cmmc-assessment-methods'
import type { PerspectiveDraftState } from './usePerspectiveDraft'
import { PerspectiveState } from './PerspectiveState'

const words = [
  { key: 'examine', word: 'Examine', means: 'the document' },
  { key: 'interview', word: 'Interview', means: 'the role' },
  { key: 'test', word: 'Test', means: 'the action' },
] as const

/**
 * The assessor's three words, verbatim from the pinned guide's lists for this
 * control, then what an assessor would ask and could be shown, from the
 * compliance chalk.
 */
export function EvidenceTab({
  control,
  draft,
}: {
  readonly control: ReferenceControl
  readonly draft: PerspectiveDraftState
}) {
  const methods = assessmentMethodsFor(control)
  return (
    <div className="evidence-tab">
      {methods && (
        <section
          className="assessor-words"
          aria-labelledby="assessor-words-title"
        >
          <h2 id="assessor-words-title" className="sr-only">
            The assessor’s three words
          </h2>
          {words.map((entry) => (
            <div className="assessor-word" key={entry.key}>
              <h3>
                {entry.word}
                <span className="assessor-means"> {entry.means}</span>
              </h3>
              <ul>
                {methods[entry.key].map((item, index) => (
                  // The guide repeats an item in a few lists; the order is the key.
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
      {draft.status !== 'ready' ? (
        <PerspectiveState state={draft} />
      ) : (
        <div className="evidence">
          <p className="explain-text">{draft.draft.compliance.focus}</p>
          <div className="explain-margin">
            <svg
              className="explain-rule chalk"
              viewBox="0 0 10 300"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M5 2c2 60-2 120 1 180s-2 90 0 116" />
            </svg>
            <h2>Ask</h2>
            <ul>
              {draft.draft.compliance.reviewQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
            <h2>Evidence to discuss</h2>
            <ul>
              {draft.draft.compliance.evidenceExamples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
