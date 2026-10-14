import type { GlossaryTerm, SourceReference } from '../types/content'
import { cmmcSourceDocuments } from './cmmc-references'

const snapshotContext =
  'Teaching definition written for the September 2024 CMMC 2.13 snapshot, not an official definition.'

function guideSource(
  level: 1 | 2,
  pdfPage: number,
  printedPage: number,
  section: string,
): SourceReference {
  const document = cmmcSourceDocuments.find(
    (source) => source.id === `cmmc-assessment-l${level}-213`,
  )
  if (!document) throw new Error(`Missing Level ${level} glossary source`)

  return {
    id: `glossary-cmmc-l${level}-213-page-${pdfPage}`,
    title: `${document.title} — ${section}`,
    url: `${document.url}#page=${pdfPage}`,
    kind: 'official-publication',
    versionContext:
      `Version ${document.version}, September 2024; PDF page ${pdfPage} ` +
      `(printed page ${printedPage}). Source checked on 2026-10-13 from the ` +
      'pinned public PDF mirror. Direct official-host access was blocked; the latest ' +
      'edition and current applicability have not been independently verified.',
  }
}

const introduction = guideSource(1, 5, 1, 'Introduction: FCI definition')
const scope = guideSource(1, 6, 2, 'Assessment Scope')
const objective = guideSource(
  1,
  7,
  3,
  'CMMC-Custom Terms: Assessment Objective',
)
const system = guideSource(1, 8, 4, 'CMMC-Custom Terms: Information System')
const authorization = guideSource(1, 16, 12, 'AC.L1-b.1.i')
const authorizationDiscussion = guideSource(
  1,
  17,
  13,
  'AC.L1-b.1.i: Discussion and Further Discussion',
)
const publicInformation = guideSource(1, 24, 20, 'AC.L1-b.1.iv')
const publicInformationDiscussion = guideSource(
  1,
  25,
  21,
  'AC.L1-b.1.iv: Discussion and Further Discussion',
)
const authentication = guideSource(1, 28, 24, 'IA.L1-b.1.vi')
const authenticationDiscussion = guideSource(
  1,
  29,
  25,
  'IA.L1-b.1.vi: Discussion and Further Discussion',
)
const media = guideSource(1, 31, 27, 'MP.L1-b.1.vii')
const mediaDiscussion = guideSource(
  1,
  32,
  28,
  'MP.L1-b.1.vii: Discussion and Further Discussion',
)
const boundary = guideSource(1, 38, 34, 'SC.L1-b.1.x')
const boundaryDiscussion = guideSource(
  1,
  39,
  35,
  'SC.L1-b.1.x: Discussion and Further Discussion',
)
const maliciousCode = guideSource(
  1,
  47,
  43,
  'SI.L1-b.1.xiii: Discussion and Further Discussion',
)
const cui = guideSource(2, 9, 1, 'Introduction: CUI definition')

/** Vocabulary encountered in the Level 1 lessons; these are original drafts. */
export const levelOneGlossaryTerms: readonly GlossaryTerm[] = [
  {
    id: 'fci',
    title: 'Federal Contract Information (FCI)',
    definition:
      'Information not intended for public release that the Government provides, or that someone creates for the Government, under a contract to develop or deliver a product or service. Government information already shared with the public and simple transactional information, such as details needed to process payments, are excluded. FCI is a defined category, not a label for every private company document.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [introduction],
  },
  {
    id: 'cui',
    title: 'Controlled Unclassified Information (CUI)',
    definition:
      'Information the Government creates or possesses, or that others create or possess for or on its behalf, where law, regulation or government-wide policy requires or allows an agency to apply safeguards or limits on sharing. CUI excludes classified information and unrelated private information without the government connection described by the rule. These Level 1 examples address Federal Contract Information, a different defined category; Level 1 explanations do not establish that CUI requirements are met.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [cui, introduction],
  },
  {
    id: 'authorization',
    title: 'Authorization',
    definition:
      'Giving a person, a program acting for them, or a device permission to enter a system or use a resource. Authorization is the permission decision; authentication is the separate check of a claimed identity.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [authorization, authorizationDiscussion, authentication],
  },
  {
    id: 'authentication',
    title: 'Authentication',
    definition:
      'Checking that a person, running program or device is who or what it claims to be before allowing access. For example, a sign-in check tests a claimed identity. Passing that check does not itself grant permission.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [authentication, authenticationDiscussion, authorization],
  },
  {
    id: 'information-system',
    title: 'Information system',
    definition:
      'An organized set of resources used to collect, use, store, share or dispose of information. It can include multiple computers, programs and supporting resources; it does not mean only one laptop.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [system],
  },
  {
    id: 'publicly-accessible-system',
    title: 'Publicly accessible system',
    definition:
      'A system the public can reach and use, typically without proving identity, such as a company’s public website. For this control, the concern is company-controlled systems used to post or process information; being online alone does not make every system public.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [publicInformation, publicInformationDiscussion],
  },
  {
    id: 'media',
    title: 'Media',
    definition:
      'Something that holds recorded information, such as paper, a USB drive or storage inside a printer or copier. Media can be digital or non-digital; it is not limited to removable computer drives.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [media, mediaDiscussion],
  },
  {
    id: 'media-sanitization',
    title: 'Media sanitization',
    definition:
      'Treating recorded information so it cannot be recovered or reconstructed from the media being released for reuse or disposal. The suitable method depends on the media and intended next use; deleting a file or using an ordinary format does not, by itself, establish this outcome.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [media, mediaDiscussion],
  },
  {
    id: 'disposal',
    title: 'Disposal',
    definition:
      'Taking storage or paper out of use and releasing it, for example to a recycler or waste service. For media containing Federal Contract Information, the cited Level 1 objective calls for sanitizing or destroying it before disposal; putting it in a bin is not a sanitization method.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [media, mediaDiscussion],
  },
  {
    id: 'reuse',
    title: 'Reuse',
    definition:
      'Putting media into service again, such as reassigning a storage drive or passing it to someone else. For media containing Federal Contract Information, the cited Level 1 objective calls for sanitization before release for reuse; destroying a drive cannot prepare that drive for reuse.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [media, mediaDiscussion],
  },
  {
    id: 'assessment-objective',
    title: 'Assessment objective',
    definition:
      'A set of statements describing outcomes to check when assessing a requirement. Objectives help break one requirement into specific questions; all applicable objectives matter. Completing an educational quiz or collecting a suggested document does not establish that those outcomes are met.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [objective],
  },
  {
    id: 'assessment-scope',
    title: 'Assessment scope',
    definition:
      'The systems and other resources included in an assessment. In this Level 1 guide, resources that process, store or transmit Federal Contract Information are in scope. Scope is established for the organization’s environment; the examples in this app do not determine it.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [scope],
  },
  {
    id: 'malicious-code',
    title: 'Malicious code',
    definition:
      'Software written to carry out harmful, unauthorized activity, such as secretly collecting information, damaging files or blocking access for ransom. It can arrive in files, email, websites or removable storage; it is not limited to one kind of computer virus.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [maliciousCode],
  },
  {
    id: 'system-boundary',
    title: 'System boundary',
    definition:
      'The division between a system and what is outside it, or between important parts inside it. Communications cross these boundaries. The Level 1 requirement covers external and key internal boundaries, not only the internet connection.',
    reviewStatus: 'draft',
    versionContext: snapshotContext,
    sources: [boundary, boundaryDiscussion],
  },
]
