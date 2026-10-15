import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { referenceControls } from '../../data/content'
import { learningActivities } from '../../data/learning'
import { renderWithProgress } from '../../test/renderWithProgress'
import { LearningPractice } from '../LearningPractice'
import { ChalkTray } from './ChalkTray'
import { SMUDGE_KEY, setSmudgeOn } from './tray-state'

function control(id: string) {
  const found = referenceControls.find((item) => item.id === id)
  if (!found) throw new Error(`Missing control ${id}`)
  return found
}
const first = control('AC.L1-b.1.i')
const second = control('AC.L1-b.1.ii')
const address = (key: string) =>
  `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=beginner`
const smudge = () => document.querySelector('.smudge')!
const pose = () => smudge().getAttribute('data-pose')

async function openFirst() {
  window.history.replaceState(null, '', address(first.key))
  render(<App />)
  await screen.findByRole(
    'heading',
    { level: 1, name: first.title },
    { timeout: 5000 },
  )
  // The control page turns the tray into the chalk switch, which mounts Smudge
  // afresh; wait for that tray and let its effects settle before poking him.
  await screen.findByRole('navigation', { name: 'Pick a chalk' })
  await act(async () => {})
}

beforeEach(() => {
  window.localStorage.clear()
  setSmudgeOn(true)
  window.history.replaceState(null, '', '/learn')
})
afterEach(() => vi.useRealTimers())

