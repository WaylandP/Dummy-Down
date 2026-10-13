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
      'Versioned September 2024 model and assessment-guide quotations, acquired from pinned public PDF mirrors, with separately authored draft teaching perspectives. The latest DoD edition and present contract applicability have not been independently verified. Qualified editorial review of the teaching interpretations is pending.',
  },
]

/** An explicit homepage starting point; never substitute the first search result. */
export const defaultLesson: LessonIdentity = {
  frameworkId: 'cmmc',
  editionId: 'readme-example',
  controlKey: 'authorized-access',
}
