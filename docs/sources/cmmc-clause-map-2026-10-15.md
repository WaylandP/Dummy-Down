# Clause map for the Decode view — source record (2026-10-15)

`src/data/cmmc-clause-map.json` maps clauses of each requirement sentence to the
assessment objectives they produce, for the 149 controls of the pinned CMMC
v2.13 snapshot (`cmmc-2-13-sep-2024`). The Decode view underlines each mapped
clause in yellow chalk and writes its objective letters beside it
(`docs/design/mockups/Decode.html`).

## What the map is derived from

| Text                                 | File                                                     | Pinned by                                                                                                                     |
| ------------------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| The requirement sentence per control | `src/data/cmmc-213-catalog.json` (`officialRequirement`) | the Level 1–3 assessment guides, v2.13, September 2024 ([manifest](cmmc-2-13-manifest.json), [record](cmmc-2-13-sep-2024.md)) |
| The assessment objectives            | `src/data/cmmc-objectives.json` (468 statements)         | the same guides ([record](cmmc-objectives-2-13.md))                                                                           |

Nothing in the map is quoted from anywhere else. Every span is a verbatim
substring of its control's requirement sentence, found in sentence order, and
every letter is an objective label the pinned guide gives that control.
`src/data/cmmc-clause-map.test.ts` locks both, and that no letter is used twice
for one control.

## How the clauses were mapped

The map is an editorial reading made by the project on October 15, 2026, not a
table published by DoD. The rule applied to every control:

- A clause is mapped to an objective only when the objective restates that
  clause (an "is identified", "is defined", "is limited", "is implemented"
  reading of the same words). The mockup's control, `AC.L2-3.1.1`, and its
  Level 1 twin `AC.L1-b.1.i` are the pattern: _authorized users_ → [a]
  identified and [d] limited; _processes acting on behalf of authorized
  users_ → [b], [e]; _devices (including other systems)_ → [c], [f].
- Each letter is given to exactly one clause. Where a sentence could be read
  along two axes (verbs × objects), the reading that keeps every letter under
  one clause was chosen, and the other axis is left unmarked.
- An objective that elaborates beyond the sentence is left without a clause
  rather than guessed (`AC.L2-3.1.3` [c], `CA.L2-3.12.4` [d], `SC.L3-3.13.4e`
  [ODP1]). The objectives list under the sentence still shows every
  statement.
- A control whose objectives do not map cleanly onto its clauses, or whose only
  objective restates the whole sentence, shows the sentence with no
  underlines. These 31 controls are plain:

  `AC.L1-b.1.iv`, `AC.L2-3.1.22` (the objectives describe a posting process
  the sentence does not name); `CM.L2-3.4.8` (each objective spans both halves
  of the sentence); `AU.L2-3.3.2`, `PS.L2-3.9.2`, `SI.L2-3.14.7` (the
  objectives add what the sentence leaves implicit); `AC.L2-3.1.8` (its only
  clause is the whole sentence, so an underline would decode nothing); and
  the 24 controls with a single objective that restates the sentence:
  `SI.L1-b.1.xiv`,
  `CM.L2-3.4.4`, `IA.L2-3.5.4`, `IA.L2-3.5.9`, `IA.L2-3.5.11`, `IR.L2-3.6.3`,
  `MA.L2-3.7.1`, `MA.L2-3.7.3`, `MA.L2-3.7.4`, `MA.L2-3.7.6`, `MP.L2-3.8.2`,
  `MP.L2-3.8.6`, `MP.L2-3.8.7`, `MP.L2-3.8.8`, `MP.L2-3.8.9`, `PS.L2-3.9.1`,
  `PE.L2-3.10.4`, `CA.L2-3.12.3`, `SC.L2-3.13.4`, `SC.L2-3.13.7`,
  `SC.L2-3.13.11`, `SC.L2-3.13.15`, `SC.L2-3.13.16`, `SI.L2-3.14.4`.

118 controls are mapped.

## Limits

- The map is a teaching aid. It does not change, reorder or interpret any
  requirement or objective; the quotations stay verbatim and complete.
- It has not been reviewed by a qualified assessor. Automated checks and the
  authoring agent's own review are not human approval.
- If the pinned snapshot changes, the test fails until the map is re-read
  against the new text.
