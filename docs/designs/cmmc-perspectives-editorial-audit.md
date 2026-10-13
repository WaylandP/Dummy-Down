# CMMC perspectives: complete draft editorial audit

Date: 2026-10-13. Scope: the September 2024 CMMC version 2.13 snapshot and
original teaching drafts attached to its identifiers. This is an independent
in-host agent review, not qualified human approval or certification.

## Result and coverage

Every one of the **149 draft records**, including all **447 perspective views**,
was read against the exact requirement and the applicable guide's assessment
objectives. The guide's Discussion/Further Discussion was checked for the
interpretive claims, scope exceptions and parameters discussed by these drafts.
The review included beginner meanings and fictional examples, technical focus,
examples and cautions, and compliance focus, questions and candidate evidence.

| Level   | Source identifiers | Draft records | Perspective views |
| ------- | -----------------: | ------------: | ----------------: |
| Level 1 |                 15 |            15 |                45 |
| Level 2 |                110 |           110 |               330 |
| Level 3 |                 24 |            24 |                72 |

The inventory is a set of versioned identifiers, including concepts that overlap
between levels; it is not 149 distinct security concepts or reviewed assessment
lessons. Level 1's old 17-practice numbering was not mixed into this snapshot,
and Level 3 was not expanded to all 35 NIST SP 800-172 requirements.

No unresolved direct contradiction, invented official objective, unsupported
mandatory product, changed source exception or invented numeric parameter was
identified in these drafts. Six source-supported clarifications were applied and
independently checked during the author/reviewer exchange. The statements remain
draft educational interpretations and do not establish complete objective
coverage or evidence sufficiency.

## Source verification

The expanded verifier passed against all four pinned source PDFs:

```sh
python3 scripts/verify-cmmc-sources.py --source-dir /tmp/dummy-down-cmmc-sources
```

It checks exact hashes and provenance; independent model and guide inventories;
all complete guide/model requirement statements; official model titles and
families; identifier and level relationships; both documents' PDF and printed
page citations; and all ten preserved model/guide wording differences. Eleven
isolated corrupt-catalog mutation checks were rejected, including quote
truncation and removal of a Level 3 DoD parameter.

Source bytes and acquisition limitations are documented in
[the versioned source research](../sources/cmmc-2-13-sep-2024.md) and
[the pinned manifest](../sources/cmmc-2-13-manifest.json).

## Clarifications verified after revision

The page numbers below locate the specific passage, which can follow the page
containing the control's requirement quotation.

| Identifier    | Clarification and source context                                                                                                                                          | Guide location               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| RA.L3-3.11.1e | Further Discussion specifies more than one intelligence source and use of any DoD-provided sources. The draft explicitly includes both.                                   | Level 3 PDF 54, printed 50   |
| SC.L3-3.13.4e | Discussion treats communications across managed isolation interfaces as remote access even inside the organization, including administration. The technical view says so. | Level 3 PDF 75, printed 71   |
| CA.L2-3.12.1  | Potential Assessment Considerations asks about assessment at least annually. The draft attributes this question to that section while retaining the periodic requirement. | Level 2 PDF 210, printed 202 |
| CA.L2-3.12.2  | Further Discussion distinguishes operational action plans from assessment POA&Ms; the latter's 180-day closeout rule is not imposed on operational plans.                 | Level 2 PDF 212, printed 204 |
| CA.L2-3.12.4  | Further Discussion specifies SSP updates at least annually. Draft technical and compliance views attribute this to the pinned guide.                                      | Level 2 PDF 218, printed 210 |
| SC.L2-3.13.12 | Further Discussion excludes internet screen-sharing technologies. The draft includes this alongside the separately described dedicated-conferencing-system exclusion.     | Level 2 PDF 245, printed 237 |

The first two clarifications arose from the independent Level 3 discussion
review. The Level 2 author and reviewer coordinated the remaining four;
the reviewer checked every final revision against its exact source passage.

## Cases given particular scrutiny

