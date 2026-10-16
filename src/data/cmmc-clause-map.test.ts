import { describe, expect, it } from 'vitest'
import { referenceControls } from './content'
import { assessmentObjectivesFor } from './cmmc-objectives'
import map from './cmmc-clause-map.json'
import { clauseMapFor, decodeSentence } from './cmmc-clause-map'

const pinned = referenceControls.filter(
  (control) =>
    control.frameworkId === 'cmmc' &&
    control.editionId === 'cmmc-2-13-sep-2024',
)

describe('The clause map', () => {
  it('covers every control of the pinned edition and nothing else', () => {
    expect(Object.keys(map.controls).sort()).toEqual(
      pinned.map((control) => control.id).sort(),
    )
    expect(pinned).toHaveLength(149)
    expect(
      clauseMapFor({
        frameworkId: 'cmmc',
        editionId: 'readme-example',
        id: 'AC.L1-b.1.i',
      }),
    ).toEqual([])
  })

  it.each(pinned.map((control) => [control.id, control] as const))(
    'maps %s with verbatim spans, in order, to objectives that exist, each once',
    (_id, control) => {
      const spans = clauseMapFor(control)
      const labels = assessmentObjectivesFor(control).map(
        (objective) => objective.label,
      )
      const seen: string[] = []
      for (const span of spans) {
        expect(span.text.trim()).toBe(span.text)
        expect(span.text.length).toBeGreaterThan(0)
        expect(control.requirement.text).toContain(span.text)
        // A clause starts and ends at a word, never inside one.
        const at = control.requirement.text.indexOf(span.text)
        expect(control.requirement.text[at - 1] ?? ' ').not.toMatch(/\w/)
        expect(
          control.requirement.text[at + span.text.length] ?? ' ',
        ).not.toMatch(/\w/)
        expect(span.letters.length).toBeGreaterThan(0)
        for (const letter of span.letters) {
          expect(labels).toContain(letter)
          expect(seen).not.toContain(letter)
          seen.push(letter)
        }
      }
      const decoded = decodeSentence(control.requirement.text, spans)
      expect(decoded).not.toBeNull()
      expect(decoded!.map((segment) => segment.text).join('')).toBe(
        control.requirement.text,
      )
      expect(decoded!.filter((segment) => segment.letters)).toHaveLength(
        spans.length,
      )
    },
  )

  it('shows the sentence plain rather than guessing when a clause is not found', () => {
    expect(
      decodeSentence('Limit system access to authorized users.', [
        { text: 'authorized users', letters: ['a'] },
        { text: 'system access', letters: ['b'] },
      ]),
    ).toBeNull()
    expect(
      decodeSentence('Limit system access to authorized users.', [
        { text: 'Limit', letters: ['b'] },
        { text: 'authorized users', letters: ['a'] },
      ]),
    ).toEqual([
      { text: 'Limit', letters: ['b'] },
      { text: ' system access to ' },
      { text: 'authorized users', letters: ['a'] },
      { text: '.' },
    ])
  })

  it('decodes the mockup control and its Level 1 twin the way the mockup shows', () => {
    expect(
      clauseMapFor(pinned.find((control) => control.id === 'AC.L2-3.1.1')!),
    ).toEqual([
      { text: 'authorized users', letters: ['a', 'd'] },
      {
        text: 'processes acting on behalf of authorized users',
        letters: ['b', 'e'],
      },
      { text: 'devices (including other systems)', letters: ['c', 'f'] },
    ])
    expect(
      clauseMapFor(pinned.find((control) => control.id === 'AC.L1-b.1.i')!),
    ).toEqual([
      { text: 'authorized users', letters: ['a', 'd'] },
      {
        text: 'processes acting on behalf of authorized users',
        letters: ['b', 'e'],
      },
      {
        text: 'devices (including other information systems)',
        letters: ['c', 'f'],
      },
    ])
  })

  it('gives each objective the clause it restates', () => {
    // [a] essential capabilities defined on the principle of least
    // functionality; [b] configured to provide only those capabilities.
    expect(
      clauseMapFor(pinned.find((control) => control.id === 'CM.L2-3.4.6')!),
    ).toEqual([
      { text: 'Employ the principle of least functionality', letters: ['a'] },
      {
        text: 'configuring organizational systems to provide only essential capabilities',
        letters: ['b'],
      },
    ])
  })
})
