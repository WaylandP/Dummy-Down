# CMMC perspectives, source accuracy and usage

Date: 2026-10-13  
Repository: WaylandP/Dummy-Down  
Branch: feat/cmmc-perspectives-usage  
Status: implementation plan; validation and qualified editorial review remain separate  
Mode: open-source builder, with routine decisions delegated by the owner

## Problem and intended result

The README promises that complicated controls become understandable from different
experience levels. The current application contains the complete pinned CMMC
September 2024 v2.13 source inventory, but only the separate README example has
teaching perspectives. A reader can find a control and its quotation, then reaches
“Teaching explanations are pending.” This change should connect all three CMMC
levels to useful, distinct teaching drafts and let the owner see aggregate usage.

The strongest experience is a reader sharing one exact control with three people:
a newcomer, an administrator and a compliance colleague. Each reads a different
explanation while referring to the same attributed requirement. A teacher could
also use that address during a workshop: switch perspective to explain the same
idea to the room, then open the source together. The existing shareable identity
and keyboard-accessible tabs already support this possibility.

The owner asked the agent to “do EVERYTHING without me” and specifically requested
all three levels, accuracy, excellent perspectives and usage. This document records
routine decisions under that authorization. It does not approve merging or buying
a service. It builds on `field-guide.md`, `shareable-lessons-plan.md` and the
existing catalog validation notes; their older coverage claims do not validate
this expanded work.

## Office-hours premise challenge and choice

| Premise                                                           | Evidence and challenge                                                                                                                                                          | Decision                                                                                              |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| All three levels are missing.                                     | They already exist in the source snapshot: 15 Level 1, 110 Level 2 and 24 Level 3 identifiers. The gap is teaching coverage and discoverability.                                | Verify the existing inventory and expose the level choices; preserve its version identity.            |
| “100% accurate” can be established through tests.                 | Hashes, inventory comparisons and page-level quotation checks establish bounded source fidelity. They do not establish current contract applicability or expert interpretation. | Report exactly what was verified and keep authored explanations visibly draft until qualified review. |
| Three modes can be a shorter and longer version of the same text. | The README describes different reader needs, not three lengths. Generic family text would leave a particular control unexplained.                                               | Every control needs its own meaning, operational context and source-reading perspective.              |
| More interface makes a lesson better.                             | The owner's brief asks for dark, spacious and professional with little noise.                                                                                                   | Reuse the current reading column and tabs; add useful content before adding decoration.               |
| Knowing usage requires tracking every visitor.                    | The owner's questions concern where readers go and what actions they take. Raw searches, organizational evidence, replay and identity are unnecessary.                          | Record bounded aggregate actions through the existing hosting provider, with clear privacy controls.  |

Approaches considered:

- **A — retain source-only references and improve navigation.** Small effort and
  low implementation risk; reuses the entire explorer. It improves discovery but
  leaves the owner's requested per-control teaching experience unresolved.
- **B — separate authored teaching drafts from source records.** Medium to large
  editorial effort; moderate semantic risk. It reuses stable identities, source
  citations, tabs and address state, while permitting all 149 controls to have
  meaningful perspectives without modifying quotations. This is selected.
- **C — a new guided curriculum, accounts and learning dashboard.** Large scope,
  higher content and security burden. It could support class activities later but
  requires progression and review decisions that this request does not establish.

Select B because the missing value is understanding a particular requirement,
and the existing foundation already handles browsing, sharing and state. Begin
with source checks, then ship reviewable validated teaching and measurement
increments through the feature PR. No merge is required between increments.

## What already exists and what is outside this change

Existing reusable contracts include the exact `{frameworkId, editionId,
controlKey}` identity, separate official quotations and project drafts, native
source disclosures, local-font dark design, accessible `LearningModes`, guarded
clipboard sharing, paginated results, one URL/history controller and the fictional
README-example activity. Vitest and Testing Library protect those flows.

This change does not certify compliance, determine a contract's applicable level,
publish official assessment objectives authored by the project, or claim expert
review. It does not introduce accounts, organizational evidence uploads, session
replay, a public visitor dashboard, invented statistics, automatic framework
equivalence or a live AI explanation service. The README and LICENSE remain intact.

## Source and editorial contract

1. Preserve the immutable September 2024 v2.13 snapshot: 149 level-specific
   identifiers, comprising 15 + 110 + 24. These are not 149 unique security
   concepts. Do not substitute the older 17-practice Level 1 inventory, NIST
   SP 800-171 Rev. 3, or all 35 NIST SP 800-172 requirements.
2. Check all four source-document hashes, official identifiers, titles, guide
   quotation text, model wording, page anchors and publication metadata against
   acquired PDFs. Extend verification where the existing script does not check
   model statements. Preserve the ten genuine guide/model wording differences.
