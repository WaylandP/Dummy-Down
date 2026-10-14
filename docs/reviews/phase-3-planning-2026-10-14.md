# Phase 3 delegated planning and baseline audit

Date: 2026-10-14. Repository starting commit: `bf2ff0c86ea2c6076f7b9b1721756b0bf60c9c53`.
Scope: bounded, read-only planning and source inspection. This report is the only
file this worker wrote. Parent owns implementation, tests, GitHub publication and
merge decisions. No child agents, outside model providers, paid services or live
learner interviews were used.

## Authorization and starting point

Read the complete user assignment at
`/workspace/attachments/ffa6ed5c-3be3-43db-b910-0d7dd56f6191/Pasted text.txt`.
It explicitly authorizes five Phase 3 increments, routine squash merges after
required validation/review gates pass, and verification of automatic Vercel
production deployments. This is a limited override of the manual-merge rule for
this assignment only. It does not authorize bypassing required GitHub reviews,
branch protection, failing checks, deployment protection or unrelated changes.
No merge was performed by this worker.

Initial checkout was clean at the commit above. Read-only GitHub checks returned
no open PRs; PR #18 was MERGED at `bf2ff0c86ea2c6076f7b9b1721756b0bf60c9c53`
on 2026-10-14T15:37:12Z. This is observed starting evidence, not a promise that
remote state stays unchanged. Recheck before each merge.

Read README, ROADMAP, TODOS, CHANGELOG, AGENTS, DESIGN and the current implementation.
Phase 1 engineering foundations and Phase 2 source inventory, 447 teaching drafts,
objective inventory/mappings and AI-assisted audits are merged. Owner/learner,
screen-reader, Safari/iOS, native zoom, qualified content approval, current source
applicability and unresolved objective interpretation remain open. These do not
block independent, visibly draft Phase 3 development. Previous handoff wording
excluding Phase 3 applies to the previous assignment and is superseded here;
Phase 4 remains excluded.

## Seven-milestone Phase 3 baseline

| Existing roadmap milestone                             | Actual baseline evidence                                                                                                                                                                                                                                                         | Engineering next step and completion boundary                                                                                                                                                                                                                     |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Original fictional demo activity                    | Checked complete in roadmap. `src/data/learning.ts` exports the `authorized-access-practice` activity, bound to `cmmc/readme-example/authorized-access`; three explained questions and the archived README teaching source.                                                      | Preserve it and include it in regression checks. Its simplified example remains distinct from an official complete requirement.                                                                                                                                   |
| 2. Three edition-bound Level 1 activities              | Implemented, awaiting review. `src/data/level-one-learning.ts` contains authorized access, public information and media disposal, each with three questions, misconception, plain-English meaning, scenario and diagram. Source pages 16, 24 and 31 of the pinned Level 1 guide. | Increment 1 improves the shared experience. Qualified review and real-learner validation remain unchecked even after engineering ships.                                                                                                                           |
| 3. Twenty-term draft glossary                          | Implemented, awaiting review. `src/data/glossary.ts` plus `level-one-glossary.ts` yield 20 entries, 14 sourced additions. `level-one-terms.ts` binds contextual references to the exact edition; `ContextTerms` opens inline and restores focus on close/Escape.                 | Preserve definitions, citations and focus behavior. Test lookup from practice context, wrapping and return to the activity. No need to rewrite sound definitions to make this increment larger.                                                                   |
| 4. Learning navigation/accessibility and comprehension | In progress. Reader outline conditionally exposes Practice; native radio choices, focus movement, feedback and reset already exist in `LearningPractice`. Phase 1 technical browser checks exist. No real learner or AT acceptance evidence.                                     | Improve discoverability, honest progress, meaningful completion and mobile/keyboard flow. Record automated/browser evidence separately; retain human validation dependencies.                                                                                     |
| 5. Expanded reviewed exercises across Levels 1–3       | Planned. Only the three Level 1 source activities and original demo exist. No Level 2/3 source-bound practice.                                                                                                                                                                   | Increment 2 targets at least three additional activities per level, with reliable pinned-source grounding, explicit objectives, varied useful question types and draft status. Implemented drafts do not complete the word “reviewed” without qualified approval. |
| 6. Short animated explanations                         | Planned. `LessonDiagram` renders ordered semantic HTML plus optional branches and text equivalent. No timed/playable lesson system exists.                                                                                                                                       | Increment 3 supplies three actual instructional animations, ideally one per level, with play/pause/restart, synchronized text/transcript, duration/progress and reduced-motion equivalent. Preserve pending editorial approval.                                   |
| 7. Progress/practice support                           | Planned. Quiz state is component-local and reset on leaving its identity; no saved learning progress. Analytics preference is separate.                                                                                                                                          | Increment 4 adds optional minimal local-first progress, robust storage failure handling, version binding, resume/revisit and deletion. No accounts, backend, free text, evidence or analytics identifiers.                                                        |

