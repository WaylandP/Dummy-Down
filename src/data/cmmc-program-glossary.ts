import type { GlossaryTerm, SourceReference } from '../types/content'

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
  'asset categories in the tables to paragraph (c)',
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
    'The Department of Defense program that checks whether a contractor’s information systems protect Federal Contract Information and Controlled Unclassified Information. It is set out in 32 CFR part 170 and reaches contractors through the DFARS 252.204-7021 clause, which names the CMMC level a contract requires. There are three levels, each tied to an existing set of security requirements.',
    [definitions, dfars7021],
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
    'The result an organization holds after an assessment, recorded in SPRS for each assessed system. “Final” means every requirement was met. “Conditional” means the assessment passed the minimum score with some requirements still open on a POA&M; those must be closed within 180 days or the status lapses. Statuses are named by level and assessor, such as Final Level 2 (C3PAO). A contract clause treats a Final Level 1 as current for one year and a Final Level 2 for three years, each with an annual affirmation.',
    [definitions, dfars7021],
  ),
  term(
    'self-assessment',
    'Self-assessment',
    'An assessment an organization performs on its own system, following the same assessment guide an outside assessor would use. Level 1 is always a self-assessment. Level 2 (Self) is a self-assessment that must be repeated every three years, with results submitted to SPRS and an affirmation each year in between.',
    [definitions, levelOne, levelTwoSelf],
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
    'The Defense Contract Management Agency’s Defense Industrial Base Cybersecurity Assessment Center, the Government team that conducts Level 3 certification assessments and the “High” NIST SP 800-171 DoD Assessments described in DFARS 252.204-7020.',
    [definitions, levelThree, dfars7020],
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
    'The DoD system where contractors post NIST SP 800-171 DoD Assessment scores and where CMMC statuses, status dates and annual affirmations are recorded for each assessed system. Contracting officers check SPRS to confirm a contractor has the required status before award.',
    [definitions, dfars7019, dfars7021],
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
    'The formal document that describes an information system and how each security requirement is implemented: what is inside the system boundary, the environment it runs in, how it connects to other systems, and which requirements are met directly, inherited, or not applicable. Assessors use it as the starting point for every assessment.',
    [definitions],
  ),
  term(
    'assessment-scope',
    'CMMC Assessment Scope',
    'The complete set of assets in an organization’s environment that will be assessed against the CMMC requirements. Scoping is done before an assessment and places every asset into a category that decides how it is treated: CUI assets, Security Protection Assets, Contractor Risk Managed Assets, Specialized Assets, or Out-of-Scope Assets.',
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
    'Assets that could handle CUI but are not meant to, because the organization’s policies, procedures and practices prevent it. They do not have to be physically or logically separated from CUI assets. They are documented in the inventory, SSP and network diagram, and an assessor normally only checks that documentation unless something raises a question.',
    [definitions, scoping],
  ),
  term(
    'specialized-assets',
    'Specialized Assets',
    'Government Furnished Equipment, Internet of Things and Industrial IoT devices, Operational Technology, Restricted Information Systems, and Test Equipment. They can handle CUI but are assessed only through their documentation in the inventory and SSP, because fully securing them is often not feasible.',
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
    'Outside people, technology or facilities an organization uses to provide or manage IT or cybersecurity services on its behalf, such as a managed service provider or a managed security service provider. A provider counts as an ESP in the CMMC Program only if CUI or Security Protection Data is processed, stored or transmitted on its assets, and an ESP that handles CUI is part of the assessment scope.',
    [definitions, scoping],
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
    'A requirement that was implemented but is temporarily not met because a known fix is available or in progress, such as a validated cryptographic module that lost its validation after a required patch. It must be recorded in the operational plan of action. It is not the same as a requirement that was never implemented.',
    [definitions],
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
    'NIST SP 800-171 DoD Assessment (DFARS 252.204-7019 and 7020)',
    'The scored assessment of NIST SP 800-171 implementation that contractors must have posted in SPRS before award. A Basic assessment is a self-assessment from the SSP with a “Low” confidence score; Medium and High assessments are conducted by the Government, with High assessments performed by DIBCAC. 252.204-7019 is the notice in solicitations; 252.204-7020 is the clause in contracts.',
    [dfars7019, dfars7020],
  ),
  term(
    'dfars-252-204-7021',
    'DFARS 252.204-7021',
    'The clause that puts CMMC into a contract. It names the CMMC level required, requires the contractor to hold a current status at that level for every system that handles FCI or CUI, to keep an annual affirmation in SPRS, to close any Conditional POA&M, to flow the requirement down to subcontractors, and to report the CMMC unique identifiers for its systems.',
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
    'Federal Contract Information is defined in FAR 52.204-21: information not intended for public release that the Government provides or that is generated for the Government under a contract, excluding public information and simple transactional details. Controlled Unclassified Information is defined in 32 CFR 2002.4: information the Government creates or possesses, or that others create or possess for it, that a law, regulation or Government-wide policy requires or permits to be safeguarded. CUI never includes classified information.',
    [farClause, cuiRule],
  ),
]
