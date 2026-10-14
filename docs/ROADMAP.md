# Cipher & Chalk roadmap

This roadmap describes the project direction and the evidence-backed state of each
milestone. It preserves the original four phases. A working interface, a passing
test, or the existence of draft text does not by itself complete an educational or
content-review milestone.

## Status labels

- **Completed and merged into main** — implemented, validated for its stated scope,
  and present on the default branch.
- **Implemented but awaiting validation or review** — present in the application,
  but owner, learner, accessibility, editorial, or professional review remains.
- **Currently in progress** — active work or the next maintained priority has begun.
- **Planned for future development** — part of the long-term direction, without a
  delivery commitment or claim of availability.
- **Blocked by external dependencies** — requires access, expertise, licensing,
  policy decisions, or another dependency outside the current implementation.

## Phase 1: Build the Foundation

- [x] **Completed and merged into main** — Initialize the React, TypeScript, Vite,
      and Tailwind CSS application with documented local development and CI checks.
- [x] **Completed and merged into main** — Build responsive Home,
      Learn, Glossary, and About pages with the Cipher & Chalk identity, keyboard
      support, and native direct-link handling (through PR #12). Implementation
      availability is separate from the following validation tasks.
- [x] **Completed and merged into main** — Increment 1 technical validation and focused
      usability repairs: repeatable Chromium accessibility, layout, keyboard,
      history and recovery checks passed. Approved PR #14 was verified merged at
      `ebaed5f` on October 14. See the
      [technical report](reviews/phase-1-quality-2026-10-14.md).
- [ ] **Blocked by external dependencies** — Validate the interface with actual
      assistive technology, Safari/iOS, native browser zoom, owner acceptance and
      real-reader comfort. Use the [acceptance checklist](testing/PHASE_1_ACCEPTANCE.md)
      and record actual environments/results; automation does not close this task.
- [x] **Completed and merged into main** — Create framework-independent framework,
      edition, control, source, and lesson identities; CMMC-specific levels stay outside
      the shared model assumptions.
- [x] **Completed and merged into main** — Deliver the Control Explorer with search,
      framework/family/level filters, pagination, recovery states, and source-aware
      control detail.
- [x] **Completed and merged into main** — Add searchable controls, shareable lesson
      addresses, browser Back/Forward behavior, contextual definitions, and a searchable
      20-term draft glossary. Feature availability does not approve glossary content.
- [x] **Completed and merged into main** — Publish contribution, development,
      deployment, source-provenance, content-review, privacy, and security guidance.
- [ ] **Currently in progress** — Refine usability from owner and learner feedback
      without weakening source, draft, privacy, or accessibility boundaries.
      The current cycle has two explicit acceptance tasks below.
- [x] **Completed and merged into main** — Repair reproduced
      implementation issues and prepare a repeatable owner/learner acceptance packet
      in Increment 1 (PR #14). This does not record a completed human acceptance cycle.
- [ ] **Blocked by external dependencies** — Run that acceptance cycle with the
      owner and real learners, disposition findings and record scoped acceptance.
      Continue collecting feedback after this cycle.

Phase 1 has substantial merged implementation, but its human validation work is not
finished.

## Phase 2: Make CMMC Understandable

- [x] **Completed and merged into main** — Import a versioned September 2024 CMMC
      v2.13 source snapshot with 149 identifiers: 15 Level 1, 110 Level 2, and 24 Level 3.
- [x] **Completed and merged into main** — Preserve assessment-guide and model
      quotations, page/version citations, document identities, fingerprints, and known
      wording differences.
- [x] **Completed and merged into main** — Provide Beginner, IT & Cyber, and
      Compliance modes as working product functionality across all 149 entries.
- [ ] **Implemented but awaiting validation or review** — All 15 Level 1 entries have
      three source-bound teaching drafts. An AI-assisted audit compared the 45 views
      with 59 determination statements, but every qualified-human approval is pending.
- [x] **Completed and merged into main** — Increment 2 repeats the
      Level 1 comparison, clarifies ten controls and binds each perspective record
      to a tested review fingerprint (approved PR #15, merge `ef02c29`). This
      engineering subtask does not complete the teaching or human-review milestone.
      See the [dated audit](content-review/level-1-audit-2026-10-14.md).
- [ ] **Implemented but awaiting validation or review** — Level 2 has 110 source
      references and 330 draft perspective texts. Increment 4 compared all fields
      with the complete pinned guide sections in two bounded batches and clarifies
      12 controls. Qualified review and current applicability remain pending;
      AI-assisted comparison does not approve the teaching.
- [ ] **Implemented but awaiting validation or review** — Level 3 has 24 source
      references and 72 draft perspective texts. Increment 4 compared all fields
      with the pinned guide and records one source-conflict clarification;
      qualified review and current applicability remain pending. See the
      [Level 2/3 audit](content-review/level-2-3-audit-2026-10-14.md).
- [ ] **Currently in progress** — Define and track assessment-objective explanation
      coverage separately from references, perspectives, citations, and possible
      evidence. Increment 3 / PR #16 imports all 459 lettered determinations and nine
      ODP statements and maps selected teaching fields with explicit unresolved gaps.
      The navigable report and integrity gates were merged in approved PR #16.
      Thirteen selected practice links remain illustrations, not a complete curriculum.
- [x] **Completed and merged into main** — Objective inventory,
      explicit teaching mappings, gap notes, report and re-review integrity checks
      were merged in approved PR #16 at `d734898` on October 14. See the
      [coverage record](reviews/objective-coverage-2026-10-14.md).
- [x] **Completed and merged into main** — Increment 4 / PR #17
      completed the AI-assisted full-field Level 2/3 audit, 16 focused field corrections
      across 13 controls and tested per-control review fingerprints. Final CI passed;
      the owner-approved merge was verified at `81cee95` on October 14.
      Qualified-human approval is separate.
- [ ] **Blocked by external dependencies** — Obtain qualified review of objective
      interpretations, including the `SI.L3-3.14.3e` source wording/scoping conflict.
      All source and teaching fingerprints must match the reviewed content.
- [ ] **Blocked by external dependencies** — Obtain qualified cybersecurity/CMMC
      reviewers and verify current applicability before calling content approved or
      definitive.
- [x] **Completed and merged into main** — Prepare qualified-review
      instructions and a per-control feedback template, with qualifications,
      source/objective checks, approval/rejection states and change/re-review rules.
      The [review packet](content-review/QUALIFIED_REVIEW.md) was merged in approved
      PR #15; real reviewer recruitment and decisions remain separate.
- [ ] **Blocked by external dependencies** — Verify current official DoD, FAR/DFARS,
      CFR and NIST applicability. Increment 2 rechecked the pinned source files;
      all 18 new official-host requests were blocked before an origin response.
      See the [dated applicability register](sources/applicability-2026-10-14.md).
      Do not silently replace the pinned baseline.

Phase 2 is not complete. Broad draft coverage is a starting point for review, not a
substitute for it.

The [eight-milestone audit](reviews/phase-1-2-milestone-audit-2026-10-14.md)
records the starting evidence and checkbox gates for every originally unchecked
Phase 1/2 task. All four engineering increments are now merged: technical quality
and acceptance preparation (#14), source research/Level 1 audit/review workflow
(#15), objective coverage (#16), and Level 2/3 audit (#17). The
[final handoff](reviews/phase-1-2-handoff-2026-10-14.md) identifies the remaining
external work and the evidence needed to resume. Neither phase is fully complete.
Phase 3/4 work is preserved below and is outside this assignment.

## Phase 3: Make Learning Interactive

- [x] **Completed and merged into main** — Add the original fictional demo activity
      with an explained three-question knowledge check.
- [ ] **Implemented but awaiting validation or review** — Three edition-bound Level 1
      activities cover authorized access, public information, and media disposal with
      scenarios, common misunderstandings, accessible diagrams, and nine explained
      questions.
- [ ] **Implemented but awaiting validation or review** — The 20-term draft glossary,
      including 14 source-cited Level 1 additions, supports contextual learning.
- [ ] **Currently in progress** — Improve navigation and accessibility for different
      learning styles, and test whether beginners understand the activities and the
      three modes. Semantic, keyboard, reduced-motion, forced-color, responsive, and
      Chromium checks exist; real learner and assistive-technology review remains.
- [ ] **Planned for future development** — Expand reviewed exercises and realistic
      scenarios across more Level 1, Level 2, and Level 3 concepts.
- [ ] **Planned for future development** — Create short animated explanations for
      visual learners, with transcripts, reduced-motion alternatives, and editorial
      review. No animated lesson is available today.
- [ ] **Planned for future development** — Explore progress and practice features
      only after privacy, accessibility, retention, and learner-value questions are
      defined. Saved progress is not currently implemented.

Phase 3 is not complete. Four activities and 12 questions are a focused learning
sample, not interactive coverage of the full catalog.

## Phase 4: Expand the Platform

- [x] **Completed and merged into main** — Keep the content architecture independent
      of CMMC-specific levels and publish a contribution process for code and education.
- [ ] **Planned for future development** — Research source licensing, editions,
      taxonomies, and review needs for NIST SP 800-53, FedRAMP, SOC 2, ISO/IEC 27001,
      and the HIPAA Security Rule. These names do not represent available libraries.
- [ ] **Planned for future development** — Add another framework only after its
      authoritative-source, licensing, identity, maintenance, and qualified-review plan
      is approved.
- [ ] **Planned for future development** — Model reviewed relationships between
      controls without claiming automatic equivalence across frameworks.
- [ ] **Currently in progress** — AI-assisted, source-bound educational drafting and
      review processes exist. Outputs remain visibly draft and require qualified human
      review; there is no user-facing generative chatbot.
- [ ] **Currently in progress** — Contribution and editorial-review guidance exists.
      A sustainable community content workflow, governance, and professional reviewer
      network still need to be established.
- [ ] **Planned for future development** — Investigate source access, licensing, and
      reuse rights before selecting or importing content for any future framework.

Phase 4 is not complete and has no committed delivery schedule.

## Other external confirmations

- **Blocked by external dependencies** — Vercel Analytics account activation,
  custom-event entitlement, and actual dashboard receipt require owner/account
  confirmation. The privacy-preserving integration exists, but provider receipt is
  not verified.

## Maintaining this roadmap

The [README](../README.md) gives visitors the concise project story and current
state. [TODOS.md](../TODOS.md) lists the next actionable priorities. The
[changelog](../CHANGELOG.md) records meaningful changes already merged into `main`.

Update this file when a milestone is completed, materially advanced, blocked,
re-scoped, or removed. Preserve future milestones unless a documented project
decision changes them. Never use fabricated completion percentages or treat
automated/AI-assisted validation as qualified human approval.
