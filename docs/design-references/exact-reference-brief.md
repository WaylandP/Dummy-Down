# Cipher & Chalk: Exact Visual Reference Implementation

## Priority: HIGH — Visual Design Correction

I am unhappy with the current Cipher & Chalk website because it does not match the reference design I have repeatedly provided.

**The attached full design image is the authoritative visual reference for this task.**

This is not a request for another creative interpretation. Do not redesign the concept, substitute your own preferred design system, or invent a new visual direction.

I want the existing functional application redesigned to faithfully match the visual language, branding, colors, typography, layout, and educational chalkboard personality shown in the reference.

## 1. Verify the reference before starting

Open and inspect the ACTUAL ATTACHED IMAGE using available image-reading capabilities.

Also inspect the attached square logo PNG.

If either attachment is unavailable, STOP and report the missing asset. Do not attempt to reconstruct the design from text alone.

The reference image contains a branding presentation at the top and a website mockup at the bottom.

Understand the difference:

- The top section establishes the logo, typography, and brand identity.
- The lower section demonstrates the desired website layout and learning experience.
- "2 THE DECODE BOARD" is a presentation heading, not a mandatory website navigation element.

Inspect the current application, current main branch, and open pull requests before editing.

Do not overwrite ongoing work or discard uncommitted changes.

## 2. Reproduce the actual brand identity

**Brand name: Cipher & Chalk**

The current brand presentation must match the reference.

### Logo

Use the attached logo as the visual source of truth.

The symbol has four alternating off-white and turquoise geometric sections arranged around a central circular negative-space shape.

It has a distinctive worn-chalk texture.

Do not replace it with:

- A generic C icon.
- A simple four-square grid.
- A security shield.
- A minimal letter monogram.
- A differently proportioned geometric logo.

Use the supplied PNG where appropriate. Create a faithful scalable version for the website if possible, preserving the geometry and texture rather than simplifying it into a different mark.

### Wordmark

The reference uses bold, heavy, block-style display typography.

"Cipher" is off-white.
"&" is turquoise.
"Chalk" is off-white.

The wordmark should feel strong, recognizable, and intentionally designed.

Do not substitute a thin, elegant serif wordmark or generic SaaS typography.

Use a properly licensed display font that resembles the reference, or a custom vector treatment if necessary.

Apply the identity consistently to the header, favicon, relevant metadata, and branding assets.

Do not rename repository infrastructure or hosting resources.

## 3. Match the reference color palette

The website should feel like a beautiful, dark green classroom chalkboard.

Starting colors sampled or approximated from the reference:

- Main background: #052B23
- Darkest surface: #03251E
- Raised green surface: #12372F
- Bright turquoise: #53E6D4
- Off-white chalk: #F1F4EF
- Subtle dividers: muted green-gray

Refine the tokens against the actual supplied image.

Avoid:

- Beige or cream backgrounds dominating the page.
- Light-mode dashboards.
- Generic charcoal SaaS panels.
- Blue gradients and purple accents.
- Neon cyberpunk styling.
- Glassmorphism.
- Excessive rounded cards.

Apply a very subtle chalkboard texture where appropriate.

The texture should feel organic and intentional, not like generated visual noise. Maintain readability and contrast.

## 4. Rebuild the homepage around the reference

The lower section of the attached image shows the desired direction.

### Navigation

Use the four-part logo and Cipher & Chalk wordmark.

Navigation structure:

- Lessons
- Topics
- Stories
- About
- Search
- Browse Lessons

Only expose real, functioning destinations. If a destination is not implemented, handle it honestly rather than creating an empty or misleading page.

### Hero

Small heading:

SECURITY CONTROLS.
TRANSLATED FOR REAL LIFE.

Primary headline:

"Okay, but what
does it mean?"

The words "does it mean?" should use the bright turquoise accent.

Supporting copy:

"Decode the terms. See what they do.
Apply them with confidence."

Use typography, spacing, line breaks, and proportions closely matching the reference.

### Educational illustration

The reference shows a three-step explanation:

REQUIREMENT → MEANING → REAL LIFE

Each step uses hand-drawn white chalk illustrations and annotations.

Replicate that presentation as a meaningful educational diagram.

Use authentic-looking chalk strokes, imperfect lines, arrows, handwritten notes, and selective turquoise annotations.

Do not use generic dashboard icons in three glossy cards.