Runtime inventory inspection through TypeScript transpilation in memory confirmed
4 activities, 12 questions, 3 diagrams and 20 glossary terms. All 36 answer choices
have explanatory feedback. The original demo lacks the optional plain-English,
misconception and diagram fields; this is supported by the renderer, not a broken
reference. One attempted inventory method could not import absent `esbuild`;
the available TypeScript compiler provided a read-only in-memory alternative.
No dependencies were installed and no test passed merely because of this count.

## Office-hours framing and delegated assumptions

Mode: Builder, open-source education. The user supplied a complete five-increment
plan and delegated routine choices. Questions are answered as assumptions from
that request and README, not invented interview responses.

- Coolest useful outcome: a learner sees a decision unfold, tries a response,
  understands its consequence, and can explain the distinction later. A working
  login versus authorized access is a concrete teaching moment already present.
- Primary learner: a beginner with a specific confusing control; IT/Cyber and
  Compliance readers retain their distinct explanatory modes and the same source.
- Fastest usable slice: improve the existing four activities before adding nine
  more. Keep the current website and deployment channel.
- Closest current alternative: this app already supplies reference text and
  explanations; the missing capability is a clear practice loop, not another
  control index or homepage redesign. No competitor research was performed.
- Larger possibility: educators could work through the same fictional decision
  together in a workshop, without entering organizational evidence. This is a
  design lens, not an added classroom/account feature.
- Assumption requiring later evidence: clearer feedback and resume will help
  retention. No measured engagement, learner satisfaction or commercial demand is
  asserted.

Premise challenge: adding more quizzes alone will not make the site educational.
The first improvement must connect choice, feedback and reflection. Existing
feedback is already substantive; preserve it instead of substituting green/red
marks. Doing nothing leaves activities tucked behind disclosures, progress looking
partly complete before any answer, and completion without a review of reasoning.

Alternatives considered:

1. Minimal patch: clearer disclosure labels only. Low effort/risk, but does not
   repair progress/completion or establish a good base for expanded activities.
2. Extend the existing activity renderer and data contract incrementally.
   Recommended: preserves exact lesson identities, source/draft boundaries and
   proven radio/focus behavior while supplying the complete five-increment path.
3. Build a separate course player/dashboard. Higher complexity and migration risk;
   rejected for this assignment because it changes the product structure without
   solving a demonstrated requirement better.

CEO posture: HOLD SCOPE to the explicit five increments. The “10-star” opportunity
is a coherent learning loop, not additional features. Routine internal choices
are delegated; actual human acceptance and enforced external approvals are not.

## Increment 1 decisions for implementation

Accepted within the user's scope:

1. Expose a direct “Start the questions” action near the practice introduction.
   Open the existing disclosure and focus the current prompt; if already complete,
   move to its completion heading. Preserve native disclosure use and one intended
   event per open action. Do not force people through a long introduction.
2. State the real question count and explain briefly that answers have reasoning,
   retries are allowed, and the exercise is learning rather than an assessment.
3. Progress starts at zero. Label what is measured—questions reviewed/checked—not
   mastery or compliance. A checked incorrect answer may advance after its
   explanation; correct-on-every-question is not a new gate.
4. Retain the latest checked answer per question in memory for a completion review.
   Show what was selected, why it was/is not appropriate, and the correct rationale
   where needed. Retrying and checking replaces that question's latest record.
   Restart clears records; mode switches keep them; another exact lesson identity
   must not borrow them. No scores, badges or storage in this increment.
5. Add a restrained practice-available label in search results only when
   `findLearningActivity` resolves the full framework/edition/control tuple.
   Do not infer practice from level or display ID.
6. Preserve the current diagrams and contextual glossary. Test that their text,
   source context and return focus remain usable in the full learning journey.

