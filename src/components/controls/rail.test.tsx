import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../App'
import { explorerCatalog, referenceControls } from '../../data/content'
import { pathControls } from '../../state/explorer-state'
import { families } from '../families'

const controls = '/learn?view=discover&collection=references'
const basics = pathControls('basics', explorerCatalog)

async function open(address = controls) {
  window.history.replaceState(null, '', address)
  const user = userEvent.setup()
  render(<App />)
  const explorer = within(
    await screen.findByRole(
      'region',
      { name: 'Control Explorer' },
      { timeout: 5000 },
    ),
  )
  const rail = within(
    explorer.getByRole('navigation', { name: 'All controls' }),
  )
  return {
    user,
    explorer,
    rail,
    params: () => new URLSearchParams(window.location.search),
    family: (code: string) =>
      rail.getByRole('link', { name: new RegExp(`^${code} `) }),
    familyCount: (code: string) =>
      Number(
        rail
          .getByRole('link', { name: new RegExp(`^${code} `) })
          .querySelector('.rail-family-count')?.textContent,
      ),
    level: (name: string) =>
      within(rail.getByRole('group', { name: 'Level' })).getByRole('link', {
        name,
      }),
    startHere: () => rail.getByRole('link', { name: /^Start here/ }),
  }
}

beforeEach(() => window.localStorage.clear())

