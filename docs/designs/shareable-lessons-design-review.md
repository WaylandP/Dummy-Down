# Shareable lessons and contextual glossary: design plan review

Reviewed target: [shareable-lessons-plan.md](shareable-lessons-plan.md), including
the completed engineering sections. Date: 2026-10-13. Source: `ac60936`, branch
`feat/shareable-control-lessons`. This report records implementation specifications;
the new UI is not built, rendered, or accepted by browser checks yet.

Scope was explicitly selected by the coordinating agent under the owner's
continuous-work instruction. Routine choices below are individually recorded
agent decisions under plan C1/C3/C4/C7 and `AGENTS.md:54–60`, not human questionnaire
answers or invented preferences. The coordinating agent owns incorporation into
the shared plan; this review changes no source, roadmap, or official-content claim.
The installed `gstack-plan-design-review/SKILL.md` and its complete referenced
review sections were read. Its question pauses are superseded by the actual
instruction to make routine choices and continue without questions.

## System audit and Step 0

Git hosting is GitHub; local `origin/main` resolves to `ac60936` and is the base.
The origin HEAD symbolic ref is absent, so the verified main ref supplies the
git-native fallback. No remote/API request was made. Local history has five
commits, including the frontend foundation and field-guide plan, and no prior
design-review cycle for these new features. The tracked base diff concerns
AGENTS.md; the plan and review documents are untracked work in progress.

UI scope: App navigation/sample entries, Explorer reading/recovery, ShareLesson,
contextual term help, a searchable Glossary section, and shared typography/focus
styles. `docs/DESIGN.md` exists and supplies the dark, spacious topographic system.
TODOS.md retains editorial review, fictional scenarios, and further frameworks;
none becomes new draft content or a blocked routine design choice here.

Step 0 impression: **7/10** on plan completeness. The settled identity/history
contracts are strong; precise hierarchy, reader-facing messages, copy focus and
viewport behavior need specification. A 10 would specify those details for every
state and make their acceptance observable without requiring new visual families.
All seven passes follow, with six numeric scores and one decision register.

Local learnings applied: `framework-edition-control-identity` (observed, 9/10),
`one-app-url-controller` (observed, 9/10), and `clipboard-context-generations`
(inferred, 8/10). Brain digests were unavailable; repository evidence supplies
context. No unavailable digest was treated as permission or a preference.

## Step 0.5: existing sketch evidence

The design binary is present, but paid generation and outside-provider reviews
are explicitly disabled. No generation, comparison server, account, cookies,
tunnel, or outside API was used. Both existing monochrome sketches were visually
inspected and reused for hierarchy, not treated as production screenshots or
newly approved mockups:

- [Desktop sketch](assets/field-guide-desktop.png): identity/draft/source context
  above reading, nearby copy action, separate discovery, and subordinate term help.
- [Mobile sketch](assets/field-guide-mobile.png): copy below identity and term help
  in document flow. The sketches' example prose remains a draft proposal.

The inherited wide-screen glossary aside is superseded by engineering Q3's inline
definition contract at all widths. This report follows that settled requirement.
No new mockups were generated or approved; regeneration is outside this invocation.

## Pass 1: Information architecture

**8/10 → 9/10 after recorded decisions.** The plan names the components but lacks
their exact visual order. Choices 1A and 2A keep one reading destination and one
small vocabulary section. The three primary reading elements are lesson identity
with draft context, perspective/explanation, and one everyday example. Term help,
sharing, and expanded references support those elements.

```text
Header: Brand / Explorer / Learning modes / Glossary / GitHub
Hero + existing topography → named draft entry or perspective → exact lesson
Explorer heading → search + catalog → results/filters | reading pane
  Reading: framework + project edition + draft
           title + official identifier + Copy lesson link
           concept → perspectives → explanation → everyday example
           Terms in this lesson → inline definition → source disclosure
Glossary: draft context → Search glossary → count → alphabetic disclosures
Mission + existing footer
```

Copy stays beside the title area on wide screens and below identity on phones;
it never competes with the main Explore action. Use visible text, not an icon-only
share button. The Glossary is an alphabetic reading list with restrained separators,
not a card grid. Its visible search label remains after text is entered. A Glossary
anchor belongs in desktop/mobile navigation; permit header wrapping on small widths
rather than hiding the new learning destination behind a new menu.

Preserve engineering E1: named homepage sample/perspective links have complete
lesson hrefs, open the known draft unfiltered in the requested mode, and support
native modified clicks. Ordinary Explorer anchors remain fragment navigation.
Recovery/browse actions enter discovery, never implicitly reopen the sample.
Copied URLs already require `#explorer`; this is carried, not a new decision.

