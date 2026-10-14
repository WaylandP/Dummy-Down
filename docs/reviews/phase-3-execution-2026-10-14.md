# Phase 3 execution log

## Authorization and baseline

The owner's October 14 Phase 3 assignment explicitly authorizes feature branches,
incremental pushes, validated PRs, squash merges and the existing automatic Vercel
production deployment for these five increments only. No global auto-merge,
protection bypass, unrelated merge, paid provider or infrastructure change is
authorized. The repository's default manual approval rule remains in force for
unrelated work. Enforced required human reviews still block a merge.

Starting main: `bf2ff0c86ea2c6076f7b9b1721756b0bf60c9c53`. PR #18 was already
merged at 15:37:12 UTC; no open PR or uncommitted work was present. Phase 1/2
engineering increments are merged; qualified content review, current official
applicability, owner/learner acceptance and actual assistive-technology/Safari/iOS
checks remain external. They do not prevent source-bound Phase 3 draft development.

## Audit of the seven Phase 3 milestones

| Existing milestone       | Baseline evidence                                                                                          | Independently actionable work                                                                   | External completion gate                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Original demo            | `learning.ts`: one fictional activity, three explained questions. Merged.                                  | Preserve behavior and improve shared practice flow in Increment 1.                              | No new approval inferred.                                                  |
| Three Level 1 activities | `level-one-learning.ts`: three source-bound activities, nine questions, three text-equivalent diagrams.    | Improve entry, progress and review; extend reusable system in Increment 2.                      | Qualified content review.                                                  |
| Glossary                 | Twenty drafts, fourteen source-cited additions; inline definitions preserve lesson state and return focus. | Reuse terms in new activities; repair demonstrated integration problems.                        | Qualified definitions and real-reader comprehension.                       |
| Navigation/accessibility | Native lesson links, mode tabs, keyboard/Chromium tests; no human acceptance.                              | Check new journeys at 320/390/768/1024/1440, keyboard, forced colors and reduced motion.        | Actual assistive technology, native zoom, Safari/iOS and learner sessions. |
| Expanded exercises       | Three source-bound activities only; none for Level 2/3.                                                    | Increment 2: at least three additional activities per level, varied concepts and source review. | Qualified editorial approval remains separate.                             |
| Animated explanations    | Semantic static diagrams only; no player.                                                                  | Increment 3: three controlled, synchronized, transcript-backed visual explanations.             | Qualified content and learner comprehension review.                        |
| Progress/practice        | In-memory activity state; no saved progress.                                                               | Increment 4: optional minimal local progress, resume, reset and storage-failure handling.       | Human usability feedback; no compliance-certification claim.               |

See the [delegated planning and review record](phase-3-planning-2026-10-14.md)
for the office-hours framing, alternatives, engineering contract and actual skill
reads/omissions.

## Product and implementation decisions

Hold the owner's five-increment scope. A useful outcome is understanding the
concept, seeing why an answer works, and returning to practice; no badges,
leaderboards or compliance scores. Extend existing identities, questions and
components. Preserve the shipped matte-black canvas and existing tokens/assets;
the brief's turquoise emphasis belongs to purposeful teaching marks, not a new
identity or green reading canvas. Body text stays readable IBM Plex Sans.

No new framework, source quotation, official applicability assertion, account,
backend, organizational evidence collection or analytics permission is needed.
At most two non-overlapping review/preparation workers run alongside the coordinator;
no recursive reviewer chains or outside-model providers.

## Increment 1: existing practice experience

Changes: exact-identity “Practice available” labels in results; a direct question
entry that opens the disclosure and focuses the current prompt or completion;
explicit pace/retry guidance; progress starts at zero and counts checked questions;
completion retains the latest checked answers with correct-answer reasoning.
Retry clears that question's checked state; restart clears the activity. Mode
changes preserve local state. This increment adds no persistence or grading.

