# Dummy-Down visual direction

Dummy-Down is a field guide for navigating cybersecurity concepts. The interface
uses a dark, spacious composition with a single topographic illustration. The
Explorer and its explanations are the destination; decoration should never
compete with them.

## Palette and typography

Shared tokens live in `src/styles.css` and are exposed through Tailwind's theme.

| Role            | Color     | Use                                            |
| --------------- | --------- | ---------------------------------------------- |
| Canvas          | `#0e1418` | Dark base and quiet margins                    |
| Reading surface | `#141d24` | Explanation pane and explorer toolbar          |
| Foreground      | `#e9edf0` | Headings and primary text                      |
| Muted           | `#a3adb7` | Secondary text, not disabled content           |
| Accent          | `#bdd3da` | Primary action, focus, and selected mode       |
| Draft           | `#d6bc8f` | Draft text labels, always accompanied by words |

Space Grotesk carries headings and the wordmark. IBM Plex Sans handles reading and
controls. Monospace is limited to actual control identifiers. Fonts are bundled
locally through Fontsource packages, with `font-display: swap`; the app does not
request fonts from an external service. Their SIL Open Font Licenses are retained
in `public/font-licenses/` and copied to production output by Vite. The original
application LICENSE remains unchanged.

## Composition and interaction

- Give the hero one memorable element: a static, custom contour illustration.
  Keep it away from the reading area and subtle on mobile. It is decorative,
  hidden from assistive technology, and conveys no compliance progress or data.
- Use clear alignment, generous margins, and restrained separators. Avoid
  repeated feature-card grids, neon, glow, parallax, and decorative status numbers.
- Keep learning-mode introductions short and descriptive. Each link opens its
  corresponding perspective in the Explorer.
- Use a 16px reading size, comfortable line height, and a limited line length.
  The sidebar supports discovery; the explanation pane supports reading.
- Native selects and disclosure controls retain familiar behavior. Selected tabs
  use both an underline and `aria-selected`, with arrow/Home/End navigation.
- Keep visible keyboard focus and persistent draft/source context. Returning from
  an empty state focuses the search field. Respect reduced motion.
- Future framework names belong in factual roadmap information and explicit empty
  states. They are not endorsements or claims of available coverage.

## Research and judgment

Two public skills informed this direction:

- [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/7246805992a42b7bba37d4cac83b01416f0c6c44/.claude/skills/ui-ux-pro-max/SKILL.md)
  supplies searchable curated patterns and accessibility guidance.
- [Anthropic frontend-design](https://github.com/anthropics/skills/blob/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design/SKILL.md)
  supplies an intentional composition and screenshot-critique process.

These skills do not scan live design experts. Their guidance was read from public
sources; no skill runner or external research data is required by the application.
Pro Max's local design-system search matched its cybersecurity-platform profile,
which proposes neon colors and monitoring UI. Those defaults do not fit a quiet
educational site. A narrower editorial query fell back to a general profile, so
it was not treated as a verified education recommendation. The final palette and
composition follow the user's brief; the verified minimal-layout and contrast
guidance informs implementation and review.

## Validation

Run the checks in [DEVELOPMENT.md](DEVELOPMENT.md). Review desktop, small phone,
tablet, and landscape layouts, including empty search and planned frameworks.
Test all modes and source disclosures with a keyboard, and check contrast in the
actual dark theme. Automated checks support review; they do not establish complete
accessibility or cybersecurity content accuracy.
