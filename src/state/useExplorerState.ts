import { useMemo, useSyncExternalStore } from 'react'
import {
  explorerResults,
  parseExplorerSearch,
  resolveLesson,
  addressNamesChalk,
  serializeExplorerSearch,
  transitionExplorerState,
} from './explorer-state'
import type {
  ExplorerCatalog,
  ExplorerIntent,
  LessonResolution,
  ParsedExplorerState,
} from './explorer-state'
import type { CatalogControl, Framework } from '../types/content'
import { trackUsage } from '../analytics/usage'
import { readChalkPreference } from './chalk-preference'
import { announceAddress } from './address'
import { isInkFragment } from '../components/board/ink'

function trackIntent(intent: ExplorerIntent, parsed: ParsedExplorerState) {
  if (parsed.kind !== 'ready') return
  const state = parsed.state
  if (intent.type === 'select-lesson' || intent.type === 'open-example') {
    if (state.view === 'lesson')
      trackUsage({ name: 'control_open', lesson: state.lesson })
  } else if (intent.type === 'change-mode' || intent.type === 'pick-chalk') {
    if (state.view === 'lesson')
      trackUsage({
        name: 'perspective_change',
        lesson: state.lesson,
        mode: state.mode,
      })
  } else if (intent.type === 'set-catalog') {
    trackUsage({
      name: 'filter_change',
      filter: 'framework',
      value: state.filters.catalog,
    })
  } else if (intent.type === 'set-family') {
    trackUsage({
      name: 'filter_change',
      filter: 'family',
      value: state.filters.family || 'all',
    })
  } else if (intent.type === 'set-level') {
    trackUsage({
      name: 'filter_change',
      filter: 'level',
      value: state.filters.level || 'all',
    })
  } else if (intent.type === 'set-collection') {
    trackUsage({
      name: 'filter_change',
      filter: 'collection',
      value: state.filters.collection ?? 'lessons',
    })
  } else if (intent.type === 'clear-filters') {
    trackUsage({ name: 'filter_change', filter: 'clear' })
  }
}

export interface ExplorerController {
  readonly parsed: ParsedExplorerState
  readonly resolution: LessonResolution | null
  readonly results: readonly CatalogControl[]
  readonly catalogFramework: Framework | undefined
  readonly historyStatus: 'ok' | 'failed'
  readonly dispatch: (intent: ExplorerIntent) => void
}

interface BrowserSnapshot {
  readonly parsed: ParsedExplorerState
  readonly historyStatus: 'ok' | 'failed'
}

/**
 * dispatch -> pure transition -> guarded history write -> publish one snapshot
 * popstate -> whole-address parse -> optional canonical replace -> publish
 * Neither React rendering nor an updater function writes browser history.
 */
/** The address, read with the chalk the visitor picked on Home as the default. */
function parseAddress(catalog: ExplorerCatalog) {
  return parseExplorerSearch(window.location.search, catalog, {
    defaultMode: readChalkPreference() ?? undefined,
  })
}

function createExplorerStore(catalog: ExplorerCatalog) {
  let snapshot: BrowserSnapshot = {
    parsed: parseAddress(catalog),
    historyStatus: 'ok',
  }
  let normalizationAttempt: string | null = null
  const listeners = new Set<() => void>()

  function publish(next: BrowserSnapshot) {
    snapshot = next
    listeners.forEach((listener) => listener())
  }

  function writeAddress(
    parsed: ParsedExplorerState,
    history: 'push' | 'replace',
    fragment?: 'explorer',
  ): 'ok' | 'failed' {
    if (parsed.kind !== 'ready') return snapshot.historyStatus
    const url = new URL(window.location.href)
    url.search = serializeExplorerSearch(parsed.state)
    // Chalk marks belong to the page they were drawn on: a new address
    // starts without them, and the marks write their own fragment after. A
    // replace keeps the same page, and its marks.
    if (fragment) url.hash = fragment
    else if (history === 'push' && isInkFragment(url.hash)) url.hash = ''
    try {
      if (history === 'push') window.history.pushState(null, '', url)
      // The same entry keeps its state: the chalk marks' own marker lives there.
      else window.history.replaceState(window.history.state, '', url)
    } catch {
      return 'failed'
    }
    announceAddress()
    return 'ok'
  }

  function normalize(next: BrowserSnapshot): BrowserSnapshot {
    if (next.parsed.kind !== 'ready') return next
    // A chalk in the address is read once and never written back.
    if (
      !next.parsed.notices.length &&
      !addressNamesChalk(window.location.search)
    )
      return next
    const canonical = serializeExplorerSearch(next.parsed.state)
    if (
      canonical === window.location.search ||
      normalizationAttempt === window.location.href
    )
      return next
    normalizationAttempt = window.location.href
    return { ...next, historyStatus: writeAddress(next.parsed, 'replace') }
  }

  function onPopState() {
    normalizationAttempt = null
    publish(
      normalize({
        parsed: parseAddress(catalog),
        historyStatus: 'ok',
      }),
    )
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      if (listeners.size === 1) {
        window.addEventListener('popstate', onPopState)
        const normalized = normalize(snapshot)
        if (normalized !== snapshot) publish(normalized)
      }
      return () => {
        listeners.delete(listener)
        if (!listeners.size) window.removeEventListener('popstate', onPopState)
      }
    },
    dispatch(intent: ExplorerIntent) {
      const transition = transitionExplorerState(
        snapshot.parsed,
        intent,
        catalog,
      )
      // A same-lesson homepage anchor may still need its one fragment navigation.
      const history =
        transition.history === 'none' &&
        transition.fragment &&
        window.location.hash !== `#${transition.fragment}`
          ? 'push'
          : transition.history
      if (history === 'none') return
      const historyStatus = writeAddress(
        transition.parsed,
        history,
        transition.fragment,
      )
      trackIntent(intent, transition.parsed)
      publish({ parsed: transition.parsed, historyStatus })
    },
  }
}

/** Mount once in App; browser state and the reading state then share one owner. */
export function useExplorerState(catalog: ExplorerCatalog): ExplorerController {
  const store = useMemo(() => createExplorerStore(catalog), [catalog])
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const state = snapshot.parsed.kind === 'ready' ? snapshot.parsed.state : null
  const results = state ? explorerResults(state, catalog) : []
  return {
    ...snapshot,
    resolution:
      state?.view === 'lesson'
        ? resolveLesson(state.lesson, state.filters, catalog)
        : null,
    results,
    catalogFramework: catalog.frameworks.find(
      (framework) => framework.id === state?.filters.catalog,
    ),
    dispatch: store.dispatch,
  }
}
