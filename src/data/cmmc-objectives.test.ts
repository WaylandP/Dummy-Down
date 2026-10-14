import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import snapshot from './cmmc-objectives.json'
import { referenceControls, cmmcSourceDocuments } from './cmmc-references'
import { levelOneReviews } from './level-one-review'

describe('complete pinned assessment-statement inventory', () => {
  it('rejects silent quote, label or citation changes to the PDF-verified snapshot', () => {
    expect(
      createHash('sha256')
        .update(JSON.stringify(snapshot.objectives))
        .digest('hex'),
    ).toBe('e75619510411e51be571b13270eba8883a6fb6821e49dc30aa19fdaa207f18d0')
  })
  it('preserves all 459 determinations and nine distinct ODP statements', () => {
    expect(snapshot.frameworkId).toBe('cmmc')
    expect(snapshot.editionId).toBe('cmmc-2-13-sep-2024')
    expect(snapshot.objectives).toHaveLength(468)
    expect(new Set(snapshot.objectives.map((row) => row.id)).size).toBe(468)
    for (const [level, determinations, parameters] of [
      [1, 59, 0],
      [2, 320, 0],
      [3, 80, 9],
    ]) {
      const rows = snapshot.objectives.filter((row) =>
        row.controlId.includes(`.L${level}-`),
      )
      expect(rows.filter((row) => row.kind === 'determination')).toHaveLength(
        determinations!,
      )
      expect(
        rows.filter((row) => row.kind === 'organization-defined-parameter'),
      ).toHaveLength(parameters!)
    }
    expect(
      snapshot.objectives.find((row) => row.id === 'RA.L3-3.11.2e[ODP4]'),
    ).toBeDefined()
    expect(
      snapshot.objectives.find((row) => row.id === 'RA.L3-3.11.2e[ODP1]'),
    ).toBeUndefined()
  })

  it('ties every complete statement to the correct control, source and PDF/printed page', () => {
    expect(
      [...new Set(snapshot.objectives.map((row) => row.controlId))].sort(),
    ).toEqual(referenceControls.map((control) => control.id).sort())
    for (const row of snapshot.objectives) {
      const control = referenceControls.find(
        (entry) => entry.id === row.controlId,
      )!
      expect(row.id).toBe(`${control.id}[${row.label}]`)
      expect(row.sourceId).toBe(control.requirement.sourceId)
      expect(row.pdfPage).toBe(control.requirement.pdfPage)
      expect(row.printedPage).toBe(control.requirement.printedPage)
      expect(row.text.trim().length).toBeGreaterThan(15)
      expect(row.text).not.toMatch(/ASSESSMENT|CMMC Assessment Guide|POTENTIAL/)
      expect(row.label).toMatch(
        row.kind === 'determination' ? /^[a-z]$/ : /^ODP\d+$/,
      )
    }
    for (const [id, sha] of Object.entries(snapshot.sourceSha256)) {
      expect(sha).toBe(
        cmmcSourceDocuments.find((source) => source.id === id)?.sha256,
      )
    }
  })

  it('retains the existing thirteen attributed quotations exactly', () => {
    for (const review of levelOneReviews)
      for (const previous of review.assessmentObjectives) {
        const imported = snapshot.objectives.find(
          (row) => row.id === previous.id,
        )
        expect(imported).toMatchObject(previous)
      }
  })
})
