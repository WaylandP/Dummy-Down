import { describe, expect, it } from 'vitest'
import { glossaryTerms } from './glossary'
import { filterGlossaryTerms } from './glossary-search'

describe('filterGlossaryTerms', () => {
  it('searches titles and definitions without case or surrounding whitespace sensitivity', () => {
    expect(
      filterGlossaryTerms(glossaryTerms, '  AUTHORIZED USER LOGIN  ').map(
        (term) => term.id,
      ),
    ).toEqual(['authorized-user'])
    expect(
      filterGlossaryTerms(glossaryTerms, ' SCRIPT ').map((term) => term.id),
    ).toEqual(['account', 'process'])
  })

  it('requires every word, including words across the title and definition', () => {
    expect(
      filterGlossaryTerms(glossaryTerms, 'device laptop').map(
        (term) => term.id,
      ),
    ).toEqual(['device'])
    expect(
      filterGlossaryTerms(glossaryTerms, 'permissions record').map(
        (term) => term.id,
      ),
    ).toEqual(['account'])
    expect(filterGlossaryTerms(glossaryTerms, 'device nonexistent')).toEqual([])
  })

  it('returns a fresh result list without mutating the vocabulary', () => {
    const before = [...glossaryTerms]
    expect(filterGlossaryTerms(glossaryTerms, ' \n\t ')).toEqual(glossaryTerms)
    expect(filterGlossaryTerms(glossaryTerms)).not.toBe(glossaryTerms)
    expect(glossaryTerms).toEqual(before)
  })

  it('treats punctuation as literal query text instead of a regular expression', () => {
    expect(filterGlossaryTerms(glossaryTerms, '.*')).toEqual([])
    expect(filterGlossaryTerms(glossaryTerms, '[account]')).toEqual([])
  })
})
