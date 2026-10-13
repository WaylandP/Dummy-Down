# Level 1 editorial audit — 2026-10-13

This is an AI-assisted editorial review of the **15 existing Level 1 draft records
and their 45 perspectives**, using the pinned September 2024 CMMC 2.13 source
snapshot. It is not qualified human approval, current legal applicability
verification, certification, or a claim of 100% accuracy.

## Scope and source verification

- Baseline inspected: `a7ccb99411641c3d31d7e0d6e33cfbbe147013c2`, particularly the
  Level 1 records in `src/data/perspectives/level-1-3.json`.
- Stable framework/edition: `cmmc` / `cmmc-2-13-sep-2024`. Official IDs and source
  quotations remain unchanged. The original README-derived Level 2 lesson is a
  different edition and was not counted as a Level 1 lesson.
- The Level 1 subset's SHA-256, after UTF-8 JSON encoding with sorted object keys,
  compact separators and `ensure_ascii=False`, is
  `fe7d4fa750c2aeb8330d33428e469b12854c41986408b2824431c9b4a67a7830`.
- Publication: **CMMC Assessment Guide – Level 1**, version **2.13**, September
  2024, **DoD-CIO-00002**, source ID `cmmc-assessment-l1-213`.
- Reviewed PDF SHA-256:
  `88116fa807b3685703f08c1992580ad0cfbc22ad2bcf76f99378fadf964f7368`.
  Original and pinned acquisition URLs are in the
  [source manifest](../sources/cmmc-2-13-manifest.json).
- Source-check date: **2026-10-13**. All four pinned DoD PDFs and all 149 complete
  guide/model requirement quotations, inventories, titles, families, metadata
  and citations passed `scripts/verify-cmmc-sources.py` again. This establishes
  faithful transcription of identified snapshot bytes, not editorial approval.
- The review read each Level 1 requirement, **all 59 determination statements**,
  potential assessment methods, Discussion/Further Discussion, and examples;
  it compared them with Beginner meaning/example, technical focus/example/caution,
  and compliance focus/questions/candidate evidence.

The modes serve different purposes rather than repeating one summary: everyday
meaning, possible mechanisms with cautions, and assessment-oriented investigation.
Examples use fictional Cedar Point Design; possible products, implementation
choices and candidate evidence are not represented as mandatory or sufficient.
No invented objective, fixed patch deadline, MFA mandate in the authentication
control, or required commercial product was found. Findings below tighten scope
and reduce opportunities for misunderstanding.

## Per-control review

Pages below are **PDF / printed**. Objective labels refer to the guide, not
invented project objectives. “Retain” means no source-supported correction was
identified in this pass; it does not mean qualified approval.

