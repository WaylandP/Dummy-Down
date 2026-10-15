# Changelog

This file records meaningful project changes verified in Git history and merged
pull requests. Cipher & Chalk has no GitHub releases or version tags, so entries are
grouped by merge date without invented release numbers. Detailed implementation and
validation evidence remains in the linked pull requests and review documents.

## The Board — October 14, 2026

The visual direction approved on October 14 ([specification](docs/design/THE_BOARD.md),
[mockups](docs/design/mockups/)) is being built in five pull requests, each
green in CI before the next. Routes, content identities, legacy links and the
analytics allowlist do not change.

- [PR #39](https://github.com/WaylandP/cipher-and-chalk/pull/39): tokens and
  the app shell. The slate ground with chalk dust, the chalk filter, the Morse-C
  ring and lockup, a four-item nav with a find line, a one-line footer and the
  wooden tray; Walter Turncoat, Atkinson Hyperlegible Next and Martian Mono
  self-hosted; the favicon, app icon and social card regenerated from the mark;
  Changa One, Barlow, Kalam, IBM Plex Sans and Space Grotesk retired. Page
  layouts keep their previous structure inside the shell until their own PRs.
- [PR #40](https://github.com/WaylandP/cipher-and-chalk/pull/40): Home. The
  question in chalk, a search line on a chalk underline that submits the same
  discovery address as the header's find line, the fourteen families with
  their catalog counts as links to filtered discovery, and a bottom row with
  "Start here" or "Last time" beside the publication version. Optional saving
  now remembers the control opened last, under its own key, deleted with the
  rest. The study desk is retired.
- [PR #41](https://github.com/WaylandP/cipher-and-chalk/pull/41): the control
  page. The identifier decoded on the first line, the title as the heading and
  five views carried in the address: Decode (the sentence and its assessment
  objectives, verbatim), Explain (pick a chalk; the explanation in its colour,
  the example in the margin), Evidence, Practice and Related, with a footer
  line that holds the citation and Previous/Next within the current results.
  The older reader and its stylesheet rules are retired.

## Week 2 content and trust — October 14, 2026

- [PR #31](https://github.com/WaylandP/cipher-and-chalk/pull/31): a dedicated
  Disclaimer & terms of use page at `/disclaimer`, linked from every footer.
- [PR #33](https://github.com/WaylandP/cipher-and-chalk/pull/33): About now
  explains CMMC in one paragraph and says who makes the site and why.
- [PR #34](https://github.com/WaylandP/cipher-and-chalk/pull/34): 113 AI review,
  design-iteration and screenshot records moved to the `archive/ai-review-records`
  branch; links updated.
- [PR #32](https://github.com/WaylandP/cipher-and-chalk/pull/32): 34 CMMC Program
  terms added to the glossary (statuses, roles, scoping categories, clauses),
  each written from and linked to 32 CFR part 170, the Level 2 Scoping Guide,
  FAR 52.204-21, 32 CFR 2002.4 or the DFARS clauses. Source record in
  `docs/sources/cmmc-program-definitions-2026-10-14.md`.
- [PR #35](https://github.com/WaylandP/cipher-and-chalk/pull/35): activity and
  visual-explanation disclaimer paragraphs rewritten in the site's current voice,
  with review fingerprints recomputed for the disclaimer-only change.

## Week 1 cleanup — October 14, 2026

A sequence of small pull requests retired the project's working name and process
overhead, and removed repeated review-status hedging from the interface.

- [PR #25](https://github.com/WaylandP/cipher-and-chalk/pull/25): README rewritten as
  an audience-first project page with badges, a stack table and one honest
  content-accuracy section.
- [PR #26](https://github.com/WaylandP/cipher-and-chalk/pull/26): package and
  browser-storage namespace renamed from `dummy-down` to `cipher-and-chalk`, with a
  one-time client-side migration of legacy keys.
- [PR #27](https://github.com/WaylandP/cipher-and-chalk/pull/27): gstack scripts,
  docs and CI step removed; `AGENTS.md` replaced by a concise `CLAUDE.md`.
- [PR #28](https://github.com/WaylandP/cipher-and-chalk/pull/28): unpublished
  frameworks no longer offered in the Explorer dropdown; saved links still resolve.
- [PR #29](https://github.com/WaylandP/cipher-and-chalk/pull/29): "draft" and
  "pending review" labels removed from every lesson, perspective, activity, glossary
  term and coverage row. The Coverage page is reframed as a searchable index of all
  468 assessment objectives, and the About page gains a "How the explanations are
  made" section that carries the project's review status once. Activity and visual
  explanation disclaimer paragraphs in the data files are unchanged and remain a
  follow-up.

## Phase 3 final integration — October 14, 2026

[PR #23](https://github.com/WaylandP/cipher-and-chalk/pull/23) merged at `6a5133b`.
The full source-to-practice journey is tested on phones and desktop. Deferred
Explorer loading reduces measured initial Home JavaScript by 10.8%, including
shared chunks; failed downloads preserve the requested address and offer recovery.
The walkthrough, screenshots, authoring/privacy guidance and roadmap distinguish
finished engineering from pending human review. Local gates passed 565 unit and
113 browser tests; exact-head CI and automatic production deployment succeeded.

## Phase 3 optional local progress — October 14, 2026

[PR #22](https://github.com/WaylandP/cipher-and-chalk/pull/22) merged at `dd8595d`.
Learners can opt into browser-local resume, visited/completed distinctions, revisit
marks and earlier-answer reasoning review. Saving starts off; deletion, content
version checks, browser privacy signals and storage failures are handled explicitly.
CI and automatic production deployment passed; local validation covered 562 unit
and 110 browser tests. No accounts, cloud sync or answer analytics were added.

## Phase 3 visual explanations — October 14, 2026

[PR #21](https://github.com/WaylandP/cipher-and-chalk/pull/21) merged at `40d0754`.
Three controlled 40-second SVG explanations teach authorized access, MFA and
response-team deployment. Transcripts, manual stages, reduced motion and deferred
loading are included. CI passed 509 unit and 97 browser checks; the automatic
production deployment succeeded. Draft content still awaits qualified human review.

## Phase 3 practice expansion — October 14, 2026

PR #20 merged at `1e934d0` with successful automatic production deployment.
Nine source-bound draft activities add three concepts per CMMC level, 27 explained
questions, learning goals and related terms. A searchable practice page links all
13 activities to their exact lessons. Qualified content approval remains pending.

## 2026-10-14

- [#19](https://github.com/WaylandP/cipher-and-chalk/pull/19) made practice easier to
  discover, added direct question entry, counted reviewed questions from zero and
  preserved answer reasoning at completion. Merge `82db49c` and automatic production
  deployment were verified; this does not establish human acceptance.

- [#17](https://github.com/WaylandP/cipher-and-chalk/pull/17) completed the full-field
  Level 2/3 editorial audit, with 16 clarifications across 13 controls and per-control
  review evidence. Approved merge verified at `81cee95`; qualified human review
  and current applicability remain pending.

- [#16](https://github.com/WaylandP/cipher-and-chalk/pull/16) added all 468 pinned
  assessment statements, explicit teaching mappings, a navigable coverage report
  and stale-review integrity gates. Two source-wording gaps and all qualified-human
  approvals remain unresolved. Approved merge verified at `d734898`.

- [#15](https://github.com/WaylandP/cipher-and-chalk/pull/15) recorded source-baseline revalidation,
  current applicability access limits, focused clarifications in ten Level 1
  controls, stale-review fingerprint checks and a qualified-human review packet.

- [#14](https://github.com/WaylandP/cipher-and-chalk/pull/14) improved page/lesson titles and
  keyboard focus through skip links, result pages, quiz feedback, copy fallback
  and reopened search; added browser accessibility regressions and an owner/learner
  acceptance packet. Human validation remains pending.

- [#13](https://github.com/WaylandP/cipher-and-chalk/pull/13) restored the original
  mission, audience, teaching model, and long-term vision in the Cipher & Chalk
  README; added a status-based detailed roadmap and documentation maintenance rules.
- [#12](https://github.com/WaylandP/cipher-and-chalk/pull/12) turned the blackboard
  homepage into a practical reference desk with native control search, three
  existing draft activity entry points, a teaching-board example, and in-lesson
  Source / Explain it / Practice navigation.

## 2026-10-13

- [#11](https://github.com/WaylandP/cipher-and-chalk/pull/11) refined lesson reading,
  feedback, source/review context, and validation evidence.
- [#10](https://github.com/WaylandP/cipher-and-chalk/pull/10) introduced the Cipher &
  Chalk name, supplied four-part mark, and Decode Board visual direction.
- [#9](https://github.com/WaylandP/cipher-and-chalk/pull/9) finalized pinned gstack
  coverage and workflow evidence.
- [#8](https://github.com/WaylandP/cipher-and-chalk/pull/8) repaired the pinned
  project-local gstack tooling and coverage checks.
- [#7](https://github.com/WaylandP/cipher-and-chalk/pull/7) audited the gstack
  workflow and recorded supported, inapplicable, and gated capabilities.
- [#6](https://github.com/WaylandP/cipher-and-chalk/pull/6) added three source-bound
  Level 1 learning activities, glossary additions, and editorial-review records.
- [#5](https://github.com/WaylandP/cipher-and-chalk/pull/5) introduced the editorial
  learning interface that preceded the current Cipher & Chalk design.
- [#4](https://github.com/WaylandP/cipher-and-chalk/pull/4) added three draft
  perspectives across all CMMC levels and privacy-conscious usage analytics.
- [#3](https://github.com/WaylandP/cipher-and-chalk/pull/3) added the versioned
  149-reference CMMC snapshot, source metadata, shareable state, glossary, and first
  interactive draft lesson.
- [#2](https://github.com/WaylandP/cipher-and-chalk/pull/2) added the pinned gstack
  Codex setup and field-guide planning records.
- [#1](https://github.com/WaylandP/cipher-and-chalk/pull/1) built the initial React,
  TypeScript, Vite, and Tailwind CSS frontend with the first Control Explorer and
  test/build workflow.
- Commit [`5cc78c2`](https://github.com/WaylandP/cipher-and-chalk/commit/5cc78c255224d3a8cbaa9ab3dd52ee19be28f076)
  established the original mission, audience, teaching modes, four-phase roadmap,
  security warning, and long-term framework vision under the Dummy-Down working name.
