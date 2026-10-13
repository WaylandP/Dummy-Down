import type { SourceDocument } from './content'

/** Attribution for a determination statement quoted from an identified guide. */
export interface AssessmentObjectiveQuote {
  /** Project display key combining the requirement and the guide's letter label. */
  readonly id: string
  readonly label: string
  readonly text: string
  readonly sourceId: string
  readonly pdfPage: number
  readonly printedPage: number
}

/** A real qualified approval needs attribution, date and an explicit scope. */
export type HumanEditorialApproval =
  | { readonly status: 'pending' }
  | {
      readonly status: 'approved'
      readonly reviewer: string
      readonly qualifications: string
      readonly approvedAt: string
      readonly scope: string
      readonly notes: readonly string[]
    }

/** Source comparison, agent review and human approval must remain separate. */
export interface ControlEditorialReview {
  readonly frameworkId: string
  readonly editionId: string
  readonly controlKey: string
  readonly requirementId: string
  readonly source: Pick<
    SourceDocument,
    | 'title'
    | 'version'
    | 'published'
    | 'documentId'
    | 'sha256'
    | 'url'
    | 'mirrorUrl'
  > & {
    readonly sourceId: string
    readonly section: string
    readonly pdfPage: number
    readonly printedPage: number
  }
  readonly sourceVerification: {
    readonly status: 'pinned-snapshot-verified'
    readonly checkedAt: string
    readonly method: string
  }
  readonly aiReview: {
    readonly status: 'ai-assisted-reviewed'
    readonly reviewedAt: string
    /** Statements compared with prose, not statements taught by a complete course. */
    readonly objectiveComparisonCount: number
    readonly notes: readonly string[]
  }
  readonly humanApproval: HumanEditorialApproval
  readonly assessmentObjectives: readonly AssessmentObjectiveQuote[]
  /** Quotation context for three drafts is not the complete Level 1 curriculum. */
  readonly educationalObjectiveCoverage:
    'draft-three-lesson-scope' | 'not-mapped'
  readonly unresolvedQuestions: readonly string[]
}
