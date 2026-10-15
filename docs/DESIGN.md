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
- **Learn `/learn`:** a selected control is the Board's control page
  (`mockups/Decode.html`, `Explain.html` and the phone variants). The identifier
  is decoded on the first line from the catalog and the publication it names,
  the title is the heading, and five views follow as links in the address
  (`tab=`; Decode is the default and never serialized): Decode shows the
  requirement sentence verbatim with each mapped clause underlined in yellow
  chalk and the letters of the objectives it produces beside it (the map is
  data in `src/data/cmmc-clause-map.json`; a control with no clean map shows
  the sentence plain), then its assessment objectives verbatim; Explain has the
  chalk picker, the explanation in the chalk's colour and the example in the
  margin; Evidence has the compliance questions and evidence examples; Practice
  holds the existing activity and visual lesson; Related lists neighbours by
  identifier and title, the words, the objectives index and the sources. A
  footer line carries the citation or one sentence of provenance and
  Previous/Next within the current results. “Browse & filter controls” sits
  under the page and reopens search, filters and results. Discovery and the
  project's demo lesson keep their earlier layout until their own pass.
  With a control on the board the tray's three chalks are the perspective
  switch (a `Pick a chalk` navigation; the chalk in hand is pressed and
  lifted); on a phone the tray is the bottom bar, 72px, labelled, ending the
  page rather than floating over it, so no tap target is covered
  (`mockups/Phone.html`, `PhoneExplain.html`); Explain keeps its own chalk
  picker on phones because the bar is not fixed. Keys,
  wherever nothing is being typed and no dialog is open: `j` and `k` step to
  the next and previous control within the current results and focus the
  title, `1`, `2`, `3` pick a chalk and open Explain, `/` opens the find line
  (the search line on Home), `?` shows the keys in a dialog that Escape
  closes, returning focus. Print gives a one-page control sheet: the lockup,
  the ID decoded, the title, the requirement sentence and its objectives with
  the verbatim citation, plus the open Explain or Evidence view; black on
  white, no tray, nav, footer, tabs or actions.
- **Glossary `/glossary`:** the Board's Words page (`mockups/Glossary.html`).
  Left: "Words", a search line, an A–Z row with the active letter on a yellow
  block, and four groupings derived from each word's sources (the program,
  scoping, the clauses, the lessons). Right: one letter of words in
  two columns, each with its definition and its source in blue mono, linked.
  The letter and the group live in the address (`?letter=`, `?group=`);
  typing a search never touches history. Inline definitions still open inside
  lessons without a page change.
- **Coverage `/coverage`:** a separate source-to-explanation index on the
  Board's lines: one sentence, the counts on one rule, a search line with two
  quiet selects, paginated control disclosures and exact lesson links. Source
  quotations keep a yellow chalk rule beside them and teaching notes stay
  visibly separate; no compliance scores.
- **Practice `/practice`:** a searchable index of actual activities as rows on
  hairlines (no numbered markers), optional local progress, revisit marks and
  the control identifier in blue mono.
- **About `/about`:** mission and honest content limits in sentences, and the
  three chalks as links into a control. **Disclaimer `/disclaimer`:** the same
  frame, its text unchanged.

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
