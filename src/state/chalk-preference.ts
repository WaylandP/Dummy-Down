import type { ExplanationMode } from '../types/content'

/** The chalk a visitor picked on Home, kept in this browser so the next control opens in it. */
export const CHALK_PREFERENCE_KEY = 'cipher-and-chalk:chalk:v1'

const modes: readonly ExplanationMode[] = ['beginner', 'it-cyber', 'compliance']

/** The remembered chalk, or null when none is stored or storage is unavailable. */
export function readChalkPreference(): ExplanationMode | null {
  try {
    const stored = window.localStorage.getItem(CHALK_PREFERENCE_KEY)
    return modes.find((mode) => mode === stored) ?? null
  } catch {
    return null
  }
}

/** Remember the chalk. Storage is a convenience: the row's address carries the chalk anyway. */
export function writeChalkPreference(mode: ExplanationMode) {
  try {
    window.localStorage.setItem(CHALK_PREFERENCE_KEY, mode)
  } catch {
    // Nothing to do: the page the row opens still names its chalk.
  }
}
