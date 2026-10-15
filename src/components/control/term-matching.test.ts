import { describe, expect, it } from 'vitest'
import { glossaryTerms } from '../../data/content'
import type { GlossaryTerm } from '../../types/content'
import { markBlocks, markTerms, phrasesFor } from './term-matching'

const term = (id: string) => glossaryTerms.find((item) => item.id === id)!
const marks = (runs: readonly { text: string; term?: GlossaryTerm }[]) =>
  runs.filter((run) => run.term).map((run) => [run.text, run.term!.id])

describe('Marking the lesson’s words in explanation text', () => {
  it('matches a title and its acronym, whole words only, once each, longest first', () => {
    const text =
      'Federal Contract Information (FCI) is information, and FCI stays FCI; a process is not processing, processed or reprocessed.'
    const runs = markTerms(text, [term('fci'), term('process')])
    expect(runs.map((run) => run.text).join('')).toBe(text)
    expect(marks(runs)).toEqual([
      ['Federal Contract Information', 'fci'],
      ['process', 'process'],
    ])
  })

  it('leaves words the lesson does not list alone and keeps the text verbatim', () => {
    const text = 'A device and an account, in any case.'
    expect(markTerms(text, [])).toEqual([{ text }])
    expect(markTerms(text, [term('device')])).toEqual([
      { text: 'A ' },
      { text: 'device', term: term('device') },
      { text: ' and an account, in any case.' },
    ])
  })

  it('reads a plural as the word, in the text’s own case, and marks it once', () => {
    expect(
      markTerms('Devices and processes; a device, two processes.', [
        term('device'),
        term('process'),
      ]),
    ).toEqual([
      { text: 'Devices', term: term('device') },
      { text: ' and ' },
      { text: 'processes', term: term('process') },
      { text: '; a device, two processes.' },
    ])
    expect(marks(markTerms('Media sanitization', [term('media')]))).toEqual([
      ['Media', 'media'],
    ])
  })

  it('matches an acronym letter for letter and a sentence start without lookbehind', () => {
    expect(marks(markTerms('the fci, then FCI.', [term('fci')]))).toEqual([
      ['FCI', 'fci'],
    ])
    expect(marks(markTerms('CUI first.', [term('cui')]))).toEqual([
      ['CUI', 'cui'],
    ])
    const it: GlossaryTerm = {
      ...term('cui'),
      id: 'it',
      title: 'Information Technology (IT)',
    }
    expect(marks(markTerms('It is what IT runs.', [it]))).toEqual([
      ['IT', 'it'],
    ])
  })

  it('reads the phrase and the acronym out of a title, and nothing out of other parentheses', () => {
    expect(phrasesFor(term('cui'))).toEqual([
      'Controlled Unclassified Information',
      'CUI',
    ])
    expect(phrasesFor(term('authorized-user'))).toEqual(['Authorized user'])
    expect(phrasesFor({ ...term('media'), title: 'Media (storage)' })).toEqual([
      'Media (storage)',
    ])
  })

  it('marks a word once across the blocks of a view', () => {
    const blocks = markBlocks(
      ['A device here.', 'Devices again, and media.', 'More media.'],
      [term('device'), term('media')],
    )
    expect(blocks.map(marks)).toEqual([
      [['device', 'device']],
      [['media', 'media']],
      [],
    ])
  })
})
