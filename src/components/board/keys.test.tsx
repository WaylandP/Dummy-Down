import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { referenceControls } from '../../data/content'
import { trackUsage } from '../../analytics/usage'

vi.mock('../../analytics/usage', () => ({ trackUsage: vi.fn() }))

const lesson =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'
const title = 'Authorized Access Control [FCI Data]'

function param(name: string) {
  return new URLSearchParams(window.location.search).get(name)
}

beforeEach(() => {
  window.history.replaceState(null, '', '/glossary')
  vi.mocked(trackUsage).mockClear()
})

describe('The keys', () => {
  it('shows the keys on "?" and gives focus back on Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    const toggle = screen.getByRole('button', { name: 'Find a control' })
    toggle.focus()
    await user.keyboard('?')
    const dialog = screen.getByRole('dialog', { name: 'Keys' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    const close = within(dialog).getByRole('button', { name: 'Close' })
    expect(close).toHaveFocus()
    expect(
      [...dialog.querySelectorAll('dt')].map((term) => term.textContent),
    ).toEqual(['j', 'k', '123', '/', '?', 'Esc'])
    expect(
      [...dialog.querySelectorAll('dd')].map((term) => term.textContent),
    ).toEqual([
      'Next control',
      'Previous control',
      'Pick a chalk: white, yellow, blue',
      'Find a control',
      'Show these keys',
      'Close',
    ])
    await user.tab()
    expect(close).toHaveFocus()
    await user.keyboard('?')
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    // A tap on the dialog's text does not hand focus to the page behind it.
    await user.click(within(dialog).getByRole('heading', { name: 'Keys' }))
    expect(close).toHaveFocus()
    await user.keyboard('/')
    expect(screen.queryByRole('search', { name: 'Find a control' })).toBeNull()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(toggle).toHaveFocus()
    await user.keyboard('?')
    await user.click(
      within(screen.getByRole('dialog', { name: 'Keys' })).getByRole('button', {
        name: 'Close',
      }),
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(toggle).toHaveFocus()
  })

  it('leaves "?" and "/" to a visitor who is typing', async () => {
    const user = userEvent.setup()
    render(<App />)
    const search = screen.getByRole('searchbox', { name: 'Search words' })
    await user.click(search)
    await user.keyboard('/?')
    expect(search).toHaveValue('/?')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('search', { name: 'Find a control' })).toBeNull()
  })

  it('"/" opens the find line, or the search line on Home, without typing into it', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.keyboard('/')
    const input = screen.getByRole('searchbox', { name: 'Find a control' })
    expect(input).toHaveFocus()
    expect(input).toHaveValue('')
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Find a control' })).toHaveFocus()
    unmount()
    window.history.replaceState(null, '', '/')
    render(<App />)
    await user.keyboard('/')
    const home = document.getElementById('home-q')
    expect(home).toHaveFocus()
    expect(home).toHaveValue('')
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('steps through the results with j and k and picks a chalk with 1, 2 and 3', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', lesson)
    render(<App />)
    expect(
      await screen.findByRole('heading', { level: 1, name: title }),
    ).toBeVisible()
    expect(screen.queryByRole('button', { name: /^Previous: / })).toBeNull()
    const nextId = screen
      .getByRole('button', { name: /^Next: / })
      .textContent!.replace('Next: ', '')
    const next = referenceControls.find((item) => item.id === nextId)!
    const heading = screen.getByRole('heading', { level: 1 })
    const focused = vi.fn()
    heading.addEventListener('focus', focused)
    await user.keyboard('j')
    expect(
      await screen.findByRole('heading', { level: 1, name: next.title }),
    ).toHaveFocus()
    expect(param('control')).toBe(next.key)
    expect(focused).toHaveBeenCalledTimes(1)
    // The heading is one node for every control, so each move is a fresh focus.
    await user.keyboard('k')
    expect(
      await screen.findByRole('heading', { level: 1, name: title }),
    ).toHaveFocus()
    expect(focused).toHaveBeenCalledTimes(2)
    await user.keyboard('k')
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeVisible()
    expect(param('control')).toBe('ac-l1-b-1-i')
    // A held key does not walk the results; Caps Lock does not silence j.
    fireEvent.keyDown(window, { key: 'j', repeat: true })
    expect(param('control')).toBe('ac-l1-b-1-i')
    fireEvent.keyDown(window, { key: 'J' })
    expect(
      await screen.findByRole('heading', { level: 1, name: next.title }),
    ).toHaveFocus()
    expect(focused).toHaveBeenCalledTimes(3)
    await user.keyboard('k')
    expect(
      await screen.findByRole('heading', { level: 1, name: title }),
    ).toHaveFocus()

    vi.mocked(trackUsage).mockClear()
    await user.keyboard('2')
    await waitFor(() => expect(param('tab')).toBe('explain'))
    expect(param('mode')).toBe('it-cyber')
    expect(trackUsage).toHaveBeenCalledWith({
      name: 'perspective_change',
      lesson: {
        frameworkId: 'cmmc',
        editionId: 'cmmc-2-13-sep-2024',
        controlKey: 'ac-l1-b-1-i',
      },
      mode: 'it-cyber',
    })
    expect(
      await screen.findByRole('tab', { name: 'I run the systems' }),
    ).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('3')
    await waitFor(() => expect(param('mode')).toBe('compliance'))
    await user.keyboard('1')
    await waitFor(() => expect(param('mode')).toBe('beginner'))
    expect(param('tab')).toBe('explain')
    expect(param('control')).toBe('ac-l1-b-1-i')
  })
})

describe('The tray with a control on the board', () => {
  it('turns the three chalks into the perspective switch and lifts the one in hand', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', lesson)
    render(<App />)
    await screen.findByRole('heading', { level: 1, name: title })
    const tray = screen.getByRole('navigation', { name: 'Pick a chalk' })
    const picks = within(tray).getAllByRole('button')
    expect(picks.map((pick) => pick.textContent)).toEqual([
      'white chalk: new to this',
      'yellow chalk: runs systems',
      'blue chalk: assessment',
    ])
    expect(picks.map((pick) => pick.getAttribute('aria-pressed'))).toEqual([
      'false',
      'false',
      'false',
    ])
    await user.click(picks[1]!)
    await waitFor(() => expect(param('tab')).toBe('explain'))
    expect(param('mode')).toBe('it-cyber')
    expect(picks[1]).toHaveAttribute('aria-pressed', 'true')
    expect(tray.querySelector('.tray-stick-yellow')).toHaveAttribute(
      'data-lifted',
      'true',
    )
    expect(tray.querySelector('.tray-stick-white')).not.toHaveAttribute(
      'data-lifted',
    )
    expect(
      await screen.findByRole('tab', { name: 'I run the systems' }),
    ).toHaveAttribute('aria-selected', 'true')
    await user.click(
      within(
        screen.getByRole('navigation', { name: 'Views of this control' }),
      ).getByRole('link', { name: 'Decode' }),
    )
    expect(picks[1]).toHaveAttribute('aria-pressed', 'false')
    expect(tray.querySelector('[data-lifted]')).toBeNull()
  })

  it('stays decorative on pages without a control', () => {
    render(<App />)
    expect(
      screen.queryByRole('navigation', { name: 'Pick a chalk' }),
    ).toBeNull()
    expect(document.querySelector('.chalk-tray')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })
})
