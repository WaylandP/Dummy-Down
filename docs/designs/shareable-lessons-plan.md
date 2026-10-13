# Dummy-Down: shareable lessons and a contextual glossary

Status: implementation authorized by the owner's continuous-work instruction;
product assumptions remain editable. Base: `ac60936a794554f2a27deff68b3a219863b33450`.
Branch: `feat/shareable-control-lessons`. Review mode: SELECTIVE EXPANSION.

This continues the [office-hours field-guide plan](field-guide.md). The owner's
instruction to make the planning decisions, continue through applicable skills,
and add security/feature/UI/UX recommendations replaces intermediate interview
pauses. It does not authorize a merge, a paid provider, or fabricated reviewed
content. README and LICENSE remain unchanged.

## Problem, ambition and evidence

The useful outcome is understanding a concept well enough to explain it to another
person. A larger catalog or more dashboard decoration is a proxy for that outcome.
The immediate reader is a beginner or IT colleague encountering an unfamiliar
control; prioritizing this audience is an assumption from the README, not an
interview finding.

The ambitious experience: understand an everyday access example, open a term in
place, change perspective, and send the exact lesson to a colleague who can inspect
the source context. The later ideal adds reviewed scenarios and diagrams, then
framework relationships that preserve differences rather than imply equivalence.

```text
CURRENT                    THIS RELEASE                  FUTURE IDEAL
one draft, local state --> addressable draft + terms --> reviewed learning trails
three working modes       clear provenance/history      educator + learner use
```

| Premise                                               | Repository receipt                                                 | Verdict                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| One draft, three perspectives                         | `src/data/controls.ts:3`, `src/data/controls.ts:35`                | verified by static read; content accuracy is separate      |
| Identifiers and versions need separate identity       | `src/types/content.ts:43`, `src/components/ControlExplorer.tsx:26` | verified architecture gap for future editions              |
| The current UI can silently pick the first result     | `src/components/ControlExplorer.tsx:38`                            | verified; unsafe for invalid incoming lesson links         |
| The source index is classified as a publication       | `src/data/controls.ts:95`                                          | verified; clarify source kind before expansion             |
| Readers will value sharing and contextual definitions | README Features & Learning Experience                              | unverified product hypothesis; user authorizes building it |

Premise evidence tally: `unverified=1` (reader-value hypothesis). Existing sources,
draft prose and modes will be reused. Search semantics remain all-word substring
matching over current control fields; glossary search is separate. No fresh
competitor search is claimed: this host has no WebSearch or running Aside.

## Binding decisions and delegated scope ledger

Owner of implementation choices: agent, under the latest user instruction:
"when you are done with a skill, go to the next one" and the earlier delegation
to answer planning questions. Each row is independently editable during end review.

| ID / owner | Contract and evidence                    | Current                              | Proposed                                                                             | Status / tier        | Exact authority and scope                                         |
| ---------- | ---------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ | -------------------- | ----------------------------------------------------------------- |
| C1 / owner | Continuous work, README mission          | Planning artifacts alone             | Continue CEO → engineering → design → implementation → QA/review                     | accepted / must-ship | Latest user instruction; no merge authority                       |
| C2 / agent | Field-guide identity/navigation contract | Local selection/mode                 | Structured editorial identity, URL parsing/history, explicit discovery state         | accepted / must-ship | Delegated decisions; field-guide.md architecture and URL contract |
| C3 / agent | Sharing the same perspective             | No sharing action                    | Copy known lesson identity/mode; omit filters/search; selectable fallback            | accepted / must-ship | Delegated feature/UI recommendations; no clipboard reads          |
| C4 / agent | README glossary feature                  | Planned only                         | Small draft glossary, separate search and contextual definitions                     | accepted / must-ship | README Phase 1 and delegated implementation                       |
| C5 / agent | Honest provenance/framework neutrality   | Hardcoded README label; always Level | Source-kind labels, editorial edition cue, applicable filters                        | accepted / must-ship | README accuracy direction and delegated correctness fixes         |
| C6 / agent | Secure static boundaries                 | Public JSX/text, safe source links   | Validate URL inputs; preserve text rendering/HTTPS references; no secrets or uploads | accepted / must-ship | Delegated security recommendations, existing static architecture  |
| C7 / agent | Quiet, accessible reading                | Dark spacious topographic system     | Small sharing/definition affordances, focus restoration, mobile layout               | accepted / must-ship | Stated visual preferences; no new visual system                   |
| C8 / agent | Verified reviewable progress             | Branch/CI/Vercel workflow            | Separate validated commits on one open PR; keep going without requiring a merge      | accepted / must-ship | User's future-development and latest continuous-work instructions |
| D1 / agent | Reviewed control expansion               | One unreviewed example               | Real content review/contribution workflow before publication                         | deferred / future    | README Phase 2; unavailable qualified review is not fabricated    |
| D2 / agent | Scenarios and knowledge checks           | Planned                              | Later fictional lesson activity after foundational navigation/glossary               | deferred / future    | README Phase 3; coherent Phase 1 slice first                      |
| D3 / agent | Other frameworks and mappings            | Planned metadata only                | Source/licensing/review readiness before content and mappings                        | deferred / future    | README Phase 4; similarities are not compliance equivalence       |

Rejected for this release: accounts, evidence uploads, certification/progress scores,
bulk AI-generated controls, a CMS and a new routing/search dependency. These do not
solve the current learning task. They are not silently scheduled as follow-up work.

## Alternatives and scope challenge

- Minimal polish: smallest diff, but still no shareable lesson or glossary. Reuses
  all UI. Low risk; leaves the named learning features unfinished.
- **Selected: a static field guide in small validated slices.** Reuses React, native
  browser history, local data/search and the current reading layout. Moderate state
  integration risk; gives the foundation a useful reader-to-reader workflow.
- Scenario-first lab: potentially memorable, but requires new teaching/feedback
  content before the navigation and glossary foundation is complete. Deferred.

The planned file count is an estimate, not a user limit. Small pure-state, data and
UI modules plus their behavioral tests are justified; no classes, services or new
package are needed. Keep one PR for this wave and push independently reviewable
parts. A larger diff is not a reason to omit invalid-state or keyboard coverage.

Adjacent improvements selected under delegated authority: perspective-specific
sharing; clipboard failure recovery; term definitions without losing place; source
kinds/applicability at the point of reading; no inapplicable Level filter. Each is
part of C3–C7. Scenario generation and decorative achievement widgets are not added.

## Implementation contracts

