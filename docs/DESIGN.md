# Cipher & Chalk design

**Current direction: [The Board](design/THE_BOARD.md)**, approved October 14, 2026,
with the eight approved screens in [design/mockups](design/mockups/). Build
work follows that specification.

## What is live

The app shell is the Board's: the slate ground with chalk dust, the Morse-C ring
and lockup, the four-item nav with a find line, the one-line footer and the
wooden tray, drawn from the tokens and fonts in `src/styles.css` and the
components in `src/components/board/`. Walter Turncoat writes headings, Atkinson
Hyperlegible Next the reading text, Martian Mono anything that is code; all three
are self-hosted from `public/fonts/` with licenses in `public/font-licenses/`.
The mark is `public/brand/mark.svg`; the app icon and favicon are the ring on a
yellow tile.

Home is the Board's too. The other page layouts below are the previous
"reference desk" implementation. They stay live inside the Board shell, with
its colors and type, until each screen is redrawn in the Board's build order.
Their notes remain accurate for layout; their palette and type notes no longer
apply.

---

The reference desk gave the blackboard a practical purpose: find a control, work
through an existing situation, or check a definition. Its page structure is
described below and is what the Board redraws, screen by screen. The earlier
identity work is kept in the
[reference history](https://github.com/WaylandP/cipher-and-chalk/blob/archive/ai-review-records/docs/design-references/README.md).

## Identity and type

The mark is a chalk ring whose strokes spell C in Morse (dash dot dash dot):
`public/brand/mark.svg`, drawn inline by `src/components/board/Mark.tsx` with
the chalk filter. The app icon and favicon put the same ring on a yellow tile.
The lockup is the ring beside "Cipher & Chalk" in Walter Turncoat. No other
logo, monogram or wordmark.

Walter Turncoat is the chalk hand: headings, annotations and the lockup, never
body text. Atkinson Hyperlegible Next is for reading and interface text; Martian
Mono for anything that is code. All three are self-hosted from `public/fonts/`
with checksums in `public/fonts/sources.json` and licenses in
`public/font-licenses/`; the site loads no font packages and nothing from
Google Fonts. Preserve LICENSE, infrastructure/content IDs and source URLs.

## Palette and spacing

The tokens are the Board's, defined once in `src/styles.css` and listed in
[THE_BOARD.md](design/THE_BOARD.md): board `#1B2522` with its radial lift,
chalk `#EDE9DD`, chalk-muted `#C9CFC6` / `#9AA39B`, yellow `#F2D16B`, blue
`#8FB7D6`, the tray woods and the `rgba(237,233,221,.18)` rule. There are no
other hues; states use lightness. The legacy names the older page stylesheets
still reference (`--color-canvas`, `--color-accent`, `--font-code` and the
rest) alias these tokens until those stylesheets are retired. The shared
`src/styles.css` carries no retired values.

Structure is lines, chalk strokes and space: no cards, chips, pills, hero
blocks, icon rows, gradient washes or numbered markers. Desktop gutters are
48px, tablet 32px, phone 20px (`--gutter`); one screen per view at 1280×800.
Reading comfort must still be assessed with real people; a palette alone does
not establish it.

## One main task per page

- **Home `/`:** the Board's `mockups/Main.html`. Left: the question in chalk,
  a search line (an input on a chalk underline, no box) that submits the same
  discovery address as the header's find line, and one sentence of what the
  site holds. Right: the fourteen families with their catalog counts, each a
  link to filtered discovery. Bottom row: "Start here" with the default lesson,
  or "Last time" with the control opened last when optional saving is on, and
  the publication version. Home mounts no lesson and records nothing.
- **Learn `/learn`:** existing control discovery, exact source quotations,
  three perspectives and available draft practice. A selected control folds search,
  filters and results away at every width. “Browse & filter controls” reopens them.
  Discovery keeps them visible. An “On this page” outline in source references
  links to Source and Explain it, plus Watch the idea and Practice only when
  those exact lesson identities have matching content.
  Sources, review limits and recovery remain present.
- **Glossary `/glossary`:** searchable definitions on their own page. Inline
  definitions still open inside lessons without a page change.
- **Coverage `/coverage`:** a separate source-to-explanation index. Summary counts
  distinguish draft explanations, unresolved gaps and overlapping human-review
  status. Native search/filters, paginated control disclosures and exact lesson
  links keep detailed review work out of the primary reading workspace. Source
  quotations and teaching notes stay visibly separate; no compliance scores.
- **Practice `/practice`:** a searchable index of actual activities, optional local
  progress, revisit marks and clear source/draft context.
- **About `/about`:** mission, honest content limits and perspective shortcuts.

Native links support direct loads and normal browser navigation; Vercel rewrites
serve the six non-root paths. Legacy root query links and section hashes still
work. Explorer state stays in its existing controller. Native navigation/reloads
reset unsaved practice. Explicit optional saving restores version-bound checked
answers on this origin; there are no accounts or cloud synchronization.

Do not render a hidden learning workspace on Home: that creates false control-view
signals and unnecessary complexity. Production-only usage retains opt-out, DNT,
GPC and property restrictions. Only the seven public pathnames are allowed; queries,
fragments, answers and raw searches are never forwarded.

Home search submits to `/learn` with explicit discovery state and the reference
collection. It uses the existing search behavior and records only the allowlisted
search outcome, never the entered text. Searches still appear in the reader's
address bar and browser history; the privacy restriction concerns analytics.

## Accessibility and review

Keep semantic headings, keyboard-operable tabs, visible focus, native disclosures,
quiz radios/feedback and descriptive recovery links. Targets remain at least 44px;
selected reading tabs wrap at narrow widths. Test phones from 320px, tablet and
wide screens, reduced motion, forced colors and zoom. These checks are not a full
WCAG certification; real-reader comfort and screen-reader/Safari review remain pending.

Official quotations, fictional examples and pending human review must stay visibly
distinct. The design direction does not establish content approval.
See [the study-desk checkpoint](https://github.com/WaylandP/cipher-and-chalk/blob/archive/ai-review-records/docs/reviews/study-desk-2026-10-14.md).
That visual revision was merged in PR #12. The Phase 1 quality increment preserves
this direction and prepares [human acceptance](testing/PHASE_1_ACCEPTANCE.md);
it does not initiate a new visual redesign or imply owner acceptance.

### Practice index

`/practice` provides a quiet, numbered list of actual draft activities, with a
search and level filter, learning goals and exact edition-bound lesson links.
Levels follow the source catalog order; the project demo is not a level-filter result. It
uses the existing blackboard tokens and native navigation. Saving is off by
default. A closed disclosure explains it; saved-state filters require opt-in. A
small row action marks topics to revisit, and removing a filtered row restores
focus to the result summary. Earlier answers stay in a disclosure above the current
question. No scores, streaks or congratulatory overlays compete with the teaching.
Completing a practice activity is not a compliance score.
