# Shareable lessons: validation

2026-10-13, PR #3, `feat/shareable-control-lessons`. This record covers the
shareable draft lesson/glossary slice; later catalog and learning work has separate
validation. README and LICENSE are preserved.

## Behavior and review

The full local suite passed **145 tests across eight files**, with lint, formatting,
typechecking and production build. Meaningful cases cover strict encoded/duplicate
URL handling, exact composite identity, discovery versus lesson restoration,
unknown/planned frameworks, full history replay and denied writes, clipboard
failure/races/unmount, contextual focus and independent glossary search.

Original gstack Chromium verified the running app: homepage/sample entry, all three
modes, actual Back/Forward/reload, intentional selection after search recovery,
malformed and missing links, planned frameworks without CMMC levels, filter
mismatch recovery, source disclosure, inline definitions/Escape, independent
search, live copying and selectable fallback after a temporary local API denial.
The override was removed by reload. Final app console had no errors; observed
runtime resource origins were local, and external anchors had safe attributes.

Code review found three issues: a stale focus request after selecting the same
lesson, search focus attempted before invalid-link recovery enabled the input,
and a missing UI action for the already-planned return to discovery. Three valid
regression tests failed before repairs and passed afterward. Browser rechecks
confirmed tab focus, enabled search focus and Back to results. See the
[code review](shareable-lessons-code-review.md).

Independent rendered review found desktop example prose at 15px. It now uses
16px, matching summary/takeaway/source reading text. A measured 43.5px source
summary also now has a 44px minimum. Widths 1440, 1024, 768, 390, 320 and 844px
landscape showed no measured horizontal overflow in expanded reading states.
The [visual review](shareable-lessons-visual-review.md) records screenshot evidence
and sampled contrast calculations. Dark topography and generous spacing remain.

## Limits and artifacts

The production dependency audit reported zero known vulnerabilities in installed
production dependencies. This is not a security certification or qualified review
of educational accuracy. Definitions and the lesson remain educational drafts.

The 200% reflow check used an equivalent 720px CSS viewport for a 1440px desktop;
native browser zoom was not controlled. Tests do not establish all browser clipboard
policies, screen-reader behavior or comprehensive accessibility. Official external
source uptime was not tested as part of UI QA.

Ignored local evidence is under `.gstack/qa-reports/shareable-lessons-20261013/`,
with 87 ordered checkpoints and screenshots under `.gstack/artifacts/`. Its
browser-only materializer retains an INCONCLUSIVE formatter verdict because an
empty functional-evidence array has no rows; the browser observations remain
explicitly recorded. Separate native test evidence under
`.gstack/qa-reports/shareable-lessons-final-tests/` has a PASS verdict. These private
artifacts are not required to run or build the app.

GitHub CI and Vercel are checked for each pushed commit. Their exact final statuses
and preview URLs belong to the PR and delivery messages, rather than a self-changing
commit hash in this document. No merge or production deployment is authorized.
