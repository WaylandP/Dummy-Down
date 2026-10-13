import { useMemo, useSyncExternalStore } from 'react'
import {
  explorerResults,
  parseExplorerSearch,
  resolveLesson,
  serializeExplorerSearch,
  transitionExplorerState,
} from './explorer-state'
import type {
  ExplorerCatalog,
  ExplorerIntent,
  LessonResolution,
  ParsedExplorerState,
} from './explorer-state'
import type { Control, Framework } from '../types/content'

export interface ExplorerController {
  readonly parsed: ParsedExplorerState
  readonly resolution: LessonResolution | null
  readonly results: readonly Control[]
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
function createExplorerStore(catalog: ExplorerCatalog) {
  let snapshot: BrowserSnapshot = {
    parsed: parseExplorerSearch(window.location.search, catalog),
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
    if (fragment) url.hash = fragment
    try {
      if (history === 'push') window.history.pushState(null, '', url)
      else window.history.replaceState(null, '', url)
      return 'ok'
    } catch {
      return 'failed'
    }
  }

  function normalize(next: BrowserSnapshot): BrowserSnapshot {
    if (next.parsed.kind !== 'ready' || !next.parsed.notices.length) return next
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
        parsed: parseExplorerSearch(window.location.search, catalog),
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