3. Retry authoritative publication access if practical. If official access remains
   blocked, retain the pinned acquisition provenance and the explicit limitation
   that present applicability and newer editions have not been independently
   established. A mirror match alone is not current-publisher verification.
4. Store teaching drafts separately and join on the exact versioned control
   identity. Each of the 149 records needs all three perspectives; its draft
   status, basis and edition must travel with it. Never mutate the guide quotation
   to make a simplification sound more natural.
5. Beginner text explains every material action or boundary in that requirement
   without a technical vocabulary prerequisite. IT & Cyber describes the relevant
   mechanism and realistic considerations without prescribing a vendor or adding
   requirements. Compliance explains how to read the quoted requirement and
   consult the assessment guide; any evidence example is a discussion candidate,
   not an official evidence list or a claim of sufficiency.
6. Preserve explicit parameters in the actual source, including applicable Level 3
   timing and operational provisions. Do not turn an illustrative interval into
   an official frequency, or omit a condition that changes a control's meaning.
7. Fictional examples remain clearly illustrative. A helpful analogy is subordinate
   to the real meaning: for example, a physical-key analogy must not erase
   processes acting for users or devices from authorized-access explanations.
8. Independently review the authored drafts for contradictions, missing clauses,
   overly broad scope, ambiguous pronouns, jargon and copied family boilerplate.
   Structural coverage tests cannot substitute for this reading. Document any
   independent-review failure and any unresolved qualified-review limitation.

## Engineering review

### Architecture and failure boundaries

```text
Pinned guide/model records ────────> exact source quotations + provenance
          │ stable identity
          └──> separate teaching drafts ──> selected perspective panel
                         │
App's single URL controller ──> filters / control / perspective / share address
                         │ deliberate user action
                         └──> bounded usage adapter ──> Vercel Web Analytics
                                  │ disabled, denied or unavailable
                                  └──> learning remains fully usable
```

Teaching content remains static, reviewable data. The renderer needs no CMMC-shaped
identifier parser and no provider-generated interpretation at runtime. Missing or
mismatched teaching content must produce honest source-only coverage, never the
nearest other control's lesson. A future framework can reuse the explanation
contract while preserving its own taxonomy and edition.

Introduce one usage boundary that validates event names and bounded fields. UI
callers should describe learning actions, not assemble arbitrary provider payloads.
Use the official Vercel integration because the application already deploys there;
confirm its actual SDK APIs and deployment behavior before wiring it. Do not put
service secrets into a Vite environment variable or client bundle.

Realistic failure handling: unknown teaching identity keeps its source visible;
provider script or network failure never breaks navigation; storage denial does
not prevent privacy controls or learning; malformed/incoming addresses never
become arbitrary analytics properties. An opt-out must block subsequent actions
immediately, not only after a refresh.

### Code quality and reuse

Reuse `LearningModes` and the single history controller. A small shared perspective
panel is justified if both the README teaching example and publication teaching
drafts use the same view contract; keep their provenance and activity availability
different. Avoid a general schema engine, a second router/store or per-component
analytics SDK initialization. New explanatory data should follow the project's
existing typed data conventions, and comments should explain source boundaries
rather than repeat obvious component behavior.

Existing regressions to protect include same-selection focus, Back/Forward,
unsupported modes, filters excluding an incoming selection, collection mismatch,
stale asynchronous clipboard feedback and planned frameworks. These issues already
have tests: extend affected behavior rather than duplicating their test suites.

### Test and verification plan

| Contract              | Meaningful assertion                                                                                                                                  | Limits                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Source fidelity       | Every identifier and quotation matches the pinned documents and its cited page; ten differences remain distinct.                                      | Does not establish current applicability or teaching correctness.         |
| Teaching completeness | All 149 exact identities have three distinct nonempty perspectives, source basis and draft labels; parameters and clauses get targeted checks.        | Text existence and uniqueness are not editorial review.                   |
| Perspective flow      | A selected control changes meaningfully between modes; keyboard arrows/Home/End retain focus; copied URL and Back restore that same control and mode. | Component checks need complementary browser inspection.                   |
| Scope and version     | A source edition never resolves another edition's teaching draft; the old sample stays separate; planned frameworks do not gain invented coverage.    | Does not validate another framework's content.                            |
| Usage privacy         | Query text, unknown URL fields, fragment, clipboard values and fictional answer text cannot escape through pageview or event payloads.                | A mocked provider does not prove receipt in Vercel.                       |
| Usage controls        | Disabled deployment, opt-out and available browser privacy signals prevent collection; storage/network failure leaves the app usable.                 | Provider processing and account configuration need separate verification. |
| Action semantics      | One deliberate real change emits one bounded event; unchanged selection, restore, render replay and denied sharing do not report false success.       | Aggregate events do not prove an individual learned.                      |

