# CMMC applicability research — 2026-10-14

Increment 2 preserves edition `cmmc-2-13-sep-2024`. Research distinguishes the
publication used to teach a requirement from present regulatory applicability and
an organization's particular contract. **Current official-host verification is
blocked; this report does not establish the current applicable baseline.**

## Evidence obtained

On October 14, the source validator independently rechecked all four cached DoD
PDFs against the [pinned manifest](cmmc-2-13-manifest.json). Exact hashes, sizes,
covers, distribution notices, all 149 complete guide/model requirement quotations,
identifiers, families, titles, both page citations and ten wording differences
passed. Command:

```sh
python3 scripts/verify-cmmc-sources.py --source-dir /path/to/pdfs
```

Acquisition remains the October 13 pinned public mirror at
[`gamestuf/cairn-corpus`, `0ab5953`](https://github.com/gamestuf/cairn-corpus/tree/0ab5953a68d5bf7383b9b021839274aed42209f3).
No historical manifest, source quotation, edition identity or source URL changed.
The [original provenance report](cmmc-2-13-sep-2024.md) records independent
corroboration: a matching Level 2 PDF hash in a separate public extraction record,
the model's version/URL in NIST's government-owned macOS project, and two NIST PDFs
in a pinned government-owned CISA repository. These corroborate snapshot identity;
they do not prove the contents of today's official publication endpoints.

## Publication and applicability register

All verification dates below are **2026-10-14**. “Snapshot checked” means the
identified cached document was inspected, not a successful official-host request.
Official URLs and exact outcomes are also in the [request log](source-access-2026-10-14.json).

| Publication / official starting point                                                                                                                                                                                                                                    | Version and document date                                                          | Levels and relationship                                                                                                                  | Verification and applicability disposition                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [DoD CMMC program](https://dodcio.defense.gov/CMMC/) and [resources](https://dodcio.defense.gov/CMMC/Resources-Documentation/)                                                                                                                                           | Live indexes; current date/version unread                                          | All; discover current program and assessment publications                                                                                | Both blocked. Current resource list and supersession notices unknown.                                                       |
| [CMMC Model Overview](https://dodcio.defense.gov/Portals/0/Documents/CMMC/ModelOverviewv2.pdf), DoD-CIO-00001                                                                                                                                                            | v2.13, September 2024                                                              | All; pinned 15/110/24 requirement identifiers and level relationships                                                                    | Snapshot checked. Current official bytes and applicability unresolved.                                                      |
| [CMMC Assessment Guide — Level 1](https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL1v2.pdf), DoD-CIO-00002                                                                                                                                            | v2.13, September 2024                                                              | Level 1; FAR 52.204-21(b)(1)(i)–(xv); 59 determinations for 15 requirements                                                              | Snapshot checked; source for this increment's 45-perspective comparison. Not confirmation of current regulation.            |
| [CMMC Assessment Guide — Level 2](https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL2v2.pdf), DoD-CIO-00003                                                                                                                                            | v2.13, September 2024                                                              | Level 2; 110 NIST SP 800-171 Rev. 2 requirements in this snapshot                                                                        | Snapshot checked. Level 2 editorial audit is Increment 4.                                                                   |
| [CMMC Assessment Guide — Level 3](https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL3.pdf), DoD-CIO-00004                                                                                                                                              | v2.13, September 2024                                                              | Level 3; 24 selected SP 800-172 requirements with DoD parameters, building on Level 2 in this snapshot                                   | Snapshot checked. Not all 35 SP 800-172 requirements; editorial audit is Increment 4.                                       |
| [FAR 52.204-21](https://www.acquisition.gov/far/52.204-21), Basic Safeguarding of Covered Contractor Information Systems                                                                                                                                                 | Live clause date and current text unread                                           | Level 1 source relationship established by pinned guide; current clause, scope and exclusions require direct verification                | Blocked. Do not infer today's text or a visitor's contractual obligations from the guide alone.                             |
| [32 CFR part 170](https://www.ecfr.gov/current/title-32/subtitle-A/chapter-I/subchapter-D/part-170) and [§170.14](https://www.ecfr.gov/current/title-32/subtitle-A/chapter-I/subchapter-D/part-170/section-170.14)                                                       | Current codification unread                                                        | All; program and level/security requirement applicability checks                                                                         | Both blocked. Effective amendments, incorporation by reference and current assessment rules remain unchecked.               |
| [CMMC Program rule, Federal Register document 2024-22905](https://www.federalregister.gov/documents/2024/10/15/2024-22905/cybersecurity-maturity-model-certification-cmmc-program); [GovInfo copy](https://www.govinfo.gov/content/pkg/FR-2024-10-15/pdf/2024-22905.pdf) | October 15, 2024 is the requested archive locator; document contents not retrieved | All; historical rule and effective-date research lead, not a substitute for amended codification                                         | Both blocked. No effective-date or current applicability claim derived from the URL.                                        |
| [DFARS 252.204-7012](https://www.acquisition.gov/dfars/252.204-7012-safeguarding-covered-defense-information-and-cyber-incident-reporting.)                                                                                                                              | Current clause version/date unread                                                 | Related covered-defense-information safeguarding and incident reporting; distinguish contract obligations from the CMMC lesson inventory | Blocked. Contract incorporation, NIST revision and any applicable deviations require qualified verification.                |
| [DFARS 252.204-7021](https://www.acquisition.gov/dfars/252.204-7021-cybersecurity-maturity-model-certification-requirements.)                                                                                                                                            | Current clause version/date unread                                                 | All; CMMC contractual implementation research lead                                                                                       | Blocked. Current title/text, effective dates, rollout, required level and contract inclusion not verified.                  |
| [NIST SP 800-171 Rev. 2](https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final), Protecting CUI in Nonfederal Systems and Organizations                                                                                                                                    | February 2020; updates as of January 28, 2021                                      | Level 2 baseline in pinned model; also quoted discussion supporting Level 1 guide                                                        | Cached government-mirror PDF cover/hash checked. Current NIST publication status and current CMMC incorporation unresolved. |
| [NIST SP 800-171 Rev. 3](https://csrc.nist.gov/pubs/sp/800/171/r3/final)                                                                                                                                                                                                 | Requested revision; current publication date/status unread                         | Version-comparison research only; not substituted for Rev. 2                                                                             | Blocked. A newer NIST publication alone does not change the pinned CMMC edition or a contract.                              |
| [NIST SP 800-171A](https://csrc.nist.gov/pubs/sp/800/171/a/final), Assessing Security Requirements for CUI                                                                                                                                                               | June 2018 as cited by pinned guides; standalone PDF not checked this pass          | Level 1/2 assessment-method and determination provenance; Level 1 guide adapts CUI references to FCI                                     | Blocked. Compare the actual DoD determinations used in the edition, not presumed interchangeable NIST wording.              |
| [NIST SP 800-172](https://csrc.nist.gov/pubs/sp/800/172/final), Enhanced Security Requirements for Protecting CUI                                                                                                                                                        | February 2021                                                                      | Source for selected Level 3 requirements in pinned model                                                                                 | Cached government-mirror PDF cover/hash checked. Current status and applicability unresolved.                               |
| [NIST SP 800-172A](https://csrc.nist.gov/pubs/sp/800/172/a/final), Assessing Enhanced Security Requirements for CUI                                                                                                                                                      | March 2022 as cited by pinned Level 3 guide; standalone PDF not checked this pass  | Level 3 assessment provenance; DoD selection and parameters remain necessary                                                             | Blocked. Current publication status and exact standalone wording not independently checked.                                 |

The model's Appendix C (PDF 44 / printed 41) pairs a Rev. 2 label with older
December 2016 / June 2018 dates. The acquired SP 800-171 Rev. 2 cover instead says
February 2020 / updated January 28, 2021. Preserve the model quotation and document
the discrepancy; do not propagate its bibliographic dates as the NIST cover dates.

## Access results and limits

Eighteen normal HTTPS GET attempts used curl with the configured session proxy,
TLS verification and a 20-second request limit. Every request failed with curl
exit 56, `CONNECT tunnel failed, response 403`, and origin HTTP status `000`.
This is a proxy denial **before an origin response**, not an official site returning
403, a missing document, or proof that a publication has been withdrawn. The log
records each exact requested URL and UTC timestamp. No proxy/TLS bypass, personal
cookies, credentials or alternate identity was used. No web-search connector was
available in this session. Repeating the blocked requests cannot resolve currentness.

## Reuse and remaining work

The four DoD notices permit public distribution. The two inspected NIST PDFs state
that they are not subject to copyright in the United States and appreciate
attribution. Preserve titles, versions, quotations and attribution. These notices
are not an endorsement, a global licensing opinion or a license for unrelated
third-party content. No vendor-derived explanations were imported. Live regulatory
pages were not obtained, so their present site-specific terms were not reviewed.
LICENSE and existing third-party notices remain unchanged.

A reviewer with ordinary access to the official sites must record retrieved
publication versions, dates, hashes where applicable, current CFR/DFARS text and
effective amendments, then reconcile the findings with the snapshot. Separate any
new applicable edition rather than relabeling these addresses. Contract-specific
applicability also needs the relevant contract, information type, assessment scope
and qualified judgment; do not submit real contracts, CUI or evidence in public
issues. Qualified content approval and comprehensive objective coverage remain
separate open gates.
