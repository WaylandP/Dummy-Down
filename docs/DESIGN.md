# Cipher & Chalk: Decode Board design system

The owner authorized the **Cipher & Chalk** display name and selected Decode Board
direction for a complete redesign of the existing application. It supersedes the
previous Dummy-Down editorial identity. Historical design/review documents retain
their original context; they do not govern the active brand.

This is an adult teaching workspace: precise enough to trust, approachable enough
to learn from, with a little character. Deep evergreen/slate board surfaces frame
cream/off-white reading areas. Restrained teal identifies useful interactions.
Texture and annotations belong to the margins, never behind long body text.

The refined reference image mentioned in the brief is unavailable in this session;
only the complete text brief is accessible. The implementation follows its stated
direction, with no pixel-match or inspected-image claim. The [UI inventory and plan](designs/cipher-and-chalk.md)
defines the actual product surfaces. Final owner visual sign-off remains pending.

## Identity and assets

Use the exact name **Cipher & Chalk**, including the ampersand. The coded-C mark
uses crisp geometric strokes, an open counter and a small detached code segment;
it is a teaching/decoding identity, not a security shield or padlock. The inline
SVG mark and wordmark form the horizontal lockup in `Brand.tsx`; the home link has
an accessible full-name label and decorative geometry is hidden from assistive
technology.

The identity assets are `public/brand/coded-c.svg`, `coded-c-mono.svg`,
`lockup.svg` and `app-icon.svg`, with the rendered PNG at
`public/apple-touch-icon.png` and simplified small-size favicon at
`public/favicon.svg`. The portable lockup outlines the already bundled,
licensed IBM Plex Sans Medium glyphs; the live React lockup keeps accessible text.
The PNG was rendered from the actual SVG in Chromium. The
[viewed 16/32/40px and icon proof](screenshots/cipher-logo-sizes.png) checks these
assets separately from the larger mark. Preserve LICENSE and font notices.

GitHub now reports the externally renamed repository as `WaylandP/cipher-and-chalk`;
no agent renamed it. Package name, deployment/service IDs, hostname, analytics
storage key and framework/edition/control identities remain unchanged. Historical
source URLs retain their pinned identities.

## Token contract

`src/styles.css` is the canonical implementation. These values were read from the
actual implementation; they are agent-selected defaults within the authorized
direction, not an extraction from the unavailable reference image. Reuse the
tokens instead of creating unrelated component palettes or magic states.

| Palette role                                 | Token/value                                                                      |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| Canvas / reading / selected surface          | `--color-canvas: #f0eee5`, `--color-surface: #fcfaf3`, `--color-raised: #e7eee5` |
| Reading foreground / muted / accent          | `#1c3431`, `#53615a`, `#226d61`                                                  |
| Reading separator / field boundary           | `#d5d9ce`, `#7a887e`                                                             |
| Board / raised board / chalk                 | `#142e2c`, `#1c3c38`, `#f6f2e7`                                                  |
| Board muted / separator / interaction accent | `#b9cbc1`, `#405b50`, `#8ad4c3`                                                  |
| Success / error / warning                    | `#205f49`, `#8b3b2f`, `#705326`; always accompanied by meaningful wording/state  |

Spacing tokens are 4/8/12/16/24/32/48px with a 64px section default; corner
tokens are 4/8/12px. Panel elevation is `0 8px 24px #142e2c0a`. Focus is a 3px
accent outline, using the lighter board accent in the masthead. Functional motion
uses 140ms ease-out; the reduced-motion rule remains authoritative.

| Group         | Roles and use                                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color         | Evergreen/slate board, off-white reading surface, foreground/muted text for each surface, separators, teal accent and interaction states; visible selection/success/error feedback. |
| Typography    | Sharp locally available display, readable locally bundled body/UI, and restrained monospace for control IDs/data; clear hierarchy without handwritten paragraphs.                   |
| Spacing       | Reusable internal gaps and section rhythm; comfortable reading measure and predictable control padding.                                                                             |
| Borders/radii | Quiet reading/workspace boundaries, consistent field/selection outlines and restrained corner treatment.                                                                            |
| Elevation     | Limited real surface depth where it separates board and reader; no glow or repeated floating-card effects.                                                                          |
| Focus         | Visible focus that contrasts on both board and reader; preserve logical keyboard order and offset.                                                                                  |
| Motion        | Brief functional state transitions, with reduced-motion support and no decorative looping animation.                                                                                |