## Pass 2: Interaction state coverage

**8/10 → 9/10 after recorded decisions.** Choice 3A supplies fixed utility copy and
named recovery in the reading pane; 4A supplies local clipboard feedback. Data is
local and synchronous, so no lesson/glossary loading spinner is introduced.

| Feature           | Loading                                | Empty                                                      | Error                                                                                                    | Success                                                       | Partial / normalized                                                                                   |
| ----------------- | -------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Lesson            | None                                   | “Choose a draft example.” Available results remain visible | “This lesson link is invalid.” or “This lesson isn't available here.” / Browse draft examples            | Exact lesson/mode; real lesson framework and project edition  | Mismatch keeps the lesson: “This lesson is outside the current results.” / Show this lesson in results |
| Discovery         | None                                   | “No matching examples.” / Clear filters                    | “This framework view isn't available.” / Browse available examples                                       | Accurate result count; deliberate result selection            | “Your filters changed; choose a matching example.” when an edit clears selection                       |
| Planned framework | None                                   | Factual named framework roadmap message                    | Never substitute a lesson                                                                                | Browse available examples enters unfiltered CMMC discovery    | No Level control for catalogs without levels                                                           |
| Address updates   | None                                   | No notice on unchanged intents                             | “Your changes are shown here, but the address couldn't update. Reloading may restore the previous view.” | Normal history behavior, without unnecessary success messages | “Perspective reset to Beginner.” / “Family filter reset.” / “Level filter reset.” as applicable        |
| Copy              | Copying…; repeated activation disabled | No copy control without a valid lesson                     | “Copy isn't available. Select the link below.” plus labeled selectable Lesson link                       | “Lesson link copied.” only after the captured write succeeds  | Obsolete generation/unmount produces no success, fallback, or focus change                             |
| Term help         | None                                   | “A definition isn't available for this term yet.”          | Fixed unavailable text retains context                                                                   | Text definition, draft status, source/context                 | One contextual definition open; identity navigation dismisses it                                       |
| Glossary search   | None                                   | “No matching terms.” / Clear glossary search               | Missing content remains factual                                                                          | Alphabetic matches with draft context                         | Search is independent of controls, lesson state and URL                                                |

Invalid/not-found/planned recovery calls engineering `recover-discovery`, focuses
control search, and retains no selection. Ordinary Clear filters retains catalog,
clears query/family/level, and preserves explicit no-selection. Mismatch recovery
calls `show-lesson-in-results`: catalog becomes the lesson framework, constraints
clear, identity/mode remain, and one push records the action. It must not be replaced
with ordinary Clear filters. Keep normalization/selection notices polite and avoid
duplicating the same message in several live regions. Never echo raw URL input.

## Pass 3: User journey and emotional arc

**7/10 → 9/10 after recorded decisions.** Choice 5A prevents asynchronous focus
theft; existing navigation/term contracts keep the reading context predictable.
Expected feelings below are design hypotheses, not learner research findings.

| Step | Reader does                                   | Intended feeling                          | Concrete support                                                     |
| ---- | --------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------- |
| 1    | Lands on the field guide or a shared lesson   | Oriented within five seconds              | Familiar heading, exact identity/mode, visible draft/edition context |
| 2    | Reads the concept and an everyday example     | Less intimidated                          | One reading column, plain language, comfortable measure              |
| 3    | Opens an unfamiliar term                      | Supported without losing place            | Inline definition, explicit trigger, nearby source/context           |
| 4    | Changes perspective                           | In control during the first five minutes  | Existing keyboard tabs; identity and discovery context remain        |
| 5    | Copies or manually selects a link             | Confident about what a colleague receives | Known identity/mode; truthful success or usable fallback             |
| 6    | Colleague opens the link or a damaged address | Oriented even when something fails        | Exact lesson, no substitution, named discovery recovery              |

Over a longer learning relationship, persistent source/draft/edition distinctions
should make understanding and limits memorable. No retention/adoption result is
claimed. Source references do not make a draft official or reviewed.

The inline read-only multiline fallback is labeled Lesson link, wraps safely,
and supports keyboard/touch selection. Successful copying never moves focus.
On a current failure, focus/select the fallback only if focus remains at the
initiating copy control; if the reader moved elsewhere, announce the fallback
politely and retain their focus. Context generations protect A→B→A and unmount,
not just equality with the current URL. The initiated browser write itself is
not cancellable. No clipboard reads occur.

## Pass 4: AI slop risk

