# Developing Dummy-Down

Dummy-Down is an early educational application. Start by reading the project's
[mission and roadmap](../README.md). This frontend foundation provides a responsive
homepage, an initial Control Explorer, and Beginner, IT & Cybersecurity, and
Compliance & Assessment explanation modes for one draft CMMC example.

The example is an educational interpretation, not a complete official requirement
or reviewed assessment guide. Glossary, quizzes, comprehensive framework coverage,
accounts, and a backend remain future work.

## Start locally

Install [Node.js](https://nodejs.org/) version **22.12 or newer**; Node 24 is the
version used in CI. npm ships with Node.js. Check your versions with:

```sh
node --version
npm --version
```

From the repository directory, install the exact dependencies recorded in
`package-lock.json` and start Vite:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Edits to source files appear in the browser
automatically. Use Ctrl+C in the terminal to stop the server.

For a cloud development environment that exposes a forwarded port, use:

```sh
npm run dev -- --host 0.0.0.0
```

Use port forwarding if your development environment supports it. Codex's environment
onboarding UI does not provide web previews; validate the app with local requests
and browser checks inside the machine instead. The frontend requires no
credentials, external service, or environment variables. Dependencies must be
available from the npm registry during installation.

## Understand the code

The [design notes](DESIGN.md) describe the dark topographic direction, palette,
self-hosted fonts, and interaction principles. `src/components/Topography.tsx`
contains the static hero contours; `public/font-licenses/` contains licenses
distributed with the fonts.

| Location                     | Purpose                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| `src/main.tsx`               | Mounts React into the HTML page.                                                       |
| `src/App.tsx`                | Assembles the page and coordinates the interactive experience.                         |
| `src/components/`            | Reusable interface pieces, including the Control Explorer.                             |
| `src/types/content.ts`       | TypeScript definitions for frameworks, controls, learning modes, and content metadata. |
| `src/data/frameworks.ts`     | Framework metadata, including supported versus planned status.                         |
| `src/data/controls.ts`       | Educational control examples and learning-mode definitions.                            |
| `src/data/control-search.ts` | Shared search and filtering behavior.                                                  |
| `src/styles.css`             | Tailwind integration and shared visual styles.                                         |
| `src/` test files            | Behavioral checks for the user-facing experience.                                      |
| `vite.config.ts`             | Vite development/build settings and Vitest test configuration.                         |
| `.github/workflows/ci.yml`   | Runs automated checks on pull requests and changes to `main`.                          |

React renders the interface from data and state. TypeScript catches inconsistent
data and component props before the app runs. Vite handles local development and
the production build. Tailwind supplies styling utilities while shared components
keep repeated interface patterns consistent.

The content model separates a framework's identity, version, families, and control
identifiers from how the interface displays them. Learning modes are part of the
educational content, not a CMMC-specific UI rule. This allows future frameworks to
use the same explorer without pretending they have CMMC's levels or terminology.
Listed future frameworks are roadmap information; they are not searchable control
libraries yet.

Official source links, applicable versions, and review status travel with the
content. Source records distinguish the project README from official publications.
The first control has `contentKind: 'educational-example'` and
`reviewStatus: 'draft'`. Its version context identifies the README's simplified
CMMC Level 2 example using a NIST SP 800-171 Rev. 2 identifier; it does not claim a
reviewed interpretation or automatically map to every current framework version.

A source link identifies the basis for an explanation; it does not make that
explanation official or reviewed. Keep draft status visible until a qualified review
has taken place, and consult the applicable authoritative publications when
assessing an organization's requirements.

## Validate a change

Follow [AGENTS.md](../AGENTS.md) for feature branches, incremental validated pushes,
and GitHub/Vercel browser review. The [gstack guide](GSTACK.md) covers the optional
project-local Codex skills and their current compatibility limits.

Run these checks from the repository directory before opening a pull request:

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

- **Typecheck** validates TypeScript without producing application files.
- **Lint** checks code conventions and common programming mistakes.
- **Formatting** checks consistent layout with Prettier. Run `npm run format` to
  apply it; the original README and LICENSE are deliberately excluded.
- **Tests** exercise meaningful behavior, such as selecting a learning mode or
  finding a control. They are not a substitute for cybersecurity content review.
- **Build** runs typechecking, then creates the production frontend in the
  generated `dist/` directory. Running typecheck separately helps isolate failures.

To inspect the production build locally:

```sh
npm run preview
```

Open the URL printed by the preview server. Vite's development and preview servers
are development tools; publishing a production site is a separate deployment step.

Also review the page manually at narrow and wide widths. Use only the keyboard to
reach the explorer, search and filter controls, change learning modes, and follow
source links. Check visible focus, readable text, and useful empty-search results.
Automated checks do not prove complete accessibility or compliance accuracy.

## Dependencies and troubleshooting

Use `npm ci` when setting up an existing checkout. It uses the lockfile and fails
if the dependency manifest and lockfile disagree. For an intentional dependency
change, use `npm install`, commit both `package.json` and `package-lock.json`, and
explain the change in the pull request. Do not commit `node_modules/` or `dist/`.

If a command reports an unsupported Node version, upgrade Node and rerun `npm ci`.
If the default development port is occupied, Vite normally prints an available
alternative; use the actual URL in its output. If a test fails, read the failure
and reproduce the behavior before changing the expectation.

Never fix an installation problem by disabling TLS verification or bypassing
package integrity checks. Resolve the tool version, network, or certificate issue
instead.
