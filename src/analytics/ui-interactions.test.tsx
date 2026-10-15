import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { trackUsage } from './usage'

vi.mock('./usage', () => ({ trackUsage: vi.fn() }))

beforeEach(() => {
  window.history.replaceState(
    null,
    '',
    '/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access',
  )
  vi.mocked(trackUsage).mockClear()
})

describe('Usage interaction wiring', () => {
  it('keeps rendered controls separate from intent and ignores unchanged selection', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('region', { name: 'Control Explorer' })
    // The view is counted once the lazy page subscribes to the address.
    await waitFor(() =>
      expect(trackUsage).toHaveBeenCalledWith({
        name: 'control_view',
        lesson: {
          frameworkId: 'cmmc',
          editionId: 'readme-example',
          controlKey: 'authorized-access',
        },
        mode: 'beginner',
      }),
    )
    vi.mocked(trackUsage).mockClear()
    await user.click(screen.getByRole('tab', { name: 'Beginner' }))
    expect(trackUsage).not.toHaveBeenCalled()
    await user.click(screen.getByRole('tab', { name: 'IT & Cyber' }))
    expect(trackUsage).toHaveBeenCalledWith({
      name: 'perspective_change',
      lesson: {
        frameworkId: 'cmmc',
        editionId: 'readme-example',
        controlKey: 'authorized-access',
      },
      mode: 'it-cyber',
    })
    vi.mocked(trackUsage).mockClear()
    act(() => {
      window.history.replaceState(
        null,
        '',
        '/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access&mode=compliance',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByRole('tabpanel', { name: 'Compliance' })).toBeVisible()
    expect(trackUsage).toHaveBeenCalledTimes(1)
    expect(trackUsage).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'control_view', mode: 'compliance' }),
    )
  })

  it('records search outcomes only when submitted or left, without recording the text', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('region', { name: 'Control Explorer' })
    vi.mocked(trackUsage).mockClear()
    const search = screen.getByRole('searchbox', { name: 'Search controls' })
    await user.type(search, 'private-example-search')
    expect(trackUsage).not.toHaveBeenCalled()
    await user.keyboard('{Enter}')
    expect(trackUsage).toHaveBeenLastCalledWith({
      name: 'search_used',
      scope: 'explorer',
      active: true,
      resultCount: 0,
    })
    await user.tab()
    expect(trackUsage).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(vi.mocked(trackUsage).mock.calls)).not.toContain(
      'private-example-search',
    )
  })

  it('ignores an untouched search field and measures another edit separately', async () => {
    window.history.replaceState(null, '', '/glossary')
    const user = userEvent.setup()
    render(<App />)
    vi.mocked(trackUsage).mockClear()
    const search = screen.getByRole('searchbox', { name: 'Search words' })
    await user.click(search)
    await user.tab()
    expect(trackUsage).not.toHaveBeenCalled()
    await user.type(search, 'account')
    await user.keyboard('{Enter}')
    await user.tab()
    expect(trackUsage).toHaveBeenCalledTimes(1)
    await user.clear(search)
    await user.type(search, 'device')
    await user.tab()
    expect(trackUsage).toHaveBeenCalledTimes(2)
    expect(trackUsage).toHaveBeenLastCalledWith({
      name: 'search_used',
      scope: 'glossary',
      active: true,
      resultCount: 5,
    })
  })

  it('records practice actions without answers and successful sharing without URLs', async () => {
    const user = userEvent.setup()
    render(<App />)
    const explorer = within(
      await screen.findByRole('region', { name: 'Control Explorer' }),
    )
    await user.click(explorer.getByText('Check your understanding'))
    await user.click(explorer.getAllByRole('radio')[0]!)
    await user.click(explorer.getByRole('button', { name: 'Check answer' }))
    expect(trackUsage).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'practice_action', action: 'check' }),
    )
    expect(
      vi
        .mocked(trackUsage)
        .mock.calls.every(
          ([event]) => !('answer' in event) && !('correct' in event),
        ),
    ).toBe(true)
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    await user.click(explorer.getByRole('button', { name: 'Copy lesson link' }))
    expect(write).toHaveBeenCalled()
    expect(trackUsage).toHaveBeenLastCalledWith({
      name: 'share_link',
      lesson: {
        frameworkId: 'cmmc',
        editionId: 'readme-example',
        controlKey: 'authorized-access',
      },
      action: 'copied',
    })
    expect(JSON.stringify(vi.mocked(trackUsage).mock.calls)).not.toContain(
      'http',
    )
    write.mockRestore()
  })
})
