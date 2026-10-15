import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../App'
import { referenceControls } from '../../data/content'
import { learningActivities } from '../../data/learning'
import { renderWithProgress } from '../../test/renderWithProgress'
import { LearningPractice } from '../LearningPractice'
import { ChalkTray } from './ChalkTray'
import { DASH_KEY, setDashOn } from './tray-state'

function control(id: string) {
  const found = referenceControls.find((item) => item.id === id)
  if (!found) throw new Error(`Missing control ${id}`)
  return found
}
const first = control('AC.L1-b.1.i')
const address = (key: string, extra = '') =>
  `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=beginner${extra}`
const dash = () => document.querySelector('.dash')!
const gesture = () => dash().getAttribute('data-gesture')

beforeEach(() => {
  window.localStorage.clear()
  setDashOn(true)
  window.history.replaceState(null, '', '/learn')
})

describe('Dash', () => {
  it('is the white chalk in the tray: one stroke, two eyes, nothing to read', async () => {
    window.history.replaceState(null, '', address(first.key))
    render(<App />)
    await screen.findByRole(
      'heading',
      { level: 1, name: first.title },
      { timeout: 5000 },
    )
    const stick = dash()
    expect(stick).toHaveAttribute('aria-hidden', 'true')
    expect(stick.closest('.chalk-tray')).not.toBeNull()
    expect(stick.querySelectorAll('.dash-eye')).toHaveLength(2)
    expect(stick.textContent).toBe('')
    expect(gesture()).toBeNull()
  })

  it('sweeps once on Erase, nods once at a popover and lifts the chosen chalk, then is still', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', address(first.key))
    render(<App />)
    await screen.findByRole(
      'heading',
      { level: 1, name: first.title },
      { timeout: 5000 },
    )
    await user.click(screen.getByRole('button', { name: /^Next: / }))
    expect(gesture()).toBe('sweep')
    await waitFor(() => expect(gesture()).toBeNull(), { timeout: 1500 })
    const picks = within(
      screen.getByRole('navigation', { name: 'Pick a chalk' }),
    ).getAllByRole('button')
    await user.click(
      picks.find((pick) => pick.textContent === 'yellow chalk: runs systems')!,
    )
    expect(gesture()).toBe('hand')
    await waitFor(() => expect(gesture()).toBeNull(), { timeout: 1500 })
  })

  it('nods when a chalk popover opens', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', address(first.key, '&tab=explain'))
    render(<App />)
    const word = await screen.findByRole(
      'button',
      { name: 'devices' },
      { timeout: 5000 },
    )
    await user.click(word)
    await screen.findByRole('dialog', { name: 'Device' })
    expect(gesture()).toBe('nod')
  })

  it('has an off switch in the footer: off is a plain stub that makes no gesture, and is remembered', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', address(first.key))
    render(<App />)
    await screen.findByRole(
      'heading',
      { level: 1, name: first.title },
      { timeout: 5000 },
    )
    const footer = within(screen.getByRole('contentinfo'))
    const toggle = footer.getByRole('switch', { name: 'Dash' })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(toggle).toHaveTextContent('Dash: on')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(toggle).toHaveTextContent('Dash: off')
    expect(dash()).toHaveClass('is-still')
    expect(window.localStorage.getItem(DASH_KEY)).toBe('off')
    await user.click(screen.getByRole('button', { name: /^Next: / }))
    expect(gesture()).toBeNull()
  })

  it('turns back on from the switch when it was off', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(DASH_KEY, 'off')
    setDashOn(false)
    window.history.replaceState(null, '', address(first.key))
    render(<App />)
    await screen.findByRole(
      'heading',
      { level: 1, name: first.title },
      { timeout: 5000 },
    )
    expect(dash()).toHaveClass('is-still')
    const toggle = within(screen.getByRole('contentinfo')).getByRole('switch', {
      name: 'Dash',
    })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(dash()).not.toHaveClass('is-still')
    expect(window.localStorage.getItem(DASH_KEY)).toBeNull()
  })

  it('is joined by Dot only when a practice activity is finished here', async () => {
    const user = userEvent.setup()
    const activity = learningActivities[0]!
    renderWithProgress(
      <>
        <ChalkTray />
        <LearningPractice lesson={activity.lesson} />
      </>,
    )
    expect(gesture()).toBeNull()
    await user.click(
      screen.getByText('Check your understanding', { selector: 'summary' }),
    )
    for (const [index, question] of activity.questions.entries()) {
      await user.click(
        screen.getByRole('radio', { name: question.choices[0]!.label }),
      )
      await user.click(screen.getByRole('button', { name: 'Check answer' }))
      expect(gesture()).toBeNull()
      await user.click(
        screen.getByRole('button', {
          name:
            index === activity.questions.length - 1
              ? 'Finish practice'
              : 'Next question',
        }),
      )
    }
    expect(
      screen.getByRole('heading', {
        name: 'Practice complete. Keep asking why.',
      }),
    ).toHaveFocus()
    expect(gesture()).toBe('dot')
    expect(dash().querySelector('.dash-dot')).not.toBeNull()
    expect(dash().textContent).toBe('')
  })
})
