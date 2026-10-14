# Cipher & Chalk: a reference desk

The owner's latest October 14 feedback asks for stronger structure, a distinctive
style and a useful place to return for help. The reference desk gives the blackboard
a practical purpose: find a control, work through an existing situation, or check a
definition. Matte black, breathing room and comfortable reading remain central.
The supplied four-part chalk mark remains the identity reference. See
[reference history](design-references/README.md). Owner visual acceptance is pending.

## Identity and type

Use **Cipher & Chalk**. Keep the four alternating curved white/turquoise quadrants
around circular negative space; no generic shield, monogram or replacement logo.
`public/brand/chalk-mark.svg` is an approximate scalable recreation, not the original
uploaded PNG. Changa One remains the compact wordmark. Turquoise is limited to the
small mark; large surfaces and headlines stay muted.

IBM Plex Sans supplies the question-led homepage heading, lesson titles, paragraphs,
navigation and controls. Kalam gives the teaching board and margin note their chalk
character. Body text is never distressed or handwritten. Fonts are local; retain
source checksums and SIL OFL notices. Preserve LICENSE, infrastructure/content IDs
and source URLs.

## Palette and spacing

Shared tokens live in `src/styles.css`; `src/components/study-home.css` defines the
reference desk and `src/components/reader-outline.css` defines lesson navigation.

| Role                          | Value                             |
| ----------------------------- | --------------------------------- |
| Blackboard canvas             | `#111111`                         |
| Reading / raised surfaces     | `#171717` / `#202020`             |
| Chalk / muted text            | `#deded7` / `#a9aaa4`             |
| Warm ochre interaction accent | `#d1c59f`                         |
| Divider / field boundary      | `#343534` / `#777a74`             |
| Success / error / warning     | `#b8ceb5` / `#e9b5a8` / `#d1c49d` |

Warm grey chalk and subdued backgrounds aim for comfortable reading. Grain belongs
on the small teaching board; long reading surfaces stay solid. Use thin rules,
numbered entries and a single framed chalkboard to organize the homepage. Avoid
green canvases, glow, glass, decorative animation and an oversized promotional hero.
Keep generous gaps, short reading lines, 16–19px body text and relaxed line height.
Selection uses an underline and text change as well as color. Reading comfort must
still be assessed with real people; a palette alone does not establish it.

## One main task per page

- **Home `/`:** a direct question and a native control-search form, followed by
  three numbered paths to existing Level 1 draft activities. Beside the list, a
  chalkboard teaches the distinction between working access and authorized access;
  its disclosure uses the existing activity's explanation. A reference shelf links
  to all three CMMC levels and the glossary. On smaller screens these areas stack
  in reading order. Every link leads to implemented material; no saved-progress,
  personalized-recommendation or expanded-curriculum claim is implied.
- **Learn `/learn`:** existing control discovery, exact source quotations,
  three perspectives and available draft practice. A selected control folds search,
  filters and results away at every width. “Browse & filter controls” reopens them.
  Discovery keeps them visible. An “On this page” outline in source references
  links to Source and Explain it, plus Practice only for a matching activity.
  Sources, review limits and recovery remain present.
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
distinct. The design change does not approve content or expand practice coverage.
See [the study-desk checkpoint](reviews/study-desk-2026-10-14.md).
This is a bounded two-round visual revision; publish a validated Draft PR preview
for owner feedback, without merging, production promotion or a new planning cycle.
