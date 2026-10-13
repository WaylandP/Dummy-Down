# Independent review: CMMC perspectives and usage

Date: 2026-10-13  
Repository: WaylandP/Dummy-Down  
Branch: `feat/cmmc-perspectives-usage`  
Base: `main`; PR #4  
Candidate: commit `c293f8f` plus the selected working-tree teaching changes  
Result: one reproduced P2 defect corrected and independently revalidated;
no remaining actionable defect found in the scope below

## Scope and method

Read the README, AGENTS.md, the installed gstack review skill and checklist,
the implementation plan, and changed code with its unchanged callers. This was
an in-host code review with a separate native adversarial critic for curriculum
loading. Outside-provider reviews were disabled. The reviewer made no application
edits, commits, pushes, account changes or merges.

Reviewed teaching components (`ControlPerspective`, `ReferencePerspectives`,
`ReferenceDetail`), exact framework/edition lookup and types, Explorer integration,
level navigation, source/teaching separation, accessible tabs, reflection lifetime,
share/history/focus behavior and analytics event boundaries. Adjacent reads covered
`LearningModes`, `ShareLesson`, `useExplorerState`, search, pagination, practice,
glossary and the installed Vercel SDK. The separate editorial audit owns the
149-record factual review; this review does not repeat or certify that work.

Critical-pass checks found no unsafe HTML rendering, arbitrary analytics-property
forwarding, edition borrowing, lost source quotation, uncontrolled retry loop,
credential exposure or production/preview gate bypass. Draft text is rendered as
React text, separate from attributed quotations. `findCmmcPerspective` rejects
other frameworks and editions. The current control is resolved before telemetry
properties are built from the shipped catalog. Reflection is keyed by lesson and
mode; it cannot retain another control's selection.

The single shared tabpanel is labeled by the selected tab. Arrow/Home/End
navigation retains tab focus, while history restoration changes the selected
perspective without adding a fresh selection event. All three level links contain
canonical discovery state and the correct reference collection. The provider
receives bounded categories, not search text, answer choices or shared URLs.
Runtime preference checks still apply after the SDK has loaded.

## Finding and correction

**P2, confidence 10/10: a failed curriculum chunk could not be retried.** The
original `ReferencePerspectives` recovery incremented an attempt counter and
re-imported the identical module specifier. Isolated Chromium 154.0.8037.57
against the production build aborted the first chunk request with `ERR_FAILED`,
then restored network access. Two recovery clicks left the request count at one,
the error visible and zero tabs. A full-page reload issued a second request and
loaded all three tabs. The document had cached the failed module load.

Root replaced that ineffective action with **Reload page to retry**, calling
`window.location.reload()` without changing the current address. The exact
isolated failure fixture was rerun against `index-vninLwbY.js`. Clicking the
actual recovery button changed chunk requests from one to two, restored three
tabs, selected Beginner and preserved the entire canonical lesson URL. The
source quotation remained readable before recovery. A new unit test also covers
the load-failure message, visible source text and preserved Compliance URL state.

Native replay evidence, retained in ignored artifacts:

- `.gstack/qa-reports/lazy-curriculum-critic-20261013/before-fix.json`
- `.gstack/qa-reports/lazy-curriculum-critic-20261013/after-fix.json`
- `.gstack/qa-reports/lazy-curriculum-critic-20261013/reproduce.mjs`

Reproduction and revalidation use separate ephemeral loopback servers and fresh
Chromium processes, closed by the fixture. They do not navigate root's shared
browser or contact the analytics collector. The fixed component SHA-256 was
`d54465b514d2a8cac52a39669a60eae85cff30baad871c673956f79d0da33cda`;
the tested main bundle SHA-256 was
`8d528791fa16c852f4a925cd19e154426ab602101d10bb2618119d3d0967f323`.

## Functional checks and gate integrity

The first scoped verification passed **64 tests across eight files**, before the
rendered-control analytics delta reviewed below:

```sh
npm test -- src/components/control-perspectives.test.tsx src/components/reference-perspectives-loading.test.tsx src/components/reference-catalog-ui.test.tsx src/components/ControlExplorer.regression-1.test.tsx src/data/cmmc-perspectives.test.ts src/analytics/usage.test.tsx src/analytics/ui-interactions.test.tsx src/analytics/sdk-integration.test.tsx
```

These cover all-level example rendering, exact-identity coverage, unsupported
editions, mode/history/reflection state, source quotes, failure handling, earlier
focus regressions, search deduplication, bounded feedback properties, privacy
signals and the real SDK's local queue/script configuration. They do not execute
the collector script or prove provider receipt.

