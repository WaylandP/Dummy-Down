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
left, "CMMC in sixty seconds" (see October 15 fixes, 9): a still of its
finished clock with a play button that opens the drawing in a dialog; the
headline is sized from the hero's own width, about 100px beside it at 1280.

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
   with its correction. The address is `/practice?activity=<id>&q=<n>`;
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
   replaced the chalk talk from `HomeChalkTalk.html`). Sixty seconds of chalk:
   Level 2 as a three-year clock with SPRS at its hub beside a column of
   notes, in eight chapters (Who, Levels, The clock, Certify, Every year, Big
   change, Repeat, Bottom line), every stroke and label timed by `data-t`,
   drawn along its length under the chalk filter with a chalk stick at the
   tip, in the site's own faces and tokens; the captions are the owner's,
   their glossary words (FCI, CUI, SPRS, C3PAO) opening the chalk popovers.
   It is drawn for a stage a thousand pixels wide, so Home shows a still of
   the finished clock, cropped to the dial, under the title in yellow chalk
   (an `h2` that names the region), every word on it 11px or more, with a
   44px play button, "1:00" and "Three years of CMMC Level 2, drawn in one
   minute."; Home still fits one screen at 1280×800 and 1366×768, and
   nothing plays on its own. Play, or a click on the still, opens the drawing
   in a modal dialog from 0:00, sized so the board, the player, the caption
   and the note fit without scrolling at 1024×768 and larger (the board is
   the smallest of 1000px, 92% of the width and 1.6 times the height left
   for it); Escape and Close return focus to the play button; on a phone it
   is a full-screen sheet with the clock above the notes and the player and
   caption docked at its foot, no board text under 11px at 390. The player:
   play/pause/replay, a chaptered scrub bar (a slider whose value names the
   part), the time in mono and the speed (1×, 0.75×, 0.5×, 1.5×), every
   target 44px; Space, K, the arrows, Home, End, Page Up and Page Down work
   only inside the dialog, and the site's own keys wait while it is open.
   Reduced motion shows each chapter's finished state as the time runs, with
   no stick, sector or pulse. Under the player: "Shown: the Level 2 (C3PAO)
   cycle. Phase 2, which would require it, has been on hold since July 13,
   2026." with a link to the timeline. When the drawing reaches 1:00 Smudge
   sweeps. No analytics events; no request leaves the site. The piece lives
   in `src/components/sixty/`. About keeps "the first chalk talk, CMMC in
   sixty seconds" on the board and "More chalk talks for visual learners"
   under Later.

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
