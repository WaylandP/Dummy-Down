import { useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Check,
  Info,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import {
  explorerCatalog,
  frameworks,
  glossaryTerms,
  referenceControls,
} from '../data/content'
import {
  createLessonUrl,
  effectiveCollection,
  lessonIdentity,
  lessonIdentityKey,
} from '../state/explorer-state'
import type { ExplorerController } from '../state/useExplorerState'
import { LearningModes } from './LearningModes'
import { ContextTerms } from './ContextTerms'
import { ShareLesson } from './ShareLesson'
import { LearningPractice } from './LearningPractice'
import { ControlResults } from './ControlResults'
import { ReferenceDetail } from './ReferenceDetail'
import { trackUsage } from '../analytics/usage'
import { useSearchUsage } from '../analytics/useSearchUsage'
import { CmmcLevels } from './CmmcLevels'

interface ControlExplorerProps {
  controller: ExplorerController
}

export function ControlExplorer({ controller }: ControlExplorerProps) {
  const [mobileResultsOpen, setMobileResultsOpen] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)
  const searchUsage = useSearchUsage('explorer')
  const focusLesson = useRef(false)
  const lessonHeading = useRef<HTMLHeadingElement>(null)
  const focusRecoveredSearch = useRef(false)

  useLayoutEffect(() => {
    if (
      focusRecoveredSearch.current &&
      searchInput.current &&
      !searchInput.current.disabled
    ) {
      focusRecoveredSearch.current = false
      searchInput.current.focus()
    }
  })
  const {
    parsed,
    resolution,
    results,
    catalogFramework: framework,
    dispatch,
  } = controller
  const ready = parsed.kind === 'ready' ? parsed.state : null
  const filters = ready?.filters ?? {
    catalog: 'cmmc',
    query: '',
    family: '',
    level: '',
  }
  const mode = ready?.mode ?? 'beginner'
  const selected =
    resolution?.kind === 'lesson' ? resolution.control : undefined
  const collection = effectiveCollection(filters)
  const explanation =
    selected?.contentKind === 'educational-example'
      ? selected.explanations[mode]
      : undefined
  const frameworkControls = explorerCatalog.controls.filter(
    (control) =>
      control.frameworkId === filters.catalog &&
      (collection === 'references'
        ? control.contentKind === 'official-reference'
        : control.contentKind === 'educational-example'),
  )
  const families = [
    ...new Map(
      frameworkControls.map((control) => [control.family, control.familyName]),
    ).entries(),
  ]
  const levels = [
    ...new Set(
      frameworkControls.flatMap((control) =>
        control.level ? [control.level] : [],
      ),
    ),
  ]
  const selectedKey = selected
    ? lessonIdentityKey(lessonIdentity(selected))
    : null
  const unavailable =
    parsed.kind === 'invalid' || resolution?.kind === 'not-found'
  const planned =
    resolution?.kind === 'planned-framework'
      ? resolution.framework
      : framework?.status === 'planned'
        ? framework
        : null

  function clearFilters() {
    dispatch({ type: 'clear-filters' })
    searchInput.current?.focus()
  }
  function recover() {
    focusRecoveredSearch.current = true
    dispatch({ type: 'recover-discovery' })
  }

  return (
    <section
      id="explorer"
      className="section-shell explorer-section"
      aria-labelledby="explorer-heading"
    >
      <div className="section-heading">
        <div>
          <p className="section-caption">Explore the idea</p>
          <h2 id="explorer-heading">Control Explorer</h2>
          <p>
            Explore all three CMMC levels, with source text and teaching
            perspectives.
          </p>
        </div>
        <span className="status-badge">
          {referenceControls.length} CMMC controls · 3 draft perspectives each
        </span>
      </div>
      {controller.historyStatus === 'failed' && (
        <p className="explorer-notice" role="alert">
          Your browser couldn’t update the address. You can keep exploring, but
          refresh and Back may not preserve these changes.
        </p>
      )}
      {parsed.kind === 'ready' && parsed.notices.length > 0 && (
        <p className="explorer-notice" role="status">
          {parsed.notices.includes('mode-reset') &&
            'That learning mode is unavailable; showing Beginner. '}
          {parsed.notices.includes('family-reset') &&
            'That family filter is unavailable and was cleared. '}
          {parsed.notices.includes('level-reset') &&
            'That level filter is unavailable and was cleared.'}
        </p>
      )}
      <div className="explorer-shell">
        <div className="explorer-toolbar">
          <label className="search-field">
            <span className="field-caption">Search controls</span>
            <span className="search-input-wrap">
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                ref={searchInput}
                placeholder="Search a topic or control ID…"
                value={filters.query}
                disabled={parsed.kind === 'invalid'}
                onChange={(event) => {
                  searchUsage.edited(event.target.value)
                  dispatch({ type: 'set-query', query: event.target.value })
                }}
                onBlur={() => searchUsage.report(filters.query, results.length)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter')
                    searchUsage.report(filters.query, results.length)
                }}
              />
            </span>
          </label>
          <label className="framework-field collection-field">
            <span>Content collection</span>
            <select
              value={collection}
              disabled={parsed.kind === 'invalid'}
              onChange={(event) =>
                dispatch({
                  type: 'set-collection',
                  collection:
                    event.target.value === 'references'
                      ? 'references'
                      : 'lessons',
                })
              }
            >
              <option value="lessons">Demo lesson</option>
              <option value="references">Controls &amp; sources</option>
            </select>
          </label>
          <label className="framework-field">
            <span>Framework</span>
            <select
              value={filters.catalog}
              disabled={parsed.kind === 'invalid'}
              onChange={(event) =>
                dispatch({ type: 'set-catalog', catalog: event.target.value })
              }
            >
              {!frameworks.some((item) => item.id === filters.catalog) && (
                <option value={filters.catalog}>Unavailable framework</option>
              )}
              {frameworks.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.shortName}
                  {item.status === 'planned' ? ' · planned' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
        <CmmcLevels mode={mode} />
        <div className="explorer-body">
          <aside
            className={`control-sidebar ${selected && !mobileResultsOpen ? 'is-collapsed' : ''}`}
            aria-label="Control results and filters"
          >
            {selected && (
              <button
                type="button"
                className="mobile-results-toggle"
                aria-expanded={mobileResultsOpen}
                aria-controls="control-results-body"
                onClick={() => setMobileResultsOpen(!mobileResultsOpen)}
              >
                {mobileResultsOpen
                  ? 'Return to reading'
                  : `Browse & filter controls (${results.length})`}
              </button>
            )}
            <div id="control-results-body" className="results-body">
              <div className="filter-title">
                <SlidersHorizontal size={15} aria-hidden="true" />
                <span>Refine your view</span>
              </div>
              <label className="filter-field">
                Control family
                <select
                  value={filters.family}
                  disabled={parsed.kind === 'invalid'}
                  onChange={(event) =>
                    dispatch({ type: 'set-family', family: event.target.value })
                  }
                >
                  <option value="">All families</option>
                  {families.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              {levels.length > 0 && (
                <label className="filter-field">
                  Level
                  <select
                    value={filters.level}
                    disabled={parsed.kind === 'invalid'}
                    onChange={(event) =>
                      dispatch({ type: 'set-level', level: event.target.value })
                    }
                  >
                    <option value="">All levels</option>
                    {levels.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <div
                className="result-count"
                role="status"
                aria-label="Control search results"
              >
                {results.length}{' '}
                {collection === 'references'
                  ? results.length === 1
                    ? 'reference'
                    : 'references'
                  : results.length === 1
                    ? 'example'
                    : 'examples'}{' '}
                found
              </div>
              <ControlResults
                key={results
                  .map((control) => lessonIdentityKey(lessonIdentity(control)))
                  .join('|')}
                results={results}
                selectedKey={selectedKey}
                onSelect={(control) => {
                  const key = lessonIdentityKey(lessonIdentity(control))
                  setMobileResultsOpen(false)
                  if (selectedKey === key) {
                    lessonHeading.current?.focus()
                    return
                  }
                  focusLesson.current = true
                  dispatch({
                    type: 'select-lesson',
                    identity: lessonIdentity(control),
                  })
                }}
              />
              <p className="sidebar-note">
                <Info size={15} aria-hidden="true" />
                {collection === 'references'
                  ? 'September 2024 CMMC v2.13 snapshot. All controls have draft teaching perspectives; qualified editorial review is pending.'
                  : 'Original demo lesson. Choose a level above or Controls & sources to explore all 149 controls.'}
              </p>
            </div>
          </aside>
          {selected?.contentKind === 'educational-example' &&
          explanation &&
          resolution?.kind === 'lesson' ? (
            <article className="control-detail" aria-labelledby="control-title">
              <button
                type="button"
                className="back-to-results inline-action"
                onClick={() => {
                  dispatch({ type: 'back-to-discovery' })
                  searchInput.current?.focus()
                }}
              >
                Back to results
              </button>
              <div className="control-kicker">
                <span>
                  {[
                    resolution.framework.shortName,
                    selected.level,
                    selected.familyName,
                  ]
                    .filter(Boolean)
                    .join(' / ')}
                </span>
                <span className="draft-tag">Draft educational example</span>
              </div>
              {resolution.excludedByFilters && (
                <div className="lesson-mismatch">
                  <p>This lesson is outside the current results.</p>
                  <button
                    type="button"
                    className="inline-action"
                    onClick={() => dispatch({ type: 'show-lesson-in-results' })}
                  >
                    Show this lesson in results
                  </button>
                </div>
              )}
              <div className="lesson-heading-row">
                <div>
                  <h3
                    id="control-title"
                    tabIndex={-1}
                    ref={(node) => {
                      lessonHeading.current = node
                      if (node && focusLesson.current) {
                        focusLesson.current = false
                        node.focus()
                      }
                    }}
                  >
                    {selected.title}
                  </h3>
                  <p className="control-reference">{selected.id}</p>
                  <p className="edition-context">
                    Project edition: {resolution.edition.title}
                  </p>
                </div>
                <ShareLesson
                  lesson={lessonIdentity(selected)}
                  url={createLessonUrl(
                    lessonIdentity(selected),
                    mode,
                    new URL(window.location.href),
                  )}
                />
              </div>
              <div className="concept-box">
                <span className="small-label">The concept, simplified</span>
                <p>{selected.concept}</p>
                <span>
                  {selected.sources.some(
                    (source) => source.kind === 'project-readme',
                  )
                    ? 'Paraphrase from our README; not the official requirement.'
                    : 'Educational interpretation; not the official requirement.'}
                </span>
              </div>
              <ContextTerms
                key={selectedKey}
                termIds={selected.glossaryTermIds}
                terms={glossaryTerms}
                fallbackFocusId="control-title"
              />
              <p className="mode-label">Choose your perspective</p>
              <LearningModes
                value={mode}
                onChange={(nextMode) =>
                  dispatch({ type: 'change-mode', mode: nextMode })
                }
                idPrefix="control"
              />
              <div
                className="explanation-panel"
                role="tabpanel"
                id="control-panel"
                aria-labelledby={`control-tab-${mode}`}
                tabIndex={0}
              >
                <h4>{explanation.heading}</h4>
                <p>{explanation.summary}</p>
                <div className="example-box">
                  <span className="small-label">
                    {explanation.exampleTitle}
                  </span>
                  <ul>
                    {explanation.examples.map((example) => (
                      <li key={example}>
                        <Check size={16} aria-hidden="true" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="takeaway">
                  <Info size={16} aria-hidden="true" />
                  <span>{explanation.takeaway}</span>
                </p>
              </div>
              <LearningPractice lesson={lessonIdentity(selected)} />
              <details className="source-details">
                <summary>Sources &amp; content context</summary>
                <div className="source-content">
                  <p>{resolution.edition.versionContext}</p>
                  <p>{selected.versionContext}</p>
                  <ul>
                    {selected.sources.map((source) => (
                      <li key={source.id}>
                        <a
                          href={source.url}
                          onClick={() =>
                            trackUsage({
                              name: 'source_open',
                              lesson: lessonIdentity(selected),
                              sourceId: source.id,
                              destination:
                                source.kind === 'official-resource-index'
                                  ? 'index'
                                  : 'publisher',
                            })
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {source.title}
                          <ArrowUpRight size={14} aria-hidden="true" />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                        <span>
                          {source.kind === 'project-readme'
                            ? 'Project educational source'
                            : source.kind === 'official-resource-index'
                              ? 'Official resource index'
                              : 'Official publication'}
                          . {source.versionContext}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p>{selected.disclaimer}</p>
                </div>
              </details>
            </article>
          ) : selected?.contentKind === 'official-reference' &&
            resolution?.kind === 'lesson' ? (
            <ReferenceDetail
              control={selected}
              mode={mode}
              onModeChange={(nextMode) =>
                dispatch({ type: 'change-mode', mode: nextMode })
              }
              framework={resolution.framework}
              edition={resolution.edition}
              shareUrl={createLessonUrl(
                lessonIdentity(selected),
                mode,
                new URL(window.location.href),
              )}
              excludedByFilters={resolution.excludedByFilters}
              onBack={() => {
                dispatch({ type: 'back-to-discovery' })
                searchInput.current?.focus()
              }}
              onShowInResults={() =>
                dispatch({ type: 'show-lesson-in-results' })
              }
              headingRef={(node) => {
                lessonHeading.current = node
                if (node && focusLesson.current) {
                  focusLesson.current = false
                  node.focus()
                }
              }}
            />
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Search size={30} aria-hidden="true" />
              </span>
              <h3>
                {parsed.kind === 'invalid'
                  ? 'This lesson link is invalid.'
                  : resolution?.kind === 'not-found'
                    ? 'This lesson isn’t available here.'
                    : planned
                      ? `${planned.shortName} is on the roadmap.`
                      : results.length
                        ? collection === 'references'
                          ? 'Choose a source reference.'
                          : 'Choose a draft example.'
                        : collection === 'references'
                          ? 'No matching references.'
                          : 'No matching examples.'}
              </h3>
              <p>
                {unavailable
                  ? 'This address doesn’t identify an available lesson. Browse the draft examples to choose where to begin.'
                  : planned
                    ? 'This framework has no published content here yet. Browse the available draft examples to explore the learning experience.'
                    : results.length
                      ? collection === 'references'
                        ? 'Select a control to compare its official text with Beginner, IT & Cyber and Compliance teaching drafts.'
                        : 'Select an example from the results to begin reading. Your learning mode is kept as you browse.'
                      : collection === 'references'
                        ? 'Try a control identifier, topic, family or level in the September 2024 source snapshot.'
                        : 'Try “access”, “authorized”, or “AC.L2-3.1.1”. This collection contains one draft example.'}
              </p>
              {unavailable || planned ? (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={recover}
                >
                  {planned
                    ? 'Browse available examples'
                    : 'Browse draft examples'}
                </button>
              ) : (
                !results.length && (
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
      <p className="explorer-disclaimer">
        <Info size={14} aria-hidden="true" />
        Learning material, not a compliance checklist. Always consult the
        applicable official requirements and assessment guidance.
      </p>
    </section>
  )
}
