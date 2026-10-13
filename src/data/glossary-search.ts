import type { GlossaryTerm } from '../types/content'

/** Search teaching terms independently; every entered word must match. */
export function filterGlossaryTerms(
  terms: readonly GlossaryTerm[],
  query = '',
): GlossaryTerm[] {
  const words = query
    .trim()
    .toLocaleLowerCase('en-US')
    .split(/\s+/)
    .filter(Boolean)

  return terms.filter((term) => {
    const text = `${term.title} ${term.definition}`.toLocaleLowerCase('en-US')
    return words.every((word) => text.includes(word))
  })
}
