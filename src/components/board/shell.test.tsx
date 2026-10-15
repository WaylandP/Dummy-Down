import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { explorerCatalog, referenceControls } from '../../data/content'
import { filterControls } from '../../data/control-search'
import {
  explorerResults,
  parseExplorerSearch,
} from '../../state/explorer-state'
import { trackUsage } from '../../analytics/usage'

vi.mock('../../analytics/usage', () => ({ trackUsage: vi.fn() }))

beforeEach(() => {
  window.history.replaceState(null, '', '/glossary')
  vi.mocked(trackUsage).mockClear()
})

/** The native form's address contract, as the browser would build it. */
function formDestination(form: HTMLFormElement) {
  const destination = new URL(form.action)
  const params = new URLSearchParams()
  new FormData(form).forEach((value, key) => params.append(key, String(value)))
  destination.search = params.toString()
  return destination
}

describe('The Board shell', () => {
  it('draws the board once: ground, dust and the chalk filter', () => {
    render(<App />)
    expect(document.querySelectorAll('filter#chalk')).toHaveLength(1)
    expect(document.querySelectorAll('filter#dust')).toHaveLength(1)
    expect(document.querySelectorAll('.board-dust')).toHaveLength(1)
    expect(document.querySelectorAll('.board-ground')).toHaveLength(1)
    const tray = document.querySelector('.chalk-tray')
    expect(tray).toHaveAttribute('aria-hidden', 'true')
    expect(tray?.querySelectorAll('.tray-stick')).toHaveLength(3)
    expect(tray).toHaveTextContent(
      'white: new to thisyellow: runs the systemsblue: preparing for assessment',
    )
  })

  it('puts the lockup and the six places to go in the header, the one you are on under a chalk stroke', () => {
    render(<App />)
    expect(
      screen.getByRole('link', { name: 'Cipher & Chalk home' }),
    ).toHaveAttribute('href', '/')
    const nav = within(screen.getByRole('navigation', { name: 'Main' }))
    expect(
      nav
        .getAllByRole('link')
        .map((link) => [
          link.textContent,
          link.getAttribute('href'),
          link.getAttribute('aria-current'),
        ]),
    ).toEqual([
      ['Home', '/', null],
      ['Controls', '/learn?view=discover&collection=references', null],
      ['Glossary', '/glossary', 'page'],
      ['Practice', '/practice', null],
      ['Timeline', '/timeline', null],
      ['About', '/about', null],
    ])
    const strokes = nav
      .getAllByRole('link')
      .map((link) => link.querySelector('.nav-stroke') !== null)
    expect(strokes).toEqual([true, true, true, true, true, true])
    expect(screen.queryByRole('link', { name: 'Coverage' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Learn' })).toBeNull()
  })

  it('lights Controls for every learn address, a control on the board included', async () => {
    for (const address of [
      '/learn',
      '/learn?view=discover&collection=references&family=MP',
      '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner',
    ]) {
      window.history.replaceState(null, '', address)
      const view = render(<App />)
      const nav = within(screen.getByRole('navigation', { name: 'Main' }))
      expect(nav.getByRole('link', { name: 'Controls' })).toHaveAttribute(
        'aria-current',
        'page',
      )
      expect(
        nav
          .getAllByRole('link')
          .filter((link) => link.hasAttribute('aria-current')),
      ).toHaveLength(1)
      view.unmount()
    }
  })

  it('keeps the disclaimer, assessment objectives and privacy choices in the footer line', () => {
    render(<App />)
    const footer = within(screen.getByRole('contentinfo'))
    expect(
      footer.getByText(/Independent and educational. Not legal advice/),
    ).toBeVisible()
    expect(footer.getByText(/not affiliated with DoD or NIST\./)).toBeVisible()
    expect(
      footer.getByRole('link', { name: 'Disclaimer & terms' }),
    ).toHaveAttribute('href', '/disclaimer')
    expect(footer.getByRole('switch', { name: 'Smudge' })).toBeVisible()
    expect(
      footer.getByRole('link', { name: 'Assessment objectives' }),
    ).toHaveAttribute('href', '/coverage')
    expect(footer.getByText('Usage & privacy')).toBeVisible()
    expect(
      footer.getByRole('link', { name: /^Open source · MIT/ }),
    ).toHaveAttribute(
      'href',
      'https://github.com/WaylandP/cipher-and-chalk/blob/main/LICENSE',
    )
  })

  it('opens a find line that submits the discovery contract and keeps the text out of telemetry', async () => {
    const user = userEvent.setup()
    render(<App />)
    const toggle = screen.getByRole('button', { name: 'Find a control' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('search', { name: 'Find a control' })).toBeNull()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const form = screen.getByRole('search', {
      name: 'Find a control',
    }) as HTMLFormElement
    expect(toggle).toHaveAttribute('aria-controls', form.id)
    const input = within(form).getByRole('searchbox', {
      name: 'Find a control',
    })
    expect(input).toHaveFocus()
    expect(form).toHaveAttribute('action', '/learn')
    expect(form).toHaveAttribute('method', 'get')

    await user.type(input, 'media & mode=compliance')
    expect(trackUsage).not.toHaveBeenCalled()
    const destination = formDestination(form)
    expect(destination.pathname).toBe('/learn')
    expect(destination.searchParams.get('view')).toBe('discover')
    expect(destination.searchParams.get('collection')).toBe('references')
    expect(destination.searchParams.get('catalog')).toBe('cmmc')
    expect(destination.searchParams.getAll('q')).toEqual([
      'media & mode=compliance',
    ])
    const parsed = parseExplorerSearch(destination.search, explorerCatalog)
    expect(parsed.kind).toBe('ready')
    if (parsed.kind !== 'ready') throw new Error('Find address is invalid')
    expect(parsed.state.view).toBe('discover')
    expect(parsed.state.filters.query).toBe('media & mode=compliance')
    const count = filterControls(referenceControls, {
      frameworkId: 'cmmc',
      query: 'media & mode=compliance',
    }).length
    expect(explorerResults(parsed.state, explorerCatalog)).toHaveLength(count)

    // jsdom cannot navigate native forms; only the submit event is observed.
    fireEvent.submit(form)
    expect(trackUsage).toHaveBeenCalledExactlyOnceWith({
      name: 'search_used',
      scope: 'explorer',
      active: true,
      resultCount: count,
    })
    expect(JSON.stringify(vi.mocked(trackUsage).mock.calls)).not.toContain(
      'media',
    )
  })

  it('closes the find line on Escape and returns focus to its button', async () => {
    const user = userEvent.setup()
    render(<App />)
    const toggle = screen.getByRole('button', { name: 'Find a control' })
    await user.click(toggle)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('search', { name: 'Find a control' })).toBeNull()
    expect(toggle).toHaveFocus()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(
      screen.getByRole('searchbox', { name: 'Find a control' }),
    ).toHaveFocus()
    await user.click(toggle)
    expect(screen.queryByRole('search', { name: 'Find a control' })).toBeNull()
  })

  it('keeps the find button on Home beside its own search line, the one footer line, and drops the tray legend there', () => {
    window.history.replaceState(null, '', '/')
    render(<App />)
    expect(
      screen.getByRole('button', { name: 'Find a control' }),
    ).toBeInTheDocument()
    const footer = within(screen.getByRole('contentinfo'))
    expect(footer.getByText(/Independent and educational/)).toBeInTheDocument()
    expect(footer.queryByText(/Made by one person/)).toBeNull()
    expect(document.querySelector('.tray-stub')).toBeNull()
    expect(
      screen.getByRole('search', { name: 'Find a control' }),
    ).toHaveAttribute('action', '/learn')
    expect(document.querySelector('.chalk-tray')).not.toHaveTextContent(
      'new to this',
    )
    expect(trackUsage).not.toHaveBeenCalled()
  })
})
