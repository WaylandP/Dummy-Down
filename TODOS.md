# Cipher & Chalk follow-up work

The [detailed roadmap](docs/ROADMAP.md) is the milestone source of truth. This file
keeps the next actionable priorities; the [changelog](CHANGELOG.md) records work
already merged into `main`. No completion percentage is implied.

- **The Board's remaining features follow in build order.** The shell, every
  page, the phone bar, the print sheet and the keys ship in five pull
  requests. [THE_BOARD.md](docs/design/THE_BOARD.md) lists what comes next,
  one pull request each; the Decode clause map, the Rev 3 tab, chalk
  popovers (for the lesson's words on Explain), Send this chalk, Erase, the
  timeline and the assessor's three words are in, and the CedarPoint story and
  Dash follow. Discovery
  and the project's demo lesson keep their earlier layout until their own
  pass. Anything that adds a fact lives in `src/data/` with a source record
  under `docs/sources/`.
- **Phase 3 engineering is shipped.** All five scoped increments are merged with
  successful exact-head CI and automatic production deployments. The
  [execution log](https://github.com/WaylandP/cipher-and-chalk/blob/archive/ai-review-records/docs/reviews/phase-3-execution-2026-10-14.md) records evidence;
  use the [walkthrough](docs/testing/PHASE_3_WALKTHROUGH.md) for browser review.
  Next work is qualified content/current-applicability verification and actual
  owner, learner and assistive-technology acceptance. Phase 4 remains outside scope.

- **Previous handoff: all four Phase 1/2 engineering increments merged.** Review the
  [eight-milestone audit](https://github.com/WaylandP/cipher-and-chalk/blob/archive/ai-review-records/docs/reviews/phase-1-2-milestone-audit-2026-10-14.md),
  [technical evidence](https://github.com/WaylandP/cipher-and-chalk/blob/archive/ai-review-records/docs/reviews/phase-1-quality-2026-10-14.md) and
  [acceptance packet](docs/testing/PHASE_1_ACCEPTANCE.md). Focus repairs and browser
  regression coverage were merged in approved PR #14 at `ebaed5f` on October 14.
  Owner/learner, actual screen-reader, Safari/iOS and native browser-zoom checks
  remain open. Increment 2 was merged in approved PR #15 at `ef02c29`.
  Increment 3 was merged in approved PR #16 at `d734898`: all 459 determinations,
  nine ODP rows, explicit mappings, unresolved gaps, lazy report and integrity gates.
  Increment 4 / PR #17 was merged at `81cee95`: it audited all 134 Level 2/3 controls
  and their 402 perspective drafts in three bounded batches, with 16 clarifications
  across 13 controls.
  The [audit record](docs/content-review/level-2-3-audit-2026-10-14.md) distinguishes
  completed comparison, passed validation and remaining human review. The
  [applicability register](docs/sources/applicability-2026-10-14.md) records 18 blocked
  official-host requests. The [final handoff](https://github.com/WaylandP/cipher-and-chalk/blob/archive/ai-review-records/docs/reviews/phase-1-2-handoff-2026-10-14.md)
  lists the external prerequisites and evidence needed to resume. No further
  independently actionable repair is identified in this scoped audit. Current
  applicability requires external verification. Phase 3 is now separately authorized;
  Phase 4 remains outside scope.

- **P1: qualified review across all three levels and current applicability.** The
  [October 14 audit](docs/content-review/level-1-audit-2026-10-14.md) compared all
  15 controls' perspectives with 59 determination statements and clarified ten
  controls while retaining the four earlier corrections. Per-control fingerprints
  and the [Level 2/3 audit](docs/content-review/level-2-3-audit-2026-10-14.md) now
  prepare all 149 controls for actual human comparison through the
  [qualified-review packet](docs/content-review/QUALIFIED_REVIEW.md). Every human
  approval remains pending.
  Obtain real qualified review before approval claims. Resolve the recorded
  official-host access failures and verify current DoD/FAR/NIST applicability
  without silently replacing the September 2024 v2.13 snapshot.
- **P1: owner and learner feedback on the reference desk.** The implementation was
  merged in [PR #12](https://github.com/WaylandP/cipher-and-chalk/pull/12). Review the
  [study-desk checkpoint](https://github.com/WaylandP/cipher-and-chalk/blob/archive/ai-review-records/docs/reviews/study-desk-2026-10-14.md) for the latest
  structure and style: direct search, three existing draft practice paths, a small
  teaching board, reference links and the lesson outline. Check whether readers can
  find help quickly while the blackboard remains comfortable to read.
  Screen-reader, Safari/iOS and real-learner checks remain pending.
- **Phase 3 review packet:** PRs #19–23 delivered practice UX, nine source-bound
  additions, three controlled visuals, optional local progress and final integration.
  Review the [activity packet](docs/content-review/phase-3-activities-2026-10-14.md)
  and [visual packet](docs/content-review/phase-3-animations-2026-10-14.md) with
  qualified contributors; no human approval is inferred from their AI-assisted audits.
- **P2: review the earlier focused learning milestone.** Three Level 1 activities now
  cover authorized access, public information and media disposal with fictional
  scenarios, common misunderstandings, nine explained questions and three
  accessible diagrams. The original demo adds three questions; 14 sourced
  vocabulary additions bring the glossary to 20 draft terms. Seek qualified review
  and real learner feedback before expanding. These drafts do not establish
  catalog-wide practice coverage; do not introduce compliance scores or real evidence.
- **P2: assessment-objective review and learner feedback.** Review the
  [explicit mappings](docs/content-review/objective-mapping-2026-10-14.md) and resolve
  the two specialized-asset gaps with qualified scoping expertise. The 466 mapped
  drafts and 13 selected practice links do not establish human approval or
  existence of a complete curriculum. Test beginner comprehension and distinct
  mode usefulness with real readers. Broader
  curriculum remains future work; the three delivered animations need human review.
- **P2: maintain the public project story.** Update
  [the roadmap](docs/ROADMAP.md) whenever a milestone is materially advanced,
  blocked, re-scoped, or completed. Add meaningful merged changes to
  [the changelog](CHANGELOG.md); keep implementation and test detail in technical
  documents rather than allowing the README to become an internal release report.
- **P2: confirm analytics account status through owner review.** The privacy-
  preserving Vercel SDK integration exists; activation, custom-event entitlement
  and data receipt are not confirmed. Use actual aggregate signals and voluntary
  issue reports to choose revisions, without inferring individual learning or
  compliance readiness. Do not activate paid services or collect free text.
- **P3: additional frameworks and reviewed relationships.** Remain planned until
  source licensing, applicable editions, taxonomy and qualified review are ready.
  Do not claim equivalence automatically. Authentication, a backend, subscriptions
  and an AI chatbot are outside this iteration.
