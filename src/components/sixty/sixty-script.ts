/**
 * "CMMC in sixty seconds" (mockups/2026-10-15/SixtySeconds.html): the eight
 * chapters of the one-minute drawing, when each runs, its caption in the
 * owner's words, and the words in it that open the glossary. The drawing's
 * own labels live in the board (SixtyBoard.tsx, in the order of
 * sixty-words.ts); the timing of every stroke is its `data-t` there.
 */

export const sixtyTitle = 'CMMC in sixty seconds'
/** The whole drawing, in seconds. */
export const sixtyLength = 60
/** In the caption slot while the board rests. */
export const sixtyBlurb = 'Three years of CMMC Level 2, drawn in one minute.'
/** Under the player, followed by a link to the timeline. */
export const sixtyNote =
  'Shown: the Level 2 (C3PAO) cycle. Phase 2, which would require it, has been on hold since July 13, 2026.'
/** The board's accessible name and its text description. */
export const sixtyBoardTitle = 'CMMC in sixty seconds: the Level 2 clock'
export const sixtyDescription =
  'The Department of Defense shares information with the companies it hires, and they create more for it; CMMC is how it checks that you protect it. Federal Contract Information (FCI) needs Level 1: 15 rules, self-assessed yearly. Controlled Unclassified Information (CUI) needs Level 2: 110 rules, NIST SP 800-171. CUI on the most critical programs adds Level 3: Level 2 plus 24 more, assessed by DIBCAC. Level 2 is circled, the board is wiped clean, and Level 2 is drawn as a three-year clock with SPRS, the DoD’s Supplier Performance Risk System, at its hub. Day one: an independent C3PAO assesses all 110 requirements; pass, and your status in SPRS is current for three years. Every year you assess your own controls and a senior official affirms compliance in SPRS; skip the affirmation and your status is no longer current. A significant change, like adding Wi-Fi or merging in systems that were never assessed, means a new assessment now, not at year three. Year two, same routine; at year three the C3PAO comes back and the clock starts over. Before an award that requires CMMC, the DoD checks SPRS: no current status, no contract.'
/** Playback speeds, in the order the speed button cycles them. */
export const sixtySpeeds = [1, 0.75, 0.5, 1.5] as const

/** A word of a caption that opens its glossary popover. */
export interface SixtyWord {
  /** The words as they appear in the caption, once. */
  readonly phrase: string
  /** The glossary term's id. */
  readonly term: string
}

export interface SixtyChapter {
  /** Seconds into the drawing. */
  readonly start: number
  readonly end: number
  /** As the eyebrow and the scrub bar's value text name it. */
  readonly name: string
  readonly caption: string
  readonly words: readonly SixtyWord[]
}

export const sixtyChapters: readonly SixtyChapter[] = [
  {
    start: 0,
    end: 7,
    name: 'Who',
    caption:
      'The Department of Defense shares information with the companies it hires, and they create more for it. CMMC is how it checks that you protect it.',
    words: [],
  },
  {
    start: 7,
    end: 15,
    name: 'Levels',
    caption:
      'Federal Contract Information (FCI) needs Level 1. Controlled Unclassified Information (CUI) needs Level 2. CUI on the most critical programs adds Level 3.',
    words: [
      { phrase: 'Federal Contract Information (FCI)', term: 'fci' },
      { phrase: 'Controlled Unclassified Information (CUI)', term: 'cui' },
    ],
  },
  {
    start: 15,
    end: 23,
    name: 'The clock',
    caption:
      'Level 2 runs on a three-year clock. Every result lands in the middle: SPRS, the DoD’s Supplier Performance Risk System.',
    words: [{ phrase: 'SPRS', term: 'sprs' }],
  },
  {
    start: 23,
    end: 31,
    name: 'Certify',
    caption:
      'Day one: an independent C3PAO assesses all 110 requirements. Pass, and your status in SPRS is current for three years.',
    words: [
      { phrase: 'C3PAO', term: 'c3pao' },
      { phrase: 'SPRS', term: 'sprs' },
    ],
  },
  {
    start: 31,
    end: 39,
    name: 'Every year',
    caption:
      'Every year, you assess your own controls and a senior official affirms compliance in SPRS. Skip the affirmation and your status is no longer current.',
    words: [{ phrase: 'SPRS', term: 'sprs' }],
  },
  {
    start: 39,
    end: 46,
    name: 'Big change',
    caption:
      'A significant change, like adding Wi-Fi or merging in systems that were never assessed, means a new assessment now, not at year three.',
    words: [],
  },
  {
    start: 46,
    end: 56,
    name: 'Repeat',
    caption:
      'Year two, same routine. At year three, the C3PAO comes back and the clock starts over.',
    words: [{ phrase: 'C3PAO', term: 'c3pao' }],
  },
  {
    start: 56,
    end: 60,
    name: 'Bottom line',
    caption:
      'Before an award that requires CMMC, the DoD checks SPRS. No current status, no contract.',
    words: [{ phrase: 'SPRS', term: 'sprs' }],
  },
]

/** The chapter running at this second: the last one that has started. */
export function chapterAt(seconds: number): number {
  for (let index = sixtyChapters.length - 1; index > 0; index -= 1)
    if (seconds >= sixtyChapters[index]!.start) return index
  return 0
}

/** Seconds as the time reads: 0:07, 1:00. */
export function formatTime(seconds: number): string {
  const whole = Math.max(0, Math.min(sixtyLength, Math.floor(seconds)))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}
