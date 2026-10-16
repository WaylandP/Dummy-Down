import type { SourceReference } from '../types/content'
import { referenceControls } from './cmmc-references'

/**
 * The teaching basis of a practice activity: the pinned assessment-guide page
 * that quotes the control's requirement, taken from the control's own
 * sources so the activity cites exactly what the control cites.
 */
export function guideSource(controlId: string): SourceReference {
  const control = referenceControls.find((item) => item.id === controlId)
  const source = control?.sources.find(
    (item) =>
      item.id ===
      `${control.requirement.sourceId}-page-${control.requirement.pdfPage}`,
  )
  if (!source) throw new Error(`Missing learning source: ${controlId}`)
  return source
}
