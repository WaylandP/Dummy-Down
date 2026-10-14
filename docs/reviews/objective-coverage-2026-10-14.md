# Assessment-objective coverage — Increment 3

Branch `feat/assessment-objective-coverage`, base `ef02c296337268a47c464d38a305e93570a0a984`.
PR #15 was merged with explicit owner approval on October 14, 2026. PR #16 contains this new
increment and remains unmerged. Scope follows the user's four-increment assignment.

## Engineering and design decisions

The coverage report answers: which exact source statements have a draft explanation,
where can I read it, and what remains unresolved? It is not an organizational
assessment, evidence collection tool, or compliance score.

Reuse the pinned source manifest, exact lesson identities, current perspectives,
existing practice activities and native page navigation. Import complete source
blocks, including ODP rows, then explicitly map individual labels to selected
teaching fields. Record the comparison date, AI reviewer, source digest and
per-control teaching fingerprint. Source quotes alone never count as explanation.
Keep qualified human status pending. The field comparison here is narrower than
the complete Level 2/3 editorial audit scheduled for Increment 4.

A separate `/coverage` page keeps this detail out of the reading workspace. It
uses the existing matte black, IBM Plex Sans, restrained ochre and spacing tokens.
Hierarchy: purpose and edition → counts/limits → search and filters → control
index → expandable source/explanation pairs. No dashboard charts, scores, badge
wall or new visual system. Each row links back to the exact lesson/perspective.
Long official statements wrap; details collapse dense material on small screens.
A useful empty state clears filters. Controls with unresolved wording stay visible.
Keyboard labels, focus, 320px reflow, reduced motion and normal-color axe are
browser checks, not claims of actual screen-reader/Safari validation.

Architecture: pinned PDFs → quoted statement inventory → explicit teaching mappings
→ coverage resolver → lazy report route. The largest source payload loads only
with the report. Counts derive from the resolved rows. Tests reject omissions,
duplicates, cross-control links, changed source/prose bindings and invalid practice
identities. New notes fill observed teaching gaps without mutating official quotes
or claiming every objective has a practice exercise. Privacy keeps raw search and
query strings out of telemetry; only the new public pathname joins the allowlist.

The narrow source validator reuses existing manifest/page verification. It compares
complete blocks and fails on changed layouts. No new dependencies or external
fetches are required. Current applicability remains blocked by the previously
recorded official-host access failures. No source edition is silently upgraded.

## Evidence and remaining work

- Independent fresh-PDF extraction by `/root/accuracy_audit` matches all **468**
  rows and citations: 459 lettered determinations and nine ODP statements.
- Existing source identities, quotes, thirteen previously quoted objectives and
  document hashes are preserved. Source inventory is not teaching coverage.
- All 468 selected statement-to-field/note relationships received coordinating and
  independent AI comparison. The final delta resolved seven findings across nine
  statements: **466 mapped, two unresolved, nine original notes in eight controls**.
  Thirteen existing scenario links are illustrative. See the
  [mapping record](../content-review/objective-mapping-2026-10-14.md).
- The lazy `/coverage` report, native search/filters, exact lesson links, recovery
  states and integrity gates are implemented. Independent engineering review
  identified and confirmed fixes for exact-control filter broadening and missing
  supplementary-note fingerprints. No remaining issue was found in its bounded
  delta check; this is not native CSO or qualified content approval.
- Source wording for `SI.L3-3.14.3e` requires qualified scoping review; preserve it.

## gstack scope

Pin `945ac301a91dff5db9fc1ddaea5b77828eeca2ed` / `1.91.97.0` verified; 58 canonical,
57 supported instructions, 28 sections. All canonical triggers are accounted for
below. The installed engineering/design planning, review/checklist, QA and
documentation guidance informs this scoped work. Shared instructions already
read during this assignment are reused.

**Adapted** is not a full native skill pass. Native checkpoint/ledger chains,
complete plan scorecards, outside-provider challenges, enforced hooks and ship
orchestration are not run. Native discovery is unverified; native CSO is blocked
by the absent trusted launcher. User-delegated routine implementation decisions
apply; no paid providers, cookie imports, tunnels, sync, accounts or new production
promotion are authorized. Bounded independent reviews are AI assistance, not
qualified human approval.

