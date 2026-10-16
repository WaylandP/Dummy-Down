import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Home } from './Home'
import { referenceControls, explorerCatalog } from '../data/content'
import { learningActivities } from '../data/learning'
import {
  explorerResults,
  parseExplorerSearch,
  resolveLesson,
} from '../state/explorer-state'
import { CHALK_PREFERENCE_KEY } from '../state/chalk-preference'
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
  window.localStorage.clear()
  vi.mocked(trackUsage).mockClear()
})

function formDestination(form: HTMLFormElement) {
  const destination = new URL(form.action)
  const params = new URLSearchParams()
  new FormData(form).forEach((value, key) => params.append(key, String(value)))
  destination.search = params.toString()
  return destination
}

/** The chalks are real links; jsdom cannot follow them, so a click only records its side effect. */
function clickWithoutLeaving(link: HTMLElement) {
  link.addEventListener('click', (event) => event.preventDefault(), {
    once: true,
  })
  fireEvent.click(link)
}

const pick = () =>
  within(screen.getByRole('list', { name: 'Pick up a chalk to start.' }))

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
      expect(search).toHaveAttribute('placeholder', 'Or find a control…')
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

  it('says what it is first: a kicker, the one headline, then one line with the count from the catalog', () => {
    renderWithProgress(<Home />)
    // One h1; the chalk talk's own title is an h2 beside it.
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(screen.getAllByRole('heading')).toHaveLength(2)
    expect(headings[0]).toHaveTextContent('CMMC, in plain words.')
    expect(headings[0]!.tagName).toBe('H1')
    expect(headings[0]!.querySelector('br')).not.toBeNull()
    const kicker = screen.getByText(
      'A free reference desk for cybersecurity compliance',
    )
    expect(kicker.tagName).toBe('P')
    expect(kicker).toHaveClass('hand')
    expect(referenceControls).toHaveLength(149)
    const lead = screen.getByText(
      `All ${referenceControls.length} controls across the three levels, each quoted from the official guide with its page, then explained three ways. More frameworks to come.`,
    )
    expect(lead.tagName).toBe('P')
    // The order on the page: kicker, headline, line, then the chalks, then the search.
    const order = [
      kicker,
      headings[0]!,
      lead,
      screen.getByText('Pick up a chalk to start.'),
      screen.getByRole('list', { name: 'Pick up a chalk to start.' }),
      screen.getByRole('search', { name: 'Find a control' }),
    ]
    for (let index = 1; index < order.length; index += 1)
      expect(
        order[index - 1]!.compareDocumentPosition(order[index]!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('offers the three chalks as the main action, each a place to start in its chalk', () => {
    renderWithProgress(<Home />)
    const links = pick().getAllByRole('link') as HTMLAnchorElement[]
    expect(links.map((link) => link.textContent)).toEqual([
      'I’m new to thisLevel 1’s fifteen basics first.',
      'I run the systemsThe fourteen families.',
      'I’m preparing for an assessmentEvery objective, quoted.',
    ])
    expect(
      links.map((link) => link.querySelector('.tray-stick')?.className),
    ).toEqual([
      'home-stick tray-stick tray-stick-white',
      'home-stick tray-stick tray-stick-yellow',
      'home-stick tray-stick tray-stick-blue',
    ])

    // White chalk: Controls filtered to Level 1, with the first of the
    // fifteen basics on the board, in plain words.
    const first = new URL(links[0]!.href)
    expect(first.pathname).toBe('/learn')
    const lesson = parseExplorerSearch(first.search, explorerCatalog)
    if (lesson.kind !== 'ready' || lesson.state.view !== 'lesson')
      throw new Error('The first chalk did not identify a lesson')
    expect(lesson.state.lesson).toEqual({
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'ac-l1-b-1-i',
    })
    expect(lesson.state.mode).toBe('beginner')
    expect(lesson.state.filters.level).toBe('Level 1')
    expect(first.searchParams.has('path')).toBe(false)
    const resolved = resolveLesson(
      lesson.state.lesson,
      lesson.state.filters,
      explorerCatalog,
    )
    expect(resolved.kind).toBe('lesson')
    expect(resolved.kind === 'lesson' && resolved.excludedByFilters).toBe(false)
    const level1 = explorerResults(lesson.state, explorerCatalog)
    expect(level1).toHaveLength(15)
    expect(level1[0]!.key).toBe('ac-l1-b-1-i')
    expect(level1.every((control) => control.level === 'Level 1')).toBe(true)

    // Yellow chalk: the Controls page with the fourteen families.
    const second = new URL(links[1]!.href)
    expect(second.pathname).toBe('/learn')
    const discover = parseExplorerSearch(second.search, explorerCatalog)
    if (discover.kind !== 'ready')
      throw new Error('The second chalk is invalid')
    expect(discover.state.view).toBe('discover')
    expect(discover.state.mode).toBe('it-cyber')
    expect(discover.state.filters.collection).toBe('references')
    expect(explorerResults(discover.state, explorerCatalog)).toHaveLength(149)

    // Blue chalk: the assessment objectives.
    expect(new URL(links[2]!.href).pathname).toBe('/coverage')

    // Each remembers its chalk, so the next control opens in it.
    expect(window.localStorage.getItem(CHALK_PREFERENCE_KEY)).toBeNull()
    clickWithoutLeaving(links[1]!)
    expect(window.localStorage.getItem(CHALK_PREFERENCE_KEY)).toBe('it-cyber')
    clickWithoutLeaving(links[2]!)
    expect(window.localStorage.getItem(CHALK_PREFERENCE_KEY)).toBe('compliance')
    clickWithoutLeaving(links[0]!)
    expect(window.localStorage.getItem(CHALK_PREFERENCE_KEY)).toBe('beginner')
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('keeps the column, the question, the decode example, the families and the version off Home', () => {
    renderWithProgress(<Home />)
    expect(screen.queryByRole('complementary')).toBeNull()
    expect(screen.queryByText(/Who’s reading/)).toBeNull()
    expect(screen.queryByText('AC.L2-3.1.1')).toBeNull()
    expect(screen.queryByText(/What this is/)).toBeNull()
    expect(
      screen.queryByRole('navigation', { name: 'Control families' }),
    ).toBeNull()
    expect(screen.queryByText(/CMMC v2\.13/)).toBeNull()
    expect(screen.queryByText(/Last time:/)).toBeNull()
  })

  it('shows the control opened last only while saving is on, in the remembered chalk, and never a stranger', async () => {
    const remembered = JSON.stringify({
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'ac-l2-3-1-1',
    })
    const saved = JSON.stringify({ schema: 1, entries: [] })
    window.localStorage.setItem(CHALK_PREFERENCE_KEY, 'compliance')
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
    expect(await screen.findByText(/Last time:/)).toBeVisible()
    const link = screen.getByRole('link', {
      name: 'AC.L2-3.1.1 Authorized Access Control [CUI Data]',
    })
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('control=ac-l2-3-1-1'),
    )
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('mode=compliance'),
    )
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
      expect(
        await screen.findByRole('heading', {
          level: 1,
          name: 'CMMC, in plain words.',
        }),
      ).toBeVisible()
      expect(screen.queryByText(/Last time:/)).toBeNull()
      view.unmount()
    }
    expect(trackUsage).not.toHaveBeenCalled()
  })
})
