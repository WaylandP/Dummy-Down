# Developer experience and code health catch-up

Reviewed October 13, 2026, on `chore/gstack-coverage-audit`, from commit
`a02508db1ac0667e10963d10ae7141f8bc71f167` plus the current workflow overlay.
Application behavior comes from main `8b061a65065ae3426455c758ccffb11ad6921453`.
The full installed `devex-review` and `health` instructions were read at gstack
pin `945ac301a91dff5db9fc1ddaea5b77828eeca2ed`, including browser fallback,
conditional steps and each applicable Hall of Fame pass. Instructions were read
with filesystem shell tools; native slash invocation or refreshed skill discovery
is not claimed.

## Developer experience: useful checks, incomplete hosted documentation audit

**Status: partial.** The isolated app, contributor commands, source documentation,
GitHub metadata and fresh Codex generation were tested. GitHub's rendered
documentation browser flow was blocked by `net::ERR_CERT_AUTHORITY_INVALID` in
the cloud browser/proxy. TLS verification was preserved. Local Markdown pages
are a partial fallback, not a claim that the GitHub documentation UI was audited.

The actual startup reported protocol 1, `SESSION_KIND: interactive`, telemetry
off, updates off and artifact sync off. Aside was unavailable on Linux. The
compiled gstack browser was used with its own ignored state directory, without
personal cookies, credentials or another worker's tabs. Screenshots were captured
and visually inspected. Its daemon and the isolated Vite server were stopped
after the checks; the application's existing server was preserved.

There was no prior plan-review score in `gstack-review-read`, so no plan-versus-live
score or delta is invented. The following scores are judgments against the
installed calibration rubric, with evidence limits stated per dimension.

| Dimension             | Score | Evidence and limit                                                                                                                                                                                                                                                                                                                             |
| --------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Getting started       |  8/10 | **TESTED, cached environment:** an isolated source copy installed 255 locked packages in four seconds with lifecycle scripts disabled. Vite became ready in 289 ms; Chromium displayed the app 48.308 seconds after the timed setup start. This includes workflow overhead and is not a cold clone/network benchmark.                          |
| API/CLI/SDK           |  7/10 | **PARTIAL:** Vite `--help` describes host, port, build and preview commands. The internal gstack checker rejected `--bad-flag` explicitly. This application is not a public CLI, SDK or API product; no nonexistent developer API was scored as implemented.                                                                                   |
| Error messages        |  7/10 | **TESTED:** an unknown edition/control shows “This lesson isn’t available here,” an explanation and a recovery action. A dedicated element screenshot captures it. GitHub's certificate error is an environment limitation, not an application failure.                                                                                        |
| Documentation         |  7/10 | **PARTIAL:** README, CONTRIBUTING and DEVELOPMENT describe setup, identities, tests, privacy, content limits and contribution safeguards. Local browser/source lookups found setup and lesson-address sections. There is no dedicated developer-doc search or language-switcher UI; the actual GitHub rendered navigation could not be tested. |
| Upgrade path          |  6/10 | **INFERRED:** locked packages, stable edition identities and exact gstack pin are documented. No app CHANGELOG or release migration guide exists for this early private `0.1.0` frontend. No upgrade was performed.                                                                                                                            |
| Developer environment |  8/10 | **TESTED/PARTIAL:** isolated locked install, Vite startup, production build, real project checks and scratch official Codex generation ran. Full fresh installer registration was not run because it writes outside project scope.                                                                                                             |
| Community             |  6/10 | **PARTIAL:** contribution and problem-report links exist; authenticated GitHub GET returned no non-PR issues. Contributor guidance exists. No response-time conclusion is possible from an empty issue history; external community sessions were not opened.                                                                                   |
| DX measurement        |  5/10 | **INFERRED:** GitHub issue reporting is available; no issue templates or dedicated developer-feedback measurement were found. App analytics activation/data receipt remains unconfirmed and is not documentation analytics.                                                                                                                    |

The eight-dimension average is **6.8/10 with partial coverage**, not a full pass.
The hosted-documentation browser steps remain blocked. The project's declared
purpose and size do not justify manufacturing an API playground, signup flow,
language switcher or new measurement service to satisfy a vendor comparison.

## Findings and resolution

1. **Resolved:** the newly required `npm run check:gstack` was missing from
   README, CONTRIBUTING and DEVELOPMENT validation checklists. The coordinator
   added the command and its scope to all three; live file searches verified the
   correction. The isolated copy intentionally retains the earlier snapshot.
2. **Supporting-file repair independently confirmed:** official fresh Codex
   generation produced all **57 supported instruction files and 28 sections**,
   and the functional QA template. It omitted the browser `qa-report-template.md`
   required by report-only browser QA. The coordinator's private project QA
   overlay supplies the pinned canonical template; the installed checker passed.
   Generating instruction files is not installing every runtime or enforcing
   native hooks.
3. **Blocked:** the actual GitHub browser page displayed
   `NET::ERR_CERT_AUTHORITY_INVALID`. No certificate bypass, cookie import or
   account access was attempted. The API and local app checks remain useful,
   separate evidence.

