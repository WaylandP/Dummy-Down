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