| Canonical skill       | Disposition for Increment 3                                                                                                                                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| gstack                | Adapted routing: evaluated all 58 canonical triggers for this fixed increment.                                                                                                                                                                                 |
| autoplan              | Not applicable: explicit four-increment plan; no product-scope expansion.                                                                                                                                                                                      |
| benchmark             | Adapted: initial JS 444.99 kB versus 443.15 kB base; roughly 152 kB coverage payload remains lazy. No broad performance benchmark.                                                                                                                             |
| benchmark-models      | Not applicable; paid/outside-provider comparison unauthorized.                                                                                                                                                                                                 |
| browse                | Adapted: isolated Chromium production-build flows and screenshots at 1440/768/390/320px; actual Safari/iOS and assistive-technology checks remain unavailable.                                                                                                 |
| canary                | Not applicable: no production rollout; preview status checked separately.                                                                                                                                                                                      |
| careful               | Not invoked: ordinary feature Git operations; explicitly approved PR #15 merge verified.                                                                                                                                                                       |
| claude-code           | Gated/not run: outside-provider reviews disabled.                                                                                                                                                                                                              |
| codex                 | Unsupported host wrapper; native independent agents were used directly.                                                                                                                                                                                        |
| context-restore       | Not applicable: no gstack saved checkpoint to restore.                                                                                                                                                                                                         |
| context-save          | Not applicable: durable handoff is this PR and report.                                                                                                                                                                                                         |
| cso                   | Blocked/not assessed: trusted installed launcher absent.                                                                                                                                                                                                       |
| design-consultation   | Not applicable: preserve existing brand and design.                                                                                                                                                                                                            |
| design-html           | Not applicable: no standalone design artifact requested.                                                                                                                                                                                                       |
| design-review         | Adapted: desktop/tablet/mobile screenshots, hierarchy, muted tokens, wrapping, navigation, empty/loading/error states and keyboard disclosures inspected; inherited filter margins corrected to align the desktop form. Native scoring/provider gates omitted. |
| design-shotgun        | Not applicable: no new design variants.                                                                                                                                                                                                                        |
| deslop-shared-libs    | Not applicable: no substantive duplicate-library extraction.                                                                                                                                                                                                   |
| devex-review          | Not applicable as broad DX audit; existing Vitest and GitHub reviewer workflow reused.                                                                                                                                                                         |
| diagram               | Not applicable: small engineering flow recorded inline, no diagram artifact.                                                                                                                                                                                   |
| document-generate     | Adapted: source inventory, objective mapping evidence and review-maintenance guidance created.                                                                                                                                                                 |
| document-release      | Adapted: roadmap/README/TODO/changelog/development/design/privacy/reviewer packet updated; only verified PR #15 merged tasks checked.                                                                                                                          |
| eval-plan             | Not applicable: no LLM application or evaluation.                                                                                                                                                                                                              |
| freeze                | Not applicable: no requested persistent scope lock.                                                                                                                                                                                                            |
| gstack-upgrade        | Gated/not run: exact pin must remain.                                                                                                                                                                                                                          |
| guard                 | Not applicable: no production/destructive workflow.                                                                                                                                                                                                            |
| health                | Not applicable as release-health workflow: local targeted checks and CI cover this feature PR.                                                                                                                                                                 |
| investigate           | Adapted: source wording conflict and missing explicit teaching details traced to pinned guide pages.                                                                                                                                                           |
| ios-clean             | Not applicable: no native iOS project.                                                                                                                                                                                                                         |
| ios-design-review     | Not applicable: web app, not SwiftUI; actual Safari/iOS validation remains pending.                                                                                                                                                                            |
| ios-fix               | Not applicable: no native iOS project.                                                                                                                                                                                                                         |
| ios-qa                | Not applicable: no DebugBridge/iOS runtime.                                                                                                                                                                                                                    |
| ios-sync              | Not applicable: no native iOS project.                                                                                                                                                                                                                         |
| land-and-deploy       | Native workflow not run; PR #15 merged with explicit approval. This increment requires new owner approval.                                                                                                                                                     |
| landing-report        | Not invoked: prior approved merge verified via GitHub; new PR handoff is review only.                                                                                                                                                                          |
| learn                 | Not applicable: no separate learning-store update needed.                                                                                                                                                                                                      |
| make-pdf              | Not applicable: no export requested.                                                                                                                                                                                                                           |
| office-hours          | Not applicable: requirements and audience are explicit; no new product discovery.                                                                                                                                                                              |
| open-gstack-browser   | Unavailable user-facing cloud browser; local Chromium automation available.                                                                                                                                                                                    |
| pair-agent            | Gated/not run: no remote browser sharing or tunnel authorized.                                                                                                                                                                                                 |
| plan-ceo-review       | Not applicable: fixed Phase 1/2 increments and explicit prohibition on scope expansion.                                                                                                                                                                        |
| plan-design-review    | Adapted scoped plan below; existing visual system retained. Native scorecard/mockup/provider gates not run.                                                                                                                                                    |
| plan-devex-review     | Not applicable: no new developer product/API.                                                                                                                                                                                                                  |
| plan-eng-review       | Adapted: edition/source/text bindings, explicit field mappings, fail-closed gaps, lazy data and navigation plan below.                                                                                                                                         |
| plan-tune             | Not applicable: no preference-profile change requested.                                                                                                                                                                                                        |
| qa                    | Adapted: full 50 browser tests passed; five focused coverage tests passed again after the final teaching changes. Source verification, 342 unit tests and integrity fixtures passed; exact final CI remains PR evidence.                                       |
| qa-only               | Not applicable as duplicate alternative; scoped QA includes repairs.                                                                                                                                                                                           |
| retro                 | Not applicable: no retrospective requested.                                                                                                                                                                                                                    |
| review                | Adapted: critical/informational diff check plus two bounded independent reviews; exact-control filtering and missing mapping fingerprint fixed. Semantic gaps repaired and delta-checked.                                                                      |
| scrape                | Not applicable: reuse verified pinned PDFs; current official-host access remains blocked as recorded in Increment 2.                                                                                                                                           |
| setup-browser-cookies | Gated/not run: personal-session import unauthorized.                                                                                                                                                                                                           |
| setup-deploy          | Not applicable: existing Git/Vercel preview integration retained.                                                                                                                                                                                              |
| setup-gbrain          | Gated/not run: no new memory/account integration authorized.                                                                                                                                                                                                   |
| ship                  | Native workflow incomplete; ordinary authorized feature-branch commit/push/PR/preview verification only.                                                                                                                                                       |
| skillify              | Not applicable: no scrape to codify.                                                                                                                                                                                                                           |
| spec                  | Not applicable: user supplied detailed assignment; no external issue filing.                                                                                                                                                                                   |
| sync-gbrain           | Gated/not run: no authorized sync integration.                                                                                                                                                                                                                 |
| test-audit            | Not applicable as suite-pruning workflow: no deletions; each new regression covers browser-only behavior.                                                                                                                                                      |
| unfreeze              | Not applicable: no active freeze to remove.                                                                                                                                                                                                                    |