The independent functional artifacts are under
`.gstack/qa-reports/cmmc-perspectives-code-review-20261013/`. Its saved
`exploration-002.json` checkpoint preceded the current-input revalidation.
The evidence formatter's immutable aggregate verdict is **inconclusive**, with
`capture 001 superseded` open: the earlier 60-test command was replaced by an
expanded 64-test command. Preserve that verdict; it does not replace the observed
exit 0 and 64 passing current-input tests. This report does not claim a fully
completed formal gstack workflow from that artifact.

Gate scan: nine listed hunks, four eligible/read, zero unread. No gate-relaxation
finding. The source UI assertions changed from absent tabs to actual draft
perspectives, preserving exact quote checks. The anchored NIST link assertion
still verifies its complete expected URL. The RH-16 analytics catch isolates
provider failures and is covered by tests; it does not swallow application-test
failures. No Greptile comments were present at review time. Shared-code review
found no additional extraction that warranted coupling the existing distinct
source/draft renderers.

## Final delta: rendered-control measurement

Reviewed `useControlView`, the App binding, the `control_view` runtime case,
affected analytics tests and usage documentation. A separate in-host native
critic independently read this delta and found no actionable defect. The
additional event closes the gap for shared-link and history-rendered controls,
while retaining `control_open` and `perspective_change` as deliberate actions.

The hook runs in a passive effect for a committed, known lesson resolution. Its
ref key contains only catalog identity and mode; it suppresses unchanged
rerenders and StrictMode effect replay. A null resolution resets the key so
later history re-entry is counted. Discovery text and address strings do not
enter its payload. The runtime event boundary resolves the identity against
the shipped catalog and accepts only the three known modes. It still checks
production eligibility and visitor preferences before provider calls. The
documentation accurately describes a render as distinct from visibility,
attention, learning or a unique visitor.

Affected verification passed **46 tests across four files**:

```sh
npm test -- src/analytics/control-views.test.tsx src/analytics/ui-interactions.test.tsx src/analytics/usage.test.tsx src/analytics/sdk-integration.test.tsx
```

Fresh evidence lives under
`.gstack/qa-reports/control-view-delta-review-20261013/`; the materializer's
immutable verdict is **pass**, with no open items. This new root preserves the
older formatter receipt. The tests verify actual committed-render wiring with
a mocked adapter, the runtime payload boundary, privacy handling and the real
SDK's local queue/configuration. They do not prove receipt at Vercel. Existing
feedback-property validation was included in this current run. The refreshed
gate scan had 11 listed hunks and four eligible/read, zero unread; no new gate
relaxation was found.

Reviewed delta SHA-256 fingerprints:

| File                                     | SHA-256                                                            |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `src/analytics/useControlView.ts`        | `7e1800581f3f08f1c2f88a5df8b3fdee7931caa1a290e063f3a008e4328b5f2b` |
| `src/analytics/usage.ts`                 | `dd19728c75ef2e465fbf118bc3cc825bf77941448f0aef285ed91d9b6e47604d` |
| `src/App.tsx`                            | `b1caa55fd461bc3cfa30ffc04796beb03d024f2745b43a8cb63d215d2e1dec60` |
| `src/analytics/control-views.test.tsx`   | `c61f72f8b424fbec7d17c4db6b157b0f791a411731684e0cca9b58c0eec6ec44` |
| `src/analytics/ui-interactions.test.tsx` | `3ac63b508cfcf1480fc5cd6185a0bea0e17393cd30b25e51eefeb8ffc3b7e053` |
| `src/analytics/usage.test.tsx`           | `e30184da300518e9710ceb192eb27951014a2051ac7d185fa9c5c5e03b5bc32d` |
| `docs/USAGE.md`                          | `2984ffcc511566f862b0d6e21b3fcdaa4b04fc156dfa7238dd474698a626417b` |

## Limits

This is a scoped software review, not qualified human editorial approval,
verification of the latest official publication or determination of contract
applicability. The source acquisition and 447-perspective editorial findings are
documented separately. Account activation, custom-event entitlement and successful
receipt in Vercel remain unverified; the repository deliberately gates collection
off in previews and development.

Root owns whole-repository lint/format/build checks and functional/visual browser
QA. This reviewer inspected root's desktop and 320px Compliance screenshots
without controlling that browser, but did not assign a visual score or independently
rerun every browser journey. Tests and hashes bind the examined source/build
inputs; later behavioral edits require affected checks to run again. No unresolved
code defect was discovered in the stated scope.
