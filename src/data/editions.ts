import type { ContentEdition, LessonIdentity } from '../types/content'

export const editions: readonly ContentEdition[] = [
  {
    id: 'readme-example',
    frameworkId: 'cmmc',
    title: 'README teaching example',
    kind: 'project',
    versionContext:
      'A project editorial edition based on the README’s simplified example. This is not an official CMMC release or a determination of which requirements apply.',
  },
  {
    id: 'cmmc-2-13-sep-2024',
    frameworkId: 'cmmc',
    title: 'CMMC 2.13 · September 2024 snapshot',
    kind: 'publication',
    versionContext:
      'Versioned September 2024 model and assessment-guide quotations, acquired from pinned public PDF mirrors. The latest DoD edition and present contract applicability have not been independently verified. Learning explanations for these references have not been written or reviewed.',
  },
]

/** An explicit homepage starting point; never substitute the first search result. */
export const defaultLesson: LessonIdentity = {
  frameworkId: 'cmmc',
  editionId: 'readme-example',
  controlKey: 'authorized-access',
}
