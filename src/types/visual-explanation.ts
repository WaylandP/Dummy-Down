import type { LessonIdentity, SourceReference } from './content'

export type VisualScene = 'access-gate' | 'factor-proof' | 'response-team'
export type VisualStageKind = 'requirement' | 'meaning' | 'example' | 'takeaway'

export interface VisualStage {
  readonly kind: VisualStageKind
  readonly title: string
  readonly text: string
  /** Describes everything instructional in the visual without relying on motion. */
  readonly diagramDescription: string
}

/** An authored teaching interpretation; it never alters the source quotation. */
export interface VisualExplanationContent {
  readonly id: string
  readonly lesson: LessonIdentity
  readonly title: string
  readonly scene: VisualScene
  readonly reviewStatus: 'draft'
  readonly humanReview: 'pending'
  readonly stageDurationMs: number
  readonly stages: readonly [VisualStage, VisualStage, VisualStage, VisualStage]
  readonly source: SourceReference
  readonly sourceLabel: string
  readonly disclaimer: string
}