Body/UI uses locally bundled IBM Plex Sans 400/500, with upright Georgia/Times
New Roman/device serif for display and platform monospace for control IDs. These
preserve verified local loading instead of introducing a new font service. Body
text uses `--text-body: 16px`; long teaching retains 17px type, generous line height
and roughly 68ch measure. The stylesheet also defines matching `--text-reading`
and `--leading-reading` tokens. `--font-code` centralizes the
monospace role. Existing IBM Plex Sans and unused Space Grotesk notices remain. The
bundled font licenses were inspected; platform serif appearance varies by device.
No paid design provider is required. Font identity is not content approval.

## Composition and teaching grammar

The product is the Explorer and reading workspace. Keep the introduction concise
and place a real search or default-lesson action close to it. Avoid mockup-only
navigation, dashboards, statistics, testimonials or account flows.

The surrounding board supplies orientation and personality. The reading area
supplies calm concentration. Use an actual desktop discovery/reader layout, not
a stack of unrelated feature cards. The official quotation, draft explanation,
possible approach and source/review context keep separate labels.

Supported lessons move from meaning to fictional situation, common misunderstanding,
diagram and explained knowledge check. Do not fabricate those sections for controls
without that content. Instructional diagrams share step/branch and annotation
styles, but retain native ordered text and visible equivalents. An annotation
clarifies a real detail; it is not decoration that competes with the lesson.

Question states show selection and correct/incorrect wording beyond color. Preserve
radio/fieldset semantics, explanatory feedback, retry/reset/next gates and focus
on the next prompt or completion. Progress is local session activity, not a saved
account, compliance score or demonstrated learning outcome.

## Responsive and accessibility rules

Desktop and tablet keep discovery alongside comfortable reading. Phones prioritize
the selected lesson and its useful actions, with explicit expandable browsing.
Retain the established breakpoint set unless actual overflow motivates a scoped
adjustment. The reader is an inline-size container: its three-column perspective
grid wraps labels and hides decorative icons/dots below 440px of reader width. This
handles a narrow reader as well as a narrow viewport. Check dense results, long
titles, tabs, definitions and questions at
320px as well as representative tablet/desktop widths and 200% zoom.

Use at least 44px useful touch targets and at least 48px perspective tabs. Preserve
the skip link, native control labels, tab arrows/Home/End, heading/search recovery
focus, glossary Escape/focus return and native disclosure indicators. Do not remove
visible focus to simplify the brand. Keep reduced-motion scrolling and avoid
horizontal overflow. Source checks alone do not establish WCAG conformance.

Loading, empty, unavailable, planned, filter-mismatch, clipboard-fallback and privacy
states are first-class design surfaces. Give each a readable status and its real
existing recovery action. Keep browser privacy preferences, production analytics
gating and fail-closed behavior intact; never add raw search/answer collection.

## Decisions and verification

The new name, selected material palette and complete existing-UI scope come from
the owner's October 14 implementation brief. Exact layout/token choices use
delegated routine judgment; they are not inferred owner approval of unseen pixels.
No official control quotation or content-review status changes for visual reasons.

The [redesign workflow record](reviews/cipher-and-chalk-gstack-2026-10-14.md)
separates actual skill execution from scoped/manual planning and blocked native
contracts. The [actual UI verification](reviews/cipher-and-chalk-ui-2026-10-14.md)
records the complete inventory-to-delivery mapping, 18 viewed captures, nine journey
and five synthetic recovery groups, tests and sampled contrast. Rendered review
repaired crowded tabs at 200% CSS zoom and the incorrect-answer border specificity.
Screen-reader, Safari/iOS, real-learner and complete accessibility checks remain
pending. The reviewable feature PR and exact successful Vercel preview provide
owner review; preview sign-in protection was retained. Agent merging or production
promotion still requires explicit approval.
