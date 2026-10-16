import type { GlossaryTerm, SourceReference } from '../../types/content'

export type GlossaryGroupId = 'program' | 'scoping' | 'clauses' | 'lessons'

/** The four groupings on the Board's Words page; membership follows each term's first source. */
export const glossaryGroups: readonly {
  readonly id: GlossaryGroupId
  readonly label: string
}[] = [
  { id: 'program', label: 'The program: statuses, roles, SPRS' },
  { id: 'scoping', label: 'Scoping: what’s in, what’s out' },
  { id: 'clauses', label: 'Contract clauses' },
  { id: 'lessons', label: 'Everyday security terms' },
]

export function isGlossaryGroup(
  value: string | null,
): value is GlossaryGroupId {
  return glossaryGroups.some((group) => group.id === value)
}

/**
 * Derived from the cited texts, never authored: nothing about a term changes.
 * A word whose first citation is a lesson's guide or the README is from the
 * lessons; a word that cites the scoping rule anywhere is scoping; a word whose
 * first citation is a contract clause is a clause word; the rest is the
 * program itself.
 */
export function glossaryGroupOf(term: GlossaryTerm): GlossaryGroupId {
  const first = term.sources[0]
  if (!first) return 'lessons'
  if (first.kind === 'project-readme' || first.id.startsWith('glossary-cmmc-'))
    return 'lessons'
  if (
    term.sources.some(
      (source) =>
        source.id.includes('-170-19') ||
        source.id.startsWith('cmmc-scoping-guide'),
    )
  )
    return 'scoping'
  if (/^(dfars|far)-/.test(first.id)) return 'clauses'
  return 'program'
}

/** "32 CFR § 170.4 — Acronyms and definitions" reads "32 CFR § 170.4" in the margin. */
export function sourceLabel(source: SourceReference): string {
  return source.title.split(' — ')[0] ?? source.title
}

/**
 * The labels for one word's sources: the short name, or the full title when
 * two sources of the same publication would otherwise read alike (a guide
 * cited on three pages).
 */
export function sourceLabels(
  sources: readonly SourceReference[],
): readonly string[] {
  const short = sources.map(sourceLabel)
  return sources.map((source, index) =>
    short.some((label, other) => other !== index && label === short[index])
      ? source.title.replace(' — ', ', ')
      : short[index]!,
  )
}

/** The letter a word files under; anything that is not a letter files under "#". */
export function initialOf(term: GlossaryTerm): string {
  const first = term.title.trim().charAt(0).toLocaleUpperCase('en-US')
  return /[A-Z]/.test(first) ? first : '#'
}
