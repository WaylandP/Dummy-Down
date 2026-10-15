import type { ReferenceControl } from '../types/content'
import map from './cmmc-clause-map.json'

/** A clause of the requirement sentence and the objective labels it produces. */
export interface ClauseSpan {
  readonly text: string
  readonly letters: readonly string[]
}

/** The sentence in order: plain text, or a clause with its letters. */
export interface SentenceSegment {
  readonly text: string
  readonly letters?: readonly string[]
}

const clauses = map.controls as Readonly<Record<string, readonly ClauseSpan[]>>

/**
 * The authored clause map for one control (docs/sources/cmmc-clause-map-2026-10-15.md).
 * Empty where the sentence shows plain: another edition, or clauses that do not
 * map cleanly onto the objectives.
 */
export function clauseMapFor(
  control: Pick<ReferenceControl, 'frameworkId' | 'editionId' | 'id'>,
): readonly ClauseSpan[] {
  if (
    control.frameworkId !== map.frameworkId ||
    control.editionId !== map.editionId
  )
    return []
  return clauses[control.id] ?? []
}

/**
 * Splits the sentence around each clause, found verbatim and in order. Returns
 * null if any clause is missing, so the caller shows the sentence plain.
 */
export function decodeSentence(
  sentence: string,
  spans: readonly ClauseSpan[],
): readonly SentenceSegment[] | null {
  const segments: SentenceSegment[] = []
  let position = 0
  for (const span of spans) {
    const index = sentence.indexOf(span.text, position)
    if (index < 0) return null
    if (index > position)
      segments.push({ text: sentence.slice(position, index) })
    segments.push({ text: span.text, letters: span.letters })
    position = index + span.text.length
  }
  if (position < sentence.length)
    segments.push({ text: sentence.slice(position) })
  return segments
}
