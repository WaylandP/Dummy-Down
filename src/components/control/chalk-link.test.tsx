import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { explorerCatalog, referenceControls } from '../../data/content'
import {
  chalkColourOf,
  chalkColours,
  createChalkUrl,
  parseExplorerSearch,
} from '../../state/explorer-state'
import { chalkFor, chalks } from '../board/chalks'
import { trackUsage } from '../../analytics/usage'

vi.mock('../../analytics/usage', () => ({ trackUsage: vi.fn() }))

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  'clipboard',
)
const search =
  '?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l2-3-1-1'
const base = `/learn${search}`
const item = referenceControls.find((control) => control.id === 'AC.L2-3.1.1')!
const param = (name: string) =>
  new URLSearchParams(window.location.search).get(name)
function parse(query: string) {
  const parsed = parseExplorerSearch(query, explorerCatalog)
  if (parsed.kind !== 'ready') throw new Error(`Not ready: ${query}`)
  return {
    mode: parsed.state.mode,
    tab: parsed.state.tab ?? 'decode',
    notices: parsed.notices,
  }
}
function clipboard(value: unknown) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value })
}

beforeEach(() => {
  window.history.replaceState(null, '', '/learn')
  vi.mocked(trackUsage).mockClear()
})
afterEach(() => {
  vi.restoreAllMocks()
  if (originalClipboard)
    Object.defineProperty(navigator, 'clipboard', originalClipboard)
  else Reflect.deleteProperty(navigator, 'clipboard')
})

