# Handoff: "CMMC in Sixty Seconds" animation

## What this is
`cmmc-in-sixty-seconds.html` is one self-contained page: a 60-second chalk-on-chalkboard
animation that draws CMMC Level 2 as a three-year clock. No build step, no libraries.
Only external dependency: Google Fonts (Patrick Hand SC, Nunito, JetBrains Mono), all with fallbacks.

## What it contains
- Hand-drawn SVG that draws itself on a timeline (stroke-dashoffset for paths, clip-rect wipes for text).
- Each element is timed by a `data-t="startSeconds,durationSeconds"` attribute. Retime by editing those.
- 8 chapters (CH array in the script): Who, Levels, Clock, Certify, Yearly, Change, Repeat, End.
  Each has a caption and a part label under the board.
- Player: play/pause/replay, draggable chaptered scrub bar, speed (1x/.75x/.5x/1.5x),
  keyboard (Space, arrows = 5s, PgUp/PgDn = chapter, Home/End), click board to pause.
- Responsive: below 640px wide the clock stacks above the notes (see `layout()` in the script).
- Honors prefers-reduced-motion (shows finished state per time, no chalk stick or sweep).

## Content rules (verified against 32 CFR Part 170 and DoD guidance, Oct 2026)
- Level 1 = FCI, 15 rules, self-assessed every year.
- Level 2 = CUI, 110 requirements (NIST SP 800-171).
- Level 3 = critical CUI, Level 2 + 24 more requirements, DIBCAC assessed.
- Level 2 (C3PAO): C3PAO certification every 3 years, OR sooner after a significant change.
  Every year: self-assess controls (CA.L2-3.12.1, "periodically" = no more than 1 year)
  AND an Affirming Official affirms in SPRS. No annual affirmation = status lapses.
- Results flow to SPRS (C3PAO/DIBCAC results via eMASS, which transmits to SPRS).
- Do NOT show Level 3 as "not in SPRS". Do NOT say "self OR C3PAO" for a certified company.
- Status note (Oct 2026): Phase 2 (mandatory C3PAO) was suspended July 13, 2026. Contracts may
  currently require only Level 2 (Self). The animation shows the C3PAO cycle; consider a footnote.

## Design rules to keep
- White and yellow chalk on a green-gray chalkboard. Do not restyle the palette (tokens at top of the <style>).
- The chalk texture is an SVG filter (#chalk). Keep it on the drawn groups.

## Integration notes
- To embed in an existing site, either: (a) host the file and use an <iframe> with a 16:10-ish
  aspect ratio, or (b) move the markup into a component and keep the script scoped to its root
  (it currently uses document-level ids and a keydown listener on document).
- If embedding as a component, scope the keyboard shortcuts to the player so they don't fight the site.
- Confirm it fits the site's layout (the board scales via viewBox; page padding is 16px min).
