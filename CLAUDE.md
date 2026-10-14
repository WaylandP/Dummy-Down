# Cipher & Chalk — working agreement

Open-source reference desk for cybersecurity compliance. React 19 + TypeScript
(strict) + Vite + Tailwind v4, deployed to Vercel from `main`. Read `README.md`
for what the site is, `docs/DEVELOPMENT.md` for commands and architecture, and
`docs/design/THE_BOARD.md` for the approved visual direction (the mockups in
`docs/design/mockups/` are the source of truth; `docs/DESIGN.md` describes the
implementation that is live until the Board ships).

## Non-negotiables

- **Never change what a requirement means.** Official quotations stay verbatim,
  visually separate from explanations, and pinned to a publication, version and
  page. Do not invent requirements, assessment objectives, certifications or
  evidence sufficiency. Do not silently swap a pinned baseline for a newer NIST
  publication.
- **Automated checks and AI review are not human approval.** Record real
  reviewers and dates only for reviews that happened. Never fabricate completion
  percentages.
- **Privacy stays intact.** Analytics are production-only, allowlist the seven
  public paths, strip queries and fragments, honor DNT and GPC, and never collect
  search text, answers, shared links or visitor identifiers. Learning progress is
  opt-in, local-only, and deletable. Do not enable paid services or change
  collection permissions.
- **Keep stable identities.** Content IDs, edition IDs, legacy query links and
  historical source URLs must keep working.
- **No CUI, real evidence, credentials or personal data** in code, tests, docs,
  issues or PRs. The project never needs it.

## How we ship

- Work on a feature branch; never commit to `main` directly.
- One coherent change per PR. Describe what a visitor can do after it.
- Before pushing a frontend change run `npm run typecheck`, `npm run lint`,
  `npm run format:check`, `npm test`, and `npm run build`. Run
  `npm run check:content` whenever catalog, perspective or README inventory data
  changes. Run `npm run test:browser` for UI changes.
- CI must be green before merge. Merging to `main` deploys production.
- Keep `docs/ROADMAP.md`, `TODOS.md` and `CHANGELOG.md` honest and current when a
  milestone moves. Keep the README audience-facing; maintainer detail lives in
  `docs/`.

## Code conventions

- Framework data stays separate from presentation; do not assume every framework
  has CMMC levels.
- Semantic HTML first. Keyboard operable, visible focus, 44px targets, reduced
  motion and forced-colors support are requirements, not polish.
- Prefer small focused components and URL-driven state (`src/state/`).
- Add or update a behavioral test with every behavior change.
- Write explanations in a plain, confident voice. State the project's review
  status once per page at most, not on every element.
