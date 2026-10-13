import { describe, expect, it } from 'vitest'
import { cmmcSourceDocuments, referenceControls } from './cmmc-references'
import { glossaryTerms } from './glossary'
import { levelOneGlossaryTerms } from './level-one-glossary'
import { getLevelOneTermIds } from './level-one-terms'

const snapshotControl = {
  frameworkId: 'cmmc',
  editionId: 'cmmc-2-13-sep-2024',
  id: 'AC.L1-b.1.i',
}

const originalIds = [
  'access-review',
  'account',
  'authorized-user',
  'device',
  'offboarding',
  'process',
]

describe('Level 1 contextual vocabulary', () => {
  it('keeps existing teaching identifiers and resolves every mapped Level 1 term', () => {
    const ids = glossaryTerms.map((term) => term.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of originalIds) expect(ids).toContain(id)

    const levelOne = referenceControls.filter(
      (control) => control.level === 'Level 1',
    )
    expect(levelOne).toHaveLength(15)
    for (const control of levelOne) {
      const contextIds = getLevelOneTermIds(control)
      expect(contextIds.length).toBeGreaterThan(0)
      expect(contextIds).toContain('fci')
      expect(new Set(contextIds).size).toBe(contextIds.length)
      for (const id of contextIds) expect(ids).toContain(id)
    }
  })

  it('binds the terms to the exact framework, edition and identifier', () => {
    expect(getLevelOneTermIds(snapshotControl)).toContain('authorization')
    expect(
      getLevelOneTermIds({ ...snapshotControl, frameworkId: 'other' }),
    ).toEqual([])
    expect(
      getLevelOneTermIds({ ...snapshotControl, editionId: 'readme-example' }),
    ).toEqual([])
    for (const id of [
      'AC.L2-3.1.1',
      'AC.L3-3.1.2e',
      'ac.l1-b.1.i',
      'missing',
      'toString',
      '__proto__',
      'constructor',
    ]) {
      expect(getLevelOneTermIds({ ...snapshotControl, id })).toEqual([])
    }
  })

  it('preserves interpretation and review limits with exact publication-page references', () => {
    for (const term of levelOneGlossaryTerms) {
      expect(term.reviewStatus).toBe('draft')
      expect(term.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(term.title.trim()).not.toBe('')
      expect(term.definition.trim()).not.toBe('')
      expect(term.versionContext).toContain('AI-assisted')
      expect(term.versionContext).toContain('September 2024 CMMC 2.13')
      expect(term.versionContext).toContain('not an official definition')
      expect(term.versionContext).toContain('human review is pending')
      expect(term.sources.length).toBeGreaterThan(0)
      for (const source of term.sources) {
        const url = new URL(source.url)
        expect(source.kind).toBe('official-publication')
        expect(url.protocol).toBe('https:')
        expect(url.hash).toMatch(/^#page=[1-9]\d*$/)
        const pdfPage = Number(url.hash.slice('#page='.length))
        expect(source.versionContext).toContain(`PDF page ${pdfPage}`)
        expect(source.versionContext).toMatch(/printed page [1-9]\d*/)
        expect(source.versionContext).toContain('Version 2.13')
        expect(source.versionContext).toContain('Source checked on 2026-10-13')
        expect(source.versionContext).toContain(
          'official-host access was blocked',
        )
        expect(source.versionContext).toContain(
          'not been independently verified',
        )
        expect(
          cmmcSourceDocuments.some(
            (document) => document.url === `${url.origin}${url.pathname}`,
          ),
        ).toBe(true)
      }
    }
  })

  it('keeps the inspected publication pages bound to their actual definitions', () => {
    const expectedFirstSources: Readonly<
      Record<string, readonly [number, number]>
    > = {
      fci: [1, 5],
      cui: [2, 9],
      authorization: [1, 16],
      authentication: [1, 28],
      'information-system': [1, 8],
      'publicly-accessible-system': [1, 24],
      media: [1, 31],
      'media-sanitization': [1, 31],
      disposal: [1, 31],
      reuse: [1, 31],
      'assessment-objective': [1, 7],
      'assessment-scope': [1, 6],
      'malicious-code': [1, 47],
      'system-boundary': [1, 38],
    }
    for (const [id, [level, page]] of Object.entries(expectedFirstSources)) {
      const term = levelOneGlossaryTerms.find((entry) => entry.id === id)
      const document = cmmcSourceDocuments.find(
        (entry) => entry.id === `cmmc-assessment-l${level}-213`,
      )
      expect(term?.sources[0]?.url).toBe(`${document?.url}#page=${page}`)
    }
  })

  it('provides distinct context for authorization, public information and media lifecycle', () => {
    expect(getLevelOneTermIds(snapshotControl)).toEqual(
      expect.arrayContaining([
        'authorization',
        'authentication',
        'process',
        'device',
      ]),
    )
    expect(
      getLevelOneTermIds({ ...snapshotControl, id: 'AC.L1-b.1.iv' }),
    ).toEqual(expect.arrayContaining(['fci', 'publicly-accessible-system']))
    expect(
      getLevelOneTermIds({ ...snapshotControl, id: 'MP.L1-b.1.vii' }),
    ).toEqual(
      expect.arrayContaining([
        'media',
        'media-sanitization',
        'disposal',
        'reuse',
      ]),
    )
  })
})