Use appropriate SVG or CSS-based artwork, not the entire reference screenshot as the website background.

Keep diagrams accessible, responsive, and readable.

On mobile, intelligently stack or simplify the illustration while preserving its teaching purpose.

## 5. Apply the design throughout the application

Do not stop after making the homepage look correct.

The existing application includes a Control Explorer, CMMC content, explanations, examples, quizzes, glossary, and other learning features.

Preserve all existing behavior and transform their visual presentation to use the same coherent design system.

Examples:

- Control explanations should resemble carefully organized chalkboard lessons.
- Beginner, IT/Cyber, and Compliance perspectives should be visually distinctive but consistent.
- Important explanations can use chalk-style callouts and annotations.
- Real-world examples should have clear visual hierarchy.
- Quizzes should feel like interactive learning activities.
- Tables and technical content must remain readable.
- Official source citations and draft-review labels must remain visible.
- Search, filters, history, sharing, privacy preferences, and existing CMMC content must continue functioning.

Do not add chalk illustrations everywhere simply for decoration.

Prioritize learning clarity over visual effects.

## 6. Do a real visual comparison

This is the most important acceptance requirement.

BEFORE changing the UI:

1. Capture desktop and mobile screenshots of the current actual application.
2. Inspect the attached reference.
3. Record the biggest visual differences, including logo geometry, typography, colors, hero layout, spacing, and diagram style.

AFTER implementation:

1. Run the application in a real browser.
2. Capture desktop screenshots at approximately 1440px width.
3. Capture mobile screenshots at approximately 390px and 320px width.
4. Compare them directly with the reference and with the previous application.
5. Identify visual differences still present.
6. Correct those differences before reporting completion.

Do not simply report that the design is "inspired by" the reference.

The implementation should visibly match the reference's defining identity.

Treat this as a faithful translation of a visual concept into a working responsive application, not a literal pixel-for-pixel screenshot reproduction.

Do not claim a perfect match unless the evidence supports it.

## 7. Review the result

Run a design critique against the brief above before opening the pull request,
then a code review of the implementation.

## 8. Preserve application integrity

Do not:

- Remove the CMMC control catalog.
- Rewrite official requirement text unnecessarily.
- Remove educational explanations.
- Change framework identifiers.
- Break deep links.
- Weaken existing tests.
- Remove accessibility support.
- Change analytics privacy protections.
- Introduce paid dependencies.
- Merge without approval.

Run:

- npm run typecheck
- npm run lint
- npm run format:check
- npm test
- npm run build

Also verify actual browser behavior on desktop and mobile.

## 9. Update design instructions

Once the new visual direction is implemented, update CLAUDE.md and the design documentation to establish the supplied reference as the authoritative direction for future visual work.

Remove or supersede conflicting older directions.

Record the chosen colors, typography, logo assets, layout rules, chalk illustration treatment, and accessibility requirements.

Save the approved reference asset in a suitable repository design-reference location, provided it is available and authorized for use.

Do not silently replace the reference with a new AI-generated moodboard.

## 10. GitHub and Vercel workflow

Create or continue the appropriate development PR without overwriting ongoing work.

Push the first coherent, validated visual redesign as soon as it is ready.

Vercel should generate the preview automatically.

Give me the actual working preview link so I can inspect the new design without Codespaces or terminal commands.

Keep the PR in Draft until:

- The agreed visual work is complete.
- Screenshots are saved.
- Relevant checks pass.
- The preview is verified.
- Remaining differences are documented.

When the first preview is available, clearly state:

"PREVIEW READY — PLEASE REVIEW THE DESIGN. DO NOT MERGE YET."

Stop after that visual checkpoint so I can provide feedback.

Do not proceed into unrelated features, additional frameworks, or curriculum expansion during this task.

Only after feedback and final validation should you mark the PR ready for my final review. Never merge or promote to production without my approval.

## Final deliverables

Provide:

1. The GitHub pull request.
2. The exact Vercel preview URL.
3. Desktop and mobile screenshots.
4. Before-and-after comparison.
5. The updated logo and brand assets.
6. A concise list of visual differences corrected.
7. Remaining differences that require my judgment.
8. Results of automated tests and actual browser checks.

**Success means the website finally looks and feels like the supplied Cipher & Chalk reference, while preserving the working educational platform.**

Begin by confirming the attached image is readable, then implement the design and deliver the first working preview.
