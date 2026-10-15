import type { SourceReference } from '../types/content'
import { numberWord } from './number-words'
import { cmmcProgramSources as pinned } from './cmmc-program-glossary'
import { referenceControls } from './cmmc-references'

/**
 * "CMMC in sixty seconds", the chalk talk on Home: eight scenes, each one
 * caption of twenty words or fewer, the parts of the one drawing it adds,
 * and where every fact in it rests. The counts come from the catalog; every
 * line was checked against the pinned text named beside it, and the pinned
 * text controls wherever they differ. The last scene is about this site and
 * rests on nothing but it.
 */

/** Where a line rests: a pinned publication, the section and paragraph, and the words there. */
export interface ChalkTalkSource {
  readonly reference: SourceReference
  /** The section and paragraph, as the publication numbers them. */
  readonly where: string
  /** The words there that the line rests on, verbatim. */
  readonly quote: string
}

/** A word of a caption that opens its glossary popover. */
export interface ChalkTalkWord {
  /** The words as they appear in the caption, once. */
  readonly phrase: string
  /** The glossary term's id. */
  readonly term: string
}

/** The parts of the drawing, in the order the scenes add them. */
export type ChalkTalkPart =
  | 'dod'
  | 'shares'
  | 'contractor'
  | 'fci'
  | 'cui'
  | 'level-1'
  | 'level-2'
  | 'level-3'
  | 'assessed'
  | 'status'
  | 'current'

export interface ChalkTalkScene {
  readonly id: string
  /** Twenty words or fewer. */
  readonly caption: string
  readonly words: readonly ChalkTalkWord[]
  readonly parts: readonly ChalkTalkPart[]
  /** Empty only for the scene about this site. */
  readonly sources: readonly ChalkTalkSource[]
  readonly links?: readonly { readonly href: string; readonly label: string }[]
}

export const chalkTalkTitle = 'CMMC in sixty seconds'
/** Eight scenes of about this many seconds: a minute in all. */
export const sceneSeconds = 7.5

const count = (level: string) =>
  referenceControls.filter((control) => control.level === level).length
const levelOne = count('Level 1')
const levelTwo = count('Level 2')
const levelThree = count('Level 3')

const source = (
  reference: SourceReference,
  where: string,
  quote: string,
): ChalkTalkSource => ({ reference, where, quote })

