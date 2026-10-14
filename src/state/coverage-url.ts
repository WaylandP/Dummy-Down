import type { ReferenceControl } from '../types/content'

/** Keep lesson links lightweight: importing this helper must not load the report. */
export function coverageUrl(
  control: Pick<ReferenceControl, 'frameworkId' | 'editionId' | 'id'>,
): string | undefined {
  if (
    control.frameworkId !== 'cmmc' ||
    control.editionId !== 'cmmc-2-13-sep-2024'
  )
    return undefined
  return `/coverage?control=${encodeURIComponent(control.id)}`
}
