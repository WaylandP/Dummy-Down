# Shareable lessons code review

Final source: `bdb7ea0` plus the source-disclosure `min-height: 44px` refinement,
against merge base `ac60936` (`origin/main`). Date: 2026-10-13.

Pre-Landing Review: **0 unresolved issues; 3 findings fixed; DONE**.
The code review, focused functional replays and in-host adversarial review finished.
The owner accepted the three repairs under delegated authority; this reviewer made
no app/source edits, commits or pushes. Final report publication checks and
exact-commit deployment inspection remain with the coordinating owner.

Final code fingerprints: `ControlExplorer.tsx`
`bea282b9fe2f554e317f4229d3ae1a4ef0345976f755c59ab2690198e8383c0d`,
`styles.css` `c4bab947b03159dee76905c0a18674196d6854e8d2c20d8ec59979bb3b7c45a4`,
regression test `5d6c07ec97da60354e6187f2b017cd4166f0a2914813b8a0aa5816a8527b0c28`.

## Fixed findings

Original locations below identify the pre-repair evidence at `65b3787`.

1. **INFORMATIONAL, confidence 10/10: stale focus after no-op selection.**
   `src/components/ControlExplorer.tsx:208` sets `focusLesson.current = true`
   before dispatch. An already-selected lesson is an unchanged transition
   (`src/state/explorer-state.ts:441–447`), and the store returns without publishing
   (`src/state/useExplorerState.ts:116`). The next mode/search update then executes
   the heading ref at `ControlExplorer.tsx:263–266`, moving focus away from the
   active control. The same-selected-result → Compliance sequence ended on
   `H3#control-title`; fresh selection → Compliance correctly ended on the tab.
   Handle same-selection focus immediately, and scope pending commit-time focus to
   actual navigation. Add a regression that performs the no-op before a later action.
   **Fixed:** the same-selection branch now focuses the heading immediately and
   returns before setting the pending flag (`ControlExplorer.tsx:221–223`).
2. **INFORMATIONAL, confidence 10/10: invalid recovery loses keyboard focus.**
   `ControlExplorer.tsx:71–73` dispatches recovery and immediately focuses search,
   which is disabled until React commits (`:117`). The removed recovery button
   leaves focus on `BODY`, confirmed twice. Move recovery focus after the input is
   enabled at commit. Verify malformed-link keyboard recovery and planned recovery.
   **Fixed:** `useLayoutEffect` consumes recovery focus after search is enabled
   (`ControlExplorer.tsx:31–39`).
3. **INFORMATIONAL, confidence 9/10: return-to-discovery has no UI caller.**
   `src/state/explorer-state.ts:417` implements `back-to-discovery`, but source
   searches found callers only in the state tests. The plan's intent matrix
   (`shareable-lessons-plan.md:733`) and URL contract (`field-guide.md:222–227`)
   require an explicit return retaining filters/mode and removing lesson identity.
   Add a reachable “Back to field guide” action and verify discovery reload/history.
   **Fixed:** “Back to results” dispatches the existing discovery transition and
   focuses search (`ControlExplorer.tsx:251–259`).

These are ordinary UX/completeness defects, not demonstrated security exploits.
No gate relaxation finding was identified. Final gate scan: 13 hunks listed, 6 eligible
read, none unread; RH-1/3/4/12/13/14/15/16 patterns, no unlisted language idioms.

## Scope and security evidence

Read the changed App, controller/pure state, content/types, reading tools, styles
and all seven source test files, plus related unchanged search/tab code. Read
repository instructions, README, contributing/developer docs and the binding
plan's implementation, URL, focus and async contracts. This is source/behavior
review; it does not claim a fresh review of every historical planning paragraph.

Exact tuple lookup rejects ambiguous/missing content; raw decoding and duplicate
guards retain explicit errors. One App-mounted store owns complete popstate
restoration and guarded history writes. Copy serialization excludes discovery and
unknown query values; keyed lifetimes suppress obsolete A→B→A feedback. Content
renders through JSX text. Current source links are HTTPS, covered by content
integrity checks, and use `noopener noreferrer`. Draft status, project edition,
resource-index/publication distinctions and assessment applicability remain visible.
No backend, clipboard reads, cookie/storage/analytics or new dependency was added.

