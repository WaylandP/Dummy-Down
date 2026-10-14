# Cipher & Chalk: Decode Board redesign

> Historical initial implementation. The subsequently supplied full reference and
> square logo supersede its visual choices and missing-image limitation. Use
> [the current design contract](../DESIGN.md) and
> [reference correction checkpoint](../reviews/reference-visual-2026-10-14.md).

Planning checkpoint: October 14, 2026, branch `feat/cipher-and-chalk`, starting
from main `cf5ffd2094650211ae851ac5a73bb80c4318b0ae`.
Delivery checkpoint: frontend commit `75726def64038e5b061c148bec621ccf48956de4`,
branch `feat/cipher-and-chalk-polish`. The complete existing UI is implemented and
validated as documented below. This inventory was recorded before implementation;
its original planning rationale is retained separately from actual delivery proof.
The owner authorized the name and selected Decode Board direction, with routine
implementation decisions delegated. Final rendered sign-off remains with the owner.

## Design basis and reference limitation

The complete implementation brief is the uploaded `Pasted text.txt`. It calls for
an adult teaching board: deep evergreen/slate surfaces, cream/off-white reading
areas, restrained teal, crisp typography, subtle annotations and clean diagrams.
The exact display name is **Cipher & Chalk**. A geometric coded-C mark replaces
the old typographic identity; body copy stays sharp rather than imitating chalk.

The attachment directory contains the text brief only. The referenced refined
Decode Board image is not accessible in this session, so no image inspection,
exact logo tracing or pixel match is claimed. Implement the explicitly selected
text direction now; a supplied image can support a later comparison without
blocking this authorized work. Historical identity notes remain historical.

## Problem, premises and approaches

The existing app has meaningful teaching and source distinctions, but its previous
editorial presentation does not express the newly selected identity. The problem
is coherence across actual learning and recovery states, rather than adding mockup
features. A darker homepage alone would leave quizzes, glossary, navigation and
loading states feeling unrelated.

Premises challenged under the owner's delegated choices:

- A rebrand needs a router or new learning engine: rejected. The existing root
  SPA, shared components and edition-bound data already support the experience.
- A teaching board requires handwritten body text or decorative classroom props:
  rejected. Shape, restrained annotations and surface hierarchy carry the idea.
- More control entries imply reviewed curriculum: rejected. Keep 149 snapshot
  references, 447 draft perspectives, four activities, 12 questions and pending
  qualified approval exactly as they are.
- A new display name requires service renames: rejected. Deployment, package,
  storage and content identities stay stable. GitHub subsequently reported an
  external repository rename to `WaylandP/cipher-and-chalk`; no agent renamed it
  or rewrote historical source identities.

| Approach                        | Reuse and tradeoff                                                                                                                              | Decision                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Minimal visual replacement      | Rename visible labels and change a few colors. Fastest diff, but fails the requested full-state design and feedback work.                       | Rejected as insufficient scope.                                    |
| Shared Decode Board system      | Keep React/state/data behavior; apply reusable tokens and shared component styling, a real SVG identity and deliberate reading/feedback states. | Selected; meets the full UI brief with the lowest behavioral risk. |
| New page/router/lesson platform | Rebuild navigation and learning around a new framework or dashboard. Creates migration and privacy risks without solving a missing capability.  | Outside this redesign.                                             |

The long-term opportunity is a recognizable place to decode unfamiliar frameworks
through source-bound teaching. A workshop leader could project one requirement,
switch perspectives, then discuss a fictional answer without collecting an
organization's evidence. This is a possible use, not observed learner research or
a new classroom feature. Start by improving the existing reading workspace.

## Actual addresses and state ownership

There is one browser page at `/`, mounted by `src/main.tsx` and `src/App.tsx`.
There is no React Router, account area, separate lesson route, dashboard, modal
manager, authentication screen or backend. Navigation anchors include `#top`,
`#main`, `#explorer`, `#approach`, `#glossary` and `#usage`.

`src/state/explorer-state.ts` owns strict query parsing and transitions;
`useExplorerState.ts` owns the single history listener and push/replace behavior.
Existing recognized keys are `view`, `framework`, `edition`, `control`, `mode`,
`catalog`, `q`, `family`, `level` and `collection`. Views are `lesson` and
`discover`; modes are `beginner`, `it-cyber` and `compliance`. A lesson's identity
is the exact framework/edition/control-key triple, not its display title.

