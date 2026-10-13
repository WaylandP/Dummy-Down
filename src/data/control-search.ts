import type { Control } from '../types/content'

export interface ControlFilters {
  readonly query?: string
  readonly frameworkId?: string
  readonly family?: string
  readonly level?: string
}

function searchableText(control: Control): string {
  return [
    control.id,
    control.title,
    control.frameworkId,
    control.family,
    control.familyName,
    control.level ?? '',
    control.concept,
    ...control.tags,
    ...Object.values(control.explanations).flatMap((explanation) => [
      explanation.heading,
      explanation.summary,
      ...explanation.examples,
    ]),
  ]
    .join(' ')
    .toLocaleLowerCase('en-US')
}

/** All entered words must match; empty fields leave that dimension unrestricted. */
export function filterControls(
  availableControls: readonly Control[],
  filters: ControlFilters = {},
): Control[] {
  const words = (filters.query ?? '')
    .trim()
    .toLocaleLowerCase('en-US')
    .split(/\s+/)
    .filter(Boolean)

  return availableControls.filter((control) => {
    if (filters.frameworkId && control.frameworkId !== filters.frameworkId)
      return false
    if (filters.family && control.family !== filters.family) return false
    if (filters.level && control.level !== filters.level) return false

    const text = searchableText(control)
    return words.every((word) => text.includes(word))
  })
}
