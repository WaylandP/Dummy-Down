# Review a CMMC teaching draft

This is a contributor workflow using a scoped GitHub pull request and the existing
review metadata. It does not add reviewer accounts, an evidence-upload feature or
automatic approval. No qualified human reviewer has approved the present content.
Start with the [editorial process](REVIEW_PROCESS.md) and use the
[feedback template](REVIEW_TEMPLATE.md) for each control.

## Who should review

The maintainer should recruit a real person with demonstrable experience applying
and assessing the relevant CMMC level and the cited FAR/NIST/DoD material. Relevant
assessment credentials may support that qualification but do not alone establish
expertise for every control or endorse this project. Record the person's agreed
public attribution, relevant experience, qualifications, applicable level and any
conflicts of interest. Do not publish credential documents or private employer
details. A subject-matter reviewer can request specialist help for a particular
technical interpretation. A beginner reading the lesson for clarity is useful
acceptance feedback, not a replacement for qualified content review.

The maintainer checks the reviewer's stated competence and attribution before
recording approval. An agent cannot serve as that human or manufacture credentials.
The owner approving a code PR does not automatically approve its teaching content.

## Prepare and perform one review

1. Choose one control with its exact framework, edition and requirement ID. Use
   the final PR preview and commit, the source citation, all three perspectives,
   and the relevant row in the [Level 1 audit](level-1-audit-2026-10-14.md).
   A group review is acceptable only with a separate disposition for every control.
2. Record the inspected content fingerprint. The
   [Level 1 baseline](level-1-review-baseline.json) binds this increment's comparison
   to **the 45 perspective texts only**. A source SHA identifies PDF bytes, not
   teaching text. Existing activities, diagrams, questions, glossary definitions
   and UI are outside this new fingerprint's scope. If reviewing those too, name
   their files/content IDs and inspected commit or hashes separately. Do not let
   a perspective approval imply practice or glossary approval.
3. Check the source checklist below. The
   [applicability register](../sources/applicability-2026-10-14.md) identifies current
   access blockers. A reviewer may evaluate the historical snapshot while leaving
   current applicability unresolved, but must explicitly restrict any approval to
   that historical edition. Never call that a current compliance determination.
4. Compare every determination with the explanations. Record which perspective
   explains it, what is absent or ambiguous, and any conditional or partial
   treatment. For unmapped material write “not mapped”; do not invent a coverage
   percentage. Increment 3 will build the comprehensive objective report. This
   packet does not claim that work is complete.
5. Fill in the template with source-supported findings, exact passages, severity,
   proposed correction and a reason. Use only fictional examples. Do not include
   CUI, real contracts, system configurations, credentials or organizational evidence.
6. Submit the feedback on the scoped PR (or a public issue linked to it). Maintainers
   apply supported changes on a feature branch, update the audit and fingerprints
   **after re-review**, run checks, and ask the same qualified reviewer to inspect
   the final content. Preserve the original decision and link the superseding one.

## Review checklist

- [ ] Correct framework, edition, control, source version/date and exact pages.
- [ ] Official source and acquisition provenance checked; record retrieval date,
      hash and result. Distinguish current official access from a pinned mirror.
- [ ] Current FAR/DFARS/CFR/DoD applicability verified, or explicitly unresolved
      with approval scope restricted to the identified historical snapshot.
- [ ] Requirement, all determinations and relevant discussion read; source wording
      differences and adaptations identified. No silent NIST edition substitution.
- [ ] No omitted condition, exception, parameter or relevant entity changes meaning.
- [ ] Beginner explains meaning and why it matters without assumed jargon;
      IT & Cyber gives possible mechanisms and cautions; Compliance identifies
      questions to investigate and what examples cannot prove.
- [ ] Each objective's explanation location or gap recorded. Reading an objective
      or displaying its quotation is not evidence that the lesson explains it.
- [ ] Implementation choices, fictional scenarios and possible evidence remain
      distinguishable from mandatory requirements and assessment sufficiency.
- [ ] Any explicitly included activity, answer, distractor, diagram/text equivalent
      and glossary definition compared with the same source; excluded items named.
- [ ] Reuse/attribution restrictions checked; no unsupported endorsement or rights claim.
- [ ] Findings dispositioned; exact final content and decision date recorded.

## Decisions and state transitions

These are **editorial workflow states**, recorded in the review template/PR. They
are not new learner-facing completion badges. Existing app metadata has `pending`
and `approved`; it stays `pending` for every state other than an actual scoped
approval. No state transition is caused by a test or an AI audit.

| State                      | Meaning and required action                                                                                                                                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pending                    | No qualified decision. Recruit a reviewer and leave all teaching marked draft.                                                                                                                                                    |
| In review                  | A real reviewer has accepted a named scope; record who and when. Still draft.                                                                                                                                                     |
| Changes requested          | Fixable issues remain. List blocking findings and needed re-review; conditional approval belongs here.                                                                                                                            |
| Rejected                   | The reviewer cannot support the scoped interpretation. Record reasons and source evidence; do not present it as approved. A materially unsafe draft should be corrected or withheld through the normal PR process.                |
| Approved                   | A real qualified reviewer explicitly accepts the exact final edition, content fingerprint and stated scope. Record attribution, qualifications, date, decision link and limits. Approval never certifies a reader's organization. |
| Stale / re-review required | Reviewed content, source, applicability basis or included dependencies changed. Preserve historical approval but withdraw its application to current text; return app metadata to pending and request re-review.                  |

Allowed flow: pending → in review → approved / changes requested / rejected.
Changes requested or rejected → revised draft → in review. Approved → changed
content or source → stale → in review. No silent carry-forward to another edition.

For a real approval, attach a completed template in a dated file under
`docs/content-review/`, link the reviewer's actual acknowledgment, and propose the
matching `HumanEditorialApproval` metadata in the same PR. The maintainer must
confirm the scope before changing any visible draft label. A partial approval does
not lift draft labels for an entire control or its activities. This workflow
prepares that future decision; it records no approval now.

## Change history and validation

The October 13 audit remains historical. The October 14 baseline and audit describe
this increment. `src/data/level-one-review.test.ts` compares every current Level 1
perspective record with its recorded SHA-256 and verifies exact identity/source
binding. A changed sentence causes a failing test until a new substantive review
is recorded; simply updating the expected hash is not a review. JSON formatting
and property order do not invalidate the fingerprint. Removed or duplicated
controls and mismatched editions are rejected separately.

Run the normal type/content/lint/test/build checks and the pinned PDF validator
after relevant changes. Browser checks verify rendering and draft/source labels,
not the correctness of an interpretation. Preserve dated findings and reviewer
decisions in Git; never rewrite an old audit to pretend it covered later content.

External next steps: obtain a qualified reviewer, resolve authoritative-host access,
record real decisions and test comprehension with actual learners. Phase 2 remains
unchecked until its applicable acceptance criteria are satisfied.
