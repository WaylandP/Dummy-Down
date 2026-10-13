# Level 1 milestone: independent code review

Date: October 13, 2026. Current branch: `feat/level-one-editorial-learning`.
Original review branch: `feat/editorial-redesign-level-one`.
Original increment base: `b3fa2b39072218985ac71b068081b87922f8df60`.
Current main base: `8008256c762bcd23977ac64ef67eb81e55b6ea6f`.
Reviewer: a separate in-host Codex agent, AI-assisted. This is a scoped code
review using the installed gstack review checklist. It is not qualified human
content approval, an outside-model review, or completion of the entire formal
gstack landing workflow. The coordinator owns build, full-suite, browser and
deployment verification.

## Scope

Read the current second milestone's tracked source diff and new application/data
files: the three Level 1 activities, fourteen vocabulary definitions, exact-edition
term mapping, fifteen review records, thirteen determination quotations, optional
learning fields, semantic diagrams, review disclosures and reference-reader
integration. Read the installed gstack review instructions, critical/informational
checklist and `AGENTS.md` before reviewing. Also traced unchanged activity
resolution, contextual definitions, source mapping, analytics privacy gates and
bounded interaction serialization.

No application, test or analytics-permission files were edited by this reviewer.
The only repository artifact owned by the reviewer is this report. The first
redesign increment, complete source transcription audit and live accessibility
review have separate reports and scopes.

