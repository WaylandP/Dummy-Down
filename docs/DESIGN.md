# Cipher & Chalk design

**Current direction: [The Board](design/THE_BOARD.md)**, approved October 14, 2026,
with the eight approved screens in [design/mockups](design/mockups/). Build
work follows that specification.

## What is live

The app shell is the Board's: the slate ground with chalk dust, the Morse-C ring
and lockup, the six-item nav with a find line, the footer line above the tray and the
wooden tray with Smudge on it, drawn from the tokens and fonts in `src/styles.css` and the
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

- **Home `/` (October 15, `mockups/2026-10-15/HomeHero.html`):** one thing
  first, then second, then third. A kicker in the chalk hand, yellow ("A free
  reference desk for cybersecurity compliance", a paragraph); the page's one
  `h1` in the chalk hand, "CMMC, / in plain words.", two lines as large as
  the hero's own width allows (about 100px beside the chalk talk at 1280,
  112px at most, about 50px on a phone at 390); one supporting line
  at 20px, muted, with the count from the catalog ("All 149 controls across
  the three levels, each quoted from the official guide with its page, then
  explained three ways. More frameworks to come."); then "Pick up a chalk to
  start." and the three chalks as the main action, in a list of that name:
  large sticks (20px tall) with a label in the chalk hand and one short line,
  "I'm new to this" ("Level 1's fifteen basics first.", the count from the
  catalog) to Controls filtered to Level 1 with the first Level 1 control on
  the board in white, "I run the systems" ("The fourteen families.") to the
  Controls page in yellow, "I'm
  preparing for an assessment" ("Examine, interview, test.") to the
  assessment objectives in blue; the stick lifts a few pixels under the
  pointer or keyboard focus (not under reduced motion; the focus ring stays).
  At the end of that row, "Or find a control…", the search line (an input on
  a chalk underline, no box) that submits the same discovery address as the
  header's find line; on a phone the chalks stack as rows (stick left, 44px
  tall) and the search follows them. No "What this is" column, no "Who's
  reading?", no decode example. The headline names CMMC on purpose; it is
  reworded when a second framework ships. Beside the hero, from the kicker
  down to just above "Pick up a chalk to start." with a hairline rule on its
  left (`mockups/2026-10-15/HomeChalkTalk.html`), the chalk talk "CMMC in
  sixty seconds": eight scenes of 7.5 seconds from `src/data/chalk-talk.ts`,
  each a caption of twenty words or fewer with its pinned sources, drawing
  one diagram part by part (strokes along their length, lettering left to
  right, chalk with yellow arrows and level labels); a 44px play/pause
  button, a chalk dash per scene that jumps to it (44px tall, 24 to 32px
  wide, sharing the row), the time in mono, the caption under the drawing,
  glossary words in it opening their popovers. In the DOM the talk follows
  the chalks and the search, as on a phone's screen. It plays once on a
  desktop, pauses while the tab is hidden or a caption's word has focus,
  never loops,
  and ends on "Watch again", which has Smudge sweep the board before it
  starts over; under reduced motion the finished drawing stands with the
  captions stepped by Previous and Next; the drawing is aria-hidden and the
  captions are an ordered list in a region of that name, the current one
  marked; on a phone it follows the chalks and the search and waits for
  play. No audio, no analytics events. Choosing a chalk remembers it under
  `cipher-and-chalk:chalk:v1` in this browser, and an address that names no
  chalk opens in it from then on. "Last time" shows the control opened last
  when optional saving is on. The publication version lives on About. Home
  mounts no lesson and records nothing. The header's nav is Home · Controls ·
  Glossary · Practice ·
  Timeline · About, the one you are on under a yellow chalk stroke; Controls
  is lit for every `/learn` address, a control on the board included.
- **The shell (October 15):** the footer line (the disclaimer and "Disclaimer
  & terms", Assessment objectives, Usage & privacy, Smudge: on/off, Open
  source · MIT) sits directly above the tray on every page. At desktop sizes
  (1024 wide and 640 tall or more) the header, the footer line and the tray
  stay put and only the content between them scrolls, with scroll padding so a
  focused element is never hidden, and the scrolling keys reach the content
  from a fresh load or the header; below that the tray is the bottom bar and
  the footer line ends the content. The footer line's links are 44px targets
  in their padding; where the line wraps they are rows of their own. The content ends above Smudge at every
  size, so no text or control sits under him. The tray holds the three chalks,
  the doodle chalk and Smudge; the fourth stub is gone.
