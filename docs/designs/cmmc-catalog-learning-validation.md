# CMMC source catalog and learning activity

The owner expanded the continuation to all CMMC controls and the roadmap learning
features after the earlier shareable-lesson slice. This increment provides the
complete inspected September 2024 v2.13 reference inventory and a first fictional
scenario/knowledge check. It does not claim that the entire roadmap or teaching
coverage is complete. PR #3 remains open on a feature branch; main is not merged.

## Data, architecture and verification

The imported snapshot contains **149 identifiers: 15 Level 1, 110 Level 2 and 24
Level 3**. Four PDF sizes, SHA-256 values and version/date covers were independently
checked by the coordinating implementation. Every guide quotation matches its
cited PDF page, including its printed page number. Ten real model/guide wording
differences are preserved separately; Level 3 parameter text is retained.

Original publication URLs, pinned third-party PDF mirror URLs, source hashes,
acquisition limits and reuse context are in [source notes](../sources/cmmc-2-13-sep-2024.md).
Direct official-host access was blocked during research. This establishes a
versioned snapshot, not confirmation of the latest publication or present contract
applicability. The optional offline source verifier is checked in and passes.

`CatalogControl` is a discriminated TypeScript union. Source references have
attributed quotes and citations; draft teaching lessons have explanation modes and
explicit term/activity coverage. The UI cannot assume unwritten modes exist.
Collection state participates in the URL; exact known source links infer references,
while explicit collection choices survive mismatch/history/reload. The legacy
README lesson identity remains unchanged. Eight results per page keep the growing
catalog usable, and restored selections remain visible in their result page.

The fictional authorized-access activity supplies four ordered scenario steps and
three questions with explanatory feedback, retry and reset. It covers only its
explicit teaching identity and remains consistent across explanation modes. It
writes no URL, storage, backend state or assessment score. Source references show
pending teaching coverage instead of receiving invented generic lessons.

## Current checks and browser evidence

Lint, formatting, full tests and production build/typechecking pass. The expanded
suite has **189 tests across eleven files**. Native cases cover every level count,
source/pending separation, page anchors, preserved wording differences, canonical
sharing, explicit collection mismatch, pagination/restored selection, unsupported
mode messaging, fictional feedback/focus and the earlier URL/clipboard regressions.
A page-anchor assertion failed before repair and passed afterward.

Original gstack Chromium checked actual pagination and level filters (15/110/24),
source quotes, explicit mismatch restoration with reload/Back, recovery, comparison,
copy feedback and return to the old sample. The scenario and quiz were exercised
through incorrect/correct feedback, retry, all questions, completion, reset and
mode changes without losing progress. Completion remains educational even after
an incorrect final choice; it is not a graded certification result.

At 320, 390, 768, 1024, 1440 and 844px landscape, expanded source/practice states
had no measured horizontal page overflow. Reading text remains 16px; phone radio
labels provide 56–83px hit areas. The scenario's ordered markers, publication
comparison and quiz layouts were visually inspected. Final console had no errors.
Source/pending copy was shortened without hiding coverage limits.

## Review limits

The earlier shareable-lesson increment received independent code and visual review.
New source research and primary verification ran for this expanded catalog, but a
fresh independent code-review agent could not run because the agent service
reported a usage limit. Tests, source-page/hash verification and browser checks do
not replace that independent review or qualified editorial review. Paid outside
providers remain disabled. This PR is reviewable; no merge approval is inferred.

Ignored local browser artifacts are under `.gstack/qa-reports/cmmc149-20261013/`
with 69 checkpoints and screenshots under `.gstack/artifacts/`. As in the earlier
run, the browser-only materializer retains an INCONCLUSIVE formatter verdict for
an empty functional-evidence array; the observed browser results are explicitly
recorded rather than labeled machine PASS. Complete accessibility, native zoom,
all browser permission policies and official-site uptime are not certified.

GitHub CI and Vercel are inspected for the final pushed SHA and linked on the PR
and delivery message. README and LICENSE remain unchanged.
