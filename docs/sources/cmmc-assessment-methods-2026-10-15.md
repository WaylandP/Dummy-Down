# Potential assessment methods and objects — source record (2026-10-15)

`src/data/cmmc-assessment-methods.json` holds, for each of the 149 controls of
the pinned CMMC v2.13 snapshot, the three lists the assessment guide prints
under "Potential Assessment Methods and Objects" for that control: what an
assessor may **examine**, whom they may **interview** and what they may
**test**. The Evidence view shows them as three columns above the compliance
chalk's questions and evidence examples.

## Source

The three assessment guides already pinned for this snapshot
([record](cmmc-2-13-sep-2024.md), [manifest](cmmc-2-13-manifest.json)):

| Guide                         | Document      | SHA-256                                                            |
| ----------------------------- | ------------- | ------------------------------------------------------------------ |
| CMMC Assessment Guide Level 1 | DoD-CIO-00002 | `88116fa807b3685703f08c1992580ad0cfbc22ad2bcf76f99378fadf964f7368` |
| CMMC Assessment Guide Level 2 | DoD-CIO-00003 | `0dcaba1626a0d23893981d74dd3f0f2338fff54cece67d81bc811ce76392d867` |
| CMMC Assessment Guide Level 3 | DoD-CIO-00004 | `6601eb20e8f1490b49c4addd83505eb269062abb3c2bae9b5256449187048ef3` |

The bytes were re-downloaded from the same pinned mirror the manifest names and
re-hashed before extraction; the digests match.

## Extraction

For each control, the page that holds its requirement heading (the page the
catalog already cites) was read from `pdftotext -layout` output, split at
form feeds. The block runs from "POTENTIAL ASSESSMENT METHODS AND OBJECTS" to
the next section heading (DISCUSSION, FURTHER DISCUSSION or KEY REFERENCES);
in these guides it starts on the cited page for all 149 controls, and the
citation names that page; eleven blocks run onto the following page (AC.L1-b.1.i, SI.L1-b.1.xii, CM.L2-3.4.1, CM.L2-3.4.7, SC.L2-3.13.2, SI.L2-3.14.1, IA.L3-3.5.3e, RA.L3-3.11.1e, SC.L3-3.13.4e, SI.L3-3.14.3e, SI.L3-3.14.6e). Each of the
three "[SELECT FROM: …]" lists was split on semicolons; physical line wraps
were joined, hyphenated breaks kept their hyphen, and running headers,
footnote references and footnote text were dropped. Items are otherwise the
guide's words, in the guide's order and case. Counts: 149 controls, 2,313
items.

`src/data/cmmc-assessment-methods.test.ts` locks the digests, the one-entry-
per-control shape, the page relationship to the requirement citation and the
absence of page furniture in any item.

## Limits

- The lists are the guide's "potential" methods and objects, reproduced from
  NIST SP 800-171A and 800-172A as the guide notes; they are not a checklist,
  an evidence requirement or a prediction of what an assessor will ask.
- The Level 2 guide prints under AC.L2-3.1.7 (Privileged Functions) an
  Examine list that reads as the system use notification list of AC.L2-3.1.9
  (its Interview and Test lists are 3.1.7's own); NIST SP 800-171A's list for
  3.1.7 differs. The data keeps the guide's words as pinned, and a test locks
  them so the difference is not "corrected" silently.
- Four lists repeat an item (SC.L2-3.13.13 and SI.L2-3.14.6 Examine,
  CM.L3-3.4.3e Examine, RA.L3-3.11.4e Interview); they are kept as printed.
- The three headings "Examine the document", "Interview the role", "Test the
  action" are the design note's gloss on the guide's three words, not the
  guide's.
- Transcription was checked by the tests above and the authoring agent's
  review, not by a qualified assessor.