Brand decision: the new brief mentions black/green and turquoise while the shipped
DESIGN uses black/ochre with turquoise in the mark. Its simultaneous instruction to
preserve existing tokens/no redesign governs Increment 1: keep the shipped black
canvas, off-white reading and existing assets. A later teaching animation may use
restrained turquoise for meaning; no green canvas or replacement identity is needed.

Not in Increment 1: new curriculum, alternate question types, animations, persistent
progress, accounts, cross-framework content, homepage redesign or new analytics
collection. These first four items have their defined later increments.

## Engineering and interaction contract

```text
exact lesson tuple -> findLearningActivity -> existing LearningPractice
                                            |
                          Start/open questions -> unanswered (0 checked)
                                            |
                               select -> Check -> explanation + record
                                           / \
                            Retry/select/check  Next -> next prompt
                                           \     /
                                      Finish -> reasoning review
                                                |
                                  Practice again -> empty local state
```

| Condition                   | Required result                                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Missing activity            | No practice badge, false button or empty quiz.                                                                                           |
| No selection                | Check/Next cannot complete a question; radio instruction remains understandable.                                                         |
| Wrong answer                | Specific existing explanation, no color-only feedback; retry or continue after check.                                                    |
| Retry                       | Clear current selection/check state; do not skip questions or duplicate a completion record.                                             |
| Mode change                 | Same activity and local question state; source and meaning do not change.                                                                |
| Different lesson or restart | Reset local answers and review to the correct activity; no stale question content.                                                       |
| Completion                  | Reasoning summary and next action; no claim of readiness, certification or saved progress.                                               |
| Lazy teaching-load failure  | Source remains usable; existing reload recovery and exact URL preserved.                                                                 |
| Browser privacy controls    | Existing production-only measurement, opt-out, DNT/GPC and allowlists retained; no answer choices, result correctness or free text sent. |

Architecture: extend `LearningPractice`, reuse `findLearningActivity`, retain
`ControlResults` and the existing controller. No dependency, endpoint, database,
credential or server migration is needed for Increment 1. Local answer history is
bounded by the activity's authored question count. New question types should be a
discriminated data union later, with complete renderer/validation coverage; do not
build an option-heavy general course engine now.

Security concern to test: answer-review state must remain local and must not enter
URL, clipboard, storage or existing event properties. Reliability concern: stale
completion and prompt focus after retry/restart/identity change. Performance concern:
expanded completion text should be readable, not pre-rendered across every catalog
entry; measure actual bundle changes rather than inventing timing estimates.

## Design and QA charters for parent execution

The reading surface is READ; selecting/checking/retrying is OPERATE. Keep one
question and one obvious next action, with other explanations nearby but quiet.
Do not make the three audience modes separate quizzes with inconsistent facts.

1. Entry: home/search -> exact practice-capable source -> source/mode -> practice.
   Confirm badge accuracy, clear question entry and no hidden lesson tracking.
2. Learning: choose wrong answer -> check -> read why -> retry -> correct -> next.
   Confirm radio keyboard behavior, prompt/feedback focus, unchanged question count
   and one current answer. Repeating fast clicks must not skip a question.
3. Completion: finish all questions, including an explained wrong response -> read
   every question's reasoning -> restart. Confirm correct identity, cleared state,
   no numerical compliance score and meaningful completion action.
4. Context/history: use a definition and Escape, change perspectives, copy a link,
   visit another control, Back/Forward/reload. Confirm exact state contracts and no
   promise that current local practice survives a document reload.
5. Presentation: inspect actual screenshots at 320, 390, 768, 1024 and 1440 pixels,
   narrow/200%/400% reflow, forced colors and reduced motion. Long choice/feedback
   text must wrap with reachable actions and visible focus. Distinguish reflow or
   device emulation from actual native browser zoom and real assistive technology.
6. Privacy/error: opt-out, DNT/GPC, preview gating, invalid lesson, missing activity,
   lazy loading failure and empty results. No private query or answer in analytics.

Reuse current behavioral tests in `LearningPractice.test.tsx`,
`LevelOneLearning.test.tsx`, `learning-tools.test.tsx`, glossary integrity tests and
the existing browser harness. Add regressions for newly changed contracts, not
snapshots that merely restate markup. Parent must run all required project checks
and inspect exact-commit CI/deployment before a merge. Existing protected previews
must stay protected; local browser evidence and deployment success are distinct.

