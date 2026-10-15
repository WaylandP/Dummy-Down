import { defaultLesson } from '../../data/content'
import { createLessonUrl } from '../../state/explorer-state'
import { readChalkPreference } from '../../state/chalk-preference'

/** The first lesson, in the chalk the visitor picked on Home. */
export function learnUrl() {
  return createLessonUrl(
    defaultLesson,
    readChalkPreference() ?? 'beginner',
    new URL('/learn', window.location.origin),
  ).replace(window.location.origin, '')
}