The coordinator's GitHub status check reports that owner `WaylandP` independently
merged [PR #5](https://github.com/WaylandP/Dummy-Down/pull/5) at 21:24:40 UTC.
The coordinator carried the uncommitted learning milestone to a fresh feature
branch from current main; it did not merge the PR. The reviewer independently
checked `git diff --stat b3fa2b3 8008256`, which was empty: the two base commits
have identical trees. Earlier review evidence therefore retains its content
scope despite the branch transition. The final reader-order adjustment below has
separate current-input verification.

## Findings and disposition

**Resolved informational defect, confidence 10/10:** the original
`ReferenceDetail` integration gave its sibling `ContextTerms` and
`EditorialReviewContext` the same full-identity React key. An executed integration
test emitted React's duplicate-child-key warning. React does not support reliable
reconciliation for duplicate sibling keys. The coordinator independently found
the same issue and changed the keys to `terms:<identity>` and `review:<identity>`
at `src/components/ReferenceDetail.tsx:162` and `:168`. This retains exact-identity
resets and makes the sibling keys distinct. Current scoped tests passed without
that warning.

The initial scoped run also failed because the new integration test requested a
button named exactly `FCI`. The application correctly exposes its full accessible
name, `Federal Contract Information (FCI)`. The test selector was corrected;
definition opening, Escape focus restoration and reset after navigation remain
asserted. This was a test-selector error, not an application accessibility defect.

No unresolved code defect was identified in the current scoped source. This does
not certify regulatory accuracy or eliminate the documented qualified-review and
present-applicability limits.

The final layout adjustment puts `ReferencePerspectives` before `ContextTerms`,
then the learning activity and review context. Static reading confirms the
perspective selector now precedes the definition links in document order, while
the distinct tuple-bound keys and FCI mapping remain intact. No source, identity,
quiz, privacy or history contract changed. An affected fourteen-test replay
passed on the new branch without warnings. Actual phone geometry belongs to the
separate browser report.

**Resolved informational accessibility defect, confidence 10/10:** native browser
QA found that forced-colors rendering removed the background-drawn wordmark
hyphen. The coordinator changed only `.brand-hyphen` at `src/styles.css:241` from
`background: currentColor` to `border-top: 3px solid currentColor`. The width,
height, spacing, alignment and accessible name remain intact. Static inspection
found no new identity, source, privacy or reading-state change.

The QA agent replayed forced-colors mode after the fix and reported a restored
visible separator without console or asset errors. This code reviewer inspected
both actual before/after screenshots and confirmed that the displayed wordmark
changes from `Dummy Down` to `Dummy-Down` in that rendering. The paired local
evidence is under the ignored runtime artifact directory
`.gstack/qa-reports/editorial-independent-20261013T2208Z/screenshots/`, named
`forced-colors-monochrome-header.png` and
`forced-colors-monochrome-header-1791929787282.png`. The QA agent owns the live
browser checks and their final report; this reviewer inspected the captured
images rather than conducting that browser replay.

The first learning commit, `36f6965`, is now published on
[PR #6](https://github.com/WaylandP/Dummy-Down/pull/6). The coordinator reported
successful CI and Vercel for that exact commit. This one-line rendering repair
is a follow-up on the same open feature branch; earlier successful deployment
checks do not establish deployment of the repair before it is pushed and checked.

## Technical assessment

- `findLearningActivity` compares framework, edition and stable control key. New
  activities cannot attach to a similarly named control in another publication.
  `KnowledgeCheck` remains keyed by its uniquely tested activity ID; changing the
  perspective keeps an answer, while changing activity resets question state.
- Contextual term mappings require the exact CMMC edition and known requirement
  ID. `Object.hasOwn` rejects inherited object names; deduplication supplies FCI
  context to all fifteen Level 1 records without duplicate term triggers. React
  `useId` keeps main-reader and review-disclosure definition IDs separate.
- Review lookup guards framework and edition. Every current record has pending
  human approval. UI separates pinned source checking, AI prose comparison and
  human approval. The comparison count of 59 statements is distinct from the
  thirteen quotations imported for three drafts and is explicitly not a course
  completion score. Other Level 1 records disclose unmapped teaching coverage.
- Quotations, original teaching prose and figure text use React's ordinary text
  rendering. No HTML injection, new runtime fetch, user-data persistence, source
  replacement or analytics permission change was introduced by this delta.
- Practice emits the existing bounded action categories through `trackUsage`.
  `usageProperties` resolves a known catalog identity and supported activity and
  copies only allowlisted fields. Answers, choice IDs, correctness and scores are
  absent from that serialization. Existing production-only, opt-out, DNT/GPC and
  sanitized-URL gates remain unchanged. These tests do not establish provider
  receipt or account activation.
- Diagrams use semantic lists and a figure caption with a text equivalent; they
  add no image, motion or diagram dependency. Responsive layout and actual reading
  usability need the separate live browser review.

## Gate integrity

The current installed gate scan against `b3fa2b3` listed ten gate hunks, with five
eligible hunks, five inspected and zero unread; no RH relaxation tags were
present. The reviewer read all five eligible hunks. The helper supports
RH-1/3/4/12/13/14/15/16 and reported no unlisted language idioms. Its current
artifact is ignored local evidence under `.gstack/state/projects/WaylandP-Dummy-Down/gate-diff/`.

The changed legacy expectations follow actual feature changes:

- Activity ownership now searches both the original demo and source-reference
  catalogs. The source-kind assertion still requires README attribution for the
  old demo and an official publication for source-bound activities.
- The Level 1 authorized-access UI now must show its real draft scenario. Level 2
  and Level 3 tests retain their assertion that no unsupported activity appears.
- Glossary search `RUNNING PROGRAM` now matches both the original process and new
  authentication definitions. The analytics interaction fixture's `device` search
  matches three actual definitions rather than one. Exact counts were updated;
  deduplication, no-event-before-submission and privacy assertions remain intact.

No test was skipped, disabled or deleted, and no timeout was increased in these
reviewed hunks.

## Executed checks

Final reader-order delta: `npm test -- src/components/EditorialReviewContext.test.tsx src/components/control-perspectives.test.tsx`
passed fourteen affected tests across two files, exit 0, on
`feat/level-one-editorial-learning`. These repeat part of the 103-test scope
rather than adding fourteen distinct tests.

| Evidence                           | Actual result                                                                                                                                                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial scoped Vitest run          | 84 of 85 passed; incorrect FCI selector failed and duplicate React sibling keys appeared in stderr.                                                                                                                       |
| Corrected scoped run               | 85 tests across seven files passed, exit 0; no duplicate-key warning. Files: `LevelOneLearning`, `LearningPractice`, `level-one-review`, `level-one-glossary`, `usage`, `control-perspectives`, `EditorialReviewContext`. |
| Additional existing behavior tests | `npm test -- src/components/learning-tools.test.tsx src/data/glossary.test.ts`: eighteen tests across two files passed, exit 0.                                                                                           |
| Gate scan                          | `gstack-gate-diff b3fa2b3`: ten listed / five eligible / five inspected / zero unread; all eligible hunks read as above.                                                                                                  |

Total independently executed passing coverage is **103 tests across nine files**.
These are repository-native Vitest/jsdom observations, not browser, screen-reader,
text-zoom, contrast, touch or production observations. No live official-host access,
new PDF extraction or provider-dashboard check was performed by this code reviewer.
The content audit owns the actual pinned-PDF comparison and wording review. The
coordinator's final report must name the full-suite, build and browser results
separately.

A fresh in-host adversarial static reader also inspected the tracked and
untracked implementation and its analytics/privacy consumers without edits. It
reported no additional concrete defect, confirmed the current identity guards,
distinct keys, escaped prose and pending-human metadata, and recommended
continuing validation. That reader executed no tests or browser/source checks.
This is another AI review in the same host, not an independent human or outside
provider approval.

## Current source fingerprints

SHA-256 binds this scoped review to these consumed inputs. Later changes need an
affected delta review; this report is not blanket approval for future editions.

| Path                                             | SHA-256                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| `src/components/ReferenceDetail.tsx`             | `343d7ca8890329d271e10466e35bb386baea42f37c30a5ca48ca694f172589c0` |
| `src/components/EditorialReviewContext.tsx`      | `6f7353cd9f748816648b59e93d386ad7b1e425a567a958552c3fe65671f1eb67` |
| `src/components/LearningPractice.tsx`            | `273811536ac737c361aa24b2099fca885ea81fe3afc97d891eb8fd7c464860ea` |
| `src/components/LessonDiagram.tsx`               | `2b2111acb2e00c6de4107bc706e6e82bec2f39381a1632bb8794606bb1c77a93` |
| `src/components/ContextTerms.tsx`                | `0d77e42772bfcd815172c4f75b0bcaa49fa82573a5a9113afb755f7b1d100ed9` |
| `src/data/level-one-review.ts`                   | `3a509c0cb362334a76db87e85f11a94669cc1c198abe9ec17ab3cec61d265281` |
| `src/data/level-one-learning.ts`                 | `2870589538d5f4038f1dd2f26407cb22af2b315a4d5c49b0fc45d655c3071195` |
| `src/data/level-one-glossary.ts`                 | `96a90edafb0900b46cf101188f3841e8d4364404e2244315bc1398a9494b1786` |
| `src/data/level-one-terms.ts`                    | `c9b35eb772056c85268cc0e71a75ebb0dea70ae8a7703ed534d6e01872a06f1d` |
| `src/data/perspectives/level-1-3.json`           | `9e5911574632036641675494e69036f5f6fc7ed0e0e41d0a22a63355b3aef084` |
| `src/types/review.ts`                            | `e757433067fc30e63311fdcdf1db5f1a62adaeefd297e637de5a702398453fc5` |
| `src/types/learning.ts`                          | `b68bfdb769266eed951ca53db1602a53d9d72df55b2318f270c9339e1aa85ad2` |
| `src/styles.css`                                 | `87b4b8cba79fa4e6be46e254dddcb8e319c3bd3c271f2ee953d7e1fd71464240` |
| `src/analytics/usage.ts`                         | `dd19728c75ef2e465fbf118bc3cc825bf77941448f0aef285ed91d9b6e47604d` |
| `src/analytics/privacy.ts`                       | `806c372261b7faf39da9a44e6450b9070981e638b0cc23e897bdbe697f28b78c` |
| `src/components/EditorialReviewContext.test.tsx` | `40ac19d3f3e8fef5daed740724f88af2085ebd1a6e552521a230b79f8e0c8506` |
| `src/components/LevelOneLearning.test.tsx`       | `7a4d5769a9333e8230b1ddcf0036e275434df30ecaea34e62870c0dd3d9d8606` |
| `src/data/level-one-review.test.ts`              | `4d10f71740e750b794364564889e90e956323d3832f6dd8f58889e1147c14310` |
| `src/data/level-one-glossary.test.ts`            | `1e7a962dea3966e51625a291efa7675f7679382d3f4b6ff1e0e178fe1e012b1b` |
