# Shareable lessons: independent rendered screenshot review

> Historical record: its dark/topographic visual direction was superseded by the
> owner’s October 13, 2026 editorial redesign request. See [the active design
> system](../DESIGN.md). Prior functional/source review evidence remains scoped
> to the implementation and fingerprints recorded below.

Date: 2026-10-13. Scope: independent visual contribution to the root agent's
design-review, using real app screenshots supplied by that agent. The applicable
installed design-review workflow was read. Root owns browser navigation, interaction
receipts, fixes and final skill closure; this review edits no application source.
Paid generation, outside providers, account/cookie/tunnel operations and setup are
excluded. No complete skill or current-commit shipping clearance is claimed here.

## Evidence and first impression

Reviewed local ignored screenshots:

- `.gstack/artifacts/shareable-lessons-explorer-full.png`: desktop Compliance lesson.
- `.gstack/artifacts/shareable-lessons-desktop.png`: lower Glossary, Mission and footer;
  despite its filename this capture does not show the hero.
- `.gstack/artifacts/shareable-lessons-hero-desktop.png`: existing desktop hero.
- `.gstack/artifacts/shareable-lessons-explorer-desktop-after.png`: corrected desktop
  reading, open Account definition and selectable clipboard fallback.
- `.gstack/artifacts/shareable-lessons-explorer-phone-390.png` and
  `shareable-lessons-explorer-phone-320.png`: narrow reading and expanded states.
- `.gstack/artifacts/shareable-lessons-header-phone-390.png`,
  `shareable-lessons-header-phone-320.png`, and `shareable-lessons-hero-phone-320.png`:
  wrapped phone navigation and narrow hero.
- `.gstack/artifacts/shareable-lessons-glossary-phone-390.png`: search and alphabetic rows.
- `.gstack/artifacts/shareable-lessons-explorer-tablet-768.png`,
  `shareable-lessons-explorer-desktop-1024.png`, and `shareable-lessons-explorer-landscape.png`:
  intermediate and landscape reading layouts.
- `.gstack/artifacts/shareable-lessons-explorer-zoom-reflow.png`: supplied reduced-width
  zoom-reflow reading state; not independently established as native browser zoom.

The lesson communicates a quiet educational reading surface. My eye goes first to
Control Explorer, then Authorized access, then the explanation heading. Search and
discovery occupy their own area; copying and term help stay subordinate. The draft
and project-edition cues remain visible. I see no overlapping text, clipped reading
content, neon, decorative dashboard widgets or new card grid in this desktop view.
The lower Glossary uses separated disclosure rows rather than repeated cards, and
its visual language agrees with the Mission/footer. No new issue was identified in
that lower-page capture.

An additional bounded in-host screenshot check found no actionable desktop
composition issue. This is a second reading of the same visual evidence, not an
external provider or additional browser coverage.

The preserved PNG contains exact solid foreground, muted, accent, surface/canvas
and field-border token colors. WCAG relative-luminance calculations for those
pixel-present pairs give foreground/surface 14.49:1, muted/surface 7.49:1,
muted/canvas 8.14:1, accent/surface 10.96:1, field-border/surface 3.38:1, and
field-border/canvas 3.68:1. These sampled solid pairs satisfy their text/UI contrast
thresholds. This is not a scan or all-element AA assertion; antialiased small
draft text has no exact solid-token pixels, so it is not included in these results.

## VISUAL-001: example reading prose is smaller than adjacent paragraphs

Impact: **medium / P2**, typography. Status: **root fixed; visually verified in after capture**.

In the Compliance lesson, the three sentences under Candidate evidence examples
to discuss appear smaller than the summary and takeaway, although all are reading
content. After that visual observation, CSS diagnosis confirms the desktop
`.example-box li` used 15px while surrounding paragraphs used 16px; the mobile
override already uses 16px. This conflicts with docs/DESIGN.md's 16px reading
contract and the accepted design review's reading alignment.

Root changed the desktop example-list prose to 16px, retaining line height, spacing
and icons. The after capture shows no new wrapping/clipping problem, and root's
actual browser measurement confirms 16px. Before and after captures use different
perspectives, so this is rendered verification of the new size/wrapping, not an
identical-content pixel-difference comparison. No additional test is required for
this CSS-only adjustment beyond the root's normal checks and rendered review.

Preserved before evidence:
`.gstack/artifacts/shareable-lessons-explorer-typography-before.png`, SHA-256
`0d4e256bda37965d36bf7ab1cd77a6aa45d5af472d8d34481daaddc034a8f5b5`.
Before-fix diagnostic receipt: `src/styles.css:586` (15px); mobile `.example-box li`
override was 16px. Root's correction supersedes that old value. No source edit was
made by this reviewer.

## Responsive and expanded-state observations

The 320/390px headers wrap Brand and the remaining navigation into clear rows.
The narrow hero keeps the Explore action and named draft entry visible, with
subtle contours behind the spacious composition. No cropped headline or horizontal
page overflow is visible. Root separately measured scrollWidth equal to innerWidth
at both phone widths; that measurement is root's browser evidence, not inferred
from pixels.

At phone widths, copy moves below lesson identity; its failure text and labeled
selectable field remain nearby. The term controls wrap without losing their labels;
Account opens inline with a clear close action and persistent draft/source context.
The three perspectives remain recognizable above the explanation. Glossary search
and alphabetic disclosure rows use the same quiet vocabulary. At 768/1024px and
landscape, the narrower discovery rail and reading column retain readable wrapping;
the expanded term/fallback introduce no observed overlap or clipping. No additional
actionable visual issue was identified in those captured states.

The supplied zoom-reflow capture also keeps the reading, wrapped toolbar/filters,
perspectives and list prose inside the single-column surface without observed
clipping. Its screenshot alone does not establish native browser zoom mechanics.

The fallback captures were produced using the actual local UI with a temporary
clipboard API override. They establish the displayed rescue layout, not a real
browser permission denial. Root separately reports live copy success. Some long
element captures include a focused skip-link fragment; that capture context is not
treated as evidence of a viewport-layout defect.

## Coverage limits and handoff

This finite screenshot scope does not independently verify native 200% zoom,
expanded source-reference contents, every invalid/recovery state, keyboard/screen
reader behavior, history, clipboard permissions, motion or performance. Those
require the root's applicable browser/computed receipts; missing screenshots are
not automatically defects or new release blockers. Root measured one source
summary at 43.5px rather than 44px and owns its small target-size correction; this
is attributed root evidence, not a second screenshot-discovered finding.

Quick win completed: VISUAL-001's single font-size alignment. This contribution
found **1 medium typography issue**, root fixed it, and the after view was visually
verified; **0 additional visual findings or design deferrals** from the reviewed
states. No additional finding is invented to fill a target count. Overall weighted
design/AI grades and current-content freshness remain with the root's completed
audit. No new durable learning was identified beyond the already recorded review
contracts.
