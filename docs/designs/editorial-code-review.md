# Editorial redesign: independent code review

Date: October 13, 2026. Branch: `feat/editorial-redesign-level-one`.
Base: main `a7ccb99411641c3d31d7e0d6e33cfbbe147013c2`.
Reviewer: a separate in-host Codex agent, AI-assisted. This is not a qualified
content approval, outside-model review, or browser accessibility certification.

## Reviewed increment

The first editorial preview replaces the rejected dark/topographic identity,
reorders the homepage around the working Explorer, starts reading at the existing
Level 1 source entry, folds discovery on phones, and corrects project documentation.
The later three Level 1 learning examples are outside this snapshot.

The reviewer read the full owner's implementation brief, current `AGENTS.md`,
the installed gstack review instructions and critical/informational checklist,
all changed test hunks, default-state and related URL-resolution/transition code,
App/Explorer/brand changes, responsive collapse rules, source-summary checker,
README, active design and deployment notes. No application files, test fixtures,
browser session, provider account, GitHub branch or deployment were changed by
this reviewer.

## Findings and disposition

- **Informational, confidence 9/10:**
  `src/components/ControlExplorer.tsx:298` returns early when the user chooses
  the already-selected result, before `setMobileResultsOpen(false)`. On a phone,
  choosing a different result returns to reading but choosing the current result
  leaves discovery expanded. Move the collapse before the same-key guard, retain
  direct focus without arming the navigation latch, and cover same-selection.
  Disposition: the coordinator moved collapse above the guard. A new regression
  verifies collapse, current-heading focus and no address change. The correction
  passed independent current-input verification. This is a resolved usability
  issue, not a URL/security failure.
- **Coverage follow-up:** the new summary checker meaningfully rejects duplicate
  IDs, source/manifest mismatches, invalid page/URL/hash metadata, missing teaching
  perspectives and published count drift. The coordinator added six `node:test`
  cases: real-data acceptance plus five corruption rejections. These independently
  passed. No existing test was skipped or removed.

No unresolved code defects remain in this scoped increment. This statement is
limited to the reviewed files and executed checks; the complete owner request
still includes content work and live browser validation.

## Gate integrity and technical assessment

The installed gate scan listed 14 hunks, of which 10 were eligible and all 10
were inspected; unread count was zero and no RH relaxation tags were present.
Changed legacy demo fixtures explicitly open their stable old address because the
homepage now opens a Level 1 source reference. The new homepage tests verify the
actual `/` default separately, including the reference collection and source
heading. The asynchronous panel assertions correspond to the existing lazy source
perspectives, retain exact mode assertions and do not lengthen test timeouts.

The reference-sharing test still asserts a clean copied source identity and the
old educational activity. It now selects the Demo lesson collection explicitly,
because homepage perspective links correctly point at the new Level 1 default.
The controller count change from one to 149 corresponds to the new reference
collection, with no accidental selection after clearing search. Content integrity
checks the full catalog for the default tuple rather than the demo-only array.

The default-state helper selects a collection only for one exact matching tuple;
resolution still owns unavailable/ambiguous identities. Explicit legacy URLs,
explicit collection mismatch, strict decoding, browser history and missing-control
behavior remain guarded. No first-result fallback was introduced. The existing
single App URL controller remains in place. Analytics privacy/gating source files
are unchanged; the new default's initial view uses the existing allowlisted API.
README distinguishes source inventory, 447 draft texts, professional approval,
objective coverage and applicability, and keeps the four roadmap phases distinct.

## Exploratory QA and verification results

| Field                 | Value                                                                                                                                                                                                                                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surface and isolation | Local repository-native Vitest/jsdom and read-only content CLI, synthetic URL/fixtures                                                                                                                                                                                                                                                             |
| Authority             | Report/evidence writes only; no source edits, install or external mutation                                                                                                                                                                                                                                                                         |
| Native test command   | `npm test -- src/components/editorial-home.test.tsx src/App.test.tsx src/components/ControlExplorer.regression-1.test.tsx src/components/reference-catalog-ui.test.tsx src/state/explorer-state.test.ts src/state/useExplorerState.test.tsx src/analytics/ui-interactions.test.tsx src/analytics/usage.test.ts src/data/content-integrity.test.ts` |
| Test observation      | Initial run: exit 0, 190 tests. Final correction run: exit 0, 191 tests across nine files passed.                                                                                                                                                                                                                                                  |
| Metadata command      | `npm run check:content`                                                                                                                                                                                                                                                                                                                            |
| Metadata observation  | Exit 0; 149 references, levels 15/110/24, 447 drafts, four source documents, six node:test acceptance/rejection cases                                                                                                                                                                                                                              |
| Evidence materializer | Final functional verdict `pass`; browser checks are a separate scope                                                                                                                                                                                                                                                                               |