Existing diagrams and inline glossary already provide semantic text, source/draft
context, keyboard operation and focus recovery. They are preserved rather than
rewritten without a demonstrated defect. Each later increment must revalidate its
integration with them. Browser regressions exercise the complete question cycle
and reasoning review at all five widths, plus the existing privacy, history,
recovery, keyboard, reduced-motion and forced-color suite. Narrow viewports are
reflow evidence, not actual native browser zoom or screen-reader testing.

Validation and exact-commit publication evidence are recorded in each PR and the
next verified-merge checkpoint below. Screenshots live under `docs/screenshots/phase3/`.

[All 58 canonical trigger dispositions](phase-3-skills-2026-10-14.md) distinguish
completed adapted work from future applicable work and blocked native tooling.

## Workflow limits

Pinned gstack `945ac301a91dff5db9fc1ddaea5b77828eeca2ed` / 1.91.97.0 remains
installed and verified (58 canonical skills, 57 supported instructions, 28 sections).
Planning/design/review methodology is adapted to Codex; native discovery, enforced
hooks, CSO's absent trusted launcher and full native evidence ledgers are not
claimed. External providers, cookie imports, tunnels and artifact sync remain off.
Cloud setup reuses the healthy repository environment; no installation/configuration
change is needed. Existing automated checks demonstrate the selected workflow.

### Increment 1 review outcome

Independent review found that the first completion recap could repeat a wrong
choice without explicitly identifying it. The final recap labels each response
“Correct choice” or “Worth another look” and repeats the selected wrong choice's
correction before the takeaway. A bounded delta review confirmed that repair.
Tests exercise completion review, reset and focus; existing privacy/state tests
still prohibit storage or URL writes. An older result selector was updated for
the new practice badge while retaining eight-result and exact three-badge checks.

Local validation: 479 unit tests; 55 browser tests before the final recap-label
clarification, followed by the five-width browser regression on the final view;
typecheck, lint, formatting, content/gstack checks and build. Actual mobile/desktop
screenshots were inspected. No native zoom, real learner or actual assistive-technology
acceptance is claimed. CI must pass on the final pushed commit before merge.

## Verified Increment 1 merge