- **The doodle chalk (October 15, `mockups/2026-10-15/Doodle.html`):** a fat
  white stick with a kraft-paper sleeve just left of Smudge, on screens 768
  wide or more: a button, "Doodle chalk", pressed while the chalk is up (`d`
  too; Esc and the slot put it back). Up, the slot keeps a dashed outline, the
  cursor is a chalk tip, and a layer over the content only takes the marks:
  chalk white at .9, about 3px, smoothed, with the chalk filter, anchored to
  the text so they scroll with it. The footer line says "Doodling. Your marks
  stay on this page and go with its link. Esc or the tray puts the chalk
  back. Pick up Smudge to erase." while it is up. Smudge's eyes follow the
  tip. Links under the layer are inert while the chalk or Smudge is up, the
  wheel still scrolls, one finger draws and two scroll, and print leaves the
  marks out. The marks stay when the chalk goes down and belong to the page
  they were drawn on: kept in memory, per canonical address, while the page
  stays loaded (never in storage; a header link loads a fresh page, so Back,
  Forward and the link itself bring them back there), shown again on the way
  back by any route within it, and
  carried in the page's link as the fragment `#ink=v1…` (never the query),
  rewritten with replaceState as you draw, so a reload, Copy reference link
  and Send this chalk keep them. The encoding is compact and versioned
  (simplified strokes in whole pixels relative to the content area, deltas,
  deflate where available, base64url), under about 2,000 characters for a
  typical page and capped near 4,000, where the line reads "The board is
  full. Erase something to keep drawing." The content width travels with
  the marks: within about 15% they are drawn scaled; otherwise they are left
  out and the line says "This link has chalk marks drawn on a different
  screen size. Open it on a wider screen to see them." A link someone else
  made shows its marks with "Chalk marks from the link you opened. They
  aren't part of Cipher & Chalk. Pick up Smudge to erase them · Wipe all"
  until they are wiped. Whenever the page shows marks Smudge is a button,
  "Smudge, the eraser" (`e`, aria-pressed): in hand, the cursor is a small
  eraser, rubbing removes each stroke it touches as dust, and the line reads
  "Erasing. Esc or the tray puts Smudge back · Wipe all"; the chalk and
  Smudge put each other down. Reduced motion and forced colours: no dust,
  the marks just go. Analytics never see the fragment; the marks are never
  stored, sent or counted.
- **Controls `/learn` (October 15, `mockups/2026-10-15/Controls.html`):** the
  Controls page and the control page are one screen with Learn merged in. A
  rail of every control stands on the left, always visible at desktop widths
  and scrolling on its own: a find line that filters the rail as you type
  (the same `q` as the results); the level switch All · 1 · 2 · 3 (the
  existing `level` filter); then the fourteen
  families with their counts for the level in force, collapsible, the open one
  listing its control IDs and titles five at a time, the current one with the
  yellow bar. Every count comes from the catalog. On the right stands the
  control exactly as before; with no control chosen, the overview: "Controls"
  in chalk with one sentence, the quiet collection and framework selects, the
  result count, the three levels as a quiet row and the results as rows
  between hairlines that page eight at a time, at full width (the rail holds
  the families; below desktop widths, where it waits in its sheet, the
  overview keeps the fourteen families as links beside the results). Beside a
  control the family rows open in place and the control stays; in the
  overview they also filter the results. A pick from the rail that the
  filters would hide brings the collection, framework, family, level or query
  along with it. The foot steps through the results with Previous and Next.
  Below 1024px the rail is a sheet: an "All controls" line at the top of the
  page opens it full screen on its find line. Home's "I'm new to this" row
  opens Controls filtered to Level 1 with the first Level 1 control on the
  board in the white chalk. The "Start here" path (`path=basics`, "n of 15",
  "Next on the path") was removed on October 15; an old link that carries it
  opens its control and the parameter is ignored.
