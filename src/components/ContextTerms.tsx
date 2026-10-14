import { useId, useRef, useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import type { GlossaryTerm, SourceReference } from '../types/content'

interface ContextTermsProps {
  termIds: readonly string[]
  terms: readonly GlossaryTerm[]
  fallbackFocusId?: string
}

function sourceLabel(kind: SourceReference['kind']): string {
  switch (kind) {
    case 'project-readme':
      return 'Project teaching source'
    case 'official-resource-index':
      return 'Official resource index'
    case 'official-publication':
      return 'Official publication'
  }
}

function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

/** Shared reading content; a linked source does not make a draft definition official. */
export function TermDefinition({ term }: { term: GlossaryTerm }) {
  return (
    <div className="term-definition">
      <p className="term-definition-meaning">{term.definition}</p>
      <p className="term-context">
        <span className="draft-label">Draft educational definition.</span>{' '}
        {term.versionContext}
      </p>
      <details className="source-details term-sources">
        <summary>Definition sources & context</summary>
        <div className="source-content">
          <ul>
            {term.sources.map((source) => (
              <li key={source.id}>
                <span className="source-kind">{sourceLabel(source.kind)}</span>
                {isHttps(source.url) ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {source.title}
                    <ArrowUpRight size={14} aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <span>{source.title} — reference link unavailable.</span>
                )}
                <span>{source.versionContext}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  )
}

/** One inline definition, with focus remaining in the reader's current context. */
export function ContextTerms({
  termIds,
  terms,
  fallbackFocusId = 'control-title',
}: ContextTermsProps) {
  const prefix = useId()
  const [openId, setOpenId] = useState<string | null>(null)
  const opener = useRef<HTMLButtonElement | null>(null)
  const referenced = [...new Set(termIds)].map((id) => ({
    id,
    term: terms.find((term) => term.id === id),
  }))
  const selected = referenced.find(({ id }) => id === openId)?.term

  function closeDefinition() {
    setOpenId(null)
    if (opener.current?.isConnected) {
      opener.current.focus()
    } else {
      document.getElementById(fallbackFocusId)?.focus()
    }
  }

  if (!referenced.length) return null

  return (
    <section
      className="context-terms"
      aria-labelledby={`${prefix}-heading`}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && selected) {
          event.preventDefault()
          closeDefinition()
        }
      }}
    >
      <div className="context-terms-heading">
        <span className="instruction-eyebrow">A little less jargon</span>
        <h4 id={`${prefix}-heading`}>Terms in this lesson</h4>
      </div>
      <div className="term-triggers">
        {referenced.map(({ id, term }) =>
          term ? (
            <button
              key={id}
              id={`${prefix}-trigger-${id}`}
              className="term-trigger"
              type="button"
              aria-expanded={selected?.id === id}
              aria-controls={`${prefix}-definition`}
              onClick={(event) => {
                if (selected?.id === id) {
                  closeDefinition()
                } else {
                  opener.current = event.currentTarget
                  setOpenId(id)
                }
              }}
            >
              <span>{term.title}</span>
            </button>
          ) : null,
        )}
      </div>
      {referenced.some(({ term }) => !term) && (
        <p className="term-unavailable">
          A definition isn't available for this term yet.
        </p>
      )}
      <div
        className="context-definition"
        id={`${prefix}-definition`}
        hidden={!selected}
        aria-labelledby={
          selected ? `${prefix}-trigger-${selected.id}` : undefined
        }
      >
        {selected && (
          <>
            <div className="context-definition-heading">
              <div>
                <p className="instruction-eyebrow">In plain language</p>
                <h4>{selected.title}</h4>
              </div>
              <button
                className="term-close"
                type="button"
                onClick={closeDefinition}
              >
                <X size={16} aria-hidden="true" /> Close definition
              </button>
            </div>
            <TermDefinition term={selected} />
          </>
        )}
      </div>
    </section>
  )
}
