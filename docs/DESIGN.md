# Cipher & Chalk: the supplied Decode Board reference

The owner's October 14 **Exact Visual Reference Implementation** brief and two
supplied images are authoritative. Both images were inspected. This direction
supersedes the previous cream-reader, serif-heading, coded-C interpretation.
See [reference provenance and the full brief](design-references/README.md).
Owner acceptance of the rendered implementation is still pending.

## Identity

Use **Cipher & Chalk**, with off-white words and a turquoise ampersand. The symbol
has four alternating curved sections around circular negative space: two worn
white outlined sections, two turquoise filled sections. Do not replace it with a
C monogram, generic squares, shield or padlock.

`public/brand/chalk-mark.svg` is the scalable interpretation of the supplied mark.
`Brand.tsx` uses it with live text; `public/brand/lockup.svg` has portable outlined
Changa One glyphs. `app-icon.svg`, the rendered `apple-touch-icon.png`, and
`public/favicon.svg` use the same geometry. The favicon omits tiny texture so its
16px shape survives. Legacy `coded-c.svg` / `coded-c-mono.svg` filenames remain
compatible aliases to the new geometry; their names do not define the identity.
The original PNG was visually available, but its file bytes were not exposed.
The recreated wear is approximate; never claim this SVG is the original asset.

Do not rename repositories, hosting resources, package/storage IDs or source URLs
for branding. Preserve LICENSE and existing third-party notices.

## Palette and type

The canonical implementation is `src/styles.css`. Colors use the supplied starting
palette, checked visually against the references, not claimed to be pixel-sampled.

| Role                               | Value                             |
| ---------------------------------- | --------------------------------- |
| Canvas / chalkboard                | `#052b23`                         |
| Deep activity surface              | `#03251e`                         |
| Reading surface / raised surface   | `#072f27` / `#12372f`             |
| Off-white chalk / muted text       | `#f1f4ef` / `#b4c9bf`             |
| Turquoise emphasis and interaction | `#53e6d4`                         |
| Divider / input boundary           | `#365c50` / `#739e8c`             |
| Success / error / warning          | `#8fddaa` / `#ffb1a2` / `#ecc981` |

Changa One 400 gives the wordmark its heavy block form. Barlow 800 supplies upright
headlines. IBM Plex Sans 400/500 remains body and UI text; IDs use platform monospace.
Kalam 400 is limited to diagram notes and short teaching eyebrows. The hero's short
supporting line uses the reference's serif contrast; body paragraphs are not handwritten.

New fonts are local Latin WOFF2 assets from Fontsource 5.3.0, SIL OFL 1.1, with
checksums in `public/fonts/sources.json` and licenses in `public/font-licenses`.
No runtime font service or paid provider is used. Changa One has softer corners than
the reference specimen; this is a documented owner-review difference.

Spacing retains 4/8/12/16/24/32/48px tokens and a 64px section rhythm. Small fields
use 3px corners, teaching surfaces 4px, outer shells 8px. Avoid floating-card mosaics,
glows, glass effects, gradients and a return to large cream backgrounds. Static grain
is barely visible on the canvas; solid reading surfaces protect long-text clarity.

## Layout and teaching

Use the website portion of the reference, not the brand presentation above it:
logo and wordmark left, working navigation right, a large left-aligned headline and
handwritten three-step drawing. Exact hero copy:

> SECURITY CONTROLS. TRANSLATED FOR REAL LIFE.
>
> Okay, but what / does it mean?
>
> Decode the terms. See what they do. Apply them with confidence.

The second headline line is turquoise with a short chalk underline. Navigation
exposes Lessons, Topics (the real glossary), About, Search and Browse Lessons.
Stories is omitted until it has a real destination. Browse/Search use valid existing
discovery URLs; Search anchors the labeled input. Start decoding opens the existing
Level 1 default lesson. Existing mode shortcuts remain below the Explorer.

`DecodeDiagram.tsx` supplies actual text in an ordered Requirement → Meaning → Real
life flow, with purpose-drawn SVG strokes, arrows and selective turquoise marks.
The log-retention illustration is visibly labeled a **fictional policy example**,
not a CMMC quotation. Never rewrite official requirements to fit the illustration.

Wide screens place copy and drawing side by side. From 761–1000px they occupy
separate rows so notes retain useful widths. Phones stack the three steps with
illustration and explanation beside each other. Keep the diagram readable rather
than scaling a desktop screenshot. Do not add unrelated illustrations to every control.

All existing Explorer, source, perspective, practice, glossary, loading/error/empty,
sharing and privacy surfaces use the same dark tokens. Retain comfortable 16–17px
body text, generous line height and roughly 68ch measure. Official quotations,
fictional examples and pending-review labels must remain visibly distinct.

## Accessibility and behavior

Preserve semantic headings, labels, native disclosure markers, keyboard tab navigation,
quiz fieldsets/radios, correct/incorrect wording, feedback focus and recovery actions.
Use 44px target height (perspective tabs at least 48px), clear accent focus outlines
and non-color selection cues. Narrow navigation labels retain spacing and 44px height;
the search icon has 44×44px bounds. The reader's existing container query protects
mode tabs independently of viewport width. Verify 320/390/tablet/1440px, zoom and
forced colors; respect reduced motion. No decorative animation is needed.

Keep exact shared identities/URLs, source/draft notices, current local quiz behavior,
production-only analytics, opt-out, Do Not Track and Global Privacy Control. Design
validation is not content approval, a learning outcome or a full WCAG certification.

## Review checkpoint

See [before/after screenshots, checks and remaining mismatches](reviews/reference-visual-2026-10-14.md).
This task allows at most two visual review/fix rounds. Stop at the first validated
Vercel preview and keep the PR Draft until the owner provides design feedback.
Do not merge, enable auto-merge, promote production or expand curriculum in this task.
