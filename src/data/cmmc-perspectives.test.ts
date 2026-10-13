import { describe, expect, it } from 'vitest'
import { cmmcPerspectiveDrafts, findCmmcPerspective } from './cmmc-perspectives'
import { referenceControls } from './cmmc-references'

describe('CMMC teaching coverage and edition binding', () => {
  it('provides one distinct three-perspective draft for every source control in all three levels', () => {
    expect(cmmcPerspectiveDrafts).toHaveLength(149)
    expect(new Set(cmmcPerspectiveDrafts.map((draft) => draft.id)).size).toBe(
      149,
    )
    expect(cmmcPerspectiveDrafts.map((draft) => draft.id).sort()).toEqual(
      referenceControls.map((control) => control.id).sort(),
    )
    for (const control of referenceControls) {
      const draft = findCmmcPerspective(control)
      expect(draft?.id).toBe(control.id)
      expect(control.requirement.text).not.toBe(draft?.beginner.meaning)
      expect(draft?.compliance.reviewQuestions).toHaveLength(2)
      expect(draft?.compliance.evidenceExamples).toHaveLength(2)
    }
    for (const select of [
      (draft: (typeof cmmcPerspectiveDrafts)[number]) => draft.beginner.meaning,
      (draft: (typeof cmmcPerspectiveDrafts)[number]) => draft.technical.focus,
      (draft: (typeof cmmcPerspectiveDrafts)[number]) => draft.compliance.focus,
    ]) {
      expect(new Set(cmmcPerspectiveDrafts.map(select)).size).toBe(149)
    }
  })

  it('does not borrow teaching from the same display ID in another framework or edition', () => {
    expect(
      findCmmcPerspective({
        frameworkId: 'cmmc',
        editionId: 'readme-example',
        id: 'AC.L2-3.1.1',
      }),
    ).toBeUndefined()
    expect(
      findCmmcPerspective({
        frameworkId: 'other-framework',
        editionId: 'cmmc-2-13-sep-2024',
        id: 'AC.L2-3.1.1',
      }),
    ).toBeUndefined()
    expect(
      findCmmcPerspective({
        frameworkId: 'cmmc',
        editionId: 'cmmc-2-13-sep-2024',
        id: 'missing',
      }),
    ).toBeUndefined()
  })

  it('retains important guide-discussion distinctions identified during the editorial audit', () => {
    const text = (id: string) =>
      JSON.stringify(cmmcPerspectiveDrafts.find((draft) => draft.id === id))
    expect(text('IR.L3-3.6.1e')).toContain('24/7')
    expect(text('IR.L3-3.6.2e')).toMatch(/24 hours|24-hour/)
    expect(text('CA.L2-3.12.4')).toContain('at least annually')
    expect(text('CA.L2-3.12.2')).toContain('180-day')
    expect(text('RA.L3-3.11.1e')).toMatch(/more than one|multiple/)
    expect(text('SC.L3-3.13.4e')).toMatch(/remote access/)
  })
})
