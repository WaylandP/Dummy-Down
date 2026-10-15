# Developing Cipher & Chalk

Cipher & Chalk is an early educational application. Start by reading the project's
[mission and roadmap](../README.md). This frontend foundation provides a responsive
homepage, an initial Control Explorer, and Beginner, IT & Cybersecurity, and
Compliance & Assessment explanation modes for all 149 versioned CMMC references
and the original README-based example.

The example is an educational interpretation, not a complete official requirement
or reviewed assessment guide. The Explorer restores exact lessons and modes from
shareable addresses; a searchable glossary supplies 20 draft definitions. The
source collection contains all 149 identifiers in the September 2024 v2.13
snapshot, each with three original control-specific teaching perspectives. The
practice index contains 13 draft activities and 39 explained questions: the original
demo, six Level 1, three Level 2 and three Level 3 activities. Qualified human review and current applicability verification
remain pending. Accounts and a backend are outside this iteration.

## Page navigation

Home (`/`), Learn (`/learn`), Glossary (`/glossary`), Coverage (`/coverage`), Practice (`/practice`) and
About (`/about`) use native
links. `src/state/site-page.ts` resolves the page; only Learn mounts the Explorer
controller and control-view tracking. Existing root query links and historical
section hashes still resolve. The skip link canonicalizes legacy section paths.
`vercel.json` explicitly rewrites the six non-root paths to the Vite entry document,
so direct links and refreshes work on Vercel without rewriting asset URLs.

The Explorer continues to own query/history state. Native page changes reload the
document; practice is in memory by default, with optional version-bound local saving. Back restores the lesson
address, but do not promise that a browser preserves its quiz state across pages.
Inline definitions remain available without leaving a lesson. Analytics allowlists
only the seven public paths and strips queries/fragments before submission.

## Start locally