Fresh generation used the pinned official generator with `--host codex`,
`--model gpt-6-astra`, `--out-dir` and a scratch `--install-root` under ignored
project state. It did not run global registration, change HOME/CODEX_HOME, edit
upstream, install another provider or enable paid reviews. End-to-end fresh
official installer registration and current-session native discovery remain
unverified.

Private evidence is in `.gstack/devex-pinned-inventory/`: the first-render and
certificate-error screenshots, the unavailable-lesson element screenshot,
local Markdown captures, measured setup timestamps, generator log/output and
source fingerprints. These ignored replay files are not public GitHub artifacts.
The review log retained `issues_open` and `status_source: claimed`; its ledger
write is not an independent sealed review. The readiness dashboard has no fresh
engineering-clearance evidence, and this DX run does not supply it. No active
plan file was supplied for this live audit, so no other worker's plan was edited.

## Health: all available tools, partial category coverage

The complete installed health workflow ran after the DX stage. There was no
configured `Health Stack`; the existing package scripts were used. The owner had
delegated routine choices, so option C—run without persisting stack settings—was
chosen. The actual startup still reported interactive mode; no spawned gate is
claimed. No global settings or new health dependencies were installed.

Each tool ran sequentially in an independent invocation. Complete stdout/stderr,
actual checker exit code, duration and counts were captured in private logs;
parsing and displayed tails did not replace the checker's exit status.

| Category          | Command/tool        | Score | Actual result                                                     | Duration |
| ----------------- | ------------------- | ----: | ----------------------------------------------------------------- | -------: |
| Type checking     | `npm run typecheck` | 10/10 | Exit 0; zero TypeScript errors                                    |  2.741 s |
| Lint              | `npm run lint`      | 10/10 | Exit 0; zero lint findings                                        |  3.237 s |
| Application tests | `npm run test`      | 10/10 | Exit 0; **278 passed in 23 files**                                | 15.057 s |
| Dead code         | Knip                |   N/A | Absent from PATH and local dependencies; skipped before execution |        — |
| Shell lint        | ShellCheck          |   N/A | Absent from PATH and local dependencies; skipped before execution |        — |
| GBrain            | GBrain              |   N/A | CLI absent; no account/config access or integration attempted     |        — |

The weighted score, computed from the pinned 22%/18%/28% category weights and
redistributing only unavailable-category weights, is **10.0/10 — partial
coverage, 3/6 categories checked**. Total tool time was **21.035 seconds**.
This is not a security, accessibility, content-accuracy or native-discovery score.

A first project-only history row was appended under
`.gstack/state/projects/WaylandP-Dummy-Down/health-history.jsonl`, with unavailable
categories recorded as `null`. There is no previous trend data. Future score
deltas require identical category coverage. There were no scored-category
deficits to recommend fixing; missing tools remain documented coverage limits.
No code or tests were changed by health.

Separate supplemental installed/upstream verification passed after the QA repair.
During the coordinator's in-progress evidence update, `npm run check:gstack`
correctly rejected a completed row missing an explicit evidence reference. That
temporary record failure is preserved rather than mislabeled as a successful
health-category check. The coordinator owns the final coverage-record validation
before publication.

Both workflows preserve the distinction between source checking, AI-assisted
review and qualified human content approval. Qualified approval and current
regulatory applicability are still pending. Outside reviews, transcript uploads,
artifact synchronization, merges and production promotion were not performed.

## Bootstrap review and local performance follow-up

The bounded two-pass workflow review reproduced two bootstrap defects: a complete
QA overlay was incorrectly rejected after the official installer relinked it,
and a broad reinstall could repoint a user-owned skill symlink. The coordinator
fixed both with a project-local ownership preflight and a byte-verified QA overlay
repair. The second pass found no further actionable defect in those repairs;
**15 isolated Node regression tests passed**, together with installed/upstream
validation of 57 instructions and 28 lazy sections. Independent additional
fixtures verified altered browser-template preservation and dangling foreign-link
preservation. The original checker portions were self-reviewed, and this is not
a claim that the coordinator's mandatory functional and adversarial review gates
were completed by this worker. Evidence: `/tmp/dummy-down-gstack-workflow-review.md`.

The actual installed read-only benchmark ran against three explicit pages on
`localhost:5173` using an isolated Chromium state file. Each reported
sample used a fresh browser context with a warmed Vite development server. FCP
and LCP were **468–544 ms**, with 56–57 requests and approximately **10.1 MB**
transferred per page. Development JS, transfer and request counts exceeded the
skill's budgets; the resulting development-only grade was **C**, 3/6 budgets
below their limits. Vite serves unbundled development modules, so these numbers
do not establish a production bundle problem or regression. Separate warmed
captures show why cached transfer bytes cannot substitute for bundle size.

No baseline exists and none was overwritten. The required report and raw entries
are in `.gstack/benchmark-reports/2026-10-13-benchmark.{md,json}`, with browser
evidence under `.gstack/benchmark-pinned-inventory/`. Production performance needs
a preview-deployment baseline under comparable network conditions. The browser
daemon was stopped; no application changes or optimization were made.

An initial design-review attempt stopped at its explicit clean-tree setup gate
while the coordinator's checkpoint changes were uncommitted. Its helper recorded
an abort rather than a completed review. A new review will require a clean
checkpoint and the skill's mandatory independent native design-consistency
voice; neither screenshots from benchmark nor this static workflow review
substitutes for that stage.
