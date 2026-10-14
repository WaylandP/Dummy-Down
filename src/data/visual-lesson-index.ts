import type { LessonIdentity } from '../types/content'

/** Small discovery index; the player, teaching text and styles load on request. */
export const visualLessonIdentities: readonly LessonIdentity[] = [
  {
    frameworkId: 'cmmc',
    editionId: 'cmmc-2-13-sep-2024',
    controlKey: 'ac-l1-b-1-i',
  },
  {
    frameworkId: 'cmmc',
    editionId: 'cmmc-2-13-sep-2024',
    controlKey: 'ia-l2-3-5-3',
  },
  {
    frameworkId: 'cmmc',
    editionId: 'cmmc-2-13-sep-2024',
    controlKey: 'ir-l3-3-6-2e',
  },
]

export function hasVisualExplanation(lesson: LessonIdentity) {
  return visualLessonIdentities.some(
    (item) =>
      item.frameworkId === lesson.frameworkId &&
      item.editionId === lesson.editionId &&
      item.controlKey === lesson.controlKey,
  )
}
