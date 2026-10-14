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
snapshot, each with three original control-specific teaching perspectives. Three
Level 1 draft activities cover authorized access, public information and media
disposal; together with the original demo, there are four activities and 12
explained questions. Qualified human review and current applicability verification
remain pending. Accounts and a backend are outside this iteration.

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

The [design notes](DESIGN.md) describe the authorized Decode Board identity:
evergreen/slate teaching surfaces, comfortable off-white reading areas and a
geometric coded-C mark. The [redesign inventory](designs/cipher-and-chalk.md)
maps every existing UI surface and state to validation. Reuse shared visual tokens
and semantic components; `public/font-licenses/` retains distributed font licenses.
GitHub reports the externally renamed repository as `WaylandP/cipher-and-chalk`.
Package, deployment project, storage keys and stable content identities retain
their existing values; historical source URLs are preserved.

| Location                         | Purpose                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| `src/main.tsx`                   | Mounts React into the HTML page.                                                       |
| `src/App.tsx`                    | Assembles the page and coordinates the interactive experience.                         |
| `src/components/`                | Reusable interface pieces, including the Control Explorer.                             |
| `src/types/content.ts`           | TypeScript definitions for frameworks, controls, learning modes, and content metadata. |
| `src/data/frameworks.ts`         | Framework metadata, including supported versus planned status.                         |
| `src/data/controls.ts`           | Educational control examples and learning-mode definitions.                            |
| `src/data/control-search.ts`     | Shared search and filtering behavior.                                                  |
| `src/data/editions.ts`           | Project editorial editions and the explicit sample identity.                           |
| `src/data/cmmc-references.ts`    | Attributed CMMC publication quotations with snapshot/page provenance.                  |
| `src/data/cmmc-perspectives.ts`  | Separately authored, edition-bound teaching drafts, loaded on demand.                  |
| `src/analytics/`                 | Allowlisted usage events, production gating and visitor privacy preferences.           |
| `src/data/learning.ts`           | Fictional scenarios and questions tied to an exact teaching identity.                  |
| `src/data/level-one-learning.ts` | Three Level 1 draft activities, misunderstandings and accessible diagram data.         |
| `src/data/glossary.ts`           | Draft definitions with source and review context.                                      |
| `src/data/level-one-glossary.ts` | Fourteen sourced draft vocabulary additions.                                           |
| `src/data/level-one-terms.ts`    | Contextual term links guarded by framework, edition and requirement identifier.        |
| `src/types/review.ts`            | Separate source comparison, AI-assisted review and attributable human approval types.  |
| `src/data/level-one-review.ts`   | Fifteen publication-bound review records and scoped objective quotations.              |
| `src/state/explorer-state.ts`    | Pure address parsing, exact resolution and navigation transitions.                     |
| `src/state/useExplorerState.ts`  | One browser-history controller mounted by App.                                         |
| `src/styles.css`                 | Tailwind integration and shared visual styles.                                         |
| `src/` test files                | Behavioral checks for the user-facing experience.                                      |
| `vite.config.ts`                 | Vite development/build settings and Vitest test configuration.                         |
| `.github/workflows/ci.yml`       | Runs automated checks on pull requests and changes to `main`.                          |

React renders the interface from data and state. TypeScript catches inconsistent
data and component props before the app runs. Vite handles local development and
the production build. Tailwind supplies styling utilities while shared components
keep repeated interface patterns consistent.

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
`level`, `mode` and `collection=references`. The homepage starts with the explicit Level 1 source identity
`cmmc/cmmc-2-13-sep-2024/ac-l1-b-1-i` and the full source collection. The original
demo remains available through its existing address and the Demo lesson collection.
The source collection is inferred only for an exact known source identity on a
shared link; explicit `collection=lessons` remains authoritative on a mismatch. Search updates the current history entry; deliberate selection,
filter and mode changes create entries. Back/Forward restores the entire address.
Search text appears in URLs and browser history: use generic learning topics and
keep organizational evidence and secrets out of it. No query content controls a
network destination or becomes rendered HTML.

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
[earlier catalog-wide AI-assisted audit](designs/cmmc-perspectives-editorial-audit.md)
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
available for three exact Level 1 identities and the original demo; the remaining
146 source entries do not claim it.

Discovery uses eight results per page
and follows a restored selection. Pagination stays local to the result list;
collection/query/family/level and selected identity remain in browser history.

`LearningPractice` matches the complete teaching identity. Its fictional scenario
and questions stay consistent across modes, explain both correct and incorrect
choices, and preserve reader progress during mode changes. They never write URL,
clipboard, storage or server state. A completed activity is not a compliance grade.
The three new activities add plain-English explanations, common misunderstandings
and `LearningDiagram` data. `LessonDiagram` renders ordered HTML steps and an
optional disposal/reuse branch, with a text equivalent. These structures can
support future animation, but no animation system is implemented. All activities
and diagrams remain drafts, with source context and explicit review limits.

## Validate a change

Follow [AGENTS.md](../AGENTS.md) for feature branches, incremental validated pushes,
and GitHub/Vercel browser review. The [gstack guide](GSTACK.md) covers the optional
project-local Codex skills and their current compatibility limits.

Run these checks from the repository directory before opening a pull request:

```sh
npm run typecheck
npm run check:content
npm run check:gstack
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
- **gstack check** validates the pinned inventory, dated accounting record and Node
  regression fixtures. It needs no gstack installation or paid provider in CI;
  it does not prove that the recorded reviews occurred or were good reviews.
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
