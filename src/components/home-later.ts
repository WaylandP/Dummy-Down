import { frameworks } from '../data/content'

/** The frameworks being researched (docs/ROADMAP.md, Phase 4): not here yet. */
export const laterFrameworks = frameworks.filter(
  (framework) => framework.status === 'planned',
)

/** The Phase 4 research list, in the roadmap's words: About's "More frameworks" line. */
export const laterFrameworkNames =
  'NIST SP 800-53, FedRAMP, SOC 2, ISO/IEC 27001, HIPAA Security Rule'
