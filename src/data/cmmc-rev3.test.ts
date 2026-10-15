import { describe, expect, it } from 'vitest'
import { referenceControls } from './content'
import inventory from './cmmc-rev3-map.json'
import { rev3For, rev3Source } from './cmmc-rev3'

const levelTwo = referenceControls.filter(
  (control) =>
    control.frameworkId === 'cmmc' &&
    control.editionId === 'cmmc-2-13-sep-2024' &&
    control.level === 'Level 2',
)

describe('The Rev. 3 map', () => {
  it('covers every Level 2 control once and nothing else', () => {
    expect(levelTwo).toHaveLength(110)
    expect(inventory.requirements.map((row) => row.controlId).sort()).toEqual(
      levelTwo.map((control) => control.id).sort(),
    )
    expect(
      rev3For(referenceControls.find((item) => item.id === 'AC.L1-b.1.i')!),
    ).toBeNull()
    expect(
      rev3For({
        frameworkId: 'cmmc',
        editionId: 'readme-example',
        id: 'AC.L2-3.1.1',
      }),
    ).toBeNull()
  })

  it('pins Rev. 3 by official address and digest', () => {
    expect(rev3Source.officialUrl).toBe(
      'https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-171r3.pdf',
    )
    expect(rev3Source.sha256).toBe(
      '3e4631df8b5d61f40a6e542b52779ef30ddbbfff31e09214fa94ad6e6f5e6d08',
    )
    expect(rev3Source.publicationDate).toBe('2024-05')
    expect(rev3Source.retrievedDate).toBe('2026-10-15')
  })

  it.each(levelTwo.map((control) => [control.id, control] as const))(
    'maps %s to the Rev. 3 number its own number names, with a consistent note',
    (_id, control) => {
      const row = rev3For(control)!
      const [, chapter, item] = control.id.match(/-3\.(\d+)\.(\d+)$/)!
      expect(row.rev3Id).toBe(
        `03.${chapter!.padStart(2, '0')}.${item!.padStart(2, '0')}`,
      )
      expect(row.rev3Text.length).toBeGreaterThan(0)
      expect(row.note).toMatch(/[.]$/)
      expect(row.note.split(/(?<=[.!?])\s+(?=[A-Z])/)).toHaveLength(1)
      // The publication's front matter is ten PDF pages long.
      expect(row.pdfPage - row.printedPage).toBe(10)
      if (row.change === 'withdrawn') {
        expect(row.rev3Title).toBe('Withdrawn')
        expect(row.note).toMatch(/^Withdrawn/)
        for (const target of row.into ?? []) {
          expect(row.rev3Text).toContain(target)
          const named = inventory.requirements.find(
            (other) => other.rev3Id === target,
          )
          if (named) expect(named.change).not.toBe('withdrawn')
        }
      } else {
        expect(row.rev3Title).not.toBe('Withdrawn')
        expect(row.into).toBeUndefined()
      }
      if (row.change === 'new-odp')
        expect(row.rev3Text).toMatch(/\[(Assignment|Selection)/)
      if (row.change === 'unchanged') expect(row.note).toMatch(/^Unchanged/)
    },
  )

  it('counts the kinds of change', () => {
    const counts: Record<string, number> = {}
    for (const row of inventory.requirements)
      counts[row.change] = (counts[row.change] ?? 0) + 1
    expect(counts).toEqual({
      unchanged: 8,
      changed: 31,
      'new-odp': 38,
      withdrawn: 33,
    })
  })
})
