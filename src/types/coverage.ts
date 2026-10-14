import type { LessonIdentity, ExplanationMode } from './content'

/** Source wording, teaching coverage and approval are independent dimensions. */
export interface AssessmentStatement {
  readonly id: string
  readonly controlId: string
  readonly label: string
  readonly kind: 'determination' | 'organization-defined-parameter'
  readonly text: string
  readonly sourceId: string
  readonly pdfPage: number
  readonly printedPage: number
}

export type PerspectiveLocation =
  | 'beginner.meaning'
  | 'technical.focus'
  | 'technical.example'
  | 'technical.watchFor'
  | 'compliance.focus'

export interface TeachingMapping {
  readonly labels: readonly string[]
  readonly locations: readonly PerspectiveLocation[]
  /** Original supplementary explanation, never attributed as an official quote. */
  readonly explanation?: string
  readonly unresolvedQuestion?: string
  /** Optional selected practice example, not objective-wide exercise coverage. */
  readonly practiceStep?: {
    readonly activityId: string
    readonly stepId: string
  }
}

export interface ControlCoverageMapping {
  readonly controlId: string
  readonly perspectiveSha256: string
  readonly mappings: readonly TeachingMapping[]
}

export interface ObjectiveCoverage {
  readonly statement: AssessmentStatement
  readonly lesson: LessonIdentity
  readonly title: string
  readonly level?: string
  readonly sourceUrl: string
  readonly sourceTitle: string
  readonly sourceVersion: string
  readonly sourceSha256: string
  readonly sourceVerification: 'pinned-snapshot-verified'
  readonly coverage: 'explained-in-draft' | 'missing'
  readonly contentStatus: 'draft'
  readonly aiReview: 'compared' | 'unresolved'
  readonly reviewedAt: string
  readonly humanReview: 'pending'
  readonly excerpts: readonly {
    readonly location: PerspectiveLocation
    readonly text: string
    readonly mode: ExplanationMode
  }[]
  readonly explanation?: string
  readonly unresolvedQuestions: readonly string[]
  readonly practice?: { readonly title: string; readonly step: string }
}
