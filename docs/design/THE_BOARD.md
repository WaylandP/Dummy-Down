# The Board — design specification

Approved by the owner on October 14, 2026 from the design canvas, with the Home
screen and the mascot revised on October 15. This replaces the "reference desk"
direction in `DESIGN.md`. The files in `docs/design/mockups/` are the approved
screens as HTML; open them in a browser.
They are the source of truth for color, type, spacing and copy voice. Where this
document and a mockup disagree, the mockup wins.

## The idea in one paragraph

It is a chalkboard, not a dark theme. Slate green-black with chalk dust in the
surface, a wiped-smudge glow, hand-drawn chalk strokes as real SVG paths with a
grit filter, and a wooden chalk tray along the bottom of every screen. The three
chalks in the tray are the three perspectives: white is for someone new to this,
yellow for the person who runs the systems, blue for the person preparing for
assessment. Pick a chalk and the explanation is written in that color; the stick
lifts out of the tray. Cipher is literal: a control's ID decodes itself on
arrival, and the requirement sentence is decoded clause by clause into the
assessment objectives it produces. The eraser on the tray is the mascot.

## Rules

1. One screen per view on desktop (1280×800 is the design size). Nothing a
   visitor needs is below the fold. Depth lives in tabs.
2. A control has five tabs: Decode, Explain, Evidence, Practice, Related. A sixth,
   Rev 3, arrives with that feature.
3. A sentence where there used to be a paragraph. No restating the heading. No
   disclaimers on elements; one line in the footer and the Disclaimer page.
4. No cards, chips, pills, hero blocks, icon rows, gradient washes or numbered
   markers. Structure is lines, chalk strokes and space.
5. Everything that moves is answering the visitor.
6. Keyboard first: `j`/`k` previous and next control, `1`/`2`/`3` pick a chalk,
   `/` find a control, `?` show these.

## Tokens

| Token       | Value                             | Use                                                                          |
| ----------- | --------------------------------- | ---------------------------------------------------------------------------- |
| board       | `#1B2522`                         | the ground; radial lift to `#243330` at the top-left, `#161F1C` at the edges |
| chalk       | `#EDE9DD`                         | the voice: body text, white chalk, the mark                                  |
| chalk-muted | `#C9CFC6` / `#9AA39B`             | secondary and tertiary text                                                  |
| yellow      | `#F2D16B`                         | underlines, annotations, the yellow chalk, the active tab stroke             |
| blue        | `#8FB7D6`                         | anything that is code: IDs, objective letters, the blue chalk                |
| tray        | `#5E4A36` → `#4A3A2B` → `#3B2E22` | the wooden tray; label text on it `#C9B795`                                  |
| rule        | `rgba(237,233,221,.18)`           | hairlines between regions                                                    |

No other colors. Level badges, success and error states use chalk, yellow and
blue plus lightness, never new hues.

Type: **Walter Turncoat** for the chalk hand (headings, annotations, the
lockup; never body text), **Atkinson Hyperlegible Next** for reading and UI
(fallback Atkinson Hyperlegible), **Martian Mono** for anything that is code.
Self-host all three from `@fontsource` packages with licenses recorded in
`public/font-licenses/` like the existing fonts; do not load from Google Fonts.
Retire Kalam, Changa One, Barlow, IBM Plex Sans and Space Grotesk.

