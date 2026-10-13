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
  /** Levels represented by the available content, if this framework has levels. */
  readonly levels: readonly string[]
  readonly sourceUrl: string
}

/** An editorial lesson address, separate from an official control identifier. */
export interface LessonIdentity {
  readonly frameworkId: string
  readonly editionId: string
  readonly controlKey: string
}

/** Version identity distinguishes project drafts from publication snapshots. */
export interface ContentEdition {
  readonly id: string
  readonly frameworkId: string
  readonly title: string
  readonly versionContext: string
  readonly kind?: 'project' | 'publication'
}

export interface SourceReference {
  readonly id: string
  readonly title: string
  readonly url: string
  readonly versionContext: string
  readonly kind:
    'project-readme' | 'official-publication' | 'official-resource-index'
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
  /** Official display/search identifier; never used as the editorial URL key. */
  readonly id: string
  readonly key: string
  readonly frameworkId: string
  readonly editionId: string
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
  readonly glossaryTermIds: readonly string[]
}

/** A versioned public source document; acquisition metadata is not an endorsement. */
export interface SourceDocument {
  readonly id: string
  readonly title: string
  readonly url: string
  readonly mirrorUrl: string
  readonly version: string
  readonly published: string
  readonly documentId: string
  readonly sha256: string
  readonly publicationNotice: string
  readonly retrievedDate: string
  readonly acquisitionNote: string
  readonly extractionNote: string
}

/** Page numbers belong to a quotation, not to the document's version identity. */
export interface SourceDocumentCitation extends SourceDocument {
  readonly pdfPage: number
  readonly printedPage: number
}

export interface RequirementQuote {
  readonly text: string
  readonly sourceId: string
  readonly pdfPage: number
  readonly printedPage: number
}

/** Publication quotations remain distinct from original teaching explanations. */
export interface ReferenceControl extends Omit<
  Control,
  | 'explanations'
  | 'concept'
  | 'contentKind'
  | 'reviewStatus'
  | 'glossaryTermIds'
> {
  readonly contentKind: 'official-reference'
  readonly reviewStatus: 'unreviewed-import'
  readonly requirement: RequirementQuote
  readonly modelRequirement: RequirementQuote & {
    readonly differsFromGuide: boolean
  }
  readonly sourceDocuments: readonly SourceDocumentCitation[]
}

export type CatalogControl = Control | ReferenceControl

/** A plain-language teaching draft, not an official regulatory definition. */
export interface GlossaryTerm {
  readonly id: string
  readonly title: string
  readonly definition: string
  readonly reviewStatus: 'draft'
  readonly versionContext: string
  readonly sources: readonly SourceReference[]
}
