import type { SourceReference } from '../types/content'

export const projectReadmeSource: SourceReference = {
  id: 'project-readme',
  title: 'Dummy-Down README — simplified example',
  url: 'https://github.com/WaylandP/Dummy-Down/blob/5cc78c255224d3a8cbaa9ab3dd52ee19be28f076/README.md#example-making-a-control-understandable',
  kind: 'project-readme',
  versionContext:
    'Project README snapshot used as this draft’s educational starting point.',
}

export const authorizedAccessSources: readonly SourceReference[] = [
  projectReadmeSource,
  {
    id: 'dod-cmmc-resources',
    title: 'DoD CMMC resources and documentation',
    url: 'https://dodcio.defense.gov/CMMC/Resources-Documentation/',
    kind: 'official-resource-index',
    versionContext:
      'Official resource index. Consult the applicable level, version, and assessment guidance; this draft does not claim coverage of them.',
  },
  {
    id: 'nist-800-171-rev-2',
    title: 'NIST SP 800-171 Rev. 2',
    url: 'https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final',
    kind: 'official-publication',
    versionContext:
      'Revision 2 publication linked by the README. Later NIST revisions exist; a publication update alone does not establish which version applies to a CMMC assessment.',
  },
]
