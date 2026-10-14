import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import levelThree from '../../docs/content-review/level-3-editorial-audit-2026-10-14.json'
import levelTwoA from '../../docs/content-review/level-2-a-editorial-audit-2026-10-14.json'
import levelTwoB from '../../docs/content-review/level-2-b-editorial-audit-2026-10-14.json'
import catalog from './cmmc-213-catalog.json'
import inventory from './cmmc-objectives.json'
import { cmmcPerspectiveDrafts } from './cmmc-perspectives'

const digest = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value), 'utf8').digest('hex')

function textFields(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return [prefix]
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      textFields(item, `${prefix}[${index}]`),
    )
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      textFields(item, prefix ? `${prefix}.${key}` : key),
    )
  }
  return []
}

describe('full-field editorial audit bindings', () => {
  const batches = [levelTwoA, levelTwoB, levelThree]
  const records = batches.flatMap((batch) => batch.records)

  it('accounts for each control in the completed review scope exactly once', () => {
    const expected = catalog.controls.filter(
      (control) => control.level === 2 || control.level === 3,
    )
    expect(records).toHaveLength(134)
    expect(records.map((record) => record.id).sort()).toEqual(
      expected.map((control) => control.id).sort(),
    )
  })

  it.each(records)(
    'invalidates the full review when $id teaching or statements change',
    (record) => {
      const draft = cmmcPerspectiveDrafts.find((item) => item.id === record.id)!
      expect(draft).toBeDefined()
      expect(
        digest(draft),
        'Compare changed text; never just refresh the hash.',
      ).toBe(record.reviewedFingerprint)
      expect(record.reviewedFields.slice().sort()).toEqual(
        textFields(draft)
          .filter((field) => field !== 'id')
          .sort(),
      )
      const statements = inventory.objectives.filter(
        (row) => row.controlId === record.id,
      )
      expect(digest(statements)).toBe(record.objectiveFingerprint)
      expect(record.objectiveLabels).toEqual(statements.map((row) => row.label))
      const control = catalog.controls.find((item) => item.id === record.id)!
      expect(record.sourceId).toBe(control.sourceId)
      expect(record.sourcePdfPage).toBe(control.sourcePdfPage)
      expect(record.printedPage).toBe(control.sourcePrintedPage)
      const guideControls = catalog.controls.filter(
        (item) => item.sourceId === control.sourceId,
      )
      const nextControl = guideControls[guideControls.indexOf(control) + 1]
      // Last requirement sections end before each guide's appendix.
      const finalBodyPage = control.level === 2 ? 271 : 86
      expect(record.reviewedGuidePdfPages).toEqual([
        control.sourcePdfPage,
        nextControl ? nextControl.sourcePdfPage - 1 : finalBodyPage,
      ])
      expect(record.inputFingerprint).toMatch(/^[a-f0-9]{64}$/)
      expect(record.humanReview).toBe('pending')
      expect(record.reviewNote.length).toBeGreaterThan(0)
      if (record.findings.length === 0) {
        expect(record.reviewedFingerprint).toBe(record.inputFingerprint)
        expect(record.disposition).toBe('no-factual-correction-identified')
      } else {
        expect(record.reviewedFingerprint).not.toBe(record.inputFingerprint)
        for (const finding of record.findings) {
          expect(finding.sourceSupport.length).toBeGreaterThan(0)
          expect(finding.resolution.length).toBeGreaterThan(0)
          const actual = finding.field
            .replace(/\[(\d+)\]/g, '.$1')
            .split('.')
            .reduce<unknown>(
              (value, key) => (value as Record<string, unknown>)[key],
              draft,
            )
          expect(actual).toBe(finding.proposedText)
        }
      }
    },
  )

  it('keeps source edition, AI scope and human status distinct', () => {
    for (const batch of batches) {
      expect(batch.frameworkId).toBe(inventory.frameworkId)
      expect(batch.editionId).toBe(inventory.editionId)
      expect(batch.reviewedAt).toBe('2026-10-14')
      expect(batch.reviewer).toContain('AI-assisted')
      expect(batch.finalDeltaReview.reviewer).toContain('AI-assisted')
      expect(batch.finalDeltaReview.reviewedAt).toBe(batch.reviewedAt)
      expect(batch.finalDeltaReview.result).toBe('no-content-issues-identified')
      expect(batch.finalDeltaReview.humanReview).toBe('pending')
      expect(batch.sourcePdfSha256).toBe(
        catalog.sources.find((source) => source.id === batch.sourceId)?.sha256,
      )
      expect(batch.scope.controls).toBe(batch.records.length)
      for (const record of batch.records) {
        expect(record.sourceId).toBe(batch.sourceId)
      }
      expect(batch.scope.perspectives).toBe(batch.records.length * 3)
      const labels = batch.records.flatMap((record) => record.objectiveLabels)
      expect(batch.scope.determinations).toBe(
        labels.filter((label) => !label.startsWith('ODP')).length,
      )
      expect(batch.scope.organizationDefinedParameters).toBe(
        labels.filter((label) => label.startsWith('ODP')).length,
      )
      expect(batch.limitations.join(' ')).toContain(
        'not qualified human approval',
      )
      expect(batch.limitations.join(' ')).toContain('Current applicability')
    }
  })
})
