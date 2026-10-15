import { useEffect, useId, useRef, useState, type MouseEvent } from 'react'
import { filterGlossaryTerms } from '../data/glossary-search'
import type { GlossaryTerm } from '../types/content'
import { useSearchUsage } from '../analytics/useSearchUsage'
import {
  glossaryGroups,
  glossaryGroupOf,
  initialOf,
  isGlossaryGroup,
  sourceLabels,
} from './glossary/groups'

interface GlossaryProps {
  terms: readonly GlossaryTerm[]
}

function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

function plainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return !(
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
}

/**
 * Words: one letter at a time, four groupings, a search line. The letter and
 * the group live in the address; typing a search never touches history.
 */
export function Glossary({ terms }: GlossaryProps) {
  const prefix = useId()
  const input = useRef<HTMLInputElement>(null)
  const words = useRef<HTMLElement>(null)
  const [query, setQuery] = useState('')
  const [address, setAddress] = useState(() => window.location.search)
  useEffect(() => {
    const sync = () => setAddress(window.location.search)
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])
  const searchUsage = useSearchUsage('glossary')

  const sorted = [...terms].sort((left, right) =>
    left.title.localeCompare(right.title, 'en-US'),
  )
  const letters = [...new Set(sorted.map(initialOf))]
  const params = new URLSearchParams(address)
  const requestedLetter = (params.get('letter') ?? '').toLocaleUpperCase(
    'en-US',
  )
  const requestedGroup = params.get('group')
  const letter = letters.includes(requestedLetter)
    ? requestedLetter
    : (letters[0] ?? 'A')
  const mode = query.trim()
    ? 'search'
    : isGlossaryGroup(requestedGroup)
      ? 'group'
      : 'letter'
  const group = isGlossaryGroup(requestedGroup) ? requestedGroup : null
  const shown =
    mode === 'search'
      ? filterGlossaryTerms(sorted, query)
      : mode === 'group'
        ? sorted.filter((term) => glossaryGroupOf(term) === group)
        : sorted.filter((term) => initialOf(term) === letter)
  // The letters are navigation, not a filter: every word stays one click away.
  const counted = mode === 'letter' ? sorted.length : shown.length
  const sectionLabel =
    mode === 'search'
      ? 'Search results'
      : mode === 'group'
        ? (glossaryGroups.find((item) => item.id === group)?.label ?? '')
        : `Words under ${letter}`
  const position = letters.indexOf(letter)
  const previous = mode === 'letter' ? letters[position - 1] : undefined
  const next = mode === 'letter' ? letters[position + 1] : undefined

  function go(search: string) {
    return (event: MouseEvent<HTMLAnchorElement>) => {
      if (!plainLeftClick(event)) return
      event.preventDefault()
      window.history.pushState(null, '', `/glossary${search}`)
      setAddress(search)
      setQuery('')
      // The words are the answer to the click; read them from the top.
      words.current?.focus()
    }
  }
  function clearSearch() {
    setQuery('')
    input.current?.focus()
  }

  return (
    <div id="glossary" className="glossary-page">
      <aside className="glossary-aside">
        <h1 className="chalk">Words</h1>
        <form
          role="search"
          aria-label="Search words"
          className="line-field"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor={`${prefix}-search`} className="sr-only">
            Search words
          </label>
          <input
            ref={input}
            id={`${prefix}-search`}
            type="search"
            placeholder="CUI, POA&M, enclave…"
            autoComplete="off"
            value={query}
            onChange={(event) => {
              searchUsage.edited(event.target.value)
              setQuery(event.target.value)
            }}
            onBlur={() => searchUsage.report(query, shown.length)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') searchUsage.report(query, shown.length)
            }}
          />
          <svg
            className="line-underline chalk"
            viewBox="0 0 300 8"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M1 5c60-3 120-1 180 0s90-2 118-1" />
          </svg>
        </form>
        <nav className="az" aria-label="Jump to a letter">
          {letters.map((item) => (
            <a
              key={item}
              href={`/glossary?letter=${encodeURIComponent(item)}`}
              aria-current={
                mode === 'letter' && item === letter ? 'page' : undefined
              }
              onClick={go(`?letter=${encodeURIComponent(item)}`)}
            >
              {item}
            </a>
          ))}
        </nav>
        <nav className="glossary-groups" aria-label="Groups of words">
          {glossaryGroups.map((item) => (
            <a
              key={item.id}
              href={`/glossary?group=${item.id}`}
              aria-current={
                mode === 'group' && item.id === group ? 'page' : undefined
              }
              onClick={go(`?group=${item.id}`)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <section
        ref={words}
        className="glossary-words"
        aria-label={sectionLabel}
        tabIndex={-1}
      >
        {shown.length ? (
          shown.map((term) => (
            <article className="word" key={term.id} id={term.id}>
              <h2>{term.title}</h2>
              <p>{term.definition}</p>
              <p className="word-sources mono">
                {term.sources.map((source, index) => (
                  <span key={source.id}>
                    {index > 0 && ', '}
                    {isHttps(source.url) ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {sourceLabels(term.sources)[index]}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      sourceLabels(term.sources)[index]
                    )}
                  </span>
                ))}
              </p>
            </article>
          ))
        ) : (
          <div className="glossary-empty">
            <h2 className="chalk">No matching words.</h2>
            <p>Try another word, or pick a letter or a group.</p>
            <button
              className="control-action"
              type="button"
              onClick={clearSearch}
            >
              Clear glossary search
            </button>
          </div>
        )}
      </section>
      <p className="glossary-foot">
        <span>
          <span role="status" aria-label="Glossary search results">
            {counted} {counted === 1 ? 'word' : 'words'}
          </span>
          . Teaching definitions, each linked to the text that defines it.
        </span>
        {(previous || next) && (
          <span className="glossary-prevnext">
            {previous && (
              <a
                href={`/glossary?letter=${encodeURIComponent(previous)}`}
                onClick={go(`?letter=${encodeURIComponent(previous)}`)}
              >
                Previous: {previous}
              </a>
            )}
            {next && (
              <a
                className="is-next"
                href={`/glossary?letter=${encodeURIComponent(next)}`}
                onClick={go(`?letter=${encodeURIComponent(next)}`)}
              >
                Next: {next}
              </a>
            )}
          </span>
        )}
      </p>
    </div>
  )
}
