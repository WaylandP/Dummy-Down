import { useState, type Ref } from 'react'
import { explorerCatalog } from '../../data/content'
import { filterControls } from '../../data/control-search'
import {
  createLessonUrl,
  lessonIdentity,
  lessonIdentityKey,
  serializeExplorerSearch,
  type ExplorerIntent,
  type ValidExplorerState,
} from '../../state/explorer-state'
import type { CatalogControl } from '../../types/content'
import { families, familyUrl, plainClick, railFamilyName } from '../families'

export interface ControlRailProps {
  readonly state: ValidExplorerState
  readonly selected?: CatalogControl
  readonly dispatch: (intent: ExplorerIntent) => void
  /** A control was picked from the rail. */
  readonly onSelect: (control: CatalogControl) => void
  /** Anything was picked: a sheet closes. */
  readonly onPick?: () => void
  readonly searchRef?: Ref<HTMLInputElement>
  /** The explorer's search usage: counts only, never what was typed. */
  readonly searchUsage?: {
    readonly edited: (value: string) => void
    readonly report: (query: string, resultCount: number) => void
  }
  readonly resultCount?: number
}

const levelChoices = [
  ['', 'All'],
  ['Level 1', '1'],
  ['Level 2', '2'],
  ['Level 3', '3'],
] as const
/** A family shows this many controls before "n more". */
const shortList = 5

function lessonUrl(control: CatalogControl, state: ValidExplorerState) {
  return createLessonUrl(
    lessonIdentity(control),
    state.mode,
    new URL('/learn', window.location.origin),
  ).replace(window.location.origin, '')
}

/**
 * The rail of every control, beside the control on screen: a find line that
 * filters it, the level switch, and the fourteen families with their counts,
 * the open one listing its controls. Every count comes from the catalog.
 */
export function ControlRail({
  state,
  selected,
  dispatch,
  onSelect,
  onPick,
  searchRef,
  searchUsage,
  resultCount = 0,
}: ControlRailProps) {
  const { filters, mode } = state
  // "n more" opens a long family in full; the current control always shows.
  const [opened, setOpened] = useState<string | null>(null)
  // Beside a control a family row opens in place, so the control stays on the
  // board; the choice is kept for that control and forgotten with it.
  const [toggled, setToggled] = useState<{
    readonly beside: string
    readonly family: string
  } | null>(null)
  const selectedKey = selected
    ? lessonIdentityKey(lessonIdentity(selected))
    : null
  const references = explorerCatalog.controls.filter(
    (control) =>
      control.contentKind === 'official-reference' &&
      control.frameworkId === 'cmmc',
  )
  // The rail ignores the family filter: it is the family navigator.
  const listed = filterControls(references, {
    frameworkId: 'cmmc',
    query: filters.query,
    family: '',
    level: filters.level,
  })
  // Typing opens every family that still matches, so the rail is the answer.
  const searching = filters.query.trim().length > 0
  const reading = selected?.contentKind === 'official-reference'
  const openFamily = reading
    ? toggled && toggled.beside === selectedKey
      ? toggled.family
      : selected.family
    : filters.family

  const levelHref = (level: string) =>
    window.location.pathname +
    serializeExplorerSearch({ ...state, filters: { ...filters, level } })

  return (
    <nav className="rail" aria-label="All controls">
      <form
        className="rail-find"
        role="search"
        aria-label="Find in the controls"
        onSubmit={(event) => event.preventDefault()}
      >
        <label htmlFor="control-search" className="sr-only">
          Find controls
        </label>
        <span className="rail-find-line">
          <input
            ref={searchRef}
            id="control-search"
            type="search"
            value={filters.query}
            placeholder="Find: 3.1.1, MFA, media…"
            autoComplete="off"
            onChange={(event) => {
              searchUsage?.edited(event.target.value)
              dispatch({ type: 'set-query', query: event.target.value })
            }}
            onBlur={() => searchUsage?.report(filters.query, resultCount)}
            onKeyDown={(event) => {
              if (event.key === 'Enter')
                searchUsage?.report(filters.query, resultCount)
            }}
          />
          <svg
            width="22"
            height="22"
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
        </span>
        <svg
          className="rail-underline chalk"
          viewBox="0 0 266 8"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M2 5c88-3 177-1 262-2" />
        </svg>
      </form>

      <div className="rail-levels" role="group" aria-label="Level">
        <span className="rail-levels-label">Level</span>
        {levelChoices.map(([level, label]) => (
          <a
            key={label}
            href={levelHref(level)}
            aria-current={filters.level === level ? 'true' : undefined}
            onClick={(event) => {
              if (!plainClick(event)) return
              event.preventDefault()
              dispatch({ type: 'set-level', level })
            }}
          >
            {label}
            <svg
              className="rail-stroke chalk"
              viewBox="0 0 22 5"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M1 3c7-2 14 0 20-1" />
            </svg>
          </a>
        ))}
      </div>

      <div className="rail-list">
        <ul className="rail-families">
          {families.map((family) => {
            const members = listed.filter(
              (control) => control.family === family.code,
            )
            if (searching && members.length === 0) return null
            const open = searching
              ? members.length > 0
              : openFamily === family.code
            const currentIndex = members.findIndex(
              (control) =>
                lessonIdentityKey(lessonIdentity(control)) === selectedKey,
            )
            const full =
              opened === family.code ||
              currentIndex >= shortList ||
              members.length <= shortList + 1
            const shown = full ? members : members.slice(0, shortList)
            return (
              <li key={family.code}>
                <a
                  className="rail-family"
                  href={familyUrl(family.code, mode)}
                  aria-current={
                    filters.family === family.code ? 'true' : undefined
                  }
                  aria-expanded={open}
                  onClick={(event) => {
                    if (!plainClick(event)) return
                    event.preventDefault()
                    const family_ = open ? '' : family.code
                    if (reading && selectedKey)
                      setToggled({ beside: selectedKey, family: family_ })
                    else dispatch({ type: 'set-family', family: family_ })
                  }}
                >
                  <span className="rail-caret" aria-hidden="true">
                    {open ? '▾' : '▸'}
                  </span>
                  <span className="rail-family-code mono">{family.code}</span>{' '}
                  <span className="rail-family-name">
                    {railFamilyName(family)}
                  </span>{' '}
                  <span className="rail-family-count mono">
                    {members.length}
                  </span>
                </a>
                {open && (
                  <ul className="rail-controls">
                    {shown.map((control) => {
                      const key = lessonIdentityKey(lessonIdentity(control))
                      return (
                        <li key={key}>
                          <a
                            className="rail-control"
                            href={lessonUrl(control, state)}
                            aria-current={
                              key === selectedKey ? 'page' : undefined
                            }
                            onClick={(event) => {
                              if (!plainClick(event)) return
                              event.preventDefault()
                              onSelect(control)
                              onPick?.()
                            }}
                          >
                            <span className="rail-control-id mono">
                              {control.id}
                            </span>{' '}
                            <span className="rail-control-title">
                              {control.title}
                            </span>
                          </a>
                        </li>
                      )
                    })}
                    {!full && (
                      <li>
                        <button
                          type="button"
                          className="rail-more"
                          onClick={() => setOpened(family.code)}
                        >
                          {members.length - shown.length} more in{' '}
                          {railFamilyName(family)}
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
