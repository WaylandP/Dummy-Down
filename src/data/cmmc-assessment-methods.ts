import type { ReferenceControl } from '../types/content'
import inventory from './cmmc-assessment-methods.json'

/** One control's potential assessment methods and objects, verbatim from its guide page. */
export interface AssessmentMethods {
  readonly controlId: string
  readonly sourceId: string
  readonly pdfPage: number
  readonly printedPage: number
  /** The documents, records and settings an assessor may examine. */
  readonly examine: readonly string[]
  /** The roles an assessor may interview. */
  readonly interview: readonly string[]
  /** The processes and mechanisms an assessor may test. */
  readonly test: readonly string[]
}

const methods = inventory.methods as readonly AssessmentMethods[]
const byControl = new Map(methods.map((entry) => [entry.controlId, entry]))

/** The pinned guide's lists for one control, or null outside the pinned edition. */
export function assessmentMethodsFor(
  control: Pick<ReferenceControl, 'frameworkId' | 'editionId' | 'id'>,
): AssessmentMethods | null {
  if (
    control.frameworkId !== inventory.frameworkId ||
    control.editionId !== inventory.editionId
  )
    return null
  return byControl.get(control.id) ?? null
}
