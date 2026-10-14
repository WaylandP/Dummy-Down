# Level 1 editorial audit — Increment 2, 2026-10-14

Compared all **15 controls / 45 perspective drafts** with their requirements,
**all 59 determination statements**, and relevant Discussion/Further Discussion
in the pinned CMMC Assessment Guide — Level 1, v2.13, September 2024,
DoD-CIO-00002. This is **AI-assisted review**, not qualified approval or a claim
of complete curriculum coverage. Human approval remains pending for every row.

## Inspected baseline and method

- Starting `main`: `ebaed5f04769cfe9a618cc705ca6e218bf6e8e60`, the approved PR #14
  squash merge, verified on October 14. Source-research progress is in PR #15.
- Framework / edition: `cmmc` / `cmmc-2-13-sep-2024`. Only the 15 Level 1 records
  in `src/data/perspectives/level-1-3.json` were edited. All 24 Level 3 records in
  that shared file remain unchanged, as do both Level 2 files and all official quotes.
- Source ID `cmmc-assessment-l1-213`, SHA-256
  `88116fa807b3685703f08c1992580ad0cfbc22ad2bcf76f99378fadf964f7368`.
  [Manifest](../sources/cmmc-2-13-manifest.json) supplies the original URL, pinned
  mirror, byte size, publication identity and distribution notice.
- Pinned PDF/hash/transcription validation passed again on October 14 for all
  four guides/model files and 149 references. Eighteen current official-source
  requests failed before an origin response. See the separate
  [applicability register and request log](../sources/applicability-2026-10-14.md).
- Read each Beginner meaning/example, technical focus/example/caution and
  compliance focus/questions/possible evidence against the exact requirement,
  all determinations, discussion and relevant potential assessment methods.
  Reviewed source text using Poppler extraction; no requirement was generated.
- Parent comparison and independent read-only agent `/root/accuracy_audit` both
  inspected all 15/45 and 59 determinations. The independent baseline review found
  no new factual blocker; it identified the access-enforcement clarification below.
  Its role is an AI reviewer, not a person or CMMC credential holder.
- [Per-control fingerprints](level-1-review-baseline.json) bind the final texts to
  this review. The previous audit's final baseline was `31c952cff7f0627ad06e04cc6501ddc318a6c8b895c6778ffdff6bf27f8215cd`;
  preserve that [historical audit](level-1-audit-2026-10-13.md) rather than rewriting it.

## Control-by-control disposition

Pages are **PDF / printed** in the identified guide. Labels are actual guide
determinations. “Retain” means no supported correction identified in this scoped
pass, not certified accuracy. Every row has unresolved **U1–U3** below.