export const chalkTalkScenes: readonly ChalkTalkScene[] = [
  {
    id: 'shares',
    caption:
      'The Department of Defense shares information with the companies it contracts with.',
    words: [],
    parts: ['dod', 'shares', 'contractor'],
    sources: [
      source(
        pinned.purpose,
        '§ 170.1(d)',
        'The CMMC Program balances the need to safeguard FCI and CUI and the requirement to share information appropriately with defense contractors in order to develop capabilities for the DoD.',
      ),
    ],
  },
  {
    id: 'fci-cui',
    caption:
      'Some of it is Federal Contract Information (FCI). Some is Controlled Unclassified Information (CUI).',
    words: [
      { phrase: 'Federal Contract Information (FCI)', term: 'fci' },
      { phrase: 'Controlled Unclassified Information (CUI)', term: 'cui' },
    ],
    parts: ['fci', 'cui'],
    sources: [
      source(
        pinned.purpose,
        '§ 170.1(a)',
        'establishes requirements for defense contractors and subcontractors to implement prescribed cybersecurity standards for safeguarding Federal Contract Information (FCI) and Controlled Unclassified Information (CUI)',
      ),
      source(
        pinned.dfars7021,
        '(a) Definitions, “Federal contract information (FCI)”',
        'information, not intended for public release, that is provided by or generated for the Government under a contract to develop or deliver a product or service to the Government',
      ),
      source(
        pinned.dfars7021,
        '(a) Definitions, “Controlled unclassified information”',
        'information the Government creates or possesses, or information an entity creates or possesses for or on behalf of the Government, that a law, regulation, or Governmentwide policy requires or permits an agency to handle using safeguarding or dissemination controls',
      ),
    ],
  },
  {
    id: 'level-1',
    caption: `FCI: Level 1, ${numberWord(levelOne)} basic requirements, self-assessed.`,
    words: [{ phrase: 'FCI', term: 'fci' }],
    parts: ['level-1'],
    sources: [
      source(
        pinned.scoping,
        '§ 170.19(b)(1)',
        'OSA information systems which process, store, or transmit FCI are in scope for CMMC Level 1 and must be self-assessed against applicable CMMC security requirements.',
      ),
      source(
        pinned.definitions,
        '§ 170.4(b), “CMMC Security Requirements”',
        'the 15 Level 1 requirements listed in the 48 CFR 52.204-21(b)(1)',
      ),
      source(
        pinned.farClause,
        '(b)(1)',
        'The Contractor shall apply the following basic safeguarding requirements and procedures to protect covered contractor information systems',
      ),
    ],
  },
  {
    id: 'level-2',
    caption: `CUI: Level 2, the ${levelTwo} requirements of NIST SP 800-171, self-assessed or certified by a C3PAO. The contract says which.`,
    words: [
      { phrase: 'CUI', term: 'cui' },
      { phrase: 'C3PAO', term: 'c3pao' },
    ],
    parts: ['level-2'],
    sources: [
      source(
        pinned.flowdown,
        '§ 170.23(a)(2)',
        'If a subcontractor will process, store, or transmit CUI in performance of the subcontract, then a CMMC Status of Level 2 (Self) is the minimum requirement for the subcontractor.',
      ),
      source(
        pinned.definitions,
        '§ 170.4(b), “CMMC Security Requirements”',
        'the 110 Level 2 requirements from NIST SP 800-171 R2',
      ),
      source(
        pinned.levelTwoSelf,
        '§ 170.16(a)',
        'An OSA conducts a Level 2 self-assessment as detailed in paragraph (c) of this section to achieve a CMMC Status of either Conditional or Final Level 2 (Self).',
      ),
      source(
        pinned.levelTwoCert,
        '§ 170.17(a)',
        'An OSC undergoes a Level 2 certification assessment as detailed in paragraph (c) of this section to achieve a CMMC Status of either Conditional or Final Level 2 (C3PAO).',
      ),
      source(
        pinned.definitions,
        '§ 170.4(b), “CMMC Third-Party Assessment Organization (C3PAO)”',
        'an organization that has been authorized or accredited by the Accreditation Body to conduct Level 2 certification assessments',
      ),
      source(
        pinned.dfars7021,
        '(d)(1)(i)',
        'Have and maintain for the duration of the contract a current CMMC status at the following CMMC level, or higher: ____________ [Contracting Officer insert: CMMC Level 1 (Self); CMMC Level 2 (Self); CMMC Level 2 (C3PAO); or CMMC Level 3 (DIBCAC) ]',
      ),
    ],
  },
  {
    id: 'level-3',
    caption: `Its most critical programs: Level 3, ${levelThree} more requirements from NIST SP 800-172, assessed by the Government’s DIBCAC.`,
    words: [{ phrase: 'DIBCAC', term: 'dibcac' }],
    parts: ['level-3'],
    sources: [
      source(
        pinned.policy,
        '§ 170.5(a)',
        'In general, the Department will identify a requirement for a CMMC Status of Level 3 (DIBCAC) for solicitations and resulting contracts supporting its most critical programs and technologies.',
      ),
      source(
        pinned.definitions,
        '§ 170.4(b), “CMMC Security Requirements”',
        'the 24 Level 3 requirements selected from NIST SP 800-172 Feb2021',
      ),
      source(
        pinned.definitions,
        '§ 170.4(b), “CMMC Assessment” (iv)',
        'Level 3 certification assessment is the term for the activity performed by the DCMA DIBCAC to evaluate the information system of an OSC when seeking a CMMC Status of Level 3 (DIBCAC).',
      ),
      source(
        pinned.levelThree,
        '§ 170.18(a)',
        'A CMMC Status of Final Level 2 (C3PAO) for information systems within the Level 3 CMMC Assessment Scope is a prerequisite to undergo a Level 3 certification assessment.',
      ),
    ],
  },
  {
    id: 'status',
    caption:
      'Meeting the minimum score earns a status, stored in SPRS, and an Affirming Official affirms continuing compliance.',
    words: [
      { phrase: 'SPRS', term: 'sprs' },
      { phrase: 'Affirming Official', term: 'affirming-official' },
    ],
    parts: ['assessed', 'status'],
    sources: [
      source(
        pinned.dfars7021,
        '(a) Definitions, “Cybersecurity Maturity Model Certification (CMMC) status”',
        'the result of meeting or exceeding the minimum required score for the corresponding assessment',
      ),
      source(
        pinned.definitions,
        '§ 170.4(b), “CMMC Status”',
        'CMMC Status is the result of meeting or exceeding the minimum required score for the corresponding assessment. The CMMC Status of an OSA information system is officially stored in SPRS and additionally presented on a Certificate of CMMC Status, if the assessment was conducted by a C3PAO or DCMA DIBCAC.',
      ),
      source(
        pinned.affirmation,
        '§ 170.22(a)',
        'An Affirming Official from each OSA, whether a prime or subcontractor, must affirm the continuing compliance of their respective organizations with the specified security requirement after every assessment, including POA&M closeout, and annually thereafter. Affirmations are entered electronically in SPRS.',
      ),
      source(
        pinned.affirmation,
        '§ 170.22(a)(1)',
        'The Affirming Official is the senior level representative from within each Organization Seeking Assessment (OSA) who is responsible for ensuring the OSA’s compliance with the CMMC Program requirements and has the authority to affirm the OSA’s continuing compliance with the specified security requirements for their respective organizations.',
      ),
    ],
  },
  {
    id: 'clause',
    caption:
      'The contract clause, DFARS 252.204-7021, requires a current status at the level it names.',
    words: [{ phrase: 'DFARS 252.204-7021', term: 'dfars-252-204-7021' }],
    parts: ['current'],
    sources: [
      source(
        pinned.dfars7021,
        '(d)(1)(i)',
        'Have and maintain for the duration of the contract a current CMMC status at the following CMMC level, or higher: ____________ [Contracting Officer insert: CMMC Level 1 (Self); CMMC Level 2 (Self); CMMC Level 2 (C3PAO); or CMMC Level 3 (DIBCAC) ] for all information systems used in performance of the contract, task order, or delivery order that process, store, or transmit FCI or CUI',
      ),
    ],
  },
  {
    id: 'board',
    caption:
      'Every word here is in the glossary, and every control is on this board.',
    words: [],
    parts: [],
    sources: [],
    links: [
      { href: '/glossary', label: 'the glossary' },
      {
        href: '/learn?view=discover&collection=references',
        label: 'this board',
      },
    ],
  },
]

/** The one drawing, in the order the scenes draw it. */
export const chalkTalkParts: readonly ChalkTalkPart[] = chalkTalkScenes.flatMap(
  (scene) => scene.parts,
)