Use the full [URL state contract](field-guide.md#url-state-contract), including
explicit `view=lesson`/`view=discover`, complete lesson identity, separate catalog
filters, invalid/incomplete/duplicate rejection, missing-mode normalization, and
restoration of intentional no-selection states. Native `URLSearchParams` is
forgiving of malformed escapes, so validate raw recognized encoding before use.
Unknown URL input never becomes HTML, a fetch destination or a redirect target.

Proposed modules:

- `src/state/explorer-state.ts`: pure parse, serialize, resolve and transition
  functions. Identity is framework + editorial edition + internal control key;
  official identifiers remain display/search data. Invalid addresses produce an
  error state, not first-result substitution.
- `src/state/useExplorerState.ts`: initialize from the URL; transact URL and React
  state; subscribe/clean up `popstate`. Deliberate selections push history; typing
  replaces history. Local draft search is small, so immediate replace is adequate
  and avoids delayed writes replaying stale state after navigation.
- `src/types/content.ts` and `src/data/`: extend the current model with editorial
  editions, provenance kinds and explicit glossary references. Keep `reviewStatus:
'draft'`; publish no new official control requirements.
- `ControlExplorer`, `ShareLesson` and glossary components: semantic reading,
  truthful empty/error states, identity-aware results and explicit term controls.
  Contextual definition opening/dismissal changes no lesson/history/filter state.

The prior plan proposed debounced search history writes. This review selects
immediate `replaceState` for the small local catalog, preserving the same history
semantics while eliminating a timer/navigation race. This is an agent-selected
mechanic under delegated authority, not a change to matching behavior.

Copy only after explicit activation. Await clipboard success before announcing it;
otherwise show a selectable URL. Invalidate pending completion feedback when the
lesson/mode changes or component unmounts. Double clicks cannot create competing
copy feedback. Never read clipboard contents.

Glossary terms are a small draft educational vocabulary tied to the existing
example, not an official glossary or complete control library. Render definitions
as text, include their source/context, and keep control search and glossary search
independent. Missing term references show a readable unavailable message.

Clear filters restores discovery results and preserves explicit no-selection;
the reader deliberately selects a visible example. Error recovery and planned
framework recovery have clearly named actions. A restored valid lesson excluded by
filters remains visible with a mismatch cue, rather than being silently replaced.

## Temporal implementation sequence

Human-team and agent-assisted effort are estimates; editorial review timing is
unknown. Foundation: roughly one focused human day / one agent work session;
UI/glossary integration: roughly two human days / one to two agent sessions;
validation/fixes: roughly one human day / one agent session. These are not delivery
promises or claims that domain review is automated.

1. Agree concrete TypeScript interfaces and pure transitions; write meaningful
   parser/identity tests. Keep the current UI buildable. Validate, commit and push.
2. Connect history and lesson identity; add sharing and contextual/searchable
   glossary; preserve the dark reading hierarchy. Validate, commit and push.
3. Run browser QA, visual review, security review and independent code review;
   fix material findings, verify exact-commit CI and Vercel, and hand over links.

The CEO spec review precedes deep section completion. Engineering and design plan
reviews follow the CEO gate; implementation follows those reviews. Review results,
failure registries, tasks and terminal report are appended before handoff.

## CEO deep review: sections and decisions

Current scope: C2–C7 accepted under delegated authority; D1–D3 deferred; accounts,
uploads, generated control catalogs, CMS and certification scoring excluded. This
is an implementation-ready review. Findings below are planned remedies, not claims
that new code already passes its checks.

1. **Architecture.** Reuse local data/search/modes. Separate editorial identity,
   URL/discovery state and ephemeral reading UI. The bare-ID/first-result fallback
   is a concrete gap; C2 replaces it. No router, backend or state service is needed.
2. **Errors.** Map malformed links, absent content, history denial, clipboard
   failures and missing terms below. Every path has visible recovery; no unrescued
   silent path is accepted in the plan.
3. **Security.** Public content only; no authorization boundary is introduced.
   Validate known URL fields, render text, resolve only local IDs, preserve safe
   HTTPS external references and omit discovery text from copied links. No present
   exploitable vulnerability is claimed from the static review.
4. **Interaction.** Distinguish a missing initial state from deliberate discovery.
   History replay restores both filters and selection. Copy completion after a
   mode change must not announce stale success. Term dismissal restores focus.
5. **Quality.** Keep pure state decisions out of the JSX. Extract sharing and
   glossary behavior where it isolates async/focus logic; avoid a general content
   engine, new classes or abstractions without a caller.
6. **Tests.** Unit tests protect complete/invalid identity, duplicates/encoding,
   equivalent identifiers across editions and serialization. Integration tests
   protect the actual hook/UI history, sharing rejection/stale completion and
   glossary keyboard state. Browser checks cover real history and mobile layout;
   mocked clipboard tests do not prove browser permission acceptance.
7. **Performance.** Reuse linear local search for the tiny catalog. No database,
   network queue or connection pool exists. Do not claim latency targets without
   measurement; remeasure bundle output during build. Avoid search timers that
   can write stale history state.
8. **Observability.** Invalid-link and sharing states are visible to the reader.
   GitHub Actions/Vercel provide build/deployment status. Keep a short developer
   troubleshooting path; no analytics or collection of query/evidence text is
   justified by this static release.
9. **Deployment.** Validate each slice before push to the same feature PR. Static
   query links need no server route rewrite or database migration. Verify the
   exact SHA's preview; owner sign-in is deployment protection, not app failure.
10. **Future trajectory.** Composite identity and separate glossary records make
    versioned lessons possible without assuming CMMC taxonomy. Source review and
    licensing precede expansion. Reversibility is high: local data/code can be
    reverted; later incompatible share-link changes need an explicit migration.
11. **Design.** Preserve the dark spacious topographic system. Reading, perspective
    selection and a short example stay primary; provenance and term help support
    them. Mobile gets inline definitions, not a crowded floating panel. Keep the
    focus, empty/error, zoom and touch states part of acceptance.

## Error & rescue and failure registries

| Codepath / trigger   | Class or state                                            | Rescue / user result                                                                                | Required proof                                                     |
| -------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| URL decoding/parsing | URIError, duplicate/incomplete/conflicting input          | Explicit invalid-link state; reset to discovery; never substitute a lesson                          | Invalid UTF-8/escapes, duplicate, empty and partial identity tests |
| Content resolution   | Unknown framework/edition/control                         | Not found or truthful planned-framework state with recovery                                         | Synthetic colliding IDs/editions and absent lesson cases           |
| History write        | Browser DOMException (SecurityError or write restriction) | Visible link-update failure; preserve usable in-session navigation without claiming URL persistence | Denied history write through the actual hook/UI                    |
| Clipboard write      | Missing API or rejected permission/DOMException           | Selectable known lesson URL; no false copied message                                                | API absence/rejection, successful write and mode-change race       |
| Glossary resolution  | Missing referenced term                                   | Readable unavailable definition; retain reading context                                             | Missing-term state and keyboard dismissal/focus                    |
| Empty discovery      | Zero matching results or planned framework                | Result count, clear filters, choose example or return to available framework                        | Search, no-level/empty framework, clear/reselect flow              |

All registry rows have planned rescue, tests and reader-visible output. Nothing is
marked implemented until its corresponding test/browser evidence exists. Error
states use fixed messages/codes, not echoed HTML or logs containing search text.

```text
SYSTEM / DATA FLOW
local frameworks + editions + controls + terms
                 |                 |
URL -> validate -> identity/state -> Explorer -> explanation + sources
 | nil: default   |                 |          -> explicit term -> definition
 | bad: error     |                 +-> share known identity -> clipboard
 | empty: discover+-> filters -> zero/results                  | denial: URL fallback

STATE MACHINE
default -> lesson <---- explicit selection / valid history ----> discovery
            | mode change stays lesson      filter excludes -> discovery
invalid -> named reset -> discovery         invalid never -> first result
term open/closed and copy feedback are local; neither chooses another lesson.

ASYNC COPY SCHEDULE
write A starts | mode changes/invalidate A | A resolves -> no stale notice
write A resolves before mode change       | new mode clears previous feedback
double activation while pending -> ignored/disabled; unmount invalidates completion

TEST FLOW
parse/serialize/resolve [unit] -> history/selection/filters [integration + browser]
 -> share [mocked API success/denial + browser fallback]
 -> terms [integration focus/context + browser keyboard/phone]
Malformed input, unknown content, browser API denial and zero results are failures
to exercise, not automatic successful tests.

DEPLOYMENT / ROLLBACK
source -> lint/format/tests/build -> commit -> feature push -> CI + Vercel preview
                                                   | failure -> fix, no merge
broken preview -> revert offending feature commit -> validate -> push -> fresh preview
main/production promotion remains an owner decision; no automatic merge.
```

## UI state coverage

| Feature        | Loading                                     | Empty / partial                                                    | Error                                        | Success                                              |
| -------------- | ------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------- | ---------------------------------------------------- |
| Lesson/history | Local synchronous data; no fake spinner     | Explicit discovery, unavailable planned framework, filter mismatch | Invalid address with clear recovery          | Exact identified lesson and mode                     |
| Sharing        | Pending write disables duplicate activation | Selectable-link fallback                                           | Fixed failure text; stale completion ignored | Confirmation only after the captured link is written |
| Glossary       | Local synchronous data                      | Zero term matches or absent term                                   | Context retained with unavailable message    | Definition and sources; close/Escape restores focus  |

## Tasks and handoff

- [ ] T1 — Data/state foundation: composite identity, source kinds, pure URL
      transitions and regressions. Verify unit tests plus the current full app build.
- [ ] T2 — Reading integration: history/invalid states, sharing and context-preserving
      searchable draft glossary. Verify meaningful UI tests and keyboard/mobile flows.
- [ ] T3 — Reviews/fixes: engineering and design plan reviews, then rendered QA,
      visual/code/security checks. Verify required local checks, exact-commit CI and
      Vercel before final links. Update developer docs as behavior ships.

Effort is estimated in the temporal sequence above. These tasks are kept within
the same feature PR; no merge is required to move from one validated slice to the
next. The task JSONL and CEO archive are local gstack artifacts, while this document
is the reviewer-facing plan. Preserve the old field-guide document as design history.

## Reality check and completion facts

REALITY: premise-table pass Static receipts distinguish the learner-value hypothesis; unverified=1 src/types/content.ts:43
REALITY: already-done pass Existing modes/search/provenance are reused, not rebuilt; latest main contains prior foundation ac60936a794554f2a27deff68b3a219863b33450
REALITY: surface-check pass Native query state uses existing browser APIs and npm scripts; no new HTTP endpoint package.json:9
REALITY: binding-decisions pass "Never merge into main" and delegated continuous decisions are retained AGENTS.md:25
REALITY: numbers pass Code counts and build/test results must be remeasured at the push gate; effort is estimated package.json:9
REALITY: deferred-asks pass Reviewed catalog/scenarios/framework expansion remain sequenced with explicit review prerequisites docs/designs/field-guide.md:274
REALITY: pr-count pass One PR for this wave by default; reuse it for successive validated pushes AGENTS.md:9

PLAN_REALITY: phase=ceo rows=7/7 missing=none unverified=1 verdict=complete

Completion summary: SELECTIVE EXPANSION; all applicable CEO sections evaluated.
Architecture/provenance fixes C2/C5 retained; six planned error/failure paths mapped
with rescue and tests; interaction/test diagrams written; no silent unhandled path
accepted. Nine scope proposals: six accepted, three deferred in TODOS.md. One
in-host scope spec review passed; no external provider ran. One product hypothesis
is unverified. Lake score is not applicable: no coverage-scored choices were asked.
Engineering/design plan and implementation verification are next, not already done.

Approval readiness: PASS for C1–C8 under the actual continuous-work/delegated-choice
instructions. D1–D3 are delivery deferrals; content review is not waived. No pending
routine decisions remain. CEO spec review: one actual in-host launch, PASS on all
five dimensions, score 9/10, zero findings. No outside provider ran: configuration
is disabled. Engineering and design reviews are the immediate next steps.

## Engineering review: scope and authority

Fixed target and report destination: `docs/designs/shareable-lessons-plan.md`.
Review date: 2026-10-13; source revision: `ac60936`. This is a plan review,
not implementation acceptance. Read current source/tests, the complete field-guide
URL contract, CEO archive, AGENTS.md, developer/design guidance, and prior learning
`framework-edition-control-identity` (observed, confidence 9/10). Brain digests are
unavailable; the repository and actual session delegation supply the context.
Aside readiness returned `NEEDS_ASIDE: Linux`; this host exposes no WebSearch.
Search unavailable; proceeding with in-distribution knowledge only. No outside
research, paid provider, review fallback, worktree or product-code edit ran.

### Scope Challenge result and structure record

Scope Challenge: **scope accepted as-is**. No feature cut is required. Reuse the
current search, modes, static data, React/native history and Vite/Vercel delivery.
The review proposes at most 15 authored paths, including tests/developer docs,
and zero classes/services [estimated: path inventory below]. Evidence files and
gstack artifacts are not counted as implementation paths. The file-count gate
therefore applies even though no new service is introduced.

Structure D1: **Original arrangement**, agent-selected under C1 and the actual
latest owner instruction to keep going through skills, with prior delegation of
planning answers. This is not a human A/B response. Features C2–C7 stay fixed;
pending remedies at this point: E1 sample entry, E2 malformed keys, E3 regression
contract. Original arrangement already keeps one pure state module, one hook
mounted in App, one share component and one combined glossary component, roughly
15 paths [estimated]. A smaller arrangement could inline share/glossary into
Explorer and touch roughly 13 paths [estimated]; both retain the same features,
invalid-link handling, history, clipboard recovery, focus and tests. The existing
arrangement is recommended because it isolates async copy/focus lifetimes without
adding a service or state framework. No feature is cut. The original provisional
19-path comparison was not an actual baseline and is corrected here before the
saved report; the selected two-state-module contract itself is unchanged.

Selected inventory: `src/state/explorer-state.ts`,
`src/state/explorer-state.test.ts`, `src/state/useExplorerState.ts`, `src/App.tsx`,
`src/App.test.tsx`, `src/types/content.ts`, `src/data/controls.ts`,
`src/data/content.ts`, `src/data/glossary.ts`,
`src/data/control-search.test.ts`, `src/components/ControlExplorer.tsx`,
`src/components/ShareLesson.tsx`, `src/components/Glossary.tsx`, `src/styles.css`,
`docs/DEVELOPMENT.md`. Future state/share/glossary paths have no history yet;
`not available` is not evidence about their behavior. Existing selected-path
history contains frontend foundation `66a0a50` and setup/plan `ac60936`, with no
revert matches. The locally retained origin/main log shows no already-shipped
lesson/glossary/history implementation. Remote freshness was not rechecked in
this review, which is constrained to local evidence and no external services.

Dispositions: D1 arrangement accepted by agent under delegation; no scope cuts;
no issues found in Scope Challenge requiring a separate remedy. Search/dependency
choices use proven local helpers [Layer 1] and native browser APIs [Layer 1].
No shared-code extraction is justified merely by similar text: sharing and
glossary have different side effects and retain separate ownership.

## Engineering decision ledger

Authority for each selection below is the owner's continuous-work/delegated-choice
instruction recorded in C1, not a fabricated human option answer. State `approved`
means authorized agent-selected implementation scope. Prior C2/C3/C5/C7 contracts
carry their necessary code/tests/docs without reopening them.

### E1: explicit sample entries from discovery and error

Finding: A3, P2, confidence 9/10, `src/App.tsx:120`, reviewer: primary engineering
review with bounded static source audit. Plan baseline: homepage perspective
links change mode only; the named sample link only changes the fragment. Runtime
evidence: `onClick={() => setMode(item.mode)}` at App.tsx:120, and sample entry
`href="#explorer"` at App.tsx:90. A new intentional no-selection state makes these
entries unable to open the promised explanation without an explicit selection.

| Choice / bound                    | Current                    | A                                                            | B                                                     | Fixed authority     |
| --------------------------------- | -------------------------- | ------------------------------------------------------------ | ----------------------------------------------------- | ------------------- |
| Homepage perspective/sample entry | Mode or fragment only      | Explicitly open known sample unfiltered in CMMC, chosen mode | Keep fragment/mode only; discovery may show no lesson | E1, pending         |
| Discovery clearing                | Planned no selection       | Preserve                                                     | Preserve                                              | C2; plan:130–133    |
| Existing lesson tabs              | Change current perspective | Preserve identity/filters                                    | Preserve identity/filters                             | C2/C7               |
| Link security/history             | Native, same-origin        | Push complete known state once; allow native modified clicks | Current fragment action; same-origin                  | C2/C6               |
| Malformed keys/regression         | Unsettled detail           | Pending E2/E3                                                | Pending E2/E3                                         | Independent choices |

Question D2:
D2 — Make homepage sample entries explicit
Project/branch/task: Dummy-Down, feat/shareable-control-lessons, shareable lesson plan.
ELI10: Clearing discovery will now leave no lesson open. A homepage link that only
changes the perspective would take the reader to an empty reading pane. Decide
whether these named learning entries explicitly open the known draft example.
Stakes if we pick wrong: homepage perspective links can promise an explanation
while leaving the reader without one.
Recommendation: A because the entry names a teaching experience and the sample
already exists; the action should actually open that example.
Completeness: A=10/10, B=7/10.
Net: explicit sample navigation adds a small action while preserving deliberate
discovery and existing lesson-tab behavior.
Header: Sample entry
Options:
A) Explicit sample (recommended)
✅ The homepage entry opens the promised perspective from every state.
✅ A known identity avoids selecting whichever filtered result happens first.
❌ Entering the sample explicitly resets its discovery context to unfiltered CMMC.
Human: ~30 min / CC: ~5 min; low risk, one named transition plus UI regressions.
B) Keep mode only
✅ The existing homepage callback stays small and easy to understand.
✅ The current discovery filters remain intact after following the link.
❌ Readers in discovery or error states can reach the Explorer without a lesson.
Human: ~10 min / CC: ~2 min; reduced integration work, recurring interaction debt.

