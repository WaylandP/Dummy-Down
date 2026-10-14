# Cipher & Chalk: a calmer blackboard

The owner's latest October 14 feedback supersedes the green reference composition:
black background, less crowding, old-school chalk character and comfortable reading.
The supplied four-part chalk mark remains the identity reference. See
[reference history](design-references/README.md). Rendered owner acceptance is pending.

## Identity and type

Use **Cipher & Chalk**. Keep the four alternating curved white/turquoise quadrants
around circular negative space; no generic shield, monogram or replacement logo.
`public/brand/chalk-mark.svg` is an approximate scalable recreation, not the original
uploaded PNG. Changa One remains the compact wordmark. Turquoise is limited to the
small mark; large surfaces and headlines are neutral.

Kalam supplies short handwritten homepage/About headings and a small teaching note.
IBM Plex Sans supplies lesson titles, paragraphs, navigation and controls. Body text
is never distressed or handwritten. Fonts are local; retain source checksums and
SIL OFL notices. Preserve LICENSE, infrastructure/content IDs and source URLs.

## Palette and spacing

The implementation lives in `src/styles.css`.

| Role                          | Value                             |
| ----------------------------- | --------------------------------- |
| Blackboard canvas             | `#111111`                         |
| Reading / raised surfaces     | `#171717` / `#202020`             |
| Chalk / muted text            | `#deded7` / `#a9aaa4`             |
| Restrained interaction accent | `#becfc5`                         |
| Divider / field boundary      | `#343534` / `#777a74`             |
| Success / error / warning     | `#b8ceb5` / `#e9b5a8` / `#d1c49d` |

Warm grey chalk reduces stark white glare without lowering text to faint grey.
Grain is faint and limited to the homepage; all long reading surfaces are solid.
No green canvas, glow, glass, decorative animation or giant illustrated hero.
Keep generous vertical gaps, short line lengths, 16–19px reading text and relaxed
line height. Selection uses an underline and text change as well as color.

## One main task per page

- **Home `/`:** a short handwritten question, a practical introduction, a control
  browse link and sample lesson. The small “the rule → the idea → real life” note
  suggests the teaching method without a large diagram or content dashboard.
- **Learn `/learn`:** existing control discovery, exact source quotations,
  three perspectives and available draft practice. A selected control folds search,
  filters and results away at every width. “Browse & filter controls” reopens them.
  Discovery keeps them visible. Sources, review limits and recovery remain present.
- **Glossary `/glossary`:** searchable definitions on their own page. Inline
  definitions still open inside lessons without a page change.
- **About `/about`:** mission, honest content limits and perspective shortcuts.

Native links support direct loads and normal browser navigation; Vercel rewrites
serve the three implemented paths. Legacy root query links and section hashes still
work. Explorer state stays in its existing controller. Native navigation/reloads
can reset local practice; there is no saved-progress feature or account.

Do not render a hidden learning workspace on Home: that creates false control-view
signals and unnecessary complexity. Production-only usage retains opt-out, DNT,
GPC and property restrictions. Only four public pathnames are allowed; queries,
fragments, answers and raw searches are never forwarded.

## Accessibility and review

Keep semantic headings, keyboard-operable tabs, visible focus, native disclosures,
quiz radios/feedback and descriptive recovery links. Targets remain at least 44px;
selected reading tabs wrap at narrow widths. Test phones from 320px, tablet and
wide screens, reduced motion, forced colors and zoom. These checks are not a full
WCAG certification; real-reader comfort and screen-reader/Safari review remain pending.

Official quotations, fictional examples and pending human review must stay visibly
distinct. The design change does not approve content or expand practice coverage.
See [the blackboard checkpoint](reviews/blackboard-comfort-2026-10-14.md).
This is a bounded two-round visual correction; publish a validated Draft PR preview
for owner feedback, without merging, production promotion or a new planning cycle.
