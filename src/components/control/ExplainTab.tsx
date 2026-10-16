import type { ExplanationMode, ReferenceControl } from '../../types/content'
import { lessonIdentity } from '../../state/explorer-state'
import { glossaryTerms } from '../../data/content'
import { getLevelOneTermIds } from '../../data/level-one-terms'
import { chalkFor } from '../board/chalks'
import { ChalkText } from './ChalkTerm'
import { markBlocks } from './term-matching'
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
  // Only the words listed for the lesson are marked; free text is never linked.
  const words = getLevelOneTermIds(control).flatMap((id) => {
    const term = glossaryTerms.find((item) => item.id === id)
    return term ? [term] : []
  })
  // The view's blocks in reading order; a word is marked at its first mention.
  const text = draft.draft
  const blocks =
    mode === 'beginner'
      ? [text.beginner.meaning, text.beginner.example]
      : mode === 'it-cyber'
        ? [
            text.technical.focus,
            text.technical.example,
            text.technical.watchFor,
          ]
        : [text.compliance.focus, ...text.compliance.reviewQuestions]
  const marked = markBlocks(blocks, words)
  // The explanation is set at 28px; a longer one steps down so that it fits
  // its column on one screen (about 220 characters at 28px, 330 at 24px, 400
  // at 21px), with room for a renderer that wraps a line sooner.
  const length = blocks[0]?.length ?? 0
  const size =
    length > 400 ? 'xs' : length > 330 ? 's' : length > 220 ? 'm' : undefined
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
        <p className="explain-text" data-size={size}>
          <ChalkText runs={marked[0]!} />
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
              <p>
                <ChalkText runs={marked[1]!} />
              </p>
            </>
          ) : mode === 'it-cyber' ? (
            <>
              <h2>One way to do it</h2>
              <p>
                <ChalkText runs={marked[1]!} />
              </p>
              <h2>Watch for</h2>
              <p>
                <ChalkText runs={marked[2]!} />
              </p>
            </>
          ) : (
            <>
              <h2>Ask</h2>
              <ul>
                {text.compliance.reviewQuestions.map((question, index) => (
                  <li key={question}>
                    <ChalkText runs={marked[index + 1]!} />
                  </li>
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
