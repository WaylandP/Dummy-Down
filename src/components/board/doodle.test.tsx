import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { trackUsage } from '../../analytics/usage'
import { referenceControls } from '../../data/content'
import { strokePath } from './doodle-path'
import { putDownDoodle } from './doodle-state'
import { setSmudgeOn } from './tray-state'

vi.mock('../../analytics/usage', () => ({ trackUsage: vi.fn() }))

const stick = () => screen.getByRole('button', { name: 'Doodle chalk' })
const layer = () => document.querySelector<SVGSVGElement>('.doodle-layer')
const marks = () =>
  document.querySelectorAll(
    '.doodle-marks:not(.doodle-dust) path:not(.doodle-live)',
  )
const dust = () => document.querySelectorAll('.doodle-dust path')
const smudge = () => document.querySelector<HTMLElement>('.smudge')!
const line = () => document.querySelector<HTMLElement>('.footer-doodling')!

function draw(
  from: readonly [number, number],
  to: readonly [number, number],
  pointerId = 1,
  pointerType = 'mouse',
) {
  const target = layer()!
  fireEvent.pointerDown(target, {
    pointerId,
    pointerType,
    clientX: from[0],
    clientY: from[1],
  })
  fireEvent.pointerMove(target, {
    pointerId,
    pointerType,
    clientX: (from[0] + to[0]) / 2,
    clientY: (from[1] + to[1]) / 2,
  })
  fireEvent.pointerMove(target, {
    pointerId,
    pointerType,
    clientX: to[0],
    clientY: to[1],
  })
  fireEvent.pointerUp(target, { pointerId, pointerType })
}

function noRoom() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }))
}

beforeEach(() => {
  window.localStorage.clear()
  setSmudgeOn(true)
  vi.mocked(trackUsage).mockClear()
  window.history.replaceState(null, '', '/about')
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  putDownDoodle()
})

