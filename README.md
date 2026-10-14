# Cipher & Chalk

**CMMC, decoded.** Every control in the CMMC v2.13 catalog, explained three ways, with the official source text one scroll away.

[![CI](https://github.com/WaylandP/cipher-and-chalk/actions/workflows/ci.yml/badge.svg)](https://github.com/WaylandP/cipher-and-chalk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live site](https://img.shields.io/badge/live-cipherandchalk.vercel.app-111111)](https://cipherandchalk.vercel.app)

**[Open the site →](https://cipherandchalk.vercel.app)**

![Cipher & Chalk home page: a search box over a dark chalkboard, three practice situations, and a teaching board](docs/screenshots/study-desk/home-desktop.png)

## What it is

Cipher & Chalk is an open-source reference desk for cybersecurity compliance. It takes
the dense language of frameworks like CMMC and NIST SP 800-171 and puts a plain-language
explanation, a technical explanation, and an assessor's-eye explanation next to the
exact sentence they came from.

It is built for the person who reads a control, understands every word, and still
can't tell what they're being asked to do.

## What's inside

| Feature                        | Detail                                                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **149 controls**               | The full CMMC v2.13 catalog across Levels 1, 2 and 3, each with its requirement quoted from the assessment guide and cited to the page.     |
| **3 perspectives per control** | Beginner, IT & Cyber, and Compliance. Same requirement, three audiences, one page.                                                          |
| **468 assessment objectives**  | Every lettered determination statement from the Level 1–3 assessment guides, searchable and mapped to the explanation that covers it.       |
| **13 practice activities**     | Short fictional scenarios with 39 explained questions. Wrong answers get a reason, not a buzzer.                                            |
| **3 visual explanations**      | 40-second animated walkthroughs of authorized access, MFA, and response-team deployment, with transcripts and reduced-motion stills.        |
| **Glossary**                   | Plain-language definitions that also open inline inside any lesson.                                                                         |
| **Private by design**          | No accounts, no backend. Progress is optional and stays in your browser. Analytics are allowlisted, production-only, and honor DNT and GPC. |

## Who it's for

- People entering cybersecurity, IT, or compliance for the first time.
- IT admins and engineers who just inherited a CMMC project.
- DoD contractors and small businesses preparing for a self-assessment or C3PAO assessment.
- Anyone who has to explain a control to someone else.

## The three perspectives

Each control page keeps the official requirement at the top and lets you switch how it's explained.

| Perspective    | Answers                         | Written for                                                                            |
| -------------- | ------------------------------- | -------------------------------------------------------------------------------------- |
| **Beginner**   | "What does this actually mean?" | No security background assumed. Everyday situations, no jargon.                        |
| **IT & Cyber** | "How would I actually do this?" | People who build and run systems. One possible approach, plus what to watch for.       |
| **Compliance** | "What will an assessor ask?"    | People preparing for assessment. Questions to bring to the guide, evidence to discuss. |

## Quick start

Requires Node.js 22.12+ (CI runs on Node 24).

```sh
git clone https://github.com/WaylandP/cipher-and-chalk.git
cd cipher-and-chalk
npm ci
npm run dev
```

Run the full check suite before opening a pull request:

```sh
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build
npm run test:browser   # Playwright + axe-core accessibility checks
```

## Tech stack

| Layer   | Choice                                                                                    |
| ------- | ----------------------------------------------------------------------------------------- |
| UI      | React 19, TypeScript (strict), Vite 8                                                     |
| Styling | Tailwind CSS v4 with design tokens in `src/styles.css`                                    |
| Content | Versioned JSON catalog (`src/data/`) with SHA-256-pinned source snapshots                 |
| Tests   | Vitest + Testing Library (unit), Playwright + axe-core (browser, accessibility, keyboard) |
| Quality | ESLint, Prettier, GitHub Actions on every PR                                              |
| Hosting | Vercel                                                                                    |

```
src/
  components/   pages and UI (StudyHome, ControlExplorer, ReferenceDetail, PracticePage, ...)
  data/         CMMC catalog, perspectives, objectives, glossary, practice activities
  state/        URL-driven explorer state and page routing
  progress/     optional, local-only learning progress
  analytics/    privacy-gated usage measurement
tests/browser/  Playwright journeys and accessibility specs
docs/           design notes, source provenance, content-review records
```

## Content accuracy

Simplifying a requirement must never change what it requires. Cipher & Chalk keeps
official quotations visually separate from everything written to explain them, and
pins every quotation to a specific publication, version and page.

<!-- content-summary:start -->

| Snapshot inventory      | Available |
| ----------------------- | --------: |
| Level 1 references      |        15 |
| Level 2 references      |       110 |
| Level 3 references      |        24 |
| Total references        |       149 |
| Draft perspective texts |       447 |

<!-- content-summary:end -->

**Source snapshot:** CMMC v2.13 (September 2024) model and Level 1–3 assessment guides.
See [source provenance](docs/sources/cmmc-2-13-sep-2024.md) for document identities,
page citations and checksums.

**Review status:** the explanations are educational drafts. They have been checked
against the source text by automated tests and AI-assisted editorial review, and are
awaiting qualified human review. The [review process](docs/content-review/REVIEW_PROCESS.md)
and [review packet](docs/content-review/QUALIFIED_REVIEW.md) explain how a practitioner
can review individual controls. If you work in CMMC assessment and want to help, that
is the single most valuable contribution right now.

## Roadmap

1. **Foundation** — Explorer, search, glossary, keyboard and reduced-motion support. _Done._
2. **Make CMMC understandable** — all 149 controls with three perspectives. _Done; qualified review pending._
3. **Make learning interactive** — practice activities, visual explanations, local progress. _Done; learner validation pending._
4. **Expand the platform** — NIST SP 800-53, FedRAMP, SOC 2, ISO/IEC 27001, HIPAA. _Not started._

Details, open work and merged changes: [ROADMAP](docs/ROADMAP.md) · [TODOS](TODOS.md) · [CHANGELOG](CHANGELOG.md).

## Contributing

Corrections, clearer explanations, source research, accessibility testing and code are
all welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md); maintainer-level detail
lives in the [development guide](docs/DEVELOPMENT.md) and [design notes](docs/DESIGN.md).

Please do not submit Controlled Unclassified Information, real organizational evidence,
credentials or personal data through the app, issues or pull requests. The project never
needs it.

## Disclaimer

Cipher & Chalk is an independent educational project. It is not affiliated with,
endorsed by, or certified by the Department of Defense, NIST, the Cyber AB or any
certification body. Nothing here is legal advice, an assessment result, or a guarantee
of assessment success. Always consult the official requirements:
[DoD CMMC Program](https://dodcio.defense.gov/CMMC/) ·
[NIST SP 800-171 Rev. 2](https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final) ·
[NIST SP 800-172](https://csrc.nist.gov/pubs/sp/800/172/final)

## License

Code is [MIT](LICENSE). Quoted source material retains its original attribution, and
bundled font notices are in [public/font-licenses](public/font-licenses).
