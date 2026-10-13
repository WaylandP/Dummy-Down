import { controls } from './controls'
import { defaultLesson, editions } from './editions'
import { frameworks } from './frameworks'

export { controls, explanationModes } from './controls'
export { defaultLesson, editions } from './editions'
export { frameworks } from './frameworks'
export { glossaryTerms } from './glossary'

/** Pure local catalog shared by address parsing and the Explorer controller. */
export const explorerCatalog = {
  frameworks,
  editions,
  controls,
  defaultLesson,
} as const
