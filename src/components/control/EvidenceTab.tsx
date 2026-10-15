import type { PerspectiveDraftState } from './usePerspectiveDraft'
import { PerspectiveState } from './PerspectiveState'

/** What an assessor would ask and could be shown, from the compliance chalk. */
export function EvidenceTab({
  draft,
}: {
  readonly draft: PerspectiveDraftState
}) {
  if (draft.status !== 'ready') return <PerspectiveState state={draft} />
  const { compliance } = draft.draft
  return (
    <div className="evidence">
      <p className="explain-text">{compliance.focus}</p>
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
          {compliance.reviewQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
        <h2>Evidence to discuss</h2>
        <ul>
          {compliance.evidenceExamples.map((example) => (
            <li key={example}>{example}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