describe('A chalk in the address', () => {
  it('names the three perspectives the way the tray does', () => {
    expect(chalks.map((chalk) => [chalk.color, chalk.mode])).toEqual(
      Object.entries(chalkColours),
    )
    expect(chalkColourOf('it-cyber')).toBe('yellow')
  })

  it.each([
    ['white', 'beginner'],
    ['yellow', 'it-cyber'],
    ['blue', 'compliance'],
  ] as const)('opens Explain in the %s chalk', (colour, mode) => {
    expect(parse(`${search}&chalk=${colour}`)).toEqual({
      mode,
      tab: 'explain',
      notices: [],
    })
  })

  it('lets an explicit view stand and owns the perspective over mode=', () => {
    expect(parse(`${search}&chalk=blue&tab=evidence&mode=beginner`)).toEqual({
      mode: 'compliance',
      tab: 'evidence',
      notices: [],
    })
    expect(parse(`${search}&chalk=yellow&tab=decode`)).toEqual({
      mode: 'it-cyber',
      tab: 'decode',
      notices: [],
    })
    expect(parse(`${search}&chalk=blue&mode=wizard`)).toEqual({
      mode: 'compliance',
      tab: 'explain',
      notices: [],
    })
    // The page shows Decode with a line for a Level 1 control asked for Rev 3.
    expect(
      parse(
        `${search.replace('ac-l2-3-1-1', 'ac-l1-b-1-i')}&chalk=yellow&tab=rev3`,
      ),
    ).toEqual({ mode: 'it-cyber', tab: 'rev3', notices: [] })
  })

  it('shows the white chalk on Explain, and says so, for a colour the tray lacks', () => {
    for (const colour of ['green', 'White', ''])
      expect(parse(`${search}&chalk=${colour}&mode=compliance`)).toEqual({
        mode: 'beginner',
        tab: 'explain',
        notices: ['chalk-reset'],
      })
  })

  it('is read like the other keys: once per address, on a lesson, never by discovery', () => {
    expect(
      parseExplorerSearch(`${search}&chalk=blue&chalk=white`, explorerCatalog),
    ).toMatchObject({ kind: 'invalid', reason: 'duplicate-parameter' })
    expect(parseExplorerSearch('?chalk=yellow', explorerCatalog)).toMatchObject(
      { kind: 'invalid', reason: 'invalid-view' },
    )
    expect(parse('?view=discover&collection=references&chalk=yellow')).toEqual({
      mode: 'beginner',
      tab: 'decode',
      notices: [],
    })
  })

  it('builds a chalk link without a mode or view and reads it back', () => {
    const built = new URL(
      createChalkUrl(
        {
          frameworkId: 'cmmc',
          editionId: 'cmmc-2-13-sep-2024',
          controlKey: item.key,
        },
        'it-cyber',
        new URL('http://localhost/learn?q=private&tab=evidence#old'),
      ),
    )
    expect(built.pathname).toBe('/learn')
    expect(built.search).toBe(`${search}&chalk=yellow`)
    expect(built.hash).toBe('#explorer')
    expect(parse(built.search)).toEqual({
      mode: 'it-cyber',
      tab: 'explain',
      notices: [],
    })
  })

  it('opens the yellow chalk from a link and rewrites the address once, without a history entry', async () => {
    window.history.replaceState(null, '', `${base}&chalk=yellow`)
    const replaceState = vi.spyOn(window.history, 'replaceState')
    const pushState = vi.spyOn(window.history, 'pushState')
    render(<App />)
    expect(
      await screen.findByRole('tab', { name: 'I run the systems' }),
    ).toHaveAttribute('aria-selected', 'true')
    await waitFor(() => expect(param('chalk')).toBeNull())
    expect(param('mode')).toBe('it-cyber')
    expect(param('tab')).toBe('explain')
    expect(replaceState).toHaveBeenCalledTimes(1)
    expect(pushState).not.toHaveBeenCalled()
  })

  it('says why for a colour the tray lacks and writes the white chalk into the address', async () => {
    window.history.replaceState(null, '', `${base}&chalk=green`)
    render(<App />)
    expect(
      await screen.findByText(
        'That chalk is not in the tray; showing the white one.',
      ),
    ).toBeVisible()
    await waitFor(() => expect(param('chalk')).toBeNull())
    expect(param('mode')).toBe('beginner')
    expect(param('tab')).toBe('explain')
    expect(
      screen.getByRole('tab', { name: chalkFor('beginner').prompt }),
    ).toHaveAttribute('aria-selected', 'true')
  })

  it('copies a link for the chalk in hand with the usual feedback, sending nothing but the event', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    clipboard({ writeText })
    window.history.replaceState(null, '', `${base}&mode=compliance&tab=explain`)
    render(<App />)
    await screen.findByRole('heading', { level: 1, name: item.title })
    const actions = within(document.querySelector('.control-actions')!)
    await user.click(actions.getByRole('button', { name: 'Send this chalk' }))
    expect(writeText).toHaveBeenCalledTimes(1)
    const copied = new URL(writeText.mock.calls[0]![0] as string)
    expect(copied.searchParams.get('chalk')).toBe('blue')
    expect(copied.searchParams.get('mode')).toBeNull()
    expect(copied.searchParams.get('tab')).toBeNull()
    expect(copied.searchParams.get('control')).toBe('ac-l2-3-1-1')
    expect(copied.hash).toBe('#explorer')
    expect(await actions.findByText('Chalk link copied.')).toBeVisible()
    expect(trackUsage).toHaveBeenCalledWith({
      name: 'share_link',
      lesson: {
        frameworkId: 'cmmc',
        editionId: 'cmmc-2-13-sep-2024',
        controlKey: 'ac-l2-3-1-1',
      },
      action: 'copied',
    })
    expect(JSON.stringify(vi.mocked(trackUsage).mock.calls)).not.toContain(
      'chalk',
    )
    // The reference link still copies the full address with the mode and view.
    await user.click(
      actions.getByRole('button', { name: 'Copy reference link' }),
    )
    const reference = new URL(writeText.mock.calls[1]![0] as string)
    expect(reference.searchParams.get('mode')).toBe('compliance')
    expect(reference.searchParams.get('tab')).toBe('explain')
    expect(reference.searchParams.get('chalk')).toBeNull()
  })

  it('offers the chalk link to select, focused, when copying is unavailable', async () => {
    const user = userEvent.setup()
    clipboard(undefined)
    window.history.replaceState(null, '', `${base}&mode=it-cyber`)
    render(<App />)
    await screen.findByRole('heading', { level: 1, name: item.title })
    await user.click(screen.getByRole('button', { name: 'Send this chalk' }))
    const fallback = screen.getByRole('textbox', { name: 'Chalk link' })
    expect(fallback).toHaveFocus()
    expect(
      new URL((fallback as HTMLTextAreaElement).value).searchParams.get(
        'chalk',
      ),
    ).toBe('yellow')
    expect(
      screen.getByText("Copy isn't available. Select the link below."),
    ).toBeVisible()
    expect(trackUsage).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'share_link', action: 'fallback' }),
    )
  })
})