**9/10 → 9/10; no new issue found.** Classifier: HYBRID, with the existing hero
PERSUADE, discovery controls OPERATE, and lesson/glossary READ. New UI follows the
reading use scene and inherited user-directed dark palette rather than a generic
security monitoring aesthetic. No unresolved hard rejection applies to the planned
slice: no first-impression card grid, weak brand, missing hero action, busy text
background, repeated mood sections, purposeless carousel, or stacked-card workspace.

| Litmus                               | Answer and evidence                                                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Brand/product clear in first screen? | YES: existing Brand, field-guide headline and Explore action                                    |
| One strong visual anchor?            | YES: existing static topography; no second decorative system                                    |
| Understandable by headlines?         | YES: Explorer, perspectives, lesson title, Glossary and sources name their jobs                 |
| One job per section?                 | YES: discovery, reading and vocabulary have distinct purposes                                   |
| Cards necessary?                     | NO decorative cards: interactive results/disclosures use layout and separators                  |
| Motion improves hierarchy?           | NO additional motion needed for reading; retain static illustration and reduced-motion behavior |
| Works without decorative shadows?    | YES: composition depends on spacing, type and restrained separators                             |

Preserve explicit term controls; do not generate tooltip links for every word.
Do not replicate the existing selected-result accent into decorative glossary cards.
No neon, glow, progress scores, compliance gauges or ornamental status numbers.

## Pass 5: Design system alignment

**8/10 → 9/10 after recorded decision 7A.** Use existing CSS tokens:
`--color-canvas` #0e1418, `--color-surface` #141d24, `--color-raised` #1c2730,
`--color-foreground` #e9edf0, `--color-muted` #a3adb7, `--color-accent` #bdd3da,
`--color-line` #2d3c46, and `--color-draft` #d6bc8f. Space Grotesk headings and
IBM Plex Sans reading/controls remain; monospace stays limited to control identifiers.
The project edition cue must say it is editorial, not an official CMMC release.

New definition, recovery and fallback explanatory text uses 16px/approximately
1.7 line height and at most 68ch measure. Align current takeaway and source reading
paragraphs with that 16px contract; compact labels can remain smaller. Native fields
reuse the 4px radius/field border; disclosures need no new visual container family.
Use the existing accent focus outline and selection treatment. Source/glossary
reference links retain underlines and use muted text when visited, distinguishing
them from accent unvisited references; verify contrast in the actual surface.
Draft status always includes words, never color alone.

## Pass 6: Responsive and accessibility

**7/10 → 9/10 after recorded decisions 6A/8A; existing Q3 focus behavior carried.**

| Width / condition     | Intentional behavior                                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Above 1100px          | Retain discovery sidebar and reading pane; title/share row can align horizontally; reading stays ≤68ch                            |
| 761–1100px            | Retain the existing narrower sidebar/padding; allow title/share row to wrap before compressing text                               |
| At/below 760px        | Existing Explorer stack; share below identity; term actions wrap; definitions/fallback stay inline; glossary search is full width |
| 320–380px             | Retain 16px reading and 44px controls; wrap header navigation and long metadata/URLs; never create horizontal page scrolling      |
| Landscape / 200% zoom | Content remains in normal flow; no fixed overlay, viewport-height reading trap or obscured focus                                  |

Semantic sections have labeled headings; Glossary gets `id=glossary` and its own
search label/status region. Preserve the skip link and current tab/tabpanel
associations, roving tabindex, arrows/Home/End. New interactive targets are at
least 44px with visible focus; do not depend on hover. Body/reference contrast must
meet 4.5:1, with visible non-color selection cues. Reduced motion remains supported.

Contextual Terms in this lesson buttons have `aria-expanded`/`aria-controls` and
open one inline definition immediately after the term controls. Opening leaves
trigger focus; content includes a heading, text, draft/source context and Close.
Close/Escape restores only a still-connected trigger. Identity navigation closes
the definition without restoring a removed trigger or stealing navigation focus.
Deliberate lesson-result navigation may focus its heading through the controller;
typing/filter controls retain focus. Dedicated Glossary entries use native disclosure
rows, with no modal trap or history changes. Clear glossary search focuses only its
own input. Term and glossary interactions never change lesson/mode/filter state.

## Pass 7: Decision register and approval reconciliation

Eight new routine design details are recorded individually. Existing engineering
inline/focus requirements are carried without counting them as new decisions.
Choice 6A adds the previously unspecified one-open definition cardinality.
None is a human answer.
Each choice is non-destructive and authorized by the owner's delegated routine
choices, recorded in C1 and AGENTS.md:54–60. Five recommendation groups are
preserved: hierarchy, visible states, copy/focus, contextual terms, and responsive
design-system details. No pending design choice or new deferred TODO remains.

