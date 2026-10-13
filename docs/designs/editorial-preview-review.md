# Editorial redesign and Level 1 learning: review guide

The proposed identity replaces the rejected dark/topographic design with neutral
off-white, charcoal reading text and restrained teal interactions. The wordmark
changes from serif **Dummy** to sans **Down** at a deliberate hyphen: a small
typographic expression of translation, without a cybersecurity symbol. The working
tagline is **Compliance, translated.** These remain proposals for owner feedback.

The first redesigned preview shipped in `b3fa2b3` through
[PR #5](https://github.com/WaylandP/Dummy-Down/pull/5). GitHub records the owner
merging that PR while the later learning work was underway. Its content matches
updated main `8008256`; the uncommitted learning milestone was preserved on fresh
branch `feat/level-one-editorial-learning`. The coordinator did not merge it or
require a merge between increments. The next PR continues from that actual main.

## Actual before and after

These are browser captures of the running application, inspected by the
coordinator. Desktop is 1440 × 1000; mobile is 390 × 844. Both control views use
**AC.L1-b.1.i**, Beginner perspective, in the same September 2024 CMMC snapshot.
The control captures start at its reading panel; homepage captures start at the
page top. Before images preserve the original design. After images were refreshed
after the Level 1 integration and the mobile perspective/definition reorder.

| View                  | Before                                                       | After                                                      |
| --------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| Homepage, desktop     | [Before](../screenshots/redesign-before-home-desktop.png)    | [After](../screenshots/redesign-after-home-desktop.png)    |
| Homepage, mobile      | [Before](../screenshots/redesign-before-home-mobile.png)     | [After](../screenshots/redesign-after-home-mobile.png)     |
| Same control, desktop | [Before](../screenshots/redesign-before-control-desktop.png) | [After](../screenshots/redesign-after-control-desktop.png) |
| Same control, mobile  | [Before](../screenshots/redesign-before-control-mobile.png)  | [After](../screenshots/redesign-after-control-mobile.png)  |

[Compare the three wordmark proposals](editorial-identity-review.md). The selected
identity uses local IBM Plex Sans and platform serif fonts; existing font notices
and MIT LICENSE remain intact. The different platform serif metrics are a known
tradeoff. The new favicon is an original simple D drawn as SVG.

## What changed in use

Search follows the concise product explanation. A real Level 1 control is open
immediately. Desktop keeps scanning and reading columns; phones offer a browse
toggle and return to reading after choosing a control. The official quotation
precedes the clearly labeled draft perspectives. Definitions follow the teaching
panel so phone readers reach the mode controls earlier. Source comparison and
review details use native disclosures instead of another dashboard or card grid.

The next learning milestone adds three draft activities:

- **AC.L1-b.1.i:** identify authorized people, user-acting programs and devices,
  and enforce those access decisions.
- **AC.L1-b.1.iv:** prevent FCI from being publicly posted or processed, review
  content before and after publication, and remove/address improper posting.
- **MP.L1-b.1.vii:** distinguish sanitization before reuse from sanitization or
  destruction before disposal, including both digital and non-digital media.

Each has a fictional scenario, common misunderstanding, three questions with
feedback for every choice, a semantic HTML diagram and a text equivalent.
[The media diagram on a phone](../screenshots/level-one-media-diagram-mobile.png)
shows the two different destinations. Four total activities and 12 questions
include the original demo. Fourteen sourced glossary additions bring the total to
20; contextual definitions preserve Escape focus and reset on a different lesson.

## Source review and remaining work

The [Level 1 audit](../content-review/level-1-audit-2026-10-13.md) compared all 15
controls' three perspectives with 59 determination statements. Four explanation
clarifications were applied. Independent review also corrected wording about
government officials being authorized to release FCI. Thirteen exact statements
are quoted as source context for the three draft activities; that does not
establish complete objective-by-objective teaching coverage.

The app separates pinned-source verification, AI-assisted editorial comparison
and pending qualified human approval. Actual human approval, current official
publication applicability, broader reviewed curriculum and learner feedback
remain outstanding. The audit records all 11 official URL attempts that failed
with proxy CONNECT 403 before an origin response. No official-source success,
professional approval or compliance guarantee is inferred from the tests.

The [README roadmap](../../README.md#roadmap) retains all four phases. The frontend
and draft source/perspective inventory are available; Phase 2 is not complete.
Additional frameworks, broader practice and short animated explanations remain
planned. Analytics permissions are unchanged; account activation and dashboard
receipt remain unconfirmed.

Independent [visual critique](editorial-visual-review.md),
[initial code review](editorial-code-review.md), and
[learning milestone code review](editorial-content-code-review.md) record their
actual scopes. Browser QA and final commit/deployment status are separate evidence;
screenshots alone do not certify accessibility or regulatory accuracy.
