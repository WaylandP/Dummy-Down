import { useEffect, useRef } from 'react'
import { objectiveCoverage } from '../data/objective-coverage'
import { createLessonUrl, type ControlTab } from '../state/explorer-state'
import type { ObjectiveCoverage } from '../types/coverage'
import { readChalkPreference } from '../state/chalk-preference'

const pageSize = 15
const modes = {
  beginner: 'Beginner',
  'it-cyber': 'IT & Cyber',
  compliance: 'Compliance',
}
const counts = {
  explained: objectiveCoverage.filter(
    (row) => row.coverage === 'explained-in-draft',
  ).length,
  missing: objectiveCoverage.filter((row) => row.coverage === 'missing').length,
  total: objectiveCoverage.length,
}
function lessonUrl(
  row: ObjectiveCoverage,
  mode: keyof typeof modes = readChalkPreference() ?? 'beginner',
  tab: ControlTab = 'decode',
) {
  return createLessonUrl(
    row.lesson,
    mode,
    new URL('/learn', window.location.origin),
    tab,
  )
}

export default function CoveragePage() {
  const params = new URLSearchParams(window.location.search)
  const control = params.get('control') || ''
  const query = params.get('q') || control
  const level = ['Level 1', 'Level 2', 'Level 3'].includes(
    params.get('level') || '',
  )
    ? params.get('level')!
    : ''
  const status = ['explained-in-draft', 'missing'].includes(
    params.get('status') || '',
  )
    ? params.get('status')!
    : ''
  const search = query.trim().toLocaleLowerCase('en-US')
  const exactControl = objectiveCoverage.find(
    (row) => row.statement.controlId.toLocaleLowerCase('en-US') === search,
  )?.statement.controlId
  const filtered = objectiveCoverage.filter(
    (row) =>
      (!control || row.statement.controlId === control) &&
      (!exactControl || row.statement.controlId === exactControl) &&
      (!level || row.level === level) &&
      (!status || row.coverage === status) &&
      (!search ||
        `${row.statement.id} ${row.title} ${row.statement.text}`
          .toLocaleLowerCase('en-US')
          .includes(search)),
  )
  const grouped = new Map<string, ObjectiveCoverage[]>()
  for (const row of filtered) {
    const rows = grouped.get(row.statement.controlId) || []
    rows.push(row)
    grouped.set(row.statement.controlId, rows)
  }
  const totalPages = Math.max(1, Math.ceil(grouped.size / pageSize))
  const requestedPage = Number(params.get('page') || 1)
  const page = Number.isSafeInteger(requestedPage)
    ? Math.min(totalPages, Math.max(1, requestedPage))
    : 1
  const visible = [...grouped.entries()].slice(
    (page - 1) * pageSize,
    page * pageSize,
  )
  const resultsHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (window.location.hash === '#coverage-results')
      resultsHeading.current?.focus()
  }, [])
  function pageUrl(next: number) {
    const nextParams = new URLSearchParams(window.location.search)
    nextParams.set('page', String(next))
    return `/coverage?${nextParams.toString()}#coverage-results`
  }
  return (
    <div className="coverage-page page">
      <h1 className="chalk">Every assessment objective.</h1>
      <p className="page-lead">
        All {counts.total} assessment objectives from the CMMC Level 1–3 guides
        (459 determination statements and 9 organization-defined parameters),
        quoted with page citations and linked to the explanation that covers
        each one.
      </p>
      <p className="page-note coverage-context">
        CMMC v2.13 · September 2024 snapshot · Levels 1–3
      </p>
      <dl
        className="coverage-totals"
        aria-label="Coverage across the full snapshot"
      >
        <div>
          <dt>Explained</dt>
          <dd>{counts.explained}</dd>
        </div>
        <div>
          <dt>Missing explanation</dt>
          <dd>{counts.missing}</dd>
        </div>
        <div>
          <dt>Total statements</dt>
          <dd>{counts.total}</dd>
        </div>
      </dl>
      <details className="source-details coverage-method">
        <summary>What these counts mean</summary>
        <div className="source-content">
          <p>
            “Explained” means a specific teaching passage or note addresses that
            statement. It does not mean every perspective or practice activity
            covers every detail.
          </p>
          <p>
            Statements were compared with the pinned assessment-guide PDFs. A
            quotation alone does not count as an explanation. “Missing
            explanation” means no mapping exists yet.
          </p>
          <p>
            The nine organization-defined parameter (ODP) rows describe choices
            or definitions and are listed separately from lettered
            determinations. How explanations are written and checked is on the{' '}
            <a href="/about">About page</a>.
          </p>
          <a href="https://github.com/WaylandP/cipher-and-chalk/blob/main/docs/sources/cmmc-2-13-sep-2024.md">
            Source provenance
          </a>
        </div>
      </details>
      <form
        className="coverage-filters"
        action="/coverage"
        method="get"
        role="search"
        aria-label="Assessment coverage"
      >
        <div className="line-field">
          <label htmlFor="coverage-q" className="sr-only">
            Find a control or source statement
          </label>
          <input
            id="coverage-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Try AC.L1-b.1.i or remote access"
            maxLength={200}
            autoComplete="off"
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
        </div>
        <label className="line-select" htmlFor="coverage-level">
          <span>Level</span>
          <select id="coverage-level" name="level" defaultValue={level}>
            <option value="">All levels</option>
            {['Level 1', 'Level 2', 'Level 3'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="line-select" htmlFor="coverage-status">
          <span>Explanation coverage</span>
          <select id="coverage-status" name="status" defaultValue={status}>
            <option value="">All statements</option>
            <option value="explained-in-draft">Explained</option>
            <option value="missing">Missing explanation</option>
          </select>
        </label>
        <button className="line-action" type="submit">
          Apply filters
        </button>
      </form>
      <div className="coverage-results-heading">
        <h2 id="coverage-results" ref={resultsHeading} tabIndex={-1}>
          {filtered.length} {filtered.length === 1 ? 'statement' : 'statements'}{' '}
          · {grouped.size} {grouped.size === 1 ? 'control' : 'controls'}
        </h2>
        {(query || level || status) && (
          <a className="line-action is-quiet" href="/coverage">
            Clear filters
          </a>
        )}
      </div>
      {filtered.length === 0 && (
        <div className="coverage-empty">
          <h3>No statements match this search.</h3>
          <p>Try a control identifier, a shorter phrase, or another level.</p>
          <a className="line-action" href="/coverage">
            Browse all statements
          </a>
        </div>
      )}
      <div className="coverage-index">
        {visible.map(([id, rows]) => {
          const first = rows[0]!
          const gaps = rows.filter((row) => row.coverage === 'missing').length
          return (
            <details
              className="coverage-control"
              key={id}
              open={grouped.size === 1 || status === 'missing'}
            >
              <summary>
                <span>
                  <span className="coverage-control-id mono">{id}</span>
                  <span className="coverage-control-level">{first.level}</span>
                  <strong>{first.title}</strong>
                  <span className="coverage-control-count">
                    {rows.length} matching statements
                    {gaps ? ` · ${gaps} unresolved` : ''}
                  </span>
                </span>
              </summary>
              <div className="coverage-control-body">
                <p>
                  <a className="text-link" href={lessonUrl(first)}>
                    Open this control
                  </a>
                </p>
                <p className="coverage-citation">
                  <a href={first.sourceUrl}>
                    {first.sourceTitle}, version {first.sourceVersion}
                  </a>
                  <br />
                  PDF page {first.statement.pdfPage} · printed page{' '}
                  {first.statement.printedPage}.
                </p>
                <ol className="coverage-statements">
                  {rows.map((row) => (
                    <li key={row.statement.id}>
                      <h3>
                        <code>{row.statement.id}</code>
                      </h3>
                      <p className="coverage-row-status">
                        {row.statement.kind === 'organization-defined-parameter'
                          ? 'Organization-defined parameter'
                          : 'Determination'}{' '}
                        ·{' '}
                        {row.coverage === 'missing'
                          ? 'Missing explanation'
                          : 'Explained'}
                      </p>
                      <p className="small-label">
                        Official guide quotation · Determine if:
                      </p>
                      <blockquote>{row.statement.text}</blockquote>
                      {row.unresolvedQuestions.map((question) => (
                        <div className="coverage-gap" key={question}>
                          <h4>Unresolved source wording</h4>
                          <p>{question}</p>
                        </div>
                      ))}
                      {row.coverage === 'explained-in-draft' && (
                        <details className="coverage-teaching">
                          <summary>Read the explanation</summary>
                          <div>
                            {row.explanation && (
                              <section>
                                <h4>Supplementary teaching note</h4>
                                <p>{row.explanation}</p>
                              </section>
                            )}
                            {row.excerpts.map((excerpt) => (
                              <section key={excerpt.location}>
                                <h4>
                                  {modes[excerpt.mode]}{' '}
                                  <span className="coverage-field">
                                    · {excerpt.location.split('.')[1]}
                                  </span>
                                </h4>
                                <p>{excerpt.text}</p>
                                <a
                                  className="text-link"
                                  href={lessonUrl(row, excerpt.mode, 'explain')}
                                >
                                  Read the {modes[excerpt.mode]} explanation
                                </a>
                              </section>
                            ))}
                            <p>
                              {row.practice ? (
                                <>
                                  Selected fictional example:{' '}
                                  <a
                                    href={lessonUrl(
                                      row,
                                      'beginner',
                                      'practice',
                                    )}
                                  >
                                    {row.practice.title}
                                  </a>{' '}
                                  · {row.practice.step}.
                                </>
                              ) : (
                                'No practice example is mapped to this statement.'
                              )}
                            </p>
                          </div>
                        </details>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          )
        })}
      </div>
      {totalPages > 1 && (
        <nav className="coverage-pagination" aria-label="Coverage result pages">
          {page > 1 && (
            <a className="line-action is-quiet" href={pageUrl(page - 1)}>
              Previous controls
            </a>
          )}
          <span>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a className="line-action" href={pageUrl(page + 1)}>
              Next controls
            </a>
          )}
        </nav>
      )}
    </div>
  )
}
