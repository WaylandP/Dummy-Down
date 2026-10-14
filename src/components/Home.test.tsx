import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Home } from './Home'
import { explorerCatalog, referenceControls } from '../data/content'
import { learningActivities } from '../data/learning'
import {
  explorerResults,
  parseExplorerSearch,
  resolveLesson,
} from '../state/explorer-state'
import { LocalProgressProvider } from '../progress/LocalProgressProvider'
import {
  LAST_CONTROL_KEY,
  PROGRESS_CONSENT_KEY,
  PROGRESS_DATA_KEY,
} from '../progress/store'
import { memoryProgressPort } from '../test/progress-port'
import { trackUsage } from '../analytics/usage'
import { renderWithProgress } from '../test/renderWithProgress'

vi.mock('../analytics/usage', () => ({ trackUsage: vi.fn() }))

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  vi.mocked(trackUsage).mockClear()
})

function formDestination(form: HTMLFormElement) {
  const destination = new URL(form.action)
  const params = new URLSearchParams()
  new FormData(form).forEach((value, key) => params.append(key, String(value)))
  destination.search = params.toString()
  return destination
}

describe('Home', () => {
  it.each([
    { query: '', count: 149 },
    { query: 'MP.L1-b.1.vii', count: 1 },
    { query: 'access & mode=compliance #source "quoted" + café', count: 0 },
  ])(
    'submits "$query" to reference discovery without leaking it to telemetry',
    ({ query, count }) => {
      renderWithProgress(<Home />)
      const form = screen.getByRole('search', {
        name: 'Find a control',
      }) as HTMLFormElement
      const search = within(form).getByRole('searchbox', {
        name: 'Find a control',
      })
      expect(form).toHaveAttribute('action', '/learn')
      expect(form).toHaveAttribute('method', 'get')
      fireEvent.change(search, { target: { value: query } })
      expect(trackUsage).not.toHaveBeenCalled()

      const destination = formDestination(form)
      expect(destination.pathname).toBe('/learn')
      expect(destination.searchParams.getAll('q')).toEqual([query])
      expect(destination.searchParams.get('view')).toBe('discover')
      expect(destination.searchParams.get('collection')).toBe('references')
      expect(destination.searchParams.get('catalog')).toBe('cmmc')
      expect(destination.searchParams.has('control')).toBe(false)
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

  it('lists the fourteen families with their real counts, each opening filtered discovery', () => {
    renderWithProgress(<Home />)
    const links = within(
      screen.getByRole('navigation', { name: 'Control families' }),
    ).getAllByRole('link') as HTMLAnchorElement[]
    expect(links).toHaveLength(14)
    expect(links.map((link) => link.textContent?.slice(0, 2))).toEqual(
      [...new Set(referenceControls.map((control) => control.family))].sort(),
    )
    let total = 0
    for (const link of links) {
      const code = link.textContent!.slice(0, 2)
      const expected = referenceControls.filter(
        (control) => control.family === code,
      )
      expect(
        within(link).getByText(String(expected.length), {
          selector: '.family-count',
        }),
      ).toBeInTheDocument()
      const destination = new URL(link.href)
      expect(destination.pathname).toBe('/learn')
      const parsed = parseExplorerSearch(destination.search, explorerCatalog)
      expect(parsed.kind).toBe('ready')
      if (parsed.kind !== 'ready') throw new Error('Family address is invalid')
      expect(parsed.state.view).toBe('discover')
      expect(parsed.state.filters).toMatchObject({
        catalog: 'cmmc',
        collection: 'references',
        family: code,
        query: '',
      })
      const results = explorerResults(parsed.state, explorerCatalog)
      expect(results).toHaveLength(expected.length)
      expect(results.every((control) => control.family === code)).toBe(true)
      total += results.length
    }
    expect(total).toBe(referenceControls.length)
    expect(screen.getByText(/149 controls\./)).toBeVisible()
    expect(screen.getByText('CMMC v2.13, September 2024')).toBeVisible()
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('offers a starting control until saving remembers the one opened last', () => {
    renderWithProgress(<Home />)
    expect(screen.getByText(/^Start here:/)).toBeVisible()
    const link = screen.getByRole('link', {
      name: 'AC.L1-b.1.i Authorized Access Control [FCI Data]',
    }) as HTMLAnchorElement
    const destination = new URL(link.href)
    expect(destination.pathname).toBe('/learn')
    expect(destination.hash).toBe('#explorer')
    const parsed = parseExplorerSearch(destination.search, explorerCatalog)
    if (parsed.kind !== 'ready' || parsed.state.view !== 'lesson')
      throw new Error('Starting point did not identify a lesson')
    expect(parsed.state.lesson).toEqual({
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'ac-l1-b-1-i',
    })
    expect(
      resolveLesson(parsed.state.lesson, parsed.state.filters, explorerCatalog)
        .kind,
    ).toBe('lesson')
    expect(screen.queryByText(/^Last time:/)).toBeNull()
  })

  it('shows the control opened last only while saving is on, and never a stranger', async () => {
    const remembered = JSON.stringify({
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'ac-l2-3-1-1',
    })
    const saved = JSON.stringify({ schema: 1, entries: [] })
    const on = render(
      <LocalProgressProvider
        activities={learningActivities}
        port={memoryProgressPort({
          [PROGRESS_CONSENT_KEY]: 'on',
          [PROGRESS_DATA_KEY]: saved,
          [LAST_CONTROL_KEY]: remembered,
        })}
      >
        <Home />
      </LocalProgressProvider>,
    )
    expect(await screen.findByText(/^Last time:/)).toBeVisible()
    expect(
      screen.getByRole('link', {
        name: 'AC.L2-3.1.1 Authorized Access Control [CUI Data]',
      }),
    ).toHaveAttribute('href', expect.stringContaining('control=ac-l2-3-1-1'))
    on.unmount()

    const strangers: Record<string, string>[] = [
      { [PROGRESS_DATA_KEY]: saved, [LAST_CONTROL_KEY]: remembered },
      {
        [PROGRESS_CONSENT_KEY]: 'on',
        [PROGRESS_DATA_KEY]: saved,
        [LAST_CONTROL_KEY]: JSON.stringify({
          frameworkId: 'cmmc',
          editionId: 'cmmc-2-13-sep-2024',
          controlKey: 'no-such-control',
        }),
      },
      {
        [PROGRESS_CONSENT_KEY]: 'on',
        [PROGRESS_DATA_KEY]: saved,
        [LAST_CONTROL_KEY]: '{"controlKey":"ac-l2-3-1-1","extra":true}',
      },
    ]
    for (const stored of strangers) {
      const view = render(
        <LocalProgressProvider
          activities={learningActivities}
          port={memoryProgressPort(stored)}
        >
          <Home />
        </LocalProgressProvider>,
      )
      expect(await screen.findByText(/^Start here:/)).toBeVisible()
      expect(screen.queryByText(/^Last time:/)).toBeNull()
      view.unmount()
    }
    expect(trackUsage).not.toHaveBeenCalled()
  })
})
