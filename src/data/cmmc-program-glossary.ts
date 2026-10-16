import type { GlossaryTerm, SourceReference } from '../types/content'
import { guideSource } from './level-one-glossary'

/**
 * Vocabulary of the CMMC Program itself: statuses, roles, scoping categories
 * and the contract clauses that carry the requirements. Definitions are
 * written in plain language from the cited regulation or clause text; the
 * source wording always controls.
 */
const programContext =
  'Plain-language teaching definition written from the cited regulation or contract clause as read on 2026-10-14. Not the official wording; the cited text controls.'

const checked =
  'Read on 2026-10-14 from a pinned public corpus copy of the official text. The live site may carry later amendments.'

const cfr170 = (
  section: string,
  title: string,
  detail: string,
): SourceReference => ({
  id: `cfr-32-170-${section.replace(/\./g, '-')}`,
  title: `32 CFR § 170.${section} — ${title}`,
  url: `https://www.ecfr.gov/current/title-32/part-170/section-170.${section}`,
  kind: 'official-publication',
  versionContext: `Title 32 CFR part 170 (CMMC Program), as codified at its December 16, 2024 effective date; ${detail}. ${checked}`,
})

const definitions = cfr170(
  '4',
  'Acronyms and definitions',
  'definitions in paragraph (b)',
)
const scoping = cfr170(
  '19',
  'CMMC scoping',
  'scope at each level in paragraphs (b) to (d) and the tables to them',
)
const poamRules = cfr170(
  '21',
  'Plan of Action and Milestones requirements',
  'paragraph (a)',
)
const levelOne = cfr170(
  '15',
  'CMMC Level 1 self-assessment and affirmation requirements',
  'paragraph (a)',
)
const levelTwoSelf = cfr170(
  '16',
  'CMMC Level 2 self-assessment and affirmation requirements',
  'paragraph (a)',
)
const levelTwoCert = cfr170(
  '17',
  'CMMC Level 2 certification assessment and affirmation requirements',
  'paragraph (a)',
)
const levelThree = cfr170(
  '18',
  'CMMC Level 3 certification assessment and affirmation requirements',
  'paragraph (a)',
)

const cuiRule: SourceReference = {
  id: 'cfr-32-2002-4',
  title: '32 CFR § 2002.4 — Definitions (Controlled Unclassified Information)',
  url: 'https://www.ecfr.gov/current/title-32/part-2002/section-2002.4',
  kind: 'official-publication',
  versionContext: `Title 32 CFR part 2002, definition of CUI in paragraph (h). ${checked}`,
}

const farClause: SourceReference = {
  id: 'far-52-204-21',
  title:
    'FAR 52.204-21 — Basic Safeguarding of Covered Contractor Information Systems',
  url: 'https://www.acquisition.gov/far/52.204-21',
  kind: 'official-publication',
  versionContext: `Federal Acquisition Regulation clause (November 2021 edition); definitions in paragraph (a). ${checked}`,
}

const dfars = (
  number: string,
  slug: string,
  title: string,
  edition: string,
): SourceReference => ({
  id: `dfars-252-204-${number}`,
  title: `DFARS 252.204-${number} — ${title}`,
  url: `https://www.acquisition.gov/dfars/252.204-${number}-${slug}`,
  kind: 'official-publication',
  versionContext: `Defense Federal Acquisition Regulation Supplement clause text, ${edition} edition. ${checked}`,
})

const dfars7012 = dfars(
  '7012',
  'safeguarding-covered-defense-information-and-cyber-incident-reporting',
  'Safeguarding Covered Defense Information and Cyber Incident Reporting',
  'May 2024',
)
const dfars7019 = dfars(
  '7019',
  'notice-nist-sp-800-171-dod-assessment-requirements',
  'Notice of NIST SP 800-171 DoD Assessment Requirements',
  'November 2023',
)
const dfars7020 = dfars(
  '7020',
  'nist-sp-800-171-dod-assessment-requirements',
  'NIST SP 800-171 DoD Assessment Requirements',
  'November 2023',
)
const dfars7021 = dfars(
  '7021',
  'contractor-compliance-cybersecurity-maturity-model-certification-level-requirements',
  'Contractor Compliance With the CMMC Level Requirements',
  'November 2025',
)

