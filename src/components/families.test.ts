import { describe, expect, it } from 'vitest'
import { explorerCatalog, referenceControls } from '../data/content'
import { explorerResults, parseExplorerSearch } from '../state/explorer-state'
import { families, familyUrl, plainClick } from './families'

describe('the fourteen families', () => {
  it('lists every family of the pinned catalog once, in code order, with its count', () => {
    const codes = [
      ...new Set(referenceControls.map((control) => control.family)),
    ]
    expect(families.map((family) => family.code)).toEqual(
      [...codes].sort((left, right) => left.localeCompare(right, 'en-US')),
    )
    expect(families).toHaveLength(14)
    for (const family of families) {
      expect(family.count).toBe(
        referenceControls.filter((control) => control.family === family.code)
          .length,
      )
      expect(family.name).not.toBe('')
    }
    expect(families.reduce((sum, family) => sum + family.count, 0)).toBe(149)
  })

  it('links each family to reference discovery filtered to exactly that family, in the chalk given', () => {
    for (const family of families) {
      const url = new URL(
        familyUrl(family.code, 'it-cyber'),
        'http://localhost',
      )
      expect(url.pathname).toBe('/learn')
      const parsed = parseExplorerSearch(url.search, explorerCatalog)
      if (parsed.kind !== 'ready') throw new Error(`${family.code} is invalid`)
      expect(parsed.notices).toEqual([])
      expect(parsed.state.view).toBe('discover')
      expect(parsed.state.mode).toBe('it-cyber')
      expect(parsed.state.filters).toMatchObject({
        catalog: 'cmmc',
        collection: 'references',
        family: family.code,
        level: '',
        query: '',
      })
      const results = explorerResults(parsed.state, explorerCatalog)
      expect(results).toHaveLength(family.count)
      expect(results.every((control) => control.family === family.code)).toBe(
        true,
      )
    }
    const all = parseExplorerSearch(
      new URL(familyUrl(''), 'http://localhost').search,
      explorerCatalog,
    )
    if (all.kind !== 'ready') throw new Error('All families is invalid')
    expect(all.state.mode).toBe('beginner')
    expect(explorerResults(all.state, explorerCatalog)).toHaveLength(149)
  })

  it('handles a plain click in place and leaves every other click to the browser', () => {
    const plain = {
      defaultPrevented: false,
      button: 0,
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    }
    expect(plainClick(plain)).toBe(true)
    for (const other of [
      { ...plain, button: 1 },
      { ...plain, metaKey: true },
      { ...plain, ctrlKey: true },
      { ...plain, shiftKey: true },
      { ...plain, altKey: true },
      { ...plain, defaultPrevented: true },
    ])
      expect(plainClick(other)).toBe(false)
  })
})
