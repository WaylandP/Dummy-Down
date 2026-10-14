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
