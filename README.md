# Cipher & Chalk

**Cybersecurity, decoded.**

**What does this requirement actually mean?** Cipher & Chalk helps people understand
cybersecurity requirements through plain-English explanations, practical examples,
and different learning perspectives. Starting with CMMC.

[Visit the public website](https://dummy-down.vercel.app) ·
[Report a problem](https://github.com/WaylandP/cipher-and-chalk/issues) ·
[Contribute](CONTRIBUTING.md)

The public website returned the application successfully on October 13, 2026.
Feature work is reviewed in separate Vercel previews before an approved merge;
production and a pull request's preview can show different versions. See
[deployment and preview review](docs/DEPLOYMENT.md).

The complete existing interface now uses the **Cipher & Chalk Decode Board**
identity. Review the latest refinements in [PR #11](https://github.com/WaylandP/cipher-and-chalk/pull/11)
and its [verified Vercel preview](https://dummy-down-l33cn6g04-waylandp.vercel.app).
The preview requires Vercel sign-in; deployment succeeded for frontend commit
`75726def64038e5b061c148bec621ccf48956de4`. The owner merged the first implementation
in PR #10; agents have not merged or promoted production. GitHub's repository name
changed externally to `WaylandP/cipher-and-chalk`; deployment, package, storage and
content identities retain their existing values.

[Actual screens and validation](docs/reviews/cipher-and-chalk-ui-2026-10-14.md)
cover the Explorer, teaching, feedback and recovery states. The
[redesign inventory and delivery plan](docs/designs/cipher-and-chalk.md) records the
complete scope and missing reference-image limitation. Owner visual review and
real-learner feedback remain welcome; implementation is not qualified content
approval or a complete accessibility assessment.

![Cipher & Chalk desktop homepage](docs/screenshots/cipher-home-desktop.png)

## What you can use today

- Browse CMMC Level 1, 2, and 3 source references; search by identifier, topic,
  family, or level.
- Switch between **Beginner**, **IT & Cyber**, and **Compliance** teaching drafts
  for every catalog entry. Read the official quotation alongside the explanation.
- Copy a link to a specific control and perspective. Search, filters, and browser
  Back/Forward preserve the reading context.
- Open contextual definitions and a searchable draft glossary.
- Practice three Level 1 concepts—authorized access, public information, and media
  disposal—with fictional scenarios, explained questions, and diagrams with text
  equivalents. The original demo activity remains available too.
- Use visible draft labels, edition/page citations, source comparison, and
  loading/error recovery to understand the limits of the material. Level 1 review
  records separate source checking, AI-assisted review, and pending human approval.
- Pause optional usage measurement through **Usage & privacy**.

For example, an approved account does not automatically approve every device that
uses it. A workplace scenario makes that distinction concrete; the source view
lets you check the full wording instead of treating the scenario as a checklist.

This is an early educational application. There are no accounts, organizational
assessment uploads, compliance scores, or chatbot. Other frameworks are planned;
their names in the interface do not represent available control libraries.

## Content coverage and review

The catalog is a **September 2024 CMMC v2.13 publication snapshot**, with quotations
from the model and Level 1–3 assessment guides. Counts describe identifiers in
that edition, not distinct security concepts or professionally reviewed lessons.

<!-- content-summary:start -->

| Snapshot inventory      | Available |
| ----------------------- | --------: |
| Level 1 references      |        15 |
| Level 2 references      |       110 |
| Level 3 references      |        24 |
| Total references        |       149 |
| Draft perspective texts |       447 |

<!-- content-summary:end -->

Each of the 149 references has three separately authored teaching drafts. The
original README-based Level 2 demo is a separate educational example and is not
counted as another official requirement. There are **20 draft glossary terms**,
including 14 sourced additions linked from Level 1 content. Interactive practice
covers **four draft activities and 12 questions**: the original demo plus three
Level 1 activities, each with a common misunderstanding, three explained questions,
and an accessible diagram. These activities do not cover the entire catalog.

**Qualified human approval is pending.** Source transcription checks and
AI-assisted editorial review have occurred; neither establishes professional
approval, complete assessment-objective coverage, current applicability, or a
guarantee of accuracy. The [focused Level 1 audit](docs/content-review/level-1-audit-2026-10-13.md)
compared all 15 controls' perspectives with **59 determination statements** and
made four source-supported clarifications. The app quotes **13 statements** as
context for the three new activities; quotation and AI comparison are not verified
curriculum coverage. All 15 review records keep human approval pending. The
[review process](docs/content-review/REVIEW_PROCESS.md) records these stages
separately. The guide and model have ten wording differences, preserved rather
than silently reconciled.

Direct access to official DoD, FAR/CFR and NIST sources was blocked in the
source-check environment before an origin response; the Level 1 audit records the
11 attempted URLs and proxy CONNECT 403 results. The stored PDFs came from pinned
public mirrors, with document identity, page citations, and SHA-256 checks recorded.
The application presents the
dated snapshot; the latest applicable edition has not been independently verified.
Consult the official publications and your applicable contractual requirements.
See [source provenance and verification](docs/sources/cmmc-2-13-sep-2024.md).

## Roadmap

| Phase                            | Implemented or available drafts                                                                                                                                           | Remaining work                                                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Build the foundation**      | React/TypeScript frontend, complete Decode Board identity, responsive Explorer, framework-independent identities, search, filters, sharing, glossary, tests and previews. | Owner visual review; continue usability, assistive-technology and accessibility checks with real learners.                                                                    |
| **2. Make CMMC understandable**  | Versioned Level 1–3 source inventory, three draft perspectives per entry, a focused Level 1 AI-assisted audit and separate review records.                                | Qualified human approval, current applicability checks and explicit assessment-objective teaching coverage before broader curriculum claims. This phase is not complete.      |
| **3. Make learning interactive** | Three Level 1 draft activities plus the original demo: four scenarios, 12 explained questions, three new diagrams and 20 glossary terms.                                  | Qualified review and learner feedback on these activities; broader reviewed practice coverage and short animated explanations remain planned.                                 |
| **4. Expand the platform**       | Framework-independent architecture and published contribution guidelines.                                                                                                 | Additional frameworks, reviewed relationships between controls and a sustainable community editorial process. No automatic equivalence claims or new framework libraries yet. |

[TODOS.md](TODOS.md) keeps the next priorities aligned with this roadmap.

## Development

Use **Node.js 22.12 or newer**; CI uses Node 24. From the repository directory:

```sh
npm ci
npm run dev
```

Open Vite's printed local URL. A cloud environment with port forwarding can use
`npm run dev -- --host 0.0.0.0`. For owner review, use the pull request's Vercel
preview in a browser rather than a terminal or Codespaces.

Before pushing a change, run:

```sh
npm run typecheck
npm run check:content
npm run check:gstack
npm run lint
npm run format:check
npm test
npm run build
```

The content check compares the published inventory with repository data and
required source/teaching metadata, then runs its regression tests. It does not
judge compliance accuracy. Use `npm run preview` to inspect an already built
frontend locally.

- [Development guide](docs/DEVELOPMENT.md): architecture, addresses and checks.
- [Contribution guide](CONTRIBUTING.md): code, educational content and safeguards.
- [Source-review documentation](docs/sources/cmmc-2-13-sep-2024.md): edition,
  quotations, evidence and known limits.
- [Editorial review process](docs/content-review/REVIEW_PROCESS.md): source checks,
  AI-assisted review, qualified approval and unresolved questions.
- [Deployment guide](docs/DEPLOYMENT.md): GitHub CI, Vercel previews and production.
- [Design notes](docs/DESIGN.md): the implemented identity and interaction system.
- [Cipher & Chalk redesign](docs/designs/cipher-and-chalk.md): UI inventory,
  implementation decisions and acceptance checks.
- [Actual UI verification](docs/reviews/cipher-and-chalk-ui-2026-10-14.md): delivery
  mapping, 18 viewed captures, checks, recovery fixtures and remaining limits.
- [Redesign workflow evidence](docs/reviews/cipher-and-chalk-gstack-2026-10-14.md):
  task-specific gstack applicability, actual execution and exact blockers.
- [Pinned gstack inventory](docs/GSTACK-SKILLS.md): complete skill routing,
  installation checks and coverage evidence.

## Usage measurement

The official Vercel Analytics SDK integration is implemented with production-only
collection, an opt-out, browser privacy preferences, and allowlisted interactions.
It excludes raw search text, answer choices, full shared links, organizational
evidence, and app-generated visitor identifiers. Preview traffic is excluded.

**Account activation, custom-event entitlement, and actual dashboard data receipt
have not been confirmed.** Installing the SDK is not proof that analytics is live.
See [Usage measurement](docs/USAGE.md) for owner setup and measurement limits.

## Educational disclaimer and license

Cipher & Chalk's mission is to make cybersecurity compliance accessible,
understandable, and less intimidating without changing a requirement's intent.
It is an independent educational project, not affiliated with, endorsed by, or
certified by DoD, NIST, or any certification body. Draft explanations, fictional
examples, and possible evidence are not official requirements, legal advice,
certification, or a guarantee of assessment success.

Do not submit CUI, sensitive organizational evidence, credentials, personal
information, or other protected data through searches, issues, or contributions.

The application is licensed under the [MIT License](LICENSE). Source quotations
retain their attribution; bundled font notices are in
[public/font-licenses](public/font-licenses). The application's license does not
grant new rights over third-party publications.
