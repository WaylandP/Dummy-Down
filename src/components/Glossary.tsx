import { useId, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { filterGlossaryTerms } from '../data/glossary-search'
import type { GlossaryTerm } from '../types/content'
import { TermDefinition } from './ContextTerms'
import { trackUsage } from '../analytics/usage'
import { useSearchUsage } from '../analytics/useSearchUsage'

interface GlossaryProps {
  terms: readonly GlossaryTerm[]
}

/** Vocabulary search is local to this section, independent of control discovery. */
export function Glossary({ terms }: GlossaryProps) {
  const prefix = useId()
  const input = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const searchUsage = useSearchUsage('glossary')
  const results = filterGlossaryTerms(terms, query).sort((left, right) =>
    left.title.localeCompare(right.title, 'en-US'),
  )

  return (
    <section
      id="glossary"
      className="glossary section-shell"
      aria-labelledby={`${prefix}-heading`}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">The wordbook</span>
          <h2 id={`${prefix}-heading`}>A little less jargon.</h2>
        </div>
        <p>
          Plain-language definitions of the terms used in the lessons. They are
          teaching definitions, not the official framework wording.
        </p>
      </div>
      <div className="glossary-search">
        <label htmlFor={`${prefix}-search`}>Search glossary</label>
        <div className="glossary-search-field">
          <Search size={18} aria-hidden="true" />
          <input
            ref={input}
            id={`${prefix}-search`}
            type="search"
            placeholder="Try account, device, or offboarding"
            value={query}
            onChange={(event) => {
              searchUsage.edited(event.target.value)
              setQuery(event.target.value)
            }}
            onBlur={() => searchUsage.report(query, results.length)}
            onKeyDown={(event) => {
              if (event.key === 'Enter')
                searchUsage.report(query, results.length)
            }}
          />
        </div>
      </div>
      <p
        className="glossary-count"
        role="status"
        aria-label="Glossary search results"
      >
        {results.length} {results.length === 1 ? 'term' : 'terms'}
      </p>
      {results.length ? (
        <div className="glossary-list">
          {results.map((term) => (
            <details
              className="glossary-term"
              key={term.id}
              onToggle={(event) => {
                if (event.currentTarget.open)
                  trackUsage({ name: 'glossary_open', termId: term.id })
              }}
            >
              <summary>{term.title}</summary>
              <TermDefinition term={term} />
            </details>
          ))}
        </div>
      ) : (
        <div className="glossary-empty">
          <h3>No matching terms.</h3>
          <p>Try a different word or return to the full list.</p>
          <button
            className="text-action"
            type="button"
            onClick={() => {
              setQuery('')
              input.current?.focus()
            }}
          >
            Clear glossary search
          </button>
        </div>
      )}
    </section>
  )
}
