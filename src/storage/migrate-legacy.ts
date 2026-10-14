/**
 * One-time migration of browser storage written under the project's former
 * working name. Runs before the app mounts so the progress and analytics
 * stores only ever see the current `cipher-and-chalk:` namespace.
 *
 * Rules: a value is copied only when the new key is still empty, and the old
 * key is removed afterwards either way. Any storage failure is ignored; the
 * stores already handle an absent or unreadable key.
 */
export const LEGACY_STORAGE_PREFIX = 'dummy-down:'
export const STORAGE_PREFIX = 'cipher-and-chalk:'

export const MIGRATED_STORAGE_KEYS = [
  'usage-preference',
  'learning-saving:v1',
  'learning-progress:v1',
] as const

export interface MigrationStorage {
  readonly getItem: (key: string) => string | null
  readonly setItem: (key: string, value: string) => void
  readonly removeItem: (key: string) => void
}

export function migrateLegacyStorage(storage: MigrationStorage): number {
  let migrated = 0
  for (const suffix of MIGRATED_STORAGE_KEYS) {
    const oldKey = `${LEGACY_STORAGE_PREFIX}${suffix}`
    const newKey = `${STORAGE_PREFIX}${suffix}`
    try {
      const legacy = storage.getItem(oldKey)
      if (legacy === null) continue
      if (storage.getItem(newKey) === null) {
        storage.setItem(newKey, legacy)
        migrated += 1
      }
      storage.removeItem(oldKey)
    } catch {
      /* storage unavailable or blocked; nothing to migrate */
    }
  }
  return migrated
}

export function migrateBrowserStorage() {
  if (typeof window === 'undefined') return 0
  try {
    return migrateLegacyStorage(window.localStorage)
  } catch {
    return 0
  }
}
