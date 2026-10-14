import type { ReferenceControl } from '../types/content'
import { getLevelOneReview } from '../data/level-one-review'
import { glossaryTerms } from '../data/content'
import { ContextTerms } from './ContextTerms'

export function EditorialReviewContext({
  control,
}: {
  control: ReferenceControl
}) {
  const review = getLevelOneReview(control)
  if (!review) return null
  return (
    <details className="source-details editorial-review">
      <summary>Review record &amp; assessment objectives</summary>
      <div className="source-content review-context">
        <dl className="review-stages">
          <div className="review-stage">
            <dt>Source verification</dt>
            <dd>
              Compared with the pinned {review.source.version} publication on{' '}
              {review.sourceVerification.checkedAt}. This does not establish
              current applicability.
            </dd>
          </div>
          <div className="review-stage">
            <dt>AI-assisted editorial review</dt>
            <dd>
              {review.aiReview.objectiveComparisonCount} determination
              statements compared with the teaching draft on{' '}
              {review.aiReview.reviewedAt}. This is separate from qualified
              human approval.
            </dd>
          </div>
          <div
            className="review-stage"
            data-review-status={review.humanApproval.status}
          >
            <dt>Qualified human approval</dt>
            <dd>
              {review.humanApproval.status === 'pending'
                ? 'Pending. This explanation and its learning examples remain drafts.'
                : `${review.humanApproval.reviewer} · ${review.humanApproval.approvedAt}. Scope: ${review.humanApproval.scope}.`}
            </dd>
          </div>
        </dl>
        <p>
          {review.source.title} · {review.source.section} · PDF page{' '}
          {review.source.pdfPage} (printed page {review.source.printedPage}).
        </p>
        {review.assessmentObjectives.length > 0 ? (
          <>
            <ContextTerms
              termIds={['assessment-objective', 'assessment-scope']}
              terms={glossaryTerms}
            />
            <details className="source-details objective-disclosure">
              <summary>
                Official determination statements (
                {review.assessmentObjectives.length})
              </summary>
              <div className="source-content">
                <p>
                  Determine if the following statements are satisfied, using the
                  applicable guide’s assessment methods and scope. These are
                  attributed guide quotations; the three draft activities are
                  illustrative learning, not a complete assessment or evidence
                  checklist.
                </p>
                <ol className="objective-list">
                  {review.assessmentObjectives.map((objective) => (
                    <li key={objective.id}>
                      <code>{objective.id}</code>
                      <blockquote>{objective.text}</blockquote>
                      <span>
                        PDF page {objective.pdfPage} · printed page{' '}
                        {objective.printedPage}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          </>
        ) : (
          <p>
            Objective-by-objective teaching coverage has not been mapped for
            this entry. The AI comparison count is not a curriculum completion
            score.
          </p>
        )}
        <details className="source-details">
          <summary>Review notes &amp; unresolved questions</summary>
          <div className="source-content">
            <ul>
              {[...review.aiReview.notes, ...review.unresolvedQuestions].map(
                (note) => (
                  <li key={note}>{note}</li>
                ),
              )}
            </ul>
          </div>
        </details>
      </div>
    </details>
  )
}