The owned evidence root is
`.gstack/qa-reports/editorial-code-review-functional/`, ignored from Git because
it records local runtime artifacts. Its [checkpoint 002](../../.gstack/qa-reports/editorial-code-review-functional/exploration-002.json)
records the successful native test result before the source-summary probe.

Final correction verification has its own immutable materialization at
`.gstack/qa-reports/editorial-code-review-delta/`, with verdict **pass** and its
[checkpoint 002](../../.gstack/qa-reports/editorial-code-review-delta/exploration-002.json).
The initial root also retains [checkpoint 003](../../.gstack/qa-reports/editorial-code-review-functional/exploration-003.json)
and [checkpoint 004](../../.gstack/qa-reports/editorial-code-review-functional/exploration-004.json):
a newly added test required a literal space absent from the concatenated accessible
name and failed on exact replay. Removing that incorrect selector-space requirement
kept the exact control, collapse, focus and address assertions; no behavior assertion
or timeout was relaxed. Final current-input verification passed after the correction.
The initial immutable verdict belongs to its original snapshot, not those later
failed captures or the corrected tree. A delta evidence setup attempt before its
report directory existed produced no behavioral observation; the directory was
created before the successful captures.

These tests do not establish phone rendering, contrast, touch dimensions,
screen-reader behavior, enlarged-text behavior or clinical/compliance correctness.
The coordinating agent owns live desktop/mobile browser review. Direct official
publication access/current applicability and qualified human approval remain
explicit content limitations. No provider dashboard receipt was checked or claimed.

## Source fingerprints at review

SHA-256 fingerprints bind this review to the inspected working-tree inputs;
later changes require a delta review, not reuse of this report as blanket approval.

The table below records initial inputs. Changed current inputs after the reviewed
corrections are listed in the final table; unchanged entries retain their hashes.

| Path                                     | SHA-256                                                            |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `src/App.tsx`                            | `58c915ade94e5f208437af6a1dfd00205c015c9e7b76bab8767bca16a791b635` |
| `src/components/ControlExplorer.tsx`     | `a5dd2d0ae5465cd7191cb1aa8a3c0e410b7b062496a0b3287c1905ab144c3a65` |
| `src/components/Brand.tsx`               | `b3fc83e6e7e534953ce926d90644808f2bc73a3d83ab22fdd81e175e82af6e9f` |
| `src/data/editions.ts`                   | `cae1db66128d371276530a3802e55001b4ce47f7687994cda7a945d298fc7b93` |
| `src/state/explorer-state.ts`            | `35af20c56e5f4dde032fc7801c422574e61162d55e4464617ad941722c8ed908` |
| `src/styles.css`                         | `6f4adea109190a5e6fa887e213fe8547f29fb798c52407edfb63407bc5eb9ec3` |
| `scripts/check-content-summary.mjs`      | `b8e6d543c4d8a33a04d03e83674ba5b8aee5006e707d88a19d4f3ecc4b6e6df4` |
| `src/components/editorial-home.test.tsx` | `c1fc7e7b6fe12af5609dc88339f1f598d41b1be6cdbb97d3510b63c5289af471` |
| `src/App.test.tsx`                       | `d290fd341a165c32ecd5ebf25c75ace7ce734b07ed5f92885f3d09bf7e17c4e0` |
| `src/state/useExplorerState.test.tsx`    | `c882c9d9caa1ca6b5d90c973bbbf829f9cc5114d8ced8417f75a94d9b64477a4` |

| Final changed input                            | SHA-256                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `src/components/ControlExplorer.tsx`           | `a642c9a52bd1dfb00ca2fc843490648c50ff3b8b89c8799b83fbc69fa2bbf8e0` |
| `src/components/editorial-home.test.tsx`       | `b1c7cac63ea3670c2c5dd5be1e6233ec8f143e658f45c3d7e8fd8b9a0073ef3f` |
| `src/components/reference-catalog-ui.test.tsx` | `c1ba006085d7c701fd640ad21b503201f8bb3987d17635158ccd08550ff9be30` |
| `scripts/check-content-summary.test.mjs`       | `4d21fa397e171cd41d24f8aa89d031882c23ca221b11f8e877ff1e65a27c4b7f` |
| `package.json`                                 | `979ff3d1aac31efc8cc4fb566564e8b4a93f0b710392e11bcd7dfdfabc8a7663` |
