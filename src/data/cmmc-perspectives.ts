import type { ReferenceControl } from '../types/content'
import type { ControlPerspectiveDraft } from '../types/perspectives'
import level1And3 from './perspectives/level-1-3.json'
import level2A from './perspectives/level-2-a.json'
import level2B from './perspectives/level-2-b.json'

/** Draft prose is never merged into the attributed requirement quotations. */
export const cmmcPerspectiveDrafts: readonly ControlPerspectiveDraft[] = [
  ...level1And3,
  ...level2A,
  ...level2B,
]

const byId = new Map(cmmcPerspectiveDrafts.map((draft) => [draft.id, draft]))

/** The same display ID in another framework/edition must not reuse this draft. */
export function findCmmcPerspective(
  control: Pick<ReferenceControl, 'frameworkId' | 'editionId' | 'id'>,
): ControlPerspectiveDraft | undefined {
  if (
    control.frameworkId !== 'cmmc' ||
    control.editionId !== 'cmmc-2-13-sep-2024'
  )
    return undefined
  return byId.get(control.id)
}
