import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { trackUsage } from '../analytics/usage'
import { CHALK_PREFERENCE_KEY } from '../state/chalk-preference'

vi.mock('../analytics/usage', () => ({ trackUsage: vi.fn() }))

const controls = '/learn?view=discover&collection=references'

async function openControls(address = controls) {
  window.history.replaceState(null, '', address)
  const view = render(<App />)
  await screen.findByRole(
    'heading',
    { level: 1, name: 'Controls' },
    { timeout: 5000 },
  )
  return {
    unmount: () => view.unmount(),
    count: () => screen.getByRole('status', { name: 'Control search results' }),
    families: () =>
      within(screen.getByRole('navigation', { name: 'Control families' })),
    levels: () =>
      within(screen.getByRole('navigation', { name: 'CMMC levels' })),
    address: () => window.location.pathname + window.location.search,
  }
}

beforeEach(() => {
  window.localStorage.clear()
  vi.mocked(trackUsage).mockClear()
})

describe('the Controls page', () => {
  it('filters by family in place from real links, and marks the family in force', async () => {
    const user = userEvent.setup()
    const page = await openControls()
    expect(page.count()).toHaveTextContent('149 references found')
    const links = page.families().getAllByRole('link')
    expect(links).toHaveLength(15)
    expect(links[0]).toHaveAttribute('aria-current', 'true')
    const media = page
      .families()
      .getByRole('link', { name: /Media Protection/ })
    expect(media).toHaveAttribute('href', expect.stringContaining('family=MP'))
    await user.click(media)
    expect(page.count()).toHaveTextContent('10 references found')
    expect(media).toHaveAttribute('aria-current', 'true')
    expect(links[0]).not.toHaveAttribute('aria-current')
    expect(page.address()).toContain('family=MP')
    await user.click(links[0]!)
    expect(page.count()).toHaveTextContent('149 references found')
    expect(page.address()).not.toContain('family=')
  })

  it('leaves a modifier click on a family to the browser, so a new tab still opens', async () => {
    const page = await openControls()
    const access = page.families().getByRole('link', { name: /Access Control/ })
    const handled = fireEvent.click(access, { ctrlKey: true })
    // jsdom does not navigate; what matters is that nothing swallowed the click.
    expect(handled).toBe(true)
    expect(page.count()).toHaveTextContent('149 references found')
    expect(page.address()).not.toContain('family=')
    const plain = fireEvent.click(access)
    expect(plain).toBe(false)
    expect(page.count()).toHaveTextContent('28 references found')
  })

  it('filters by level in place, clears it on a second pick, and reports each change once', async () => {
    const user = userEvent.setup()
    const page = await openControls()
    vi.mocked(trackUsage).mockClear()
    const one = page.levels().getByRole('link', { name: /^Level 1/ })
    await user.click(one)
    expect(page.count()).toHaveTextContent('15 references found')
    expect(one).toHaveAttribute('aria-current', 'true')
    expect(page.address()).toContain('level=Level+1')
    expect(vi.mocked(trackUsage).mock.calls).toEqual([
      [{ name: 'filter_change', filter: 'level', value: 'Level 1' }],
    ])
    await user.click(one)
    expect(page.count()).toHaveTextContent('149 references found')
    expect(one).not.toHaveAttribute('aria-current')
    expect(vi.mocked(trackUsage).mock.calls).toEqual([
      [{ name: 'filter_change', filter: 'level', value: 'Level 1' }],
      [{ name: 'filter_change', filter: 'level', value: 'all' }],
    ])
    // A family and a level together narrow further.
    await user.click(
      page.families().getByRole('link', { name: /Access Control/ }),
    )
    await user.click(page.levels().getByRole('link', { name: /^Level 2/ }))
    expect(page.count()).toHaveTextContent('22 references found')
  })

  it('opens a bare /learn and a recovered link in the chalk picked on Home, and names that chalk in a notice', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(CHALK_PREFERENCE_KEY, 'compliance')
    window.history.replaceState(null, '', '/learn')
    const view = render(<App />)
    const first = await screen.findByRole(
      'heading',
      { level: 1, name: 'Authorized Access Control [FCI Data]' },
      { timeout: 5000 },
    )
    expect(first).toBeInTheDocument()
    // Explain shows which chalk is in hand: the blue one, without the address saying so.
    await user.click(screen.getByRole('link', { name: 'Explain' }))
    expect(window.location.search).toContain('mode=compliance')
    const pressed = within(
      screen.getByRole('navigation', { name: 'Pick a chalk' }),
    )
      .getAllByRole('button')
      .find((pick) => pick.getAttribute('aria-pressed') === 'true')
    expect(pressed?.textContent).toContain('blue chalk')
    view.unmount()

    const page = await openControls(`${controls}&mode=bogus`)
    expect(
      screen.getByText(/That learning mode is unavailable/),
    ).toHaveTextContent(
      'That learning mode is unavailable; showing the blue chalk.',
    )
    expect(page.address()).toContain('mode=compliance')
    const links = page.families().getAllByRole('link')
    expect(links[1]).toHaveAttribute(
      'href',
      expect.stringContaining('mode=compliance'),
    )
    page.unmount()

    // An invalid shared link recovers into the same chalk.
    window.history.replaceState(
      null,
      '',
      '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=no-such-control',
    )
    render(<App />)
    await user.click(
      await screen.findByRole(
        'button',
        { name: 'Browse examples' },
        { timeout: 5000 },
      ),
    )
    expect(window.location.search).toContain('mode=compliance')
  })
})