| Requirement                                | Requirement/objectives pages | Objectives | Finding and disposition                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------ | ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AC.L1-b.1.i` Authorized access            | 16 / 12                      | a–f (6)    | Retain. Correctly covers users, processes acting on their behalf, and devices; separates identification from enforcement. A register and network allowlist are examples, not prescribed technologies. Explain “service identity” and “allowlist” where encountered.                                                                                                                          |
| `AC.L1-b.1.ii` Transactions/functions      | 19 / 15                      | a–b (2)    | Retain. Read/edit/delete examples match defined functions and enforcement, and distinguish an approved login from allowed actions. Explain API if retained in contextual examples.                                                                                                                                                                                                           |
| `AC.L1-b.1.iii` External connections       | 21 / 17                      | a–f (6)    | Retain. Covers identifying, verifying and restricting connections and use. External does not mean merely off-site; the guide also includes company systems outside the relevant system boundary (PDF22 / printed18).                                                                                                                                                                         |
| `AC.L1-b.1.iv` Public information          | 24 / 20                      | a–e (5)    | Clarify: the requirement includes **processing**, not only publishing, on publicly accessible systems. Retain prepublication review, existing-content review and removal/response. The guide says “Only government officials can be authorized to publicly release FCI” (PDF25 / printed21); company publishing approval does not make FCI public information.                               |
| `IA.L1-b.1.v` Identification               | 26 / 22                      | a–c (3)    | Retain. Covers all three categories and correctly distinguishes an identifier from verification and permission. A device inventory label alone should not be confused with identifying a device during actual system access.                                                                                                                                                                 |
| `IA.L1-b.1.vi` Authentication              | 28 / 24                      | a–c (3)    | Retain meaning and compliance focus. Improve the fictional printer example to distinguish authenticating the administrator from authenticating the device; an administrator's password does not itself demonstrate device identity verification. No claim that this control mandates MFA. Device certificates are an example, not a required product or mechanism (PDF29–30 / printed25–26). |
| `MP.L1-b.1.vii` Media disposal             | 31 / 27                      | a–b (2)    | Clarify the beginner branches: sanitize **or destroy before disposal**, but sanitize **before release for reuse**. Current wording joins the alternatives and can imply destruction prepares a device for reuse. Retain paper/digital scope and the warning that ordinary delete/format may leave recoverable information (PDF31–32 / printed27–28).                                         |
| `PE.L1-b.1.viii` Physical access           | 33 / 29                      | a–d (4)    | Clarify the guide's condition: this requirement applies to facility areas not designated publicly accessible (PDF34 / printed30). Keep systems, equipment and environments in scope; do not imply that a public lobby excuses safeguarding reachable equipment. Badges/locks are possible implementations, not mandatory procurement choices.                                                |
| `PE.L1-b.1.ix` Visitors/access devices     | 35 / 31                      | a–f (6)    | Retain escorting, monitoring, retained physical-access records and access-device management. Written logs are valid possible mechanisms; the guide's one-year example is not a universal retention period. If defining “visitor,” note the guide distinguishes people with permanent physical-access credentials (PDF35–36 / printed31–32).                                                  |
| `SC.L1-b.1.x` Boundary protection          | 38 / 34                      | a–h (8)    | Retain external **and key internal** boundaries and distinct monitoring/control/protection activities. Architecture determines boundaries; a purchased internet firewall is not full coverage. Define “boundary,” “proxy” and “segmentation.”                                                                                                                                                |
| `SC.L1-b.1.xi` Public-system separation    | 41 / 37                      | a–b (2)    | Retain actual physical/logical separation and the warning that a subnet name alone proves little. A DMZ is a possible design, not a mandatory name or appliance. Define DMZ and subnet if used (PDF41–42 / printed37–38).                                                                                                                                                                    |
| `SI.L1-b.1.xii` Flaw remediation           | 43 / 39                      | a–f (6)    | Retain identification, reporting and correction within specified time frames. No universal patch deadline was invented. Define firmware and patch; distinguish flaw discovery from correction (PDF44 / printed40).                                                                                                                                                                           |
| `SI.L1-b.1.xiii` Malicious-code protection | 46 / 42                      | a–b (2)    | Retain designated locations and provided operational protection. A license is not deployed protection. Define malware/endpoint if used; protection choices depend on the platforms and pathways (PDF46–48 / printed42–44).                                                                                                                                                                   |
| `SI.L1-b.1.xiv` Protection updates         | 49 / 45                      | a (1)      | Retain release availability and successful updating; an enabled automatic-update setting is not actual update receipt. Daily updates in the guide's example are not an invented universal schedule (PDF50 / printed46).                                                                                                                                                                      |
| `SI.L1-b.1.xv` System/file scanning        | 51 / 47                      | a–c (3)    | Retain defined periodic malicious-code scans **and** real-time scanning of external files. Vulnerability scanning is a different activity. External sources include removable media, not only internet downloads (PDF52 / printed48).                                                                                                                                                        |

The table records the initial findings. The four clarifications were then
implemented and independently re-reviewed, as recorded below. All 15 explanation
records remain drafts. Qualified human approval is **pending**.

## Exact objective context for the three learning examples

These three controls cover authorization, public information and media lifecycle.
Their **13 objectives** are an explicitly scoped teaching milestone, not all 59
Level 1 objectives. The quoted determination statements below normalize physical
line wrapping only, preserve the guide's `[FCI]` notation, punctuation and wording,
and follow the guide's **“Determine if:”** lead-in.

### `AC.L1-b.1.i` — Authorized Access Control

Section `AC.L1-b.1.i`; PDF **16**, printed **12**. Discussion/examples PDF17–18,
printed13–14. Stable control key `ac-l1-b-1-i`.

> Limit information system access to authorized users, processes acting on behalf
> of authorized users, or devices (including other information systems).

| Label | Quoted determination statement                                                  |
| ----- | ------------------------------------------------------------------------------- |
| a     | authorized users are identified;                                                |
| b     | processes acting on behalf of authorized users are identified;                  |
| c     | devices (and other systems) authorized to connect to the system are identified; |
| d     | system access is limited to authorized users;                                   |
| e     | system access is limited to processes acting on behalf of authorized users; and |
| f     | system access is limited to authorized devices (including other systems).       |

Useful learning focus: a staff member, a backup task acting on their behalf, and a
new printer each need an identified authorization path. A diagram can separate
“identify,” “approve,” and “enforce access” without treating it as a complete
implementation procedure. Common misunderstanding: a successful sign-in or an
inventory list by itself proves permission and enforcement. Three question themes
should address the three categories, identification versus enforcement, and why
authorized entry differs from permitted actions under `AC.L1-b.1.ii`.

### `AC.L1-b.1.iv` — Control Public Information

Section `AC.L1-b.1.iv`; PDF **24**, printed **20**. Further Discussion/example
PDF25, printed21. Stable control key `ac-l1-b-1-iv`.

> Control information posted or processed on publicly accessible information systems.

| Label | Quoted determination statement                                                                       |
| ----- | ---------------------------------------------------------------------------------------------------- |
| a     | individuals authorized to post or process information on publicly accessible systems are identified; |
| b     | procedures to ensure [FCI] is not posted or processed on publicly accessible systems are identified; |
| c     | a review process is in place prior to posting of any content to publicly accessible systems;         |
| d     | content on publicly accessible systems is reviewed to ensure that it does not include [FCI]; and     |
| e     | mechanisms are in place to remove and address improper posting of [FCI].                             |

Useful learning focus: a fictional announcement goes through an authorized
publisher and content review; a public file-processing tool is also considered;
already published content is checked and an improper posting is removed and
addressed. A diagram can show review before publication and the review/removal
loop after publication. Common misunderstanding: a manager's approval gives
authority to release FCI publicly. Questions should distinguish public processing
from publication, preventive review from later response, and internal publishing
permission from government public-release authority. Never use real FCI in a
scenario, screenshot, quiz answer or demonstration.

### `MP.L1-b.1.vii` — Media Disposal

Section `MP.L1-b.1.vii`; PDF **31**, printed **27**. Further Discussion/example
PDF32, printed28. Stable control key `mp-l1-b-1-vii`.

> Sanitize or destroy information system media containing Federal Contract
> Information before disposal or release for reuse.

| Label | Quoted determination statement                                               |
| ----- | ---------------------------------------------------------------------------- |
| a     | system media containing [FCI] is sanitized or destroyed before disposal; and |
| b     | system media containing [FCI] is sanitized before it is released for reuse.  |

Initial learning recommendation: a fictional USB drive is to be reused and paper
records are to be disposed of. The implemented lesson uses a scanner’s stored
contract scans and paper printouts, preserving the same digital/non-digital distinction. Choose a method suitable to the media and disposition, and
check its outcome. A two-branch diagram can make disposal versus reuse explicit.
Common misunderstanding: deleting a file or using an ordinary quick format
necessarily removes recoverable information. Questions should cover reuse versus
disposal, digital **and non-digital** media, and why checking the sanitization
outcome matters. Do not prescribe a universal overwrite count, one tool, or an
encryption setting as a guarantee. The guide cites NIST SP 800-88 Rev.1 as context;
do not silently replace the snapshot citation with a newer revision.

## Vocabulary recommendations

Prioritize terms learners actually encounter: **Federal Contract Information
(FCI)** (PDF5 / printed1), **authorization**, **authentication**, **service
account/process**, **allowlist** (PDF16–18 / printed12–14), **publicly accessible
system**, **public-release authority**, **content review** (PDF24–25 / printed20–21),
**media**, **sanitization**, **disposal**, **reuse** (PDF31–32 / printed27–28), and
**system boundary** (PDF38–40 / printed34–36). This offers 13 useful concepts without
padding a numerical target. Existing account/device/process terms can be improved
and reused rather than duplicated. Secondary Level 1 vocabulary includes patch,
firmware, malware, DMZ, subnet and vulnerability scanning where the interface
actually uses them.

Definitions should be original plain-language drafts with citations and explicit
edition context, not presented as verbatim official definitions. FCI must not be
reduced to “anything a contractor considers confidential”: the pinned guide's
definition concerns nonpublic information provided by or generated for the
Government under a relevant contract, and excludes public government information
and simple payment-processing information.

## Implemented corrections and independent final review

On **2026-10-13**, a second Codex agent independently read the current 15 Level 1
perspective records, all three new activities (including all nine questions and
27 choice explanations), their plain-English explanations, scenarios,
misunderstandings, diagram content and text equivalents, all 14 new glossary
definitions and their cited sections, and the 15 review records. This is an
**AI-assisted editorial review**, with no qualified human reviewer attributed.

The four source-supported perspective corrections are implemented:

- `AC.L1-b.1.iv`: public **processing** as well as posting, preventive review,
  existing-content review, and removal/response are explicit.
- `IA.L1-b.1.vi`: the printer example now separates verifying the device from
  verifying the administrator who signs in to change settings.
- `MP.L1-b.1.vii`: the Beginner and Compliance text now separates sanitization or
  destruction before disposal from sanitization before release for reuse.
- `PE.L1-b.1.viii`: Beginner and technical text now includes the Discussion's
  condition for facility areas not designated publicly accessible. The fictional
  printer remains inside a staff-only area; this does not excuse exposing
  equipment or output in a public lobby.

The independent review identified one additional wording issue in the public
information activity. The source says **“Only government officials can be
authorized to publicly release FCI.”** The first draft instead said officials
“can authorize” release, changing the stated role. The misunderstanding correction
and answer feedback now use the actual source wording and do not suggest that a
company editor may publish FCI merely because a manager or official approves a
post. The changed passages were re-read against PDF25 / printed21. No further
source-supported semantic correction was identified in this scoped pass.

### Teaching context for the 13 quoted statements

| Activity / requirement                          | Statement labels | Explicit learning connection                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `level-one-authorized-access` / `AC.L1-b.1.i`   | a–f              | The person, user-acting process and device scenario distinguishes identification (a–c) from enforced access limits (d–f). The process and device questions address b/e and c/f; the paired-tasks question and diagram cover all three categories. The final feedback distinguishes entry authorization from transactions/functions under `AC.L1-b.1.ii`.  |
| `level-one-public-information` / `AC.L1-b.1.iv` | a–e              | The named authorized publishers/processors and procedures connect to a/b. The scenario and diagram show pre-posting review (c), review of existing content (d), and removal/response (e). The manager-approval, existing-attachment and public-processing questions teach these distinctions without claiming every cloud service is publicly accessible. |
| `level-one-media-disposal` / `MP.L1-b.1.vii`    | a–b              | The scanner-reuse and paper-disposal scenario, two-branch diagram and destination/timing question distinguish a from b. The deletion and digital/non-digital questions explain suitable sanitization and media scope without prescribing a wiping command, overwrite count or universal product.                                                          |

These are **draft teaching connections**, not a complete assessment procedure or
proof that all implementation conditions are taught exhaustively. The other 12
Level 1 records have **unmapped educational objective coverage**. Reading all 59
statements for an editorial comparison does not establish a complete Level 1
curriculum. The original README-derived activity remains separate; the app now
has four draft activities and 12 questions in total.

### Vocabulary inspected

The 14 additions preserve the six original glossary entries, giving **20 terms**.
Their source context identifies original educational definitions rather than
verbatim official definitions, and all remain drafts.

| Terms                                             | Source sections inspected (PDF / printed)              | Scope retained                                                                                                                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FCI; CUI                                          | Level 1 Introduction 5 / 1; Level 2 Introduction 9 / 1 | FCI's government-contract connection and public/simple-transaction exclusions remain explicit. CUI is a separate defined category; Level 1 material does not claim to satisfy CUI requirements. |
| Authorization; authentication; information system | Level 1 16–17 / 12–13, 28–29 / 24–25, 8 / 4            | Permission, identity verification and the organized system of information resources remain distinct. A successful identity check does not itself grant permission.                              |
| Publicly accessible system                        | Level 1 24–25 / 20–21                                  | Company-controlled posting/processing and typical public access are explained; being online alone does not establish public accessibility.                                                      |
| Media; media sanitization; disposal; reuse        | Level 1 31–32 / 27–28                                  | Digital and non-digital media are included. Ordinary deletion is not proof of sanitization; suitable actions precede disposal or reuse, with the destinations distinguished.                    |
| Assessment objective; assessment scope            | Level 1 7 / 3, 6 / 2                                   | Objectives describe outcomes to check; scope concerns the organization's relevant assets. Neither a quiz nor suggested documentation proves compliance or determines organizational scope.      |
| Malicious code; system boundary                   | Level 1 47 / 43, 38–39 / 34–35                         | Harmful unauthorized software is broader than viruses; external and key internal system boundaries are both retained.                                                                           |

All 15 Level 1 entries now offer FCI in their contextual vocabulary, with duplicate
term IDs removed. Unknown framework, edition or requirement identities do not
borrow these terms or review records. Remaining jargon such as API, DMZ, subnet,
firmware, proxies and segmentation is a future vocabulary task rather than an
invented claim that every technical expression has been explained.

### Verification actually performed

- Re-ran `python scripts/verify-cmmc-sources.py --source-dir
/tmp/dummy-down-cmmc-sources`: all four pinned DoD PDF hashes and all 149 complete
  guide/model statements, inventories, titles, families, metadata and both page
  citations passed. This verifies the snapshot, not current applicability.
- Independently extracted each Level 1 determination list from the cited PDF page
  using Poppler `pdftotext -layout`, checked its letter labels/count against the
  15 review records, and checked the imported quotation strings against those
  page-specific lists. **59 statement counts and all 13 imported quotations
  matched**, normalizing whitespace only.
- Ran `npm test -- --run src/data/level-one-review.test.ts
src/data/level-one-glossary.test.ts src/components/LevelOneLearning.test.tsx`:
  **22 tests passed across three files**, both before and after the public-release
  correction (final run started at 22:04:57 UTC). These exercise metadata,
  identity boundaries and learning behavior; they do not constitute qualified
  content approval or accessibility certification.
- Confirmed all 15 current `humanApproval` records are `pending`, source
  verification remains `pinned-snapshot-verified`, and the unresolved official-host
  and applicability questions remain visible in the metadata.

### Final inspected content fingerprints

The current Level 1 perspective subset uses the same canonical JSON method as
the baseline above: **`31c952cff7f0627ad06e04cc6501ddc318a6c8b895c6778ffdff6bf27f8215cd`**.
The following SHA-256 values identify the exact UTF-8 file bytes inspected; later
edits require a scoped re-review rather than inheriting this result automatically.

| File                             | SHA-256                                                            |
| -------------------------------- | ------------------------------------------------------------------ |
| `src/data/level-one-learning.ts` | `2870589538d5f4038f1dd2f26407cb22af2b315a4d5c49b0fc45d655c3071195` |
| `src/data/level-one-glossary.ts` | `96a90edafb0900b46cf101188f3841e8d4364404e2244315bc1398a9494b1786` |
| `src/data/level-one-review.ts`   | `3a509c0cb362334a76db87e85f11a94669cc1c198abe9ec17ab3cec61d265281` |
| `src/data/level-one-terms.ts`    | `c9b35eb772056c85268cc0e71a75ebb0dea70ae8a7703ed534d6e01872a06f1d` |
| `src/types/review.ts`            | `e757433067fc30e63311fdcdf1db5f1a62adaeefd297e637de5a702398453fc5` |
| `src/data/cmmc-213-catalog.json` | `a0a0d58906e203d8b62103c7830e72cc6c146783898db11cbfe016fdb94d7938` |

## Current applicability checks and unresolved questions

The model (PDF6–7 / printed3–4) identifies Level 1's **15 FAR safeguards**, Level
2's **110 NIST SP 800-171 Rev.2 requirements**, and selected Level 3 requirements
from **NIST SP 800-172** with DoD parameters. The complete independent snapshot
inventory contains **24 Level 3 identifiers**. Its source publications do not
automatically establish present legal adoption after subsequent amendments.

Fresh ordinary HTTPS requests at **2026-10-13 20:30:29 UTC** to every URL below
failed with **proxy CONNECT 403 before any origin response**. An origin HTTP status
was therefore not received. TLS checks were not bypassed.

| Official source attempted                                                                                               | Result                                                          |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| https://www.acquisition.gov/far/52.204-21                                                                               | CONNECT 403; current FAR clause text not read.                  |
| https://www.ecfr.gov/current/title-32/subtitle-A/chapter-I/subchapter-D/part-170                                        | CONNECT 403; current consolidated CMMC rule not read.           |
| https://www.ecfr.gov/current/title-32/subtitle-A/chapter-I/subchapter-D/part-170/section-170.14                         | CONNECT 403; current level-baseline section not read.           |
| https://www.federalregister.gov/documents/2024/10/15/2024-22905/cybersecurity-maturity-model-certification-cmmc-program | CONNECT 403; final-rule text not read from official host.       |
| https://www.govinfo.gov/content/pkg/FR-2024-10-15/pdf/2024-22905.pdf                                                    | CONNECT 403; official final-rule PDF not acquired.              |
| https://dodcio.defense.gov/Portals/0/Documents/CMMC/ModelOverviewv2.pdf                                                 | CONNECT 403; current official model bytes not acquired.         |
| https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL1v2.pdf                                             | CONNECT 403; current official Level 1 guide bytes not acquired. |
| https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL2v2.pdf                                             | CONNECT 403; current official Level 2 guide bytes not acquired. |
| https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL3.pdf                                               | CONNECT 403; current official Level 3 guide bytes not acquired. |
| https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final                                                                     | CONNECT 403; current NIST publication status not read.          |
| https://csrc.nist.gov/pubs/sp/800/172/final                                                                             | CONNECT 403; current NIST publication status not read.          |

Actual pinned NIST PDF covers identify SP 800-171 Rev.2 as **February 2020** with
updates **2021-01-28**, and SP 800-172 as **February 2021**. Model Appendix C,
PDF44 / printed41, labels SP 800-171 “Rev.2” but gives December2016/June2018 dates;
do not copy that bibliographic anomaly into the application's Rev.2 date.

Unresolved: current official publication freshness and current regulatory
applicability; contract-specific scope; qualified human interpretation of the final
lessons; future objective mapping beyond the three scoped learning examples; and
remaining Level 1 technical vocabulary, such as API, DMZ and firmware, without
its own contextual glossary entry. Freshness and applicability need an accessible
official-source check. The final teaching drafts need actual qualified review;
remaining teaching connections and vocabulary need separately reviewed additions.
None of these gaps is resolved by a software-generated badge.
The [review process](REVIEW_PROCESS.md) records them separately from transcription
and AI-assisted editorial review.
