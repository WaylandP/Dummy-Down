import { describe, expect, it } from 'vitest'
import { glossaryTerms } from '../../data/glossary'
import {
  glossaryGroupOf,
  glossaryGroups,
  initialOf,
  sourceLabel,
  sourceLabels,
} from './groups'

function term(id: string) {
  const found = glossaryTerms.find((item) => item.id === id)
  if (!found) throw new Error(`Missing term ${id}`)
  return found
}

describe('Words groupings', () => {
  it('follow each word to the text that defines it, never an authored tag', () => {
    expect(glossaryGroupOf(term('cmmc'))).toBe('program')
    expect(glossaryGroupOf(term('sprs'))).toBe('program')
    expect(glossaryGroupOf(term('cui-assets'))).toBe('scoping')
    expect(glossaryGroupOf(term('cmmc-assessment-scope'))).toBe('scoping')
    expect(glossaryGroupOf(term('account'))).toBe('lessons')
    expect(glossaryGroupOf(term('fci'))).toBe('lessons')
    const clauses = glossaryTerms.filter(
      (item) => glossaryGroupOf(item) === 'clauses',
    )
    expect(clauses.length).toBeGreaterThan(0)
    expect(
      clauses.every((item) => /^(dfars|far)-/.test(item.sources[0]!.id)),
    ).toBe(true)
  })

  it('cover every word between the four groups', () => {
    const counted = glossaryGroups
      .map(
        (group) =>
          glossaryTerms.filter((item) => glossaryGroupOf(item) === group.id)
            .length,
      )
      .reduce((sum, count) => sum + count, 0)
    expect(counted).toBe(glossaryTerms.length)
  })

  it('shorten a source to the text it names and file words by their first letter', () => {
    expect(sourceLabel(term('cmmc').sources[0]!)).toBe('32 CFR § 170.4')
    expect(sourceLabel(term('account').sources[0]!)).toBe('Project README')
    expect(initialOf(term('cmmc'))).toBe('C')
    expect(initialOf({ ...term('cmmc'), title: '32 CFR' })).toBe('#')
  })

  it('tell apart two pages of the same guide, so no two links read alike', () => {
    const labels = sourceLabels(term('authorization').sources)
    expect(new Set(labels).size).toBe(labels.length)
    expect(labels.every((label) => label.includes(', '))).toBe(true)
    expect(sourceLabels(term('cmmc').sources)).toEqual([
      '32 CFR § 170.4',
      'DFARS 252.204-7021',
    ])
  })
})
