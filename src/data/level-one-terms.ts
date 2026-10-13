import type { ReferenceControl } from '../types/content'

const levelOneTermIds: Readonly<Record<string, readonly string[]>> = {
  'AC.L1-b.1.i': [
    'authorization',
    'authentication',
    'information-system',
    'authorized-user',
    'process',
    'device',
  ],
  'AC.L1-b.1.ii': ['authorization', 'account', 'authorized-user'],
  'AC.L1-b.1.iii': ['system-boundary', 'information-system', 'device'],
  'AC.L1-b.1.iv': ['fci', 'cui', 'publicly-accessible-system'],
  'IA.L1-b.1.v': ['account', 'process', 'device', 'information-system'],
  'IA.L1-b.1.vi': ['authentication', 'authorization', 'process', 'device'],
  'MP.L1-b.1.vii': ['fci', 'media', 'media-sanitization', 'disposal', 'reuse'],
  'PE.L1-b.1.viii': ['authorized-user', 'device', 'information-system'],
  'PE.L1-b.1.ix': ['authorized-user'],
  'SC.L1-b.1.x': ['system-boundary', 'information-system'],
  'SC.L1-b.1.xi': ['publicly-accessible-system', 'system-boundary'],
  'SI.L1-b.1.xii': ['information-system', 'device'],
  'SI.L1-b.1.xiii': ['malicious-code', 'media'],
  'SI.L1-b.1.xiv': ['malicious-code'],
  'SI.L1-b.1.xv': ['malicious-code', 'media'],
}

/** Exact edition binding prevents another framework borrowing these definitions. */
export function getLevelOneTermIds(
  control: Pick<ReferenceControl, 'frameworkId' | 'editionId' | 'id'>,
): readonly string[] {
  if (
    control.frameworkId !== 'cmmc' ||
    control.editionId !== 'cmmc-2-13-sep-2024'
  )
    return []
  if (!Object.hasOwn(levelOneTermIds, control.id)) return []
  // Every Level 1 lesson handles FCI; explain the acronym where it is read.
  return [...new Set(['fci', ...(levelOneTermIds[control.id] ?? [])])]
}
