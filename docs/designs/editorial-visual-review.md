# Editorial visual review

Date: 2026-10-13. Branch: `feat/editorial-redesign-level-one`.
Reviewer: independent in-host AI-assisted visual critique. Qualified human
approval remains pending.

## Scope and evidence

The installed gstack `design-review` instructions were read for first impression,
the page-area test, typography, hierarchy, mobile composition, utility copy and
the distinction between operating and reading surfaces. This is a focused
screenshot critique, not a claim that the full skill pipeline, paid outside-model
review, live expert scan or numerical design scoring ran. The coordinating agent
owns the browser and functional QA; this reviewer did not navigate that browser.

Actual rendered images inspected:

- `docs/screenshots/redesign-before-home-desktop.png`
- `docs/screenshots/redesign-before-home-mobile.png`
- `docs/screenshots/redesign-before-control-desktop.png`
- `docs/screenshots/redesign-before-control-mobile.png`
- `.gstack/artifacts/editorial-second-home.png`
- `.gstack/artifacts/editorial-mobile-first.png`
- `docs/screenshots/redesign-after-home-desktop.png`
- `docs/screenshots/redesign-after-home-mobile.png`
- `docs/screenshots/redesign-after-control-desktop.png`
- `docs/screenshots/redesign-after-control-mobile.png`

The control comparisons show the same actual reference, `AC.L1-b.1.i`, rather
than a mockup or invented interface. Images are evidence of appearance at the
captured state, not proof of interaction, provider data receipt, text zoom or
accessibility compliance.

## First impression

The new page communicates a useful reference and learning tool. My eye goes to
the readable Dummy-Down wordmark, the specific question about understanding a
requirement, and the working Control Explorer search. The earlier screen devoted
its first desktop viewport to a large slogan, contours and a later starting-point
link. The redesign puts a real search field and the beginning of an actual
requirement in that viewport.

The change is in composition as well as color: the decorative right half of the
old hero is gone, the introduction is shorter, the search workspace becomes the
next major area, and the lesson uses a quiet white reading column. This follows
the owner's explicit neutral light/editorial direction; it does not assume a
serif and light ground are inherently the right style for compliance.

Each visible region has a clear job: masthead and navigation, concise product
explanation, a starting lesson, search and collection selection, level navigation,
control list, official requirement, and draft teaching perspective. The control
list is an operating surface; the explanation is a reading surface. Neither
needs decorative illustrations or a marketing card grid.

## Findings and refinements

### 1. Phone search was delayed by repeated introductory copy — refined

Evidence: `editorial-mobile-first.png` and
`redesign-after-home-mobile.png`.

The first phone capture put the search field around 772 pixels down the page.
The stacked “Not sure where to start?” invitation, its explanatory paragraph,
Explorer kicker and Explorer description repeated information before the useful
interaction. The later phone capture retains the actual starting-lesson link and
reduces repeated introductory copy. Search begins around 604 pixels and is fully
visible in the captured viewport. This is a useful mobile hierarchy refinement,
not merely a stacked desktop layout.

### 2. The official quote and draft explanation are visibly separate — retain

Evidence: `redesign-after-control-desktop.png` and
`redesign-after-control-mobile.png`.

The official requirement has its own heading, source edition and cited page.
“Choose your perspective” and “Draft teaching content” precede the explanation
tabs. The active tab has both a changed surface and an underline; its state does
not rely solely on text color. The desktop teaching paragraph and fictional
example are presented as reading material rather than nested cards. Keep these
source and draft distinctions as the new learning examples are added.

The phone control capture starts within the reading area, so it does not itself
verify the collapsed browse panel above it. The coordinating browser pass must
verify that toggle, its expanded state and focus behavior.

### 3. The masthead is readable and restrained — retain the proposed identity

Evidence: both after-home images. The name is readable in a single color at
desktop and phone sizes. The upright serif “Dummy” and sans “Down” change voice
without breaking the literal name or adding a stock icon. The hyphen reads as
punctuation, not a mysterious symbol.

`editorial-identity-review.md` records the materially different alternatives and
font/license constraints. This critique inspects the selected implementation; it
does not claim that all three alternatives were rendered or approved by the
owner. Monochrome, enlarged-text and favicon results must be recorded from their
actual coordinating QA observations before claiming those checks passed.

### 4. Remove unnecessary framing before the workspace — optional polish

Evidence: `redesign-after-home-desktop.png`.

“Explore the idea” above “Control Explorer” adds another label without explaining
a new action. The Explorer title and description already identify this area.
Removing that small kicker would simplify the vertical sequence. This is a
minor editorial refinement; it is not a reason to delay the first coherent
preview or rebuild the interface.

## Quick wins and next checks

- Keep the compact phone introduction from the later screenshot.
- Keep the clearly labeled source-to-draft transition when lessons expand.
- Consider removing the redundant desktop Explorer kicker.
- Verify visible keyboard focus, visited-source link distinction and real touch
  target measurements in the coordinating browser QA. Screenshots and declared
  CSS alone do not establish these results.

No numerical design score, fabricated contrast measurement or expert approval is
reported. Screenshot evidence supports the coherent change in identity,
composition and reading experience. Functional checks and the owner's response to
the actual Vercel preview remain separate evidence.
