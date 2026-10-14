import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StudyHome } from './StudyHome'
import { explorerCatalog, defaultLesson } from '../data/content'
import { findLearningActivity } from '../data/learning'
import {
  explorerResults,
  parseExplorerSearch,
  resolveLesson,
} from '../state/explorer-state'
import { trackUsage } from '../analytics/usage'

vi.mock('../analytics/usage', () => ({ trackUsage: vi.fn() }))

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  vi.mocked(trackUsage).mockClear()
})

/** Check the native form's address contract; real browser QA follows the request. */
function formDestination(form: HTMLFormElement) {
  const destination = new URL(form.action)
  const params = new URLSearchParams()
  new FormData(form).forEach((value, key) => params.append(key, String(value)))
  destination.search = params.toString()
  return destination
}

describe('Study desk entry points', () => {
  it.each([
    { query: '', count: 149 },
    { query: 'MP.L1-b.1.vii', count: 1 },
    { query: 'access & mode=compliance #source "quoted" + café', count: 0 },
  ])(
    'submits "$query" to reference discovery without leaking it to telemetry',
    ({ query, count }) => {
      render(<StudyHome />)
      const form = screen.getByRole('search', {
        name: 'Find a security control',
      }) as HTMLFormElement
      const search = within(form).getByRole('searchbox', {
        name: 'Search the control library',
      })
      expect(form).toHaveAttribute('action', '/learn')
      expect(form).toHaveAttribute('method', 'get')
      fireEvent.change(search, { target: { value: query } })
      expect(trackUsage).not.toHaveBeenCalled()

      const destination = formDestination(form)
      expect(destination.origin).toBe(window.location.origin)
      expect(destination.pathname).toBe('/learn')
      expect(destination.searchParams.getAll('q')).toEqual([query])
      expect(destination.searchParams.get('view')).toBe('discover')
      expect(destination.searchParams.get('collection')).toBe('references')
      expect(destination.searchParams.get('catalog')).toBe('cmmc')
      expect(destination.searchParams.has('control')).toBe(false)
      expect(destination.searchParams.has('mode')).toBe(false)
      expect(destination.hash).toBe('')

      const parsed = parseExplorerSearch(destination.search, explorerCatalog)
      expect(parsed.kind).toBe('ready')
      if (parsed.kind !== 'ready') throw new Error('Search address is invalid')
      expect(parsed.state.view).toBe('discover')
      expect(parsed.state.filters.query).toBe(query)
      expect(explorerResults(parsed.state, explorerCatalog)).toHaveLength(count)

      // jsdom cannot navigate native forms. Dispatch only the submit event here.
      fireEvent.submit(form)
      expect(trackUsage).toHaveBeenCalledExactlyOnceWith({
        name: 'search_used',
        scope: 'explorer',
        active: query.trim().length > 0,
        resultCount: count,
      })
      if (query)
        expect(JSON.stringify(vi.mocked(trackUsage).mock.calls)).not.toContain(
          query,
        )
    },
  )

  it.each([
    { title: 'Who and what can connect?', key: 'ac-l1-b-1-i' },
    { title: 'What belongs in public?', key: 'ac-l1-b-1-iv' },
    { title: 'Before a device leaves.', key: 'mp-l1-b-1-vii' },
  ])(
    'opens the actual practice-backed reference for "$title"',
    ({ title, key }) => {
      render(<StudyHome />)
      const heading = screen.getByRole('heading', { name: title })
      const link = heading.closest('a')
      expect(link).not.toBeNull()
      const destination = new URL(link!.href)
      expect(destination.origin).toBe(window.location.origin)
      expect(destination.pathname).toBe('/learn')
      expect(destination.hash).toBe('#explorer')
      const parsed = parseExplorerSearch(destination.search, explorerCatalog)
      expect(parsed.kind).toBe('ready')
      if (parsed.kind !== 'ready' || parsed.state.view !== 'lesson')
        throw new Error('Starting point did not identify a lesson')
      const identity = {
        frameworkId: 'cmmc',
        editionId: 'cmmc-2-13-sep-2024',
        controlKey: key,
      }
      expect(parsed.state.lesson).toEqual(identity)
      expect(parsed.state.mode).toBe('beginner')
      const resolution = resolveLesson(
        identity,
        parsed.state.filters,
        explorerCatalog,
      )
      expect(resolution.kind).toBe('lesson')
      if (resolution.kind !== 'lesson') throw new Error('Reference is missing')
      expect(resolution.control.contentKind).toBe('official-reference')
      expect(resolution.excludedByFilters).toBe(false)
      const activity = findLearningActivity(identity)
      expect(activity?.reviewStatus).toBe('draft')
      expect(activity?.questions).toHaveLength(3)
      expect(screen.getByText('Level 1 · Practice')).toBeVisible()
      expect(trackUsage).not.toHaveBeenCalled()
    },
  )

  it.each([
    { level: 'Level 1', count: 15 },
    { level: 'Level 2', count: 110 },
    { level: 'Level 3', count: 24 },
  ])('links $level to its $count source references', ({ level, count }) => {
    render(<StudyHome />)
    const levels = within(
      screen.getByRole('navigation', { name: 'Browse CMMC reference levels' }),
    )
    const link = levels.getByRole('link', {
      name: `${level} ${count} references`,
    }) as HTMLAnchorElement
    const destination = new URL(link.href)
    expect(destination.pathname).toBe('/learn')
    const parsed = parseExplorerSearch(destination.search, explorerCatalog)
    expect(parsed.kind).toBe('ready')
    if (parsed.kind !== 'ready') throw new Error('Level address is invalid')
    expect(parsed.state.view).toBe('discover')
    expect(parsed.state.filters).toMatchObject({
      catalog: 'cmmc',
      collection: 'references',
      level,
      query: '',
    })
    const results = explorerResults(parsed.state, explorerCatalog)
    expect(results).toHaveLength(count)
    expect(results.every((control) => control.level === level)).toBe(true)
  })

  it('reveals the existing access explanation without opening a hidden lesson', async () => {
    const user = userEvent.setup()
    render(<StudyHome />)
    const correction =
      findLearningActivity(defaultLesson)!.commonMisunderstanding!.correction
    const explanation = screen.getByText(correction)
    const disclosure = explanation.closest('details')
    expect(disclosure).not.toHaveAttribute('open')
    expect(explanation).not.toBeVisible()
    await user.click(screen.getByText('Why the distinction matters'))
    expect(disclosure).toHaveAttribute('open')
    expect(explanation).toBeVisible()
    expect(explanation).toHaveTextContent('processes acting on users’ behalf')
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
    expect(trackUsage).not.toHaveBeenCalled()
    await user.click(screen.getByText('Why the distinction matters'))
    expect(explanation).not.toBeVisible()
  })
})
