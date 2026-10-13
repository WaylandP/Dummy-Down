# Dummy-Down visual direction

**Working identity: Dummy-Down. Compliance, translated.**

This is a proposed editorial learning identity for owner review, implemented in
the running application. It supersedes the rejected dark/topographic direction.
Historical field-guide notes document earlier work; they are not instructions to
restore the old appearance.

## Purpose and first impression

Help someone read an unfamiliar requirement, understand its meaning and explore
a practical example. The first impression should be clear reference material with
personality. The working search belongs directly beneath a compact introduction;
the Explorer and its reading panel are the product.

The homepage question is **“What does this requirement actually mean?”** The copy
states the actual offer: plain-English explanations, practical examples and
different learning perspectives for cybersecurity requirements, starting with
CMMC. Draft status and edition context remain visible.

## Identity and typography

The wordmark changes typographic register at its designed hyphen: an upright serif
“Dummy” meets a plain sans-serif “Down.” The transition reflects translating
formal language into something approachable. It is text with an accessible home
link label, not a stock symbol. The mark works in a single color; teal is reserved
for interactions. The favicon is a deliberately simple, open-counter letter D,
drawn as original SVG paths on the neutral canvas.

Upright Georgia / Times New Roman / the device's generic serif carries the
wordmark's first word and major headings. These are platform fonts, not downloaded
or redistributed assets; their appearance varies by device. The Linux QA machine
resolves the serif fallback to locally installed Noto Serif. IBM Plex Sans
400/500 carries reading, controls and the wordmark's second word. It is bundled
locally through Fontsource with `font-display: swap`. Its SIL Open Font License
is retained in `public/font-licenses/ibm-plex-sans.txt`. Existing Space Grotesk
license notices are preserved, although it is no longer the design voice.

The display choice is an intentional upright reading convention rather than an
italic magazine flourish. Paragraphs use at least 16px; principal teaching text
uses 17px with a 1.75 line height and a maximum of 68 characters. Control IDs alone
use the platform monospace fallback. No font service or new dependency is needed.

## Palette

Tokens live in `src/styles.css` and are exposed through Tailwind's theme.

| Role             | Color     | Use                                                |
| ---------------- | --------- | -------------------------------------------------- |
| Canvas           | `#f6f7f7` | Neutral off-white margins; no cream or yellow cast |
| Reading surface  | `#ffffff` | The explanation area and native input surfaces     |
| Foreground       | `#20292b` | Charcoal headings and reading text                 |
| Muted            | `#526164` | Secondary text and explicit draft labels           |
| Accent           | `#126a68` | Links, selected perspectives and visible focus     |
| Selected surface | `#e8efee` | A quiet tint for the chosen result                 |
| Separator        | `#d6dddd` | Structure between distinct reading sections        |
| Field border     | `#738285` | Visible native input boundaries                    |

Draft labels use words and typography, not a decorative trust badge or warning
color. Selected tabs use both an underline and `aria-selected`. Selected results
use a tint and `aria-pressed`; color is not their only state signal.

## Composition

- A compact header and left-aligned question lead directly to usable controls.
  There is no decorative hero background or large empty presentation area.
- A stronger rule introduces the tool. Search gets the widest toolbar column;
  collection and framework remain familiar native selects.
- Level choices are short inline navigation, not feature cards. The left column
  supports scanning and filtering; the white reading panel supports concentration.
- Result rows have square edges and a calm selection tint. Sections use whitespace
  and occasional separators, with no layered cards, glow, shadows or floating pills.
- Explanation perspectives are visible tabs. Official quotations, teaching drafts
  and source context remain separately labeled; practical examples do not become
  implied requirements or compliance scores.
- The approach links, glossary and factual project context follow the Explorer.
  Other frameworks remain explicitly planned rather than implied libraries.

## Mobile and interaction

At 760px and below, search becomes a full-width first row, controls remain readable,
and the reading panel fills the viewport width. A real button opens/closes the
results and filters; its collapse applies only on phones, so desktop discovery is
never hidden by stale mobile state. Selecting a control gives reading priority.
Perspective labels fit three equal columns with at least 48px touch areas.

Links, native disclosures and controls have clear hover and active states. Keyboard
focus uses a 3px teal outline with an offset. Keep existing arrow/Home/End tab
navigation, search recovery, sharing fallback and browser history behavior.
Reduced-motion preferences remove smooth scrolling; no decorative animation runs.

## Design process and review

The installed experimental gstack `design-consultation` instructions informed the
product-context, typography, three-look calibration and coherence checks. The
owner's implementation brief supplies the direction and delegates routine
decisions; it does not constitute final brand approval. The existing documentation
format is retained. No paid outside voices, image-generation service or competitor
session access was used. Live competitive research was not performed.

Three materially different wordmark treatments and the selected proposal are
recorded in [the identity review](designs/editorial-identity-review.md). Review the
actual rendered application at desktop, tablet and phone sizes, in monochrome,
at favicon size, with keyboard navigation and enlarged text. Build success alone
does not establish visual quality or complete accessibility.

## Do and do not

Do use readable type, familiar controls, precise language and content that teaches.
Do make draft/source distinctions easy to see at the moment they matter. Do verify
new content and actual browser interactions before updating claims.

Do not restore topography, shields, hacker imagery or the prior contour identity.
Do not substitute a pale skin over the former layout. Do not add elaborate
backgrounds, repeated feature-card grids, invented statistics or review badges.
Do not describe this working proposal as owner-approved branding.
