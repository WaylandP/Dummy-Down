import { frameworks } from '../data/content'

/** The frameworks being researched (docs/ROADMAP.md, Phase 4): not here yet. */
export const laterFrameworks = frameworks.filter(
  (framework) => framework.status === 'planned',
)

/** Home's "Later" line: the Phase 4 research list, in its words. */
export const later =
  'More frameworks, one at a time: NIST SP 800-53, FedRAMP, SOC 2, ISO/IEC 27001, the HIPAA Security Rule. Being researched; not here yet.'