Install [Node.js](https://nodejs.org/) version **22.12 or newer**; Node 24 is the
version used in CI. npm ships with Node.js. Check your versions with:

```sh
node --version
npm --version
```

From the repository directory, install the exact dependencies recorded in
`package-lock.json` and start Vite:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Edits to source files appear in the browser
automatically. Use Ctrl+C in the terminal to stop the server.

For a cloud development environment that exposes a forwarded port, use:

```sh
npm run dev -- --host 0.0.0.0
```

Use port forwarding if your development environment supports it. Codex's environment
onboarding UI does not provide web previews; validate the app with local requests
and browser checks inside the machine instead. Exploring the learning content
requires no credentials or external service. Optional usage measurement uses
Vercel's production deployment category and Analytics service; see
[Usage measurement](USAGE.md) for setup, privacy and dashboard limits. Dependencies must be
available from the npm registry during installation.

## Understand the code

The [Board specification](design/THE_BOARD.md) is the visual direction; the
[design notes](DESIGN.md) say which parts of it are live. The app shell, tokens
and fonts follow the Board: Walter Turncoat for headings, Atkinson Hyperlegible
Next for reading and interface text, Martian Mono for code, all self-hosted from
`public/fonts/` without font packages. The
[study-desk checkpoint](https://github.com/WaylandP/cipher-and-chalk/blob/archive/ai-review-records/docs/reviews/study-desk-2026-10-14.md) records this revision;
the [earlier redesign inventory](https://github.com/WaylandP/cipher-and-chalk/blob/archive/ai-review-records/docs/designs/cipher-and-chalk.md) maps the existing UI
surfaces and states. Reuse shared visual tokens and semantic components;
`public/font-licenses/` retains distributed font licenses.
GitHub reports the externally renamed repository as `WaylandP/cipher-and-chalk`.
Package, deployment project, storage keys and stable content identities retain
their existing values; historical source URLs are preserved.

| Location                          | Purpose                                                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/main.tsx`                    | Mounts React into the HTML page.                                                                                                 |
| `src/App.tsx`                     | Assembles the page and coordinates the interactive experience.                                                                   |
| `src/components/`                 | Reusable interface pieces, including the Control Explorer.                                                                       |
| `src/components/board/`           | The Board shell: chalk filter and dust, the lockup, header with its find line, footer, the tray (the phone bar) and the keys.    |
| `src/components/Home.tsx`         | The question, the find line, the fourteen families and where the visitor left off.                                               |
| `src/components/control/`         | The control page: the decoded ID, the title and the Decode, Explain, Evidence, Practice and Related views.                       |
| `src/components/Glossary.tsx`     | Words: one letter at a time, four groupings and a search line; `glossary/groups.ts` derives the groups from sources.             |
| `src/types/content.ts`            | TypeScript definitions for frameworks, controls, learning modes, and content metadata.                                           |
| `src/data/frameworks.ts`          | Framework metadata, including supported versus planned status.                                                                   |
| `src/data/controls.ts`            | Educational control examples and learning-mode definitions.                                                                      |
| `src/data/control-search.ts`      | Shared search and filtering behavior.                                                                                            |
| `src/data/editions.ts`            | Project editorial editions and the explicit sample identity.                                                                     |
| `src/data/cmmc-references.ts`     | Attributed CMMC publication quotations with snapshot/page provenance.                                                            |
| `src/data/cmmc-perspectives.ts`   | Separately authored, edition-bound teaching drafts, loaded on demand.                                                            |
| `src/data/cmmc-clause-map.ts`     | The Decode view's clause map: which objectives each clause of a requirement sentence produces, read from the pinned text.        |
| `src/data/cmmc-rev3.ts`           | The Rev 3 view: each Level 2 control's NIST SP 800-171 Rev. 3 counterpart, verbatim and pinned, with one sentence on the change. |
| `src/analytics/`                  | Allowlisted usage events, production gating and visitor privacy preferences.                                                     |
| `src/data/learning.ts`            | Fictional scenarios and questions tied to an exact teaching identity.                                                            |
| `src/data/level-one-learning.ts`  | Three Level 1 draft activities, misunderstandings and accessible diagram data.                                                   |
| `src/data/expanded-learning.ts`   | Nine additional source-bound draft activities across three CMMC levels.                                                          |
| `src/components/PracticePage.tsx` | Searchable native-link practice index; derives levels from matched catalog entries.                                              |
| `src/data/glossary.ts`            | Draft definitions with source and review context.                                                                                |
| `src/data/level-one-glossary.ts`  | Fourteen sourced draft vocabulary additions.                                                                                     |
| `src/data/level-one-terms.ts`     | Contextual term links guarded by framework, edition and requirement identifier.                                                  |
| `src/types/review.ts`             | Separate source comparison, AI-assisted review and attributable human approval types.                                            |
| `src/data/level-one-review.ts`    | Fifteen publication-bound review records and scoped objective quotations.                                                        |
| `src/state/explorer-state.ts`     | Pure address parsing, exact resolution and navigation transitions.                                                               |
| `src/state/useExplorerState.ts`   | One browser-history controller mounted by App.                                                                                   |
| `src/styles.css`                  | Tailwind integration and shared visual styles.                                                                                   |
| `src/` test files                 | Behavioral checks for the user-facing experience.                                                                                |
| `vite.config.ts`                  | Vite development/build settings and Vitest test configuration.                                                                   |
| `.github/workflows/ci.yml`        | Runs automated checks on pull requests and changes to `main`.                                                                    |

React renders the interface from data and state. TypeScript catches inconsistent
data and component props before the app runs. Vite handles local development and
the production build. Tailwind supplies styling utilities while shared components
keep repeated interface patterns consistent.

Level 1 perspective edits also require substantive editorial re-review. The
[dated baseline](content-review/level-1-review-baseline.json) records a SHA-256 per
control, checked by `src/data/level-one-review.test.ts` during `npm test`. Follow
the [review workflow](content-review/QUALIFIED_REVIEW.md); do not simply refresh
hashes to bypass a stale-review failure. These fingerprints cover the three
perspectives, not activities or glossary definitions, and do not confer human approval.

The content model separates a framework's identity, edition, families, and control
identifiers from how the interface displays them. Learning modes are part of the
educational content, not a CMMC-specific UI rule. This allows future frameworks to
use the same explorer without pretending they have CMMC's levels or terminology.
Listed future frameworks are roadmap information; they are not searchable control
libraries yet.

Official source links, applicable versions, and review status travel with the
content. Source records distinguish project educational sources, official resource
indexes and official publications. The `readme-example` edition is a project
snapshot, not an official CMMC release.
The original demo control has `contentKind: 'educational-example'` and
`reviewStatus: 'draft'`. Its version context identifies the README's simplified
CMMC Level 2 example using a NIST SP 800-171 Rev. 2 identifier; it does not claim a
reviewed interpretation or automatically map to every current framework version.

A source link identifies the basis for an explanation; it does not make that
explanation official or reviewed. Keep draft status visible until a qualified review
has taken place, and consult the applicable authoritative publications when
assessing an organization's requirements.

## Lesson addresses and reading tools

Lessons use the composite `{frameworkId, editionId, controlKey}` identity. The
official identifier remains display/search data. For example:

```text
/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access&mode=compliance#explorer
```

Copy lesson link includes only that known lesson and learning mode. The app never
reads the clipboard. If writing is unavailable, it shows a labeled selectable
link; outdated asynchronous results do not report success for a different lesson.

Discovery state uses `view=discover` with optional `catalog`, `q`, `family`,
`level`, `mode` and `collection=references`. Home does not open or track a selected
lesson. Its native GET form submits to `/learn` with `view=discover`,
`collection=references`, `catalog=cmmc` and the encoded query `q`. An empty search
shows all references. The family links use `serializeExplorerSearch`; they
do not add a second history controller.

Home lists the fourteen control families from the catalog, each linking to
reference discovery filtered by `family`, and a bottom row that links to the
default lesson (`cmmc/cmmc-2-13-sep-2024/ac-l1-b-1-i`) as "Start here". When
optional saving is on, the control page records the control on screen under a
third key (`cipher-and-chalk:last-control:v1`, three bounded identifiers) and
Home shows it as "Last time" instead; the row never reads that key without the
consent marker, and deleting progress removes it. The bare `/learn` address
still uses the explicit default identity.

The source collection is inferred only for an exact known source identity on a
shared link; explicit `collection=lessons` remains authoritative on a mismatch.
Inside the Explorer, search updates the current history entry; deliberate selection,
filter and mode changes create entries. Back/Forward restores the entire address.
Search text appears in URLs and browser history: use generic learning topics and
keep organizational evidence and secrets out of it. No query content controls a
network destination or becomes rendered HTML.

Reference readers include an “On this page” outline for Source and Explain it.
Practice appears only when `findLearningActivity` resolves the full lesson identity.
`useId` supplies document-local fragment targets; these links move within the
current reader. Copy lesson link remains the stable control-and-mode address.
The outline does not record progress, and Home only reads it. Optional local saving
is described in [LOCAL_PROGRESS.md](LOCAL_PROGRESS.md).

Malformed, duplicate or partial lesson addresses remain explicit errors until
recovery. A well-formed missing identity never falls back to a different example.
An incoming lesson outside its discovery filters remains visible, with an action
to show it in results. Changing filters intentionally can clear the selection;
clearing filters keeps discovery until a reader chooses a result. Unsupported
mode/filter values normalize with visible notices. A browser that denies history
writes shows a message while the in-session experience remains usable.

Glossary search is independent of control search and is not persisted. Contextual
term definitions open one at a time inline without changing the lesson, mode,
filters or history. Close/Escape returns focus to the invoking button. All 20
terms are educational drafts, not approved or official definitions. The 14 new
terms cite precise snapshot guide pages; contextual links cover all 15 Level 1
entries and remain bound to that framework and edition.

## Source catalog and learning coverage

[Source provenance and verification](sources/cmmc-2-13-sep-2024.md) records four
September 2024 v2.13 public PDFs, pinned mirror URLs, SHA-256 values and extraction
rules. The catalog has 15 Level 1, 110 Level 2 and 24 Level 3 identifiers. Older
inventories and newer NIST editions are not silently substituted. Direct official-host access
was blocked in the research environment; the app presents a versioned snapshot,
not independently verified current applicability. Guide quotations match their
cited pages. Ten genuine model/guide wording differences remain separately visible.

The `CatalogControl` union distinguishes educational examples from source
references. Teaching drafts are stored separately and bound to framework,
publication edition and control ID; the same ID in another edition does not
borrow this content. All 149 entries have Beginner, IT & Cyber and Compliance
perspectives with a visible draft label. The
[earlier catalog-wide AI-assisted audit](https://github.com/WaylandP/cipher-and-chalk/blob/archive/ai-review-records/docs/designs/cmmc-perspectives-editorial-audit.md)
records source-supported corrections and content fingerprints; it is not
qualified human approval. Examples, discussion prompts and possible evidence do
not replace official assessment objectives.

The [focused Level 1 audit](content-review/level-1-audit-2026-10-13.md) compared all
15 controls' perspectives with 59 determination statements and made four
clarifications: public processing versus posting, person versus printer-device
authentication, disposal versus reuse, and publicly accessible facility areas.
`ControlEditorialReview` keeps pinned-source verification, dated AI-assisted
comparison and human approval separate. Each record includes publication edition,
document ID/hash, requirement section, PDF/printed pages and unresolved questions.
All 15 human approvals are pending; software tests cannot change that status.

`EditorialReviewContext` exposes these stages through a disclosure in each Level 1
source view. Only the three activities' controls quote determination statements:
six for `AC.L1-b.1.i`, five for `AC.L1-b.1.iv`, and two for `MP.L1-b.1.vii`.
These 13 attributed statements provide learning context; neither quoting them nor
comparing all 59 establishes complete objective-by-objective teaching coverage.
Other Level 1 records explicitly leave coverage unmapped. The
[editorial review process](content-review/REVIEW_PROCESS.md) describes evidence and
qualified approval requirements. Current official-host checks failed with proxy
CONNECT 403 before origin responses for 11 recorded DoD, FAR/CFR and NIST URLs;
current applicability remains unresolved.

The teaching collection is a separate dynamic-import chunk requested only when
a source control is opened. During loading or failure, the attributed requirement
and source links remain usable; the UI offers a page reload that preserves the
current lesson address. Retrying the same failed module import alone is unreliable
because browser module-load failures can be cached. Unknown
framework/edition coverage remains explicitly pending. Interactive practice is
available for twelve exact source identities and the original demo; the remaining
137 source entries do not claim it.

Discovery uses eight results per page
and follows a restored selection. Pagination stays local to the result list;
collection/query/family/level and selected identity remain in browser history.

`LearningPractice` matches the complete teaching identity. Its fictional scenario
and questions stay consistent across modes, explain both correct and incorrect
choices, and preserve reader progress during mode changes. Optional local saving
stores checked-choice identifiers only after opt-in; see [LOCAL_PROGRESS.md](LOCAL_PROGRESS.md).
Practice answers never enter URLs, the clipboard, analytics or server state. A completed activity is not a compliance grade.
The original three Level 1 activities add plain-English explanations, common misunderstandings
and `LearningDiagram` data. `LessonDiagram` renders ordered HTML steps and an
optional disposal/reuse branch, with a text equivalent. These structures can
coexist with the separate visual-explanation player. All activities
and diagrams remain drafts, with source context and explicit review limits.

The nine Phase 3 additions extend the same framework-independent model with explicit
content versions, learning goals and existing glossary IDs. Source-review fingerprints
in `docs/content-review/phase-3-activities-2026-10-14.json` bind each final draft and
its real source statements. Renew editorial comparison before updating those hashes.
The index uses native GET filters; analytics strips all queries, including practice
searches. No quiz answers are sent to analytics.

## Validate a change

Follow [CLAUDE.md](../CLAUDE.md) for feature branches, incremental validated pushes,
and GitHub/Vercel browser review.

Run these checks from the repository directory before opening a pull request:

```sh
npm run typecheck
npm run check:content
npm run lint
npm run format:check
npm test
npm run build
```

- **Typecheck** validates TypeScript without producing application files.
- **Lint** checks code conventions and common programming mistakes.
- **Content check** compares the README's snapshot inventory with catalog and
  perspective data, validates required source/teaching metadata, and runs mutation
  regression tests. It does not prove interpretation accuracy or human approval.
- **Formatting** checks consistent layout with Prettier. Run `npm run format` to
  apply it; LICENSE and dependency lockfiles are deliberately excluded.
- **Tests** exercise meaningful behavior, such as selecting a learning mode or
  finding a control. They are not a substitute for cybersecurity content review.
- **Build** runs typechecking, then creates the production frontend in the
  generated `dist/` directory. Running typecheck separately helps isolate failures.

To inspect the production build locally:

```sh
npm run preview
```

Open the URL printed by the preview server. Vite's development and preview servers
are development tools; publishing a production site is a separate deployment step.

Also review the page manually at narrow and wide widths. Use only the keyboard to
reach the explorer, search and filter controls, change learning modes, and follow
source links. Check visible focus, readable text, and useful empty-search results.
Automated checks do not prove complete accessibility or compliance accuracy.

### Browser regressions

`tests/browser/` uses Playwright and axe against the production build. It covers
rendered accessibility rules, responsive reflow and keyboard learning journeys
that jsdom cannot validate. The app and Vitest suite remain unchanged in scope.

```sh
npx playwright install chromium
npm run build
npm run test:browser
```

Linux machines missing browser libraries can use Playwright's documented
`npx playwright install --with-deps chromium` setup, as CI does. In this managed
cloud environment, use the existing Chromium without downloading another browser:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser
```

The runner starts and stops its own loopback preview on port 4178 and refuses to
reuse an unknown server. Build first; it tests `dist/`, not live source. Two workers
bound resource use, retries are disabled, and failures retain traces/screenshots
under ignored `test-results/` and an HTML report under `playwright-report/`.
No personal browser sessions or hosted accounts are used. Typechecking includes
the browser tests; CI runs them after the build. Test-only dependencies are not
imported by the application.

Page titles identify the page or selected control without including raw searches.
Legacy skip links focus the mounted main landmark; explicit result pagination
focuses the new first result, and opening browsing focuses its search. Checking
an answer focuses its explanation. Copy remains focusable while pending, with
`aria-disabled` plus an activation guard, so a rejected clipboard operation can
focus/select the fallback without taking focus from a reader who moved elsewhere.

Automated axe checks and Chromium media/viewport emulation cannot certify WCAG,
screen-reader usability, Safari/iOS or learner comprehension. Follow the
[acceptance checklist](testing/PHASE_1_ACCEPTANCE.md) for those sessions and the
[Phase 1 evidence report](https://github.com/WaylandP/cipher-and-chalk/blob/archive/ai-review-records/docs/reviews/phase-1-quality-2026-10-14.md) for exact limits.

## Dependencies and troubleshooting

Use `npm ci` when setting up an existing checkout. It uses the lockfile and fails
if the dependency manifest and lockfile disagree. For an intentional dependency
change, use `npm install`, commit both `package.json` and `package-lock.json`, and
explain the change in the pull request. Do not commit `node_modules/` or `dist/`.

If a command reports an unsupported Node version, upgrade Node and rerun `npm ci`.
If the default development port is occupied, Vite normally prints an available
alternative; use the actual URL in its output. If a test fails, read the failure
and reproduce the behavior before changing the expectation.

Never fix an installation problem by disabling TLS verification or bypassing
package integrity checks. Resolve the tool version, network, or certificate issue
instead.

## Assessment coverage maintenance

`src/data/cmmc-objectives.json` contains the complete pinned determination/ODP
inventory. `scripts/verify-cmmc-objectives.py` compares every row with the exact
PDFs after the existing source validator passes. See the
[inventory and normalization rules](sources/cmmc-objectives-2-13.md).

`src/data/cmmc-objective-mappings.json` selects exact teaching fields or original
supplementary notes for each statement. It records the edition, AI comparison
date/reviewer, source digest and each control's perspective digest. The coverage
test also binds the entire mapping payload: notes, selected fields, labels,
unresolved wording and practice links. Never update fingerprints merely to pass
CI. Compare the changed source/teaching/mapping semantics, record the findings and
review date, then update the reviewed bindings. Qualified human review stays pending
until a real reviewer follows the existing editorial workflow.

The resolver rejects missing/duplicate/cross-control mappings, invalid field names,
wrong source pages and cross-edition practice links. Inventory tests prevent a
statement and its mapping being deleted together without detection. Hashes establish
unchanged bytes, not correct interpretations. Mapping review is narrower than the
full three-perspective editorial audit recorded in Increment 4.

The lazy `/coverage` route loads the report dataset separately from Home and Learn.
Native GET forms preserve filters in browser history; exact known control IDs take
precedence over substring search. Pagination shows 15 controls and focuses the
results heading after navigation. Unknown controls/searches get a recovery action;
a failed report chunk can reload or return to lessons. No new dependencies, backend,
saved progress, analytics events or data collection permissions are introduced.

## Full-field editorial review maintenance

The [Level 2/3 audit](content-review/level-2-3-audit-2026-10-14.md) links each bounded
batch's per-control evidence. Every `reviewedFingerprint` binds the complete current
perspective object; `inputFingerprint` preserves the original reviewed version.
The accompanying objective fingerprint binds all attributed statement rows for
that control. These use SHA-256 of UTF-8 `JSON.stringify(parsedObject)`, retaining
object insertion order and array order; source formatting whitespace is excluded.
This differs from the older recursively sorted Level 1 fingerprint convention.

When editing teaching, compare every affected audience field, its complete guide
section and the existing objective mappings. Record source-supported findings,
actual reviewer/date, final disposition and unresolved questions, then update
both review bindings. Run `npm test` and the source validator when source inputs
change. A stale-review failure calls for semantic comparison, not automatic hash
regeneration. Exact field/statement/control inventories and guide section boundaries
are checked by `src/data/editorial-audit.test.ts`. The audit JSON is imported only
by tests, so detailed review history does not enlarge the browser bundle.

Keep qualified human status pending until the [review workflow](content-review/QUALIFIED_REVIEW.md)
records a real scoped decision. Neither CI nor an AI reviewer can grant that approval.

## Animated visual explanations

Three draft explanations use source-derived requirement quotations followed by
plain meaning, a fictional example and a takeaway. A small exact-identity index
supports discovery; `VisualLesson` loads the player and its CSS only after the
reader opens its disclosure. Closing it unmounts the player. `VisualExplanation`
uses requestAnimationFrame for a 40-second timeline, cancels frames on unmount,
pauses when the document is hidden and never autoplays. SVG paths teach a boundary,
factor distinctions and deployment routes; they add no external media request.

The four native stage buttons are a complete manual walkthrough. Reduced motion
disables playback and presents finished still diagrams; every stage's text and
diagram description is also in the transcript. Actual assistive-technology testing
and qualified content approval remain pending. The player sends no usage events
and does not store playback position. A failed chunk preserves the source and
perspectives and offers a full lesson reload.

## Deferred learning interface

`LearningRoute` loads the Explorer controller and UI when `/learn` or a legacy
learning address is opened. It preserves the exact query/hash, ignores an async
resolution after unmount, and offers a full-page reload when a module request fails.
Home does not mount a hidden Explorer or create a false control-view event.

The source/activity catalog still loads with Home, analytics allowlisting and local
progress validation. The route split reduces initial UI code; it does not make the
catalog lazy. A fresh-browser/static-import comparison is recorded in the Phase 3
execution log. Count every initial shared chunk when comparing payloads. Lesson
perspectives, coverage, Practice and the visual player retain their own loading
boundaries. The full walkthrough is in [PHASE_3_WALKTHROUGH.md](testing/PHASE_3_WALKTHROUGH.md).
