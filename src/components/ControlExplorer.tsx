import { useLayoutEffect, useRef } from 'react'
import { explorerCatalog, referenceControls } from '../data/content'
import {
  createChalkUrl,
  createLessonUrl,
  lessonIdentity,
  lessonIdentityKey,
  serializeExplorerSearch,
  type ControlTab,
} from '../state/explorer-state'
import type { ExplorerController } from '../state/useExplorerState'
import type { CatalogControl } from '../types/content'
import { ControlResults } from './ControlResults'
import { ControlPage } from './control/ControlPage'
import { useSearchUsage } from '../analytics/useSearchUsage'
import { useDoodleHash } from './board/doodle-state'
import { CmmcLevels } from './CmmcLevels'
import { ControlRail } from './controls/ControlRail'
import { RailSheet } from './controls/RailSheet'
import { useDesktop } from './controls/useDesktop'
import { families as catalogFamilies, familyUrl, plainClick } from './families'
import { chalkFor } from './board/chalks'
import { browseUrl } from './board/SiteHeader'
import { readChalkPreference } from '../state/chalk-preference'

interface ControlExplorerProps {
  controller: ExplorerController
}

export function ControlExplorer({ controller }: ControlExplorerProps) {
  const desktop = useDesktop()
  const searchInput = useRef<HTMLInputElement>(null)
  const searchUsage = useSearchUsage('explorer')
  // Copy link and Send this chalk carry the chalk marks on this page, if any.
  const inkHash = useDoodleHash()
  const withMarks = (href: string) => {
    if (!inkHash) return href
    const url = new URL(href)
    url.hash = inkHash.slice(1)
    return url.href
  }
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
  // The Board's control screen, whenever a control is on the board.
  const onBoard =
    selected !== undefined && resolution?.kind === 'lesson' && ready !== null
  const levels = [
    ...new Set(
      explorerCatalog.controls.flatMap((control) =>
        control.contentKind === 'official-reference' &&
        control.frameworkId === filters.catalog &&
        control.level
          ? [control.level]
          : [],
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

  function selectControl(control: CatalogControl) {
    const key = lessonIdentityKey(lessonIdentity(control))
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

  const reading = selected && resolution?.kind === 'lesson' && ready && (
    <ControlPage
      control={selected}
      mode={mode}
      tab={tab}
      onModeChange={(nextMode) =>
        dispatch({ type: 'change-mode', mode: nextMode })
      }
      onTabChange={(nextTab) => dispatch({ type: 'set-tab', tab: nextTab })}
      tabUrl={(nextTab) =>
        window.location.pathname +
        serializeExplorerSearch({ ...ready, tab: nextTab })
      }
      framework={resolution.framework}
      edition={resolution.edition}
      shareUrl={withMarks(
        createLessonUrl(
          lessonIdentity(selected),
          mode,
          new URL(window.location.href),
          tab,
        ),
      )}
      chalkUrl={withMarks(
        createChalkUrl(
          lessonIdentity(selected),
          mode,
          new URL(window.location.href),
        ),
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

  // The rail of every control: a column at desktop widths, a sheet below them.
  const rail =
    ready &&
    (desktop ? (
      <ControlRail
        state={ready}
        selected={selected}
        dispatch={dispatch}
        onSelect={selectControl}
        searchRef={searchInput}
        searchUsage={searchUsage}
        resultCount={results.length}
      />
    ) : (
      <RailSheet
        state={ready}
        selected={selected}
        dispatch={dispatch}
        onSelect={selectControl}
        searchRef={searchInput}
        searchUsage={searchUsage}
        resultCount={results.length}
      />
    ))

  // An address that opens nothing has no results to count; it says so instead.
  const trouble = unavailable || planned
  // With no control on the board: the overview, the results for the filters
  // in force, with the fourteen families beside them where the rail is not on
  // screen (below desktop widths it waits in its sheet).
  const showFamilies =
    !desktop && !selected && !trouble && filters.catalog === 'cmmc'
  const allControls = (
    <a
      className="button"
      href={browseUrl}
      onClick={(event) => {
        if (!plainClick(event)) return
        event.preventDefault()
        recover()
      }}
    >
      All controls
    </a>
  )
  const overview = (
    <div className="discover">
      <div className="discover-head">
        <h1 className="chalk">Controls</h1>
        <p className="discover-lead">
          The {referenceControls.length} CMMC controls, quoted and cited. Pick a
          family, a level, or search.
        </p>
      </div>
      <div className="discover-body">
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
            {!trouble && (
              <div
                className="result-count"
                role="status"
                aria-label="Control search results"
              >
                {results.length} {results.length === 1 ? 'control' : 'controls'}
              </div>
            )}
            {levels.length > 0 && (
              <CmmcLevels
                mode={mode}
                active={filters.level}
                onPick={(level) => dispatch({ type: 'set-level', level })}
              />
            )}
          </div>
          {trouble ? (
            <div className="empty-state">
              <h2>
                {planned
                  ? `${planned.shortName} is on the roadmap.`
                  : 'That control isn’t on the board.'}
              </h2>
              <p>
                {planned
                  ? 'This framework has no content here yet.'
                  : 'The address names a control that isn’t here.'}
              </p>
              {allControls}
            </div>
          ) : results.length ? (
            <ControlResults
              key={results
                .map((control) => lessonIdentityKey(lessonIdentity(control)))
                .join('|')}
              results={results}
              selectedKey={selectedKey}
              onSelect={selectControl}
            />
          ) : (
            <div className="empty-state">
              <h2>No controls match.</h2>
              <p>Try a control ID, a topic, a family or a level.</p>
              <button className="button" type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <section
      id="explorer"
      className={`section-shell explorer-section has-rail ${onBoard ? 'is-board' : 'is-discovery'}`}
      aria-label="Control Explorer"
    >
      {notices}
      <div className={`controls-layout ${rail ? '' : 'is-railless'}`}>
        {rail}
        <div className="controls-main" data-scroller="">
          {onBoard ? reading : overview}
        </div>
      </div>
    </section>
  )
}
