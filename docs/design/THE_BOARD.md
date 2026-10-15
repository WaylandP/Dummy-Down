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
5. Everything that moves is answering the visitor, except Erase (below).
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

**Home** — `mockups/Home.html` (supersedes `Main.html`; redrawn in
`mockups/2026-10-15/Home.html`, see October 15 fixes, 3). Written for the
stranger who arrives from a shared link. Header: the lockup and the nav, Home
first, the active item under a yellow chalk stroke. The question in chalk:
"Who's reading?", with the "What this is" column at the right (October 15
fixes, 3; before it, one sentence saying what the site is). Three rows, one
per chalk: "I'm new to this." / "I run the systems." / "I'm
preparing for an assessment.", each with one sentence of where it starts you
and a yellow link. Choosing a row also picks that chalk for the visitor. Below:
"Or just look something up:" and the search line. The footer line is the
site's (see October 15 fixes, 1). Smudge sits on the right end of the tray.
The fourteen families move to the Controls page.

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
drift toward the cursor, a puff of dust now and then. Erase: he leaps up and
sweeps across the board; the old text goes to dust. Pick a chalk: he nudges
that stick up out of the tray. Click or tap him, or finish a practice item
correctly: a sneeze of dust. A minute idle: he dozes, and any input wakes him.
Never speaks. Off switch in the footer; a plain faceless eraser in print and
under reduced motion.

## October 15 fixes

The owner's October 15 review, drawn in `mockups/2026-10-15/` (its README
says what each screen changes). Where a mockup and the review's note disagree,
the mockup wins on look and the note on behavior. Seven pieces, one pull
request each; each line says whether it is built.

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
   scrolling on its own: a find line that filters it as you type, "Start
   here" through the fifteen Level 1 controls in catalog order as a path in
   the address (`path=basics`, "n of 15", fifteen chalk dashes with the
   current one yellow), the level switch All · 1 · 2 · 3 on the existing
   level filter, and the fourteen families with their counts for the level in
   force, collapsible, the open one listing its controls with the current one
   under the yellow bar; every count from the catalog. On the right the
   control exactly as before, and with no control chosen the overview (the
   results at full width beside the rail; below desktop widths, with the
   families as before). Beside a control the family rows open in place. On
   the path the foot reads "Next on the path: ‹id› →"; a control picked from
   the rail leaves the path. The old "Browse & filter controls"
   disclosure is gone. Phone: an "All controls" line at the top opens the rail
   as a full-screen sheet, and "Start here" stays visible as one line. Home's
   "I'm new to this." row opens the first control on the path with the white
   chalk.
3. **Home: what this is** — `Home.html` (built). The sentence at the top
   right is gone; the "What this is" column stands beside the rows: one
   paragraph, the AC.L2-3.1.1 example decoded, "On the board now" with the
   three levels and their counts from the catalog, "Later" with exactly the
   Phase 4 research list from `docs/ROADMAP.md` ("Being researched; not here
   yet."), and "Free. No account. Made by one person, in the open." The first
   row reads "Start with Level 1: fifteen basics, one control at a time, in
   plain words." with the count from the catalog. No page copy says the site
   covers only Level 2. The tray's legend shows on Home too, as drawn.
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
   "Question n of m" with chalk dashes, the prompt, the choices as rows with
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
7. **The doodle chalk** — `Doodle.html` (built). A fat white stick with a
   kraft-paper sleeve in the tray, just left of Smudge, on screens 768 wide
   or more: a button, "Doodle chalk", pressed while the chalk is up; `d`
   picks it up and puts it down, Esc and the slot put it down. Up, the stick
   leaves the tray (its slot keeps a dashed outline), the cursor is a chalk
   tip, and a drawing layer covers the content only, anchored to it, so the
   marks scroll with the text. Strokes are chalk white at .9, about 3px,
   smoothed, with the chalk filter; CanvasText under forced colors. The
   footer line reads "Doodling. Your marks stay on this screen only. Esc or
   the tray puts the chalk back. Click Smudge to wipe them.", once, politely.
   Smudge's eyes follow the tip; his click sweeps the marks to dust, as do the
   Erase between controls and a page change; a resize that changes the
   content's width clears them; under reduced motion every wipe is a cut.
   Links under the layer are inert, the wheel still scrolls, one finger draws
   and two scroll, and print never includes the marks. The marks are memory
   only: never stored, never sent, never in analytics.

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
   `prefers-reduced-motion` turns it into a cut.
7. The timeline, in chalk: one screen; every date sourced.
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