State: approved
Actual answer: A, agent-selected at D2 under C1/latest owner delegation; no human
A/B response. Coordinating agent independently confirmed this selection.
Accepted scope: homepage sample/perspective entries push the known draft sample
with unfiltered CMMC discovery and the chosen mode; lesson tabs still change only
the current lesson's mode. Ordinary navigation anchors retain fragment behavior.
History: none.

### E2: malformed raw query-key policy

Finding: Q1, P2, confidence 8/10, `docs/designs/shareable-lessons-plan.md:95`,
reviewer: primary engineering review. Plan baseline: reject malformed recognized
encoding while ignoring unknown parameters. Runtime evidence: no current parser;
`"Native URLSearchParams is forgiving of malformed escapes"` motivates a strict
decoder, but a key that fails decoding cannot be reliably classified as recognized.
This is a proposed ambiguity fix, not an observed runtime parser failure.

| Choice / bound                     | Current                    | A                                 | B                                 | Fixed authority    |
| ---------------------------------- | -------------------------- | --------------------------------- | --------------------------------- | ------------------ |
| Undecodable raw key name           | Unspecified classification | Invalid-link state, no resolution | Ignore undecodable key as unknown | E2                 |
| Recognized values                  | Strict validation proposed | Strictly decode once              | Strictly decode once              | C2/C6              |
| Well-formed unknown keys/values    | Ignore and omit on write   | Preserve                          | Preserve                          | Field-guide:213    |
| Encoded duplicate recognized names | Reject duplicates          | Preserve                          | Preserve                          | C2                 |
| Sample entry                       | E1 A                       | Keep explicit known sample entry  | Keep explicit known sample entry  | E1 D2              |
| Regression assertions              | Pending E3                 | Pending E3                        | Pending E3                        | Independent choice |