- **The control page `/learn`:** a selected control is the Board's control page
  (`mockups/Decode.html`, `Explain.html` and the phone variants). The identifier
  is decoded on the first line from the catalog and the publication it names,
  the title is the heading, and the views follow as links in the address
  (`tab=`; Decode is the default and never serialized; `chalk=white|yellow|blue`
  opens Explain in that chalk unless the link names a view, and is rewritten to
  `mode=` and `tab=` once read; analytics never carry a query, so the parameter
  is never sent): Decode shows the
  requirement sentence verbatim with each mapped clause underlined in yellow
  chalk and the letters of the objectives it produces beside it (the map is
  data in `src/data/cmmc-clause-map.json`; a control with no clean map shows
  the sentence plain), then its assessment objectives verbatim; Explain has the
  chalk picker, the explanation in the chalk's colour and the example in the
  margin; in both, the first mention of each word listed for the lesson carries
  a chalk popover with the definition and its source on hover, tap or Enter,
  placed on the screen, closed by Escape with focus returned; Evidence opens with the assessor's three words, Examine the document, Interview the role, Test the action, each a column listing verbatim what the pinned assessment guide prints under "Potential Assessment Methods and Objects" for the control with the guide and page cited once, then the compliance questions and evidence examples; Practice
  holds the existing activity and visual lesson; Related lists neighbours by
  identifier and title, the words, the objectives index and the sources; Rev
  3, on Level 2 controls only, reads the pinned Rev 2 requirement beside its
  NIST SP 800-171 Revision 3 counterpart, both verbatim, with one sentence on
  what changed (`src/data/cmmc-rev3-map.json`) and says once that CMMC is
  pinned to Rev 2. A footer line carries the citation or one sentence of
  provenance and
  Previous/Next within the current results (the old “Browse & filter
  controls” disclosure is gone; the rail is the navigator). Print, Copy
  reference link and Send this chalk are the actions, above the title (at the
  foot of the page on a phone); the chalk link opens Explain in the chalk in
  hand. Discovery and the project's demo lesson keep
  their earlier layout until their own pass.
  With a control on the board the tray's three chalks are the perspective
  switch (a `Pick a chalk` navigation; the chalk in hand is pressed and
  lifted); on a phone the tray is the bottom bar, 72px, labelled, ending the
  page rather than floating over it, so no tap target is covered
  (`mockups/Phone.html`, `PhoneExplain.html`); Explain keeps its own chalk
  picker on phones because the bar is not fixed. Smudge is the eraser on the
  tray's right end on every screen, the phone bar included
  (`mockups/Smudge.html`, sized as in `Home.html`): one SVG with a wooden
  back, a felt face with dust in it, and eyes, brows and a mouth drawn in the
  chalk filter, hidden from assistive technology and never focusable. Idle he
  blinks every few seconds, his pupils drift a few pixels toward the cursor
  (pointer only, never on touch) and a small puff of dust rises about once a
  minute; asked to wipe, he sweeps (up off the tray, once across the board
  with his eyes closed in 400 ms, and back); he leans and nudges the
  chalk that was picked up out of the tray (while the page shows chalk
  marks he is a button to pick up instead, "Smudge, the eraser", and his
  place keeps a dashed outline while he is in hand); a click or tap on him, or a
  correct practice answer, is a sneeze of dust; after a minute with no input
  he dozes with two chalk z's and any key or pointer wakes him. Each gesture
  is one CSS animation, then he is still; clicking him does nothing else. The
  footer's "Smudge" switch turns him into the plain faceless eraser and
  remembers only `off`, under `cipher-and-chalk:smudge:v1` in this browser;
  reduced motion shows the plain eraser as well, and print hides the tray.
  Between controls (Previous and Next, the keys, a result, Back and Forward)
  the new control is on the board at once, with focus and the announcement
  exactly as before; the Erase that swept the old chalk off as dust was
  removed by the owner on October 15, so nothing moves on a change of
  control. Keys,
  wherever nothing is being typed and no dialog is open: `j` and `k` step to
  the next and previous control within the current results and focus the
  title, `1`, `2`, `3` pick a chalk and open Explain, `/` opens the find line
  (the search line on Home), `?` shows the keys in a dialog that Escape
  closes, returning focus. Print gives a one-page control sheet: the lockup,
  the ID decoded, the title, the requirement sentence and its objectives with
  the verbatim citation, plus the open Explain, Evidence or Rev 3 view; black on
  white, no tray, nav, footer, tabs or actions. With the Evidence view open the
  three words print compact, and a control with long lists runs to a second
  page.
