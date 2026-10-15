# Overnight report — October 14–15, 2026

What happened on the Board after the five Board pull requests, under the
evening's rule: each feature on its own branch, reviewed, gated (typecheck,
lint, content check, format check, unit tests, build, browser suite with axe)
and squash-merged by the session once CI was green. Screenshots at 1280×800
and 390×844 for every visual change were shared in the session.

## Merged

#39 (tokens and the shell) and #40 (Home) were already on `main` when the
evening began. Everything below was merged by the session.

| PR  | Feature                                                                           | Notes                                                                                                                                                            |
| --- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #41 | The Board, part 3 of 5: the control page                                          | Retargeted to `main` and merged.                                                                                                                                 |
| #42 | The Board, part 4 of 5: Words, Practice, Assessment objectives, About, Disclaimer | Merged.                                                                                                                                                          |
| #43 | The Board, part 5 of 5: the phone bar, the keys and the printed sheet             | Merged.                                                                                                                                                          |
| #44 | A. Decode clause map                                                              | Merged. 118 of 149 controls mapped; the rest show the sentence plain; `docs/sources/cmmc-clause-map-2026-10-15.md`.                                              |
| #45 | 2. The Rev 3 view                                                                 | Merged. Rev 2 beside Rev 3 on Level 2 controls, both verbatim; `docs/sources/nist-sp-800-171-r3-2026-10-15.md`.                                                  |
| #46 | 3. Chalk popovers                                                                 | Merged. Scoped to the words each lesson lists, on Explain (see Decisions).                                                                                       |
| #47 | 4. Send this chalk                                                                | Merged. `chalk=` white, yellow or blue opens that perspective; read once and rewritten; never sent.                                                              |
| #48 | 6. Erase                                                                          | Merged. 400 ms left-to-right sweep; a cut under reduced motion, forced colours and print.                                                                        |
| #49 | 7. The timeline                                                                   | Merged. One screen; seven sources pinned; the allowlist names eight paths. The first CI run wrapped the lead on the runner, fixed with a shorter lead and slack. |
| #50 | 8. The assessor's three words                                                     | Merged. 149 controls' Examine, Interview and Test lists verbatim from the three guides, cited in the footer; the AC.L2-3.1.7 erratum kept as printed.            |
| #51 | 9. Dash                                                                           | Merged. The tray's white chalk with two eyes; one gesture per interaction; the footer's "Dash" switch remembers only `off` in this browser.                      |

## Open

Nothing. Every queued feature is merged except the one you asked me to skip;
the report itself is the last pull request of the night.

## Skipped

- **5. The CedarPoint story**: skipped as instructed; no perspective or activity text was edited.

## Decisions you may want to revisit

- **Chalk popovers mark only the words a lesson lists** (its Level 1 words and
  glossary terms), on Explain, rather than every glossary term anywhere in free
  text; the explanation stays verbatim and nothing is auto-linked.
- **A chalk link opens Explain** unless the address names another view, and
  the address is rewritten once it has been read, so the chalk never travels on.
- **Erase sweeps left to right** with the page's smooth scroll kept and no dust
  grain drawn over the old chalk; the fixed-attachment gradient under the dust
  is untested on iOS Safari.
- **The timeline is one screen** with a "Sources" row at the foot (one
  disclosure per section, all open in print) instead of a quotation under every
  line; the FAQ's issuer is recorded as its cover prints it ("Office of the
  Chief Information Officer, U.S. Department of War"); the acquisition rule
  (90 FR 43560) was added as a seventh source for the clause's effective date;
  the status row's fifth column is called "Conditional status"; the five-item
  nav wraps to a second row below about 360px; the lead was shortened after the
  first CI run wrapped it, so the page holds one screen with slack.
- **Keys**: `j` is next and `k` previous, matching the design note.
- **The assessor's three words keep the guide's erratum**: the Level 2 guide
  prints under AC.L2-3.1.7 an Examine list that reads as 3.1.9's; the data
  shows the guide's words, the record says so and a test locks it. Four
  repeated items are kept as printed. The column glosses are the design note's
  singular "the document / the role / the action".
- **The three words keep the guide's case** (most items start lowercase, as
  the guide's continuation items do); a display capitalisation was tried and
  dropped because the line says "verbatim". Their provenance is one footer
  line with the "Open the page" link, not a second line on the element. In
  print the lists are compact, and a control with long lists (31 of 149 have
  twelve or more Examine items) runs to a second page rather than squeezing
  the type further; the design note says so.
