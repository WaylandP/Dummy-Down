import type { ReferenceControl } from '../types/content'
import type { AssessmentStatement } from '../types/coverage'
import inventory from './cmmc-objectives.json'

const statements = inventory.objectives as readonly AssessmentStatement[]
const byControl = new Map<string, AssessmentStatement[]>()
for (const statement of statements) {
  const list = byControl.get(statement.controlId) ?? []
  list.push(statement)
  byControl.set(statement.controlId, list)
}

/** The pinned guide's statements for one control, verbatim and in guide order. */
export function assessmentObjectivesFor(
  control: Pick<ReferenceControl, 'frameworkId' | 'editionId' | 'id'>,
): readonly AssessmentStatement[] {
  if (
    control.frameworkId !== inventory.frameworkId ||
    control.editionId !== inventory.editionId
  )
    return []
  return byControl.get(control.id) ?? []
}