const purpose = cfr170('1', 'Purpose', 'paragraph (d)')
const policy = cfr170('5', 'Policy', 'paragraph (a)')
const affirmation = cfr170('22', 'Affirmation', 'paragraph (a)')
const flowdown = cfr170('23', 'Flowdown requirements', 'paragraph (a)(2)')
const scoring = cfr170(
  '24',
  'CMMC scoring methodology',
  'paragraph (b)(1)(ii), temporary deficiencies scored MET',
)

/** The 2026 FAR overhaul class deviation that renumbers the assessment clause. */
const deviation7997: SourceReference = {
  id: 'dfars-deviation-2026-o0025-r3',
  title:
    'DFARS Class Deviation 2026-O0025, Revision 3 — FAR Part 40 and DFARS Part 240',
  url: 'https://www.acq.osd.mil/dpap/dars/classdev/DFARS_RFO/Part-240/2026-O0025_Rev3_TAB_A_Deviation_Memo.pdf',
  kind: 'official-publication',
  versionContext:
    'Revision 3, signed September 3, 2026; DFARS 240.370-5(d) and the clause at 252.240-7997. Read on 2026-10-15 from a pinned public corpus copy (SHA-256 c836278a…); the official host refused the connection from the check environment.',
}

/** Executive Order 14347, the Department of War as a secondary title. */
const departmentOfWar: SourceReference = {
  id: 'eo-14347',
  title:
    'Executive Order 14347 — Restoring the United States Department of War',
  url: 'https://www.govinfo.gov/content/pkg/FR-2025-09-10/pdf/2025-17508.pdf',
  kind: 'official-publication',
  versionContext:
    'Federal Register Vol. 90, No. 173, September 10, 2025 (document 2025-17508); signed September 5, 2025. Sections 1 and 2 authorize Department of War as a secondary title. Read on 2026-10-15 in the Federal Register text edition.',
}

const sspAtLevelOne = guideSource(1, 16, 12, 'AC.L1-b.1.i')
const thirdPartyHelp = guideSource(1, 6, 2, 'Assessment Scope')
const sspAtLevelTwo = guideSource(
  2,
  217,
  209,
  'CA.L2-3.12.4: Further Discussion',
  '2026-10-15',
)

/** The pinned records the chalk talk's script rests on, shared with the glossary. */
export const cmmcProgramSources = {
  purpose,
  definitions,
  policy,
  levelOne,
  levelTwoSelf,
  levelTwoCert,
  levelThree,
  scoping,
  affirmation,
  flowdown,
  farClause,
  dfars7021,
} as const

const scopingGuideL2: SourceReference = {
  id: 'cmmc-scoping-guide-l2-213-page-13',
  title: 'CMMC Level 2 Scoping Guide — Use of Enclaves',
  url: 'https://dodcio.defense.gov/Portals/0/Documents/CMMC/ScopingGuideL2v2.pdf#page=13',
  kind: 'official-publication',
  versionContext:
    'Version 2.13, September 2024; PDF page 13 (printed page 9). Read on 2026-10-14 from a pinned public PDF mirror (SHA-256 377b758393908d6c…); the official host was not reachable from the check environment.',
}

function term(
  id: string,
  title: string,
  definition: string,
  sources: readonly SourceReference[],
): GlossaryTerm {
  return {
    id,
    title,
    definition,
    reviewStatus: 'draft',
    versionContext: programContext,
    sources,
  }
}

