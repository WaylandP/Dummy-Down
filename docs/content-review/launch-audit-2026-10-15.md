# Launch audit — October 15, 2026

Before the public announcement, every explanation, practice activity, visual
explanation, glossary entry and the site copy was compared with the pinned
sources it rests on: the CMMC v2.13 assessment guides, 32 CFR part 170, the
DFARS clauses, NIST SP 800-171 Revision 3 and the CMMC FAQ. The comparison is
AI-assisted. It is not a qualified human review, and no human approval is
recorded for any of it.

[`launch-audit-2026-10-15.json`](launch-audit-2026-10-15.json) holds every
finding: where it is, what the site said, what the source says, the suggested
fix and its status. Content changes made from it are also findings in the
editorial audits for their level, with the guide passage each rests on.

## What was found, and what is fixed

| Area                             | Errors (fixed) | Risks (fixed) | Polish (fixed) |
| -------------------------------- | -------------: | ------------: | -------------: |
| Explanations and Rev 3 notes     |              0 |       22 (22) |        68 (60) |
| Glossary and site copy           |          4 (4) |       17 (10) |        26 (17) |
| Practice and visual explanations |              0 |         8 (6) |        23 (19) |
| **Total**                        |      **4 (4)** |   **47 (38)** |   **117 (96)** |

An error contradicts the cited source; a risk could lead a reader to under- or
over-scope a requirement; polish is accurate but unclear, incomplete or
inconsistent. "Fixed" counts findings whose status is `applied` or `revised`.

- The nine risks still open are site copy (About, Home, the Coverage and
  review-status wording, the Timeline's meta description) and the first
  teaching example's activity; each is assigned in the record.
- Eight clause-map notes are kept on purpose: they ask for readings that the
  [clause-map record](../sources/cmmc-clause-map-2026-10-15.md) declines by
  rule. Their reason is in the record's `note`.
- The rest of the open polish is site copy and the practice activities'
  fictional company names.

## Where the changes are

Pull requests #76 (Timeline), #77 and #91 (glossary), #78 and #86
(explanations), #80 (Rev 3 notes), #81 (share card and README), #83 and #88
(practice), #84 (one company name) and #87 (clause map). The interface fixes
from the same report are listed in the [changelog](../../CHANGELOG.md).

## Limits

- The sources were read from pinned copies; official hosts were not reachable
  from the review environment, and the official text controls.
- A qualified CMMC practitioner has not reviewed these findings or the
  changes made from them.
