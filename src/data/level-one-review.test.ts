import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import baseline from '../../docs/content-review/level-1-review-baseline.json'
import perspectiveRecords from './perspectives/level-1-3.json'
import { referenceControls } from './cmmc-references'
import { getLevelOneReview, levelOneReviews } from './level-one-review'

// Matches the dated audit's canonical JSON without making formatting a content edit.
function sortedJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortedJson)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, item]) => [key, sortedJson(item)]),
    )
  }
  return value
}

describe('versioned Level 1 editorial review context', () => {
  it('binds the dated audit to the exact edition, source and complete control inventory', () => {
    expect(baseline.frameworkId).toBe('cmmc')
    expect(baseline.editionId).toBe('cmmc-2-13-sep-2024')
    expect(
      baseline.controls.map((entry) => entry.requirementId).sort(),
    ).toEqual(levelOneReviews.map((review) => review.requirementId).sort())
    for (const review of levelOneReviews) {
      expect(review.source.sourceId).toBe(baseline.sourceId)
      expect(review.source.sha256).toBe(baseline.sourceSha256)
      expect(review.aiReview.reviewedAt).toBe(baseline.reviewedAt)
    }
  })

  it.each(baseline.controls)(
    'requires a new editorial comparison when $requirementId perspectives change',
    ({ requirementId, sha256 }) => {
      const matching = perspectiveRecords.filter(
        (record) => record.id === requirementId,
      )
      expect(matching).toHaveLength(1)
      const actual = createHash('sha256')
        .update(JSON.stringify(sortedJson(matching[0])), 'utf8')
        .digest('hex')
      expect(
        actual,
        'Re-review changed text; do not merely refresh its hash.',
      ).toBe(sha256)
    },
  )

  it('covers exactly the 15 Level 1 source identifiers without borrowing other levels', () => {
    const levelOne = referenceControls.filter(
      (control) => control.level === 'Level 1',
    )
    expect(levelOneReviews).toHaveLength(15)
    expect(
      new Set(levelOneReviews.map((review) => review.requirementId)).size,
    ).toBe(15)
    expect(
      levelOneReviews.map((review) => review.requirementId).sort(),
    ).toEqual(levelOne.map((control) => control.id).sort())
    for (const control of referenceControls) {
      const review = getLevelOneReview(control)
      if (control.level === 'Level 1') {
        expect(review?.controlKey).toBe(control.key)
        expect(review?.requirementId).toBe(control.id)
      } else expect(review).toBeUndefined()
    }
  })

  it.each([
    {
      frameworkId: 'other-framework',
      editionId: 'cmmc-2-13-sep-2024',
      id: 'AC.L1-b.1.i',
    },
    {
      frameworkId: 'cmmc',
      editionId: 'readme-example',
      id: 'AC.L1-b.1.i',
    },
    {
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      id: 'not-a-requirement',
    },
    {
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      id: 'AC.L1-B.1.I',
    },
  ])(
    'rejects a different identity rather than inheriting approval: %o',
    (id) => {
      expect(getLevelOneReview(id)).toBeUndefined()
    },
  )

  it('attributes each comparison to the pinned guide and exact requirement pages', () => {
    for (const review of levelOneReviews) {
      const control = referenceControls.find(
        (entry) => entry.id === review.requirementId,
      )!
      expect(review.frameworkId).toBe(control.frameworkId)
      expect(review.editionId).toBe(control.editionId)
      expect(review.source.sourceId).toBe(control.requirement.sourceId)
      expect(review.source.section).toBe(control.id)
      expect(review.source.pdfPage).toBe(control.requirement.pdfPage)
      expect(review.source.printedPage).toBe(control.requirement.printedPage)
      expect(review.source).toMatchObject({
        title: 'CMMC Assessment Guide – Level 1',
        version: '2.13',
        published: '2024-09',
        documentId: 'DoD-CIO-00002',
        sha256:
          '88116fa807b3685703f08c1992580ad0cfbc22ad2bcf76f99378fadf964f7368',
        url: 'https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL1v2.pdf',
      })
      expect(new URL(review.source.mirrorUrl).protocol).toBe('https:')
      expect(review.source.mirrorUrl).toContain(
        '0ab5953a68d5bf7383b9b021839274aed42209f3',
      )
    }
  })

  it('separates all 59 compared statements from the 13 imported objective quotations', () => {
    expect(
      levelOneReviews.reduce(
        (total, review) => total + review.aiReview.objectiveComparisonCount,
        0,
      ),
    ).toBe(59)
    expect(
      levelOneReviews.reduce(
        (total, review) => total + review.assessmentObjectives.length,
        0,
      ),
    ).toBe(13)
    const quoted = levelOneReviews.filter(
      (review) => review.assessmentObjectives.length > 0,
    )
    expect(quoted.map((review) => review.requirementId)).toEqual([
      'AC.L1-b.1.i',
      'AC.L1-b.1.iv',
      'MP.L1-b.1.vii',
    ])
    for (const review of levelOneReviews) {
      expect(review.aiReview.objectiveComparisonCount).toBeGreaterThan(0)
      expect(review.educationalObjectiveCoverage).toBe(
        review.assessmentObjectives.length > 0
          ? 'draft-three-lesson-scope'
          : 'not-mapped',
      )
      expect(review.assessmentObjectives.length).toBeLessThanOrEqual(
        review.aiReview.objectiveComparisonCount,
      )
    }
  })

  it('preserves all selected guide labels, attribution and disposal/reuse distinction', () => {
    const expected = [
      ['AC.L1-b.1.i', ['a', 'b', 'c', 'd', 'e', 'f'], 16, 12],
      ['AC.L1-b.1.iv', ['a', 'b', 'c', 'd', 'e'], 24, 20],
      ['MP.L1-b.1.vii', ['a', 'b'], 31, 27],
    ] as const
    for (const [id, labels, pdfPage, printedPage] of expected) {
      const review = getLevelOneReview({
        frameworkId: 'cmmc',
        editionId: 'cmmc-2-13-sep-2024',
        id,
      })!
      expect(
        review.assessmentObjectives.map((objective) => objective.label),
      ).toEqual(labels)
      for (const objective of review.assessmentObjectives) {
        expect(objective.id).toBe(`${id}[${objective.label}]`)
        expect(objective.sourceId).toBe('cmmc-assessment-l1-213')
        expect(objective.pdfPage).toBe(pdfPage)
        expect(objective.printedPage).toBe(printedPage)
        expect(objective.text).not.toContain('CUI')
      }
    }
    const media = getLevelOneReview({
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      id: 'MP.L1-b.1.vii',
    })!
    expect(
      media.assessmentObjectives.map((objective) => objective.text),
    ).toEqual([
      'system media containing [FCI] is sanitized or destroyed before disposal; and',
      'system media containing [FCI] is sanitized before it is released for reuse.',
    ])
  })

  it('keeps source verification, agent review and pending human approval distinct', () => {
    for (const review of levelOneReviews) {
      expect(review.sourceVerification.status).toBe('pinned-snapshot-verified')
      expect(review.sourceVerification.checkedAt).toBe('2026-10-14')
      expect(review.aiReview.status).toBe('ai-assisted-reviewed')
      expect(review.aiReview.reviewedAt).toBe('2026-10-14')
      expect(review.humanApproval).toEqual({ status: 'pending' })
      expect(review.aiReview.notes.join(' ')).toContain(
        'not qualified human approval',
      )
      expect(review.unresolvedQuestions.join(' ')).toContain('CONNECT 403')
      expect(review.unresolvedQuestions.join(' ')).toContain('applicability')
    }
  })
})