Chalk effect: an inline `<svg>` filter (`#chalk`: fractal-noise displacement
plus a luminance-to-alpha composite, see any mockup's `<defs>`) applied to
headings, the lockup and every hand-drawn stroke. Board dust: a full-bleed
fractal-noise rect at ~16% opacity, `mix-blend-mode: screen`, pointer-events
none. Both live once in the app shell, not per component.

## Screens

**Home** — `mockups/2026-10-15/HomeHero.html` (the owner's approved Home,
October 15, after review; it supersedes `mockups/2026-10-15/Home.html`, which
superseded `mockups/Home.html` and `Main.html`). Written for the stranger who
arrives from a shared link, with one thing clearly first, then second, then
third. Header: the lockup and the nav, Home first, the active item under a
yellow chalk stroke. Then, in order: a small line in the chalk hand, yellow,
"A free reference desk for cybersecurity compliance" (a paragraph, not a
heading); the page's one `h1`, in the chalk hand at 112px on desktop, "CMMC,"
then "in plain words.", scaling down with a clamp; one supporting line at
20px, muted, "All 149 controls across the three levels, each quoted from the
official guide with its page, then explained three ways. More frameworks to
come." (149 from the catalog); "Pick up a chalk to start." and the three
chalks as the main action, each a large stick with a label in the chalk hand
and one short line ("I'm new to this" / "Level 1's fifteen basics first." →
Controls filtered to Level 1 with the first basic on the board, in white; "I
run the systems" / "The fourteen families." → the families in yellow; "I'm
preparing for an assessment" / "Every objective, quoted." → the objectives
in blue), grouped in a list labelled "Pick
up a chalk to start.", each picking its chalk for the visitor, the stick
lifting a few pixels under the pointer or keyboard focus (not under reduced
motion; the focus ring always visible); then "Or find a control…", the search
line, at the end of that row. No "What this is" column, no "Who's reading?",
no decode example. The headline names CMMC on purpose; it is reworded when a
second framework ships. On a phone the headline stays two lines, as large as
the width allows (about 50px at 390: "in plain words." is 7.04em wide in the
chalk hand, so 56px would wrap), the chalks stack as rows (the stick on the
left, 44px tall) and the search follows them. The footer line is the site's
(see October 15 fixes, 1). Smudge sits on the right end of the tray. The
fourteen families live on the Controls page. Beside the hero, from the kicker
down to just above "Pick up a chalk to start." with a hairline rule on its
left, "CMMC in sixty seconds" (see October 15 fixes, 9), playing in its own
panel, resting on its finished clock; the headline is sized from the hero's
own width, about 100px beside it at 1280.

Home fills big screens (October 16). The hero and the panel scale with the
window's width and height together, so the top half fills the space above
"Pick up a chalk to start." on every screen, with nothing to scroll. The
panel's column is sized from the frame's height: the row above the chalks
(the frame less the header, the footer, the page's padding and the chalks
row) sets how tall a panel can be, and the panel is as wide as a board,
player row, caption and note that tall need, ending about 56px above "Pick
up a chalk" (as at 1280×800): 397px at 1280×800 and 1366×768 as before,
about 510px at 1440×900 and 1512×860, 624px at 1728×980 (a 624×282 board, a
132px headline, a 24px lead), 750px at 1920×1080, 1086px at 2560×1300, never
wider than 45% of the frame or 1100px. Everything in the panel is sized from
its width (container query units): the title, the board, the player row
(44px targets growing to 72px), the time, the speed, the caption and the
note, and every board word grows with the board, from 11px. The hero is a
grid of its column's height: the kicker, the headline (two lines, sized from
the column as before, up to 200px) and the lead (20px to 36px, on a measure
of about 70 characters), the room left over going two fifths above the
headline and three fifths below it, so the lead ends 52px above "Pick up a
chalk", about where the panel ends. Tablets and phones are as they were. No
JavaScript lays anything out: `clamp()`, `min()`, `max()`, `dvh`, `vw` and
`cqw` do it (`home.css`, `sixty.css`); `tests/browser/home-fill.spec.ts`
checks the fit, the gaps, the overlaps, the two lines and the 11px floor at
1280×800, 1366×768, 1440×900, 1470×830, 1512×860, 1536×864, 1728×980,
1920×1080 and 2560×1300.

**Control, Decode** — `mockups/Decode.html`. Top line: the ID in blue mono,
then a chalk arrow, then the ID decoded (family, level, source requirement).
The title in chalk. Tabs with a yellow chalk stroke under the active one. The
requirement sentence large, each clause underlined in yellow chalk with its
objective letters in chalk hand. Under it, the decode table: three rows (users,
processes, devices) by two questions (identified? limited?) holding the six
objectives verbatim. Footer line: the citation and previous/next.

