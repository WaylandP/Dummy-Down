import { StrictMode } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { trackUsage } from './usage'

vi.mock('./usage', () => ({ trackUsage: vi.fn() }))
beforeEach(() => {
  window.history.replaceState(null, '', '/')
  vi.mocked(trackUsage).mockClear()
})

describe('Known control render measurement', () => {
  it('counts a shared control in StrictMode once without logging address or discovery text', async () => {
    window.history.replaceState(
      null,
      '',
      '/?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=it-cyber&q=private-topic',
    )
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    await screen.findByRole('heading', {
      level: 1,
      name: 'Authorized Access Control [FCI Data]',
    })
    // The view is recorded in a passive effect after the lazy page's first paint.
    const views = () =>
      vi
        .mocked(trackUsage)
        .mock.calls.filter(([event]) => event.name === 'control_view')
    await waitFor(() => expect(views()).toHaveLength(1))
    const calls = views()
    expect(calls[0]?.[0]).toEqual({
      name: 'control_view',
      lesson: {
        frameworkId: 'cmmc',
        editionId: 'cmmc-2-13-sep-2024',
        controlKey: 'ac-l1-b-1-i',
      },
      mode: 'it-cyber',
    })
    expect(JSON.stringify(calls)).not.toContain('private-topic')
    expect(JSON.stringify(calls)).not.toContain('http')
  })

  it('does not report unknown lessons and counts re-entry through browser history separately from intent', async () => {
    window.history.replaceState(
      null,
      '',
      '/?view=lesson&framework=cmmc&edition=readme-example&control=missing',
    )
    render(<App />)
    await screen.findByRole('region', { name: 'Control Explorer' })
    expect(trackUsage).not.toHaveBeenCalled()
    const replay = (address: string) =>
      act(() => {
        window.history.replaceState(null, '', address)
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
    replay(
      '/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access',
    )
    // The lazy page's address subscription settles after its first paint.
    await waitFor(() => expect(trackUsage).toHaveBeenCalledTimes(1))
    replay(
      '/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access&q=access',
    )
    expect(trackUsage).toHaveBeenCalledTimes(1)
    replay('/?view=discover&catalog=cmmc')
    replay(
      '/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access',
    )
    expect(trackUsage).toHaveBeenCalledTimes(2)
    expect(
      vi
        .mocked(trackUsage)
        .mock.calls.every(([event]) => event.name === 'control_view'),
    ).toBe(true)
  })
})