Question D3:
D3 — Classify malformed query names safely
Project/branch/task: Dummy-Down, feat/shareable-control-lessons, URL parser contract.
ELI10: A broken encoded query name cannot be decoded, so we cannot know whether it
was meant to choose a lesson. Silently ignoring it could treat a damaged state
address as an ordinary default address. Choose a deterministic rule before coding.
Stakes if we pick wrong: malformed state can open the default sample unexpectedly.
Recommendation: A because refusing undecodable names makes invalid-state handling
explicit and preserves the safe no-substitution rule.
Note: options differ in kind, not coverage — no completeness score.
Net: a narrowly stricter input boundary avoids guessing the meaning of broken keys.
Header: Query key rule
Options:
A) Reject broken keys (recommended)
✅ Undecodable names always produce a visible invalid-link recovery state.
✅ Duplicate detection uses decoded known names rather than forgiving parsing.
❌ A malformed unrelated tracking key will also make the address invalid.
Human: ~20 min / CC: ~5 min; low implementation risk, explicit input-policy maintenance.
B) Ignore broken keys
✅ Unrelated damaged query names do not prevent ordinary lesson navigation.
✅ The unknown-parameter ignore rule applies to more malformed incoming addresses.
❌ A damaged state key can disappear and incorrectly enable default selection.
Human: ~20 min / CC: ~5 min; similar effort, less strict damage detection.

State: approved
Actual answer: A, agent-selected at D3 under C1/latest owner delegation, confirmed
by the coordinating agent; no human A/B response.
Accepted scope: reject every undecodable raw key name; decode recognized values
once strictly; ignore well-formed unknown keys and their values, then omit them
when writing. Compare decoded recognized names for duplicates. This deliberately
tightens the inherited ignore rule only for undecodable names.
History: coordinating agent adopted recommendation A under the owner delegation;
this checkpoint preserves the complete independently selectable policy.

### E3: mandatory existing-experience regression contract

Finding: G5, P1, confidence 9/10, `src/App.test.tsx:152–158`, reviewer: primary
engineering review. Plan baseline: preserve search/tabs/draft/source behavior;
intentionally replace implicit result selection with explicit discovery.
Runtime evidence: Clear filters currently expects the Authorized access heading
to be visible again at App.test.tsx:156–158. Existing tests pass for that old
behavior. The rewrite must update this assertion deliberately, not retain a
first-result fallback or drop the recovery test.

| Choice / bound                          | Current                       | A                                                                                | B                                                                        | Fixed authority                          |
| --------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------- |
| Search/tab/draft/source public behavior | Covered for current app       | Preserve via existing suites extended                                            | Preserve via existing suites plus new browser runner                     | C2/C5/C7                                 |
| Clear/recovery selection                | Automatic first result        | Deliberate discovery, then explicit result selection                             | Same                                                                     | C2; plan:130–133                         |
| Planned-framework/invalid recovery      | Current recovery opens sample | Named recovery opens discovery, focuses search, requires selection               | Same                                                                     | C2/C7, coordinated design recommendation |
| Homepage sample entry                   | Explicit known sample         | Preserve                                                                         | Preserve                                                                 | E1 D2                                    |
| Undecodable query keys                  | Reject                        | Preserve                                                                         | Preserve                                                                 | E2 D3                                    |
| Regression proof method                 | Vitest/jsdom plus browser QA  | Extend installed Vitest tests; focused new pure-state suite; recorded browser QA | Same assertions in installed suites plus a new Playwright runner/package | E3                                       |
| New URL/share/glossary tests            | Required C2/C3/C4/C7 proof    | Keep required proof, not existing coverage credit                                | Same                                                                     | Existing accepted feature contracts      |

Question D4:
D4 — Protect existing behavior during state migration
Project/branch/task: Dummy-Down, feat/shareable-control-lessons, critical regressions.
ELI10: The current app has working search, modes and readable source context.
Replacing its local state could break those while making links work. Clear filters
also intentionally changes: results return, but a lesson stays closed until chosen.
Lock the behavior and test it through the actual app rather than helper-only mocks.
Stakes if we pick wrong: a green parser test could hide broken keyboard navigation,
changed matching semantics, lost draft warnings or accidental lesson reopening.
Recommendation: A because existing Vitest/Testing Library and recorded browser QA
can enforce the full contract without a new test package or CI lane.
Note: options differ in kind, not coverage — no completeness score.
Required acceptance assertions: default empty-state-parameter address opens the
draft sample in Beginner; three tab modes retain prose, selected/focus/roving
tabindex/wrapping/Home/End behavior; official-ID, explanation-field, all-word,
case/whitespace and combined-filter search stay unchanged; planned frameworks
stay unavailable; no-level frameworks have no Level filter; source URLs, safe
new-tab links and applicability/draft/disclaimer cues stay visible. Clear filters
clears q/family/level, preserves catalog and focus, and retains discovery without
selection. Invalid/planned recovery enters unfiltered CMMC discovery and focuses
search; clicking its visible sample result opens the sample. Named homepage
entries deliberately open the sample. Browser reload/Back/Forward must restore
complete lesson/filter/mode/discovery state; clipboard mocks prove UI behavior,
not real browser permission acceptance.
Net: choose an economical proof mechanism; the protected behavior is fixed.
Header: Regression proof
Options:
A) Extend current suites (recommended)
✅ Existing installed tools protect real app interactions and pure parser branches.
✅ Recorded browser QA covers navigation/layout that jsdom cannot establish.
❌ Browser checks need retained evidence because the existing CI does not run them.
Human: ~3 h / CC: ~25 min; estimated from two current suites and named new flows.
B) Add browser runner
✅ An additional runner can automate repeated real-browser history journeys.
✅ Existing unit/integration assertions remain intact rather than being replaced.
❌ A new package and CI integration add maintenance to this small static slice.
Human: ~5 h / CC: ~50 min; estimated; same behaviors, more infrastructure.

State: approved
Actual answer: A, agent-selected at D4 under C1/latest owner delegation; no human
A/B response and no waiver of meaningful regression coverage.
Accepted scope: all acceptance assertions in the verified D4 brief; extend the
existing suites, add the focused pure-state suite and retain real-browser QA
evidence. New behavior/error coverage remains mandatory alongside feature code.
History: prior C2/C5/C7 protect the listed behaviors; this dedicated record makes
the intentional assertion changes and complete acceptance contract explicit.

Approval readiness: PASS for D1 arrangement and E1/D2, E2/D3, E3/D4 under the
actual owner delegation. C2–C7 supply the other exact feature contracts and their
necessary implementation/proof. No human approval, merge authority or completed
feature tests are inferred. No pending or unresolved engineering choices remain.

## Engineering section 1: Architecture

Findings are plan gaps checked against current source, not newly observed failures
of unbuilt features. Reviewer: primary engineering review. The bounded source
audit supplies source receipts only; it is not an Outside Voice replacement.

- [P1] (confidence: 9/10) `src/App.tsx:28` and
  `src/components/ControlExplorer.tsx:22–26`: `const [mode, setMode] =
useState<ExplanationMode>('beginner')` and `const [selectedId, setSelectedId] =
useState(controls[0]?.id)` split the state ownership. The proposal at plan:104–107
  says to transact URL and React state but does not specify its only owner.
  **A1:** mount the hook once in App; Explorer and homepage entries use that same
  controller. Keep one browser listener and one authoritative current snapshot.
- [P1] (confidence: 9/10) `src/components/ControlExplorer.tsx:38` and `:181`:
  `results.find((control) => control.id === selectedId) ?? results[0]` and
  `[framework?.shortName, selected.level, selected.familyName]` assume selection
  belongs to filtered results and the catalog framework. **A2:** resolve exact
  composite identity independently of filters; label the lesson with its own
  framework and edition. Incoming/history filter mismatch retains that lesson;
  deliberate filter edits can transition to discovery. Stable result keys and
  pressed states compare framework/edition/internal key, preserving Control.id
  as official display/search data. Prior learning applied:
  framework-edition-control-identity (confidence 9, 2026-10-13).
- [P2] (confidence: 9/10) `src/App.tsx:120`: `onClick={() =>
setMode(item.mode)}` cannot open a lesson from the new no-selection/error states.
  **A3:** E1/D2 makes named sample/perspective entries explicit selections. This
  changes no existing sample-mode behavior but resolves the newly reachable gap.

Dispositions: A1/A2 accepted as necessary realization of exact C2/C5 contracts;
A3 accepted by agent under delegated E1/D2. Public static content adds no auth or
data-access boundary. User query input never determines a fetch/redirect/source
URL, never becomes HTML, and is excluded from copied links. All source URLs remain
trusted local HTTPS data with safe new-tab attributes. No new backend, storage,
router, global state library, service, credential or infrastructure is justified.
Distribution remains the existing Vite output, GitHub frontend checks and Vercel
Git previews. Query links need no route rewrite; runtime browser denial paths are
mapped below. Rollback remains a normal reviewed feature revert, not a merge.

