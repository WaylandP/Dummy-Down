# Phase 1 and 2: eight open milestones

This is the historical starting audit. All four implementation increments have
since merged; see the [final handoff](phase-1-2-handoff-2026-10-14.md) and
[current roadmap](../ROADMAP.md) for the remaining external requirements.

Audited against `main` at `75db00a3bcd2be2e948bd2622e2e4a028c12dc26`
(PR #13, merged October 14, 2026). There were no open PRs at task start.
This is an implementation/evidence audit, not new official-source verification
or qualified content approval. An independent read-only agent checked the same
eight milestones. The original four phases and completed work remain intact.

## Phase 1

### 1. Responsive pages and interface validation

- **Implemented:** Home, Learn, Glossary, About, native/legacy links, Explorer,
  perspective tabs, conditional practice, source/draft disclosures and privacy
  boundaries. Evidence: `src/App.tsx`, `src/state/site-page.ts`, `vercel.json`,
  `src/components/site-pages.test.tsx`, `reader-outline.test.tsx`, and the
  [previous browser checkpoint](study-desk-2026-10-14.md).
- **Incomplete / independently actionable:** repeat current-build layout,
  keyboard, focus, contrast, media-preference and error-recovery checks; repair
  reproduced defects; make browser regressions repeatable. Historical evidence
  does not validate this branch.
- **External:** owner acceptance, actual assistive-technology and Safari/iOS
  sessions, real-reader comfort. Narrow Chromium viewports are not iOS tests.
- **Checkbox gate:** split merged implementation, bounded technical validation,
  and human validation. The latter stays unchecked until dated results identify
  the build, environments, participants' roles, findings and dispositions. New
  engineering subtasks remain unchecked until their approved merge is verified.

### 2. Usability refinement from owner and learner feedback

- **Implemented:** PR #12 responds to owner feedback with direct search, three
  existing practice paths and the reading outline. Evidence: `StudyHome.tsx`,
  `ReferenceDetail.tsx` and the checkpoint above.
- **Incomplete / independently actionable:** fix demonstrated navigation and
  focus friction; prepare a repeatable acceptance cycle for beginner, IT and
  compliance readers. Agent walkthroughs are hypotheses, not learner feedback.
- **External:** actual owner and learner observations and acceptance.
- **Checkbox gate:** finish one explicitly scoped acceptance cycle, resolve or
  agree dispositions for its findings, and record owner acceptance. Keep ongoing
  usability maintenance visible; do not claim feedback work is permanently done.

## Phase 2

### 3. Level 1 educational review

- **Implemented:** 15 entries / 45 drafts, 15 review records, comparison with 59
  determination statements and four recorded corrections. Evidence:
  `src/data/perspectives/level-1-3.json`, `src/data/level-one-review.ts`,
  `src/data/level-one-review.test.ts` and the
  [Level 1 audit](../content-review/level-1-audit-2026-10-13.md).
- **Incomplete / independently actionable:** fresh control-by-control comparison,
  final-content fingerprints, missing-concept tracking and source-supported
  corrections. This is Increment 2, not Increment 1.
- **External:** qualified human approval and current applicability evidence.
- **Checkbox gate:** real qualified reviewers approve each final scoped draft
  against its source/objectives; record identity, qualifications, date, edition,
  scope, findings and resolutions. All current human approvals remain pending.

### 4. Level 2 educational review

- **Implemented:** 110 references / 330 drafts, prior AI editorial comparison.
  Evidence: `src/data/cmmc-213-catalog.json`, `perspectives/level-2-a.json`,
  `perspectives/level-2-b.json` under `src/data/`, and the
  [catalog editorial audit](../designs/cmmc-perspectives-editorial-audit.md).
- **Incomplete / independently actionable:** individual review records, reliable
  objective inventory/mappings, bounded semantic audit and corrections in
  Increments 3–4. Existing Level 1 lookup does not cover Level 2.
- **External:** qualified review and current applicability.
- **Checkbox gate:** source/objective context and gap dispositions for every
  entry, final-text qualified approval and applicability evidence for claims
  made. The existence of 330 texts is insufficient.

### 5. Level 3 educational review

- **Implemented:** 24 references / 72 drafts in the catalog and
  `src/data/perspectives/level-1-3.json`; prior audit linked above.
- **Incomplete / independently actionable:** individual objective/review records,
  source-supported corrections, explicit DoD parameter and exception checks in
  Increments 3–4. Preserve the selected 24 CMMC identifiers; do not import every
  SP 800-172 requirement as a CMMC control.
- **External:** qualified Level 3 review and current applicability.
- **Checkbox gate:** all 24 final entries have attributable source/objective
  review, material gaps resolved, applicable parameters preserved and genuine
  qualified approvals. Seventy-two drafts do not establish completeness.

### 6. Assessment-objective explanation coverage

- **Implemented:** scoped quotation model and 13 draft teaching connections for
  three Level 1 activities. Evidence: `src/types/review.ts`,
  `src/data/level-one-review.ts`, its tests and the Level 1 audit.
- **Incomplete / independently actionable:** trustworthy inventory, explicit
  explained/partial/missing states, perspective/lesson links, source versions,
  human-review state and navigable report with integrity checks (Increment 3).
  Forty-six of the 59 Level 1 statements, across 12 controls, lack those mapped
  connections. Levels 2/3 lack equivalent structured inventories; no objective
  total is asserted here.
- **External:** approval of educational completeness needs qualified review.
- **Checkbox gate:** split tracking infrastructure from teaching completeness.
  Tracking can be completed with explicit gaps; complete draft explanations need
  an evidenced teaching connection for every applicable pinned objective. Human
  approval remains a separate gate. Never infer coverage from quotation counts.

### 7. Qualified reviewers and current applicability

- **Implemented:** [review process](../content-review/REVIEW_PROCESS.md) and
  attributed approval types; no qualified approvals recorded.
- **Incomplete / independently actionable:** reviewer packets, feedback and
  rejection/re-review states, final-content binding, source checklists and dated
  applicability research. Prepare in Increment 2; extend tracking in Increment 3.
  Current types only model already-verified/AI-reviewed Level 1 records; future
  records must permit pending states rather than inheriting those claims.
- **External:** actual qualified reviewers and authoritative current evidence.
- **Checkbox gate:** completed, attributable reviews for the final named scopes
  and authoritative applicability evidence with unresolved contract-specific
  limits stated. Recruiting a reviewer alone does not approve content.

### 8. Official-host verification

- **Implemented:** four pinned PDF identities, source/version/page/hash records;
  11 official URL attempts on October 13, 2026 failed at proxy CONNECT with 403,
  before origin responses. Evidence: the Level 1 audit and
  [source provenance](../sources/cmmc-2-13-sep-2024.md).
- **Incomplete / independently actionable:** retry permitted official sources in
  Increment 2, inspect actual returned documents, record dates/versions/results
  and compare bytes or document authoritative replacements.
- **External:** official-host access if network restrictions persist.
- **Checkbox gate:** successful authoritative content checks for the required
  targets, or evidenced authoritative replacements and reviewed differences.
  A 200/challenge page or mirror availability does not close this item. Preserve
  the historical snapshot; newer NIST editions are not automatic replacements.

## Increment 1 engineering plan and boundary

Use the existing components and history controller. Change only demonstrated
focus/navigation defects and descriptive browser titles. Add Playwright and axe
as development dependencies: jsdom tests cannot observe native focus loss,
rendered reflow or computed contrast. Keep unit tests for state/content/privacy.

```text
Native page / legacy link → App → mounted main + descriptive page title
Explorer address → existing controller → selected control → lesson title
Explicit pagination → new result DOM → first result focus
Quiz check → existing checked state → explanatory feedback focus
Copy request → pending guard → success OR focused selectable fallback
```

Architecture: no router, content schema, network collection or persistence change.
Code quality: use existing refs and effects, avoid new production test seams.
Tests: reproduce browser defects before repair, then test original and adjacent
flows on the production build. Test dependencies stay out of the application bundle.
Performance: no new fetches or catalog transformations; focus runs only after
explicit navigation and titles depend on stable page/lesson text. A clipboard
rejection must not steal focus if the reader moved elsewhere while waiting.

Acceptance preparation and technical evidence live in the
[Phase 1 report](phase-1-quality-2026-10-14.md) and
[human checklist](../testing/PHASE_1_ACCEPTANCE.md).
No Phase 2 content edits or Phase 3/4 implementation are part of this increment.
After owner review and merge, verify the new main SHA, update only satisfied
checkboxes, then begin Increment 2 in a fresh PR.