| Address/state                                          | Real meaning and invariant                                                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `/` with no query                                      | Explicit default Level 1 authorized-access reference, Beginner mode. Do not replace it with the first result.         |
| `view=discover`                                        | Search/filter/paginated discovery without an implied selected lesson. Preserve collection and mode.                   |
| `view=lesson&framework=…&edition=…&control=…&mode=…`   | Exact shareable reference or demo teaching identity. Shared lesson URLs omit discovery text.                          |
| `collection=references` / `collection=lessons`         | Official snapshot collection versus the original README teaching demo. The demo is not an extra official requirement. |
| Planned catalog                                        | Explicit roadmap empty state with recovery; no invented available controls.                                           |
| Unknown lesson identity or malformed/conflicting query | Retain the address and visible explanation until deliberate recovery. Do not substitute an available control.         |
| Bad mode/family/level                                  | Existing normalization notices remain visible; preserve fragment and canonical replace semantics.                     |
| History denied                                         | Keep the usable session state and warn that refresh/Back may not preserve it.                                         |

## Complete existing UI inventory

Every row is a redesign target and verification surface. Completion is recorded
separately in the delivery evidence; source inventory alone does not establish QA.

| Surface                         | Actual owner / shared components                               | States and interactions to retain                                                                                                                                          |
| ------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Global shell and navigation     | `App`, `Brand`                                                 | Home link, skip link, section anchors, GitHub/new-tab labels, header/footer variants and visible keyboard focus.                                                           |
| Homepage introduction           | `App`                                                          | Requirement-focused introduction and real default lesson action; no fake dashboard, testimonial, statistics or mockup navigation.                                          |
| Level navigation                | `CmmcLevels`                                                   | Real 15/110/24 reference totals, level-specific discovery links, snapshot label and Level 3 relationship context.                                                          |
| Search and top-level choices    | `ControlExplorer`                                              | Labeled native search, collection/framework selects, planned framework state, submission/blur analytics, invalid-address disabled controls.                                |
| Family and level filtering      | `ControlExplorer`                                              | Available choices only, result count announcement, combined filtering, cleared constraints and recovery focus.                                                             |
| Result list and pagination      | `ControlResults`                                               | Eight results per page, selected row/pressed state, long codes/titles, previous/next disabled boundaries, page replay for selected identity.                               |
| Desktop/tablet discovery        | Shared Explorer layout                                         | Browsing alongside the reader; no stale phone collapse hiding desktop discovery.                                                                                           |
| Phone discovery and reading     | `ControlExplorer`                                              | Real expand/return-to-reading button; selection collapses discovery and focuses the reading heading, including same-control reselection.                                   |
| Official control detail         | `ReferenceDetail`                                              | Title, identity/edition, attributed requirement quotation, back/show-in-results actions, guide/model wording differences and source citations.                             |
| Original demo detail            | `ControlExplorer`                                              | Separate educational concept, examples and takeaway; explicit draft/README provenance and no official-requirement claim.                                                   |
| Three perspectives              | `LearningModes`, `ControlPerspective`, `ReferencePerspectives` | Selected tabs/panel labels, arrow/Home/End focus, distinct Beginner/IT & Cyber/Compliance teaching, draft/source context.                                                  |
| Perspective feedback            | `ControlPerspective`                                           | Helpful/unclear pressed states, useful text feedback and allowlisted analytics; no learner score or identity.                                                              |
| Lazy perspective content        | `ReferencePerspectives`                                        | Loading status, load-failure explanation/reload action and missing exact-edition draft state; official text stays readable.                                                |
| Contextual vocabulary           | `ContextTerms`, `TermDefinition`                               | One inline definition, unavailable term message, source disclosure, Close/Escape and focus return; no invented glossary modal.                                             |
| Searchable glossary             | `Glossary`, `TermDefinition`                                   | Alphabetic native disclosures, local independent search/count, empty state and clear-search focus recovery.                                                                |
| Learning introduction           | `LearningPractice`                                             | Exact supported activity identity, draft label, plain-English concept/common misunderstanding where content exists; no practice invented for Level 2/3.                    |
| Instructional diagram           | `LessonDiagram`                                                | Ordered steps, optional branch destinations, visible text equivalent, meaningful labels and a consistent visual grammar.                                                   |
| Fictional scenario              | `LearningPractice`                                             | Native scenario disclosure and ordered narrative steps; preserve fictional/source context.                                                                                 |
| Questions and progress          | `LearningPractice` / `KnowledgeCheck`                          | Native labeled radio choices, unanswered/selected/checked states, disabled gates, wrong/correct prose feedback, retry/next/finish/reset/completion and focused new prompt. |
| Session learning state          | Keyed learning components                                      | Progress retained for the same lesson through perspective changes; reset only under existing identity/lifetime rules. No persistent account progress.                      |
| Editorial review and objectives | `EditorialReviewContext`                                       | Source checking versus AI comparison versus pending human approval, quoted objective disclosures, unresolved notes and contextual assessment terms.                        |
| Source/model disclosures        | `ReferenceDetail`, demo/term components                        | Native disclosure marker/open states; HTTPS publication/mirror/index links with new-tab labels and page/version attribution.                                               |
| Sharing                         | `ShareLesson`                                                  | Idle/pending/copied/manual fallback, read-only selectable URL, no false success, stale async result invalidation and preserved reader focus.                               |
| Empty/recovery states           | `ControlExplorer`, `Glossary`                                  | Zero results, no selection, planned/unknown framework, invalid/unavailable lesson and clear/browse recovery actions.                                                       |
| Footer privacy                  | `UsagePreferences`, `UsageAnalytics`                           | Visible native disclosure indicator, production/development/browser-preference/unavailable/opted-out status, pause/allow and existing fail-closed safeguards.              |