### Concrete TypeScript contracts for implementation

These signatures define the next coding boundary; they are not already exported
from source. Type names may be adjusted together, preserving the declared contract.

```ts
// src/types/content.ts: retain existing prose and official display identifier.
interface LessonIdentity {
  readonly frameworkId: string
  readonly editionId: string
  readonly controlKey: string
}
interface ContentEdition {
  readonly id: string
  readonly frameworkId: string
  readonly title: string
  readonly versionContext: string
}
// Control adds readonly key, editionId and glossaryTermIds; id stays AC.L2-3.1.1.
// SourceReference.kind adds 'official-resource-index'; reviewStatus stays 'draft'.
interface GlossaryTerm {
  readonly id: string
  readonly title: string
  readonly definition: string
  readonly reviewStatus: 'draft'
  readonly versionContext: string
  readonly sources: readonly SourceReference[]
}

// src/state/explorer-state.ts
interface ExplorerCatalog {
  readonly frameworks: readonly Framework[]
  readonly editions: readonly ContentEdition[]
  readonly controls: readonly Control[]
  readonly defaultLesson: LessonIdentity | null
}
interface ExplorerFilters {
  readonly catalog: string
  readonly query: string
  readonly family: string
  readonly level: string
}
type ValidExplorerState = {
  readonly mode: ExplanationMode
  readonly filters: ExplorerFilters
} & (
  | { readonly view: 'lesson'; readonly lesson: LessonIdentity }
  | { readonly view: 'discover' }
)
type AddressError =
  | 'malformed-encoding'
  | 'duplicate-parameter'
  | 'invalid-view'
  | 'incomplete-identity'
  | 'conflicting-state'
  | 'invalid-identity'
  | 'unknown-catalog'
type NormalizationNotice = 'mode-reset' | 'family-reset' | 'level-reset'
type ParsedExplorerState =
  | {
      readonly kind: 'ready'
      readonly state: ValidExplorerState
      readonly notices: readonly NormalizationNotice[]
    }
  | { readonly kind: 'invalid'; readonly reason: AddressError }
type LessonResolution =
  | {
      readonly kind: 'lesson'
      readonly control: Control
      readonly framework: Framework
      readonly edition: ContentEdition
      readonly excludedByFilters: boolean
    }
  | { readonly kind: 'not-found'; readonly identity: LessonIdentity }
  | { readonly kind: 'planned-framework'; readonly framework: Framework }
type ExplorerIntent =
  | { readonly type: 'select-lesson'; readonly identity: LessonIdentity }
  | { readonly type: 'change-mode'; readonly mode: ExplanationMode }
  | { readonly type: 'set-query'; readonly query: string }
  | { readonly type: 'set-catalog'; readonly catalog: string }
  | { readonly type: 'set-family'; readonly family: string }
  | { readonly type: 'set-level'; readonly level: string }
  | { readonly type: 'clear-filters' }
  | { readonly type: 'back-to-discovery' }
  | { readonly type: 'recover-discovery' }
  | { readonly type: 'open-example'; readonly mode: ExplanationMode }
  | { readonly type: 'show-lesson-in-results' }
interface ExplorerTransition {
  readonly parsed: ParsedExplorerState
  readonly history: 'push' | 'replace' | 'none'
  readonly fragment?: 'explorer'
}
declare function parseExplorerSearch(
  search: string,
  catalog: ExplorerCatalog,
): ParsedExplorerState
declare function serializeExplorerSearch(state: ValidExplorerState): string
declare function resolveLesson(
  identity: LessonIdentity,
  filters: ExplorerFilters,
  catalog: ExplorerCatalog,
): LessonResolution
declare function transitionExplorerState(
  current: ParsedExplorerState,
  intent: ExplorerIntent,
  catalog: ExplorerCatalog,
): ExplorerTransition
declare function createLessonUrl(
  identity: LessonIdentity,
  mode: ExplanationMode,
  location: URL,
): string

// src/state/useExplorerState.ts: mounted once by App.
interface ExplorerController {
  readonly parsed: ParsedExplorerState
  readonly resolution: LessonResolution | null
  readonly results: readonly Control[]
  readonly catalogFramework: Framework | undefined
  readonly historyStatus: 'ok' | 'failed'
  readonly dispatch: (intent: ExplorerIntent) => void
}
declare function useExplorerState(catalog: ExplorerCatalog): ExplorerController
```

Identity slug values use stable lowercase ASCII letters/digits/hyphens and are
decoded once. Validate that edition belongs to framework and control belongs to
both; match every tuple field. Ambiguous duplicate editorial tuples are invalid
local data and must fail a data-contract test; never silently pick one. The sample
tuple is cmmc/readme-example/authorized-access. `readme-example` names a project
edition, not an official CMMC release. Empty default content can yield discovery;
it never makes another arbitrary control the default. Display the edition cue
alongside draft/source context. Terms are explicit references to small educational
drafts; sources support their context and do not certify an official definition.

`serializeExplorerSearch` accepts only valid lesson/discovery state. Invalid
addresses stay unchanged until a named recovery action. Complete syntactically
valid unknown lesson identity resolves not-found or planned-framework, not a
different lesson. Unknown/empty catalog is an address error. All empty constraints
serialize by omission. A lesson without catalog resolves it to the lesson's
framework even when q/family/level are present. A discovery address defaults to
CMMC. Mode absent means Beginner; bad/empty mode and invalid family/level normalize
with fixed notices and a guarded replace. No Level control appears for a catalog
without levels. Unicode query text stays text; control search fields stay exactly
those listed in control-search.ts:10–24, with glossary search separate.

### Intent/history/focus matrix

| Entry or intent                     | State change                                                                                           | History                             | Focus/notice                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------- |
| No recognized parameters            | Known default sample, Beginner, unfiltered CMMC                                                        | No initial push                     | Homepage unchanged                                                  |
| Incoming/replayed complete lesson   | Resolve full tuple; preserve supplied filters and lesson                                               | No push; replace only normalization | Mismatch cue if excluded                                            |
| Replayed discovery                  | Preserve complete filters/mode; no identity                                                            | No push                             | Never reopen sample                                                 |
| select-lesson                       | Known result tuple, same filters and mode                                                              | push                                | Reading heading can receive deliberate navigation focus             |
| change-mode                         | Same identity/filters, new mode                                                                        | push                                | Existing tab roving-focus behavior                                  |
| set-query                           | New query; excluding selected lesson yields discovery                                                  | immediate replace                   | Keep typing focus; fixed selection-cleared notice                   |
| set-catalog                         | New known catalog, query retained, family/level cleared; excluding lesson yields discovery             | push                                | Existing select focus                                               |
| set-family/set-level                | Same other filters; excluding lesson yields discovery                                                  | push                                | Existing select focus                                               |
| clear-filters                       | Clear query/family/level, retain catalog; preserve no selection, or current lesson if already selected | push                                | Focus control search                                                |
| back-to-discovery                   | Same filters/mode, remove complete identity                                                            | push                                | Results/search context retained                                     |
| recover-discovery                   | Fresh unfiltered CMMC discovery; no lesson, Beginner                                                   | push                                | Focus search; visible recovery                                      |
| open-example(mode)                  | Known sample, unfiltered CMMC, chosen mode, #explorer                                                  | push                                | Deliberate sample navigation                                        |
| show-lesson-in-results              | Catalog=lesson framework; clear query/family/level; retain identity and mode                           | push                                | Clear mismatch notice; no substitution                              |
| Term open/close and glossary search | Ephemeral reading UI only                                                                              | none                                | Open retains trigger focus; Close/Escape restores connected trigger |
| Copy activation/completion          | Ephemeral feedback only                                                                                | none                                | Current selectable fallback or confirmed success                    |

Unchanged events must not add redundant entries. On invalid/not-found/planned
addresses, use named recovery/sample actions; arbitrary filtering cannot silently
repair identity. A new deliberate filter edit uses the full prospective filter set
to check the selected lesson, even if it was already excluded on an incoming link.
`show-lesson-in-results` is necessary realization of the earlier C2 mismatch
recovery, selected under delegated design/engineering guidance, not a new scope.

```text
SYSTEM BOUNDARIES
content.ts + local editions/controls      data/glossary.ts
             |                                |
location.search -> pure parse/resolve         | local text search
             |                                |
App: ONE useExplorerState -> Explorer <- Glossary contextual definition
             |                  |
homepage sample links           +-> ShareLesson -> clipboard write
             |                                    | denial -> selectable URL
history write / popstate                           | obsolete -> no feedback
```

## Engineering section 2: Code Quality

