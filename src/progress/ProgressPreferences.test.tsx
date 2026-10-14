import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { learningActivities } from '../data/learning'
import { LocalProgressProvider } from './LocalProgressProvider'
import { ProgressPreferences } from './ProgressPreferences'
import { useActivityProgress } from './useLocalProgress'
import {
  browserProgressPort,
  PROGRESS_CONSENT_KEY,
  PROGRESS_DATA_KEY,
} from './store'

const activity = learningActivities[0]!
const question = activity.questions[0]!

function PracticeHarness() {
  const { entry, checked, store, questionIndex } = useActivityProgress(activity)
  return (
    <>
      <p>Current question: {questionIndex + 1}</p>
      <p>Checked here: {String(checked)}</p>
      <p>Marked to revisit: {String(entry.revisit)}</p>
      <button
        onClick={() =>
          store.checkAnswer(activity.id, question.id, question.correctChoiceId)
        }
      >
        Check a known answer
      </button>
      <button onClick={() => store.markRevisit(activity.id, !entry.revisit)}>
        Toggle revisit
      </button>
    </>
  )
}

function Fixture() {
  return (
    <LocalProgressProvider activities={learningActivities}>
      <ProgressPreferences />
      <PracticeHarness />
    </LocalProgressProvider>
  )
}

beforeEach(() => {
  window.localStorage.clear()
  Object.defineProperty(navigator, 'doNotTrack', {
    configurable: true,
    value: '0',
  })
  Object.defineProperty(navigator, 'globalPrivacyControl', {
    configurable: true,
    value: false,
  })
})
afterEach(() => vi.restoreAllMocks())

describe('optional learning settings', () => {
  it('explains the storage scope, saves only on opt-in, and resets the visible practice on deletion', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('dummy-down:usage-preference', 'off')
    render(<Fixture />)
    await user.click(screen.getByText('Learning progress on this browser'))
    expect(screen.getByRole('status')).toHaveTextContent('Saving is off.')
    expect(screen.getByText(/Anyone using this profile can see/)).toBeVisible()
    expect(screen.getByText(/does not change usage measurement/)).toBeVisible()
    await user.click(
      screen.getByRole('button', { name: 'Check a known answer' }),
    )
    expect(window.localStorage.getItem(PROGRESS_DATA_KEY)).toBeNull()
    await user.click(
      screen.getByRole('button', { name: 'Save learning on this browser' }),
    )
    expect(screen.getByRole('status')).toHaveTextContent('Saving is on')
    expect(screen.getByRole('status')).toHaveFocus()
    await user.tab()
    expect(
      screen.getByRole('button', { name: 'Delete progress and stop saving' }),
    ).toHaveFocus()
    expect(window.localStorage.getItem(PROGRESS_CONSENT_KEY)).toBe('on')
    expect(
      JSON.parse(window.localStorage.getItem(PROGRESS_DATA_KEY)!).entries[0]
        .checkedAnswers,
    ).toEqual({ [question.id]: question.correctChoiceId })
    await user.click(screen.getByRole('button', { name: 'Toggle revisit' }))
    expect(screen.getByText('Marked to revisit: true')).toBeVisible()
    await user.click(
      screen.getByRole('button', { name: 'Delete progress and stop saving' }),
    )
    expect(screen.getByText('Checked here: false')).toBeVisible()
    expect(screen.getByText('Marked to revisit: false')).toBeVisible()
    expect(window.localStorage.getItem(PROGRESS_DATA_KEY)).toBeNull()
    expect(window.localStorage.getItem(PROGRESS_CONSENT_KEY)).toBeNull()
    expect(window.localStorage.getItem('dummy-down:usage-preference')).toBe(
      'off',
    )
  })

  it.each([
    ['doNotTrack', '1'],
    ['doNotTrack', 'yes'],
    ['globalPrivacyControl', true],
  ])(
    'respects %s without coupling saving to analytics preferences',
    async (name, value) => {
      const user = userEvent.setup()
      Object.defineProperty(navigator, name, { configurable: true, value })
      window.localStorage.setItem('dummy-down:usage-preference', 'on')
      expect(browserProgressPort().privacyBlocked()).toBe(true)
      render(<Fixture />)
      await user.click(screen.getByText('Learning progress on this browser'))
      expect(screen.getByRole('status')).toHaveTextContent(
        'browser privacy signal is on',
      )
      expect(
        screen.getByRole('button', { name: 'Save learning on this browser' }),
      ).toBeDisabled()
      await user.click(
        screen.getByRole('button', { name: 'Check a known answer' }),
      )
      expect(screen.getByText('Checked here: true')).toBeVisible()
      expect(window.localStorage.getItem(PROGRESS_DATA_KEY)).toBeNull()
      expect(window.localStorage.getItem('dummy-down:usage-preference')).toBe(
        'on',
      )
    },
  )

  it('updates the mounted learner when another tab clears the saving keys', async () => {
    const user = userEvent.setup()
    render(<Fixture />)
    await user.click(screen.getByText('Learning progress on this browser'))
    await user.click(
      screen.getByRole('button', { name: 'Save learning on this browser' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Check a known answer' }),
    )
    act(() => {
      window.localStorage.removeItem(PROGRESS_CONSENT_KEY)
      window.localStorage.removeItem(PROGRESS_DATA_KEY)
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: PROGRESS_CONSENT_KEY,
          newValue: null,
          storageArea: window.localStorage,
        }),
      )
    })
    expect(screen.getByText('Checked here: false')).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('Saving is off.')
  })

  it('reports unconfirmed deletion instead of claiming browser data was erased', async () => {
    const user = userEvent.setup()
    render(<Fixture />)
    await user.click(screen.getByText('Learning progress on this browser'))
    await user.click(
      screen.getByRole('button', { name: 'Save learning on this browser' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Check a known answer' }),
    )
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    await user.click(
      screen.getByRole('button', { name: 'Delete progress and stop saving' }),
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'browser did not confirm deletion',
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'clear this site’s data',
    )
    expect(screen.getByText('Checked here: false')).toBeVisible()
    expect(window.localStorage.getItem(PROGRESS_DATA_KEY)).not.toBeNull()
  })
})
