import { StrictMode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { explorerCatalog } from '../data/content'
import { useExplorerState } from './useExplorerState'

const lessonSearch =
  '?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  vi.restoreAllMocks()
  window.history.replaceState(null, '', '/')
})

describe('useExplorerState browser controller', () => {
  it('starts read-only and keeps one live listener through StrictMode cleanup', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const { result, unmount } = renderHook(
      () => useExplorerState(explorerCatalog),
      { wrapper: StrictMode },
    )
    expect(result.current.resolution?.kind).toBe('lesson')
    expect(result.current.parsed).toMatchObject({
      kind: 'ready',
      state: { view: 'lesson', mode: 'beginner' },
    })
    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
    const additions = () =>
      add.mock.calls.filter(([type]) => type === 'popstate').length
    const removals = () =>
      remove.mock.calls.filter(([type]) => type === 'popstate').length
    expect(additions() - removals()).toBe(1)
    unmount()
    expect(additions() - removals()).toBe(0)
  })

  it('normalizes bad mode and constraints once while preserving notice and fragment', () => {
    window.history.replaceState(
      null,
      '',
      `${lessonSearch}&mode=wizard&family=unknown#mission`,
    )
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')
    const { result } = renderHook(() => useExplorerState(explorerCatalog), {
      wrapper: StrictMode,
    })
    expect(result.current.parsed).toMatchObject({
      kind: 'ready',
      notices: ['mode-reset', 'family-reset'],
      state: { mode: 'beginner', filters: { family: '' } },
    })
    expect(replace).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
    expect(window.location.search).toContain('mode=beginner')
    expect(window.location.search).not.toContain('family=')
    expect(window.location.hash).toBe('#mission')
  })

  it('preserves malformed addresses until a named recovery and focuses no default lesson', () => {
    window.history.replaceState(
      null,
      '',
      '?view=lesson&framework=cmmc#explorer',
    )
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')
    const { result } = renderHook(() => useExplorerState(explorerCatalog))
    expect(result.current.parsed).toEqual({
      kind: 'invalid',
      reason: 'incomplete-identity',
    })
    expect(result.current.resolution).toBeNull()
    expect(result.current.results).toHaveLength(0)
    act(() => result.current.dispatch({ type: 'set-query', query: 'access' }))
    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
    expect(window.location.search).toBe('?view=lesson&framework=cmmc')
    act(() => result.current.dispatch({ type: 'recover-discovery' }))
    expect(result.current.parsed).toMatchObject({
      kind: 'ready',
      state: { view: 'discover', mode: 'beginner', filters: { query: '' } },
    })
    expect(result.current.resolution).toBeNull()
    expect(result.current.results).toHaveLength(1)
    expect(push).toHaveBeenCalledTimes(1)
    expect(window.location.search).not.toContain('control=')
  })

  it('transacts consecutive actions with current state and chooses push versus replace', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')
    const { result } = renderHook(() => useExplorerState(explorerCatalog))
    act(() => {
      result.current.dispatch({ type: 'set-query', query: 'access' })
      result.current.dispatch({ type: 'change-mode', mode: 'compliance' })
    })
    expect(result.current.parsed).toMatchObject({
      kind: 'ready',
      state: {
        view: 'lesson',
        mode: 'compliance',
        filters: { query: 'access' },
      },
    })
    expect(new URLSearchParams(window.location.search).get('q')).toBe('access')
    expect(new URLSearchParams(window.location.search).get('mode')).toBe(
      'compliance',
    )
    expect(replace).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledTimes(1)
    act(() =>
      result.current.dispatch({ type: 'change-mode', mode: 'compliance' }),
    )
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('keeps explicit discovery without a selection when clearing and remounting', () => {
    const { result, unmount } = renderHook(() =>
      useExplorerState(explorerCatalog),
    )
    act(() => {
      result.current.dispatch({
        type: 'set-query',
        query: 'nothing matches here',
      })
      result.current.dispatch({ type: 'clear-filters' })
    })
    expect(result.current.parsed).toMatchObject({
      kind: 'ready',
      state: {
        view: 'discover',
        filters: { query: '', family: '', level: '' },
      },
    })
    expect(result.current.resolution).toBeNull()
    expect(result.current.results).toHaveLength(149)
    unmount()
    const restored = renderHook(() => useExplorerState(explorerCatalog))
    expect(restored.result.current.parsed).toMatchObject({
      kind: 'ready',
      state: { view: 'discover' },
    })
    expect(restored.result.current.resolution).toBeNull()
  })

  it('replays the complete address without stale filters, substitutions or another push', () => {
    const { result } = renderHook(() => useExplorerState(explorerCatalog))
    act(() =>
      result.current.dispatch({ type: 'set-query', query: 'no matches' }),
    )
    window.history.replaceState(
      null,
      '',
      `${lessonSearch}&mode=it-cyber&q=excluded`,
    )
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')
    act(() => window.dispatchEvent(new PopStateEvent('popstate')))
    expect(result.current.parsed).toMatchObject({
      kind: 'ready',
      state: {
        view: 'lesson',
        mode: 'it-cyber',
        filters: { query: 'excluded' },
      },
    })
    expect(result.current.results).toHaveLength(0)
    expect(result.current.resolution).toMatchObject({
      kind: 'lesson',
      control: { key: 'authorized-access' },
      excludedByFilters: true,
    })
    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
    act(() => result.current.dispatch({ type: 'show-lesson-in-results' }))
    expect(result.current.resolution).toMatchObject({
      kind: 'lesson',
      excludedByFilters: false,
    })
    expect(result.current.results).toHaveLength(1)
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('restores planned catalogs and unknown lesson identities exactly', () => {
    const { result } = renderHook(() => useExplorerState(explorerCatalog))
    act(() => {
      window.history.replaceState(
        null,
        '',
        '?view=discover&catalog=fedramp&mode=compliance',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current.catalogFramework).toMatchObject({
      id: 'fedramp',
      status: 'planned',
    })
    expect(result.current.results).toHaveLength(0)
    expect(result.current.resolution).toBeNull()
    act(() => {
      window.history.replaceState(
        null,
        '',
        '?view=lesson&framework=unknown&edition=unknown&control=unknown',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current.resolution).toMatchObject({
      kind: 'not-found',
      identity: { frameworkId: 'unknown' },
    })
    expect(result.current.catalogFramework).toBeUndefined()
  })

  it('preserves usable session state when history is denied and recovers after a successful write', () => {
    const push = vi
      .spyOn(window.history, 'pushState')
      .mockImplementation(() => {
        throw new DOMException('denied', 'SecurityError')
      })
    const { result } = renderHook(() => useExplorerState(explorerCatalog))
    act(() =>
      result.current.dispatch({ type: 'change-mode', mode: 'compliance' }),
    )
    expect(push).toHaveBeenCalledTimes(1)
    expect(result.current.parsed).toMatchObject({
      kind: 'ready',
      state: { mode: 'compliance' },
    })
    expect(result.current.historyStatus).toBe('failed')
    expect(window.location.search).toBe('')
    act(() => result.current.dispatch({ type: 'set-query', query: 'access' }))
    expect(result.current.historyStatus).toBe('ok')
    expect(new URLSearchParams(window.location.search).get('mode')).toBe(
      'compliance',
    )
    expect(new URLSearchParams(window.location.search).get('q')).toBe('access')
  })

  it('reports denied initial normalization without retrying in StrictMode', () => {
    window.history.replaceState(null, '', `${lessonSearch}&mode=unsupported`)
    const replace = vi
      .spyOn(window.history, 'replaceState')
      .mockImplementation(() => {
        throw new DOMException('denied', 'SecurityError')
      })
    const { result } = renderHook(() => useExplorerState(explorerCatalog), {
      wrapper: StrictMode,
    })
    expect(result.current.historyStatus).toBe('failed')
    expect(result.current.parsed).toMatchObject({
      kind: 'ready',
      notices: ['mode-reset'],
      state: { mode: 'beginner' },
    })
    expect(replace).toHaveBeenCalledTimes(1)
    expect(window.location.search).toContain('mode=unsupported')
  })

  it('creates one sample navigation entry including its fragment and no discovery query', () => {
    window.history.replaceState(
      null,
      '',
      '?view=discover&catalog=fedramp&q=old#mission',
    )
    const push = vi.spyOn(window.history, 'pushState')
    const { result } = renderHook(() => useExplorerState(explorerCatalog))
    act(() =>
      result.current.dispatch({ type: 'open-example', mode: 'it-cyber' }),
    )
    expect(push).toHaveBeenCalledTimes(1)
    expect(window.location.hash).toBe('#explorer')
    expect(window.location.search).not.toContain('q=')
    expect(result.current.resolution).toMatchObject({
      kind: 'lesson',
      control: { key: 'ac-l1-b-1-i' },
    })
    act(() =>
      result.current.dispatch({ type: 'open-example', mode: 'it-cyber' }),
    )
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('permits a same-lesson homepage action to add only the missing fragment', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const { result } = renderHook(() => useExplorerState(explorerCatalog))
    act(() =>
      result.current.dispatch({ type: 'open-example', mode: 'beginner' }),
    )
    expect(push).toHaveBeenCalledTimes(1)
    expect(window.location.hash).toBe('#explorer')
    act(() =>
      result.current.dispatch({ type: 'open-example', mode: 'beginner' }),
    )
    expect(push).toHaveBeenCalledTimes(1)
  })
})
