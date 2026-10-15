import { afterEach, describe, expect, it, vi } from 'vitest'
import { explorerCatalog } from '../data/content'
import { parseExplorerSearch } from './explorer-state'
import {
  CHALK_PREFERENCE_KEY,
  readChalkPreference,
  writeChalkPreference,
} from './chalk-preference'

const lesson =
  '?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i'

afterEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('The chalk preference', () => {
  it('remembers only a chalk the tray has', () => {
    expect(readChalkPreference()).toBeNull()
    writeChalkPreference('it-cyber')
    expect(window.localStorage.getItem(CHALK_PREFERENCE_KEY)).toBe('it-cyber')
    expect(readChalkPreference()).toBe('it-cyber')
    window.localStorage.setItem(CHALK_PREFERENCE_KEY, 'green')
    expect(readChalkPreference()).toBeNull()
  })

  it('is a convenience: blocked storage reads as no preference and writes stay silent', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readChalkPreference()).toBeNull()
    expect(() => writeChalkPreference('compliance')).not.toThrow()
  })

  it('opens an address that names no chalk in the remembered one, and never overrides one that does', () => {
    const open = (search: string) => {
      const parsed = parseExplorerSearch(search, explorerCatalog, {
        defaultMode: 'compliance',
      })
      if (parsed.kind !== 'ready') throw new Error('Address is invalid')
      return [parsed.state.mode, parsed.notices] as const
    }
    expect(open(lesson)).toEqual(['compliance', []])
    expect(open(`${lesson}&mode=it-cyber`)).toEqual(['it-cyber', []])
    expect(open(`${lesson}&chalk=yellow`)).toEqual(['it-cyber', []])
    expect(open(`${lesson}&chalk=green`)).toEqual(['beginner', ['chalk-reset']])
    expect(open('?view=discover&collection=references')[0]).toBe('compliance')
    // The bare address, with nothing named at all, opens the default lesson in it.
    expect(open('')).toEqual(['compliance', []])
    // Without a preference the white chalk is the default, as before.
    const plain = parseExplorerSearch(lesson, explorerCatalog)
    expect(plain.kind === 'ready' && plain.state.mode).toBe('beginner')
  })
})