- Identification, authentication and authorization remain different concepts.
  A successful login is not presented as permission to do every subsequent task.
  Users, processes acting for them and devices remain in the relevant scopes.
- Least privilege, use of non-privileged accounts, separation of duties and
  separation of management interfaces remain distinct. Examples do not require
  one identity platform, application architecture or product.
- IA.L2-3.5.3 retains MFA for local and network privileged access and network
  non-privileged access. It does not invent a mandate for every local ordinary
  login. Replay resistance remains separate from an MFA or encryption label.
- Organization-defined timeouts, password-history generations, identifier reuse
  periods, flaw timeframes and scan frequencies remain undefined by the app.
  The versioned password complexity requirement is not silently replaced by
  advice from a later NIST edition.
- FIPS validation is explained as module/deployment validation, not merely an
  approved algorithm or marketing claim. Encryption is not made mandatory for
  every at-rest scenario; transport and transmission physical-safeguard
  alternatives are preserved where the source provides them.
- Media controls include paper and digital media where applicable. The guide's
  distinction between sanitization for reuse and sanitization or destruction for
  disposal remains explicit in the compliance explanation.
- Publicly accessible system separation, internal boundaries, remote-session
  control and prohibited split tunneling remain separate subjects. Merely
  naming a DMZ, VLAN, VPN or firewall does not demonstrate the corresponding
  protection.
- Level 3 resources may be owned, provisioned or issued; the drafts do not say
  company ownership is the only qualifying relationship. Bidirectional
  authentication retains “where possible.” Component admission retains the
  source's “or” rather than turning alternatives into four mandatory checks.
- Level 3 annual/event training and plan-update conditions, 24/7 SOC operation
  with remote/on-call staffing, and response-team deployment within 24 hours
  are preserved. Deployment is not confused with incident resolution or a
  universal requirement for physical attendance.
- Specialized assets are not declared automatically exempt. The draft directs
  readers to source wording, applicable scoping guidance, inventory/SSP
  treatment and purpose-specific segregation; intermediaries are discussed
  only in the context supported by the guide.
- Insider and adverse-information examples use defined reporting/review
  processes without labeling a colleague guilty or prescribing a universal
  disciplinary result. Examples and evidence records call for appropriate
  handling of sensitive information.

## Existing teaching material

The README-based authorized-access example, its six glossary terms and its
fictional practice activity were also checked. No substantive correction was
identified. They accurately retain their narrower teaching scope, make approval
distinct from a working login and describe the scenario's device-approval rule
as fictional rather than a universal prohibition of personally owned devices.
The practice does not claim to assess all users/processes/devices or official
assessment objectives.

## Content fingerprints and limits

The final audited JSON files have these SHA-256 fingerprints:

| File                        | Records | SHA-256                                                            |
| --------------------------- | ------: | ------------------------------------------------------------------ |
| perspectives/level-1-3.json |      39 | `eaa1f82f4b1cc4e46bf0ca82d73b10db7b16207ebea6af42b8ef8c80b62306cd` |
| perspectives/level-2-a.json |      54 | `7e506775369e1a6f0dc3528c1eed33b481264245c535dedbc2202409f7a2013d` |
| perspectives/level-2-b.json |      56 | `0d72f246f340413a79571362b930e84821b7de9ddc0df1ae2964db0a76c48602` |
| cmmc-213-catalog.json       |     149 | `a0a0d58906e203d8b62103c7830e72cc6c146783898db11cbfe016fdb94d7938` |

Paths above are relative to `src/data/`. Subsequent substantive content changes
need an affected-content review; these fingerprints do not certify future edits.

Official DoD index/model fetches again failed with proxy CONNECT 403. The audit
therefore checks faithful coverage of the pinned snapshot and internal fidelity
of the teaching drafts, not the latest edition or today's contractual scope.
Keep draft status, source/version context, fictional-example status and
candidate-evidence limitations visible in the application. Agent review and
automated checks cannot establish that every educational interpretation is
“100% accurate,” replace qualified human editorial review, or guarantee an
assessment outcome.
