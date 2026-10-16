import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { chalkFor } from '../components/board/chalks'
import { trackUsage } from './usage'

vi.mock('./usage', () => ({ trackUsage: vi.fn() }))

// The first version's demo link; it opens AC.L2-3.1.1, the control it taught,
// and that is the identity every event carries.
const lesson = {
  frameworkId: 'cmmc',
  editionId: 'cmmc-2-13-sep-2024',
  controlKey: 'ac-l2-3-1-1',
}

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
    await screen.findByRole(
      'region',
      { name: 'Control Explorer' },
      { timeout: 5000 },
    )
    // The view is counted once the lazy page subscribes to the address.
    await waitFor(() =>
      expect(trackUsage).toHaveBeenCalledWith({
        name: 'control_view',
        lesson,
        mode: 'beginner',
      }),
    )
    vi.mocked(trackUsage).mockClear()
    await user.click(screen.getByRole('link', { name: 'Explain' }))
    const white = await screen.findByRole('tab', {
      name: chalkFor('beginner').prompt,
    })
    await user.click(white)
    expect(trackUsage).not.toHaveBeenCalled()
    await user.click(
      screen.getByRole('tab', { name: chalkFor('it-cyber').prompt }),
    )
    expect(trackUsage).toHaveBeenCalledWith({
      name: 'perspective_change',
      lesson,
      mode: 'it-cyber',
    })
    vi.mocked(trackUsage).mockClear()
    act(() => {
      window.history.replaceState(
        null,
        '',
        '/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access&mode=compliance&tab=explain',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(
      screen.getByRole('tabpanel', { name: chalkFor('compliance').prompt }),
    ).toBeVisible()
    expect(trackUsage).toHaveBeenCalledTimes(1)
    expect(trackUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'control_view',
        lesson,
        mode: 'compliance',
      }),
    )
    expect(JSON.stringify(vi.mocked(trackUsage).mock.calls)).not.toContain(
      'readme-example',
    )
    // The lazy page and the teaching chunk both load here; a loaded runner is slow.
  }, 15000)

  it('records search outcomes only when submitted or left, without recording the text', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole(
      'region',
      { name: 'Control Explorer' },
      { timeout: 5000 },
    )
    // The lesson left on screen by the previous test reports its view once its
    // chunk loads; wait for that so it cannot land among the search events.
    await waitFor(() =>
      expect(trackUsage).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'control_view' }),
      ),
    )
    vi.mocked(trackUsage).mockClear()
    const search = screen.getByRole('searchbox', { name: 'Find controls' })
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
      resultCount: 6,
    })
  })

  it('records practice actions without answers and successful sharing without URLs', async () => {
    const user = userEvent.setup()
    render(<App />)
    const explorer = within(
      await screen.findByRole(
        'region',
        { name: 'Control Explorer' },
        { timeout: 5000 },
      ),
    )
    await user.click(explorer.getByRole('link', { name: 'Practice' }))
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
    await user.click(
      explorer.getByRole('button', { name: 'Copy reference link' }),
    )
    expect(write).toHaveBeenCalled()
    expect(trackUsage).toHaveBeenLastCalledWith({
      name: 'share_link',
      lesson,
      action: 'copied',
    })
    expect(JSON.stringify(vi.mocked(trackUsage).mock.calls)).not.toContain(
      'http',
    )
    write.mockRestore()
  })
})