| Issue / choice         | Selected A and reason                                                           | Alternative B / risk                                                           | Disposition                                 |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| 1A: share hierarchy    | Copy near title/identity; makes its lesson scope clear                          | Separate prominent sharing panel; competes with reading                        | New, agent-selected                         |
| 2A: glossary structure | Alphabetic disclosure list with labeled independent search after Explorer       | Glossary card grid; adds chrome to small vocabulary                            | New, agent-selected                         |
| 3A: state treatment    | Fixed distinct utility messages and named actions in the reading surface        | Generic empty/error message; hides recovery distinctions                       | New, agent-selected                         |
| 4A: clipboard rescue   | Inline labeled selectable multiline URL and local truthful feedback             | Modal/toast-only rescue; disrupts reading or loses manual copy                 | New, agent-selected                         |
| 5A: asynchronous focus | Select fallback only while the current reader remains at initiating control     | Always focus on rejection; steals focus after the reader moves                 | New, agent-selected                         |
| 6A: term cardinality   | One contextual definition open at a time; inline placement and focus carry Q3   | Several simultaneous contextual definitions; interrupt the reading column      | New cardinality, agent-selected; Q3 carried |
| 7A: reading alignment  | 16px reading paragraphs; existing tokens and distinguishable visited references | Leave new reading text at metadata sizes; violates reading/wayfinding contract | New, agent-selected                         |
| 8A: viewport behavior  | Existing stack/wrapping with 44px targets, inline help and normal flow          | Fixed overlays or compressed controls; loses phone/zoom usability              | New, agent-selected                         |

Decision specification effort is small (roughly 10–20 human minutes or 2–5 agent
minutes each); implementation/proof effort is estimated in the tasks below. These
are estimates, not measurements. Existing exact history/mismatch/homepage/identity
decisions are carried and do not inflate the new-decision count. No other approvals,
merge authority, roadmap expansion or qualified content review are inferred.

## NOT in scope

- New brand, decorative families or redesigned hero: the existing design is the constraint.
- Paid mockups/outside reviews, accounts, cookies, tunnels and external APIs: disabled/excluded.
- Reviewed catalog expansion, scenarios and further frameworks: existing D1–D3 sequencing remains.
- Official definitions, requirement rewrites or assessment-sufficiency claims: drafts retain factual boundaries.
- New router, search/test package, CMS, analytics or storage: the static architecture suffices.
- Production deployment or merge: owner approval remains required.

## What already exists

Reuse docs/DESIGN.md tokens, local fonts, Topography, section-shell, Explorer
toolbar/sidebar/detail hierarchy, native selects/source disclosures, LearningModes
keyboard contract, safe source links and draft/applicability prose. Reuse current
control search exactly, the sole App controller planned by engineering, known URL
identity/serialization, existing tests and the two inspected field-guide sketches.
No existing protected behavior is silently retired; engineering E3 names the
intentional discovery-recovery assertion change.

## Implementation Tasks

These tasks implement the accepted design details within the existing engineering
slices; they are not a second workstream editing shared files concurrently. Effort
assumes the installed React stack and small catalog; browser repairs can change it.

- [ ] **DT1 (P2, human: ~1 h / agent: ~15 min)** — reading hierarchy and glossary list.
  - Surfaced by Pass 1 choices 1A/2A: place identity/share and the independent vocabulary section.
  - Files: src/App.tsx, src/components/ControlExplorer.tsx, src/components/Glossary.tsx, src/styles.css.
  - Verify: named sample links/modes, separate glossary query and keyboard disclosures; desktop/phone hierarchy.
- [ ] **DT2 (P1, human: ~2 h / agent: ~20 min)** — recovery messages, copy fallback and focus.
  - Surfaced by Passes 2/3 choices 3A/4A/5A: visible recovery and truthful asynchronous feedback.
  - Files: src/components/ControlExplorer.tsx, src/components/ShareLesson.tsx, src/App.test.tsx.
  - Verify: invalid/not-found/catalog/planned/discovery/mismatch/normalization/history-denial flows; copy absence/rejection/success/double activation/A→B→A/unmount and moved-focus fallback.
- [ ] **DT3 (P1, human: ~2 h / agent: ~25 min)** — inline terms, reading typography and viewport proof.
  - Surfaced by Passes 5/6 choices 6A/7A/8A: one contextual definition, context-safe focus and readable mobile/zoom layout.
  - Files: src/components/Glossary.tsx, src/components/ControlExplorer.tsx, src/styles.css, src/App.test.tsx.
  - Verify: term open/Close/Escape/navigation/missing-reference, unchanged URL/lesson/mode/filters, 44px targets, contrast, visited links and reduced motion.

