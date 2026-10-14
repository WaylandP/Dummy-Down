# Phase 3 Increment 2 — nine source-grounded activity proposals

Prepared on October 14, 2026 by Codex `/root/accuracy_audit`. This is AI-assisted source preparation and draft authorship. It is **not independent final-draft editorial approval, qualified human approval, an organizational assessment, or current applicability verification**.

The coordinator requested three additional activities per CMMC level after Phase 3 Increment 1. The integrated runtime content is in `src/data/expanded-learning.ts`; the adjacent JSON preserves source review records and fingerprints without duplicating runtime activities. No repository file was edited by this author. The current source-input commit is `82db49c90750ae5361b5e1d86eae61f425ba274d`; unrelated coordinator implementation can continue independently.

## Prepared content

Nine new activities contain 27 questions and 81 choice-specific feedback explanations. Every activity includes a learning objective, plain-English explanation, common misunderstanding and correction, fictional scenario, source reference, complete framework/edition/control identity, `reviewStatus: draft`, `contentVersion: 2026-10-14.1`, and only existing glossary term IDs. All human-approval fields remain pending.

The proposals retain native single-choice questions compatible with the existing accessible component. Task intent varies across scenario decisions, classification, concept interpretation, technical interpretation, sequence selection and misconception checks. No drag-only interaction, paid service, real organizational evidence or answer analytics is proposed. The task classifications and source review stay outside runtime question objects. Diagrams are optional and were not fabricated as completed features.

| Control       | Proposed activity ID                 | Full PDF pages / printed pages | Real labels reviewed | Question tasks                                                      |
| ------------- | ------------------------------------ | ------------------------------ | -------------------- | ------------------------------------------------------------------- |
| AC.L1-b.1.ii  | level-one-permitted-actions          | 19–20 / 15–16                  | a, b                 | scenario-decision, technical-interpretation, concept-matching       |
| PE.L1-b.1.ix  | level-one-visitors-and-keys          | 35–37 / 31–33                  | a, b, c, d, e, f     | scenario-decision, source-interpretation, misunderstanding-check    |
| SC.L1-b.1.xi  | level-one-public-system-separation   | 41–42 / 37–38                  | a, b                 | classification, technical-interpretation, misunderstanding-check    |
| IA.L2-3.5.3   | level-two-mfa-access-paths           | 125–127 / 117–119              | a, b, c, d           | technical-interpretation, concept-interpretation, coverage-decision |
| CM.L2-3.4.8   | level-two-software-execution-policy  | 116–117 / 108–109              | a, b, c              | policy-decision, technical-interpretation, misunderstanding-check   |
| AU.L2-3.3.4   | level-two-audit-failure-alerts       | 87–88 / 79–80                  | a, b, c              | technical-interpretation, scenario-decision, sequence-selection     |
| AT.L3-3.2.2e  | level-three-practical-training       | 26–28 / 22–24                  | a, b, c, d, e        | gap-interpretation, design-decision, misunderstanding-check         |
| IR.L3-3.6.2e  | level-three-response-team-deployment | 47–49 / 43–45                  | a, b, c              | source-interpretation, scenario-decision, misunderstanding-check    |
| SI.L3-3.14.1e | level-three-software-integrity       | 77–80 / 73–76                  | ODP1, a, b           | scope-interpretation, technical-interpretation, update-decision     |

The source sections contain 30 lettered determinations and one real ODP statement, `SI.L3-3.14.1e[ODP1]`. Source inventory labels and text are preserved verbatim from the verified repository inventory. Each question’s links illustrate selected concepts; they do not claim that a question or activity fully explains every condition of an objective or supplies sufficient evidence. The complete source statements are review context, separate from authored scenario/question text. `SI.L3-3.14.3e` is deliberately excluded because its existing wording/scoping conflict remains unresolved.

## Actual source acquisition and reading

The old temporary PDF directory was unavailable. On October 14, all four PDFs were restored from the repository manifest’s commit-pinned public GitHub mirrors to `/tmp/dummy-down-cmmc-sources`. Each byte length and SHA-256 matched the manifest before use. Original official URLs, September 2024 publication date, v2.13 edition identity and document numbers remain preserved; reacquiring a mirror does not verify current official-host bytes.

All nine **complete** guide sections in the table were read through the page before the next control. The reading included exact requirements, every assessment determination/ODP, potential Examine/Interview/Test methods, Discussion, Further Discussion, all examples, Potential Assessment Considerations and Key References. No guide section was missing or blocked after restoration. These are 24 selected physical PDF pages across the three guides.

Pinned hashes:

- Level 1, DoD-CIO-00002: `88116fa807b3685703f08c1992580ad0cfbc22ad2bcf76f99378fadf964f7368`.
- Level 2, DoD-CIO-00003: `0dcaba1626a0d23893981d74dd3f0f2338fff54cece67d81bc811ce76392d867`.
- Level 3, DoD-CIO-00004: `6601eb20e8f1490b49c4addd83505eb269062abb3c2bae9b5256449187048ef3`.
- Model Overview, DoD-CIO-00001: `3521adb262f431433bc0be3a3f7f717b0b05c61f1e5eb127c38c81d2979f4a00`.