## Responsive and visual hierarchy

```text
Global coded-C identity + familiar navigation
  → concise requirement-focused introduction
  → useful search/collection/framework choices
  → desktop: discovery | off-white reading workspace
     phone: reading + close actions; discovery expands on request
  → official quotation → perspective → supported teaching/practice
  → contextual vocabulary/source/review disclosures
  → searchable glossary and factual project/privacy context
```

Use the established 1100px/tablet, 760px/phone and 380px/narrow adjustments unless
an observed layout issue justifies a scoped change. Test 1440/1024/768/390/320px,
long titles and dense results, keyboard focus, 200% zoom and reduced motion.
Reading text should be at least 16px with comfortable line height and about 68ch
measure. Dark surrounding surfaces must not reduce contrast inside the reading
area. Body copy and requirement quotations do not get texture overlays.

Keep three perspective targets at least 48px high, selected state visible beyond
color, native radio/fieldset semantics and explicit correctness wording. Keep
logical headings, marked decorative SVGs, text equivalents and visible focus on
both dark and off-white surfaces. No browser accessibility certification is implied.

## Interaction-state design contract

| Feature         | Normal/success                                      | Loading/partial                                     | Empty/error                                                 | Recovery                                                                  |
| --------------- | --------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| Explorer        | Readable results, selected row and exact control    | Snapshot/draft labels and filter mismatch           | Zero results, invalid/unavailable identity, planned library | Named clear/browse/show-in-results actions; search or heading focus.      |
| Perspectives    | One clear selected tab and labeled reading panel    | Visible loading status                              | Failed import or missing exact draft                        | Preserve official text; existing reload action where supported.           |
| Sharing         | Text confirms completed copy only                   | Pending action disabled                             | Clipboard unavailable/denied                                | Read-only manual link; deliberate focus handling.                         |
| Knowledge check | Distinct selected choice and correctness wording    | Checking is deliberate; next disabled until checked | Incorrect answer has readable explanation                   | Retry, next, finish and reset; focus follows new prompt/completion.       |
| Vocabulary      | One contextual definition/native open glossary item | Unavailable referenced term is acknowledged         | Search has no matches                                       | Close/Escape returns focus; own clear-search action.                      |
| Privacy         | Explicit actual measurement status                  | Provider entitlement/data receipt unconfirmed       | Storage unavailable or browser preference pauses            | Existing pause/allow UI; browser privacy preference still takes priority. |

## Implementation and validation sequence

1. Record this inventory and selected identity, update active instructions and
   preserve historical docs. Keep the source-content summary unchanged.
2. Implement coded-C SVG assets, visible name/title/metadata and a shared token
   system; restyle every inventory row through existing components.
3. Strengthen quiz selection/feedback and diagrams with semantic state styling;
   keep progress, allowlisted analytics, native controls and shared links intact.
4. Run typechecking, lint, content/gstack checks, formatting, behavioral tests and
   build; fix demonstrated regressions. Hash unchanged content data as appropriate.
5. Inspect actual desktop/phone screens and the full browse → control → practice →
   feedback → term → navigation/Back flow. Check empty/error/loading variants,
   copy fallback, long content, keyboard/zoom, focus and small logo sizes.
6. Publish validated increments to one feature PR and verify each exact GitHub CI
   and Vercel preview. Include actual screenshots and this inventory-to-delivery
   mapping. Do not merge, change DNS, rename services or promote production.

Behavioral coverage already exists in `App.test.tsx`, the explorer-state/history
tests, `editorial-home`, `reference-catalog-ui`, `learning-tools`, `LearningPractice`,
`LevelOneLearning`, perspective/loading tests and analytics/privacy suites.
Change brand assertions deliberately; a visually plausible screenshot does not
replace those behavior checks. No tests are removed just to simplify the rebrand.

Failure risks are style-induced overflow/hidden controls, unreadable state contrast,
lost focus and accidentally changing an identity or analytics gate. Existing tests
exercise behavior; actual browser measurements cover the layout-specific risks.
The missing image limits reference fidelity, not source-content preservation.