describe('the rail of every control', () => {
  it('lists the fourteen families with their catalog counts, and the path through the basics', async () => {
    const { rail, familyCount, startHere, explorer } = await open()
    expect(families).toHaveLength(14)
    for (const family of families) {
      expect(familyCount(family.code)).toBe(family.count)
    }
    expect(families.reduce((sum, family) => sum + family.count, 0)).toBe(
      referenceControls.length,
    )
    // Nothing is open until a family or a control is chosen.
    expect(rail.queryAllByRole('link', { name: /^[A-Z]{2}\.L\d/ })).toEqual([])
    const start = startHere()
    expect(start).toHaveAttribute(
      'href',
      expect.stringContaining('path=basics'),
    )
    expect(start).toHaveAttribute(
      'href',
      expect.stringContaining(`control=${basics[0]!.key}`),
    )
    expect(start).toHaveTextContent('The fifteen Level 1 basics, in order.')
    expect(start).not.toHaveTextContent('of 15')
    expect(start.querySelectorAll('rect')).toHaveLength(basics.length)
    expect(basics).toHaveLength(15)
    // The old disclosure is gone; at desktop widths the rail holds the
    // families and the overview is the results.
    expect(
      explorer.queryByRole('button', { name: /Browse & filter/ }),
    ).not.toBeInTheDocument()
    expect(
      explorer.queryByRole('navigation', { name: 'Control families' }),
    ).not.toBeInTheDocument()
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('149 references found')
  })

  it('counts each family for the level in force and keeps every family listed', async () => {
    const { user, level, familyCount, params } = await open()
    await user.click(level('1'))
    expect(params().get('level')).toBe('Level 1')
    expect(level('1')).toHaveAttribute('aria-current', 'true')
    expect(
      families.reduce((sum, family) => sum + familyCount(family.code), 0),
    ).toBe(15)
    expect(familyCount('AC')).toBe(4)
    expect(familyCount('AT')).toBe(0)
    await user.click(level('All'))
    expect(params().get('level')).toBeNull()
    expect(familyCount('AC')).toBe(28)
  })

  it('filters the rail as you type, opening the families that still match', async () => {
    const { user, rail, family, params } = await open()
    await user.type(
      rail.getByRole('searchbox', { name: 'Find controls' }),
      'media',
    )
    expect(params().get('q')).toBe('media')
    expect(rail.queryByRole('link', { name: /^AT / })).not.toBeInTheDocument()
    expect(family('MP')).toHaveAttribute('aria-expanded', 'true')
    expect(
      rail.getByRole('link', { name: /^MP\.L1-b\.1\.vii Media Disposal/ }),
    ).toBeInTheDocument()
  })

  it('opens a family on its row and lists its controls, five at a time', async () => {
    const { user, rail, family, params } = await open()
    await user.click(family('AC'))
    expect(family('AC')).toHaveAttribute('aria-expanded', 'true')
    expect(params().get('family')).toBe('AC')
    const listed = rail.getAllByRole('link', { name: /^AC\.L/ })
    expect(listed).toHaveLength(5)
    expect(listed[0]).toHaveTextContent('AC.L1-b.1.i')
    await user.click(
      rail.getByRole('button', { name: '23 more in Access Control' }),
    )
    expect(rail.getAllByRole('link', { name: /^AC\.L/ })).toHaveLength(28)
    await user.click(family('AC'))
    expect(family('AC')).toHaveAttribute('aria-expanded', 'false')
    expect(params().get('family')).toBeNull()
  })

  it('walks the path from Start here, and leaves it for a control picked on its own', async () => {
    const { user, rail, startHere, explorer, params } = await open()
    // A query that would hide the first basic gives way to the path.
    await user.type(
      rail.getByRole('searchbox', { name: 'Find controls' }),
      'media',
    )
    await user.click(startHere())
    expect(params().get('q')).toBeNull()
    expect(params().get('path')).toBe('basics')
    expect(params().get('control')).toBe(basics[0]!.key)
    expect(startHere()).toHaveTextContent('1 of 15')
    expect(startHere()).toHaveAttribute('aria-current', 'true')
    expect(startHere().querySelectorAll('rect.is-current')).toHaveLength(1)
    expect(
      explorer.getByRole('heading', { level: 1, name: basics[0]!.title }),
    ).toHaveFocus()
    const next = explorer.getByRole('button', {
      name: `Next on the path: ${basics[1]!.id} →`,
    })
    await user.click(next)
    expect(params().get('path')).toBe('basics')
    expect(params().get('control')).toBe(basics[1]!.key)
    expect(startHere()).toHaveTextContent('2 of 15')
    expect(
      explorer.getByRole('button', {
        name: `Next on the path: ${basics[2]!.id} →`,
      }),
    ).toHaveFocus()
    // The current control carries the bar in its open family.
    expect(
      rail.getByRole('link', { name: new RegExp(`^${basics[1]!.id} `) }),
    ).toHaveAttribute('aria-current', 'page')
    // Another control from the rail leaves the path.
    await user.click(
      rail.getByRole('link', { name: new RegExp(`^${basics[3]!.id} `) }),
    )
    expect(params().get('path')).toBeNull()
    expect(params().get('control')).toBe(basics[3]!.key)
    expect(startHere()).not.toHaveTextContent('of 15')
    expect(
      explorer.queryByRole('button', { name: /^Next on the path/ }),
    ).not.toBeInTheDocument()
    expect(
      explorer.getByRole('button', { name: `Next: ${basics[4]!.id}` }),
    ).toBeInTheDocument()
  })

  it('opens a family in place beside a control, and the control stays', async () => {
    const { user, rail, family, explorer, params } = await open(
      '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner',
    )
    expect(family('AC')).toHaveAttribute('aria-expanded', 'true')
    await user.click(family('AT'))
    expect(family('AT')).toHaveAttribute('aria-expanded', 'true')
    expect(family('AC')).toHaveAttribute('aria-expanded', 'false')
    expect(rail.getByRole('link', { name: /^AT\.L2-3\.2\.1 / })).toBeVisible()
    expect(
      explorer.getByRole('heading', {
        level: 1,
        name: 'Authorized Access Control [FCI Data]',
      }),
    ).toBeVisible()
    expect(params().get('family')).toBeNull()
    await user.click(family('AT'))
    expect(family('AT')).toHaveAttribute('aria-expanded', 'false')
  })

  it('lets a pick from the rail through the filters that would hide it', async () => {
    // The demo-lesson collection: the rail still lists every reference.
    const { user, family, rail, explorer, params } = await open(
      '/learn?view=discover',
    )
    expect(
      explorer.getByRole('combobox', { name: 'Content collection' }),
    ).toHaveValue('lessons')
    await user.click(family('AC'))
    await user.click(rail.getByRole('link', { name: /^AC\.L1-b\.1\.i / }))
    expect(
      explorer.getByRole('heading', {
        level: 1,
        name: 'Authorized Access Control [FCI Data]',
      }),
    ).toHaveFocus()
    expect(params().get('collection')).toBe('references')
    // A family filter from the address gives way to a control outside it.
    window.history.replaceState(
      null,
      '',
      '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=mp-l1-b-1-vii&mode=beginner&family=MP',
    )
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(
      await explorer.findByRole('heading', {
        level: 1,
        name: 'Media Disposal [FCI Data]',
      }),
    ).toBeVisible()
    await user.click(family('AC'))
    await user.click(rail.getByRole('link', { name: /^AC\.L1-b\.1\.ii / }))
    expect(
      explorer.getByRole('heading', {
        level: 1,
        name: 'Transaction & Function Control [FCI Data]',
      }),
    ).toHaveFocus()
    expect(params().get('family')).toBeNull()
  })

  it('ends the path at the last of the basics', async () => {
    const last = basics[basics.length - 1]!
    const { explorer, startHere } = await open(
      `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${last.key}&mode=beginner&path=basics`,
    )
    expect(startHere()).toHaveTextContent('15 of 15')
    expect(explorer.getByText('The basics, done.')).toBeInTheDocument()
    expect(
      explorer.queryByRole('button', { name: /^Next/ }),
    ).not.toBeInTheDocument()
  })

  it('ignores a path on a control that is not one of the basics', async () => {
    const { startHere } = await open(
      '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l2-3-1-1&mode=beginner&path=basics',
    )
    expect(startHere()).not.toHaveTextContent('of 15')
    expect(startHere()).toHaveAttribute(
      'href',
      expect.stringContaining(`control=${basics[0]!.key}`),
    )
  })
})