**Control, Explain** — `mockups/Explain.html`. Left: "Pick a chalk" with the
three sticks as buttons; the chosen stick lifts and tilts. The explanation is
set in that chalk's color at 28px. A chalk-ruled margin column holds the
example ("One way to do it", "Watch for", or "At work") in the hand.

**Control, Evidence** — not mocked. Same frame. The assessor's three words:
Examine (the document), Interview (the role), Test (the action) for this
control, then the evidence examples from the compliance perspective.

**Control, Practice / Related** — not mocked. Same frame. Practice runs the
existing activity inside the tab, one question per screen. Related holds the
Level 1 sibling, controls that build on this one, and the cross-walk.

**Glossary** — `mockups/Glossary.html`. Left: "Words", a search line, an A–Z
row with the active letter on a yellow block, four groupings. Right: two
columns of terms for one letter, each with its source in blue mono.

**Phone** — `mockups/Phone.html`, `mockups/PhoneExplain.html`. The tray is the
bottom bar; its three chalks are the perspective switch, labelled. Tabs scroll
horizontally. Everything else stacks.

**The mark** — `mockups/Logo.html`. A chalk ring whose strokes spell C in Morse
(dash dot dash dot): `stroke-dasharray="72 17 14 17 72 17 14 16"` on a circle
r=38 in a 100-unit box, rotated −100°. App icon: the same ring on a chalk or
yellow tile with radius 22. Replace `public/brand/*` and the favicon with it.

**Smudge** — `mockups/Smudge.html` (replaces Dash; built). The eraser on the right
end of the tray, on every screen: a wooden back, a felt face with chalk dust in
it, and eyes, brows and a mouth drawn on the wood in chalk. Idle: blinks, eyes
drift toward the cursor, a puff of dust now and then. Sweep, only when asked
(wiping chalk marks, and when "CMMC in sixty seconds" reaches its end): he
leaps up and sweeps across the board. The mockup's
"Erases" panel describes the Erase between controls, since removed. Pick a
chalk: he nudges
that stick up out of the tray. Click or tap him, or finish a practice item
correctly: a sneeze of dust. A minute idle: he dozes, and any input wakes him.
Never speaks. Off switch in the footer; a plain faceless eraser in print and
under reduced motion.

## October 15 fixes

The owner's October 15 review, drawn in `mockups/2026-10-15/` (its README
says what each screen changes). Where a mockup and the review's note disagree,
the mockup wins on look and the note on behavior. Seven pieces, then two
more from the owner's October 15 feedback, one pull request each; each line
says whether it is built.

1. **The shell** (built). The footer line (the disclaimer and "Disclaimer &
   terms", Assessment objectives, Usage & privacy, Smudge: on/off, Open
   source · MIT) sits directly above the tray on every page, in the wording of
   the mockups; Home's own footer line is gone. At desktop sizes (1024 wide
   and 640 tall or more) the header, the footer line and the tray stay put and
   only the content between them scrolls, with scroll padding so a focused
   element is never hidden under a band; below that the tray is the bottom bar
   and the footer line ends the content. The nav is Home · Controls · Glossary
   · Practice · Timeline · About; Controls is lit for every `/learn` address,
   and every `/learn` link keeps working. The tray's fourth stub is gone (the
   doodle chalk takes its place). Content keeps clear of Smudge at every size.
2. **Controls with Learn merged in** — `Controls.html` (built). A rail of
   every control beside the control, always visible at desktop widths and
   scrolling on its own: a find line that filters it as you type, the level
   switch All · 1 · 2 · 3 on the existing level filter, and the fourteen
   families with their counts for the level in force, collapsible, the open
   one listing its controls with the current one under the yellow bar; every
   count from the catalog. On the right the control exactly as before, and
   with no control chosen the overview (the results at full width beside the
   rail; below desktop widths, with the families as before). Beside a control
   the family rows open in place. The foot steps through the results with
   plain Previous and Next. The old "Browse & filter controls" disclosure is
   gone. Phone: an "All controls" line at the top opens the rail as a
   full-screen sheet. Home's "I'm new to this" chalk opens Controls filtered
   to Level 1 with the first Level 1 control on the board in the white chalk.
   The mockup's "Start here" block (the fifteen Level 1 basics in order as a
   path in the address, `path=basics`, with "n of 15", the chalk dashes and
   "Next on the path") was built and then removed by the owner on October 15;
   an old link that still carries `path=basics` opens its control and the
   parameter is ignored.
