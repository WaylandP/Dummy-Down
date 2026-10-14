# Phase 1 technical quality — Increment 1

Scope: the four existing pages, Control Explorer and existing learning interfaces.
Base: `75db00a` (verified PR #13 merge). Branch: `feat/phase-one-quality`.
This report covers engineering validation and acceptance preparation, not human
acceptance, compliance-content approval or a completed Phase 1. See the
[eight-milestone audit](phase-1-2-milestone-audit-2026-10-14.md) for all open gates.

## Reproduced issues and repairs

| Issue                                                 | Cause and repair                                                                                                                                                                                | Regression evidence                                                                                                                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identical browser titles on every page                | Only static index title existed. Page and selected-control titles now follow navigation/history without raw query text.                                                                         | `accessibility.spec.ts`: page titles and 25 route/viewport cases. Title regression failed before the fix.                                                            |
| Legacy skip links return keyboard users to the header | Native navigation can resolve `#main` before React mounts it. Focus the mounted main on explicit `#main` entry.                                                                                 | Four legacy hashes tested. Glossary case failed before repair; independent browser recheck passed all four.                                                          |
| Pagination leaves new results behind the cursor       | Focus stayed on the bottom paginator. Explicit page changes now focus the first new result, preserving count/status.                                                                            | `keyboard.spec.ts`: next and previous pages; failed before repair.                                                                                                   |
| Checking an answer loses visible focus                | The focused check button becomes disabled. Move focus to the explanation; subsequent Tab reaches Try again.                                                                                     | Keyboard check/retry regression failed before repair; complete activity flow also tested.                                                                            |
| Delayed clipboard rejection misses focused fallback   | Native disabled state loses button focus, defeating the existing focus guard. Keep pending button focusable with `aria-disabled`; existing synchronous pending guard prevents duplicate writes. | Delayed rejection regression failed before repair. Existing double-click unit assertion retained; independent check confirmed no focus theft after moving elsewhere. |
| Reopening browsing skips newly visible search         | Search is before the disclosure toggle in DOM order. Focus the exposed search when browsing opens.                                                                                              | Mobile keyboard regression failed before repair; next Tab reaches collection selector.                                                                               |

Changes stay in existing components. No educational text, source IDs, share-link
schema, privacy collection rules, license, branding or future-phase features were
changed. No qualified content review is implied.

## Technical validation

Environment: Node 24; local Chromium `154.0.8037.57`, isolated contexts, no imported
cookies. New development-only tools: Playwright `1.64.1`, axe Playwright `4.13.0`
(locked by `package-lock.json`). Browser regressions serve the production build on
an owned loopback port, not a live account or production site.

- **Layout and semantics:** Home, discovery, Glossary, About and the Level 1
  authorized-access reader at 1440, 768, 640, 390 and 320 CSS pixels. Tests assert
  no document horizontal overflow, one h1, useful titles and no unhandled page
  exceptions. Twenty-five normal-color axe scans retain all selected WCAG A/AA
  and best-practice rules, including contrast. A separate expanded-quiz scan covers
  radios and feedback. Passing automated rules are not a conformance certification.
- **Keyboard and navigation:** explicit focus destinations above; perspective
  arrows/Home/End; original source/draft labels; result filters and clear/recovery;
  glossary recovery; direct links, reload and Back/Forward; practice selection
  across mode changes, retry, completion and restart. Independent Chromium review
  also checked contextual definition Escape and canonical skip links.
- **Failure recovery:** intentionally blocked teaching chunk leaves the attributed
  requirement readable; reload after unblocking restores the same control. Invalid
  lesson addresses remain explicit until recovery. Clipboard denial uses a
  synthetic isolated browser fixture; no real clipboard contents are read.
- **Reduced motion / forced colors:** Chromium media emulation at 320px retains
  tab selection, focus, feedback and reflow. Scroll behavior is `auto`. An axe
  limitation is handled narrowly, as detailed below. Actual OS and screen-reader
  experience remain manual work.
- **Visual inspection:** unchanged blackboard structure inspected at desktop and
  narrow mobile sizes. Search and main learning paths remain distinct, text wraps,
  and the supplied mark, fonts and muted palette remain. This is an agent review,
  not owner visual sign-off or measured comfort.

### Test limitations and diagnostic corrections

The initial browser harness used `browser.newPage`; axe requires an explicit
context, so the harness was corrected before the baseline. The pagination test
initially compared `innerText` line breaks with `textContent`; it now asserts the
visible control identifier and focus in both directions, rather than whitespace.

With forced colors active, axe 4.13 reported authored chalk `#deded7` against a
forced white canvas (1.35:1), while Chromium's computed body/feedback text and
the inspected screenshot showed **black on white**. Moving emulation to the
context did not resolve the scanner mismatch. Only that forced-color scan disables
axe's `color-contrast` rule and asserts actual computed canvas/text/feedback colors
instead. All 26 normal-color scans keep contrast enabled. An independent reviewer
inspected this narrow exception; it is not comprehensive forced-color contrast
validation. No application colors were changed to satisfy the scanner.

640px and 320px checks provide reflow evidence equivalent in width to a 1280px
window at 200% and 400%; they are **not actual browser-zoom tests**. A local
headless extension attempt to use Chromium's native zoom API failed to start a
service worker, including one retry removing Playwright's extension-disable flag.
No zoom result was obtained. The acceptance checklist retains actual 200%/400%
zoom as unchecked work.

No Orca, NVDA, JAWS, VoiceOver, Mac/Safari or iOS device was available in this
environment. DOM/axe/Chromium checks do not stand in for those environments.
No real learner feedback was collected. Official-host access and content review
belong to later increments; historical source failures were not reclassified.

## Validation commands and review

Required publication checks: `npm run typecheck`, `npm run check:content`,
`npm run check:gstack`, `npm run lint`, `npm run format:check`, `npm test`,
`npm run build`, and `npm run test:browser` with the documented cloud Chromium
path. The PR records final command outcomes, commit SHA, CI and exact Vercel
preview. CI now runs browser checks after the build. A deployment status does not
establish authenticated inspection of a protected preview.

Local final results: all required checks passed; **313 Vitest tests in 26 files**,
**40 Playwright browser tests**, six content-validator tests and 16 gstack-validator
tests. The 40-test browser run finished in 37.9 seconds with zero retries. Nine
changed/new Markdown documents had no missing local link targets; the scoped
skill table contains all 58 canonical entries. CI and hosting are separate checks
reported on the PR for its exact commit.

Independent reviewers: `/root/phase_milestone_audit` read the eight milestones and
content evidence; `/root/phase_one_review` reproduced five focus issues, rechecked
their fixes and reviewed application/tests/CI/docs against the base. Its final
adapted checklist review found no substantive regression. These are AI reviews,
not people or credentials. There were no nested reviewer trees.

Security/privacy assessment was limited to changed paths: titles use controlled
content, never search input; no new HTML injection or network destinations; copy
guard still prevents concurrent writes and respects moved focus; browser tooling
stays in devDependencies; CI retains read-only repository permissions and no
persisted checkout credentials. Existing privacy/content/state tests remain.
Native gstack CSO is **not assessed**: its required trusted launcher is absent.
This ordinary diff review is not relabeled as a CSO security audit.

## gstack applicability and execution record

Pin: `945ac301a91dff5db9fc1ddaea5b77828eeca2ed`, version `1.91.97.0`.
Installed check found 58 canonical skills, 57 supported mappings and 28 sections;
native skill discovery remains unverified. QA startup reported telemetry, updates
and artifact sync off. Browser readiness launched actual Chromium successfully.
Aside is unavailable on this Linux environment; no personal sessions were used.

The actual installed QA instructions and scope/browser/bootstrap/exploratory/
verification/methodology sections, engineering review sections, design review
techniques, investigation instructions, code-review checklist, documentation
workflows, browser fallback and ship gates informed this increment. The user's
explicit scope/implementation authority governs routine decisions and publication.

**Adapted** below means the named scoped work was done and is evidenced above or
in the milestone audit. It does **not** claim a full native skill pass: the native
per-probe deadline/checkpoint chain, exhaustive review ledgers, outside-provider
challenge, scorecards and full ship orchestration were not executed. QA used
repeatable Playwright/axe and bounded independent browser review. Native gates
remain unverified/incomplete; installation and instruction reads are not execution.
No extra providers, accounts, tunnels, cookies, upgrades or production actions were
enabled to make the table appear complete.

| Canonical skill       | Disposition for Increment 1                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| gstack                | Adapted routing: evaluated this full inventory and selected scoped workflows.                                     |
| autoplan              | Not applicable: explicit four-increment plan; no product-scope expansion.                                         |
| benchmark             | Not applicable: no performance feature or new production dependency; build inspected.                             |
| benchmark-models      | Not applicable; paid/outside-provider comparison unauthorized.                                                    |
| browse                | Adapted: actual isolated Chromium flows, screenshots and production-build tests.                                  |
| canary                | Not applicable: no production rollout; preview status checked separately.                                         |
| careful               | Not applicable: no destructive operations.                                                                        |
| claude-code           | Gated/not run: outside-provider reviews disabled.                                                                 |
| codex                 | Unsupported host wrapper; native independent agents were used directly.                                           |
| context-restore       | Not applicable: no gstack saved checkpoint to restore.                                                            |
| context-save          | Not applicable: durable handoff is this PR and report.                                                            |
| cso                   | Blocked/not assessed: trusted installed launcher absent.                                                          |
| design-consultation   | Not applicable: preserve existing brand and design.                                                               |
| design-html           | Not applicable: no standalone design artifact requested.                                                          |
| design-review         | Adapted: hierarchy, reflow, focus/interaction and unchanged visual direction inspected.                           |
| design-shotgun        | Not applicable: no new design variants.                                                                           |
| deslop-shared-libs    | Not applicable: no substantive duplicate-library extraction.                                                      |
| devex-review          | Not applicable as full DX audit: bounded browser command instructions checked directly.                           |
| diagram               | Not applicable: small engineering flow recorded inline, no diagram artifact.                                      |
| document-generate     | Adapted: source-backed acceptance checklist, audit and technical report; linked from existing docs.               |
| document-release      | Adapted: README/roadmap/TODO/changelog/development/design consistency and link checks.                            |
| eval-plan             | Not applicable: no LLM application or evaluation.                                                                 |
| freeze                | Not applicable: no requested persistent scope lock.                                                               |
| gstack-upgrade        | Gated/not run: exact pin must remain.                                                                             |
| guard                 | Not applicable: no production/destructive workflow.                                                               |
| health                | Not applicable as release-health workflow: local targeted checks and CI cover this feature PR.                    |
| investigate           | Adapted: reproduced causes before focused repairs; failing browser regressions retained then passed.              |
| ios-clean             | Not applicable: no native iOS project.                                                                            |
| ios-design-review     | Not applicable: web app, not SwiftUI; actual Safari/iOS validation remains pending.                               |
| ios-fix               | Not applicable: no native iOS project.                                                                            |
| ios-qa                | Not applicable: no DebugBridge/iOS runtime.                                                                       |
| ios-sync              | Not applicable: no native iOS project.                                                                            |
| land-and-deploy       | Gated/not run: owner merge approval required.                                                                     |
| landing-report        | Not applicable: no landing request; PR is the review handoff.                                                     |
| learn                 | Not applicable: no separate learning-store update needed.                                                         |
| make-pdf              | Not applicable: no export requested.                                                                              |
| office-hours          | Not applicable: requirements and audience are explicit; no new product discovery.                                 |
| open-gstack-browser   | Blocked/not used: no user-visible cloud browser surface; isolated automation available.                           |
| pair-agent            | Gated/not run: no remote browser sharing or tunnel authorized.                                                    |
| plan-ceo-review       | Not applicable: user fixed scope and prohibited Phase 3/4 expansion.                                              |
| plan-design-review    | Not applicable: no new visual plan; current UI inspected during QA.                                               |
| plan-devex-review     | Not applicable: no new developer product/API.                                                                     |
| plan-eng-review       | Adapted: eight-milestone acceptance audit, existing architecture, failure paths, tests and dev-only dependencies. |
| plan-tune             | Not applicable: no preference-profile change requested.                                                           |
| qa                    | Adapted: baseline, reproduced defects, focused fixes, regression/recovery tests; manual gaps retained.            |
| qa-only               | Not applicable as duplicate alternative; QA includes fixes.                                                       |
| retro                 | Not applicable: no retrospective requested.                                                                       |
| review                | Adapted: changed-path two-pass checklist and independent final diff/browser review.                               |
| scrape                | Not applicable: official-source research reserved for Increment 2.                                                |
| setup-browser-cookies | Gated/not run: personal-session import unauthorized.                                                              |
| setup-deploy          | Not applicable: existing Git/Vercel preview integration retained.                                                 |
| setup-gbrain          | Gated/not run: no new memory/account integration authorized.                                                      |
| ship                  | Native workflow incomplete; ordinary authorized feature-branch commit/push/PR/preview verification only.          |
| skillify              | Not applicable: no scrape to codify.                                                                              |
| spec                  | Not applicable: user supplied detailed assignment; no external issue filing.                                      |
| sync-gbrain           | Gated/not run: no authorized sync integration.                                                                    |
| test-audit            | Not applicable as suite-pruning workflow: no deletions; each new regression covers browser-only behavior.         |
| unfreeze              | Not applicable: no active freeze to remove.                                                                       |

## Human handoff

Use the [acceptance checklist](../testing/PHASE_1_ACCEPTANCE.md) on the exact PR
preview. No human result, accessibility certification, release or content approval
is claimed. The original Phase 1 milestone was split to recognize implementation
already merged in PR #12; new validation/repair subtasks stay unchecked until this
increment is approved and merged. Phase 2's six open tasks remain unchecked.
After verified merge, start Increment 2 from updated main; do not implement later
increments or merge this PR without the owner's approval.
