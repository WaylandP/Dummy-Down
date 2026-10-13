/** A learning preference, independent of the framework being explained. */
export type ExplanationMode = 'beginner' | 'it-cyber' | 'compliance'

export interface ExplanationModeInfo {
  readonly id: ExplanationMode
  readonly label: string
  readonly shortLabel: string
  readonly description: string
}

export interface Framework {
  /** Stable internal key; identifiers and levels are not assumed to be CMMC-shaped. */
  readonly id: string
  readonly name: string
  readonly shortName: string
  readonly description: string
  readonly status: 'preview' | 'planned'
  /** Levels represented by the available sample content, if this framework has levels. */
  readonly levels: readonly string[]
  readonly sourceUrl: string
}

export interface SourceReference {
  readonly id: string
  readonly title: string
  readonly url: string
  readonly versionContext: string
  readonly kind: 'project-readme' | 'official-publication'
}

export interface Explanation {
  readonly heading: string
  readonly summary: string
  readonly exampleTitle: string
  readonly examples: readonly string[]
  readonly takeaway: string
}

/**
 * Editorial learning content. This is deliberately separate from official text:
 * an explanation must never be treated as the requirement or a compliance verdict.
 */
export interface Control {
  readonly id: string
  readonly frameworkId: string
  readonly title: string
  readonly family: string
  readonly familyName: string
  readonly level?: string
  readonly concept: string
  readonly reviewStatus: 'draft'
  readonly contentKind: 'educational-example'
  readonly versionContext: string
  readonly disclaimer: string
  readonly tags: readonly string[]
  readonly explanations: Readonly<Record<ExplanationMode, Explanation>>
  readonly sources: readonly SourceReference[]
}
