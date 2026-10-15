import type { ExplanationMode, ReferenceControl } from '../../types/content'
import { lessonIdentity } from '../../state/explorer-state'
import { chalkFor } from '../board/chalks'
import { ChalkPicker } from './ChalkPicker'
import { Reflection } from './Reflection'
import type { PerspectiveDraftState } from './usePerspectiveDraft'
import { PerspectiveState } from './PerspectiveState'

interface ExplainTabProps {
  readonly control: ReferenceControl
  readonly draft: PerspectiveDraftState
  readonly mode: ExplanationMode
  readonly onModeChange: (mode: ExplanationMode) => void
  readonly idPrefix: string
}

/** Pick a chalk; the explanation is written in its colour, the example in the margin. */
export function ExplainTab({
  control,
  draft,
  mode,
  onModeChange,
  idPrefix,
}: ExplainTabProps) {
  const chalk = chalkFor(mode)
  const lesson = lessonIdentity(control)
  if (draft.status !== 'ready')
    return (
      <div className="explain explain-pending">
        <PerspectiveState state={draft} />
      </div>
    )
  return (
    <div className="explain">
      <ChalkPicker value={mode} onChange={onModeChange} idPrefix={idPrefix} />
      <div
        role="tabpanel"
        id={`${idPrefix}-panel`}
        aria-labelledby={`${idPrefix}-tab-${mode}`}
        tabIndex={0}
        className="explain-panel"
        style={{ color: chalk.cssColor }}
      >
        <p className="explain-text">
          {mode === 'beginner'
            ? draft.draft.beginner.meaning
            : mode === 'it-cyber'
              ? draft.draft.technical.focus
              : draft.draft.compliance.focus}
        </p>
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
          {mode === 'beginner' ? (
            <>
              <h2>At work</h2>
              <p>{draft.draft.beginner.example}</p>
            </>
          ) : mode === 'it-cyber' ? (
            <>
              <h2>One way to do it</h2>
              <p>{draft.draft.technical.example}</p>
              <h2>Watch for</h2>
              <p>{draft.draft.technical.watchFor}</p>
            </>
          ) : (
            <>
              <h2>Ask</h2>
              <ul>
                {draft.draft.compliance.reviewQuestions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        <Reflection
          key={`${lesson.frameworkId}/${lesson.editionId}/${lesson.controlKey}/${mode}`}
          lesson={lesson}
          mode={mode}
        />
      </div>
    </div>
  )
}