3. **Home: what this is** — `Home.html` (built, then superseded by the Home
   hero, below). The sentence at the top right went; the "What this is"
   column stood beside the rows with the counts from the catalog and the
   Phase 4 research list; no page copy says the site covers only Level 2.
   The tray's legend shows on Home too, as drawn.
4. **Glossary: All** (built). An "All" button before A, pressed by default
   (`aria-pressed`, a 44px target, in the tab order): every word under its
   letter heading in the same two-column flow, the column scrolling on its
   own in the desktop frame. The letters filter as before and live in the
   address; `/glossary` alone is every word.
5. **Practice runs in place** — `Practice.html` (built). The thirteen
   situations on the left (a find line, the level switch, titles without
   their "Practice:" prefix with the control's ID, the one running under the
   yellow bar, and "Keep my progress on this browser: off/on" with "Hide
   finished" once on); on the right the situation running: ID, level, title,
   "Question n of m" with chalk dashes, the scenario's title and the
   introduction, the steps in "The situation" beside the question (under it
   where the column is narrow; an open disclosure above it on a phone), the
   prompt, the choices as rows with
   chalk circles, the feedback under the answer, then "Next question →",
   "Read the requirement" and "Watch the 40-second chalk talk" where there is
   one, and after the first answer "A common mix-up" struck through in chalk
   with its correction. After an answer the feedback takes focus and the run
   scrolls only as far as it takes to keep "Next question" in view under it
   (at once under reduced motion). The address is `/practice?activity=<id>&q=<n>`;
   older practice links keep working; the first situation runs by default.
   Phone: the list first; a situation opens full width with a way back.
6. **About: what's next** — `About.html` (built). The "What's next on the
   board" column beside the sentences (after them below desktop widths): on
   the board (ticked, counted from the data), next and later, in the
   roadmap's words; "Directions, not dates." and a link to suggest something
   on GitHub.
7. **The Home hero** — `HomeHero.html` (built; the owner's approved Home,
   superseding `Home.html`). The hierarchy above under **Home**: the kicker,
   the one headline, one supporting line, "Pick up a chalk to start." with
   the three chalks as the main action, then the search line; the column,
   the question and the decode example are gone. The headline names CMMC on
   purpose; it is reworded when a second framework ships.
8. **The doodle chalk** — `Doodle.html` (built). A fat white stick with a
   kraft-paper sleeve in the tray, just left of Smudge, on screens 768 wide
   or more: a button, "Doodle chalk", pressed while the chalk is up; `d`
   picks it up and puts it down, Esc and the slot put it down. Up, the stick
   leaves the tray (its slot keeps a dashed outline), the cursor is a chalk
   tip, and a drawing layer covers the content only, anchored to it, so the
   marks scroll with the text. Strokes are chalk white at .9, about 3px,
   smoothed, with the chalk filter; CanvasText under forced colors. The
   footer line reads "Doodling. Your marks stay on this page and go with its
   link. Esc or the tray puts the chalk back. Pick up Smudge to erase.",
   once, politely. Smudge's eyes follow the tip. Links under the layer are
   inert while the chalk or Smudge is up, the wheel still scrolls, one
   finger draws and two scroll, and print never includes the marks.
   Chalk marks stay (October 15, after the owner's review). Putting the
   chalk down keeps the marks on the page; they go only when erased. Marks
   belong to the page they were drawn on (its canonical address) and are
   kept in memory, per page, while the page stays loaded, so navigating
   away and back within it by any route shows them again (a header link
   loads a fresh page, so there Back, Forward and the link itself bring
   them back): never localStorage, sessionStorage or a server. They travel
   in the link, in the fragment only (`#ink=v1…`, never
   the query), rewritten with replaceState as you draw, so a reload keeps
   them and Copy reference link and Send this chalk carry them. The encoding
   is compact and versioned: strokes simplified and quantized to whole
   pixels relative to the content area, delta-encoded, deflated where the
   browser can, then base64url; a typical page stays under 2,000 characters
   and the fragment is capped near 4,000, where no stroke is added and the
   line reads "The board is full. Erase something to keep drawing." The
   content area's width goes in with the marks: a screen within about 15%
   draws them scaled, any other leaves them out and says "This link has
   chalk marks drawn on a different screen size. Open it on a wider screen
   to see them." Marks from a link someone else made always come with the
   line "Chalk marks from the link you opened. They aren't part of Cipher &
   Chalk. Pick up Smudge to erase them · Wipe all", gone once wiped (whose
   marks a fragment carries is kept in the history entry's state, never in
   storage, so a reload of your own page shows them as yours and a reload of
   someone else's link keeps its line). Smudge is the eraser: whenever the page
   shows marks he is something to pick up, like the chalk, a button "Smudge,
   the eraser" (aria-pressed, `e`, in the `?` dialog); in hand his place
   keeps a dashed outline, the cursor is a small eraser, and rubbing over a
   mark removes each stroke it touches as dust in the sweep's 400 ms; the
   line reads "Erasing. Esc or the tray puts Smudge back · Wipe all", and
   Wipe all sweeps everything with his gesture. Picking up the chalk puts
   Smudge down, and the reverse. With no marks on the page he stays
   decorative and not focusable. Reduced motion and forced colors: no dust
   or sweep, the marks just go; CanvasText. Analytics never see the fragment
   (asserted). A resize keeps the marks: scaled within 15%, waiting beyond.
9. **CMMC in sixty seconds** — `SixtySeconds.html` and
   `SixtySeconds-HANDOFF.md` (built; the owner's approved animation, which
   replaced the chalk talk from `HomeChalkTalk.html`; rebuilt on October 16
   to play in its panel, and again so the chalk draws). Sixty seconds of
   chalk in eight chapters (Who, Levels, The clock, Certify, Every year, Big
   change, Repeat, Bottom line), every mark written by hand under the chalk
   filter with a chalk stick at the tip, in the site's own faces and tokens;
   the captions are the owner's, their glossary words (FCI, CUI, SPRS,
   C3PAO) opening the chalk popovers. It plays on Home inside its own
   panel, beside the hero from the kicker down to just above "Pick up a
   chalk to start." (397px wide at 1280×800 and 1366×768, wider on bigger
   screens, see Home above; the width under the search on a tablet,
   capped at 560px; the width of the page on a phone): the title in yellow
   chalk (an `h2` that names the region), the board, the player row, then
   the caption with the Phase 2 note under it. The same panel rests and
   plays, so nothing moves when Play is pressed and the address does not
   change, and Home still fits one screen at 1280×800 and 1366×768 with the
   chalks and the search in view. Resting, the board shows the finished
   clock, the time reads "1:00" and the caption slot reads "Three years of
   CMMC Level 2, drawn in one minute."; nothing plays on its own. Play,
   Replay or a click on the board clears the board with a quick pass of
   Smudge (half a second before 0:00; at once under reduced motion), then
   draws in place; at 1:00 the finished clock stays, which is the resting
   board again, and Smudge sweeps. The board is drawn for the panel, two
   scenes on one slate. Scene 1, Who and Levels, done by 0:15: DoD, an arrow
   with "shares information" over it, your company; FCI → Level 1 over "15
   rules · self-assess yearly"; CUI → Level 2 over "110 rules · NIST SP
   800-171"; critical CUI → Level 3 over "Level 2 + 24 more · DIBCAC"; then
   Level 2 is circled, 0:15.0 to 0:15.6. Between 0:15.7 and 0:16.9 Smudge,
   as drawn in the tray, wipes it off in three overlapping strokes and
   leaves the faint haze an erased board keeps (under reduced motion it
   simply clears). Scene 2 from 0:17.0, at the original times from the dial
   (0:17.6) on: "Level 2 runs on this clock", the dial with its month ticks,
   SPRS at the hub with "current", year 1, year 2, year 3, the C3PAO star
   with "C3PAO", the hand and its swept sector (still until 0:26, three
   years from 0:26 to 0:56), the lines carrying each result into SPRS as the
   hub glows, the year checks with "self-assess + affirm" beside the first,
   "significant change" and "reassess now" with the lightning, "3 yrs:
   recertify" with its arrow, and "no current status = no contract" in its
   box. The drawn title and the legend lines are off the board, since the
   heading and the captions say them; no other words change and nothing is
   added; the board stays an image with a title and a description of both
   scenes. Two arrangements, picked by the board's width: wide (520×235
   units, the clock on the left and its words on the right, no word under
   14.5 units) beside the hero and on a tablet; narrow (300×366 units, scene
   1 stacked, the clock above the bottom line, no word under 12 units) on a
   phone, under 395px; every word renders at 11px or more at 320, 390, 768,
   1024, 1280, 1366, 1440 and 1920. The player row: play/pause/replay
   (44px), the chaptered scrub bar with no labels under it (the caption's
   eyebrow names the part), the time in mono (the elapsed time alone where
   space is short; under 340px it drops out, and the slider keeps its value
   text), the speed (1×, 0.75×, 0.5×, 1.5×), every target 44px; Space, K,
   the arrows, Home, End, Page Up and Page Down work only while focus is in
   the panel and never reach the site's own keys. Reduced motion shows each
   chapter's finished state as the time runs, with no stick, dust, erase
   motion, sector or pulse. Under the caption: "Shown: the Level 2 (C3PAO) cycle. Phase 2,
   which would require it, has been on hold since July 13, 2026." with a
   link to the timeline. No analytics events; no request leaves the site.
   The piece lives in `src/components/sixty/`. About keeps "the first chalk
   talk, CMMC in sixty seconds" on the board and "More chalk talks for
   visual learners" under Later.

   How the chalk draws (October 16, the second rebuild): letters are
   written, not wiped. `npm run sixty:glyphs` turns every board word into
   glyph outlines from the site's hand face (Walter Turncoat) with the
   font's own advances and kerning, and gives each glyph a stroke skeleton
   (the outline rasterized at 256px per em, thinned to one pixel, its
   spurs pruned, then traced as ordered strokes, top to bottom and left to
   right; `+ 3 8 B D` are hand-authored where the automatic order was no
   hand's); the data is committed as `sixty-glyphs.json` and a test fails
   when the font or the words change under it. On the board each glyph is
   its outline showing through a mask whose round-capped stroke, just wider
   than the glyph's thickest stroke, is drawn along the skeleton, so every
   glyph shows at least 99% of its ink once revealed; the chalk's tip rides
   the skeleton. Each label is written letter by letter within its time,
   with brief lifts between letters and longer ones between words; small
   words go as fast as 25 letters a second, never faster. Every line is a
   flattened, seeded wobble (about 1.5 units) of the mockup's path, eased in
   and out, its time following its length (about 400 units a second at 1×,
   never under 0.2s a stroke): the dial is one loop that overshoots its
   start, an arrowhead is two short strokes after the shaft, a check one
   down-and-up stroke, the star one continuous stroke; the lines carry a
   grain (uneven coverage, small gaps) and the newest few units of the
   stroke under the chalk are a touch brighter. The marks are scheduled
   within their chapters (sixty-model.ts): a mark starts when the mockup
   says, or as soon as the stick can reach it, and takes its time; where a
   chapter is short of it the run starts earlier or is quickened together,
   never past the letter cap or under the stroke floor; the marks the hand
   and the pulses depend on start exactly when declared, and chapter starts
   and caption times never move. The stick is a hand, not a cursor: between
   marks it lifts and travels a short arc to the next (0.15 to 0.35s), rests
   by the last mark while the script waits, leans toward where it is going
   (within 20° of its resting angle), sits lower with a tighter shadow while
   drawing, sheds a little dust only then (specks drifting 10 to 30 units,
   gone within a second, at most 40 at once), comes in from the lower right
   at 0:00, leaves the same way at 1:00, and steps off while Smudge wipes.
   Everything is measured once, in the model; the frames read it and never
   measure, and they stop while the tab is hidden or the panel is out of
   view.

   Sharing it (October 16, item 3). Share, a 44px button at the end of the
   player row, opens a small menu in the style of the chalk popovers: "Send
   the video…", shown only where `navigator.canShare` accepts the MP4 as a
   file, shares the file itself (fetched when the menu opens, so the share
   call runs straight from the tap); "Copy link" copies `{origin}/?play=sixty`
   and says "Link copied" in a status region (if the clipboard is refused,
   the link appears selected in a read-only field); "Download the video"
   (MP4 · 1:00) downloads it. Escape and a click outside close the menu and
   return focus to Share. Nothing about sharing is logged or counted.
   `/?play=sixty` opens Home with the panel in view and plays from 0:00: the
   only time the drawing starts by itself; under reduced motion it shows the
   finished board instead. The parameter is read with the other URL state
   (`src/state/play.ts`); analytics still record only `/` (asserted). On
   About, "The first chalk talk, CMMC in sixty seconds" links to it. The
   video, `public/media/cmmc-in-sixty-seconds.mp4` (H.264, yuv420p,
   faststart, 1920×1080, 30 frames a second on the 1× timeline, 6 MB or
   less) with its poster JPG, is rendered by `npm run sixty:video`
   (`scripts/sixty-video.mjs`: Playwright's clock steps the drawing a
   thirtieth of a second at a time; the yellow title above, the wide board
   large and centred, each chapter's caption under it as the player shows
   it, and the last two seconds holding the finished board with
   cipherandchalk.vercel.app under it; the system ffmpeg, or npx
   ffmpeg-static if there is none, encodes it). A SHA-256 of the drawing's
   sources sits next to the video (`cmmc-in-sixty-seconds.json`), and a test
   fails when they change and the video was not rendered again.

## Features, in build order

1. The Board: tokens, shell (dust, filter, tray), every page, phone bar, keys.
2. Rev 2 → Rev 3 tab: what changed in NIST SP 800-171 Revision 3 for this
   requirement. Needs the Rev 3 text pinned with a source record under
   `docs/sources/` like the others.
3. Chalk popovers: any glossary term anywhere shows its definition and source
   on hover or tap.
4. Send this chalk: a `chalk=` parameter and a share sheet.
5. The CedarPoint story: one fictional company across all fourteen families'
   examples; review fingerprints refreshed with the same method as PR #35.
6. Erase: the one page-load motion, on control change, 400 ms, chalk to dust.
   `prefers-reduced-motion` turns it into a cut. Built, then removed by the
   owner on October 15: changing control, or any page, no longer wipes the
   board and Smudge no longer sweeps; content changes instantly, with focus
   and the announcements as before. Smudge sweeps only when someone asks him
   to: wiping chalk marks, and when "CMMC in sixty seconds" reaches its
   end.
7. The timeline, in chalk: one screen; every date sourced. The phases DoD
   suspended on July 13, 2026 are struck and marked "On hold" in yellow, the
   mark in the heading so a screen reader hears it, kept under forced colours
   and in print; the foot says the lines show the rule's original schedule.
8. The assessor's three words on the Evidence tab.
9. Smudge: built (first as Dash, then replaced by the eraser; see above).
10. Home for the stranger: `mockups/Home.html`.

Not doing: an AI assistant (it would answer beyond the sources and would need
to collect what visitors type).

## Acceptance

Every existing test still passes or is updated with the behavior it tests.
Axe clean on every route at 320, 390, 768, 1024, 1280 and 1440. Contrast 4.5:1
for chalk-muted on board (it is; `#9AA39B` on `#1B2522` is 6.1:1). Forced
colors mode shows a usable page. Print produces a one-page control sheet on
paper, black on white, no tray. Lighthouse performance ≥ 90 on a control page.
