import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../App'
import { referenceControls } from '../../data/content'
import { families } from '../families'

const controls = '/learn?view=discover&collection=references'
const lesson = (key: string, rest = '') =>
  `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=beginner${rest}`
/** The fifteen Level 1 controls, in catalog order. */
const basics = referenceControls.filter(
  (control) => control.level === 'Level 1',
)

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
  }
}

beforeEach(() => window.localStorage.clear())

describe('the rail of every control', () => {
  it('lists the fourteen families with their catalog counts, with no Start here', async () => {
    const { rail, familyCount, explorer } = await open()
    expect(families).toHaveLength(14)
    for (const family of families) {
      expect(familyCount(family.code)).toBe(family.count)
    }
    expect(families.reduce((sum, family) => sum + family.count, 0)).toBe(
      referenceControls.length,
    )
    // Nothing is open until a family or a control is chosen.
    expect(rail.queryAllByRole('link', { name: /^[A-Z]{2}\.L\d/ })).toEqual([])
    // The Start here path went on October 15: nothing stands between the find
    // line and the level switch, and nothing counts "n of 15".
    expect(rail.queryByRole('link', { name: /^Start here/ })).toBeNull()
    expect(rail.queryByText(/of 15/)).toBeNull()
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

  it('opens Controls filtered to Level 1 with the first basic on the board, as Home’s white chalk does', async () => {
    const { user, rail, level, familyCount, explorer, params } = await open(
      lesson(basics[0]!.key, '&level=Level+1'),
    )
    expect(
      explorer.getByRole('heading', { level: 1, name: basics[0]!.title }),
    ).toBeVisible()
    expect(level('1')).toHaveAttribute('aria-current', 'true')
    expect(
      families.reduce((sum, family) => sum + familyCount(family.code), 0),
    ).toBe(15)
    expect(
      rail.getByRole('link', { name: new RegExp(`^${basics[0]!.id} `) }),
    ).toHaveAttribute('aria-current', 'page')
    // The foot steps through the basics in order, keeping the level.
    expect(explorer.queryByRole('button', { name: /^Previous/ })).toBeNull()
    await user.click(
      explorer.getByRole('button', { name: `Next: ${basics[1]!.id}` }),
    )
    expect(params().get('control')).toBe(basics[1]!.key)
    expect(params().get('level')).toBe('Level 1')
    expect(
      explorer.getByRole('button', { name: `Next: ${basics[2]!.id}` }),
    ).toHaveFocus()
    expect(
      explorer.getByRole('button', { name: `Previous: ${basics[0]!.id}` }),
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

  // The Start here path was removed on October 15; a link that still carries
  // it opens its control as if the parameter were not there.
  it.each([basics[0]!.key, basics[basics.length - 1]!.key, 'ac-l2-3-1-1'])(
    'opens an old Start here link to %s on its control, ignoring the path',
    async (key) => {
      const control = referenceControls.find((item) => item.key === key)!
      const { user, rail, explorer, params } = await open(
        lesson(key, '&path=basics'),
      )
      expect(
        explorer.getByRole('heading', { level: 1, name: control.title }),
      ).toBeVisible()
      expect(document.querySelector('.explorer-notice')).toBeNull()
      expect(rail.queryByRole('link', { name: /^Start here/ })).toBeNull()
      expect(explorer.queryByText(/of 15/)).toBeNull()
      expect(explorer.queryByText('The basics, done.')).toBeNull()
      expect(
        explorer.queryByRole('button', { name: /^Next on the path/ }),
      ).toBeNull()
      // The foot is plain Previous and Next, and the next address drops the
      // parameter.
      const next = referenceControls[referenceControls.indexOf(control) + 1]
      if (!next) throw new Error(`${control.id} has no next control`)
      await user.click(
        explorer.getByRole('button', { name: `Next: ${next.id}` }),
      )
      expect(params().get('control')).toBe(next.key)
      expect(params().get('path')).toBeNull()
      expect(
        explorer.getByRole('button', { name: `Previous: ${control.id}` }),
      ).toBeInTheDocument()
    },
  )
})