- **Dash** hands over a chalk on every lift (tray, Explain picker or the keys),
  nods once per popover opening (hover included), and Dot is cued by the
  Finish button, so a finished activity reopened later brings no Dot. The
  footer control is a `role="switch"` named "Dash" with the state in
  `aria-checked`. To fit the switch in the footer at 1280px, the note's
  "Disclaimer & terms of use" link keeps its 44px target in padding rather
  than line height, so the note can wrap without growing the footer, and the
  footer's padding lost two pixels top and bottom; the missing space before
  that link was fixed on the way.
- **Three tests were made robust to a loaded machine** rather than to a bug:
  `App.test.tsx` and `chalk-link.test.tsx` wait up to five seconds for lazy
  chunks, and `ui-interactions.test.tsx` waits for the lesson's view event
  before clearing its mock. Each is named in the PR it rode with.

## What I need from you

- **Official-host checks.** ecfr.gov, federalregister.gov, acquisition.gov,
  dodcio.defense.gov and nist.gov answered 403 from the session's proxy, as for
  the earlier records. Every source was read from the `gamestuf/cairn-corpus`
  mirror at commit `2ef86f6d…` and re-hashed; the records name which copies the
  mirror itself took from a web archive after a 403. A read of each official
  address from your machine, against the digests in the records, would close
  that gap.
- **Content decisions above**, especially the FAQ issuer wording, the erratum
  handling and the timeline's phrasing, which no counsel or assessor has read.
- **Real devices.** Lighthouse could not run in the session; the Erase dust
  and Dash under iOS Safari, and the phone bar on a real phone, want a look.
- **Feature 5, the CedarPoint story**, is untouched as instructed.

## Sources used

- Mirror: `https://raw.githubusercontent.com/gamestuf/cairn-corpus/2ef86f6d8ca8f3fe66eb127cccaa14dc7b86f473/`,
  manifest at `manifest/manifest.json`; digests recomputed after download.
