import type { ContentEdition, LessonIdentity } from '../types/content'

export const editions: readonly ContentEdition[] = [
  {
    id: 'readme-example',
    frameworkId: 'cmmc',
    title: 'README teaching example',
    versionContext:
      'A project editorial edition based on the README’s simplified example. This is not an official CMMC release or a determination of which requirements apply.',
  },
]

/** An explicit homepage starting point; never substitute the first search result. */
export const defaultLesson: LessonIdentity = {
  frameworkId: 'cmmc',
  editionId: 'readme-example',
  controlKey: 'authorized-access',
}
