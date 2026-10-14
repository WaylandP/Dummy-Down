# Assessment-statement teaching mappings — October 14, 2026

Scope: framework `cmmc`, edition `cmmc-2-13-sep-2024`, all 149 controls and
468 attributed statement rows. AI-assisted review by the Codex coordinating agent
and independent read-only `/root/accuracy_audit`. No qualified human approval.

## What was compared

The [source inventory](../sources/cmmc-objectives-2-13.md) contains 459 lettered
determinations and nine separately classified organization-defined parameter rows.
Each statement was compared with explicitly selected fields in the existing draft
perspectives, not inferred from a keyword match or the existence of a control page.
The independent reviewer checked all 468 selected relationships across 149 controls.
This is narrower than a full audit of all 447 perspective texts; Increment 4 retains
that Level 2/3 editorial assignment.

The authoritative per-control mapping record is
[`src/data/cmmc-objective-mappings.json`](../../src/data/cmmc-objective-mappings.json).
Each control lists its actual source labels, teaching-field locations, optional
supplementary note, optional existing scenario step and unresolved question. Its
perspective fingerprint binds the reviewed prose. The source digest and the
complete mapping-payload digest are enforced in
[`objective-coverage.test.ts`](../../src/data/objective-coverage.test.ts), so notes,
field choices and practice links cannot silently retain a stale comparison claim.
The inventory digest separately binds labels, source text and page citations.

Outcome: **466 explained in draft; two missing/unresolved; all 468 human review
pending**. These dimensions overlap. They are not an assessment result, compliance
score, certification, approval or assertion that every perspective teaches each
statement. Thirteen rows link selected fictional scenario steps in the existing
three Level 1 activities; these are illustrations, not complete practice coverage.
No new activity or question was created.

## Source-supported teaching additions

Nine original supplementary notes across eight controls fill specific gaps.
They appear beside the exact statements on `/coverage`, visibly separate from
attributed source quotations. Existing perspective texts remain unchanged.

| Control and labels            | Added teaching detail                                                                                                               | Assessment-guide PDF / printed page |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| AC.L2-3.1.3[a]                | Define the information-flow policy before connecting authorized CUI flows and enforcement to it.                                    | 27 / 19                             |
| AC.L2-3.1.9[a,b]              | Identify and display notices associated with the applicable CUI categories.                                                         | 42 / 34                             |
| AC.L2-3.1.22[a,b]             | Identify authorized people and prevention procedures for both public posting and processing.                                        | 71 / 63                             |
| PS.L2-3.9.2[a,b]              | Establish the personnel-action process and carry out consistent access/credential termination; preserve transfer context.           | 185 / 177                           |
| CA.L2-3.12.4[d]               | Identify requirements approved as non-applicable by the designated authority; do not substitute a team's unsupported decision.      | 216 / 208                           |
| CA.L2-3.12.4[g,h]             | Define the SSP update frequency and actually update it; guide Further Discussion specifies at least annually (PDF218 / printed210). | 216 / 208                           |
| AT.L3-3.2.2e[c]               | Identify training participants and their supervisors, not only job categories.                                                      | 26 / 22                             |
| SC.L3-3.13.4e[ODP1,ODP2,ODP3] | Select physical isolation, logical isolation or both; define techniques for each selected option without making both mandatory.     | 74 / 70                             |
| SI.L3-3.14.6e[ODP1]           | Name external organizations providing threat indicators and mitigations; distinguish providers from individual information entries. | 84 / 80                             |

The independent mapping pass identified seven relationships needing stronger
support, covering nine statements. Three are the added notes for AC.L2-3.1.3,
AC.L2-3.1.22 and SI.L3-3.14.6e above. Four use already-authored Beginner passages:
PS.L2-3.9.1[a] (screen before authorization), MP.L2-3.8.6[a] (stored CUI on digital
media during transport and the physical-safeguard alternative), SC.L2-3.13.7[a]
(simultaneous connections), and AT.L3-3.2.2e[d,e] (all users and delivered feedback).
The six initial notes were found source-consistent. These changes clarify exact
mapping support without rewriting an entire control or introducing a product mandate.

## Unresolved source wording

`SI.L3-3.14.3e[a,b]`, Level 3 guide PDF81 / printed77, stays missing/unresolved.
The guide's parent requirement describes specialized assets included under the
specified enhanced requirements **or** segregated. Determination [a] requires
inclusion and [b] refers to systems/components “not included in specialized assets.”
Further Discussion (PDF82 / printed78) describes specialized-asset scoping and
assessment or separation differently. We preserve the attributed wording and do
not silently substitute an interpretation. A qualified reviewer must reconcile
both determinations, the requirement, and applicable Level 3 scoping guidance.

The current lesson remains a draft and explicitly directs readers to scoping
material. The report does not use that general caution as proof that the two
specific determinations are fully explained. Both source rows remain visible,
searchable and linked to the control.

## Re-review and remaining limits

Follow [QUALIFIED_REVIEW.md](QUALIFIED_REVIEW.md) and
[REVIEW_TEMPLATE.md](REVIEW_TEMPLATE.md). Reviewers must inspect the actual mapped
fields/notes, conditional branches, audiences and practices for each statement.
Record real reviewer qualifications, scope, edition, source and teaching fingerprints,
decision, unresolved issues and date. Source, prose, note or mapping changes invalidate
the affected review; a recomputed checksum is not semantic verification.

Current official-host bytes and applicability remain externally blocked as documented
in the [applicability register](../sources/applicability-2026-10-14.md). No NIST
revision was substituted. Neither this mapping pass nor structural tests establish
present contract applicability, reader comprehension, evidence sufficiency or a
qualified assessment decision. Human approval remains pending for every control.