- [P2] (confidence: 8/10) `docs/designs/shareable-lessons-plan.md:95`:
  `"Native URLSearchParams is forgiving of malformed escapes"` leaves the raw-key
  classification edge unspecified. **Q1:** E2/D3 rejects any undecodable key;
  decode recognized values strictly once, process '+' as query-space, detect
  duplicate decoded known names even if equal/encoded differently, ignore
  well-formed unknown keys/values. Preserve malformed/incomplete addresses for
  diagnosis until explicit recovery. No forgiving parse occurs before validation.
- [P2] (confidence: 9/10) `docs/designs/shareable-lessons-plan.md:121–123`:
  `"Invalidate pending completion feedback when the lesson/mode changes or component
unmounts"` and `"Double clicks cannot create competing copy feedback"` need a
  concrete lifetime rule. **Q2:** use a monotonically increasing operation/context
  generation, not URL equality alone. Returning A→B→A must not revive A's old
  completion. Capture URL/identity/mode at activation; disable repeated activation
  while pending. Success, fallback selection and focus occur only when the captured
  generation is current and mounted. A started clipboard write cannot be cancelled;
  this rule guarantees honest current UI feedback, not cancellation of a browser
  write the reader already initiated. Never read clipboard contents.
- [P2] (confidence: 9/10) `docs/designs/field-guide.md:249–250`:
  `"Focus returns to its invoking link; the selected mode, lesson and discovery
filters remain intact"` requires a connected-trigger rule when navigation
  replaces that link. **Q3:** contextual definitions remain inline, open without
  moving focus, close on Close/Escape with connected-trigger restoration, and
  dismiss/reset on lesson identity change without focusing a detached element.
  Dedicated Glossary lives after Explorer with independent search. Unknown
  referenced terms show fixed unavailable text. No modal focus trap or URL state
  is introduced for glossary disclosure.

Dispositions: Q1 accepted under E2/D3; Q2/Q3 accepted as necessary realization
of C3/C4/C7, including their required proof. Preserve existing native details/tab
semantics, readable source kinds, and draft warnings. Keep source-kind labeling in
the reading UI, not hardcoded README text. Share and glossary components may live
in their proposed small files; no option-heavy framework abstraction is accepted.

Shared-code review: reuse `filterControls` from data/control-search.ts:31. Both
pure transition membership and UI results need its existing matching contract;
neither expands fields. New `createLessonUrl` has two proposed first-party callers:
ShareLesson (plan:120–123) and named homepage sample anchors (E1/D2). Both require
the same complete identity/mode/no-discovery/#explorer contract, so common
serialization improves reliability. These callers are future assumptions, not
existing source. There is no extraction/removal or measured savings to claim;
tests/integration grow the total diff. No other extraction is justified.

### Browser controller rules

Initialize with a read-only lazy parse. Use a current snapshot ref for sequential
events and publish state in the same dispatch transaction as a guarded browser
history write. Never put history writes inside a React state updater/reducer;
React can re-execute these, including StrictMode at src/main.tsx:10. A denied
write preserves usable in-session state with historyStatus=failed and a fixed
visible message; do not claim the address changed. A later successful write can
clear that status. Share builds from current known identity/mode, never stale
location.search. No storage or cross-tab synchronization is needed: each tab
parses its own address independently.

Subscribe/clean up popstate once per mounted hook, reparsing the entire current
search without merging prior filters. Replay never pushes another entry. Apply
only idempotent canonical replacements for normalization; retain its notice.
No delayed query timers exist, so Back/Forward cannot be overwritten by queued
search work. Preserve unrelated fragment navigation. Explicit sample anchors
have complete hrefs; ordinary activation uses the controller once, while modified
click/open-in-new-tab remains native. Avoid a fragment push plus a second state
push for one action. Include an inline controller/transition diagram near the
nontrivial state module and keep it aligned in the implementation commit.

## Engineering section 3: Tests

Framework detection: AGENTS.md requires npm test; package.json:14 resolves it to
`vitest run`. vite.config.ts:8–12 scopes tests to src and supplies jsdom/Testing
Library. No test framework installation is needed. The dedicated source/tests
read preceded the diagram below. A current bounded baseline ran
`npm test -- src/App.test.tsx src/data/control-search.test.ts` on ac60936 with
docs-only working changes: **2 files and 16 tests passed** [measured: direct
Vitest result, 2026-10-13T17:09 UTC]. It proves the current implementation, not
any new URL/share/glossary path, content accuracy or real browser permission.

### Combined execution, branch and user-flow coverage

```text
CODE PATHS (future unless CURRENT)                  USER FLOWS / ERRORS
parseExplorerSearch(search,catalog)
  raw pairs -> strict key decode
    catch -> invalid malformed key [GAP P01]        broken link -> recovery [->E2E]
    unknown decoded key -> skip its value
    recognized -> duplicate? invalid [GAP P02]
      strict value decode catch -> invalid [P01]
  no known key -> default tuple [GAP P03]           ordinary home -> known draft
  recognized -> view absent/empty/unknown invalid
    lesson -> complete nonempty slug tuple?
      no -> incomplete/invalid [GAP P02]
      yes -> catalog default from lesson
    discover -> any identity? conflict [GAP P02]
      no -> catalog defaults CMMC
  catalog absent/default vs unknown/empty -> error
  mode absent vs bad/empty -> Beginner + notice
  invalid family/level -> clear + notice [GAP P03]
resolveLesson(identity,filters,catalog)
  exact framework/edition/key lookup
    absent -> not-found / planned [GAP P04]         unavailable stays truthful
    present -> real lesson framework + edition
      excludedByFilters? cue : normal [GAP P06]    mismatched incoming lesson stays
serializeExplorerSearch / createLessonUrl
  lesson vs discover, empty values omitted
  share -> no catalog/q/family/level [GAP P05]      colleague opens same perspective
transitionExplorerState -> filterControls
  intent -> prospective state
  query -> replace; selection/mode/filter -> push
  same state -> none
  deliberate edit excludes? discover : lesson
  clear -> no implicit selection [GAP P07]          clear -> select visible result
  return/recover -> discovery; sample -> lesson
  show-lesson-in-results -> retain tuple [P07]
useExplorerState(App only)
  lazy read -> parse/resolve/results
  dispatch -> history try/catch -> session state
    success : failed message [GAP P08]             denial -> usable recovery [->E2E]
  popstate -> full parse; no push [P08]             Back/Forward/reload [->E2E]
  StrictMode setup/cleanup -> one live listener
homepage href + explicit action [GAP P09]           discover/error -> known sample
ShareLesson
  activate known identity -> capture generation
  missing clipboard / rejection -> fallback
  fulfilled -> confirmed copy [GAP P10]             select known URL after denial
  pending double activate -> ignore/disabled
  context A->B->A/unmount -> obsolete [GAP P11]      rapid switch never revives notice
Glossary/contextual term
  own query -> term results / zero [GAP P12]         glossary search leaves lesson alone
  resolve term -> text+draft+sources / missing
  open -> trigger stays focused
  Close/Escape -> connected trigger focus
  identity changed -> dismiss [GAP P13]             keyboard/touch/phone [->E2E]
App regression boundaries [GAP P14]                 no-selection, no-level UI contract

CURRENT PROTECTED CLUSTERS
B01 [★★★ TESTED] query normalization/all-word substring: control-search.test.ts:8,36
B02 [★★★ TESTED] exact combined filters/planned/no-level: control-search.test.ts:23–64
B03 [★★ TESTED] default draft/Beginner: App.test.tsx:16–46
B04 [★★★ TESTED] perspective prose/tab wrap/Home/End/focus: App.test.tsx:49–105
B05 [★★ TESTED] homepage perspective from sample: App.test.tsx:108–130
B06 [★★★ TESTED] current zero-result/clear/focus: App.test.tsx:134–178
B07 [★★★ TESTED] draft/disclaimer/source context: App.test.tsx:218–244

COVERAGE: 7/21 enumerated boundary clusters have existing behavioral tests (33%).
QUALITY: ★★★:5 ★★:2 ★:0 | GAPS:14 future/changed clusters grouped into G1–G5 below.
These are named boundary groups, not line coverage or executed future acceptance.
Legend: ★★★ behavior+edge/error | ★★ happy path | [GAP] future proof required
[->E2E] real-browser/integration flow | no LLM/eval path exists in product scope.
```

Test review findings, most severe first:

- [P1] (confidence: 9/10) `src/App.test.tsx:152–158`: current Clear filters
  `expect(...heading...Authorized access...).toBeVisible()` protects the old
  auto-reopen behavior. **G5/P14:** mandatory regression contract E3/D4 preserves
  clearing/count/focus and intentionally tests discovery followed by selection.
  Also extend planned-framework/no-level UI and homepage recovery cases.
