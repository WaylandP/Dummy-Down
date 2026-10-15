import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
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
  createChalkUrl,
  createLessonUrl,
  effectiveCollection,
  lessonIdentity,
  lessonIdentityKey,
  serializeExplorerSearch,
  type ControlTab,
} from '../state/explorer-state'
import type { ExplorerController } from '../state/useExplorerState'
import type { CatalogControl } from '../types/content'
import { LearningModes } from './LearningModes'
import { ContextTerms } from './ContextTerms'
import { ShareLesson } from './ShareLesson'
import { LearningPractice } from './LearningPractice'
import { ControlResults } from './ControlResults'
import { ControlPage } from './control/ControlPage'
import { Erase } from './control/Erase'
import { trackUsage } from '../analytics/usage'
import { useSearchUsage } from '../analytics/useSearchUsage'
import { CmmcLevels } from './CmmcLevels'
import { families as catalogFamilies, familyUrl, plainClick } from './families'
import { chalkFor } from './board/chalks'
import { readChalkPreference } from '../state/chalk-preference'

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
  const tab: ControlTab = ready?.tab ?? 'decode'
  const selected =
    resolution?.kind === 'lesson' ? resolution.control : undefined
  const selectedIndex = selected
    ? results.findIndex(
        (control) =>
          lessonIdentityKey(lessonIdentity(control)) ===
          lessonIdentityKey(lessonIdentity(selected)),
      )
    : -1
  const neighbour = (offset: number) =>
    selectedIndex >= 0 ? results[selectedIndex + offset] : undefined
  // The Board's control screen; the readme example keeps the older reader.
  const onBoard =
    selected?.contentKind === 'official-reference' &&
    resolution?.kind === 'lesson' &&
    ready !== null
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
  // Planned frameworks keep resolving from saved links, but a visitor is only
  // offered frameworks that have published content.
  const selectableFrameworks = frameworks.filter(
    (item) => item.status !== 'planned' || item.id === filters.catalog,
  )

  function selectControl(control: CatalogControl) {
    const key = lessonIdentityKey(lessonIdentity(control))
    setMobileResultsOpen(false)
    if (selectedKey === key) {
      lessonHeading.current?.focus()
      return
    }
    focusLesson.current = true
    dispatch({ type: 'select-lesson', identity: lessonIdentity(control) })
  }
  function clearFilters() {
    dispatch({ type: 'clear-filters' })
    searchInput.current?.focus()
  }
  function recover() {
    focusRecoveredSearch.current = true
    dispatch({
      type: 'recover-discovery',
      mode: readChalkPreference() ?? 'beginner',
    })
  }
  function backToDiscovery() {
    focusRecoveredSearch.current = true
    dispatch({ type: 'back-to-discovery' })
  }

  // The fields are shared by the older reader's toolbar and the Controls page.
  const searchInputElement = (
    <input
      type="search"
      id="control-search"
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
  )
  const collectionSelect = (
    <select
      value={collection}
      disabled={parsed.kind === 'invalid'}
      onChange={(event) =>
        dispatch({
          type: 'set-collection',
          collection:
            event.target.value === 'references' ? 'references' : 'lessons',
        })
      }
    >
      <option value="lessons">Demo lesson</option>
      <option value="references">Controls &amp; sources</option>
    </select>
  )
  const frameworkSelect = (
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
      {selectableFrameworks.map((item) => (
        <option value={item.id} key={item.id}>
          {item.shortName}
          {item.status === 'planned' ? ' · planned' : ''}
        </option>
      ))}
    </select>
  )
  const familySelect = (
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
  )
  const levelSelect = (
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
  )
  const toolbar = (
    <div id="explorer-toolbar" className="explorer-toolbar">
      <label className="search-field">
        <span className="field-caption">Search controls</span>
        <span className="search-input-wrap">
          <Search size={18} aria-hidden="true" />
          {searchInputElement}
        </span>
      </label>
      <label className="framework-field collection-field">
        <span>Content collection</span>
        {collectionSelect}
      </label>
      <label className="framework-field">
        <span>Framework</span>
        {frameworkSelect}
      </label>
    </div>
  )
  const levelPaths = <CmmcLevels mode={mode} />

  // On the Board the browse panel follows the control page in the DOM as it
  // does on screen, so focus order and reading order agree.
  const sidebar = (
    <aside
      key="sidebar"
      className={`control-sidebar ${selected && !mobileResultsOpen ? 'is-collapsed' : ''}`}
      aria-label="Control results and filters"
    >
      {selected && (
        <button
          type="button"
          className="mobile-results-toggle"
          aria-expanded={mobileResultsOpen}
          aria-controls="explorer-toolbar explorer-levels control-results-body"
          onClick={() => {
            if (!mobileResultsOpen) focusRecoveredSearch.current = true
            setMobileResultsOpen(!mobileResultsOpen)
          }}
        >
          {mobileResultsOpen
            ? 'Return to reading'
            : `Browse & filter controls (${results.length})`}
          {mobileResultsOpen ? (
            <ChevronUp size={18} aria-hidden="true" />
          ) : (
            <ChevronDown size={18} aria-hidden="true" />
          )}
        </button>
      )}
      {onBoard && toolbar}
      {onBoard && levelPaths}
      <div id="control-results-body" className="results-body">
        <div className="filter-title">
          <SlidersHorizontal size={15} aria-hidden="true" />
          <span>Refine your view</span>
        </div>
        <label className="filter-field">
          Control family
          {familySelect}
        </label>
        {levels.length > 0 && (
          <label className="filter-field">
            Level
            {levelSelect}
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
          onSelect={selectControl}
        />
        <p className="sidebar-note">
          <Info size={15} aria-hidden="true" />
          {collection === 'references'
            ? 'September 2024 CMMC v2.13 snapshot. Every control has three teaching perspectives.'
            : 'Original demo lesson. Choose a level above or Controls & sources to explore all 149 controls.'}
        </p>
      </div>
    </aside>
  )
  const reading = (
    <Fragment key="reading">
      {selected?.contentKind === 'educational-example' &&
      explanation &&
      resolution?.kind === 'lesson' ? (
        <article className="control-detail" aria-labelledby="control-title">
          <button
            type="button"
            className="back-to-results inline-action"
            onClick={backToDiscovery}
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
            <span className="draft-tag">Simplified teaching example</span>
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
              <h2
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
              </h2>
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
            level={3}
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
            <h3>{explanation.heading}</h3>
            <p>{explanation.summary}</p>
            <div className="example-box">
              <span className="small-label">{explanation.exampleTitle}</span>
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
          <LearningPractice lesson={lessonIdentity(selected)} level={3} />
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
        resolution?.kind === 'lesson' &&
        ready ? (
        <Erase subject={lessonIdentityKey(lessonIdentity(selected))}>
          <ControlPage
            control={selected}
            mode={mode}
            tab={tab}
            onModeChange={(nextMode) =>
              dispatch({ type: 'change-mode', mode: nextMode })
            }
            onTabChange={(nextTab) =>
              dispatch({ type: 'set-tab', tab: nextTab })
            }
            tabUrl={(nextTab) =>
              window.location.pathname +
              serializeExplorerSearch({ ...ready, tab: nextTab })
            }
            framework={resolution.framework}
            edition={resolution.edition}
            shareUrl={createLessonUrl(
              lessonIdentity(selected),
              mode,
              new URL(window.location.href),
              tab,
            )}
            chalkUrl={createChalkUrl(
              lessonIdentity(selected),
              mode,
              new URL(window.location.href),
            )}
            excludedByFilters={resolution.excludedByFilters}
            onShowInResults={() => dispatch({ type: 'show-lesson-in-results' })}
            headingRef={(node) => {
              lessonHeading.current = node
              if (node && focusLesson.current) {
                focusLesson.current = false
                node.focus()
              }
            }}
            previous={neighbour(-1)}
            next={neighbour(1)}
            onNeighbour={(control, direction) => {
              // Keep focus on the pressed button while it still has somewhere
              // to go; move to the title only when it is about to disappear.
              const index = results.findIndex(
                (item) =>
                  lessonIdentityKey(lessonIdentity(item)) ===
                  lessonIdentityKey(lessonIdentity(control)),
              )
              focusLesson.current =
                direction === 'next' ? index + 1 >= results.length : index <= 0
              dispatch({
                type: 'select-lesson',
                identity: lessonIdentity(control),
              })
            }}
          />
        </Erase>
      ) : null}
    </Fragment>
  )

  const notices = (
    <>
      {controller.historyStatus === 'failed' && (
        <p className="explorer-notice" role="alert">
          Your browser couldn’t update the address. You can keep exploring, but
          refresh and Back may not preserve these changes.
        </p>
      )}
      {parsed.kind === 'ready' && parsed.notices.length > 0 && (
        <p className="explorer-notice" role="status">
          {parsed.notices.includes('chalk-reset') &&
            'That chalk is not in the tray; showing the white one. '}
          {parsed.notices.includes('mode-reset') &&
            `That learning mode is unavailable; showing the ${chalkFor(mode).color} chalk. `}
          {parsed.notices.includes('family-reset') &&
            'That family filter is unavailable and was cleared. '}
          {parsed.notices.includes('level-reset') &&
            'That level filter is unavailable and was cleared. '}
          {parsed.notices.includes('tab-reset') &&
            'That view is unavailable; showing Decode.'}
        </p>
      )}
    </>
  )

  // The Controls page: the find row, then the fourteen families beside the
  // results, so nothing is left blank. The project's demo lesson, which keeps
  // its older reader, opens in the same frame beside the results, so the find
  // row never remounts while a visitor types.
  if (!onBoard) {
    const showFamilies =
      !selected && collection === 'references' && filters.catalog === 'cmmc'
    const noun = collection === 'references' ? 'references' : 'examples'
    return (
      <section
        id="explorer"
        className={`section-shell explorer-section is-discovery ${selected ? 'is-reading' : ''}`}
        aria-label="Control Explorer"
      >
        {notices}
        <div className="discover">
          <div className="discover-head">
            <h1 className="chalk">Controls</h1>
            <p className="discover-lead">
              The {referenceControls.length} CMMC controls, quoted and cited.
              Pick a family, a level, or search.
            </p>
          </div>
          <div id="explorer-toolbar" className="discover-find">
            <label className="discover-search">
              <span className="sr-only">Search controls</span>
              <span className="discover-search-line">
                {searchInputElement}
                <Search size={22} aria-hidden="true" />
              </span>
              <svg
                className="discover-underline chalk"
                viewBox="0 0 520 10"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M2 6c90-3 180-2 270-1s180 1 246-2" />
              </svg>
            </label>
            <label className="line-select discover-field discover-field-wide">
              Control family
              {familySelect}
            </label>
            {levels.length > 0 && (
              <label className="line-select discover-field">
                Level
                {levelSelect}
              </label>
            )}
            <label className="line-select discover-field discover-field-wide">
              Content collection
              {collectionSelect}
            </label>
            <label className="line-select discover-field">
              Framework
              {frameworkSelect}
            </label>
          </div>
          <div className={`discover-body ${selected ? 'is-reading' : ''}`}>
            {showFamilies && (
              <nav className="discover-families" aria-label="Control families">
                <h2 className="hand">Families</h2>
                <div className="family-rows">
                  <a
                    className="family"
                    href={familyUrl('', mode)}
                    aria-current={filters.family ? undefined : 'true'}
                    onClick={(event) => {
                      if (!plainClick(event)) return
                      event.preventDefault()
                      dispatch({ type: 'set-family', family: '' })
                    }}
                  >
                    <span className="family-code mono" aria-hidden="true">
                      —
                    </span>
                    All families
                    <span className="family-count mono">
                      {referenceControls.length}
                    </span>
                  </a>
                  {catalogFamilies.map((family) => (
                    <a
                      key={family.code}
                      className="family"
                      href={familyUrl(family.code, mode)}
                      aria-current={
                        filters.family === family.code ? 'true' : undefined
                      }
                      onClick={(event) => {
                        if (!plainClick(event)) return
                        event.preventDefault()
                        dispatch({ type: 'set-family', family: family.code })
                      }}
                    >
                      <span className="family-code mono">{family.code}</span>
                      {family.name}
                      <span className="family-count mono">{family.count}</span>
                    </a>
                  ))}
                </div>
              </nav>
            )}
            <div className="discover-results">
              <div className="discover-results-head">
                <div
                  className="result-count"
                  role="status"
                  aria-label="Control search results"
                >
                  {results.length}{' '}
                  {results.length === 1 ? noun.slice(0, -1) : noun} found
                </div>
                {levels.length > 0 && (
                  <CmmcLevels
                    mode={mode}
                    active={filters.level}
                    onPick={(level) => dispatch({ type: 'set-level', level })}
                  />
                )}
              </div>
              {unavailable || planned ? (
                <div className="empty-state">
                  <h2>
                    {parsed.kind === 'invalid'
                      ? 'This lesson link is invalid.'
                      : resolution?.kind === 'not-found'
                        ? 'This lesson isn’t available here.'
                        : `${planned?.shortName} is on the roadmap.`}
                  </h2>
                  <p>
                    {planned
                      ? 'This framework has no published content here yet. Browse the available examples instead.'
                      : 'This address doesn’t identify an available lesson. Browse the examples to choose where to begin.'}
                  </p>
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={recover}
                  >
                    {planned ? 'Browse available examples' : 'Browse examples'}
                  </button>
                </div>
              ) : results.length ? (
                <ControlResults
                  key={results
                    .map((control) =>
                      lessonIdentityKey(lessonIdentity(control)),
                    )
                    .join('|')}
                  results={results}
                  selectedKey={selectedKey}
                  onSelect={selectControl}
                />
              ) : (
                <div className="empty-state">
                  <h2>
                    {collection === 'references'
                      ? 'No matching references.'
                      : 'No matching examples.'}
                  </h2>
                  <p>
                    {collection === 'references'
                      ? 'Try a control identifier, topic, family or level in the September 2024 source snapshot.'
                      : 'Try “access”, “authorized”, or “AC.L2-3.1.1”. This collection contains one example.'}
                  </p>
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
            {selected && reading}
          </div>
        </div>
      </section>
    )
  }

  // A control on the board: its page, then the browse line under it.
  return (
    <section
      id="explorer"
      className="section-shell explorer-section is-board"
      aria-label="Control Explorer"
    >
      {notices}
      <div
        className={`explorer-shell is-reading ${mobileResultsOpen ? 'is-browsing' : ''}`}
      >
        <div className="explorer-body">
          {reading}
          {sidebar}
        </div>
      </div>
    </section>
  )
}
