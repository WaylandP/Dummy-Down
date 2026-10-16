import type { GlossaryTerm, SourceReference } from '../types/content'
import { guideSource, levelOneGlossaryTerms } from './level-one-glossary'
import { cmmcProgramGlossaryTerms } from './cmmc-program-glossary'

const glossaryContext =
  'Teaching definition written for the September 2024 CMMC 2.13 snapshot, not an official definition.'

/** 32 CFR 170.4(b), the rule's definition of "User". */
const userDefinition: SourceReference = {
  id: 'cfr-32-170-4-user',
  title: '32 CFR § 170.4 — Definition of User',
  url: 'https://www.ecfr.gov/current/title-32/part-170/section-170.4',
  kind: 'official-publication',
  versionContext:
    'Title 32 CFR part 170 (CMMC Program), as codified at its December 16, 2024 effective date; the definition of User in paragraph (b). Read on 2026-10-15 from a pinned public corpus copy of the official text. The live site may carry later amendments.',
}

const authorization = guideSource(1, 16, 12, 'AC.L1-b.1.i')
const authorizationDiscussion = guideSource(
  1,
  17,
  13,
  'AC.L1-b.1.i: Discussion and Further Discussion',
)
const identification = guideSource(
  1,
  26,
  22,
  'IA.L1-b.1.v: Discussion',
  '2026-10-15',
)
const identificationConsiderations = guideSource(
  1,
  27,
  23,
  'IA.L1-b.1.v: Potential Assessment Considerations',
  '2026-10-15',
)
const authentication = guideSource(1, 28, 24, 'IA.L1-b.1.vi')
const personnelActions = guideSource(2, 185, 177, 'PS.L2-3.9.2', '2026-10-15')
const personnelActionsDiscussion = guideSource(
  2,
  186,
  178,
  'PS.L2-3.9.2: Further Discussion',
  '2026-10-15',
)

/** The first vocabulary, kept under its stable identifiers, now read from the guides. */
const accessGlossaryTerms: readonly GlossaryTerm[] = [
  {
    id: 'access-review',
    title: 'Access review',
    definition:
      'A check that the people, processes and devices with access to a system still match who is approved, so access left over after a transfer or departure is caught and removed. CMMC does not define the term, but the Level 1 guide lists account management compliance reviews, and records of transferred or departed employees, among the evidence for AC.L1-b.1.i.',
    reviewStatus: 'draft',
    versionContext: glossaryContext,
    sources: [authorization, authorizationDiscussion],
  },
  {
    id: 'account',
    title: 'Account',
    definition:
      'The record a system keeps for each user or service it lets in, tied to a unique identifier, usually a username, and to its permissions: what that holder may do. Service accounts used by scripts, automatic updates or scans count too.',
    reviewStatus: 'draft',
    versionContext: glossaryContext,
    sources: [
      identification,
      identificationConsiderations,
      authorizationDiscussion,
    ],
  },
  {
    id: 'authorized-user',
    title: 'Authorized user',
    definition:
      'A person, or a process acting for one, who has been approved to access a system. AC.L1-b.1.i checks that authorized users are identified and that system access is limited to them. A login that works does not, by itself, show approval.',
    reviewStatus: 'draft',
    versionContext: glossaryContext,
    sources: [authorization, userDefinition],
  },
  {
    id: 'device',
    title: 'Device',
    definition:
      'Equipment that connects to a system, such as a laptop, phone, printer or another system. AC.L1-b.1.i checks that devices authorized to connect are identified and that access is limited to them; IA.L1-b.1.v and b.1.vi add that each device is identified, for example by MAC or IP address, and verified before it gets access.',
    reviewStatus: 'draft',
    versionContext: glossaryContext,
    sources: [
      authorization,
      authorizationDiscussion,
      identification,
      authentication,
    ],
  },
  {
    id: 'offboarding',
    title: 'Offboarding',
    definition:
      'What an organization does when someone leaves or changes roles: closing or changing their accounts, revoking credentials, and collecting equipment, badges and keys. CMMC does not use the word. At Level 2, PS.L2-3.9.2 requires that systems containing CUI are protected during and after terminations and transfers, and that access and credentials end to match. At Level 1, records of departed employees are evidence for AC.L1-b.1.i.',
    reviewStatus: 'draft',
    versionContext: glossaryContext,
    sources: [personnelActions, personnelActionsDiscussion, authorization],
  },
  {
    id: 'process',
    title: 'Process',
    definition:
      'A program or automated task running on a system. CMMC treats processes acting on behalf of authorized users much like users: they are identified, limited to approved access and authenticated. The Level 1 guide’s examples are scripts, automatic updates, configuration updates and vulnerability scans, and it says each automatic process should be tied to the user who started it.',
    reviewStatus: 'draft',
    versionContext: glossaryContext,
    sources: [
      authorization,
      authorizationDiscussion,
      identificationConsiderations,
      authentication,
    ],
  },
]

/** Versioned educational vocabulary; publication does not imply expert review. */
export const glossaryTerms: readonly GlossaryTerm[] = [
  ...accessGlossaryTerms,
  ...levelOneGlossaryTerms,
  ...cmmcProgramGlossaryTerms,
]