Run lint, formatting, tests and production build before every frontend push. Use
the real browser for a Level 1, Level 2 and Level 3 control, all perspectives,
source disclosure, share/history, empty search and privacy controls at desktop and
phone widths. Inspect real network destinations and analytics payloads using
nonsensitive fixture searches. Distinguish local SDK behavior, exact-commit CI,
preview deployment success and actual provider dashboard receipt.

### Performance

Render only the selected perspective. The existing eight-row result pagination
prevents putting 149 articles or 447 panels into the document. Check the production
bundle after adding static teaching data and the SDK; report observed changes
instead of inventing speed claims. Debounce only measurement that needs it, not
the reader's search feedback, and avoid an event for every keystroke. No database,
background worker or cross-session cache is justified for this slice.

## Design review: seven passes

### 1. Information hierarchy

The homepage remains a quiet entry to learning; the explorer is an operating
surface around a reading surface. The three things that deserve attention are
the selected control, its explanation and the authoritative source basis.

```text
CONTROL EXPLORER
Search + framework + collection
├─ Results: level/family filters → eight rows → page controls
└─ Selected control
   ├─ title + identifier + level + publication version + draft status
   ├─ official requirement with page citation
   ├─ Choose your perspective: Beginner | IT & Cyber | Compliance
   │  └─ distinct heading → short meaning → useful examples → takeaway
   └─ source context / wording differences + copy reference link
Footer: Usage & privacy controls
```

Keep the official quotation readable without opening several disclosures. Keep
the longer hash/acquisition details and genuine wording comparison in native
disclosures. Do not place all three explanations side by side or add a second
dashboard inside the lesson.

### 2. Interaction states

| Feature          | Ready                                                                          | Empty or partial                                                 | Error                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Perspectives     | One selected tab and its labeled panel; short explanation of that perspective. | Missing draft retains source and says teaching is pending.       | Unknown identity keeps explicit recovery, never swaps in another control.                                     |
| Discovery        | Visible counts, level choices and results.                                     | No results explains the active filters and offers Clear filters. | Malformed address offers the existing recovery path.                                                          |
| Sources          | Exact quotation and page citation; context can expand.                         | Missing source metadata is labeled unavailable.                  | A blocked external publisher remains an external-access limitation, with the labeled pinned mirror available. |
| Usage preference | Visible aggregate-measurement explanation and working control.                 | No collected data is not replaced by fake visitor counts.        | Storage or provider failure does not prevent learning or claiming the current in-session preference.          |

Static teaching content has no network-loading spinner. Analytics script loading
has no learning spinner and no distracting success toast after each interaction.

### 3. Journey and emotional arc

| Moment             | Reader action and feeling                                      | Design support                                                                    |
| ------------------ | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| First five seconds | “This may help me understand a real control.”                  | Clear product identity, one strong topographic anchor, direct Explorer action.    |
| Find a control     | “I know which level and requirement I am viewing.”             | Actual level filters, official identifier and explicit snapshot.                  |
| Change perspective | “This explanation meets me where I am.”                        | Three stable tabs; control-specific meaning and examples; no disruptive jump.     |
| Read source        | “I can distinguish their words from the publication.”          | Exact quote, citation, persistent draft boundary and provenance disclosure.       |
| Share              | “My colleague can open the same thing.”                        | Exact identity and perspective in a shareable address; honest clipboard feedback. |
| Return later       | “The project tells me what changed and what is still a draft.” | Versioned records and reviewable source history.                                  |

### 4. Generic-design risk

Keep the existing dark topography, bundled Space Grotesk and IBM Plex, restrained
accent and spacious reading rhythm. The new content belongs in the current article,
not a symmetrical feature grid. There is no reason for neon, ornamental security
icons, a progress ring or an analytics tile mosaic. The READ/OPERATE section has
one job: let a person understand a selected requirement.

The brand and strong visual anchor already exist. Cards are unnecessary for the
explanation. Motion is unnecessary for this change; content must be visible without
animation. Useful mode descriptions earn a line; repeated disclaimer paragraphs
that bury the explanation should be consolidated without removing the boundary.

### 5. Design-system alignment

Reuse the existing canvas `#0e1418`, surface `#141d24`, text `#e9edf0`, muted
`#a3adb7` and accent `#bdd3da` through current variables. Body/source text stays at
least 16px with comfortable line-height and an approximately 68-character measure.
Keep square-to-subtle-radius controls and existing focus treatment. A privacy
section should resemble the glossary/source disclosures, not a marketing banner.

### 6. Responsive and accessible behavior

At wide widths, the result sidebar and reading column remain distinct. At phone
widths, preserve labeled search and filters, put results before the chosen article,
and keep perspective tabs adjacent to their panel. Tabs may wrap deliberately but
must not clip labels or create horizontal scrolling at 320px. Retain 44px minimum
interactive targets, visible focus, selected-state contrast and the existing
roving-tab keyboard behavior. Mode changes should keep focus on the selected tab;
ordinary analytics work must never move focus. Privacy controls need a visible
label, an accurate current state and keyboard operation.

