import { frameworks } from '../data/content'

/** The frameworks being researched (docs/ROADMAP.md, Phase 4): not here yet. */
export const laterFrameworks = frameworks.filter(
  (framework) => framework.status === 'planned',
)

/** The Phase 4 research list, in the roadmap's words. */
const names = [
  'NIST SP 800-53',
  'FedRAMP',
  'SOC 2',
  'ISO/IEC 27001',
  'HIPAA Security Rule',
] as const

/** About's "More frameworks" line. */
export const laterFrameworkNames = names.join(', ')

/** Home's "Later" line: the Phase 4 research list, in its words. */
export const later = `More frameworks, one at a time: ${names.slice(0, -1).join(', ')}, the ${names[names.length - 1]}. Being researched; not here yet.`
