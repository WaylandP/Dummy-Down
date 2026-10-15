import type { GlossaryTerm } from '../../types/content'

/** A run of explanation text: plain, or the first mention of one of the lesson's words. */
export interface TextRun {
  readonly text: string
  readonly term?: GlossaryTerm
}

interface Candidate {
  readonly phrase: string
  /** An acronym is matched letter for letter; a word in any case, its plural included. */
  readonly exact: boolean
  readonly term: GlossaryTerm
}

const acronym = /^[A-Z][A-Z0-9]+$/

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * "Federal Contract Information (FCI)" is read as the phrase and as the
 * acronym; any other parenthetical stays part of the title.
 */
export function phrasesFor(term: GlossaryTerm): readonly string[] {
  const match = term.title.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
  if (match && acronym.test(match[2]!))
    return [match[1]!.trim(), match[2]!].filter(Boolean)
  return [term.title.trim()].filter(Boolean)
}

function candidatesFor(terms: readonly GlossaryTerm[]): readonly Candidate[] {
  return terms
    .flatMap((term) =>
      phrasesFor(term).map((phrase) => ({
        phrase,
        exact: acronym.test(phrase),
        term,
      })),
    )
    .sort((a, b) => b.phrase.length - a.phrase.length)
}

function names(candidate: Candidate, word: string): boolean {
  if (candidate.exact) return word === candidate.phrase
  const found = word.toLowerCase()
  const phrase = candidate.phrase.toLowerCase()
  return found === phrase || found === `${phrase}s` || found === `${phrase}es`
}

/**
 * Splits one block of explanation text so that the first mention of each of
 * the lesson's words can carry its definition: whole words only, the plural
 * included, case aside except for an acronym, the longest phrase first. Words
 * not listed for the lesson are left alone, and the runs re-join to the text
 * verbatim. `seen` carries the words an earlier block already marked.
 */
export function markTerms(
  text: string,
  terms: readonly GlossaryTerm[],
  seen: Set<string> = new Set(),
): readonly TextRun[] {
  if (terms.length === 0 || !text) return [{ text }]
  const candidates = candidatesFor(terms)
  // A word boundary without lookbehind, which Safari before 16.4 lacks and a
  // pattern built at run time cannot be compiled around.
  const pattern = new RegExp(
    `(^|[^\\p{L}\\p{N}])((?:${candidates
      .map((candidate) => escapeRegExp(candidate.phrase))
      .join('|')})(?:e?s)?)(?![\\p{L}\\p{N}])`,
    'giu',
  )
  const runs: TextRun[] = []
  let position = 0
  for (const found of text.matchAll(pattern)) {
    const index = (found.index ?? 0) + found[1]!.length
    const word = found[2]!
    const hit = candidates.find((candidate) => names(candidate, word))
    if (!hit || seen.has(hit.term.id)) continue
    seen.add(hit.term.id)
    if (index > position) runs.push({ text: text.slice(position, index) })
    runs.push({ text: word, term: hit.term })
    position = index + word.length
  }
  if (position < text.length) runs.push({ text: text.slice(position) })
  return runs
}

/** The blocks of one view in reading order, each word marked once across them all. */
export function markBlocks(
  texts: readonly string[],
  terms: readonly GlossaryTerm[],
): readonly (readonly TextRun[])[] {
  const seen = new Set<string>()
  return texts.map((text) => markTerms(text, terms, seen))
}
