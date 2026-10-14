import { describe, expect, it } from 'vitest'
import {
  LEGACY_STORAGE_PREFIX as OLD,
  STORAGE_PREFIX as NEW,
  migrateLegacyStorage,
  type MigrationStorage,
} from './migrate-legacy'

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  const storage: MigrationStorage = {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  }
  return { storage, map }
}

describe('migrateLegacyStorage', () => {
  it('copies legacy values and removes the old keys', () => {
    const progress = '{"schema":1,"entries":[]}'
    const { storage, map } = memoryStorage({
      [`${OLD}usage-preference`]: 'off',
      [`${OLD}learning-saving:v1`]: 'on',
      [`${OLD}learning-progress:v1`]: progress,
    })
    expect(migrateLegacyStorage(storage)).toBe(3)
    expect(map.get(`${NEW}usage-preference`)).toBe('off')
    expect(map.get(`${NEW}learning-saving:v1`)).toBe('on')
    expect(map.get(`${NEW}learning-progress:v1`)).toBe(progress)
    const legacyLeft = [...map.keys()].filter((key) => key.startsWith(OLD))
    expect(legacyLeft).toEqual([])
  })

  it('never overwrites a value already in the new namespace', () => {
    const { storage, map } = memoryStorage({
      [`${OLD}usage-preference`]: 'off',
      [`${NEW}usage-preference`]: 'on',
    })
    expect(migrateLegacyStorage(storage)).toBe(0)
    expect(map.get(`${NEW}usage-preference`)).toBe('on')
    expect(map.has(`${OLD}usage-preference`)).toBe(false)
  })

  it('is a no-op when nothing legacy exists', () => {
    const { storage, map } = memoryStorage({ unrelated: 'x' })
    expect(migrateLegacyStorage(storage)).toBe(0)
    expect([...map.keys()]).toEqual(['unrelated'])
  })

  it('swallows storage failures', () => {
    const storage: MigrationStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => undefined,
      removeItem: () => undefined,
    }
    expect(() => migrateLegacyStorage(storage)).not.toThrow()
    expect(migrateLegacyStorage(storage)).toBe(0)
  })
})
