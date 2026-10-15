import type { ReferenceControl } from '../types/content'

/** "Authorized Access Control [FCI Data]" and "[CUI Data]" share a stem. */
export function titleStem(title: string): string {
  return title.replace(/\s*\[[^\]]*\]\s*$/, '')
}

/** The requirement number after the level: 3.1.1, b.1.i, 3.1.2e. */
export function requirementNumber(id: string): string {
  return id.slice(id.indexOf('-') + 1)
}

export interface RelatedControls {
  /** The same practice at another level, by family and title stem. */
  readonly siblings: readonly ReferenceControl[]
  /** Level 3 requirements that build on this one (3.1.2 → 3.1.2e). */
  readonly builds: readonly ReferenceControl[]
  /** The Level 2 requirement this enhanced one builds on. */
  readonly basis: readonly ReferenceControl[]
  /** The rest of the family. */
  readonly family: readonly ReferenceControl[]
}

/** Relations derived from identifiers and titles in the same snapshot; nothing authored. */
export function relatedControls(
  control: ReferenceControl,
  all: readonly ReferenceControl[],
): RelatedControls {
  const stem = titleStem(control.title)
  const number = requirementNumber(control.id)
  const others = all.filter(
    (item) =>
      item.id !== control.id &&
      item.frameworkId === control.frameworkId &&
      item.editionId === control.editionId,
  )
  const siblings = others.filter(
    (item) => item.family === control.family && titleStem(item.title) === stem,
  )
  const builds = others.filter(
    (item) => requirementNumber(item.id) === `${number}e`,
  )
  const basis = number.endsWith('e')
    ? others.filter(
        (item) => requirementNumber(item.id) === number.slice(0, -1),
      )
    : []
  const taken = new Set(
    [...siblings, ...builds, ...basis].map((item) => item.id),
  )
  const family = others.filter(
    (item) => item.family === control.family && !taken.has(item.id),
  )
  return { siblings, builds, basis, family }
}
