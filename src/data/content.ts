import { controls } from './controls'
import { referenceControls } from './cmmc-references'
import { defaultLesson, editions } from './editions'
import { frameworks } from './frameworks'

export { controls, explanationModes } from './controls'
export { cmmcSourceDocuments, referenceControls } from './cmmc-references'
export { defaultLesson, editions } from './editions'
export { frameworks } from './frameworks'
export { glossaryTerms } from './glossary'

/** Pure local catalog shared by address parsing and the Explorer controller. */
export const explorerCatalog = {
  frameworks,
  editions,
  controls: [...controls, ...referenceControls],
  defaultLesson,
} as const