- 32 CFR part 170 (eCFR versioner XML as of 2024-12-16), 89 FR 83092 and
  90 FR 43560 (Federal Register full-text HTML), DFARS 252.204-7021 (NOV 2025;
  the mirror's text rendering, quotations re-checked against its raw capture),
  the CMMC 101 briefing (Nov 2025), the CMMC FAQ (Revision 2.3, July 2026) and
  the alignment briefing (Feb 2025): `docs/sources/cmmc-timeline-2026-10-15.md`.
- The three CMMC Assessment Guides v2.13 (Level 1, 2 and 3):
  `docs/sources/cmmc-assessment-methods-2026-10-15.md`.
- NIST SP 800-171 Revision 3: `docs/sources/nist-sp-800-171-r3-2026-10-15.md`.
- The pinned catalog's verbatim objectives: `docs/sources/cmmc-clause-map-2026-10-15.md`.

## Morning — October 15, 2026

Both pull requests from the morning note are merged, each green in CI and
squash-merged after its own review pass.

| PR                                                          | What a visitor can do now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#55](https://github.com/WaylandP/cipher-and-chalk/pull/55) | Home for the stranger, from `mockups/Home.html`: "Who's reading?", three rows that start a newcomer at the first lesson, someone who runs the systems at the fourteen families and someone preparing for an assessment at the objectives, each remembering its chalk (`cipher-and-chalk:chalk:v1`) so the next control, a bare `/learn`, the objectives' and Practice's lesson links and a recovered link all open in it; the search line, "Last time", the one-line footer. The nav on every page is Home · Controls · Learn · Glossary · Practice · Timeline · About, then the find button, with the chalk stroke under the current item; the version string lives on About. The Controls page opens on the families with counts in two columns of 44px rows, filtering in place from real links (modifier clicks still open a new tab), the levels as one row that a second pick clears, and single-line results, on one screen at 1280×800; the demo lesson keeps its reader inside the frame. |
| [#56](https://github.com/WaylandP/cipher-and-chalk/pull/56) | Smudge replaces Dash, from `mockups/Smudge.html`: the eraser on the right end of the tray on every screen and the phone bar; blinks, pupils toward a mouse pointer, a puff of dust about once a minute, the Erase's sweep across the board in its 400 ms, the chalk nudged up when picked, a sneeze at a click or a correct practice answer, a doze after a minute. Hidden from assistive technology, never focusable; the footer switch "Smudge: on/off" (`cipher-and-chalk:smudge:v1`), reduced motion and the off state leave the plain faceless eraser. Dash, Dot and the popover nod are retired.                                                                                                                                                                                                                                                                                                                                                                                             |

### Left open from the morning

- **Print and Smudge.** The note asked for the plain eraser in print; the
  Board's print sheet has no tray at all, so he does not print. Say if you
  want the eraser on the sheet.
- **"Learn" while a control is on the board** is the current nav item but
  links to the first lesson in the remembered chalk, since a link to "the
  page you are on" would go stale as `j`/`k` move. Say if you would rather it
  point nowhere, or at the control on screen.
- **The nav on phones** wraps onto a second row at 390 (five then two), the
  way the control tabs wrap; a scrolling row is the alternative.
- **The find button on Home.** The mockup's header has it beside the nav, so
  Home now carries it as every page does; `/` still focuses Home's own search
  line.
- **Superseded mockups** `Main.html` and `Dash.html` stay in
  `docs/design/mockups/` as history; the docs no longer refer to them.
- **The chalk preference** is a third key in the site's namespace, not
  progress, so clearing saved practice leaves it; `docs/LOCAL_PROGRESS.md`
  says so.
- **Four lazy-chunk waits** in existing tests (App, control-tabs,
  remember-control, Rev 3) now use the suite's five-second allowance; they
  timed out only under full-suite load.
- **Feature 5, the CedarPoint story**, remains untouched.

## October 15 fixes

The seven pull requests from the owner's review are merged, each green in CI
and squash-merged after its own review pass, in the order the note gave them,
and the Home hero asked for afterwards followed as an eighth. Main was pulled
first; PR #63 (the approved Home hero mockup, from another session) landed
mid-round and every later branch was rebased onto it.

| PR                                                          | What a visitor can do now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#59](https://github.com/WaylandP/cipher-and-chalk/pull/59) | The shell. The footer line (disclaimer, Disclaimer & terms, Assessment objectives, Usage & privacy, Smudge: on/off, Open source · MIT) sits directly above the tray on every page; at 1024×640 and up the header, the footer line and the tray stay put and only the content scrolls, with scroll padding so a focused element is never under a band and the scrolling keys reaching the content from a fresh load; the nav is Home · Controls · Glossary · Practice · Timeline · About with Controls lit for every `/learn` address; the tray's fourth stub is gone; the content ends above Smudge at every size.                                             |
| [#60](https://github.com/WaylandP/cipher-and-chalk/pull/60) | Controls with Learn merged in, from `Controls.html`: a rail of every control beside the control at desktop widths (a find line, "Start here" through the fifteen Level 1 basics as `path=basics` with "n of 15" and the dashes, the level switch, the fourteen families with their counts, collapsible, the open one listing its controls); the overview when nothing is chosen; a phone sheet "All controls" with "Start here" as one line; Home's first row opens the first control on the path in white chalk.                                                                                                                                              |
| [#61](https://github.com/WaylandP/cipher-and-chalk/pull/61) | Home says what this is, from `Home.html`: the "What this is" column with the counts from the catalog, "Later" as the roadmap's Phase 4 list ("Being researched; not here yet."), the first row "Start with Level 1: fifteen basics, one control at a time, in plain words.", and no copy that claims only Level 2.                                                                                                                                                                                                                                                                                                                                             |
| [#62](https://github.com/WaylandP/cipher-and-chalk/pull/62) | The Glossary shows every word: an "All" button before A, pressed by default, every word under its letter heading in the two-column flow, the column scrolling on its own in the desktop frame; the letters filter as before and keep their place in the address.                                                                                                                                                                                                                                                                                                                                                                                               |
| [#64](https://github.com/WaylandP/cipher-and-chalk/pull/64) | Practice runs in place, from `Practice.html`: the thirteen situations on the left (a find line, the level switch, "Keep my progress on this browser: off/on" with "Hide finished" once on), the one picked running on the right with "Question n of m", the choices as rows with chalk circles, the feedback under the answer, "Next question →", "Read the requirement", the chalk talk where there is one and "A common mix-up" struck through in chalk. `/practice?activity=<id>&q=<n>`; older links keep working; a phone shows the list first and a situation full width with a way back.                                                                 |
| [#65](https://github.com/WaylandP/cipher-and-chalk/pull/65) | About says what's next, from `About.html`: the "What's next on the board" column (On the board ticked with the counts from the data; Next: the CedarPoint story and review by qualified CMMC professionals; Later: more frameworks with the Phase 4 list, animated chalk talks, flashcards, two controls side by side), "Directions, not dates." and a link to a new issue; `docs/ROADMAP.md` carries the same directions and nothing more.                                                                                                                                                                                                                    |
| [#66](https://github.com/WaylandP/cipher-and-chalk/pull/66) | The doodle chalk, from `Doodle.html`: a stick with a kraft-paper sleeve just left of Smudge on screens 768 wide or more; a button "Doodle chalk" (`d`, Esc, the slot); up, the slot keeps a dashed outline, the cursor is a chalk tip and a layer over the content only takes smoothed chalk strokes that scroll with the text and live in memory only; the footer line says "Doodling. …"; Smudge's eyes follow the tip and his click, the Erase and a page change sweep the marks to dust (a cut under reduced motion); a resize that changes the width clears them; links under it are inert, the wheel scrolls, two fingers scroll, print leaves them out. |
| [#67](https://github.com/WaylandP/cipher-and-chalk/pull/67) | The Home hero, from `HomeHero.html` (your note after the queue): a yellow kicker, the one headline "CMMC, in plain words." at 112px, one line with the count from the catalog, "Pick up a chalk to start." with the three chalks as the main action (each sets its chalk; the stick lifts under the pointer or focus, not under reduced motion), then the search line; the "What this is" column, "Who's reading?" and the decode example are gone; the headline names CMMC on purpose and `THE_BOARD.md` says it is reworded when a second framework ships. The discover unit test now awaits its result counts instead of reading them in the click's tick.  |

### Skipped, and why

- Nothing from the note was skipped. Where a mockup and the note disagreed,
  the mockup won on look and the note on behavior, as asked.
- One thing from the Home hero note could not be done as written: "the
  headline drops to about 56px and stays two lines" on a phone. In the chalk
  hand "in plain words." is 7.04em wide, so 56px is 394px against the 350px
  between a 390 phone's gutters, and it wrapped to three lines. Two lines
  won: the headline is sized from the content's width (about 50px at 390,
  56px from 414 up).

### Decisions you may want to revisit

- **Practice.** The old index's revisit marks and status filters are not on
  the new page (the control page's Practice tab keeps them); its "Activity
  results" status is "Situation results"; the address may look back at an
  answered question, never ahead; the project's example sits seventh, where
  its control's ID falls in the catalog, as the mockup lists it; the struck
  claim is a line-through in chalk yellow, so a wrapped claim is struck on
  every line.
- **About.** The column scrolls with the page rather than sticking, so
  nothing is cut off at 1024×640; the page says the review status once, in
  the column, so the "How the explanations are made." paragraph no longer
  repeats it; `docs/ROADMAP.md` gained three Phase 4 lines and a CedarPoint
  line, all "Planned for future development", and counts the glossary at 54.
- **The doodle chalk.** Putting the chalk down takes the marks with it (the
  note's "no drawing layer while the chalk is down"); the layer takes every
  touch and scrolls the content itself under two fingers; the marks stay
  through a tab or chalk change on the same control; Smudge wipes even with
  his face off; the tray is no longer hidden from assistive technology as a
  whole, only its sticks, legend and Smudge, and the doodle chalk stands in
  the "Pick a chalk" navigation on a control page.
- **The Home hero.** Up to 1100 wide the search takes a row of its own so
  the chalk labels keep one line; at 1024×640 Home scrolls inside the frame
  (nothing sits under Smudge); each chalk link's name is its label and its
  line. The README's Home screenshot is regenerated.

### The owner's feedback, later on October 15

Four more pull requests, in the order the feedback gave them, each green in
CI and squash-merged after its own read-only review pass. Main was pulled
first; each branch was rebased onto the one before it as it landed.

| PR                                                          | What a visitor can do now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#70](https://github.com/WaylandP/cipher-and-chalk/pull/70) | "Start here" has left Controls: the block in the rail, the path in the address (`path=basics`), the "n of 15" dashes and "Next on the path" are gone, and the foot is plain Previous and Next. An old link that carries `path=basics` still opens its control, the parameter ignored. Home's "I'm new to this" chalk opens Controls filtered to Level 1 with the first Level 1 control on the board in white; its line still reads "Level 1's fifteen basics first."                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| [#71](https://github.com/WaylandP/cipher-and-chalk/pull/71) | The Erase on control change is gone: changing control, or any page, no longer wipes the board and Smudge no longer sweeps; the next control is on the board at once, focused and announced as before. Smudge sweeps only when asked (erasing marks, "Watch again"). The doodle chalk's marks stay through a change of control. `THE_BOARD.md` marks feature 6 as built, then removed by you on October 15.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| [#72](https://github.com/WaylandP/cipher-and-chalk/pull/72) | Chalk marks stay, travel with the link, and Smudge is the eraser. Putting the chalk down keeps the marks; each page keeps its own in memory for the tab (never storage), shown again on the way back by any route; they go in the page's link as the fragment `#ink=v1…` (compact, versioned, capped near 4,000 characters, with the width they were drawn at, so a screen within about 15% draws them scaled and any other says so), which a reload, Copy reference link and Send this chalk keep; a link someone else made shows its marks with a notice and Wipe all. Whenever the page shows marks Smudge is a button to pick up, "Smudge, the eraser" (`e`): rubbing removes each stroke it touches as dust, Wipe all sweeps the rest. Analytics never see the fragment; Usage & privacy says so.                                                                                                                                                    |
| [#73](https://github.com/WaylandP/cipher-and-chalk/pull/73) | "CMMC in sixty seconds", the chalk talk, from `HomeChalkTalk.html`: a column beside the hero (after the chalks and the search in the DOM, and below them on a phone) draws the program on the board in eight scenes of 7.5 seconds, each a caption of twenty words or fewer written over the pinned 32 CFR part 170, DFARS 252.204-7021 and FAR 52.204-21 texts with its section and paragraph beside it in `src/data/chalk-talk.ts`, the counts from the catalog, glossary words opening their popovers; a 44px play/pause button, a chalk dash per scene, the time in mono, the caption under the drawing; it plays once on a desktop (a background tab waits), pauses while the tab is hidden or a caption's word has focus, ends on "Watch again" with Smudge's sweep, waits for play on a phone, and stands finished with a stepped list under reduced motion. About and the roadmap move the first chalk talk onto the board. No scene was dropped. |

### Decisions you may want to revisit, from the feedback

- **The chalk talk's dashes.** Each scene's dash is 44px tall but 24 to 32px
  wide: eight 44px targets do not fit beside the play button and the time in
  the 430px column, nor across a phone, so they share the row (about 26px
  each at desktop widths, as the mockup draws them). WCAG 2.5.8 is met; the
  44px rule in `CLAUDE.md` is bent here on purpose.
- **The chalk talk's order.** In the DOM the talk follows "Pick up a chalk to
  start." and the search at every width, so Tab reaches the chalks first;
  the grid puts it beside the hero at desktop widths. The review found the
  grid's first row able to run the talk into the chalks on 1280×720 and
  1024×768 frames; it now scrolls instead. Focus on a caption's word pauses
  the talk, so a popover opened from the keyboard stays until play.
- **Two captions were reworded** after the review read them against their
  quotes: Level 3 now also rests on § 170.18(a) (a Final Level 2 status is
  the prerequisite), and the status scene reads "Meeting the minimum score
  earns a status, stored in SPRS, and an Affirming Official affirms
  continuing compliance." over § 170.4(b) and § 170.22(a).
- **The chalk marks' page.** For `/learn` a page is the explorer's canonical
  address (in the chalk the visitor picked when the address names none), so
  a rail click and a pasted link reach the same marks; the memory lives in
  the loaded page, so a header link (a fresh page) loses it and Back, Forward
  and the link itself bring the marks back. Whose marks a link carries is
  kept in the history entry's state, never storage.
- **The unit suite on a loaded runner.** PR #72's first CI run failed in a
  test it did not touch (`App.test.tsx`, the lazy learning page), and main's
  own CI had failed twice earlier in the day on two other timing-sensitive
  tests. Three tests now wait for the lazy page and the address it tidies
  after its first paint; the full suite passed pinned to two loaded cores.
  No test was removed or skipped.
