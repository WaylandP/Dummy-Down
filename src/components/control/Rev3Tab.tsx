import { Fragment, useId } from 'react'
import type { ExplanationMode, ReferenceControl } from '../../types/content'
import {
  rev3Source,
  rev3Target,
  type Rev3Change,
  type Rev3Requirement,
} from '../../data/cmmc-rev3'
import { createLessonUrl, lessonIdentity } from '../../state/explorer-state'

const changeLabels: Readonly<Record<Rev3Change, string>> = {
  unchanged: 'Unchanged',
  changed: 'Changed',
  'new-odp': 'New organization-defined parameter',
  withdrawn: 'Withdrawn',
}

/** Rev 3 numbers its parts a., b., 1., 2.; a break before each top-level letter keeps the words verbatim. */
function parts(text: string) {
  return text.split(/(?= [a-h]\. [A-Z[])/)
}

interface Rev3TabProps {
  readonly control: ReferenceControl
  readonly row: Rev3Requirement
  readonly mode: ExplanationMode
}

/**
 * The Level 2 requirement beside its NIST SP 800-171 Rev. 3 counterpart, both
 * verbatim, and one sentence on what changed. CMMC still assesses against
 * Rev. 2; the tab says so once.
 */
export function Rev3Tab({ control, row, mode }: Rev3TabProps) {
  const prefix = useId()
  const guide = control.sourceDocuments.find(
    (source) => source.id === control.requirement.sourceId,
  )
  const went = (row.into ?? [])
    .map((target) => ({ target, control: rev3Target(target) }))
    .filter((item) => item.control)
  return (
    <div className="rev3">
      <p className="rev3-pinned">
        CMMC is pinned to NIST SP 800-171 Revision 2. Revision 3 (May 2024) is
        here to read ahead, not to be assessed against.
      </p>
      <p className="rev3-change">
        <span className="hand rev3-change-kind">
          {changeLabels[row.change]}
          <span className="sr-only">.</span>
        </span>{' '}
        <span className="rev3-note">{row.note}</span>
      </p>
      {went.length > 0 && (
        <p className="rev3-went">
          Read it where it went:{' '}
          {went.map((item, index) => (
            <Fragment key={item.target}>
              {index > 0 && ', '}
              <a
                href={createLessonUrl(
                  lessonIdentity(item.control!),
                  mode,
                  new URL(window.location.href),
                  'rev3',
                )}
              >
                <span className="mono">{item.target}</span> {item.control!.id}
              </a>
            </Fragment>
          ))}
          .
        </p>
      )}
      <div className="rev3-pair">
        <section className="rev3-side" aria-labelledby={`${prefix}-rev2`}>
          <h2 id={`${prefix}-rev2`} className="hand">
            Rev 2 <span className="mono rev3-id">{control.id}</span>
          </h2>
          <blockquote className="rev3-quote reference-requirement">
            {control.requirement.text}
          </blockquote>
          <p className="rev3-cite">
            {guide
              ? `${guide.title}, v${guide.version}, page ${control.requirement.printedPage}.`
              : ''}
          </p>
        </section>
        <section className="rev3-side" aria-labelledby={`${prefix}-rev3`}>
          <h2 id={`${prefix}-rev3`} className="hand">
            Rev 3 <span className="mono rev3-id">{row.rev3Id}</span>{' '}
            <span className="rev3-title">{row.rev3Title}</span>
          </h2>
          <blockquote
            className={`rev3-quote${row.rev3Text.length > 320 ? ' is-long' : ''}`}
          >
            {parts(row.rev3Text).map((part, index) => (
              <Fragment key={index}>
                {index > 0 && <br />}
                {part}
              </Fragment>
            ))}
          </blockquote>
          <p className="rev3-cite">
            {rev3Source.publication}, May 2024, page {row.printedPage}.
          </p>
        </section>
      </div>
    </div>
  )
}
