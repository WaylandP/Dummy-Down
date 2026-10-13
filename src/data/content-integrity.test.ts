import { describe, expect, it } from 'vitest'
import {
  controls,
  explorerCatalog,
  defaultLesson,
  editions,
  explanationModes,
  frameworks,
  glossaryTerms,
} from './content'
import type { SourceReference } from '../types/content'

const stableKey = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function expectUnique(values: readonly string[]) {
  expect(new Set(values).size).toBe(values.length)
}

describe('editorial content integrity', () => {
  it('keeps lesson identities unique and independent from official identifiers', () => {
    expectUnique(frameworks.map((framework) => framework.id))
    expectUnique(
      editions.map((edition) => `${edition.frameworkId}/${edition.id}`),
    )
    expectUnique(
      controls.map(
        (control) =>
          `${control.frameworkId}/${control.editionId}/${control.key}`,
      ),
    )

    for (const control of controls) {
      expect(control.frameworkId).toMatch(stableKey)
      expect(control.editionId).toMatch(stableKey)
      expect(control.key).toMatch(stableKey)
      expect(control.id.trim()).not.toBe('')
    }

    expect(controls[0]?.id).toBe('AC.L2-3.1.1')
    expect(controls[0]?.key).toBe('authorized-access')
  })

  it('links each lesson and edition to the correct available framework', () => {
    for (const edition of editions) {
      expect(edition.id).toMatch(stableKey)
      expect(
        frameworks.find((entry) => entry.id === edition.frameworkId),
      ).toBeDefined()
      expect(edition.title.trim()).not.toBe('')
      expect(edition.versionContext.trim()).not.toBe('')
    }

    for (const control of controls) {
      const framework = frameworks.find(
        (entry) => entry.id === control.frameworkId,
      )
      expect(framework?.status).toBe('preview')
      expect(
        editions.find(
          (edition) =>
            edition.id === control.editionId &&
            edition.frameworkId === control.frameworkId,
        ),
      ).toBeDefined()
      if (control.level) expect(framework?.levels).toContain(control.level)
    }

    expect(
      explorerCatalog.controls.filter(
        (control) =>
          control.frameworkId === defaultLesson.frameworkId &&
          control.editionId === defaultLesson.editionId &&
          control.key === defaultLesson.controlKey,
      ),
    ).toHaveLength(1)
  })

  it('provides complete draft teaching context and resolvable glossary references', () => {
    expectUnique(glossaryTerms.map((term) => term.id))
    const termIds = new Set(glossaryTerms.map((term) => term.id))

    for (const control of controls) {
      expect(control.reviewStatus).toBe('draft')
      expect(control.contentKind).toBe('educational-example')
      expect(control.versionContext.trim()).not.toBe('')
      expect(control.disclaimer.trim()).not.toBe('')
      expectUnique(control.glossaryTermIds)
      for (const id of control.glossaryTermIds)
        expect(termIds.has(id)).toBe(true)
      for (const mode of explanationModes) {
        expect(control.explanations[mode.id].summary.trim()).not.toBe('')
      }
    }

    for (const term of glossaryTerms) {
      expect(term.id).toMatch(stableKey)
      expect(term.reviewStatus).toBe('draft')
      expect(term.title.trim()).not.toBe('')
      expect(term.definition.trim()).not.toBe('')
      expect(term.versionContext.trim()).not.toBe('')
      expect(term.sources.length).toBeGreaterThan(0)
    }
  })

  it('uses safe, consistent sources and distinguishes resource indexes from publications', () => {
    const sourceById = new Map<string, SourceReference>()
    const sources = [...controls, ...glossaryTerms].flatMap(
      (entry) => entry.sources,
    )
    for (const source of sources) {
      const url = new URL(source.url)
      expect(url.protocol).toBe('https:')
      expect(url.username).toBe('')
      expect(url.password).toBe('')
      expect(source.title.trim()).not.toBe('')
      expect(source.versionContext.trim()).not.toBe('')
      const existing = sourceById.get(source.id)
      if (existing) expect(source).toEqual(existing)
      sourceById.set(source.id, source)
    }

    for (const framework of frameworks) {
      expect(new URL(framework.sourceUrl).protocol).toBe('https:')
    }
    expect(sourceById.get('dod-cmmc-resources')?.kind).toBe(
      'official-resource-index',
    )
    expect(sourceById.get('nist-800-171-rev-2')?.kind).toBe(
      'official-publication',
    )
    expect(sourceById.get('project-readme')?.kind).toBe('project-readme')
  })
})
