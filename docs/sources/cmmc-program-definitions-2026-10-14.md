# CMMC Program definitions — source record (2026-10-14)

The 34 glossary terms in `src/data/cmmc-program-glossary.ts` (statuses, roles,
scoping categories, contract clauses and the NIST publications behind the
levels) were written from the texts below. Each definition paraphrases the
cited passage in plain language; the cited text controls wherever they differ.

## Primary sources

| Term group                                                                                                                                                                                 | Source                                                    | Where                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Statuses, roles, assessment types, POA&M, operational plan of action, SSP, asset categories, ESP, CSP, enduring exception, temporary deficiency, "periodically", ODPs, NIST SP 800-171/172 | 32 CFR part 170 (CMMC Program)                            | § 170.4(b) definitions; §§ 170.15–170.18 (levels); § 170.19 tables (scoping); § 170.21 (POA&M) |
| Enclave                                                                                                                                                                                    | CMMC Level 2 Scoping Guide, v2.13 (Sept 2024)             | "Use of Enclaves", PDF page 13 (printed page 9)                                                |
| FCI                                                                                                                                                                                        | FAR 52.204-21 (Nov 2021)                                  | paragraph (a) definitions                                                                      |
| CUI                                                                                                                                                                                        | 32 CFR § 2002.4                                           | paragraph (h)                                                                                  |
| DFARS 252.204-7012                                                                                                                                                                         | DFARS clause, May 2024 edition                            | (b)(2)(ii)(A), (b)(2)(ii)(D), (c)(1)                                                           |
| NIST SP 800-171 DoD Assessment                                                                                                                                                             | DFARS 252.204-7019 (Nov 2023) and 252.204-7020 (Nov 2023) | (a) definitions, (b)–(d)                                                                       |
| DFARS 252.204-7021                                                                                                                                                                         | DFARS clause, Nov 2025 edition                            | (a) "Current", (d) requirements, (e) reporting                                                 |

## How the texts were obtained

Direct access to ecfr.gov, acquisition.gov and dodcio.defense.gov was blocked
from the authoring environment. The texts were read from a public corpus
mirror, `github.com/gamestuf/cairn-corpus`, at commit
`2ef86f6d8ca8f3fe66eb127cccaa14dc7b86f473`, which stores the eCFR XML and the
regulation HTML converted to Markdown with the retrieval date in the path. The
32 CFR part 170 copy is the text as of its December 16, 2024 effective date.
Files and SHA-256 digests:

| `raw/public/cfr/32-cfr-170/2024-12-16/ecfr-xml/REG-R01.xml` | `4df7572a76794b236c0d5f9fb1d2ff814d8c973cf2d030067d00f9c0b0fb2680` |
| `derived/public/cfr/32-cfr-170/2024-12-16/ecfr-xml/text.md` | `84ce897dc27675b2b8713c129c8fb613e3fcea235214682d958753c88179bb0c` |
| `derived/public/cfr/32-cfr-2002/2016-12-22/ecfr-xml/text.md` | `7e5a29593e0c8eebc9bef2c2f49c470cf3d7528471b56172c3cf3f031eefa6bc` |
| `derived/public/far/52.204-21/2021-11/regulation-html/text.md` | `1e5cf5d0f82045119727f02deeaea972b2762499b5a3d3d792ffa650ead082c0` |
| `derived/public/dfars/252.204-7012/2024-05/regulation-html/text.md` | `f0520698842184f5224691443c9467a8555be676af57cd8875ef075c4d51810d` |
| `derived/public/dfars/252.204-7019/2023-11/regulation-html/text.md` | `eeeed823dc79a4770f469af758352fc695cd175edc5eb2a103faa8662f04a77b` |
| `derived/public/dfars/252.240-7997/2023-11/regulation-html/text.md` | `579910bd168f074cfc264fdb33f6d40624214cf745e2dd94146391577a456865` |
| `derived/public/dfars/252.204-7021/2025-11/regulation-html/text.md` | `0ed62f6cb74123c936725c286c2919606aa2a497077f7208476ca0996c308aaa` |
| `raw/public/dod-cio/cmmc-scoping-guide-l2/2.13/general/ScopingGuideL2v2.pdf` | `377b758393908d6c20a9813fa213c5d3ec36e00018a798d09e59f00eb8627981` |

## Limits

- The eCFR and acquisition.gov pages may have been amended since the dated
  copies above; the current official text controls.
- The acquisition.gov clause URLs follow the site's slug convention and were not
  reachable from the authoring environment to confirm.
- Definitions are teaching aids written by the project. They are not legal
  interpretations and have not been reviewed by a qualified assessor or counsel.

## Corrections, October 15, 2026

A line-by-line comparison with the texts above found definitions that said
more or less than their sources. Each was rewritten from the cited text; the
term identifiers did not change.

