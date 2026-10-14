# Assessment-objective coverage — Increment 3

Branch `feat/assessment-objective-coverage`, base `ef02c296337268a47c464d38a305e93570a0a984`.
PR #15 was merged with explicit owner approval on October 14, 2026. This new
increment remains unmerged. Scope follows the user's four-increment assignment.

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
- Mapping comparison, supplementary notes, report UI and final QA are in progress.
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

| Canonical skill       | Disposition for Increment 3                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| gstack                | Adapted routing: evaluated all 58 canonical triggers for this fixed increment.                                         |
| autoplan              | Not applicable: explicit four-increment plan; no product-scope expansion.                                              |
| benchmark             | Adapted bundle check planned: lazy coverage route must keep the source inventory out of Home.                          |
| benchmark-models      | Not applicable; paid/outside-provider comparison unauthorized.                                                         |
| browse                | Applicable: local Chromium production-build coverage report and existing browser checks; pending.                      |
| canary                | Not applicable: no production rollout; preview status checked separately.                                              |
| careful               | Not invoked: ordinary feature Git operations; explicitly approved PR #15 merge verified.                               |
| claude-code           | Gated/not run: outside-provider reviews disabled.                                                                      |
| codex                 | Unsupported host wrapper; native independent agents were used directly.                                                |
| context-restore       | Not applicable: no gstack saved checkpoint to restore.                                                                 |
| context-save          | Not applicable: durable handoff is this PR and report.                                                                 |
| cso                   | Blocked/not assessed: trusted installed launcher absent.                                                               |
| design-consultation   | Not applicable: preserve existing brand and design.                                                                    |
| design-html           | Not applicable: no standalone design artifact requested.                                                               |
| design-review         | Applicable: inspect coverage report, mobile reading, focus and empty states against existing DESIGN.md; pending.       |
| design-shotgun        | Not applicable: no new design variants.                                                                                |
| deslop-shared-libs    | Not applicable: no substantive duplicate-library extraction.                                                           |
| devex-review          | Not applicable as broad DX audit; existing Vitest and GitHub reviewer workflow reused.                                 |
| diagram               | Not applicable: small engineering flow recorded inline, no diagram artifact.                                           |
| document-generate     | Adapted: objective provenance, mapping decisions and unresolved gaps; in progress.                                     |
| document-release      | Applicable: roadmap/README/TODO/changelog/development/privacy consistency; in progress.                                |
| eval-plan             | Not applicable: no LLM application or evaluation.                                                                      |
| freeze                | Not applicable: no requested persistent scope lock.                                                                    |
| gstack-upgrade        | Gated/not run: exact pin must remain.                                                                                  |
| guard                 | Not applicable: no production/destructive workflow.                                                                    |
| health                | Not applicable as release-health workflow: local targeted checks and CI cover this feature PR.                         |
| investigate           | Adapted: source wording conflict and missing explicit teaching details traced to pinned guide pages.                   |
| ios-clean             | Not applicable: no native iOS project.                                                                                 |
| ios-design-review     | Not applicable: web app, not SwiftUI; actual Safari/iOS validation remains pending.                                    |
| ios-fix               | Not applicable: no native iOS project.                                                                                 |
| ios-qa                | Not applicable: no DebugBridge/iOS runtime.                                                                            |
| ios-sync              | Not applicable: no native iOS project.                                                                                 |
| land-and-deploy       | Native workflow not run; PR #15 merged with explicit approval. This increment requires new owner approval.             |
| landing-report        | Not invoked: prior approved merge verified via GitHub; new PR handoff is review only.                                  |
| learn                 | Not applicable: no separate learning-store update needed.                                                              |
| make-pdf              | Not applicable: no export requested.                                                                                   |
| office-hours          | Not applicable: requirements and audience are explicit; no new product discovery.                                      |
| open-gstack-browser   | Unavailable user-facing cloud browser; local Chromium automation available.                                            |
| pair-agent            | Gated/not run: no remote browser sharing or tunnel authorized.                                                         |
| plan-ceo-review       | Not applicable: fixed Phase 1/2 increments and explicit prohibition on scope expansion.                                |
| plan-design-review    | Adapted scoped plan below; existing visual system retained. Native scorecard/mockup/provider gates not run.            |
| plan-devex-review     | Not applicable: no new developer product/API.                                                                          |
| plan-eng-review       | Adapted: edition/source/text bindings, explicit field mappings, fail-closed gaps, lazy data and navigation plan below. |
| plan-tune             | Not applicable: no preference-profile change requested.                                                                |
| qa                    | Applicable: integrity failures, source comparison and coverage/browser regression checks; pending.                     |
| qa-only               | Not applicable as duplicate alternative; scoped QA includes repairs.                                                   |
| retro                 | Not applicable: no retrospective requested.                                                                            |
| review                | Applicable: critical/informational checklist and independent source/mapping/diff review; pending.                      |
| scrape                | Not applicable: reuse verified pinned PDFs; current official-host access remains blocked as recorded in Increment 2.   |
| setup-browser-cookies | Gated/not run: personal-session import unauthorized.                                                                   |
| setup-deploy          | Not applicable: existing Git/Vercel preview integration retained.                                                      |
| setup-gbrain          | Gated/not run: no new memory/account integration authorized.                                                           |
| ship                  | Native workflow incomplete; ordinary authorized feature-branch commit/push/PR/preview verification only.               |
| skillify              | Not applicable: no scrape to codify.                                                                                   |
| spec                  | Not applicable: user supplied detailed assignment; no external issue filing.                                           |
| sync-gbrain           | Gated/not run: no authorized sync integration.                                                                         |
| test-audit            | Not applicable as suite-pruning workflow: no deletions; each new regression covers browser-only behavior.              |
| unfreeze              | Not applicable: no active freeze to remove.                                                                            |