describe('Smudge', () => {
  it('is the eraser on the tray: a face with nothing to read and nothing to focus', async () => {
    await openFirst()
    const him = smudge()
    expect(him).toHaveAttribute('aria-hidden', 'true')
    expect(him.closest('.chalk-tray')).not.toBeNull()
    expect(pose()).toBe('idle')
    expect(him.querySelectorAll('.smudge-eye')).toHaveLength(2)
    expect(him.querySelector('.smudge-felt')).not.toBeNull()
    expect(him.textContent).toBe('')
    expect(him.querySelectorAll('a, button, input, [tabindex]')).toHaveLength(0)
    // The tray's white chalk is a stick again, beside the other two.
    expect(document.querySelectorAll('.chalk-tray .tray-stick')).toHaveLength(3)
  })

  it('sweeps with the Erase while the next control is focused and announced at once, then nudges the chalk that was picked', async () => {
    const user = userEvent.setup()
    await openFirst()
    await user.click(screen.getByRole('button', { name: `Next: ${second.id}` }))
    expect(pose()).toBe('sweep')
    expect(smudge().querySelector('.smudge-eyes-closed')).not.toBeNull()
    // The sweep is the Erase's: the new control is already underneath.
    expect(
      screen.getByRole('heading', { level: 1, name: second.title }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(`${second.id}: ${second.title}`, {
        selector: '[role="status"]',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Next: / })).toHaveFocus()
    await waitFor(() => expect(pose()).toBe('idle'), { timeout: 1500 })
    const picks = within(
      screen.getByRole('navigation', { name: 'Pick a chalk' }),
    ).getAllByRole('button')
    await user.click(
      picks.find((pick) => pick.textContent === 'yellow chalk: runs systems')!,
    )
    expect(pose()).toBe('hand')
    expect(smudge().querySelector('.smudge-stick-yellow')).not.toBeNull()
    await waitFor(() => expect(pose()).toBe('idle'), { timeout: 1500 })
    expect(smudge().querySelector('.smudge-stick')).toBeNull()
  })

  it('sneezes when clicked, and nothing else happens', async () => {
    await openFirst()
    const before = window.location.href
    fireEvent.click(smudge())
    expect(pose()).toBe('sneeze')
    expect(smudge().querySelector('.smudge-sneeze')).not.toBeNull()
    expect(window.location.href).toBe(before)
    expect(
      screen.getByRole('heading', { level: 1, name: first.title }),
    ).toBeInTheDocument()
    await waitFor(() => expect(pose()).toBe('idle'), { timeout: 1500 })
  })

  it('sneezes at a correct practice answer, not at a wrong one, and not at the finish', async () => {
    const user = userEvent.setup()
    const activity = learningActivities.find(
      (item) => item.questions.length >= 2,
    )!
    renderWithProgress(
      <>
        <ChalkTray />
        <LearningPractice lesson={activity.lesson} />
      </>,
    )
    expect(pose()).toBe('idle')
    await user.click(
      screen.getByText('Check your understanding', { selector: 'summary' }),
    )
    const [wrongOne, rightOne, ...rest] = activity.questions
    const wrong = wrongOne!.choices.find(
      (choice) => choice.id !== wrongOne!.correctChoiceId,
    )!
    await user.click(screen.getByRole('radio', { name: wrong.label }))
    await user.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(pose()).toBe('idle')
    await user.click(screen.getByRole('button', { name: 'Next question' }))
    const right = rightOne!.choices.find(
      (choice) => choice.id === rightOne!.correctChoiceId,
    )!
    await user.click(screen.getByRole('radio', { name: right.label }))
    await user.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(pose()).toBe('sneeze')
    await waitFor(() => expect(pose()).toBe('idle'), { timeout: 1500 })
    for (const question of rest) {
      await user.click(screen.getByRole('button', { name: 'Next question' }))
      await user.click(
        screen.getByRole('radio', { name: question.choices[0]!.label }),
      )
      await user.click(screen.getByRole('button', { name: 'Check answer' }))
      await waitFor(() => expect(pose()).toBe('idle'), { timeout: 1500 })
    }
    await user.click(screen.getByRole('button', { name: 'Finish practice' }))
    expect(
      screen.getByRole('heading', {
        name: 'Practice complete. Keep asking why.',
      }),
    ).toHaveFocus()
    expect(pose()).toBe('idle')
    expect(smudge().textContent).toBe('')
  })

  it('puffs a little dust about once a minute, once, and not again after a gesture', () => {
    vi.useFakeTimers()
    render(<ChalkTray />)
    const puff = () => smudge().querySelector('.smudge-puff')
    act(() => {
      vi.advanceTimersByTime(49_000)
    })
    expect(puff()).toBeNull()
    act(() => {
      vi.advanceTimersByTime(1_000)
    })
    expect(puff()).not.toBeNull()
    act(() => {
      vi.advanceTimersByTime(1_600)
    })
    expect(puff()).toBeNull()
    // A gesture ending later does not bring the puff back.
    fireEvent.click(smudge())
    expect(pose()).toBe('sneeze')
    act(() => {
      vi.advanceTimersByTime(1_000)
    })
    expect(pose()).toBe('idle')
    expect(puff()).toBeNull()
  })

  it('dozes after a minute with no input, wakes at a key or pointer, and never dozes while off', async () => {
    vi.useFakeTimers()
    render(<ChalkTray />)
    expect(pose()).toBe('idle')
    act(() => {
      vi.advanceTimersByTime(59_000)
    })
    expect(pose()).toBe('idle')
    act(() => {
      vi.advanceTimersByTime(1_000)
    })
    expect(pose()).toBe('doze')
    expect(smudge().querySelector('.smudge-zs')).not.toBeNull()
    expect(smudge().querySelector('.smudge-eye')).toBeNull()
    fireEvent.keyDown(window, { key: 'j' })
    expect(pose()).toBe('idle')
    expect(smudge().querySelector('.smudge-zs')).toBeNull()
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(pose()).toBe('doze')
    fireEvent.pointerMove(window, { pointerType: 'mouse' })
    expect(pose()).toBe('idle')
    // Switched off while dozing (a bare click, as a screen reader sends), the
    // plain eraser shows no z's, and he wakes fresh when switched back on.
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(pose()).toBe('doze')
    act(() => setSmudgeOn(false))
    expect(pose()).toBeNull()
    expect(smudge().querySelector('.smudge-zs')).toBeNull()
    act(() => setSmudgeOn(true))
    expect(pose()).toBe('idle')
  })

  it('has an off switch in the footer: off is the plain eraser that makes no gesture, and is remembered', async () => {
    const user = userEvent.setup()
    await openFirst()
    const footer = within(screen.getByRole('contentinfo'))
    const toggle = footer.getByRole('switch', { name: 'Smudge' })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(toggle).toHaveTextContent('Smudge: on')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(toggle).toHaveTextContent('Smudge: off')
    expect(smudge()).toHaveClass('is-off')
    expect(smudge().querySelector('.smudge-face')).toBeNull()
    expect(smudge().querySelector('.smudge-felt')).not.toBeNull()
    expect(pose()).toBeNull()
    expect(window.localStorage.getItem(SMUDGE_KEY)).toBe('off')
    await user.click(screen.getByRole('button', { name: /^Next: / }))
    expect(pose()).toBeNull()
    fireEvent.click(smudge())
    expect(pose()).toBeNull()
  })

  it('turns back on from the switch when it was off', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem(SMUDGE_KEY, 'off')
    setSmudgeOn(false)
    await openFirst()
    expect(smudge()).toHaveClass('is-off')
    const toggle = within(screen.getByRole('contentinfo')).getByRole('switch', {
      name: 'Smudge',
    })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(smudge()).not.toHaveClass('is-off')
    expect(smudge().querySelector('.smudge-face')).not.toBeNull()
    expect(window.localStorage.getItem(SMUDGE_KEY)).toBeNull()
  })
})