| Term                                    | What changed                                                                                                                   | Text it now follows                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Temporary deficiency                    | Said "temporarily not met"; handled in an operational plan of action it is scored MET. Adds the roll-out case.                 | § 170.4(b); § 170.24(b)(1)(ii)                                                              |
| Specialized Assets                      | Gave the Level 2 treatment as universal. Now gives Levels 1, 2 and 3.                                                          | § 170.19(b)(2)(ii); tables 3 and 5 to § 170.19                                              |
| SSP                                     | "Assessors use it as the starting point for every assessment" overreached. Required at Levels 2 and 3; recommended at Level 1. | § 170.4(b); Level 2 guide, CA.L2-3.12.4 (PDF p. 217); Level 1 guide, footnote 4 (PDF p. 16) |
| NIST SP 800-171 DoD Assessment          | Adds that new solicitations and contracts use 252.240-7997 under the 2026 FAR overhaul class deviation.                        | Class Deviation 2026-O0025, Rev. 3, 240.370-5(d)                                            |
| DIBCAC, SPRS                            | Name the new clause; SPRS cites § 170.22 (affirmations in SPRS) and the award check.                                           | § 170.22(a); Class Deviation 2026-O0025, Rev. 3, 240.371-4(b)                               |
| CMMC Assessment Scope, Assessment scope | Made consistent: Level 1 is FCI systems; the five categories are Level 2; Level 3 has no CRMA category.                        | § 170.4(b); § 170.19(b)–(d); Level 1 guide, Assessment Scope                                |
| Contractor Risk Managed Assets          | A Level 2 category that "can, but is not intended to" handle CUI; at Level 3 these are CUI Assets.                             | Tables 3 and 5 to § 170.19                                                                  |
| ESP                                     | Adds Security Protection Data-only providers (assessed as SPA) and cloud providers holding CUI (FedRAMP via 7012).             | Table 4 to § 170.19(c)(2)(i)                                                                |
| CMMC Status                             | Adds Final Level 3 and Conditional periods, and that a failed assessment gives no status.                                      | § 170.4(b); DFARS 252.204-7021(a) "Current"                                                 |
| Self-assessment                         | Adds that Level 1 is repeated every year and that help from a third party is still a self-assessment.                          | § 170.15(a)(1); Level 1 guide, Assessment Scope (PDF p. 6)                                  |
| DFARS 252.204-7021                      | Systems used on the contract, at the level or higher, and FCI or CUI only on those systems.                                    | DFARS 252.204-7021(d)(1)(i) and (d)(2)                                                      |
| Where FCI and CUI are defined           | Adds "or dissemination controls", the exclusion for a company's own information, and FAR 4.1901; cites § 170.4(b) first.       | § 170.4(b); FAR 52.204-21(a); 32 CFR 2002.4(h)                                              |
| CMMC                                    | Names the Department of War, the secondary title newer CMMC documents use.                                                     | Executive Order 14347, sections 1 and 2 (90 FR, September 10, 2025)                         |

The six terms of the first teaching example (access review, account,
authorized user, device, offboarding, process, in `src/data/glossary.ts`) cited
only the project's archived README. They now cite the Level 1 guide
(AC.L1-b.1.i, IA.L1-b.1.v, IA.L1-b.1.vi), the Level 2 guide (PS.L2-3.9.2) and
the definition of User in § 170.4(b). In `src/data/level-one-glossary.ts`, CUI,
publicly accessible system and system boundary no longer speak as if every
reader were on one Level 1 control.

Later the same day the remaining polish notes were applied. CMMC now cites
§ 170.1(a), which sets out the program (§ 170.4(b) does not define it); C3PAO
says what § 170.9(b)(6) and § 170.8(b)(17) require (a DIBCAC Level 2
assessment before authorization, and no assessing a former consulting client
within three years); the affirmation follows § 170.22(a) (after every
assessment, including a POA&M closeout, and every year after); Enduring
exception, Operational plan of action and Security Protection Data follow
their § 170.4(b) definitions, with § 170.24(b) for what is scored MET and
§ 170.19 for the providers of SPD; NIST SP 800-171 counts N/A objectives as
met (§ 170.24(b)(3)); Enclave cites § 170.19 instead of § 170.4; Media
sanitization names the guide's techniques. Links into 32 CFR part 170 now
open the text as in force on December 16, 2024, the text the definitions were
written from, instead of the current text.

The class deviation was read from the corpus mirror at commit
`7fc9b1bf9492df6336d763b739e647544252e346`
(`raw/public/dfars/class-deviation-2026-o0025/r3/general/2026-O0025_Rev3_TAB_A_Deviation_Memo.pdf`,
SHA-256 `c836278a672909d71c33b3f3e53ee0a951c30ff1f499890c0e96549bd64f230c`).
Executive Order 14347 was read in the Federal Register text edition on
2026-10-15. These corrections are AI-assisted and have not been reviewed by a
qualified assessor.
