# The timeline — source record (2026-10-15)

`src/data/cmmc-timeline.json` holds the dates, durations and the one open
question the Timeline page shows, each as a plain sentence written by the
project over the passages it paraphrases, quoted verbatim with their source,
section or page, and official address. The quoted text controls wherever a
sentence and a quotation differ.

## Sources, pinned

| Source                                                                                            | Version                                                             | Official address                                                                                                                                         | SHA-256 of the copy read                                           |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 32 CFR part 170, CMMC Program                                                                     | eCFR text as of December 16, 2024                                   | https://www.ecfr.gov/on/2024-12-16/title-32/subtitle-A/chapter-I/subchapter-D/part-170                                                                   | `4df7572a76794b236c0d5f9fb1d2ff814d8c973cf2d030067d00f9c0b0fb2680` |
| CMMC Program final rule, 89 FR 83092                                                              | October 15, 2024, document 2024-22905                               | https://www.federalregister.gov/documents/2024/10/15/2024-22905/cybersecurity-maturity-model-certification-cmmc-program                                  | `9cc8371dac8540c699d0d4ee20e7f9335e9d5df93ab3373ce32b7e48dd2ed0d8` |
| DFARS: Assessing Contractor Implementation of Cybersecurity Requirements, final rule, 90 FR 43560 | September 10, 2025, document 2025-17359 (DFARS Case 2019-D041)      | https://www.federalregister.gov/documents/2025/09/10/2025-17359/defense-federal-acquisition-regulation-supplement-assessing-contractor-implementation-of | `a84a572d0ccc5af65bb4daba97471918906eb56bce570305068c41e6d271cdcb` |
| DFARS 252.204-7021, Contractor Compliance With the CMMC Level Requirements                        | NOV 2025 clause text                                                | https://www.acquisition.gov/dfars/252.204-7021-contractor-compliance-cybersecurity-maturity-model-certification-level-requirements.                      | `0ed62f6cb74123c936725c286c2919606aa2a497077f7208476ca0996c308aaa` |
| CMMC 101 Overview Briefing, DoD CIO                                                               | Cleared for open publication August 22, 2025 (CMMC-101-Nov2025.pdf) | https://dodcio.defense.gov/Portals/0/Documents/CMMC/CMMC-101-Nov2025.pdf                                                                                 | `2a31ba0d8232fb067bb56975e0125682f220a873fa6d43c132c53f45f51edb7b` |
| CMMC Program Frequently Asked Questions, Office of the CIO, U.S. Department of War                | Revision 2.4, July 13, 2026 (FAQsv6.pdf; cover: 2.3 (Excerpt))      | https://dodcio.defense.gov/Portals/0/Documents/CMMC/FAQsv6.pdf                                                                                           | `b2563aabbfd3ad4013e2ade962641813cf9ff6976c07a446864a2b4f7ed44394` |
| CMMC Briefing: CMMC Alignment to NIST Standards, DoD CIO                                          | February 2025                                                       | https://dodcio.defense.gov/Portals/0/Documents/CMMC/CMMC-AlignmentNIST-Standards.pdf                                                                     | `796e59e8f04412975255c0c943740ab1bf694a24820553fdcdb216127042d643` |
| Class Deviation 2026-O0025, Revision 3: FAR Part 40, DFARS Part 240                               | Revision 3, signed September 3, 2026                                | https://www.acq.osd.mil/dpap/dars/classdev/DFARS_RFO/Part-240/2026-O0025_Rev3_TAB_A_Deviation_Memo.pdf                                                   | `c836278a672909d71c33b3f3e53ee0a951c30ff1f499890c0e96549bd64f230c` |

Direct reads of ecfr.gov, federalregister.gov, acquisition.gov and
dodcio.defense.gov were blocked from the authoring environment (proxy CONNECT
403), as for the project's earlier source records. The copies were read from
the public corpus mirror `github.com/gamestuf/cairn-corpus` at commit
`2ef86f6d8ca8f3fe66eb127cccaa14dc7b86f473`, whose signed manifest records each
document's official address, retrieval and digest; the digests above were
recomputed after download. The manifest records the eCFR versioner XML (the
part as of December 16, 2024), both Federal Register full-text HTML pages and
the acquisition.gov clause page as fetched from their official hosts with
HTTP 200 (the Federal Register pages and the clause on 2026-10-10, the XML on
2026-10-14), and the three DoD CIO PDFs as answered 403 by
dodcio.defense.gov and taken from a web archive instead. The eCFR XML and the
two Federal Register pages were read with the tags stripped; the DFARS clause
was read in the mirror's text rendering of the acquisition.gov page (the
digest above), and its quotations checked again against the mirror's raw
capture of that page; the three briefings are PDFs read with `pdftotext`.
The acquisition.gov address follows the
site's slug convention, trailing period included, and could not be opened to
confirm it; the FAQ's own links point at `dowcio.war.gov`, so the
`dodcio.defense.gov` address may redirect.