## Validation and publication evidence

First progress commit `b7f0bf2c07423c5e0117d7bb8c8589c1a7ebfb48` imported source
statements and source integrity tests. Typecheck, content (6), gstack (16), lint,
formatting, 333 Vitest tests, production build and PDF verifier passed before push.
GitHub CI 38577684290 passed; Vercel deployment 7067634297 succeeded at
<https://cipherandchalk-k8an7f4cr-waylandp.vercel.app>. That checkpoint predates the UI.
The exact final commit/CI/preview are reported on PR #16, not guessed here.

Local full browser validation passed **50 tests** on the production build, covering
all existing pages plus coverage at 1440, 768, 640, 390 and 320px, normal-color axe,
keyboard pagination/disclosures, forced colors/reduced motion, exact control/mode
links, filtering, Back/Forward, empty recovery, invalid pagination and failed chunk
reload. A request observer confirms Home does not load the coverage chunk. The
last nine-statement mapping repair is followed by the five focused coverage browser
tests. No test threshold or existing assertion was weakened: two old assertions
were updated for the new mapped status and a real exact-control link assertion added.
Initial new browser test failures were incorrect test selectors/expected prose;
role-based selectors and the actual reviewed field text corrected them. The
independent exact-ID filter regression was separately reproduced and repaired.

Final local typecheck, content checks (6), gstack checks (16), lint, formatting,
**342 Vitest tests across 28 files**, build and source-specific comparison passed.
The source comparison independently agrees with all 468 rows and citations; changed
candidate omissions, duplicates, wording, pages and ODP labels do not match the
verified extraction. Resolver tests reject missing/orphan/duplicate mappings,
wrong editions/control/pages/practice references and unsupported fields. The
whole mapping digest additionally binds all authored notes and selections:
`00ea0e494f7e97089d4b328d833b51b0025404ed7ab8ed1bcba9fccc45cfc9d0`.

Security/privacy review: static React text rendering, argument-array Python
subprocesses, no new server/backend, raw HTML, dependency, secrets, accounts,
external collection event or visitor identifier. Only `/coverage` joins the
existing public-path telemetry allowlist; URL queries/fragments are stripped and
all existing production/opt-out/DNT/GPC gates remain. Tests exercise that new path.
No native CSO assurance or analytics-provider receipt is claimed.

Screenshots are in [the coverage evidence directory](../screenshots/objective-coverage/).
Viewport captures were checked for actual reading/focus placement. Existing design/fonts
remain; owner visual acceptance, real learners, real screen readers, native zoom
and Safari/iOS validation are still the documented external Phase 1 checks.

The complete Level 2/3 perspective audits remain Increment 4. Current official-host
verification, applicability and qualified interpretation of the two specialized-
asset statements are unresolved. Phase 1/2 are not declared complete. PR #15's two
engineering subtasks are checked only because its approved merge was verified;
this increment's merge milestone stays unchecked until owner approval and merge.

The final layout-only correction removes an inherited bottom margin from coverage
select fields and aligns them with the search input and submit button. All required
checks and the build passed again, followed by ten affected browser checks (five
coverage flows plus five viewport accessibility/reflow scans). A DOM geometry check
confirmed aligned desktop controls, and the screenshots were refreshed. The preceding
implementation commit `df15962` also passed GitHub CI `38580052700` and Vercel;
PR #16 records the exact final layout-commit deployment separately.
