import type { Framework } from '../types/content'

/** Catalog entries describe scope; a planned entry does not imply control coverage. */
export const frameworks: readonly Framework[] = [
  {
    id: 'cmmc',
    name: 'Cybersecurity Maturity Model Certification',
    shortName: 'CMMC',
    description:
      '149 CMMC v2.13 source references with three teaching perspectives each, plus a simplified teaching example.',
    status: 'preview',
    levels: ['Level 1', 'Level 2', 'Level 3'],
    sourceUrl: 'https://dodcio.defense.gov/CMMC/',
  },
  {
    id: 'nist-sp-800-53',
    name: 'NIST SP 800-53',
    shortName: 'NIST 800-53',
    description:
      'Security and privacy controls. No learning content is available yet.',
    status: 'planned',
    levels: [],
    sourceUrl: 'https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final',
  },
  {
    id: 'fedramp',
    name: 'Federal Risk and Authorization Management Program',
    shortName: 'FedRAMP',
    description:
      'Federal cloud security. No learning content is available yet.',
    status: 'planned',
    levels: [],
    sourceUrl: 'https://www.fedramp.gov/',
  },
  {
    id: 'soc-2',
    name: 'System and Organization Controls 2',
    shortName: 'SOC 2',
    description:
      'Trust services criteria. No learning content is available yet.',
    status: 'planned',
    levels: [],
    sourceUrl: 'https://www.aicpa-cima.com/',
  },
  {
    id: 'iso-27001',
    name: 'ISO/IEC 27001',
    shortName: 'ISO 27001',
    description:
      'Information security management. No learning content is available yet.',
    status: 'planned',
    levels: [],
    sourceUrl: 'https://www.iso.org/standard/27001',
  },
  {
    id: 'hipaa',
    name: 'HIPAA Security Rule',
    shortName: 'HIPAA',
    description:
      'Protecting electronic health information. No learning content is available yet.',
    status: 'planned',
    levels: [],
    sourceUrl:
      'https://www.hhs.gov/hipaa/for-professionals/security/index.html',
  },
]
