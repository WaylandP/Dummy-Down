import { useEffect, useId, useRef, useState } from 'react'
import type { SitePage } from '../../state/site-page'
import { trackUsage } from '../../analytics/usage'
import { Lockup } from './Mark'
import {
  findControlAction,
  findControlFields,
  reportFindControl,
} from './find-control'

export const browseUrl = '/learn?view=discover&collection=references'

const links = [
  { page: 'learn', href: browseUrl, label: 'Controls', section: 'explorer' },
  {
    page: 'glossary',
    href: '/glossary',
    label: 'Glossary',
    section: 'glossary',
  },
  { page: 'practice', href: '/practice', label: 'Practice' },
  { page: 'about', href: '/about', label: 'About' },
] as const satisfies readonly {
  page: SitePage
  href: string
  label: string
  section?: 'explorer' | 'glossary'
}[]

/** The lockup, the four places to go, and a find line that opens on request. */
export function SiteHeader({ page }: { readonly page: SitePage }) {
  // The line is open only on the page it was opened on, so a same-document
  // page change (history, a legacy hash) never leaves a form without its button.
  const [findingOn, setFindingOn] = useState<SitePage | null>(null)
  const finding = findingOn === page && page !== 'home'
  const toggle = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const formId = useId()
  useEffect(() => {
    if (finding) input.current?.focus()
  }, [finding])

  return (
    <header className="site-header">
      <Lockup />
      <nav aria-label="Main" className="site-nav">
        {links.map((link) => (
          <a
            key={link.page}
            href={link.href}
            aria-current={page === link.page ? 'page' : undefined}
            onClick={
              'section' in link
                ? () =>
                    trackUsage({ name: 'section_open', section: link.section })
                : undefined
            }
          >
            {link.label}
          </a>
        ))}
      </nav>
      {page !== 'home' && (
        <button
          ref={toggle}
          type="button"
          className="find-toggle"
          aria-label="Find a control"
          aria-expanded={finding}
          {...(finding ? { 'aria-controls': formId } : {})}
          onClick={() => setFindingOn(finding ? null : page)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      )}
      {finding && (
        <form
          id={formId}
          className="find-line"
          role="search"
          aria-label="Find a control"
          action={findControlAction}
          method="get"
          onSubmit={(event) =>
            reportFindControl(
              String(new FormData(event.currentTarget).get('q') ?? ''),
            )
          }
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            event.preventDefault()
            setFindingOn(null)
            toggle.current?.focus()
          }}
        >
          {Object.entries(findControlFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <label htmlFor={`${formId}-q`} className="sr-only">
            Find a control
          </label>
          <div className="find-field">
            <input
              ref={input}
              id={`${formId}-q`}
              type="search"
              name="q"
              placeholder="3.1.1, multifactor, CUI, media…"
              autoComplete="off"
            />
            <button type="submit" className="find-submit" aria-label="Find">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
                className="chalk"
              >
                <path d="M4 12.5c5-1 10-1 15 0M14 7l5 5.5-5 5" />
              </svg>
            </button>
          </div>
          <svg
            className="find-underline chalk"
            viewBox="0 0 480 8"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M2 5c70-3 140-2 210-1s140 1 266-2" />
          </svg>
        </form>
      )}
    </header>
  )
}