The in-host adversarial reader independently identified both focus defects. It
reviewed tests/fixtures in summary mode only; model independence was not claimed.
The fresh repaired-source pass found no remaining defect. A narrow final CSS pass
checked the 44px disclosure target; unchanged JavaScript coverage was reused after
verifying its source identity. No broad review or browser session was duplicated.
Outside adversarial/structured providers stayed **disabled**, as configured.
No Greptile comments were found. No justified optional extraction was proposed.
Live web research was unavailable and unnecessary to reproduce these local paths.

## Exploratory QA and Verification Results

Current checks: **pass**. The reviewer ran 114 focused tests across four files,
including the three new owner-authored regressions, then reran the exact unchanged
original jsdom diagnostic. Same-selection focus occurs immediately, subsequent
Compliance focus stays on its tab, recovery focuses enabled search, and the
adjacent fresh-selection path remains correct. The old diagnostic's return-button
regex does not match the chosen “Back to results” label; that field is inconclusive,
and the real regression test verifies the action and preserved state instead.

The coordinating owner ran all **145 tests across eight files**, lint, formatting
and build on `bdb7ea0`. After the final CSS-only target refinement, this reviewer
reran `npm run build` (including typecheck) and checked `src/styles.css` formatting;
both passed. JavaScript and test behavior are unchanged by that CSS value.

- [Repaired checkpoint 002](../../.gstack/qa-reports/code-review-65b3787-r2/exploration-002.json)
  records the original diagnostic replay after 114 passing tests.
- [Repaired materialized evidence](../../.gstack/qa-reports/code-review-65b3787-r2/evidence.json)
  has verdict `pass`, with no open checks in this focused functional scope.
- Parent browser receipts [039](../../.gstack/qa-reports/shareable-lessons-20261013/exploration-039.json),
  [040](../../.gstack/qa-reports/shareable-lessons-20261013/exploration-040.json) and
  [044](../../.gstack/qa-reports/shareable-lessons-20261013/exploration-044.json)
  confirm repaired tab focus, reachable return and enabled recovery focus. The
  parent's separate QA report owns history/reload, clipboard fallback and responsive
  checks; reported sizes include 320/390/768/1024px and 844px landscape with no
  measured horizontal overflow. No visual score is assigned by this code reviewer.

Historical evidence before repair follows; these failures are resolved above.

| Contract                                      | Evidence                                                                                                                               | Expected → observed                                 | Outcome                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------- |
| Existing state/controller/reading-tool suites | `npm test -- src/state/explorer-state.test.ts src/state/useExplorerState.test.tsx src/components/learning-tools.test.tsx`; capture 001 | Selected tests pass → 111 tests passed              | Pass on original candidate |
| Fresh result selection then mode              | Isolated jsdom focus probe; captures 002/003                                                                                           | Heading then Compliance tab → both correct          | Pass on original candidate |
| Same result selection then mode               | Same diagnostic and exact replay                                                                                                       | Compliance tab → lesson heading                     | Fail before repair         |
| Invalid address recovery                      | Same diagnostic and exact replay                                                                                                       | Enabled search → BODY; discovery remains unselected | Fail before repair         |
| Explicit return-to-discovery action           | Static caller search and probe                                                                                                         | Reachable preserving action → none                  | Missing before repair      |

- [Checkpoint 002](../../.gstack/qa-reports/code-review-65b3787/exploration-002.json)
  records why passing suites needed the additional focus probes.
- [Checkpoint 003](../../.gstack/qa-reports/code-review-65b3787/exploration-003.json)
  records the exact replay before repair.
- [Local materialized evidence](../../.gstack/qa-reports/code-review-65b3787/evidence.json)
  has verdict `fail`; evidence paths are ignored local artifacts and will not ship
  in the repository. The diagnostic uses synthetic jsdom documents, no shared browser.

Exact-commit CI and Vercel inspection for the report/CSS publication belongs to the
coordinating owner. Real clipboard permission, a complete accessibility audit and
qualified editorial review are not established by these tests.

The initial core record correctly retained incomplete/nonconverged status. Final
native/core records retain zero unresolved defects and all three fixed actions.
Their strict whole-tree bindings became stale when output report files changed
during review; they do not establish a current whole-tree approval. Reviewed app
source hashes above remained unchanged. The coordinating owner must capture the
closing binding once output documents settle; unchanged source/native evidence
can be reused without another broad review. A durable local learning records the
no-op focus-latch pitfall. The root owns the original skill-session end; this
reviewer did not duplicate it.