The model was downloaded for the repository verifier’s dependency; this draft’s instructional comparisons use the listed complete guide sections. The preparation did not contact official DoD/NIST/FAR/CFR hosts. Existing official-host/current applicability limitations remain unresolved; the newest NIST publication was not substituted for this identified CMMC snapshot.

## Content distinctions checked while drafting

- Permitted-function practice distinguishes entry authorization from allowed actions and UI hiding from real enforcement.
- Visitor practice keeps escorting and monitoring distinct, permits manual or automated logs, avoids importing the example’s one-year retention as mandatory, and does not make all non-employees visitors.
- Public-system practice preserves physically **or** logically separated subnetworks and distinguishes network boundaries from HTTPS or approved public text.
- MFA practice preserves local privileged access and privileged/non-privileged network access. Onsite does not mean local; two knowledge secrets are not two factor types. Local ordinary-user access is not added to the exact scope.
- Execution-policy practice preserves the formal alternative between deny-by-exception and deny-all, permit-by-exception. It distinguishes the selected software set from implemented execution controls and installation management.
- Audit-failure practice names identified alert roles, defined failure types and actual alerts; service availability is not audit operation. It invents no fixed notification deadline, required messaging vendor or Level 3 SOC obligation.
- Practical-training practice retains all users, general/specialized/privileged role tailoring, current threats and feedback to both participants and supervisors. It requires no paid phishing provider and collects no real training results.
- Response-team practice preserves the exact 24-hour deployment parameter, maintenance, and conditional remote/physical capabilities. It does not turn deployment into full incident resolution or a legal reporting deadline, and does not invent the start of an unstated contractual clock.
- Integrity practice retains the real ODP software definition, identified mechanisms and actual verification. Each-execution/update context is attributed to Further Discussion; a checked signature is not a guarantee of defect freedom.

## Interpretation notes needing qualified review

`PE.L1-b.1.ix` Further Discussion uses badges “and/or” escorting for non-employees, while the requirement and determinations separately require escorting and monitoring visitors. Its Discussion excludes permanent physical-authorization credential holders from visitor status. The fictional supplier has no such authorization; the draft follows the explicit visitor determinations without broadening them to every non-employee.

`CM.L2-3.4.8` Further Discussion uses “allow-lists and deny-lists,” and its assessment questions focus on allow-listing. The formal requirement uses “or,” and determination [a] asks which policy will be implemented. The draft follows these explicit formal alternatives and does not treat the stronger option or guide example as the only permitted policy.

`SI.L3-3.14.1e` Example 2 describes unsigned essential software verified against a controlled approved hash repository. The formal statement names roots of trust or signatures. The draft contrasts an explicitly **untrusted** file/hash pair and does not declare all hashes invalid or arbitrary matching hashes sufficient. Qualified review should examine the trusted-library example’s interpretation. Its Potential Assessment Considerations also refer twice to `[b,c]` although the real inventory has only `ODP1,a,b`; no nonexistent [c] objective was created. These notes do not block the narrow, source-supported questions, but must stay visible to the qualified reviewer.

## Validation performed and remaining gates

`python3 scripts/verify-cmmc-objectives.py --source-dir /tmp/dummy-down-cmmc-sources` passed. Its prerequisite source verifier checked all four pinned PDFs, all 149 complete model/guide quotations, identities, titles, families and page citations, including the ten preserved wording differences. It then confirmed all 468 inventory statements (459 lettered determinations plus nine ODPs). This is transcription/integrity evidence, not pedagogical approval.

Temporary-proposal checks passed for nine unique non-conflicting activity IDs and 27 unique question IDs, three questions and three unique choices per question, exactly one valid `correctChoiceId`, nonempty explicit feedback for every choice, complete lesson identities, existing glossary IDs, exact source inventory text/labels, full next-control-page-minus-one source boundaries and pending human status. Correct-answer positions are balanced 9/9/9. Each source-review record contains the activity fingerprint and objective fingerprint, computed using SHA-256 of `JSON.stringify` on the parsed object/rows.

No application tests, browser checks or actual learner/assistive-technology acceptance were performed for these temporary source proposals. The coordinator must independently review the integrated final drafts, verify functional feedback/retry/deep-link behavior and run the applicable application/preview checks. Qualified human review and current applicability verification remain external pending gates. The author did not claim those gates succeeded or that any activity has shipped.

Proposal JSON SHA-256: `f692cdba788e276841fc39fea3aec911a65af38dd109f74aafda0adca4409113`.

## Coordinator integration comparison

Codex `/root` read all nine final drafts, questions and choice explanations against their formal requirements and source determinations on October 14, 2026. Complete PDF sections for IR.L3-3.6.2e and SI.L3-3.14.1e were additionally read directly. The other complete guide sections were read by the source author; this is not a claim of a second full-section reading for those controls. No correction was identified. Fingerprints now bind the integrated content to this record; substantive edits require renewed review. Functional and browser results are recorded separately in the [Phase 3 execution log](../reviews/phase-3-execution-2026-10-14.md). All content remains draft, with qualified human approval pending.
