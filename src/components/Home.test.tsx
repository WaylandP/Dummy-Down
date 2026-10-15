import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Home } from './Home'
import { later, laterFrameworks } from './home-later'
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

/** The rows are real links; jsdom cannot follow them, so a click only records its side effect. */
function clickWithoutLeaving(link: HTMLElement) {
  link.addEventListener('click', (event) => event.preventDefault(), {
    once: true,
  })
  fireEvent.click(link)
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

  it('asks who is reading and offers one row per chalk, each a place to start', () => {
    renderWithProgress(<Home />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Who’s reading?' }),
    ).toBeVisible()
    expect(screen.queryByText(/reference desk for CMMC Level 2/)).toBeNull()
    const rows = within(
      screen.getByRole('navigation', { name: 'Who’s reading?' }),
    ).getAllByRole('link') as HTMLAnchorElement[]
    expect(rows.map((row) => row.textContent)).toEqual([
      'I’m new to this.Start with Level 1: fifteen basics, one control at a time, in plain words.Start here →',
      'I run the systems.Start with the fourteen families and what each one asks of your systems.The families →',
      'I’m preparing for an assessment.Start with the objectives: what gets examined, who gets interviewed, what gets tested.The objectives →',
    ])
    expect(
      rows.map((row) => row.querySelector('.tray-stick')?.className),
    ).toEqual([
      'home-stick tray-stick tray-stick-white',
      'home-stick tray-stick tray-stick-yellow',
      'home-stick tray-stick tray-stick-blue',
    ])

    // White chalk: the first lesson, in plain words.
    const first = new URL(rows[0]!.href)
    expect(first.pathname).toBe('/learn')
    const lesson = parseExplorerSearch(first.search, explorerCatalog)
    if (lesson.kind !== 'ready' || lesson.state.view !== 'lesson')
      throw new Error('The first row did not identify a lesson')
    expect(lesson.state.lesson).toEqual({
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'ac-l1-b-1-i',
    })
    expect(lesson.state.mode).toBe('beginner')
    expect(lesson.state.path).toBe('basics')
    expect(
      resolveLesson(lesson.state.lesson, lesson.state.filters, explorerCatalog)
        .kind,
    ).toBe('lesson')

    // Yellow chalk: the Controls page with the fourteen families.
    const second = new URL(rows[1]!.href)
    expect(second.pathname).toBe('/learn')
    const discover = parseExplorerSearch(second.search, explorerCatalog)
    if (discover.kind !== 'ready') throw new Error('The second row is invalid')
    expect(discover.state.view).toBe('discover')
    expect(discover.state.mode).toBe('it-cyber')
    expect(discover.state.filters.collection).toBe('references')
    expect(explorerResults(discover.state, explorerCatalog)).toHaveLength(149)

    // Blue chalk: the assessment objectives.
    expect(new URL(rows[2]!.href).pathname).toBe('/coverage')
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('says what this is beside the rows, with every count from the catalog', () => {
    renderWithProgress(<Home />)
    const aside = within(
      screen.getByRole('complementary', { name: 'What this is' }),
    )
    expect(
      aside.getByText(
        'Cybersecurity requirements, decoded. The official sentence stays on the board word for word, cited to its page. Then it is explained in plain language, three ways.',
      ),
    ).toBeVisible()
    expect(aside.getByText('AC.L2-3.1.1')).toBeVisible()
    // The example decoded: each piece beside its meaning, in order.
    const pieces = [...aside.getAllByRole('term')].map((node) => [
      node.textContent,
      node.nextElementSibling?.textContent,
    ])
    expect(pieces.slice(0, 3)).toEqual([
      ['AC', 'Access Control, one of fourteen families'],
      ['L2', 'Level 2'],
      ['3.1.1', 'its NIST SP 800-171 requirement'],
    ])
    expect(
      aside
        .getAllByRole('heading', { level: 3 })
        .map((node) => node.textContent),
    ).toEqual(['On the board now', 'Later'])
    // On the board now: each level's controls, counted, and the three sum to the catalog.
    const counts = aside
      .getAllByRole('definition')
      .filter((node) => node.classList.contains('home-level-count'))
      .map((node) => Number(node.textContent))
    expect(counts).toEqual(
      ['Level 1', 'Level 2', 'Level 3'].map(
        (level) =>
          referenceControls.filter((control) => control.level === level).length,
      ),
    )
    expect(counts.reduce((sum, count) => sum + count, 0)).toBe(
      referenceControls.length,
    )
    expect(
      aside.getByText('the basics, for contract information'),
    ).toBeVisible()
    expect(aside.getByText('for CUI')).toBeVisible()
    expect(aside.getByText('enhanced requirements')).toBeVisible()
    // Later: every framework the catalog lists as planned, and only a promise of research.
    const laterLine = aside.getByText(later)
    expect(laterLine).toBeVisible()
    for (const framework of laterFrameworks)
      expect(
        later.includes(framework.shortName) || later.includes(framework.name),
        `${framework.name} is being researched`,
      ).toBe(true)
    // ...and names no more than the catalog lists as planned.
    const named = later
      .slice(later.indexOf(':') + 1, later.indexOf('.', later.indexOf(':')))
      .split(',')
    expect(named).toHaveLength(laterFrameworks.length)
    expect(later).toMatch(/Being researched; not here yet\.$/)
    expect(
      aside.getByText('Free. No account. Made by one person, in the open.'),
    ).toBeVisible()
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('remembers the chalk of the row chosen, so the next control opens in it', () => {
    renderWithProgress(<Home />)
    const rows = within(
      screen.getByRole('navigation', { name: 'Who’s reading?' }),
    ).getAllByRole('link')
    expect(window.localStorage.getItem(CHALK_PREFERENCE_KEY)).toBeNull()
    clickWithoutLeaving(rows[1]!)
    expect(window.localStorage.getItem(CHALK_PREFERENCE_KEY)).toBe('it-cyber')
    clickWithoutLeaving(rows[2]!)
    expect(window.localStorage.getItem(CHALK_PREFERENCE_KEY)).toBe('compliance')
    clickWithoutLeaving(rows[0]!)
    expect(window.localStorage.getItem(CHALK_PREFERENCE_KEY)).toBe('beginner')
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('keeps the families and the version off Home, and shows no starting line without saving', () => {
    renderWithProgress(<Home />)
    expect(
      screen.queryByRole('navigation', { name: 'Control families' }),
    ).toBeNull()
    expect(screen.queryByText(/CMMC v2\.13/)).toBeNull()
    expect(screen.queryByText(/Start here:/)).toBeNull()
    expect(screen.queryByText(/Last time:/)).toBeNull()
    expect(screen.getByText('Or just look something up:')).toBeInTheDocument()
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
          name: 'Who’s reading?',
        }),
      ).toBeVisible()
      expect(screen.queryByText(/Last time:/)).toBeNull()
      view.unmount()
    }
    expect(trackUsage).not.toHaveBeenCalled()
  })
})
