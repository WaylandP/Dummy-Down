/** Original teaching drafts, separate from attributed publication quotations. */
export interface ControlPerspectiveDraft {
  readonly id: string
  readonly beginner: {
    readonly meaning: string
    readonly example: string
  }
  readonly technical: {
    readonly focus: string
    readonly example: string
    readonly watchFor: string
  }
  readonly compliance: {
    readonly focus: string
    readonly reviewQuestions: readonly string[]
    readonly evidenceExamples: readonly string[]
  }
}