No new tasks from Pass 4. TODOS.md updates: **0**; in-scope verification is mandatory
here, and existing D1–D3 stay in their current file without edits. A matching ignored
task JSONL is saved through gstack's project state path for this review.

Acceptance: copy/paste/reload restores the exact lesson and perspective at Explorer
without discovery text; invalid links never substitute the sample; mismatch rescue
preserves identity; browser Back/Forward restores complete discovery/lesson state.
Check meaningful keyboard/touch interactions at 1440, 1024, 768, 390 and 320px,
landscape, 200% zoom and reduced motion. Preserve draft/source/version limitations.
Run lint, format:check, npm test and build before push, then actual rendered QA and
code/security review plus exact-commit CI/preview inspection through the root workflow.
No check of the unbuilt features is reported as passed in this design review.

## Completion summary and next handoff

| Item                             | Result                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------- |
| System audit                     | UI scope confirmed; existing design system and sketches read                    |
| Step 0 impression                | 7/10 plan completeness                                                          |
| Pass 1: information architecture | 8/10 → 9/10                                                                     |
| Pass 2: interaction states       | 8/10 → 9/10                                                                     |
| Pass 3: journey                  | 7/10 → 9/10                                                                     |
| Pass 4: AI slop risk             | 9/10 → 9/10; no new issue                                                       |
| Pass 5: design system            | 8/10 → 9/10                                                                     |
| Pass 6: responsive/accessibility | 7/10 → 9/10                                                                     |
| Pass 7: decision register        | 8 new outcomes resolved; existing exact contracts carried; 0 deferred           |
| Overall, lowest of six scores    | **7/10 → 9/10**; plan assessment only                                           |
| Required outputs                 | Scope/reuse/tasks/state table/storyboard/decision register written; 0 new TODOs |
| Mockups                          | 0 generated, 0 newly approved; 2 existing sketches inspected                    |
| Unresolved decisions             | 0                                                                               |

Design specifications are complete at this planning gate. The coordinated next
step is incorporation and authorized implementation, followed by rendered
design-review/QA and code review. The engineering log still says ISSUES OPEN for
11 mapped implementation/proof findings; this design plan score does not clear that
shipping gate or establish functioning UI. A bounded independent in-host contract
check informed notice/focus/race coverage; it was not an outside-provider review.

Historical dashboard: Eng Review 1 / 2026-10-13T17:25:02Z / ISSUES OPEN (PLAN),
required; CEO Review 1 / timestamp absent / previously reported clean, freshness
UNVERIFIED; Design Review 1 / this dated review / CLEAR (PLAN); Adversarial 0 /
not run; Outside Voice 2 recorded opt-outs / DISABLED, 0 completed. No external
model identity or cross-model agreement is claimed. Dashboard verdict:
**NOT CLEARED — clean engineering/code review is still required.**

## GSTACK REVIEW REPORT

| Review         | Trigger                                  | Why                              | Runs        | Status                               | Findings                                                                                                           |
| -------------- | ---------------------------------------- | -------------------------------- | ----------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| CEO Review     | plan-ceo-review                          | Scope and strategy               | 1           | REPORTED CLEAR; FRESHNESS UNVERIFIED | Prior accepted scope; stored row has no timestamp                                                                  |
| Outside Review | Claude Code configured plan/design voice | Independent provider             | 0 completed | DISABLED                             | Existing plan opt-outs retained; design provider disabled; no fallback or provider ran                             |
| Eng Review     | plan-eng-review                          | Architecture and tests, required | 1           | ISSUES OPEN                          | 11 mapped implementation/proof findings; 0 critical gaps and 0 unresolved decisions                                |
| Design Review  | plan-design-review                       | UI/UX specifications             | 1           | CLEAR, PLAN                          | 7/10 → 9/10; all seven passes; 8 new delegated decisions; existing exact contracts carried; no rendered validation |
| DX Review      | plan-devex-review                        | Developer-facing product         | 0           | NOT APPLICABLE                       | No new developer platform/API                                                                                      |

OUTSIDE COVERAGE: Claude Code provider, plan-review and design phases, disabled
by configuration and explicit scope. No external findings, provider fallback,
unknown model attribution or cross-model completion is inferred.

VERDICT: Design PLAN CLEAR with specifications saved; engineering remains ISSUES
OPEN for implementation/proof work, so eng review required before shipping
clearance. Authorized implementation continues under the owner's delegation;
browser behavior, content review, CI and previews remain unverified by this report.

NO UNRESOLVED DECISIONS
