import { describe, expect, it } from 'vitest'
import { referenceControls } from './content'
import inventory from './cmmc-assessment-methods.json'
import { assessmentMethodsFor } from './cmmc-assessment-methods'

const pinned = referenceControls.filter(
  (control) =>
    control.frameworkId === 'cmmc' &&
    control.editionId === 'cmmc-2-13-sep-2024',
)

describe('The assessment methods inventory', () => {
  it('holds one entry per control of the pinned edition, on that control’s guide page', () => {
    expect(inventory.methods).toHaveLength(149)
    expect(inventory.methods.map((entry) => entry.controlId).sort()).toEqual(
      pinned.map((control) => control.id).sort(),
    )
    for (const control of pinned) {
      const entry = assessmentMethodsFor(control)!
      expect(entry.sourceId).toBe(control.requirement.sourceId)
      // Every block starts on the page the catalog cites for the requirement.
      expect(entry.pdfPage).toBe(control.requirement.pdfPage)
      expect(entry.printedPage).toBe(control.requirement.printedPage)
      for (const list of [entry.examine, entry.interview, entry.test]) {
        expect(list.length).toBeGreaterThan(0)
        for (const item of list) {
          expect(item).toBe(item.trim())
          expect(item).not.toMatch(
            /CMMC Assessment Guide|NIST SP 800-171A, p\./,
          )
          expect(item).not.toMatch(/ \d{1,3}$/)
        }
      }
    }
  })

  it('pins the three guides by digest', () => {
    expect(inventory.sourceSha256).toEqual({
      'cmmc-assessment-l1-213':
        '88116fa807b3685703f08c1992580ad0cfbc22ad2bcf76f99378fadf964f7368',
      'cmmc-assessment-l2-213':
        '0dcaba1626a0d23893981d74dd3f0f2338fff54cece67d81bc811ce76392d867',
      'cmmc-assessment-l3-213':
        '6601eb20e8f1490b49c4addd83505eb269062abb3c2bae9b5256449187048ef3',
    })
  })

  it('returns nothing for another edition', () => {
    expect(
      assessmentMethodsFor({
        frameworkId: 'cmmc',
        editionId: 'readme-example',
        id: 'AC.L1-b.1.i',
      }),
    ).toBeNull()
  })

  it('keeps the Level 2 guide’s AC.L2-3.1.7 Examine list as printed, though it reads as 3.1.9’s', () => {
    const entry = assessmentMethodsFor(
      pinned.find((control) => control.id === 'AC.L2-3.1.7')!,
    )!
    expect(entry.examine[0]).toBe(
      'Privacy and security policies, procedures addressing system use notification',
    )
    expect(entry.interview[0]).toBe(
      'Personnel with responsibilities for defining least privileges necessary to accomplish specified tasks',
    )
    expect(entry.printedPage).toBe(29)
  })

  it('keeps the mockup control’s three lists as the guide prints them', () => {
    const entry = assessmentMethodsFor(
      pinned.find((control) => control.id === 'AC.L2-3.1.1')!,
    )!
    expect(entry.examine[0]).toBe('Access control policy')
    expect(entry.examine.at(-1)).toBe('other relevant documents or records')
    expect(entry.interview).toEqual([
      'Personnel with account management responsibilities',
      'system or network administrators',
      'personnel with information security responsibilities',
    ])
    expect(entry.test).toEqual([
      'Organizational processes for managing system accounts',
      'mechanisms for implementing account management',
    ])
    expect(entry.printedPage).toBe(14)
  })
})