PR [#19](https://github.com/WaylandP/cipher-and-chalk/pull/19), head
`e14da15dd4cb52e08947db998d928d16ff14c655`, passed CI run `38592412874`
(479 unit tests, 55 browser checks). Preview: https://cipherandchalk-1yvjvvjg1-waylandp.vercel.app .
GitHub reported CLEAN/MERGEABLE with no required review decision; squash merged
under the limited authorization at `82db49c90750ae5361b5e1d86eae61f425ba274d`
on October 14 at 15:50:07 UTC. Automatic production deployment `7070221551`
reported success for that merge. Human acceptance remains pending.

## Increment 2 scope

Nine new source-bound activities (three per level), explicit teaching goals and
related terms extend the existing framework-independent activity structure. A
separate lazy practice index provides native search/level filters and exact lesson
links. Existing scenario-decision, misunderstanding and technical-interpretation
questions use native radio choices with authored feedback; familiar controls
keep attention on reasoning and remain keyboard accessible. No drag-and-drop,
accounts, evidence uploads or compliance scores are introduced.

Only the public `/practice` pathname joins the existing analytics URL allowlist.
Query/fragment removal, production gating, DNT/GPC and opt-out remain enforced;
no new event/property or answer collection is introduced.

### Increment 2 review and local validation

The [source packet](../content-review/phase-3-activities-2026-10-14.md) records
complete guide-section reading, the nine final draft fingerprints, 27 questions,
81 choice explanations and actual source determinations. The pinned-PDF verifier
again passed all 149 quotations and 468 statements. Human approval remains pending.

Independent review found that practice search omitted visible learning goals and
control titles, making MFA and hash-related practice difficult to find. Search now
includes those fields and the plain-English explanation, with regression tests.
Older absence tests now exercise controls that still have no practice; all twelve
source-bound activities receive positive outline checks. No assertions about source
identity, unavailable content, privacy or feedback were removed.

Local checks passed: 497 unit tests, typecheck, lint, formatting, content and gstack
checks, and build. The full browser suite passed 77 checks across six widths,
including the requested 320/390/768/1024/1440 widths; all nine new activities completed
with wrong-answer reasoning, mode preservation, glossary focus and exact lesson
links. A focused browser rerun covers the final search adjustment. Desktop/mobile
practice-index screenshots were inspected for reading width, navigation, controls
and clipping. Native zoom and real assistive-technology/learner acceptance remain
pending. Main JavaScript is 503.21 kB (134.98 kB gzip), triggering Vite's 500 kB
advisory; the final integration increment will review route/data loading. No
threshold or check was disabled. Preview/CI/merge evidence follows after publication.

### Increment 2 publication limits

The first pushed head `acc37f5` received successful Vercel preview deployment
`7070589859` at https://cipherandchalk-cxh15zmd7-waylandp.vercel.app . A direct
workspace request to that address was blocked by the network proxy with CONNECT
403 before an origin response. This is provider deployment evidence, not a claim
of independently inspecting the hosted rendering. Real browser rendering and
interactions were checked against the local production build; GitHub CI repeats
the full suite. The branch-protection configuration endpoint also returns 403 for
this integration. Merge authorization will therefore rely on GitHub's PR merge
state, check/review decision and ordinary non-admin merge enforcement; no rule is
bypassed or changed.

## Verified Increment 2 merge

PR [#20](https://github.com/WaylandP/cipher-and-chalk/pull/20), final head
`369ca3c235f517a50b16885c7ebc56297badfef9`, passed CI `38595378605`
(497 unit tests, 77 browser checks). Preview deployment `7070636328` succeeded:
https://cipherandchalk-li6oz9hxj-waylandp.vercel.app . Independent review confirmed
the search correction and found no further blocking issue in its bounded scope.
GitHub reported CLEAN/MERGEABLE, no required review decision and all checks green.
The ordinary authorized squash merge produced `1e934d000fef7d623ec506efc0adbf5dc686a38e`
at 16:11:02 UTC. Production deployment `7070718955` succeeded for that exact merge:
https://cipherandchalk-816y0708w-waylandp.vercel.app . Hosted rendering remains
unverified from this proxy-restricted workspace; source-build browser evidence is
separate from provider deployment evidence.

## Increment 3: teaching through motion

Three source-bound visual explanations cover AC.L1-b.1.i, IA.L2-3.5.3 and
IR.L3-3.6.2e. Requirement text is derived from the pinned catalog. The next three
stages are separately authored drafts. Play/pause/restart, a 40-second timeline,
synchronized text, all-stage transcript, native manual stage buttons and reduced-
motion still diagrams support different reading approaches. Opening a disclosure
loads the player/CSS; closing it stops playback. Hidden documents pause without
automatic resume. No media dependency, provider, telemetry or storage was added.

Independent source review identified three useful visual clarifications: use
“Process” instead of a generic “Task”; show privileged accounts more broadly than
administrators; and avoid implying an official clock-start event in the deployment
window. All three were corrected before browser validation. Diagram-in-words
explanations are available in native disclosures and in the full transcript, keeping
the mobile player readable without removing its text equivalent.

### Increment 3 local validation and review

The [animation source review](../content-review/phase-3-animations-2026-10-14.md)
records full guide-section comparison, the three clarifications and final source/
SVG-label fingerprints. No further correction was identified in the bounded delta.
Root additionally reviewed player state, cancellation, failure handling, full
identity matching and lazy loading. The source check is AI-assisted; qualified
human approval remains pending.

All seven project checks passed with 509 unit tests. Twenty focused browser checks
passed, including actual 40-second playback of every animation, pause/replay/close,
five-width stages/transcripts, reduced motion with forced colors, and chunk-error
recovery. The existing suite passed 76 checks and found one stale numbered-outline
selector; the new visual section makes Practice item 04 for that lesson. That
selector now follows the actual fourth link, retaining its target-focus and quiz
assertions. Its four-test browser journey rerun passed before publication. Mobile/desktop screenshots
of all three visual explanations were inspected. Full CI repeats the combined
suite. Native zoom, actual assistive technology and learner acceptance remain open.

Player JavaScript is 17.20 kB (5.73 kB gzip) plus 5.02 kB CSS (1.42 kB gzip), loaded
only on request. No external media is fetched. Main JavaScript is 504.94 kB
(135.39 kB gzip); the existing advisory remains a final integration review item.

### Increment 3 publication

[PR #21](https://github.com/WaylandP/cipher-and-chalk/pull/21) head
`275229fb40ec3bbbd67c667a4a5d5b1d603a47ef` passed CI run `38597268769`
(509 unit / 97 browser checks) and Vercel preview deployment `7070936882`:
https://cipherandchalk-en35dmy2b-waylandp.vercel.app . Ordinary squash merge,
without bypass, produced `40d075489731c0dee916db27d68b5fba073009c2` at 16:25:17 UTC.
Production deployment `7071046114` reported success for that exact merge:
https://cipherandchalk-7mpge72x9-waylandp.vercel.app . Hosted rendering remains
unverified from this restricted environment; provider deployment evidence and
local production-browser results are distinct.

## Increment 4: optional local progress

The existing question player now reads a single app-level local store. Saving is
off by default. Explicit opt-in enables resume, visited/completed distinctions,
revisit marks and latest-answer reasoning review. The practice room offers native
filters and exact-identity links; a project example is excluded from CMMC level
filters. The local-data contract, failure boundaries and versioning obligations
are documented in [LOCAL_PROGRESS.md](../LOCAL_PROGRESS.md).

Independent review found two cross-tab loss paths in the initial store: refreshing
a previously unsaved tab discarded its distinct work, and a second enable could
overwrite the first tab's saved activities. The store now merges distinct local
work with live consent-authorized storage while existing same-activity saved state
and explicit deletion take precedence. Regression tests cover those cases and
revocation races. Enabling also moves focus to the stable settings status instead
of leaving it on a removed button. Review of earlier answers is available before
completion; the latest checked choice is retained without storing answer text.

No analytics schema/permission change, backend, account, visitor identifier, free-text
storage or official content edit is included. GPC/DNT and browser restrictions
retain usable unsaved practice. No human approval or native gstack full pass is
claimed. Publication and final validation evidence are recorded below.

### Increment 4 local validation

All seven project checks passed, including 562 unit tests and the full 110-test
Chromium suite. Thirteen new browser cases cover all five requested widths, actual
reload/resume, completion and answer review, content-version reset, two unsaved tabs
joining saving, cross-tab deletion, GPC/DNT/storage restrictions and keyboard focus
when the last filtered mark is removed. No horizontal overflow or normal-palette
axe violation was found in the checked states. Forced-color semantic checks omit
axe's known authored-color calculation; the actual system-color screenshot was
inspected separately. Native zoom/AT/Safari and human acceptance remain pending.

Actual desktop/mobile progress and answer-review screenshots were inspected. The
existing index captures were refreshed after adding filters. A final independent
integration read found no remaining blocking defect after the two store fixes,
enable focus, filtered-row focus and unsaved-filter clarity repairs. The full
browser regression also retains all three real 40-second playback checks.

### Increment 4 publication

[PR #22](https://github.com/WaylandP/cipher-and-chalk/pull/22) head
`a56a985149b8bc033de0eb126dbf39c8e3a357a7` passed GitHub CI run `38605512492`.
The successful local suite contained 562 unit / 110 browser tests; GitHub reports
all workflow steps successful. Downloading the remote log archive was denied by
the environment, so its test-count lines were not independently retrieved.
Preview `7072237629` succeeded at
https://cipherandchalk-7sf496lu7-waylandp.vercel.app . Ordinary squash merge at
17:22:54 UTC produced `dd8595d30c56918edc2e398d47288bb3a5ac35db`.
Production `7072348882` succeeded for that merge at 17:23:14 UTC:
https://cipherandchalk-214myfrkz-waylandp.vercel.app . No bypass was used.

## Increment 5: integrated experience and final review

The Explorer interface/controller now loads on its own route. Existing source,
mode, URL, title, telemetry and history behavior is preserved; import failure gives
an exact-address reload and Home link. App integration tests await real rendered
readiness rather than assuming synchronous mount; their behavioral assertions are
retained. The level selector follows source order (1, 2, 3), keeping the demo out
of level-specific results. A ten-step 390/1440 browser journey connects all major
features, plus a failed-route-chunk regression. The linked
[walkthrough and review packet](../testing/PHASE_3_WALKTHROUGH.md) prepares real
learner, editorial and assistive-technology review without claiming it occurred.

### Measured loading change

A matching build comparison used merged Increment 4 (`dd8595d`) as the eager-route
baseline and the final lazy-route implementation with the same progress/catalog
payload. Vite manifests and fresh Chromium script-response bodies agreed:
Home initial JavaScript fell from 518,133 to 462,410 bytes (55,723 bytes / 10.8%).
That includes the 104,134-byte shared runtime; it is not a main-filename comparison.
Gzip calculated by the same Node method across the full closure fell from 138,421
to 124,738 bytes. Learn discovery fetched 519,646 bytes, about 1.5 KB more than the
baseline: an explicit small request/payload tradeoff. No warning threshold was
raised. The 500 KB chunk advisory is gone without a new dependency.

The [measurement artifact](phase-3-performance-2026-10-14.json) records actual
files and response sizes. These are decoded resource/build bytes, not hosted
transfer, Core Web Vitals, a latency guarantee or a user-perceived speed score.
Builds used `vite build --manifest`, then a fresh isolated Chromium context for
Home and discovery on local production previews. No player chunk loads on Home;
the real browser failure test verifies both deferral and same-address recovery.

### Bounded final code/security review

An independent read compared the extracted LearningPage with its prior App body,
checked loading cancellation/recovery and every changed App-test assertion, and
reviewed the new journey. No blocking issue was found. A scoped Phase 3 security
read found no dynamic HTML, executable input, new network submission, answer
analytics or infrastructure change. Local-data schema/identity validation, consent
revocation and clear precedence were reviewed and regression-tested in Increment 4.
Source quotation and activity/visual fingerprint gates remain intact. This is
AI-assisted code/content review, not professional content approval or a native
CSO audit. localStorage retains its documented nontransactional last-writer limit.

The pinned gstack installation was rechecked: 57 supported instructions, 28 sections;
its actual browser readiness probe rendered with Chromium 154.0.8037.57. The
coordinator used the compiled browser on an owned loopback tab for practice and
L1/L2 visual smoke checks. L1 playback progress advanced; the final L2 manual
stage and [mobile screenshot](../screenshots/phase3/gstack-mfa-390.png) were inspected,
with no console errors. Broader testing remains the explicitly named project
Playwright suite. [All 58 skill dispositions](phase-3-skills-2026-10-14.md) now
record actual adapted execution and omissions; no full native skill pass is claimed.

### Increment 5 local validation and UX assessment

All seven required project checks passed with 565 unit tests. The complete
Chromium suite passed 113 tests, including three actual 40-second playbacks,
five-width reflow/semantics, keyboard/reduced-motion/forced-color cases, shared
addresses/history, all nine added activities, real two-tab progress races and the
two full 390/1440 ten-step journeys. Route failure retains the exact lesson/mode/hash
and a working reload. No failing gate or blocking code-review finding remains.

The dedicated UX read found direct Home search and practice entry obvious in the
observed flows; source/modes/visual/practice remain separated; feedback explains
misconceptions; mobile controls and reading columns fit; the animation's meaning
is available in manual diagrams/transcripts. Screenshots of Home, teaching and
completion at 390/1440 were inspected independently and by the coordinator in
selected views. No visible overlap/crowding or horizontal clipping was found in
those captured states. These are bounded engineering observations, not evidence
that real beginners find it comfortable. Mobile lesson/completion captures are
viewport crops, not entire-page screenshots. Owner/learner/native-zoom/AT/Safari
acceptance and qualified content review remain explicitly open.