- **Glossary `/glossary`:** the Board's Words page (`mockups/Glossary.html`).
  Left: "Words", a search line, an "All" button before the A–Z row (pressed
  by default; the active letter sits on a yellow block), and four groupings
  derived from each word's sources (the program, scoping, the clauses, the
  lessons). Right: by default every word under its letter heading in the same
  two-column flow, the column scrolling on its own in the desktop frame; a
  letter, a group or a search narrows it to one letter of words, a group or
  the matches, each word with its definition and its source in blue mono,
  linked. The letter and the group live in the address (`?letter=`,
  `?group=`; `/glossary` alone is every word); typing a search never touches
  history. Inline definitions still open inside lessons without a page
  change.
- **Coverage `/coverage`:** a separate source-to-explanation index on the
  Board's lines: one sentence, the counts on one rule, a search line with two
  quiet selects, paginated control disclosures and exact lesson links. Source
  quotations keep a yellow chalk rule beside them and teaching notes stay
  visibly separate; no compliance scores.
- **Practice `/practice` (October 15, `mockups/2026-10-15/Practice.html`):**
  practice runs in place. Left: "Work through a situation.", one line, a find
  line that narrows the list as you type (never in history), the level switch
  (`?level=`), the thirteen situations as rows on hairlines (titles without
  their "Practice:" prefix, the control's ID beside each, the one running
  under the yellow bar), and at the bottom "Keep my progress on this browser:
  off/on" (the same local-only, opt-in, deletable saving; turning it off
  deletes it) with "Hide finished" once it is on. Right: the situation
  running: the control's ID, level and title, "Question n of m" with chalk
  dashes, the prompt large, the choices as rows with chalk circles (choosing
  one answers it); after an answer its feedback under it, then "Next
  question →" ("Finish practice" on the last), "Read the requirement" (the
  control's Decode) and "Watch the 40-second chalk talk" where there is one;
  after the first answer "A common mix-up" with the activity's claim struck
  through in chalk and its correction; every word from the activity's data.
  The situation and the question live in the address (`?activity=`, `?q=`;
  `/practice` alone runs the first situation); older index links with a
  search prefill the find line. On a phone the list comes first and a
  situation opens full width with "← All situations".
- **About `/about` (October 15, `mockups/2026-10-15/About.html`):** mission
  and honest content limits in sentences (who makes this before CMMC in one
  paragraph, as the mockup orders them), and the three chalks as links into a
  control; beside them at desktop widths, after them below, "What's next on
  the board": on the board (ticked; the counts come from the data), next and
  later in the roadmap's words (`docs/ROADMAP.md` says no more and no less),
  "Directions, not dates." and a link to suggest something on GitHub.
  **Disclaimer `/disclaimer`:** the same frame, its text unchanged.
- **Timeline `/timeline`:** the dates that matter on one screen: the six dates
  on a yellow chalk line, how long each status stays current, and what DoD
  has said about Revision 3, each sentence paraphrased over its quoted source
  (`src/data/cmmc-timeline.json`), the sources one disclosure per section on
  a row at the foot, open in print. On phones the six places to go wrap to
  a further row.

Native links support direct loads and normal browser navigation; Vercel rewrites
serve the seven non-root paths. Legacy root query links and section hashes still
work. Explorer state stays in its existing controller. Native navigation/reloads
reset unsaved practice. Explicit optional saving restores version-bound checked
answers on this origin; there are no accounts or cloud synchronization.

Do not render a hidden learning workspace on Home: that creates false control-view
signals and unnecessary complexity. Production-only usage retains opt-out, DNT,
GPC and property restrictions. Only the eight public pathnames are allowed; queries,
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

### Practice

`/practice` lists the actual draft activities as situations in the catalog's
order and runs the one picked beside them (the Practice bullet above has the
October 15 layout). The project demo is not a level-filter result. Saving is
off by default; the page's own line turns it on, and once on, finished
situations are marked and can be hidden. Revisit marks stay in the lesson's
Practice view, with its disclosures of earlier answers. No scores, streaks or
congratulatory overlays compete with the teaching. Completing a practice
activity is not a compliance score.
