# Assessment statements in the CMMC 2.13 snapshot

Source comparison date: October 14, 2026. Framework `cmmc`, edition
`cmmc-2-13-sep-2024`. The original [manifest](cmmc-2-13-manifest.json) identifies
the September 2024 DoD Level 1–3 assessment guides, exact hashes, document numbers,
official URLs and pinned mirror acquisition. It remains unchanged.

`src/data/cmmc-objectives.json` preserves **468 attributed source statements**:

| Guide   | Controls | Lettered determinations | Organization-defined parameter statements |
| ------- | -------: | ----------------------: | ----------------------------------------: |
| Level 1 |       15 |                      59 |                                         0 |
| Level 2 |      110 |                     320 |                                         0 |
| Level 3 |       24 |                      80 |                                         9 |

These are **459 lettered determinations plus nine ODP statements**, not 468
independent requirements, lessons, approved explanations or assessment scores.
ODP rows identify choices/definitions the organization must make in this guide;
they remain visible and separately labeled. Preserve `RA.L3-3.11.2e[ODP4]` exactly:
it is not a missing project sequence to renumber. DoD-specified parameter values
inside ordinary statements also remain in the quotations.

## Extraction and verification

```sh
python3 scripts/verify-cmmc-objectives.py --source-dir /path/to/pinned/pdfs
```

The command first reuses the complete requirement/source validator. It verifies
the pinned PDFs and existing control/page identities, finds each exact uppercase
control body heading, then reads only the block between ASSESSMENT OBJECTIVES and
POTENTIAL ASSESSMENT METHODS. All 149 blocks in these guides fit on their starting
page. Every actual label, complete statement, control, source and PDF/printed page
is compared with the checked-in inventory. An unexpected layout fails rather
than consuming a header or footnote. Physical line wraps are normalized; existing
line-end hyphens are retained and joined. Case, punctuation, bracketed FCI and DoD
parameters are preserved. Printed pages are checked by the underlying source
validator, not assumed equal to PDF page numbers.

`--write` explicitly regenerates the artifact after a substantive source review;
default operation is read-only. `--catalog-file` permits comparing an isolated
candidate objective file. The normal Vitest suite locks the verified statement
digest, exact counts, unique identifiers, control/source/page relationships and
the thirteen preexisting Level 1 quotations. PDF verification requires Python
and Poppler plus the matching PDFs; CI does not fetch live government sources.

Independent read-only agent `/root/accuracy_audit` derived the inventory from
fresh PDF text extraction and confirmed the counts and ODP labels. This is an
AI source-transcription check, not qualified interpretation review. Source quote
integrity and teaching mappings are tested separately.

## Interpretation and currentness limits

“Determine if” is the shared introduction to each block. Statements are presented
under that context and their original labels. The Level 1 guide adapts referenced
NIST statements to FCI; those are DoD-guide quotations, not claims of verbatim
NIST text. No wording anomaly is silently corrected.

In particular, `SI.L3-3.14.3e[b]` says systems/components **not included** in the
listed specialized assets are segregated. The parent requirement/discussion
describes specialized-asset treatment differently. Preserve both source texts;
do not invent an interpretation that resolves the difference. Qualified review
of the guide and scoping material is needed before marking that teaching mapping
explained.

The [current applicability record](applicability-2026-10-14.md) still applies:
18 official-source requests were blocked by proxy CONNECT 403 before an origin
response. This inventory is the identified historical edition, not verification
of today's official bytes, contract applicability or professional approval.