## Workflow evidence and delivery mapping

See [the task-specific 58-skill accounting](../reviews/cipher-and-chalk-gstack-2026-10-14.md)
for actual runs, inspected instruction ranges and exact blocked gates. The planning
methodology is scoped/manual and does not constitute completed native CEO/Design/Eng
phases. The previously observed native Read/Write reviewer contract cannot be
satisfied by this host's shell/patch tools; implementation remains authorized by
the owner's complete redesign brief. No paid outside design voice, image service,
credential/session import or synchronization is substituted.

The [actual delivery and visual report](../reviews/cipher-and-chalk-ui-2026-10-14.md)
maps every inventory row above to its implemented change and verification. All
existing shell, homepage, discovery, reader, teaching, practice, disclosure,
sharing, glossary, privacy and recovery surfaces use the shared system. The
[desktop homepage](../screenshots/cipher-home-desktop.png),
[phone reader](../screenshots/cipher-reader-phone.png),
[question feedback](../screenshots/cipher-question-phone.png),
[200% CSS zoom](../screenshots/cipher-zoom-200.png) and
[small-size identity proof](../screenshots/cipher-logo-sizes.png) are representative
of 18 viewed captures. Some retained captures show unaffected earlier states;
final reader, question and zoom captures verify the last style repairs.

Actual Chromium checks passed nine journey groups and five synthetic recovery
groups. Normal journeys cover all three level totals, search/filter/control/mode
history, practice/retry/completion, diagrams, vocabulary, sources, glossary,
keyboard/focus, 320–1440px layouts and opt-out. Recovery fixtures explicitly held or
aborted the local teaching chunk and denied clipboard/history operations. Those
are local injected failures, not production incidents. CSS zoom was rendered
at 200%; narrow viewport reflow was checked independently. This is representative
coverage rather than exhaustive inspection of every reference/mode/browser pair.

Visual review fixed two real defects: perspective tabs clipping under zoom and
incorrect-answer styling overridden by the selected state. The inline-size reader
container and wrapping three-column tabs now respond to 440px reader width;
correct/incorrect checked-choice selectors now outweigh selection. All content,
source identities, history, analytics/privacy, package/lockfile, LICENSE and font
notices remain unchanged, except the archived project README display citation.
Its pinned source URL is retained. Qualified content approval is still pending.

Typecheck, lint, formatting, 280 Vitest tests in 23 files and production build
passed for the frozen frontend; content and workflow checks plus 6/16 Node
regressions passed at the implementation checkpoint. Final scoped adversarial
review reused only matching unchanged source hashes and re-read both polish files:
CSS `47865b5139cfe90cc4a9500ba56526be0f3f0c7803ecd0e2c4358c4f453eabe7`, lockup
`081266fe284daa6a03656b47e32f076b755896690b25e970f4abc00e44417f98`.
That independent voice found no actionable issue; it is not full native security
assessment or overall gstack review completion.

The owner merged initial PR #10 at `2026-10-14T00:42:22Z`; its tracked tree became
main `3817f3d62501ff1fc0e8a31191c537f7baccb7fb`. Refinements were preserved on the
fresh feature branch and pushed as [PR #11](https://github.com/WaylandP/cipher-and-chalk/pull/11),
open and draft with no auto-merge. GitHub CI and Vercel succeeded for
`75726def64038e5b061c148bec621ccf48956de4`. The immutable preview is
[the validated frontend deployment](https://dummy-down-l33cn6g04-waylandp.vercel.app);
the [branch preview](https://dummy-down-git-feat-cipher-and-chalk-polish-waylandp.vercel.app)
will follow later pushes. Verified HTTPS returned a 302 to Vercel sign-in;
protection was not bypassed, so hosted end-to-end inspection remains unverified.
No agent merged, changed DNS/service IDs or promoted production.

A bounded six-context local production benchmark compared the pre-redesign
`cf5ffd2` build with the frozen current build under matching Chromium settings.
Median FCP/LCP changed 244→256ms; stylesheet transfer grew 8,066→9,831 bytes,
a **21.9% warning (~1.8KB)**. Local TTFB changed 2.3→3.2ms, also a relative warning;
the 0.9ms difference is sensitive to localhost scheduling. These samples do not
measure field performance, INP/CLS, slower networks or real mobile hardware.
See the workflow record for raw/report locations and honest metric limits.

Final owner visual sign-off, comparison with the missing refined image if supplied,
real-learner feedback, screen-reader/Safari and a complete accessibility audit are
still separate review work. Native planning, formal QA materialization and trusted
CSO limitations remain explicit; app delivery does not erase their partial status.