| Control          | Requirement / objective pages; labels | Finding, source support and final disposition                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AC.L1-b.1.i`    | 16 / 12; a–f (6)                      | **Clarified.** Beginner previously led with keeping a list, leaving enforcement to other modes. Now explicitly identifies approved users, processes and devices **and limits access** to them (d–f; Further Discussion 17 / 13). Explained the illustrative device allowlist and purpose of service accounts. Identification alone is not enforcement; no mandated register format. |
| `AC.L1-b.1.ii`   | 19 / 15; a–b (2)                      | **Clarity edit.** Retained defined functions, actual enforcement and read/edit/delete example (19–20 / 15–16). Expanded API where the technical example uses it. Role-based permission design remains an example, not a prescribed product or proof from a hidden button.                                                                                                           |
| `AC.L1-b.1.iii`  | 21 / 17; a–f (6)                      | **Clarified.** Beginner now explicitly includes verification and limits for both connections and uses, and a company-owned network outside this system's scope (22 / 18). Technical mode retains authorization/configuration questions; Compliance follows identifying, verifying and controlling both directions.                                                                  |
| `AC.L1-b.1.iv`   | 24 / 20; a–e (5)                      | **Retain.** Posting **and processing**, authorized people, preventive review, existing-content review and removal/response present. Internal approval does not authorize public release of FCI (25 / 21). Website roles and takedown workflow are possible mechanisms. No broader public-release authority inferred.                                                                |
| `IA.L1-b.1.v`    | 26 / 22; a–c (3)                      | **Clarified.** Beginner printer example now links the identifier used during connection to an equipment record. A bare inventory label could be mistaken for identifying actual access; c and Discussion/Further Discussion (26–27 / 22–23) concern devices accessing the system. Meaning and technical caution still distinguish identification, authentication and permission.    |
| `IA.L1-b.1.vi`   | 28 / 24; a–c (3)                      | **Added source-supported caution.** Replace factory-default passwords during initial setup, before equipment enters service, consistent with Discussion/Further Discussion (28–29 / 24–25). Retained all three authenticated entity types, device/person distinction and optional certificates. Expanded MFA while retaining that this control does not itself prescribe it.        |
| `MP.L1-b.1.vii`  | 31 / 27; a–b (2)                      | **Clarity edit.** Explained sanitization as removing information so it cannot be retrieved or reconstructed (31 / 27). Retained sanitize-or-destroy before disposal and sanitize before reuse, digital/non-digital media, and ordinary delete/format warning. No prescribed product or claim that one record guarantees success.                                                    |
| `PE.L1-b.1.viii` | 33 / 29; a–d (4)                      | **Retain.** Authorized people, systems, equipment and environments addressed. Nonpublic facility-area condition and printer placement match Discussion (34 / 30). Locks and badges remain examples; the text does not exempt exposed equipment merely because another area is public.                                                                                               |
| `PE.L1-b.1.ix`   | 35 / 31; a–f (6)                      | **Clarified.** Compliance now states the guide's distinction for people with permanent physical-access credentials (35 / 31) and organization-defined record retention (36 / 32). Its one-year example is not universal. Escorting, monitoring, logging, and identifying/controlling/managing devices remain separate activities.                                                   |
| `SC.L1-b.1.x`    | 38 / 34; a–h (8)                      | **Retain.** External and key internal boundaries identified, monitored, controlled and protected. Beginner uses traffic/office-network example; IT considers mechanisms and missed internal paths; Compliance traces both boundary types. Guide discussion (39–40 / 35–36) supports choices, not a mandatory appliance. A firewall purchase alone is insufficient.                  |
| `SC.L1-b.1.xi`   | 41 / 37; a–b (2)                      | **Clarity edit.** Expanded demilitarized zone (DMZ) as a separated network area for public-facing services (41–42 / 37–38). Retained physical/logical subnetwork separation, optional separated cloud design and caution that an unrestricted route is not separation.                                                                                                              |
| `SI.L1-b.1.xii`  | 43 / 39; a–f (6)                      | **Clarified.** Beginner now expressly gives each of identification, reporting and correction a defined time frame and explains firmware. The six determinations and Further Discussion (44 / 40) support each stage; a scheduled fix alone is not all stages. No universal patch deadline added.                                                                                    |
| `SI.L1-b.1.xiii` | 46 / 42; a–b (2)                      | **Retain.** Designated locations and provided protection remain separate. Beginner explains malicious software; IT covers appropriate platforms/paths and operational coverage; Compliance relates planned to actual coverage. Guide discussion (46–48 / 42–44) does not make a commercial license proof of deployed protection.                                                    |
| `SI.L1-b.1.xiv`  | 49 / 45; a (1)                        | **Retain.** Updates when releases are available, failures and successful delivery covered. An automatic-update setting alone is insufficient. Daily checking in the guide example (50 / 46) has not become a universal schedule in the draft.                                                                                                                                       |
| `SI.L1-b.1.xv`   | 51 / 47; a–c (3)                      | **Clarified.** Beginner now expressly includes USB drives among external-file sources, supported by Discussion/example/considerations (52 / 48). Retained defined periodic scans **and** real-time malicious-code checks, download/open/run conditions and distinction from vulnerability scanning.                                                                                 |

Ten controls received focused edits; five were retained. The four prior substantive
clarifications remain in place. No new objective, numerical deadline, mandatory
product, source quotation or assessment-evidence sufficiency claim was introduced.

## Audience quality and remaining questions

Beginner provides everyday meaning and a fictional workplace example. IT & Cyber
adds mechanisms and failure modes. Compliance follows determination questions and
possible evidence. These are different instructional jobs; equal prose in three
voices would not satisfy the goal. Selected jargon is now explained at the point
of use without turning every control into a long tutorial. Some technical terms
(such as proxy, segmentation and endpoint) remain in the IT mode; reader testing
must determine whether its intended audience needs additional explanation.

The shared UI continues to label **Draft teaching content**, **Imagine this at work**,
**One possible approach**, and **Possible evidence to discuss**, with an explicit
warning that examples are not official objectives or sufficient assessment evidence.
The review checked those labels against the authored text. An SSP mentioned among
the guide's potential objects is not promoted to a mandatory Level 1 artifact.

| Issue                                     | Applies to                       | Status and next action                                                                                                                                                                                                                                          |
| ----------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1 — current applicability                | All 15 controls                  | Blocked by official-host access. A reviewer with access must reconcile current DoD, FAR/DFARS/CFR and NIST publications and effective dates with the snapshot. See the dated register.                                                                          |
| U2 — qualified approval                   | All 15 controls /45 perspectives | Pending. Recruit real qualified reviewers and use the [review packet](QUALIFIED_REVIEW.md), with per-control decisions and exact final hashes. No agent is a substitute.                                                                                        |
| U3 — complete objective teaching coverage | All 15 controls                  | Not established by this comparison. Thirteen existing quotations support three activities; 46 remaining determination statements are not mapped. Increment 3 must record actual explanation locations, partial/missing treatment and practice links separately. |
| U4 — audience comprehension               | All three modes                  | Real learner validation pending. Use the [acceptance checklist](../testing/PHASE_1_ACCEPTANCE.md); test understanding rather than asking whether a page merely looks clear. Additional jargon is a feedback question, not an invented review result.            |

Existing activities, diagrams, quizzes and glossary definitions retain their
October 13 scoped review and draft labels. This increment's new fingerprints
cover perspectives only; they do not renew or expand approval of those materials.

## Validation boundary

The normal test suite now fails when any reviewed Level 1 perspective changes
without updating its explicitly reviewed fingerprint, or the baseline loses a
control or mismatches edition/source. This guards against stale review claims; it
cannot judge semantics or authenticate a human. Qualified approval still requires
the actual acknowledged decision and maintained scope in the review workflow.

Command results, independent final review, skill accounting and exact PR/preview
handoff are recorded in the [Increment 2 delivery report](https://github.com/WaylandP/cipher-and-chalk/blob/archive/ai-review-records/docs/reviews/phase-2-level-one-2026-10-14.md).
The original Phase 2 completion milestones remain unchecked.