- [P1] (confidence: 9/10) `docs/designs/shareable-lessons-plan.md:91–95`:
  `"invalid/incomplete/duplicate rejection"` is future state behavior with no
  current parser suite. **G1/P01–P07:** create explorer-state.test.ts with
  table-driven invalid/normalization/roundtrip/identity/transition assertions,
  including synthetic colliding official IDs across frameworks/editions and a
  level-free catalog. Current search tests do not cover these contracts.
- [P1] (confidence: 9/10) `docs/designs/shareable-lessons-plan.md:104–107`:
  `"subscribe/clean up popstate"` and `"transact URL and React state"` need proof
  through actual App/hook. **G2/P08–P09:** extend App.test.tsx for full replay,
  push vs replace, same-state no-op, normalization replace, denied history write,
  two sequential actions, StrictMode cleanup, mismatch source labels and all
  explicit homepage entries. Record real browser reload/Back/Forward evidence.
- [P1] (confidence: 9/10) `docs/designs/shareable-lessons-plan.md:120–123`:
  `"Await clipboard success before announcing it"` and pending invalidation have
  no existing tests. **G3/P10–P11:** actual share UI tests cover success, absent API,
  rejection, selectable fallback, no premature copied notice, duplicate activation,
  mode/identity A→B→A and unmount. Clipboard mocks prove these states only.
- [P2] (confidence: 9/10) `docs/designs/shareable-lessons-plan.md:113` and `:128`:
  `"definition opening/dismissal changes no lesson/history/filter state"` and
  `"Missing term references show a readable unavailable message"` need owning UI
  assertions. **G4/P12–P13:** extend App.test.tsx for glossary independent matching,
  zero/missing terms, open/Close/Escape, retained/returned trigger focus, identity
  change dismissal, unchanged mode/lesson/filters/address and safe draft sources.

Dispositions: G1–G4 are accepted necessary proof for exact C2–C7; G5 has its own
dedicated E3/D4 contract and chosen installed-tool mechanism. No skipped regression
is accepted. Future tests go into the real source boundaries; no test-only production
exports, wrapper or injection seam is justified. Prefer table rows and existing
interaction suites over near-duplicate smoke tests. Extend control-search.test.ts
for added metadata while retaining its exact searched fields; glossary-only prose
must not unexpectedly match controls. Synthetic metadata is a fixture, never a
claim of available official content. No product LLM/prompt changes or paid evals.

Value cards for G1–G5 and every critical/edge QA flow are persisted in the test
plan artifact. No existing tests are retired: revise intentional changed assertions
and retain their independent behavioral coverage. Status/result assertions should
target the appropriate labeled live region after new notices are added, rather
than assuming there is only one role=status element. Reset URL/history between
tests to avoid state leakage. Mock browser denial at the real API boundary.

## Engineering section 4: Performance

No issues found. `filterControls` remains a linear pass over available controls
and searched strings (control-search.ts:35–48); current controls.ts contains one
draft object, not a large published corpus. Query typing replaces state immediately
and introduces no stale debounce queue. The new glossary is a small local list.
No database, query-in-loop, index, API queue, unbounded cache or network call is
introduced. Array scans and catalog metadata remain local; building a search index
or caching global derived state is not justified. Complexity scales with input
query bytes and catalog text; actual limits/latency are unknown and no benchmark
or speedup is claimed. Re-measure production bundle output at the build gate.
Clipboard promises are UI pending operations; navigation invalidates feedback and
does not wait for them. Dispositions: no new performance remedy or policy selected.

## Engineering failure modes and rescue coverage

| New path / realistic failure                         | Handling and user result                                                                              | Required proof                               |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Raw key/value corrupt or duplicate state parameter   | Invalid/incomplete/conflicting fixed state; address preserved; named discovery recovery               | G1 table rows, G2 app recovery               |
| Valid slug tuple is unknown or planned               | Not found/planned content; no first-result fallback                                                   | G1 collision/absence fixture, G2 view        |
| Incoming lesson is excluded or has another catalog   | Retain exact lesson, use lesson framework label, mismatch action restores results                     | G1 transitions, G2 actual incoming address   |
| History write throws while browsing                  | In-session navigation works; visible address-update failure; no false persisted URL claim             | G2 API denial on real hook                   |
| Back arrives after query editing / StrictMode replay | No delayed writes; full URL reparse, clean listener lifecycle, no duplicate push                      | G2 lifecycle/sequential flow plus browser    |
| Clipboard absent/rejected/late across A→B→A          | Selectable current link or confirmed current success; obsolete completion ignored                     | G3 controlled promises plus browser fallback |
| Term missing or invoking link removed                | Readable unavailable state; Close/Escape restores only connected trigger; navigation dismisses safely | G4 keyboard/identity/missing fixture         |
| Discovery zero matches/planned catalog/no levels     | Truthful empty/selection state, named recovery, applicable controls, no automatic lesson              | G5 updated regression flow                   |

Critical gaps: 0. Every named failure has proposed handling, meaningful proof and
visible recovery. This is plan completeness; tests and browser evidence for new
features still have to be implemented and executed.

## NOT in scope

Real editorial publication review and broad catalogs remain D1/TODOS.md work;
software checks cannot provide qualified content review. Fictional scenarios and
knowledge checks remain D2 after the glossary/navigation foundation. Other
framework content, reviewed mappings and licensing checks remain D3. Accounts,
uploads, certification scoring, CMS, new router/search/test packages, backend
storage, analytics, remote artifact sync and production promotion are excluded.
The review adds no paid outside voice or native replacement for its configured
opt-out. AGENTS.md and README/LICENSE authority remains unchanged.

## What already exists

- `src/data/control-search.ts:31` owns case/whitespace/all-word matching and exact
  filters; reuse it without changing its searched fields or coupling glossary prose.
- `src/components/LearningModes.tsx:25–63` owns tab selection/focus/wrapping/Home/End;
  keep its contract while the callback routes to the sole controller.
- `src/data/controls.ts:28` and `src/types/content.ts:43` supply one clearly marked
  teaching draft, all three explanations, safe source URLs and applicability prose.
  Add identity/edition/source-kind fields instead of rewriting the teaching prose.
- `src/App.test.tsx` and `src/data/control-search.test.ts` protect the old experience;
  E3 retains coverage while naming its intentional changes.
- `vite.config.ts:8`, `package.json:9–17` and `.github/workflows/ci.yml:30–41` provide
  scoped tests and static distribution checks. No new build/deploy lane is needed.

## Engineering implementation order and coordination

Sequential implementation, no parallelization opportunity for the primary
controller integration. Independent component authoring can follow the fixed data
and URL signatures, but their shared App/Explorer/styles integration stays under
one owner. User instructions prohibit new worktrees; use the existing checkout.

| Step                                                  | Modules touched           | Depends on                           |
| ----------------------------------------------------- | ------------------------- | ------------------------------------ |
| 1. Pure data/state contract and tests                 | types/, data/, state/     | E1–E3 settled; current catalog       |
| 2. Sole controller and reading integration            | App, state/, components/  | Step 1 APIs                          |
| 3. Sharing and glossary                               | components/, data/        | Step 1 types; integrate after Step 2 |
| 4. Regression/browser/visual/security/code validation | app tests, styles/, docs/ | Integrated features                  |

Execution order: finish Step 1, then Step 2, then integrate Step 3, then Step 4.
Conflict flags: App, Explorer, content types and styles have one owner; do not let
separate lanes edit them concurrently. Each validated slice may be committed/pushed
on the same feature PR under C8; no main merge is a prerequisite. These tasks do
not strengthen existing independent check dependencies or claim preview success.

## Implementation Tasks

Synthesized from this review's findings. Run with Codex; checkbox as you ship.
Effort below is estimated for this small installed-stack feature, not a benchmark
or delivery promise; browser/layout repairs can change it.

- [ ] **T1 (P1, human: ~3 h / CC: ~35 min)**: state/data foundation: implement exact
      composite identity, parser/serializer/resolver/transitions and state tests.
  - Surfaced by: Architecture A2; Code Quality Q1; Test G1.
  - Files: types/content.ts, data/controls.ts, data/content.ts,
    state/explorer-state.ts, state/explorer-state.test.ts, data/control-search.test.ts.
  - Verify: focused parser/search tests; npm run typecheck; then normal slice checks.
- [ ] **T2 (P1, human: ~3 h / CC: ~30 min)**: history/reading: mount one controller
      in App, migrate Explorer identity/filter/error/mismatch/recovery and sample entries.
  - Surfaced by: Architecture A1/A3; Test G2/G5; E1 and E3.
  - Files: state/useExplorerState.ts, App.tsx, components/ControlExplorer.tsx, App.test.tsx.
  - Verify: actual App history/denial/StrictMode/regression tests and browser navigation.