No browser probe, accessibility pass, merge-gate pass or final implementation
approval is claimed by this planning document.

## Actual gstack reads and execution limits

Pinned source verified by `git -C /workspace/tools/gstack rev-parse HEAD`:
`945ac301a91dff5db9fc1ddaea5b77828eeca2ed`. Existing docs describe version
1.91.97.0 and experimental Codex support; pin verification is not a native skill pass.

Actual reads used for this bounded adapted planning work:

- `office-hours/SKILL.md`: invocation/preamble, context gathering, Builder routing,
  premise challenge, alternatives and important rules; full
  `sections/phase-2b-builder-brainstorm.md`. `sections/design-and-handoff.md` was
  inspected for design artifact/template and review/handoff instructions; the large
  output was truncated, so no full-file read/completion claim is made.
- `plan-ceo-review/SKILL.md`: philosophy/prime directives, scope/mode and temporal
  planning sections. `sections/review-sections.md` lines 109–329 read for all eleven
  substantive review dimensions, applied above within this bounded plan.
- `plan-design-review/SKILL.md`: named-target scope gate, design philosophy,
  usability principles, pre-review audit and scope assessment.
  `sections/review-sections.md` lines 80–110 and 223–252 read for hierarchy, state,
  journey, system alignment, responsive/accessibility and unresolved decisions.
- `plan-eng-review/SKILL.md`: section routing, scope challenge and recovery rules.
  `sections/review-sections.md` lines 391–432, 513–580, 687–745 and 813–824 read for
  reuse/complexity, architecture, code quality, test depth/regressions and performance.
- `design-review/SKILL.md`: lines 977–1000, 1061–1100, 1306–1388 and 1479–1508 for
  diff-aware scope, screenshot evidence, interaction flow, consistency and READ/
  OPERATE classification. Source-derived findings above are planning findings,
  not a completed rendered visual audit.
- `qa/SKILL.md`: invocation/preamble and section index. Full `sections/scope.md`,
  `sections/exploratory.md` and `sections/qa-patterns.md`. Planning proposes charters;
  it does not execute or claim the guarded browser probe sequence.
- `review/SKILL.md`: invocation/preamble and stage routing; full `checklist.md`
  (read in two parts) for state, trust boundary, enum/consumer completeness, gate
  integrity and evidence. Implementation diff review is a separate follow-up.

This is **adapted, partial planning**, not full native execution of seven skills.
No skill-start receipt, enforced hooks, native discovery verification, sealed
adversarial verdict, external research/model call, visual designer/mockup, formal
rating or complete native report ledger was produced. The worker is explicitly
restricted to one /tmp artifact and no children, so default dual writes, telemetry,
recursive specialists and external providers were not run. User delegation supplies
routine scope decisions; it does not fabricate approvals, interviews or acceptance.
Parent can preserve this evidence in the task execution log and separately record
actual engineering/browser results.

## Bounded Increment 1 implementation review

Read the current diff for `LearningPractice.tsx`, `ControlResults.tsx`, shared CSS,
`LearningPractice.test.tsx` and `reference-catalog-ui.test.tsx`; read the new
`tests/browser/phase3-practice.spec.ts`. No source/test edits by this worker.

One medium UX finding in the reviewed version: `LearningPractice.tsx:110–115`
shows a reader's last checked answer in the completion recap followed by the
correct choice's feedback, without explicitly marking a wrong answer as incorrect
or repeating its own explanation. A skim reader can retain the wrong claim from
the recap. Recommended minimal repair: a textual per-question correctness label,
the selected wrong choice's explanation where applicable, then the correct
choice/takeaway. Test an incorrect completion record and replacement by a retried
checked answer. This finding is not marked resolved without a follow-up read.

Other reviewed changes match the bounded plan: practice badges use the full tuple,
entry opens the existing disclosure, checked answers stay in local React state,
restart clears them, completion is not scored, and privacy event shapes are
unchanged. The renamed progress assertions reflect the intended change from
position to reviewed questions. Adjusting the anchored source-result accessible
name pattern to allow the new badge is justified; retaining eight results and
adding an exact three-badge assertion does not weaken that behavior check.

The parent reports browser/unit execution separately. This worker did not run or
independently verify those results and does not count them as its own validation.