export const cmmcProgramGlossaryTerms: readonly GlossaryTerm[] = [
  term(
    'cmmc',
    'Cybersecurity Maturity Model Certification (CMMC)',
    'The Department of Defense program that checks whether a contractor’s information systems protect Federal Contract Information and Controlled Unclassified Information. It is set out in 32 CFR part 170 and reaches contractors through the DFARS 252.204-7021 clause, which names the CMMC level a contract requires. There are three levels, each tied to an existing set of security requirements. Since September 2025 the Department also uses the secondary title Department of War (DoW), and newer CMMC documents use it.',
    [definitions, dfars7021, departmentOfWar],
  ),
  term(
    'cmmc-levels',
    'CMMC Levels 1, 2 and 3',
    'Level 1 covers the 15 basic safeguarding requirements from FAR 52.204-21 and is always a self-assessment. Level 2 covers the 110 requirements of NIST SP 800-171 Revision 2 and is either self-assessed or assessed by a C3PAO, depending on the contract. Level 3 adds 24 requirements selected from NIST SP 800-172 and is assessed by the Government’s DIBCAC. A Level 3 assessment requires a Final Level 2 (C3PAO) status first.',
    [definitions, levelOne, levelTwoSelf, levelTwoCert, levelThree],
  ),
  term(
    'cmmc-status',
    'CMMC Status (Conditional and Final)',
    'The result of meeting or exceeding the minimum score on an assessment, recorded in SPRS for each assessed system and named by level and assessor, such as Final Level 2 (C3PAO). A failed assessment gives no status. “Final” means every requirement was met. “Conditional” means the score reached the minimum with some requirements still open on a POA&M, which must close within 180 days or the status expires. Under DFARS 252.204-7021 a status stays current for 180 days if Conditional, 1 year for Final Level 1, and 3 years for Final Level 2 or Final Level 3, each with an affirmation every year.',
    [definitions, dfars7021],
  ),
  term(
    'self-assessment',
    'Self-assessment',
    'An assessment an organization performs on its own systems and enters in SPRS, using the same criteria an outside assessor would. Level 1 is always self-assessed, every year. Level 2 (Self) is repeated every three years, with an affirmation each year. Hiring a consultant to help still makes it a self-assessment, not a certification.',
    [definitions, levelOne, levelTwoSelf, thirdPartyHelp],
  ),
  term(
    'certification-assessment',
    'Certification assessment',
    'An assessment performed by an outside party rather than by the organization itself: a C3PAO for Level 2 (C3PAO), or the Government’s DIBCAC for Level 3 (DIBCAC). The assessor submits results and any certificate through the CMMC instance of eMASS, and the status appears in SPRS.',
    [definitions, levelTwoCert, levelThree],
  ),
  term(
    'c3pao',
    'CMMC Third-Party Assessment Organization (C3PAO)',
    'A company authorized or accredited by the CMMC Accreditation Body to conduct Level 2 certification assessments. A C3PAO must be independent of the organizations it assesses and is itself assessed by DIBCAC before it can operate.',
    [definitions],
  ),
  term(
    'dibcac',
    'DIBCAC',
    'The Defense Contract Management Agency’s Defense Industrial Base Cybersecurity Assessment Center, the Government team that conducts Level 3 certification assessments and the “High” NIST SP 800-171 DoD Assessments described in DFARS 252.204-7020 (252.240-7997 in contracts under the 2026 class deviation).',
    [definitions, levelThree, dfars7020, deviation7997],
  ),
  term(
    'osa',
    'Organization Seeking Assessment (OSA)',
    'Any organization undergoing a self-assessment or certification assessment for a system in order to obtain or keep a CMMC status. It is the general term; every Organization Seeking Certification is also an OSA.',
    [definitions],
  ),
  term(
    'osc',
    'Organization Seeking Certification (OSC)',
    'An organization undergoing a certification assessment, meaning one performed by a C3PAO for Level 2 or by DIBCAC for Level 3. The term distinguishes those organizations from ones only self-assessing.',
    [definitions],
  ),
  term(
    'affirming-official',
    'Affirming Official and affirmation',
    'The senior person inside an organization who is responsible for its CMMC compliance and has the authority to affirm, in SPRS, that the organization continues to meet the requirements for its CMMC status. The affirmation is made when a status is first obtained and then every year, and contracts require it to stay current.',
    [definitions, dfars7021],
  ),
  term(
    'sprs',
    'Supplier Performance Risk System (SPRS)',
    'The DoD system where contractors post NIST SP 800-171 DoD Assessment scores and where CMMC statuses, status dates and annual affirmations are recorded for each assessed system. Before awarding a contract that requires CMMC, the contracting officer checks SPRS for a current status at the required level.',
    [affirmation, dfars7021, deviation7997],
  ),
  term(
    'poam',
    'Plan of Action and Milestones (POA&M)',
    'A document that lists the requirements not yet met after an assessment, the tasks and resources needed to close them, and dates for finishing. In CMMC a POA&M is allowed only in limited circumstances: never at Level 1, and at Level 2 or 3 only for certain requirements and only if the assessment still reaches the minimum score. Everything on it must be closed within 180 days, verified by a closeout assessment, or the Conditional status expires.',
    [definitions, poamRules],
  ),
  term(
    'operational-plan-of-action',
    'Operational plan of action',
    'The organization’s own running list of temporary deficiencies and vulnerabilities (a missing patch, an interim configuration) and how each will be fixed. It is required by security requirement CA.L2-3.12.2 and is kept continuously. It is not a POA&M: it has no fixed deadline and is not tied to an assessment result.',
    [definitions],
  ),
  term(
    'ssp',
    'System Security Plan (SSP)',
    'The formal document that describes an information system and how each security requirement is implemented or planned: the components inside it, the environment it runs in, and its connections to other systems. Required at Levels 2 and 3 (CA.L2-3.12.4): without an up-to-date SSP an assessment cannot be completed. Recommended, but not required, at Level 1.',
    [definitions, sspAtLevelTwo, sspAtLevelOne],
  ),
  term(
    'cmmc-assessment-scope',
    'CMMC Assessment Scope',
    'The set of all assets in an organization’s environment that will be assessed against the CMMC requirements, fixed before the assessment starts. At Level 1 it is the systems that process, store or transmit FCI. At Level 2 every asset is placed in a category that decides how it is treated: CUI Assets, Security Protection Assets, Contractor Risk Managed Assets, Specialized Assets or Out-of-Scope Assets. Level 3 has no Contractor Risk Managed Assets category; those assets count as CUI Assets.',
    [definitions, scoping],
  ),
  term(
    'cui-assets',
    'CUI Assets',
    'Assets that process, store or transmit Controlled Unclassified Information. These are fully in scope and are assessed against every applicable requirement.',
    [definitions, scoping],
  ),
  term(
    'security-protection-assets',
    'Security Protection Assets (SPA)',
    'Assets that provide security functions or capabilities for the assessment scope, such as a firewall, an identity provider, a log collector, or the server that pushes endpoint protection. They are in scope and assessed against the requirements that apply to the protection they provide, even if they never touch CUI themselves.',
    [definitions, scoping],
  ),
  term(
    'security-protection-data',
    'Security Protection Data (SPD)',
    'Data that Security Protection Assets hold or produce to protect the environment: configuration data, log files, vulnerability and configuration status of in-scope assets, and passwords that grant access to the environment. If an outside provider handles SPD, that provider is an External Service Provider.',
    [definitions],
  ),
  term(
    'contractor-risk-managed-assets',
    'Contractor Risk Managed Assets (CRMA)',
    'A Level 2 category: assets that can process, store or transmit CUI but are not intended to, because of the security policies, procedures and practices in place. They need not be separated from CUI Assets. They are documented in the asset inventory, SSP and network diagram; the assessor reviews that documentation and makes a limited check only if something raises questions. At Level 3 the same assets are CUI Assets and are assessed.',
    [definitions, scoping],
  ),
  term(
    'specialized-assets',
    'Specialized Assets',
    'Assets that can process, store or transmit CUI but cannot be fully secured: Internet of Things and Industrial IoT devices, Operational Technology, Government Furnished Equipment, Restricted Information Systems and Test Equipment. At Level 1 they are outside the assessment scope. At Level 2 they are documented in the asset inventory, SSP and network diagram, and not assessed against the other requirements. At Level 3 they are assessed against every Level 3 requirement, with a limited check against Level 2.',
    [definitions, scoping],
  ),
  term(
    'out-of-scope-assets',
    'Out-of-Scope Assets',
    'Assets that cannot process, store or transmit CUI because they are physically or logically separated from the systems that do, or are inherently unable to. They are not assessed. An asset that protects a CUI asset is never out of scope; it is a Security Protection Asset.',
    [definitions, scoping],
  ),
  term(
    'esp',
    'External Service Provider (ESP)',
    'Outside people, technology or facilities an organization uses to provide or manage IT or cybersecurity services on its behalf, such as a managed service provider. A provider counts as an ESP only if CUI or Security Protection Data is processed, stored or transmitted on its assets. A provider that is not a cloud service and handles CUI is assessed as part of the organization’s assessment; one that handles only Security Protection Data is assessed as a Security Protection Asset. A cloud provider that holds CUI must instead meet the FedRAMP requirements in DFARS 252.204-7012.',
    [definitions, scoping, dfars7012],
  ),
  term(
    'csp',
    'Cloud Service Provider (CSP) and FedRAMP Moderate equivalency',
    'A company that provides cloud services. When a contractor uses an outside cloud service to store, process or transmit covered defense information, DFARS 252.204-7012 requires the cloud service to meet security requirements equivalent to the FedRAMP Moderate baseline, and that requirement carries into CMMC scoping for CUI.',
    [definitions, dfars7012],
  ),
  term(
    'enclave',
    'Enclave',
    'A deliberately bounded part of an organization’s environment, separated from the rest by technical and procedural controls, inside which the CMMC requirements are met. Scoping to an enclave keeps the rest of the enterprise out of the assessment, but every requirement must still be met inside it, whether implemented locally or inherited from enterprise services that are then also in scope.',
    [scopingGuideL2, definitions],
  ),
  term(
    'enduring-exception',
    'Enduring exception',
    'A situation where fully meeting a requirement is not feasible and is not expected to become feasible: a system that must mirror fielded equipment, a medical device, test equipment, or operational technology. It needs no plan of action, but it must be documented in the SSP.',
    [definitions],
  ),
  term(
    'temporary-deficiency',
    'Temporary deficiency',
    'A problem found after a requirement was put in place, with a known fix available or under way; for example, FIPS-validated cryptography whose required patch is no longer the validated version. It is recorded in the operational plan of action, and handled there it is still scored MET. It cannot cover a requirement that was never put in place, except for a problem found on a small part of the equipment during roll-out.',
    [definitions, scoring],
  ),
  term(
    'periodically',
    'Periodically',
    'Where a requirement says something must happen “periodically,” the organization chooses the interval, but it may not be longer than one year.',
    [definitions],
  ),
  term(
    'dfars-252-204-7012',
    'DFARS 252.204-7012',
    'The contract clause that requires contractors handling covered defense information to implement NIST SP 800-171, report cyber incidents to DoD within 72 hours, preserve images and logs, and use only cloud services that meet FedRAMP Moderate equivalency. It predates CMMC and still applies alongside it.',
    [dfars7012],
  ),
  term(
    'nist-sp-800-171-dod-assessment',
    'NIST SP 800-171 DoD Assessment (DFARS 252.204-7019, 7020 and 252.240-7997)',
    'The scored assessment of NIST SP 800-171 implementation that contractors must have posted in SPRS. A Basic assessment is a self-assessment from the SSP with a “Low” confidence score; Medium and High assessments are conducted by the Government, with High assessments performed by DIBCAC. Older contracts carry the notice 252.204-7019 and the clause 252.204-7020. Under the 2026 FAR overhaul class deviation, new solicitations and contracts use clause 252.240-7997 instead.',
    [dfars7019, dfars7020, deviation7997],
  ),
  term(
    'dfars-252-204-7021',
    'DFARS 252.204-7021',
    'The clause that puts CMMC into a contract. It names the CMMC level required, requires a current status at that level or higher for every system used on the contract that processes, stores or transmits FCI or CUI, allows FCI or CUI only on those systems, to keep an annual affirmation in SPRS, to close any Conditional POA&M, to flow the requirement down to subcontractors, and to report the CMMC unique identifiers for its systems.',
    [dfars7021],
  ),
  term(
    'nist-sp-800-171',
    'NIST SP 800-171 and 800-171A',
    'NIST Special Publication 800-171, Revision 2, lists the 110 security requirements for protecting CUI in non-federal systems and is the basis of CMMC Level 2. Its companion, SP 800-171A, breaks each requirement into assessment objectives, the determination statements an assessor checks. Every objective must be met for the requirement to count as met.',
    [definitions],
  ),
  term(
    'nist-sp-800-172',
    'NIST SP 800-172 and 800-172A',
    'NIST Special Publication 800-172 adds enhanced requirements for protecting CUI against advanced persistent threats. CMMC Level 3 uses 24 of them, with DoD-defined parameters, on top of all Level 2 requirements. SP 800-172A supplies their assessment objectives.',
    [definitions],
  ),
  term(
    'organization-defined-parameter',
    'Organization-Defined Parameter (ODP)',
    'Some enhanced requirements leave a value or choice open, such as how often something must happen. In CMMC the organization defining those parameters is the Department of Defense, and the DoD values are written into the Level 3 requirements.',
    [definitions],
  ),
  term(
    'fci-and-cui-sources',
    'Where FCI and CUI are defined',
    'The CMMC rule points to where each is defined. Federal Contract Information is defined in FAR 4.1901 and FAR 52.204-21: information not intended for public release that the Government provides or that is generated for the Government under a contract, excluding public information and simple transactional details. Controlled Unclassified Information is defined in 32 CFR 2002.4(h): information the Government creates or possesses, or that others create or possess for it, that a law, regulation or Government-wide policy requires or permits an agency to handle using safeguarding or dissemination controls. CUI never includes classified information, or a company’s own information that did not come from or for a federal agency.',
    [definitions, farClause, cuiRule],
  ),
]