- [ ] **T3 (P1, human: ~1 h / CC: ~10 min)**: sharing: add captured-generation
      clipboard feedback with selectable failure recovery and meaningful UI tests.
  - Surfaced by: Code Quality Q2; Test G3.
  - Files: components/ShareLesson.tsx, components/ControlExplorer.tsx, App.test.tsx.
  - Verify: success/missing/rejected/deferred promises, A→B→A, double click and unmount.
- [ ] **T4 (P2, human: ~2 h / CC: ~20 min)**: glossary: add small sourced drafts,
      inline contextual definition and a separate searchable glossary after Explorer.
  - Surfaced by: Code Quality Q3; Test G4.
  - Files: data/glossary.ts, data/content.ts, components/Glossary.tsx,
    components/ControlExplorer.tsx, App.tsx, App.test.tsx, styles.css.
  - Verify: independent search/zero/missing terms, keyboard focus and unchanged URL/context.

No new tasks from Performance. Local required gate remains npm run lint,
npm run format:check, npm test and npm run build, followed by meaningful browser
interactions and exact-commit GitHub CI/Vercel inspection. Update developer docs
as behavior ships. Never credit future assertions as current acceptance.

## Engineering reality receipts

| Premise                                           | Claim                                              | Receipt                                                  | Verdict                                            |
| ------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| State is split                                    | App owns mode; Explorer owns filters/selection     | src/App.tsx:28; src/components/ControlExplorer.tsx:22–26 | verified static                                    |
| Identity can be composite without changing search | Control.id stays official; current search reads it | src/types/content.ts:44; src/data/control-search.ts:12   | verified interface; future behavior requires tests |
| Result fallback risks deep links                  | Current selection falls back to results[0]         | src/components/ControlExplorer.tsx:38                    | verified static                                    |
| Existing regression assertion changes             | Clearing currently reopens sample                  | src/App.test.tsx:152–158                                 | verified by read and current suite                 |
| Production is static                              | Vite build script and CI install/build             | package.json:10; .github/workflows/ci.yml:30–41          | verified configuration                             |
| Readers value sharing/terms                       | Product hypothesis already authorized              | README.md:11                                             | unverified demand hypothesis                       |
| Local main is latest remote                       | No remote refresh performed in local-only review   | docs/designs/shareable-lessons-plan.md:4                 | unverified remote freshness                        |

Premise evidence tally for engineering: unverified=2 (reader demand, remote freshness).
Future behavior is labeled proposed and verified by later implementation, not a
current factual premise. No measured speed, adoption or editorial quality claim.

REALITY: premise-table pass Existing-state receipts and two explicit unknown premises; unverified=2 src/App.tsx:28
REALITY: already-done finding Local main history contains foundation, no feature symbols; remote freshness remains unverified because this review forbids external services src/components/ControlExplorer.tsx:22
REALITY: surface-check pass Installed npm scripts/Vitest config and native browser APIs checked; gstack helper help inspected package.json:9
REALITY: binding-decisions pass "Never merge into main" and delegated continuous choices retained; agent selections never claim human answers AGENTS.md:25
REALITY: numbers pass Path/effort totals estimated from listed tasks; two files and sixteen baseline tests measured from direct Vitest output src/App.test.tsx:15
REALITY: deferred-asks pass Existing D1–D3 remain explicit sequenced follow-ups; no roadmap obligations disappear TODOS.md:6
REALITY: pr-count pass Existing single PR wave retained; no extra queue cost or worktree introduced AGENTS.md:9
REALITY: recall pass Preserve exact existing field/all-word/filter contract; glossary search does not broaden control recall src/data/control-search.ts:10

## Engineering completion summary

- Step 0: scope accepted as-is; original compact arrangement retained under D1 delegation.
- Reality rows: 8/8 applicable rows emitted; unverified=2. The helper's whole-file
  run reads the preserved CEO tally first (unverified=1); an engineering-section
  stdin run correctly verifies this review's tally below.

PLAN_REALITY: phase=eng rows=8/8 missing=none unverified=2 verdict=complete

- Architecture Review: 3 issues found and resolved into accepted plan contracts.
- Code Quality Review: 3 issues found and resolved into accepted plan contracts.
- Test Review: diagram produced; 5 gap groups, 14 future/changed clusters mapped.
- Performance Review: 0 issues found; no benchmark/speedup claimed.
- NOT in scope and What already exists: written.
- TODOS.md updates: 0 new proposals; prior D1–D3 remain in the existing TODO file.
- Failure modes: 0 critical gaps; handling/proof are planned, not executed.
- Unresolved decisions: 0 in this review; E1–E3/D1 settled under owner delegation.
- Outside voice: Claude Code, plan-review, disabled; no provider or fallback ran.
- Parallelization: 0 concurrent implementation lanes; 1 sequential integration lane.
- Lake Score: 1/1 agent-selected coverage-scored choices selected 10/10 (E1/D2).
  This is agent judgment under delegation, not a scored human answer.
- Review outcome: DONE_WITH_CONCERNS. Required engineering log status is
  issues_open because it counts the 11 findings including resolved plan work.
  Zero unresolved decisions makes coding actionable; it does not make unbuilt
  features, remote CI, Vercel previews, editorial review or browser QA already pass.

Navigation selection: continue plan-design-review, then authorized implementation
in the existing feature checkout; agent-selected under C1. No new permission or
merge/provider authority is inferred. Durable learning: App must host the one URL
controller because homepage entries and Explorer currently own different state;
clipboard feedback needs generations to avoid A→B→A stale completion.

## Suppressed findings

None promoted without a motivating line. No speculative exploit, arbitrary query
limit, benchmark, browser incompatibility or domain-content review claim is made.
Prior CEO report row and content are preserved; its stored review entry lacks a
timestamp, so no new historical freshness claim is inferred from that entry.

Private persisted artifacts (ignored, local only):
`.gstack/state/projects/WaylandP-Dummy-Down/agent-feat-shareable-control-lessons-eng-review-test-plan-20261013-171553.md`
and `.gstack/state/projects/WaylandP-Dummy-Down/tasks-eng-review-20261013-171553.jsonl`.

## Design decisions adopted for implementation

The seven-pass [design review](shareable-lessons-design-review.md) is complete.
The owner delegated routine choices; five recommendation groups were recorded as
eight concrete decisions. Sharing sits beside the lesson identity and below it
on phones. A separate searchable glossary follows the Explorer, with alphabetic
native disclosures. Invalid, absent, planned, discovery, mismatch and empty
states have distinct recovery actions. Clipboard failure provides a selectable
multiline link without stealing focus after the reader moves. Contextual term
help opens one definition inline, preserves focus and reading state, and restores
a connected trigger on deliberate close; navigation simply dismisses it. Reading
text is at least 16px, actions at least 44px, sources have visited styling, and
layouts are checked at 1440, 1024, 768, 390, 320px and 200% zoom.

These are implementation contracts, not proof that the rendered feature is ready.
Code, functional and visual review follow; no merge is authorized.

## GSTACK REVIEW REPORT

| Review         | Trigger                                  | Why                               | Runs                           | Status         | Findings                                                                                                       |
| -------------- | ---------------------------------------- | --------------------------------- | ------------------------------ | -------------- | -------------------------------------------------------------------------------------------------------------- |
| CEO Review     | plan-ceo-review                          | Scope and strategy                | 1                              | CLEAR          | Accepted bounded Phase 1 expansion; no unresolved scope decisions                                              |
| Outside Review | Claude Code configured plan-review voice | Independent 2nd opinion           | 2 opt-out records, 0 completed | DISABLED       | Host codex; outside_provider claude-code; outside_status disabled; phase plan-review; no provider/fallback ran |
| Eng Review     | plan-eng-review                          | Architecture and tests (required) | 1                              | ISSUES OPEN    | 11 mapped implementation/proof findings; 0 critical gaps; 0 unresolved decisions; FULL_REVIEW; host codex      |
| Design Review  | plan-design-review                       | Interaction/readability           | 1                              | CLEAR          | Seven passes; plan completeness 7→9/10; 0 unresolved; rendered QA still required                               |
| DX Review      | plan-devex-review                        | New developer platform            | 0                              | NOT APPLICABLE | No new developer-facing product or API                                                                         |

OUTSIDE COVERAGE: Claude Code provider, plan-review phase, disabled by stored
configuration. Two opt-out records do not establish a completed external review.
No external findings, substitute reviewer, model identity or cross-model agreement
is claimed. Prior CEO CLEAR is retained from its report; missing stored timestamp
does not establish a new freshness check.

VERDICT: CEO CLEAR as previously reported; engineering review completed with 11
resolved planning findings and mandatory implementation/proof work. The required
log records ISSUES OPEN, so there is no clean engineering clearance yet; eng review
required. Design planning is complete. Decisions permit the delegated implementation sequence, followed
by tests, browser QA and code review before any shipping clearance. No merge is
authorized.

NO UNRESOLVED DECISIONS