The class deviation was read from the same mirror at commit
`7fc9b1bf9492df6336d763b739e647544252e346` (the copy of
`2026-O0025_Rev3_TAB_A_Deviation_Memo.pdf` at the acq.osd.mil address above,
taken from a web archive when the official host refused the connection), with
`pdftotext`; the digest above was recomputed. The FAQ file is unchanged from
the copy pinned before: its cover still reads "Revision 2.3 (Excerpt)", while
its Document Revision History ends with version 2.4 of 7/13/2026, "Updated to
reflect the suspension of the program in Phase 1 of implementation." The
version is labeled by that history.

The CMMC 101 phase slide (PDF page 10) is a four-box graphic. Its quotations
join each box's lines in reading order with "·"; the words within each line
are the slide's, which names the department "DoW".

## What each line rests on

- **December 16, 2024 (published October 15, 2024)**: the eCFR Source note
  for part 170 ("89 FR 83214, Oct. 15, 2024") and the Federal Register
  address, whose mirrored HTML carries no publication-date line, so the
  document's closing line is quoted for its identity; then the rule's DATES
  line ("This rule is effective December 16, 2024."), read with § 170.1(a)
  for what the part establishes. The publication date shares this entry so
  the dates stay on one screen with the July 13, 2026 entry.
- **November 10, 2025 and the four phases**: the acquisition rule's DATES line
  ("This rule is effective November 10, 2025."), the CMMC 101 briefing's
  statement of the clause's effective date (PDF page 6) and its phase slide
  (PDF page 10), read with § 170.3(e)(1)–(4) in full, which defines each phase
  as one calendar year after the previous one, Phase 1 starting on the
  acquisition rule's effective date. Each phase's sentence names only what
  its quoted paragraph names.
- **July 13, 2026, and Phases 2–4 on hold**: the FAQ's answers A-A1 ("The
  DoW has suspended the transition to Phase 2 of the program.") and D-A1, its
  revision history for version 2.4, and the class deviation's paragraph (b),
  which names the Department of War CIO's memorandum of July 13, 2026,
  "Suspension of the Advancement to Cybersecurity Maturity Model Certification
  Phase 2 Requirements", and says it permits Level 1 (Self) or Level 2 (Self)
  and suspends the November 2026 Phase 2 transition. The memorandum itself is
  not pinned; the page says only what the FAQ and the deviation say about it.
  The phase entries keep the rule's dates and quotations, marked
  `"status": "suspended"`, and their sentences describe the original schedule.
- **How long a status stays current**: the clause's definition of "Current"
  in 252.204-7021(a), items (1)(i) and (1)(ii) for the conditional statuses,
  (2)(i)–(iii) for the final ones and (3) for the affirmation, read with
  §§ 170.15–170.18 (annual Level 1, three-year Level 2 and 3 assessments,
  the Level 2 (C3PAO) assessment that Level 3 also needs), § 170.21(b) (the
  180-day POA&M closeout) and § 170.22(a) (the annual affirmation).
- **Rev 3**: the FAQ's answer B-A3 (the same file, version 2.4) and the alignment briefing's
  two bullets (February 2025), which say Revision 3 comes in through future
  rulemaking and that assessments stay against Revision 2 under the DFARS
  7012 class deviation until it is adopted. No date is given in either; the
  page says so rather than guessing.

`src/components/timeline-page.test.tsx` locks the citations as serialized
(SHA-256 `f8898110f7cba93412410b28f960f101ed36bc0a02a4c80786b22060271f1260`
over the dates', statuses' and Rev 3 line's citation arrays in page order),
so a change to any quotation, pin or source key fails a test until this
record is revisited.

## Limits

- Phases 2–4 are the rule's original schedule, suspended on July 13, 2026.
  § 170.3(e) describes "a phased approach for the inclusion of CMMC Program
  requirements in solicitations and contracts"; the page does not turn that
  into a deadline for any one contractor, and it gives no new date because
  neither source does.
- The sentences are the project's paraphrase, not legal advice, and have not
  been reviewed by counsel or a qualified assessor.
- The mirror's copies may lag the official pages; the official text controls.
