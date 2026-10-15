import { referenceControls } from '../data/content'
import { serializeExplorerSearch } from '../state/explorer-state'
import type { ExplanationMode } from '../types/content'

/** Short names for a family column; the catalog keeps the official ones. */
const familyLabels: Readonly<Record<string, string>> = {
  AC: 'Access Control',
  AT: 'Awareness & Training',
  AU: 'Audit & Accountability',
  CA: 'Security Assessment',
  CM: 'Configuration',
  IA: 'Identification',
  IR: 'Incident Response',
  MA: 'Maintenance',
  MP: 'Media Protection',
  PE: 'Physical Protection',
  PS: 'Personnel Security',
  RA: 'Risk Assessment',
  SC: 'System & Comms',
  SI: 'System Integrity',
}

export interface FamilyEntry {
  readonly code: string
  readonly name: string
  readonly count: number
}

/** The fourteen families of the pinned catalog with their control counts, in code order. */
export const families: readonly FamilyEntry[] = [
  ...referenceControls.reduce((map, control) => {
    const entry = map.get(control.family) ?? {
      code: control.family,
      name: familyLabels[control.family] ?? control.familyName,
      count: 0,
    }
    map.set(control.family, { ...entry, count: entry.count + 1 })
    return map
  }, new Map<string, FamilyEntry>()),
]
  .map(([, family]) => family)
  .sort((left, right) => left.code.localeCompare(right.code, 'en-US'))

/** Reference discovery filtered to one family (or none), in a chalk. */
export function familyUrl(family: string, mode: ExplanationMode = 'beginner') {
  return (
    '/learn' +
    serializeExplorerSearch({
      view: 'discover',
      mode,
      filters: {
        catalog: 'cmmc',
        collection: 'references',
        query: '',
        family,
        level: '',
      },
    })
  )
}

/**
 * A plain primary click on a link may be handled in place; any modifier, the
 * middle button or a handler that already acted leaves the browser to it
 * (a new tab, a download, a context menu).
 */
export function plainClick(event: {
  readonly defaultPrevented: boolean
  readonly button: number
  readonly metaKey: boolean
  readonly ctrlKey: boolean
  readonly shiftKey: boolean
  readonly altKey: boolean
}): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  )
}