### 7. Remaining decisions and actual limits

Routine scope and UI choices above are delegated. Current Vercel account enablement,
plan availability for custom events and dashboard receipt require verification;
they are not implied by adding an SDK. Qualified editorial review and verification
of current official applicability remain independent content obligations. Browser
screenshots and interaction checks belong to implementation QA, not this document.

No numeric design score is assigned from text alone. This document applies the
seven design dimensions; it does not claim a completed formal visual review.

## Usage: owner questions and honest signals

| Owner question                  | Bounded signal                                                                               | Interpretation                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Where do readers go?            | Sanitized pageviews, known navigation sections, selected framework/collection/level/control. | Catalog and section demand, within collection coverage.                          |
| Which perspective helps?        | Deliberate mode changes and known control context.                                           | Preference or exploration; does not establish understanding.                     |
| Where is discovery difficult?   | Search used, result-count bucket, filter changes and zero-results occurrence.                | Friction without collecting search text.                                         |
| Do readers use deeper learning? | Scenario opened, question checked and activity finished with bounded activity/question keys. | Learning interactions; no compliance/readiness score.                            |
| Can they verify and share?      | Source disclosure opened, bounded source-link category, copy attempt/success/fallback.       | Source interest and sharing behavior; success follows actual outcome.            |
| What should be improved next?   | Compare aggregate demand with draft coverage and empty-result events.                        | Editorial priorities, followed by qualitative review rather than guessed intent. |

Never send raw search text, glossary queries, organization names, answer strings,
full share/source URLs, clipboard content, full address query/fragment, arbitrary
incoming identifiers or persistent visitor fingerprints. Use a strict allowlist
for known metadata and strip query and fragment before provider pageview dispatch.
Do not claim that the provider collects no network metadata beyond our payloads;
describe the actual integration and link its privacy documentation.

Exclude local development and preview QA from ordinary production measurement
unless a deliberate, documented test mode is being used. Honor the reader's
opt-out and supported browser privacy signals. Explain these choices briefly in
the app and document exactly which events are emitted. Do not record a visitor's
opt-out as an analytics event. Usage controls remain useful without accounts.

The owner should review aggregate data in Vercel's authenticated dashboard. If
Web Analytics or custom events require an account-side setting or paid plan,
finish and validate the concrete integration and describe that dependency honestly;
do not activate paid features, invent data or expose an administrator credential.
Traffic totals are incomplete when readers opt out or block analytics, and events
cannot identify unique humans reliably. Report those limits alongside conclusions.

## Reviewable delivery and owner review

1. Verify inventory/source fidelity and preserve findings in source notes. Add the
   three-mode draft data with integrity checks and targeted semantic review.
2. Connect those drafts to the shared perspective experience; check all three
   levels, URL restoration, keyboard behavior and narrow layouts. Validate and
   push a complete reviewable increment if independent of analytics.
3. Integrate bounded analytics and privacy controls. Verify payload sanitization,
   failure behavior and event semantics, then run the full checks and browser QA.
4. Push the completed increment, keep the GitHub PR accurate, inspect exact-commit
   CI and Vercel deployment status, and provide the real preview link. Do not merge.

Concrete owner review: open one Level 1, Level 2 and Level 3 control in the preview,
switch all perspectives and note any example that feels unclear or overbroad.
Then use the authenticated usage dashboard, if enabled, to check a small set of
nonsensitive test actions against the documented events. The agent should continue
the authorized implementation and validation before handing over this review.

The owner's statements “nothing too noisy/crowded” and “continuously review the
latest website design in my browser” make readability and incremental deployment
binding product requirements. Their “100% accurate” request makes honest source
boundaries essential; a confident-looking explanation cannot replace verification.

## Skill application and evidence limits

Read the installed gstack office-hours preamble, context gathering, builder-mode
section, premise challenge, alternatives, founder-signal guidance and design/handoff
section. The builder section explicitly supports fast-tracking when the owner says
“just do it”; the owner's delegation governs routine preference gates. Also read
the installed engineering review's architecture, code quality, test-value,
regression and performance sections, and the design review's scope, system audit,
design principles and seven passes. Their recommendations inform this plan; full
formal engineering/design review artifact workflows are not claimed completed.

No outside provider review, paid design generation or live expert scan ran. This
plan agent read the README, project instructions, design/development notes, prior
design filenames, current source/types/components and existing gstack learnings.
The prior identity and single-controller learnings describe proposals from an
older snapshot: current code already implements those contracts. Current source
verification, teaching-data review, analytics API research, implementation and
browser QA are separate assigned work; their final evidence must be recorded by
the implementing reviewers.