describe('the doodle chalk', () => {
  it('smooths a line through its points, and a tap is a dot', () => {
    expect(strokePath([])).toBe('')
    expect(strokePath([{ x: 4, y: 5 }])).toBe('M4.0 5.0l0.1 0')
    expect(
      strokePath([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ]),
    ).toBe('M0.0 0.0Q10.0 0.0 10.0 5.0L10.0 10.0')
  })

  it('is a button in the tray, pressed while the chalk is up, and the layer exists only then', async () => {
    const user = userEvent.setup()
    render(<App />)
    const footer = within(screen.getByRole('contentinfo'))
    expect(stick()).toHaveAttribute('aria-pressed', 'false')
    expect(stick().closest('.chalk-tray')).not.toBeNull()
    expect(layer()).toBeNull()
    // The line is in the page before it has anything to say, so it reads.
    expect(line()).toHaveAttribute('role', 'status')
    expect(line()).toBeEmptyDOMElement()
    expect(footer.getByText(/Independent and educational/)).toBeVisible()
    await user.click(stick())
    expect(stick()).toHaveAttribute('aria-pressed', 'true')
    expect(layer()).not.toBeNull()
    expect(layer()!.closest('#main')).not.toBeNull()
    expect(layer()).toHaveAttribute('aria-hidden', 'true')
    expect(line()).toHaveTextContent(
      'Doodling. Your marks stay on this screen only. Esc or the tray puts the chalk back. Click Smudge to wipe them.',
    )
    expect(footer.queryByText(/Independent and educational/)).toBeNull()
    expect(
      footer.queryByRole('link', { name: 'Assessment objectives' }),
    ).toBeNull()
    await user.click(stick())
    expect(stick()).toHaveAttribute('aria-pressed', 'false')
    expect(layer()).toBeNull()
    expect(line()).toBeEmptyDOMElement()
    expect(footer.getByText(/Independent and educational/)).toBeVisible()
  })

  it('answers d, and Escape or d again puts it down with focus back on the tray', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.keyboard('d')
    expect(stick()).toHaveAttribute('aria-pressed', 'true')
    expect(layer()).not.toBeNull()
    await user.keyboard('{Escape}')
    expect(stick()).toHaveAttribute('aria-pressed', 'false')
    expect(layer()).toBeNull()
    expect(stick()).toHaveFocus()
    screen.getByRole('link', { name: 'Home' }).focus()
    await user.keyboard('d')
    expect(layer()).not.toBeNull()
    await user.keyboard('d')
    expect(layer()).toBeNull()
    expect(stick()).toHaveFocus()
    // The keys dialog lists it, and with the dialog open Escape closes the
    // dialog and leaves the chalk where it is.
    await user.keyboard('d')
    await user.keyboard('?')
    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText('Pick up or put down the doodle chalk'),
    ).toBeVisible()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(layer()).not.toBeNull()
    await user.keyboard('{Escape}')
    expect(layer()).toBeNull()
  })

  it('takes a stroke from the pointer, which Smudge sweeps away as dust', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(stick())
    expect(marks()).toHaveLength(0)
    draw([10, 10], [60, 40])
    expect(marks()).toHaveLength(1)
    expect(marks()[0]!.getAttribute('d')).toMatch(/^M10\.0 10\.0Q/)
    draw([80, 80], [80, 80])
    expect(marks()).toHaveLength(2)
    vi.useFakeTimers()
    act(() => {
      smudge().click()
    })
    expect(smudge()).toHaveAttribute('data-pose', 'sweep')
    expect(marks()).toHaveLength(0)
    expect(dust()).toHaveLength(2)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(dust()).toHaveLength(0)
    // Nothing to wipe: a click is his sneeze again.
    act(() => {
      vi.advanceTimersByTime(400)
      smudge().click()
    })
    expect(smudge()).toHaveAttribute('data-pose', 'sneeze')
  })

  it('wipes the marks with the Erase when the control changes, and with the chalk going down', async () => {
    const first = referenceControls.find((item) => item.id === 'AC.L1-b.1.i')!
    window.history.replaceState(
      null,
      '',
      `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${first.key}&mode=beginner`,
    )
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole(
      'heading',
      { level: 1, name: first.title },
      { timeout: 5000 },
    )
    await screen.findByRole('navigation', { name: 'Pick a chalk' })
    await act(async () => {})
    await user.keyboard('d')
    draw([20, 20], [120, 90])
    expect(marks()).toHaveLength(1)
    await user.keyboard('j')
    await screen.findByRole('heading', { level: 1, name: /Transaction/ })
    expect(marks()).toHaveLength(0)
    expect(layer()).not.toBeNull()
    draw([20, 20], [120, 90])
    expect(marks()).toHaveLength(1)
    await user.keyboard('{Escape}')
    expect(layer()).toBeNull()
    await user.keyboard('d')
    expect(marks()).toHaveLength(0)
  })

  it('never stores the marks and never sends them', async () => {
    const user = userEvent.setup()
    render(<App />)
    const stored = vi.spyOn(Storage.prototype, 'setItem')
    const sent = vi.mocked(trackUsage).mock.calls.length
    await user.click(stick())
    draw([10, 10], [60, 40])
    draw([70, 10], [90, 40])
    act(() => {
      smudge().click()
    })
    await user.keyboard('{Escape}')
    expect(stored).not.toHaveBeenCalled()
    expect(vi.mocked(trackUsage).mock.calls).toHaveLength(sent)
    expect(window.localStorage.length).toBe(0)
  })

  it('scrolls under two fingers instead of drawing', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(stick())
    const scrolled = vi.fn()
    vi.stubGlobal('scrollBy', scrolled)
    const target = layer()!
    fireEvent.pointerDown(target, {
      pointerId: 1,
      pointerType: 'touch',
      clientX: 100,
      clientY: 300,
    })
    fireEvent.pointerDown(target, {
      pointerId: 2,
      pointerType: 'touch',
      clientX: 140,
      clientY: 310,
    })
    fireEvent.pointerMove(target, {
      pointerId: 2,
      pointerType: 'touch',
      clientX: 140,
      clientY: 250,
    })
    expect(scrolled).toHaveBeenCalledWith(0, 30)
    fireEvent.pointerUp(target, { pointerId: 2, pointerType: 'touch' })
    fireEvent.pointerUp(target, { pointerId: 1, pointerType: 'touch' })
    expect(marks()).toHaveLength(0)
  })

  it('clears the marks when the content narrows, and sweeps them for a faceless Smudge too', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(stick())
    draw([10, 10], [60, 40])
    expect(marks()).toHaveLength(1)
    const main = document.getElementById('main')!
    Object.defineProperty(main, 'clientWidth', {
      configurable: true,
      value: 900,
    })
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(marks()).toHaveLength(0)
    expect(dust()).toHaveLength(0)
    draw([10, 10], [60, 40])
    expect(marks()).toHaveLength(1)
    act(() => {
      setSmudgeOn(false)
    })
    expect(smudge()).not.toHaveAttribute('data-pose')
    act(() => {
      smudge().click()
    })
    expect(marks()).toHaveLength(0)
    expect(smudge()).not.toHaveAttribute('data-pose')
  })

  it('is not offered where the screen has no room for it', async () => {
    noRoom()
    const user = userEvent.setup()
    render(<App />)
    await user.keyboard('d')
    expect(layer()).toBeNull()
    await user.click(stick())
    expect(layer()).toBeNull()
    expect(stick()).toHaveAttribute('aria-pressed', 'false')
  })
})
