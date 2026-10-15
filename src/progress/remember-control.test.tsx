import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import {
  LAST_CONTROL_KEY,
  PROGRESS_CONSENT_KEY,
  PROGRESS_DATA_KEY,
} from './store'

vi.mock('../analytics/usage', () => ({ trackUsage: vi.fn() }))

const lesson =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l2-3-1-1&mode=beginner'
const identity = {
  frameworkId: 'cmmc',
  editionId: 'cmmc-2-13-sep-2024',
  controlKey: 'ac-l2-3-1-1',
}

beforeEach(() => window.localStorage.clear())
afterEach(() => window.localStorage.clear())

describe('The control page remembers the control on screen', () => {
  it('writes it only when saving is on, and keeps it current as the lesson changes', async () => {
    window.history.replaceState(null, '', lesson)
    const off = render(<App />)
    await screen.findByRole(
      'heading',
      { level: 1, name: /Authorized Access/ },
      { timeout: 5000 },
    )
    expect(window.localStorage.getItem(LAST_CONTROL_KEY)).toBeNull()
    expect(Object.keys(window.localStorage)).toEqual([])
    off.unmount()

    window.localStorage.setItem(PROGRESS_CONSENT_KEY, 'on')
    window.localStorage.setItem(
      PROGRESS_DATA_KEY,
      JSON.stringify({ schema: 1, entries: [] }),
    )
    render(<App />)
    await screen.findByRole(
      'heading',
      { level: 1, name: /Authorized Access/ },
      { timeout: 5000 },
    )
    await waitFor(() =>
      expect(
        JSON.parse(window.localStorage.getItem(LAST_CONTROL_KEY) ?? 'null'),
      ).toEqual(identity),
    )
    expect(window.localStorage.getItem(LAST_CONTROL_KEY)).not.toContain(
      'Authorized',
    )
  })

  it('records nothing for a lesson that does not resolve', async () => {
    window.localStorage.setItem(PROGRESS_CONSENT_KEY, 'on')
    window.localStorage.setItem(
      PROGRESS_DATA_KEY,
      JSON.stringify({ schema: 1, entries: [] }),
    )
    window.history.replaceState(
      null,
      '',
      '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=no-such-control',
    )
    render(<App />)
    await screen.findByRole(
      'region',
      { name: 'Control Explorer' },
      { timeout: 5000 },
    )
    expect(window.localStorage.getItem(LAST_CONTROL_KEY)).toBeNull()
  })
})
