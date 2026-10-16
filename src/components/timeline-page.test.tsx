import { render, screen, waitFor, within } from '@testing-library/react'
import { createHash } from 'node:crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import timeline from '../data/cmmc-timeline.json'
import { sitePage } from '../state/site-page'
import { TimelineRoute } from './TimelineRoute'

const sources = timeline.sources as Record<
  string,
  {
    title: string
    version: string
    officialUrl: string
    sha256: string
    retrievedDate: string
  }
>
const lines = [
  ...timeline.dates.map((entry) => ({
    name: entry.title,
    citations: entry.citations,
  })),
  ...timeline.durations.map((entry) => ({
    name: entry.status,
    citations: entry.citations,
  })),
  { name: timeline.rev3.title, citations: timeline.rev3.citations },
]

beforeEach(() => window.history.replaceState(null, '', '/timeline'))

/** The page is a lazy chunk; under a full run the first wait is long. */
async function openPage() {
  render(<App />)
  return screen.findByRole('list', { name: 'CMMC dates' }, { timeout: 5000 })
}

describe('The timeline', () => {
  it('is a page of its own in the nav and the address', async () => {
    render(<App />)
    expect(sitePage(new URL('http://localhost/timeline'))).toBe('timeline')
    expect(sitePage(new URL('http://localhost/timeline/'))).toBe('timeline')
    expect(
      within(screen.getByRole('navigation', { name: 'Main' })).getByRole(
        'link',
        { name: 'Timeline' },
      ),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: 'The dates that matter.' },
        { timeout: 5000 },
      ),
    ).toBeVisible()
    expect(document.title).toMatch(/^Timeline/)
  })

  it('reads every date, every status and the Rev 3 line from the data', async () => {
    const list = await openPage()
    const dates = [...list.querySelectorAll<HTMLElement>(':scope > li')]
    expect(
      dates.map((item) => item.querySelector('time')?.textContent),
    ).toEqual([
      'December 16, 2024',
      'November 10, 2025',
      'July 13, 2026',
      'November 10, 2026',
      'November 10, 2027',
      'November 10, 2028',
    ])
    expect(
      dates.map((item) => item.querySelector('time')?.getAttribute('dateTime')),
    ).toEqual(timeline.dates.map((entry) => entry.date))
    for (const [index, entry] of timeline.dates.entries()) {
      const item = dates[index]!
      expect(within(item).getByRole('heading', { level: 3 })).toHaveTextContent(
        entry.title,
      )
      expect(item).toHaveTextContent(entry.text)
    }
    const statuses = [
      ...screen
        .getByRole('region', { name: 'How long a status stays current' })
        .querySelectorAll<HTMLElement>('.timeline-statuses > li'),
    ]
    expect(
      statuses.map((item) => [
        item.querySelector('.timeline-status-name')?.textContent,
        item.querySelector('.timeline-lasts')?.textContent,
      ]),
    ).toEqual(timeline.durations.map((entry) => [entry.status, entry.lasts]))
    for (const [index, entry] of timeline.durations.entries())
      expect(statuses[index]).toHaveTextContent(entry.text)
    expect(
      screen.getByRole('region', { name: timeline.rev3.title }),
    ).toHaveTextContent(timeline.rev3.text)
  })

  it('shows Phase 2 on hold since July 13, 2026, and the later phases as the original schedule', async () => {
    const list = await openPage()
    const items = [...list.querySelectorAll<HTMLElement>(':scope > li')]
    const hold = items.find(
      (item) =>
        item.querySelector('time')?.getAttribute('dateTime') === '2026-07-13',
    )!
    expect(within(hold).getByRole('heading', { level: 3 })).toHaveTextContent(
      'Phase 2 is put on hold',
    )
    expect(hold).toHaveTextContent('Department of War')
    expect(hold).toHaveTextContent('Level 1 (Self) or Level 2 (Self)')
    const entries = timeline.dates as readonly {
      id: string
      title: string
      status?: string
      citations: readonly { source: string }[]
    }[]
    const suspended = entries.filter((entry) => entry.status === 'suspended')
    expect(suspended.map((entry) => entry.id)).toEqual([
      'phase-2',
      'phase-3',
      'phase-4',
    ])
    for (const entry of suspended) expect(entry.title).toMatch(/was to begin$/)
    expect(
      entries
        .find((entry) => entry.id === 'phase-2-on-hold')!
        .citations.map((citation) => citation.source),
    ).toEqual([
      'cmmc-faq-2-3',
      'cmmc-faq-2-3',
      'cmmc-faq-2-3',
      'dfars-deviation-2026-o0025-r3',
      'dfars-deviation-2026-o0025-r3',
      'dfars-deviation-2026-o0025-r3',
    ])
    expect(sources['cmmc-faq-2-3']!.version).toMatch(
      /^Revision 2\.4, July 13, 2026/,
    )
  })

  it('keeps every quotation under one Sources disclosure per section, each line named and each source linked to its official address', async () => {
    await openPage()
    const disclosures = [
      ...document.querySelectorAll<HTMLDetailsElement>('.timeline-sources'),
    ]
    expect(
      disclosures.map((node) => node.querySelector('summary')?.textContent),
    ).toEqual(['Sources: the dates', 'Sources: the statuses', 'Sources: Rev 3'])
    expect(
      within(screen.getByRole('region', { name: 'Sources' })).getAllByRole(
        'group',
      ),
    ).toHaveLength(3)
    const groups = [
      ...document.querySelectorAll<HTMLElement>('.timeline-source-group'),
    ]
    expect(groups).toHaveLength(lines.length)
    for (const [index, line] of lines.entries()) {
      const group = groups[index]!
      expect(group.querySelector('h3')?.textContent).toContain(line.name)
      const items = [...group.querySelectorAll<HTMLElement>('li')]
      expect(items).toHaveLength(line.citations.length)
      for (const [at, citation] of line.citations.entries()) {
        const item = items[at]!
        const source = sources[citation.source]!
        const link = item.querySelector('a')!
        expect(link).toHaveAttribute('href', source.officialUrl)
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        expect(link).toHaveTextContent('(opens in a new tab)')
        expect(item.querySelector('.timeline-cite')).toHaveTextContent(
          source.version,
        )
        expect(item.querySelector('.timeline-cite')).toHaveTextContent(
          citation.where,
        )
        expect(item.querySelector('blockquote')?.textContent).toBe(
          citation.quote,
        )
      }
    }
  })

  it('opens every Sources disclosure for print and puts them back after', async () => {
    await openPage()
    const details = () => [
      ...document.querySelectorAll<HTMLDetailsElement>('.timeline-sources'),
    ]
    details()[0]!.open = true
    // The print listeners attach in a passive effect, which can flush after
    // the list is already in the DOM; keep dispatching until they are live.
    // The handlers touch the DOM only, so no act() is needed.
    await waitFor(() => {
      window.dispatchEvent(new Event('beforeprint'))
      expect(details().map((node) => node.open)).toEqual([true, true, true])
    })
    window.dispatchEvent(new Event('afterprint'))
    expect(details().map((node) => node.open)).toEqual([true, false, false])
  })

  it('pins every source by official address and digest, and every citation names one', () => {
    expect(Object.keys(sources)).toContain('fr-2025-17359')
    for (const source of Object.values(sources)) {
      expect(source.officialUrl).toMatch(/^https:\/\//)
      expect(source.sha256).toMatch(/^[0-9a-f]{64}$/)
      expect(source.retrievedDate).toBe('2026-10-15')
    }
    for (const line of lines)
      for (const citation of line.citations) {
        expect(sources).toHaveProperty(citation.source)
        expect(citation.where.length).toBeGreaterThan(0)
        expect(citation.quote.length).toBeGreaterThan(0)
      }
    expect(
      createHash('sha256')
        .update(JSON.stringify(lines.map((line) => line.citations)))
        .digest('hex'),
    ).toBe('f8898110f7cba93412410b28f960f101ed36bc0a02a4c80786b22060271f1260')
  })

  it('says so and offers a reload when its chunk fails to load', async () => {
    render(
      <TimelineRoute
        load={async () => {
          throw new Error('Chunk unavailable')
        }}
      />,
    )
    expect(
      await screen.findByRole('button', { name: 'Reload the timeline' }),
    ).toBeVisible()
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-busy', 'false')
    expect(status).toHaveTextContent('could not load')
  })
})
