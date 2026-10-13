import type {
  ReferenceControl,
  SourceDocument,
  SourceDocumentCitation,
  SourceReference,
} from '../types/content'
import snapshot from './cmmc-213-catalog.json'

export const cmmcSourceDocuments: readonly SourceDocument[] = [
  snapshot.modelSource,
  ...snapshot.sources,
].map((document) => ({
  id: document.id,
  title: document.title,
  url: document.officialUrl,
  mirrorUrl: document.retrievedFrom,
  version: document.version,
  published: document.publicationDate,
  documentId: document.documentId,
  sha256: document.sha256,
  publicationNotice: document.publicationNotice,
  retrievedDate: document.retrievedDate,
  acquisitionNote: document.acquisitionNote,
  extractionNote: document.extractionNote,
}))

function citeDocument(
  id: string,
  pdfPage: number,
  printedPage: number,
): SourceDocumentCitation {
  const document = cmmcSourceDocuments.find((source) => source.id === id)
  if (!document)
    throw new Error(`Unknown source document in CMMC snapshot: ${id}`)
  return { ...document, pdfPage, printedPage }
}

function sourceReference(document: SourceDocumentCitation): SourceReference {
  return {
    id: `${document.id}-page-${document.pdfPage}`,
    title: document.title,
    url: `${document.url}#page=${document.pdfPage}`,
    kind: 'official-publication',
    versionContext:
      `Version ${document.version} · September 2024; PDF page ${document.pdfPage} ` +
      `(printed page ${document.printedPage}). Quoted from a pinned public PDF mirror; ` +
      'the latest DoD edition has not been independently verified.',
  }
}

/**
 * Complete identifier inventory for the inspected v2.13 publication snapshot.
 * These are attributed quotations, not reviewed lessons or assessment verdicts.
 */
export const referenceControls: readonly ReferenceControl[] =
  snapshot.controls.map((record) => {
    const guide = citeDocument(
      record.sourceId,
      record.sourcePdfPage,
      record.sourcePrintedPage,
    )
    const model = citeDocument(
      record.modelSourceId,
      record.modelSourcePdfPage,
      record.modelSourcePrintedPage,
    )

    return {
      id: record.id,
      key: record.id.toLocaleLowerCase('en-US').replace(/[^a-z0-9]+/g, '-'),
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      title: record.title,
      family: record.family,
      familyName: record.familyName,
      level: `Level ${record.level}`,
      contentKind: 'official-reference',
      reviewStatus: 'unreviewed-import',
      versionContext:
        'CMMC model and assessment guides, version 2.13, September 2024. ' +
        'Versioned source snapshot acquired from pinned public PDF mirrors; ' +
        'the latest edition and present contract applicability have not been independently verified.',
      disclaimer:
        'Attributed source reference with separate educational teaching drafts; qualified editorial review is pending. ' +
        'A quoted requirement is not the complete assessment guidance, evidence checklist, or a guarantee of compliance. ' +
        'Consult the applicable official publications and assessment scope.',
      tags: [record.familyName, `Level ${record.level}`, 'CMMC 2.13'],
      requirement: {
        text: record.officialRequirement,
        sourceId: record.sourceId,
        pdfPage: record.sourcePdfPage,
        printedPage: record.sourcePrintedPage,
      },
      modelRequirement: {
        text: record.modelStatement,
        sourceId: record.modelSourceId,
        pdfPage: record.modelSourcePdfPage,
        printedPage: record.modelSourcePrintedPage,
        differsFromGuide: record.modelStatement !== record.officialRequirement,
      },
      sourceDocuments: [guide, model],
      sources: [sourceReference(guide), sourceReference(model)],
    }
  })
