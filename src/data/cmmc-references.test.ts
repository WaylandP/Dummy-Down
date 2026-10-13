import { describe, expect, it } from 'vitest'
import snapshot from './cmmc-213-catalog.json'
import { cmmcSourceDocuments, referenceControls } from './cmmc-references'
import { controls, editions, explorerCatalog, frameworks } from './content'

describe('CMMC September 2024 v2.13 source-reference snapshot', () => {
  it('contains 149 unique level-specific identifiers with the documented 15/110/24 inventory', () => {
    expect(referenceControls).toHaveLength(149)
    expect(new Set(referenceControls.map((entry) => entry.id)).size).toBe(149)
    expect(
      ['Level 1', 'Level 2', 'Level 3'].map(
        (level) =>
          referenceControls.filter((entry) => entry.level === level).length,
      ),
    ).toEqual([15, 110, 24])
    expect(
      referenceControls.find((entry) => entry.id === 'AC.L1-b.1.i'),
    ).toBeDefined()
    expect(
      referenceControls.find((entry) => entry.id === 'AC.L2-3.1.1'),
    ).toBeDefined()
    expect(
      referenceControls.find((entry) => entry.id === 'AC.L3-3.1.2e'),
    ).toBeDefined()
  })

  it('preserves guide and model quotations independently with exact page attribution', () => {
    for (const raw of snapshot.controls) {
      const reference = referenceControls.find((entry) => entry.id === raw.id)
      expect(reference?.requirement).toEqual({
        text: raw.officialRequirement,
        sourceId: raw.sourceId,
        pdfPage: raw.sourcePdfPage,
        printedPage: raw.sourcePrintedPage,
      })
      expect(reference?.modelRequirement).toEqual({
        text: raw.modelStatement,
        sourceId: raw.modelSourceId,
        pdfPage: raw.modelSourcePdfPage,
        printedPage: raw.modelSourcePrintedPage,
        differsFromGuide: raw.modelStatement !== raw.officialRequirement,
      })
      expect(reference?.title).toBe(raw.title)
      expect(reference?.familyName).toBe(raw.familyName)
      expect(reference?.sourceDocuments.map((source) => source.id)).toEqual([
        raw.sourceId,
        raw.modelSourceId,
      ])
      for (const quote of [
        reference!.requirement,
        reference!.modelRequirement,
      ]) {
        const source = reference!.sourceDocuments.find(
          (document) => document.id === quote.sourceId,
        )
        expect(source?.pdfPage).toBe(quote.pdfPage)
        expect(source?.printedPage).toBe(quote.printedPage)
        expect(quote.pdfPage).toBeGreaterThan(0)
        expect(quote.printedPage).toBeGreaterThan(0)
      }
    }
  })

  it('preserves the ten real publication wording differences instead of merging their text', () => {
    const differing = referenceControls.filter(
      (entry) => entry.modelRequirement.differsFromGuide,
    )
    expect(differing).toHaveLength(10)
    expect(differing.map((entry) => entry.id).sort()).toEqual(
      snapshot.modelGuideWordingDifferences.map((entry) => entry.id).sort(),
    )
    const training = differing.find((entry) => entry.id === 'AT.L2-3.2.2')!
    expect(training.requirement.text).toBe(
      'Ensure that personnel are trained to carry out their assigned information security-related duties and responsibilities.',
    )
    expect(training.modelRequirement.text).toBe(
      'Train personnel to carry out their assigned information security-related duties and responsibilities.',
    )
  })

  it('retains Level 3 DoD parameter values in the source quotations', () => {
    const quote = (id: string) =>
      referenceControls.find((entry) => entry.id === id)!.requirement.text
    expect(quote('IR.L3-3.6.1e')).toContain('operates 24/7')
    expect(quote('IR.L3-3.6.2e')).toContain('within 24 hours')
    expect(quote('AT.L3-3.2.1e')).toContain('at least annually')
    expect(quote('RA.L3-3.11.7e')).toContain(
      'update the plan at least annually',
    )
  })

  it('keeps publication references and the existing teaching draft as different edition tuples', () => {
    expect(controls).toHaveLength(1)
    expect(controls[0]?.contentKind).toBe('educational-example')
    expect(controls[0]?.editionId).toBe('readme-example')
    expect(explorerCatalog.controls).toHaveLength(150)
    expect(
      new Set(
        explorerCatalog.controls.map(
          (entry) => `${entry.frameworkId}/${entry.editionId}/${entry.key}`,
        ),
      ).size,
    ).toBe(150)
    for (const reference of referenceControls) {
      expect(reference.key).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(reference.contentKind).toBe('official-reference')
      expect(reference.reviewStatus).toBe('unreviewed-import')
      expect(reference).not.toHaveProperty('explanations')
      expect(reference).not.toHaveProperty('concept')
      expect(reference).not.toHaveProperty('glossaryTermIds')
      expect(
        editions.find((entry) => entry.id === reference.editionId)?.kind,
      ).toBe('publication')
    }
    expect(
      frameworks.find((framework) => framework.id === 'cmmc')?.levels,
    ).toEqual(['Level 1', 'Level 2', 'Level 3'])
  })

  it('exposes pinned public-mirror provenance without claiming latest-edition verification', () => {
    expect(cmmcSourceDocuments).toHaveLength(4)
    expect(
      new Set(cmmcSourceDocuments.map((source) => source.documentId)).size,
    ).toBe(4)
    for (const source of cmmcSourceDocuments) {
      const original = new URL(source.url)
      const mirror = new URL(source.mirrorUrl)
      expect(original.protocol).toBe('https:')
      expect(original.hostname).toBe('dodcio.defense.gov')
      expect(mirror.protocol).toBe('https:')
      expect(mirror.hostname).toBe('raw.githubusercontent.com')
      expect(mirror.pathname).toContain(
        '/0ab5953a68d5bf7383b9b021839274aed42209f3/',
      )
      expect(source.sha256).toMatch(/^[a-f0-9]{64}$/)
      expect(source.version).toBe('2.13')
      expect(source.published).toBe('2024-09')
      expect(source.acquisitionNote).toContain(
        'not independent verification of the latest',
      )
      expect(source.extractionNote).not.toBe('')
    }
    for (const reference of referenceControls) {
      for (const source of reference.sources) {
        expect(source.kind).toBe('official-publication')
        expect(new URL(source.url).hash).toMatch(/^#page=\d+$/)
      }
    }
  })
})
