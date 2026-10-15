import type { ReferenceControl } from '../../types/content'

export interface DecodedPiece {
  readonly code: string
  readonly meaning: string
}

export interface DecodedId {
  readonly family: string
  readonly level: string
  readonly number: string
  readonly pieces: readonly DecodedPiece[]
}

/**
 * Which publication each level's requirement number names, per edition, as
 * the CMMC model overview (v2.13, section 2) states it. Another edition gets
 * no decoded line until its own publications are recorded here.
 */
const publications: Readonly<
  Record<string, Readonly<Record<'L1' | 'L2' | 'L3', string>>>
> = {
  'cmmc-2-13-sep-2024': {
    L1: 'FAR 52.204-21, paragraph',
    L2: 'NIST SP 800-171 Rev. 2, requirement',
    L3: 'NIST SP 800-172, requirement',
  },
}
const levelMeanings: Readonly<Record<'L1' | 'L2' | 'L3', string>> = {
  L1: 'Level 1, FCI',
  L2: 'Level 2, CUI',
  L3: 'Level 3, CUI, enhanced',
}

/** A CMMC identifier reads family.level-number; the family name comes from the catalog. */
export function decodeControlId(
  control: Pick<
    ReferenceControl,
    'id' | 'familyName' | 'frameworkId' | 'editionId'
  >,
): DecodedId | null {
  const named =
    control.frameworkId === 'cmmc' && publications[control.editionId]
  if (!named) return null
  const match = /^([A-Z]{2})\.(L[123])-(.+)$/.exec(control.id)
  if (!match) return null
  const family = match[1]!
  const level = match[2] as 'L1' | 'L2' | 'L3'
  const number = match[3]!
  return {
    family,
    level,
    number,
    pieces: [
      { code: family, meaning: control.familyName },
      { code: level, meaning: levelMeanings[level] },
      { code: number, meaning: `${named[level]} ${number}` },
    ],
  }
}
