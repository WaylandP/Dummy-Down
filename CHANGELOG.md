# Changelog

This file records meaningful project changes verified in Git history and merged
pull requests. Cipher & Chalk has no GitHub releases or version tags, so entries are
grouped by merge date without invented release numbers. Detailed implementation and
validation evidence remains in the linked pull requests and review documents.

## The Board — October 14, 2026

The visual direction approved on October 14 ([specification](docs/design/THE_BOARD.md),
[mockups](docs/design/mockups/)) is being built in five pull requests, each
green in CI before the next. Routes, content identities, legacy links and the
analytics allowlist do not change.

- [PR #39](https://github.com/WaylandP/cipher-and-chalk/pull/39): tokens and
  the app shell. The slate ground with chalk dust, the chalk filter, the Morse-C
  ring and lockup, a four-item nav with a find line, a one-line footer and the
  wooden tray; Walter Turncoat, Atkinson Hyperlegible Next and Martian Mono
  self-hosted; the favicon, app icon and social card regenerated from the mark;
  Changa One, Barlow, Kalam, IBM Plex Sans and Space Grotesk retired. Page
  layouts keep their previous structure inside the shell until their own PRs.
- [PR #40](https://github.com/WaylandP/cipher-and-chalk/pull/40): Home. The
  question in chalk, a search line on a chalk underline that submits the same
  discovery address as the header's find line, the fourteen families with
  their catalog counts as links to filtered discovery, and a bottom row with
  "Start here" or "Last time" beside the publication version. Optional saving
  now remembers the control opened last, under its own key, deleted with the
  rest. The study desk is retired.
- [PR #41](https://github.com/WaylandP/cipher-and-chalk/pull/41): the control
  page. The identifier decoded on the first line, the title as the heading and
  five views carried in the address: Decode (the sentence and its assessment
  objectives, verbatim), Explain (pick a chalk; the explanation in its colour,
  the example in the margin), Evidence, Practice and Related, with a footer
  line that holds the citation and Previous/Next within the current results.
  The older reader and its stylesheet rules are retired.
- [PR #42](https://github.com/WaylandP/cipher-and-chalk/pull/42): Words,
  Practice, Assessment objectives, About and Disclaimer. Words follows its
  mockup with a search line, an A–Z row, four groupings derived from each
  word's sources and one letter of words at a time with their sources in blue
  mono; the other four pages follow the Board's lines with their words
  unchanged. The glossary's open event is retired with the disclosures.
- [PR #43](https://github.com/WaylandP/cipher-and-chalk/pull/43): the phone
  bar, the keys and the printed sheet. With a control on the board the tray's
  three chalks pick the perspective; on a phone the tray is the labelled
  bottom bar from the mockups. `j`/`k` step through the results, `1`/`2`/`3`
  pick a chalk, `/` finds a control and `?` shows the keys. Print gives a
  one-page control sheet in black on white.

## October 15 fixes — October 15, 2026

The owner's October 15 review, drawn in `docs/design/mockups/2026-10-15/`
and listed in `docs/design/THE_BOARD.md` ("October 15 fixes"): seven pieces,
one pull request each. Routes, content identities, legacy links and the
analytics allowlist do not change.

- [PR #59](https://github.com/WaylandP/cipher-and-chalk/pull/59): the shell.
  The footer line (the disclaimer and "Disclaimer & terms", Assessment
  objectives, Usage & privacy, Smudge: on/off, Open source · MIT) sits
  directly above the tray on every page in the mockups' wording, its links
  44px targets, and Home's own footer line is gone. At desktop sizes (1024
  wide and 640 tall or more) the header, the footer line and the tray stay
  put and only the content between them scrolls, the scrolling keys reaching
  it from a fresh load or the header; below that the tray stays the bottom
  bar and the footer line ends the content. The nav is Home · Controls ·
  Glossary · Practice · Timeline · About, with Controls lit for every `/learn`
  address and every `/learn` link unchanged. The tray's fourth stub is gone,
  Smudge is sized as drawn, and the content ends above him at every size.
- [PR #60](https://github.com/WaylandP/cipher-and-chalk/pull/60): Controls
  with Learn merged in. A rail of every control stands beside the control,
  always visible at desktop widths and scrolling on its own: a find line that
  filters it as you type, "Start here" through the fifteen Level 1 controls
  in catalog order as a path in the address (`path=basics`, "n of 15",
  fifteen chalk dashes), the level switch, and the fourteen families with
  their counts for the level in force, collapsible, the open one listing its
  controls with the current one under the yellow bar. On the path the foot
  reads "Next on the path"; a control picked on its own leaves it. With no
  control chosen the overview shows the results beside the rail. Phone: an
  "All controls" line opens the rail as a full-screen sheet. The old "Browse
  & filter controls" disclosure is gone; Home's first row opens the first
  control on the path.
- [PR #61](https://github.com/WaylandP/cipher-and-chalk/pull/61): Home says
  what this is. The sentence at the top right is gone; beside the rows, on a
  hairline, the "What this is" column: one paragraph, the AC.L2-3.1.1 example
  decoded, "On the board now" with the three CMMC levels and their control
  counts from the catalog, "Later" with the Phase 4 research list from
  `docs/ROADMAP.md` ("Being researched; not here yet."), and "Free. No
  account. Made by one person, in the open." The first row reads "Start with
  Level 1: fifteen basics, one control at a time, in plain words."; the tray's
  legend shows on Home too; the README's screenshots are regenerated.
- [PR #62](https://github.com/WaylandP/cipher-and-chalk/pull/62): the
  Glossary shows every word by default. An "All" button before A, pressed by
  default: every word under its letter heading in the same two-column flow,
  the column scrolling on its own in the desktop frame. The letters filter as
  before and keep their place in the address; `/glossary` alone is every
  word.
- [PR #64](https://github.com/WaylandP/cipher-and-chalk/pull/64): practice
  runs in place. The thirteen situations on the left (a find line, the level
  switch, "Keep my progress on this browser" with "Hide finished" once on),
  the one picked running on the right: the question, the choices as rows with
  chalk circles, the feedback under the answer, "Next question", "Read the
  requirement", the chalk talk where there is one, and "A common mix-up" after
  the first answer. The address is `/practice?activity=<id>&q=<n>`; older
  practice links keep working. On a phone the list comes first and a
  situation opens full width with a way back.
- [PR #65](https://github.com/WaylandP/cipher-and-chalk/pull/65): About says
  what's next on the board. Beside the sentences, "What's next on the board"
  in the roadmap's words: on the board (ticked, counted from the data), next
  (the CedarPoint story, review by qualified CMMC professionals) and later
  (more frameworks with the Phase 4 list, animated chalk talks, flashcards,
  two controls side by side), then "Directions, not dates." and a link to a
  new issue. The roadmap carries the same directions and nothing more.
- [PR #66](https://github.com/WaylandP/cipher-and-chalk/pull/66): the doodle
  chalk. A stick with a kraft-paper sleeve just left of Smudge on screens 768
  wide or more; a button, "Doodle chalk" (`d`, Esc and the slot put it
  back). Up, the slot keeps a dashed outline, the cursor is a chalk tip and a
  layer over the content takes smoothed chalk strokes that scroll with the
  text and live in memory only: never stored, never sent. The footer line
  says so while the chalk is up. Smudge's eyes follow the tip; his click,
  the Erase between controls and a page change sweep the marks to dust (a
  cut under reduced motion); a resize that changes the width clears them.
  Links under the layer are inert, the wheel scrolls, two fingers scroll,
  print leaves the marks out.
- [PR #67](https://github.com/WaylandP/cipher-and-chalk/pull/67): the Home
  hero, the owner's approved Home (`mockups/2026-10-15/HomeHero.html`),
  replacing #61's. One thing first, then second, then third: a kicker in
  yellow chalk, the one headline "CMMC, in plain words." (112px on desktop,
  two lines on a phone), one line with the count from the catalog, "Pick up
  a chalk to start." with the three chalks as the main action (each sets its
  chalk; the stick lifts under the pointer or focus, not under reduced
  motion), then the search line. The "What this is" column, "Who's reading?"
  and the decode example are gone. The headline names CMMC on purpose and is
  reworded when a second framework ships. The discover unit test now awaits
  its result counts.
- [PR #70](https://github.com/WaylandP/cipher-and-chalk/pull/70): "Start
  here" leaves Controls (the owner's October 15 feedback). The block in the
  rail, the path in the address (`path=basics`), the "n of 15" dashes and
  "Next on the path" are gone; the foot is plain Previous and Next again.
  An old link that carries `path=basics` still opens its control, the
  parameter ignored. Home's "I'm new to this" chalk opens Controls filtered
  to Level 1 with the first Level 1 control on the board in white; its line
  still reads "Level 1's fifteen basics first."
- [PR #71](https://github.com/WaylandP/cipher-and-chalk/pull/71): the Erase
  on control change is gone (the owner's October 15 feedback). Changing
  control, or any page, no longer wipes the board and Smudge no longer
  sweeps; the next control is on the board at once, focused and announced as
  before. Smudge sweeps only when asked. The doodle chalk's marks stay
  through a change of control.

## The Board's features — October 15, 2026

The features the specification lists after the five Board pull requests, one
pull request each. Anything that adds a fact lives in `src/data/` with a
source record under `docs/sources/`.

- [PR #44](https://github.com/WaylandP/cipher-and-chalk/pull/44): the Decode
  clause map. Each clause of the requirement sentence that produces assessment
  objectives is underlined in yellow chalk with the letters of those objectives
  beside it, as in `mockups/Decode.html`. The map
  (`src/data/cmmc-clause-map.json`) was read against the verbatim objectives
  and nothing else, is locked by tests to the pinned text and is recorded in
  `docs/sources/cmmc-clause-map-2026-10-15.md`; 118 of the 149 controls are
  mapped and the rest show the sentence plain.
- [PR #45](https://github.com/WaylandP/cipher-and-chalk/pull/45): the Rev 3
  view. On every Level 2 control, the pinned Rev 2 requirement beside its NIST
  SP 800-171 Revision 3 counterpart, both verbatim, with one sentence in chalk
  on what changed and a link to where a withdrawn requirement went. The
  publication is pinned in `docs/sources/nist-sp-800-171-r3-2026-10-15.md`;
  the data is `src/data/cmmc-rev3-map.json`. CMMC stays pinned to Rev 2; the
  view says so once.
- [PR #46](https://github.com/WaylandP/cipher-and-chalk/pull/46): chalk
  popovers. On the Explain view, the first mention of each word the lesson
  lists carries its definition and source on hover, pinned by a tap, Enter or
  Space with focus inside, closed by Escape with focus returned. Only the
  words listed for the lesson are marked, and the explanation stays verbatim.
- [PR #47](https://github.com/WaylandP/cipher-and-chalk/pull/47): Send this
  chalk. A control address may name a chalk instead of a mode (`chalk=white`,
  `yellow` or `blue`) and opens Explain in that chalk; the parameter is read
  once, rewritten to the usual address and never sent anywhere. "Send this
  chalk" beside Print and Copy reference link copies such a link for the chalk
  in hand, with the same feedback.
- [PR #48](https://github.com/WaylandP/cipher-and-chalk/pull/48): Erase.
  Between controls the old chalk sweeps off the board as dust, left to right
  in 400 ms, while the new control is already underneath with focus and the
  announcement exactly as before; the only page-change motion, and a cut
  under reduced motion, forced colours and print.
- [PR #49](https://github.com/WaylandP/cipher-and-chalk/pull/49): the
  timeline. A page at `/timeline`, in the header beside Practice: when the
  program rule was published and took effect, when the DFARS clause took
  effect and when each of its four phases begins, how long each status stays
  current, and what DoD has said about Revision 3 (neither source gives a
  date). Every line is a paraphrase in `src/data/cmmc-timeline.json` over
  its quoted source, pinned in `docs/sources/cmmc-timeline-2026-10-15.md`;
  the analytics allowlist grows to eight paths and nothing new is collected.
- [PR #50](https://github.com/WaylandP/cipher-and-chalk/pull/50): the
  assessor's three words. The Evidence view opens with Examine the document,
  Interview the role and Test the action: three chalk columns listing verbatim
  what the pinned assessment guide prints under "Potential Assessment Methods
  and Objects" for the control, cited to the guide and page, above the
  compliance chalk's questions and evidence examples. The lists for all 149
  controls are in `src/data/cmmc-assessment-methods.json`, recorded in
  `docs/sources/cmmc-assessment-methods-2026-10-15.md`.
- [PR #51](https://github.com/WaylandP/cipher-and-chalk/pull/51): Dash. The
  tray's white chalk is the mascot from `mockups/Dash.html`: one stroke with
  two eyes that blinks now and then, lifts the chalk that was picked, sweeps
  once with the erase, nods once at a chalk popover, and is joined by Dot when
  a practice activity is finished. It never speaks and is hidden from
  assistive technology; a footer switch turns it into a plain stub (remembered
  in this browser only), as reduced motion and print do.
- [PR #55](https://github.com/WaylandP/cipher-and-chalk/pull/55): Home for
  the stranger and the Controls page. Home follows `mockups/Home.html`
  (approved in [PR #53](https://github.com/WaylandP/cipher-and-chalk/pull/53)):
  "Who's reading?", three rows, one per chalk, that start a newcomer at the
  first lesson, someone who runs the systems at the fourteen families and
  someone preparing for an assessment at the objectives, and remember that
  chalk (`cipher-and-chalk:chalk:v1`) so any address that names no mode opens
  in it; the search line, "Last time" and a one-line footer. The nav on every
  page is Home · Controls · Learn · Glossary · Practice · Timeline · About
  with the chalk stroke under the current item; the version string is on
  About. The Controls page opens on the families with their counts, filtering
  in place from real links, the result count with the levels as one row and
  single-line results, on one screen at 1280×800, with 44px targets; the demo
  lesson keeps its reader inside the same frame.
- [PR #56](https://github.com/WaylandP/cipher-and-chalk/pull/56): Smudge
  replaces Dash. The eraser from `mockups/Smudge.html` sits on the right end
  of the tray on every screen, the phone bar included: wood, felt, and a face
  in chalk that blinks, follows a mouse pointer with its pupils and puffs a
  little dust; he is the Erase's sweep across the board, nudges the chalk
  that was picked up out of the tray, sneezes at a click or a correct
  practice answer and dozes after a minute. Hidden from assistive technology
  and never focusable; the footer switch "Smudge: on/off" (remembered as
  `cipher-and-chalk:smudge:v1`), reduced motion and print leave the plain
  faceless eraser. Dash, its switch, Dot and the popover nod are retired.

## Week 2 content and trust — October 14, 2026

- [PR #31](https://github.com/WaylandP/cipher-and-chalk/pull/31): a dedicated
  Disclaimer & terms of use page at `/disclaimer`, linked from every footer.
- [PR #33](https://github.com/WaylandP/cipher-and-chalk/pull/33): About now
  explains CMMC in one paragraph and says who makes the site and why.
- [PR #34](https://github.com/WaylandP/cipher-and-chalk/pull/34): 113 AI review,
  design-iteration and screenshot records moved to the `archive/ai-review-records`
  branch; links updated.
- [PR #32](https://github.com/WaylandP/cipher-and-chalk/pull/32): 34 CMMC Program
  terms added to the glossary (statuses, roles, scoping categories, clauses),
  each written from and linked to 32 CFR part 170, the Level 2 Scoping Guide,
  FAR 52.204-21, 32 CFR 2002.4 or the DFARS clauses. Source record in
  `docs/sources/cmmc-program-definitions-2026-10-14.md`.
- [PR #35](https://github.com/WaylandP/cipher-and-chalk/pull/35): activity and
  visual-explanation disclaimer paragraphs rewritten in the site's current voice,
  with review fingerprints recomputed for the disclaimer-only change.

## Week 1 cleanup — October 14, 2026

A sequence of small pull requests retired the project's working name and process
overhead, and removed repeated review-status hedging from the interface.

- [PR #25](https://github.com/WaylandP/cipher-and-chalk/pull/25): README rewritten as
  an audience-first project page with badges, a stack table and one honest
  content-accuracy section.
- [PR #26](https://github.com/WaylandP/cipher-and-chalk/pull/26): package and
  browser-storage namespace renamed from `dummy-down` to `cipher-and-chalk`, with a
  one-time client-side migration of legacy keys.
- [PR #27](https://github.com/WaylandP/cipher-and-chalk/pull/27): gstack scripts,
  docs and CI step removed; `AGENTS.md` replaced by a concise `CLAUDE.md`.
- [PR #28](https://github.com/WaylandP/cipher-and-chalk/pull/28): unpublished
  frameworks no longer offered in the Explorer dropdown; saved links still resolve.
- [PR #29](https://github.com/WaylandP/cipher-and-chalk/pull/29): "draft" and
  "pending review" labels removed from every lesson, perspective, activity, glossary
  term and coverage row. The Coverage page is reframed as a searchable index of all
  468 assessment objectives, and the About page gains a "How the explanations are
  made" section that carries the project's review status once. Activity and visual
  explanation disclaimer paragraphs in the data files are unchanged and remain a
  follow-up.

## Phase 3 final integration — October 14, 2026

[PR #23](https://github.com/WaylandP/cipher-and-chalk/pull/23) merged at `6a5133b`.
The full source-to-practice journey is tested on phones and desktop. Deferred
Explorer loading reduces measured initial Home JavaScript by 10.8%, including
shared chunks; failed downloads preserve the requested address and offer recovery.
The walkthrough, screenshots, authoring/privacy guidance and roadmap distinguish
finished engineering from pending human review. Local gates passed 565 unit and
113 browser tests; exact-head CI and automatic production deployment succeeded.

## Phase 3 optional local progress — October 14, 2026

[PR #22](https://github.com/WaylandP/cipher-and-chalk/pull/22) merged at `dd8595d`.
Learners can opt into browser-local resume, visited/completed distinctions, revisit
marks and earlier-answer reasoning review. Saving starts off; deletion, content
version checks, browser privacy signals and storage failures are handled explicitly.
CI and automatic production deployment passed; local validation covered 562 unit
and 110 browser tests. No accounts, cloud sync or answer analytics were added.

## Phase 3 visual explanations — October 14, 2026

[PR #21](https://github.com/WaylandP/cipher-and-chalk/pull/21) merged at `40d0754`.
Three controlled 40-second SVG explanations teach authorized access, MFA and
response-team deployment. Transcripts, manual stages, reduced motion and deferred
loading are included. CI passed 509 unit and 97 browser checks; the automatic
production deployment succeeded. Draft content still awaits qualified human review.

## Phase 3 practice expansion — October 14, 2026

PR #20 merged at `1e934d0` with successful automatic production deployment.
Nine source-bound draft activities add three concepts per CMMC level, 27 explained
questions, learning goals and related terms. A searchable practice page links all
13 activities to their exact lessons. Qualified content approval remains pending.

## 2026-10-14

- [#19](https://github.com/WaylandP/cipher-and-chalk/pull/19) made practice easier to
  discover, added direct question entry, counted reviewed questions from zero and
  preserved answer reasoning at completion. Merge `82db49c` and automatic production
  deployment were verified; this does not establish human acceptance.

- [#17](https://github.com/WaylandP/cipher-and-chalk/pull/17) completed the full-field
  Level 2/3 editorial audit, with 16 clarifications across 13 controls and per-control
  review evidence. Approved merge verified at `81cee95`; qualified human review
  and current applicability remain pending.

- [#16](https://github.com/WaylandP/cipher-and-chalk/pull/16) added all 468 pinned
  assessment statements, explicit teaching mappings, a navigable coverage report
  and stale-review integrity gates. Two source-wording gaps and all qualified-human
  approvals remain unresolved. Approved merge verified at `d734898`.

- [#15](https://github.com/WaylandP/cipher-and-chalk/pull/15) recorded source-baseline revalidation,
  current applicability access limits, focused clarifications in ten Level 1
  controls, stale-review fingerprint checks and a qualified-human review packet.

- [#14](https://github.com/WaylandP/cipher-and-chalk/pull/14) improved page/lesson titles and
  keyboard focus through skip links, result pages, quiz feedback, copy fallback
  and reopened search; added browser accessibility regressions and an owner/learner
  acceptance packet. Human validation remains pending.

- [#13](https://github.com/WaylandP/cipher-and-chalk/pull/13) restored the original
  mission, audience, teaching model, and long-term vision in the Cipher & Chalk
  README; added a status-based detailed roadmap and documentation maintenance rules.
- [#12](https://github.com/WaylandP/cipher-and-chalk/pull/12) turned the blackboard
  homepage into a practical reference desk with native control search, three
  existing draft activity entry points, a teaching-board example, and in-lesson
  Source / Explain it / Practice navigation.

## 2026-10-13

- [#11](https://github.com/WaylandP/cipher-and-chalk/pull/11) refined lesson reading,
  feedback, source/review context, and validation evidence.
- [#10](https://github.com/WaylandP/cipher-and-chalk/pull/10) introduced the Cipher &
  Chalk name, supplied four-part mark, and Decode Board visual direction.
- [#9](https://github.com/WaylandP/cipher-and-chalk/pull/9) finalized pinned gstack
  coverage and workflow evidence.
- [#8](https://github.com/WaylandP/cipher-and-chalk/pull/8) repaired the pinned
  project-local gstack tooling and coverage checks.
- [#7](https://github.com/WaylandP/cipher-and-chalk/pull/7) audited the gstack
  workflow and recorded supported, inapplicable, and gated capabilities.
- [#6](https://github.com/WaylandP/cipher-and-chalk/pull/6) added three source-bound
  Level 1 learning activities, glossary additions, and editorial-review records.
- [#5](https://github.com/WaylandP/cipher-and-chalk/pull/5) introduced the editorial
  learning interface that preceded the current Cipher & Chalk design.
- [#4](https://github.com/WaylandP/cipher-and-chalk/pull/4) added three draft
  perspectives across all CMMC levels and privacy-conscious usage analytics.
- [#3](https://github.com/WaylandP/cipher-and-chalk/pull/3) added the versioned
  149-reference CMMC snapshot, source metadata, shareable state, glossary, and first
  interactive draft lesson.
- [#2](https://github.com/WaylandP/cipher-and-chalk/pull/2) added the pinned gstack
  Codex setup and field-guide planning records.
- [#1](https://github.com/WaylandP/cipher-and-chalk/pull/1) built the initial React,
  TypeScript, Vite, and Tailwind CSS frontend with the first Control Explorer and
  test/build workflow.
- Commit [`5cc78c2`](https://github.com/WaylandP/cipher-and-chalk/commit/5cc78c255224d3a8cbaa9ab3dd52ee19be28f076)
  established the original mission, audience, teaching modes, four-phase roadmap,
  security warning, and long-term framework vision under the Dummy-Down working name.
