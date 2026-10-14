# Editorial review process

Dummy-Down separates faithful source transcription, an educational interpretation,
and qualified human approval. These are different checks. A passing test, an
AI-assisted audit, or a link to an official publication never makes a lesson
professionally approved or establishes an organization's compliance.

## Work from an identified publication

Start with the exact framework and edition, then the stable requirement identifier.
Record the publication title, issuing body, version, publication date, document
number, source ID, original URL, acquisition URL, and SHA-256 of the reviewed
bytes. Link the existing [source manifest](../sources/cmmc-2-13-manifest.json)
rather than duplicating a changing list of source documents.

Record both the PDF page and printed page. They differ in the CMMC guides. Name
the section and the assessment-objective labels checked. A requirement citation
is not evidence that its objectives have been mapped into the teaching content.
Keep attributed quotations separate from original prose, examples, diagrams,
questions, and answer explanations.

Snapshots remain versioned. Correcting an explanation within an edition does not
change the quoted source. A new regulatory baseline needs a separate edition and
a documented relationship to the old one; never silently reuse an old lesson
address for a different publication.

## Check applicability and record access limits

Check the official DoD program material and applicable FAR/CFR references before
calling a publication current. Use the NIST edition cited by the applicable CMMC
baseline: the most recent NIST publication does not automatically replace it.
Distinguish publication applicability from a particular organization's contract,
information, system boundary, and required assessment level.

Record the date, exact URL, result, and what that result allows the reviewer to
conclude. An inaccessible official host is an unresolved freshness check. A
hash-verified pinned mirror can establish which snapshot was inspected, but does
not independently establish the current official-host bytes or today's contract
applicability. Do not bypass TLS verification, collect credentials, or invent a
successful source check. Continue checks that do not depend on the blocked host
and leave the specific limitation visible with the lesson's source context.

## Review the interpretation and learning activity

Read the requirement, every applicable objective, and relevant discussion. Check
that each perspective has a useful purpose: Beginner explains the meaning; IT &
Cyber connects it to possible mechanisms and cautions; Compliance connects it to
the source's determination statements and questions to investigate.

Check omitted conditions, exceptions and parameters. Separate this requirement
from adjacent requirements. Explain necessary vocabulary where the learner
encounters it. Keep fictional workplace choices and possible technologies labeled
as examples rather than universal obligations. Candidate evidence illustrates a
discussion; it is neither an exhaustive checklist nor a guarantee of assessment
success. Where useful, cite potential assessment methods as well as the objective.

Review each scenario, diagram, question, correct answer, and distractor explanation
against the same source. A diagram needs a text equivalent and must teach the same
concept as its caption. Knowledge checks establish neither compliance nor
assessment readiness, and should never request organizational evidence or CUI.

## Record the result without collapsing review stages

Use the following fields for a control-specific review record. A single document
may group controls if it still lists their individual source pages, objective
labels, findings and dispositions.

| Field                | Required information                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity             | Framework ID, edition ID, stable control key, displayed requirement ID.                                                                            |
| Content inspected    | Files or content IDs and a commit or content fingerprint. Name the perspectives, scenario, diagram, glossary terms and questions actually checked. |
| Source               | Publication title/version/date/document number, source ID, original URL, acquisition path, hash, exact section, PDF page and printed page.         |
| Objective coverage   | Objective labels reviewed and labels explicitly connected to the teaching content. State unmapped labels.                                          |
| Source-check date    | ISO date, source-verification method, and exact result.                                                                                            |
| Applicability        | Official sources attempted/read, access results, edition applicability and unresolved present-applicability questions.                             |
| Source verification  | `pending`, `pinned-snapshot-verified`, or `official-host-verified`, with the particular checks performed.                                          |
| Editorial review     | `draft`, `ai-assisted-reviewed`, or `qualified-human-approved`, with findings and disposition. Do not imply the latter two are interchangeable.    |
| AI-assisted reviewer | Role/tool and actual scope, date, remaining concerns; never label an agent as a human reviewer.                                                    |
| Human approval       | Actual qualified person's attribution, relevant expertise, date, approved scope and any reservations, or explicitly `pending`.                     |
| Unresolved questions | Missing source access, interpretation uncertainty, content gaps and next review owner/action.                                                      |
| Validation           | Transcription/integrity checks, functional tests and accessibility checks actually run, with their limits.                                         |

Apply source-supported corrections within the normal feature-branch/PR workflow.
Keep concise before/after findings. Re-review a changed passage and its related
examples rather than allowing an old review to cover new content automatically.
Preserve independent review findings, even where the implementation chooses a
different approach with a documented reason.

Qualified approval requires a real qualified reviewer to review the final scoped
content and acknowledge the result. Leave the UI and metadata marked **draft**
until that occurs. No named qualified reviewer has approved the current CMMC
curriculum. Human content approval would still not certify a visitor's systems,
organization or assessment readiness.

## Current records

- [Qualified-review instructions](QUALIFIED_REVIEW.md) and [feedback template](REVIEW_TEMPLATE.md):
  qualifications, source/objective checks, approval and rejection decisions, exact
  scope, change history and re-review. No real human decisions have been recorded.
- [Level 1 audit, 2026-10-14](level-1-audit-2026-10-14.md): Increment 2 comparison
  of all 45 perspectives with all 59 determinations, source-supported clarifications
  and per-control fingerprints. Current applicability and human approval remain open.
- [Level 1 audit, 2026-10-13](level-1-audit-2026-10-13.md): all 15 existing
  perspectives records; pinned September 2024 CMMC 2.13 source context and the
  objective citations for the focused three-lesson milestone. The final scoped
  review records implemented corrections, all three activities and their answer
  feedback, 14 new glossary definitions, 15 review records and inspected-content
  fingerprints. Human approval remains pending.
- [Complete perspectives audit](https://github.com/WaylandP/cipher-and-chalk/blob/archive/ai-review-records/docs/designs/cmmc-perspectives-editorial-audit.md):
  prior AI-assisted review of the 149 versioned draft records. Its scope and
  fingerprints describe that earlier content, not automatic approval of later
  learning activities.
