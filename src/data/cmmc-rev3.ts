import type { ReferenceControl } from '../types/content'
import { referenceControls } from './content'
import inventory from './cmmc-rev3-map.json'

export type Rev3Change = 'unchanged' | 'changed' | 'new-odp' | 'withdrawn'

/** A Level 2 control's counterpart in NIST SP 800-171 Rev. 3, verbatim, and what moved. */
export interface Rev3Requirement {
  readonly controlId: string
  readonly rev3Id: string
  readonly rev3Title: string
  /** The Rev. 3 requirement text, or its "Withdrawn" line, verbatim. */
  readonly rev3Text: string
  readonly pdfPage: number
  readonly printedPage: number
  readonly change: Rev3Change
  /** One sentence in plain language; the two texts control. */
  readonly note: string
  /** For a withdrawn requirement, where Rev. 3 says it went. */
  readonly into?: readonly string[]
}

const requirements = inventory.requirements as readonly Rev3Requirement[]
const byControl = new Map(requirements.map((entry) => [entry.controlId, entry]))
const byRev3 = new Map(requirements.map((entry) => [entry.rev3Id, entry]))

/** The pinned Rev. 3 publication this map was read from. */
export const rev3Source = inventory.source

/** The pinned Level 2 control whose counterpart a Rev. 3 number names, if any. */
export function rev3Target(rev3Id: string): ReferenceControl | null {
  const row = byRev3.get(rev3Id)
  if (!row || row.change === 'withdrawn') return null
  return (
    referenceControls.find(
      (control) =>
        control.frameworkId === inventory.frameworkId &&
        control.editionId === inventory.editionId &&
        control.id === row.controlId,
    ) ?? null
  )
}

/** The Rev. 3 counterpart of a Level 2 control in the pinned edition, or null. */
export function rev3For(
  control: Pick<ReferenceControl, 'frameworkId' | 'editionId' | 'id'>,
): Rev3Requirement | null {
  if (
    control.frameworkId !== inventory.frameworkId ||
    control.editionId !== inventory.editionId
  )
    return null
  return byControl.get(control.id) ?? null
}
