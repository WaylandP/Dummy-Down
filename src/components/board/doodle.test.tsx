import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { sanitizeUsageUrl } from '../../analytics/privacy'
import { trackUsage } from '../../analytics/usage'
import { referenceControls } from '../../data/content'
import { strokePath } from './doodle-path'
import { putDownDoodle, putDownSmudge, resetDoodle } from './doodle-state'
import { decodeInk, inkLimit } from './ink'
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
const eraser = () => screen.getByRole('button', { name: 'Smudge, the eraser' })
const line = () => document.querySelector<HTMLElement>('.footer-doodling')!
const control = (id: string) =>
  referenceControls.find((item) => item.id === id)!
const address = (key: string) =>
  `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=beginner`

/** jsdom lays nothing out: the content area is as wide as the test says. */
let contentWidth = 1000
function room(width: number) {
  contentWidth = width
  act(() => {
    window.dispatchEvent(new Event('resize'))
  })
}

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

/** Rub Smudge over a spot: down, a small move, up. */
function rub(at: readonly [number, number]) {
  const target = layer()!
  fireEvent.pointerDown(target, {
    pointerId: 1,
    pointerType: 'mouse',
    clientX: at[0],
    clientY: at[1],
  })
  fireEvent.pointerMove(target, {
    pointerId: 1,
    pointerType: 'mouse',
    clientX: at[0] + 3,
    clientY: at[1] + 3,
  })
  fireEvent.pointerUp(target, { pointerId: 1, pointerType: 'mouse' })
}

/** The fragment is written after the stroke, once it is encoded. */
async function fragmentWritten() {
  await waitFor(() => expect(window.location.hash).toMatch(/^#ink=v1/))
  return window.location.hash
}

function go(href: string) {
  act(() => {
    window.history.pushState(null, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
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
  window.sessionStorage.clear()
  setSmudgeOn(true)
  vi.mocked(trackUsage).mockClear()
  contentWidth = 1000
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => contentWidth,
  })
  window.history.replaceState(null, '', '/about')
  resetDoodle()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
  putDownSmudge()
  putDownDoodle()
  delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth
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

  it('is a button in the tray, pressed while the chalk is up, with the layer there while it is', async () => {
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
    expect(layer()).toHaveAttribute('data-mode', 'chalk')
    expect(line()).toHaveTextContent(
      'Doodling. Your marks stay on this page and go with its link. Esc or the tray puts the chalk back. Pick up Smudge to erase.',
    )
    expect(footer.queryByText(/Independent and educational/)).toBeNull()
    expect(
      footer.queryByRole('link', { name: 'Assessment objectives' }),
    ).toBeNull()
    await user.click(stick())
    expect(stick()).toHaveAttribute('aria-pressed', 'false')
    // Nothing drawn: nothing to keep, and the page is itself again.
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
    // The keys dialog lists the chalk and Smudge, and with the dialog open
    // Escape closes the dialog and leaves the chalk where it is.
    await user.keyboard('d')
    await user.keyboard('?')
    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText('Pick up or put down the doodle chalk'),
    ).toBeVisible()
    expect(
      within(dialog).getByText('Pick up or put down Smudge, the eraser'),
    ).toBeVisible()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(layer()).not.toBeNull()
    await user.keyboard('{Escape}')
    expect(layer()).toBeNull()
  })

  it('keeps the marks when the chalk goes down, and they go in the address, never in storage', async () => {
    const user = userEvent.setup()
    render(<App />)
    const stored = vi.spyOn(Storage.prototype, 'setItem')
    await user.click(stick())
    expect(marks()).toHaveLength(0)
    draw([10, 10], [60, 40])
    expect(marks()).toHaveLength(1)
    expect(marks()[0]!.getAttribute('d')).toMatch(/^M10\.0 10\.0/)
    draw([80, 80], [80, 80])
    expect(marks()).toHaveLength(2)
    const hash = await fragmentWritten()
    expect(await decodeInk(hash)).toEqual({
      width: 1000,
      strokes: [
        [
          { x: 10, y: 10 },
          { x: 60, y: 40 },
        ],
        [{ x: 80, y: 80 }],
      ],
    })
    expect(window.location.search).toBe('')
    // The chalk goes back; the marks stay, under a layer that lets the page
    // through, and the line is the site's again.
    await user.keyboard('{Escape}')
    expect(stick()).toHaveAttribute('aria-pressed', 'false')
    expect(layer()).not.toBeNull()
    expect(layer()).not.toHaveAttribute('data-mode')
    expect(marks()).toHaveLength(2)
    expect(line()).toBeEmptyDOMElement()
    expect(window.location.hash).toBe(hash)
    expect(stored).not.toHaveBeenCalled()
    expect(window.localStorage.length).toBe(0)
    expect(window.sessionStorage.length).toBe(0)
    // Analytics never sees the fragment: the page it may name has none.
    expect(sanitizeUsageUrl(window.location.href, window.location.origin)).toBe(
      `${window.location.origin}/about`,
    )
    expect(vi.mocked(trackUsage)).not.toHaveBeenCalled()
  })

  it('keeps each page’s marks for the tab, shown again on the way back by any route', async () => {
    const first = control('AC.L1-b.1.i')
    window.history.replaceState(null, '', address(first.key))
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
    const hash = await fragmentWritten()
    // The next control is another page: a clean board, and a clean address.
    await user.keyboard('j')
    await screen.findByRole('heading', { level: 1, name: /Transaction/ })
    expect(marks()).toHaveLength(0)
    expect(window.location.hash).toBe('')
    draw([30, 30], [40, 90])
    expect(marks()).toHaveLength(1)
    await fragmentWritten()
    // Back to the first by the keys: its mark and its fragment are back.
    await user.keyboard('k')
    await screen.findByRole('heading', { level: 1, name: first.title })
    await waitFor(() => expect(marks()).toHaveLength(1))
    expect(marks()[0]!.getAttribute('d')).toMatch(/^M20\.0 20\.0/)
    await waitFor(() => expect(window.location.hash).toBe(hash))
    // Away to another page and back by the browser: still there.
    await user.keyboard('{Escape}')
    go('/about')
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { level: 1, name: first.title }),
      ).toBeNull(),
    )
    expect(layer()).toBeNull()
    go(address(first.key))
    await screen.findByRole('heading', { level: 1, name: first.title })
    await waitFor(() => expect(marks()).toHaveLength(1))
  })

  it('reads the marks back from its own address, and tells a link someone else made apart', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(stick())
    draw([10, 10], [60, 40])
    const hash = await fragmentWritten()
    expect((window.history.state as { ink: string }).ink).toBe('mine')
    // A reload: the memory is gone, the address is not, and nor is its marker.
    cleanup()
    resetDoodle()
    render(<App />)
    await waitFor(() => expect(marks()).toHaveLength(1))
    expect(line()).toBeEmptyDOMElement()
    expect(window.location.hash).toBe(hash)
    // The same address opened from a link: the marks show with a word.
    cleanup()
    resetDoodle()
    window.history.replaceState(null, '', `/about${hash}`)
    render(<App />)
    await waitFor(() => expect(marks()).toHaveLength(1))
    expect(line()).toHaveTextContent(
      'Chalk marks from the link you opened. They aren’t part of Cipher & Chalk. Pick up Smudge to erase them · Wipe all',
    )
    const footer = within(screen.getByRole('contentinfo'))
    expect(
      footer.queryByText(/Independent and educational/),
    ).not.toBeInTheDocument()
    await user.click(
      footer.getByRole('button', { name: 'Pick up Smudge to erase them' }),
    )
    expect(eraser()).toHaveAttribute('aria-pressed', 'true')
    expect(line()).toHaveTextContent('Erasing.')
    await user.click(footer.getByRole('button', { name: 'Wipe all' }))
    expect(marks()).toHaveLength(0)
    expect(line()).toBeEmptyDOMElement()
    expect(footer.getByText(/Independent and educational/)).toBeVisible()
    await waitFor(() => expect(window.location.hash).toBe(''))
    expect(layer()).toBeNull()
  })

  it('keeps a link’s marks, and whose they are, while the explorer tidies a chalk link', async () => {
    const first = control('AC.L1-b.1.i')
    window.history.replaceState(null, '', address(first.key))
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
    const hash = await fragmentWritten()
    // Someone else opens the chalk link: the explorer rewrites its address
    // (the chalk becomes a mode and a view) and the marks, their fragment
    // and their line all survive it.
    cleanup()
    resetDoodle()
    window.history.replaceState(
      null,
      '',
      `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${first.key}&chalk=white${hash}`,
    )
    render(<App />)
    await screen.findByRole(
      'heading',
      { level: 1, name: first.title },
      { timeout: 5000 },
    )
    await waitFor(() =>
      expect(window.location.search).toContain('mode=beginner'),
    )
    expect(window.location.search).not.toContain('chalk=')
    await waitFor(() => expect(marks()).toHaveLength(1))
    await waitFor(() => expect(window.location.hash).toBe(hash))
    expect((window.history.state as { ink: string }).ink).toBe('theirs')
    expect(line()).toHaveTextContent('Chalk marks from the link you opened.')
    // A reload keeps the line: the entry remembers whose marks they are.
    cleanup()
    resetDoodle()
    render(<App />)
    await screen.findByRole(
      'heading',
      { level: 1, name: first.title },
      { timeout: 5000 },
    )
    await waitFor(() => expect(marks()).toHaveLength(1))
    expect(line()).toHaveTextContent('Chalk marks from the link you opened.')
  })

  it('stops taking strokes when the link is full, until something is erased', async () => {
    // Without deflate the cap comes sooner; the rule is the same.
    vi.stubGlobal('CompressionStream', undefined)
    vi.stubGlobal('DecompressionStream', undefined)
    const user = userEvent.setup()
    render(<App />)
    await user.click(stick())
    // Long zigzags that no simplification shortens.
    let seed = 7
    const zig = (index: number) => {
      seed = (seed * 48271) % 2147483647
      return (seed % 41) - 20 + (index % 2 ? 24 : -24)
    }
    const target = layer()!
    let strokes = 0
    while (!line().textContent?.includes('full') && strokes < 12) {
      // Each stroke in its own band, so a rub at one's start touches it alone.
      fireEvent.pointerDown(target, {
        pointerId: 1,
        clientX: 10,
        clientY: 100 + strokes * 100,
      })
      for (let index = 1; index < 260; index += 1)
        fireEvent.pointerMove(target, {
          pointerId: 1,
          clientX: 10 + index * 3,
          clientY: 100 + strokes * 100 + zig(index),
        })
      fireEvent.pointerUp(target, { pointerId: 1 })
      strokes += 1
      await act(async () => {
        await new Promise((settle) => setTimeout(settle, 20))
      })
    }
    await waitFor(() =>
      expect(line()).toHaveTextContent(
        'The board is full. Erase something to keep drawing.',
      ),
    )
    const kept = marks().length
    expect(kept).toBeLessThan(strokes)
    expect(window.location.hash.length).toBeLessThanOrEqual(inkLimit)
    // Another stroke is refused outright.
    draw([900, 20], [950, 20])
    expect(marks()).toHaveLength(kept)
    // Erasing one makes room again.
    await user.keyboard('e')
    rub([10, 100])
    await waitFor(() => expect(marks()).toHaveLength(kept - 1))
    await user.keyboard('e')
    await user.keyboard('d')
    expect(line()).toHaveTextContent('Doodling.')
    draw([900, 20], [950, 20])
    expect(marks()).toHaveLength(kept)
  })

  it('shows a link’s marks scaled on a screen about as wide, and the notice instead on one that is not', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(stick())
    draw([100, 100], [300, 100])
    const hash = await fragmentWritten()
    cleanup()
    resetDoodle()
    // The same link on a screen a tenth narrower: drawn, scaled.
    contentWidth = 900
    window.history.replaceState(null, '', `/about${hash}`)
    render(<App />)
    await waitFor(() => expect(marks()).toHaveLength(1))
    expect(marks()[0]!.parentElement).toHaveAttribute('transform', 'scale(0.9)')
    expect(eraser()).toBeInTheDocument()
    cleanup()
    resetDoodle()
    // On one much narrower: not drawn, and the line says why.
    contentWidth = 600
    window.history.replaceState(null, '', `/about${hash}`)
    render(<App />)
    await waitFor(() =>
      expect(line()).toHaveTextContent(
        'This link has chalk marks drawn on a different screen size. Open it on a wider screen to see them.',
      ),
    )
    expect(marks()).toHaveLength(0)
    expect(smudge().tagName).toBe('SPAN')
    expect(smudge()).toHaveAttribute('aria-hidden', 'true')
    // Widened enough, they appear; the marks were never lost.
    room(950)
    await waitFor(() => expect(marks()).toHaveLength(1))
    // Your own marks after a reload on a narrower window say the same, and
    // nothing about a link someone else made.
    cleanup()
    resetDoodle()
    contentWidth = 600
    window.history.replaceState({ ink: 'mine' }, '', `/about${hash}`)
    render(<App />)
    await waitFor(() =>
      expect(line()).toHaveTextContent(
        'This link has chalk marks drawn on a different screen size.',
      ),
    )
    expect(line()).not.toHaveTextContent('from the link you opened')
    expect(marks()).toHaveLength(0)
  })

  it('is picked up as Smudge with e or his button, and erases only the strokes he touches', async () => {
    const user = userEvent.setup()
    render(<App />)
    // With nothing on the page he is decorative: nothing to focus.
    expect(smudge().tagName).toBe('SPAN')
    expect(smudge()).toHaveAttribute('aria-hidden', 'true')
    await user.keyboard('e')
    expect(layer()).toBeNull()
    await user.click(stick())
    draw([100, 100], [200, 100])
    draw([100, 300], [200, 300])
    expect(marks()).toHaveLength(2)
    // With marks he is a button; picking him up puts the chalk down.
    expect(smudge().tagName).toBe('BUTTON')
    expect(eraser()).toHaveAttribute('aria-pressed', 'false')
    await user.keyboard('e')
    expect(eraser()).toHaveAttribute('aria-pressed', 'true')
    expect(stick()).toHaveAttribute('aria-pressed', 'false')
    expect(layer()).toHaveAttribute('data-mode', 'eraser')
    expect(line()).toHaveTextContent(
      'Erasing. Esc or the tray puts Smudge back · Wipe all',
    )
    vi.useFakeTimers()
    rub([150, 104])
    expect(marks()).toHaveLength(1)
    expect(marks()[0]!.getAttribute('d')).toMatch(/^M100\.0 300\.0/)
    expect(dust()).toHaveLength(1)
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(dust()).toHaveLength(0)
    // A rub that touches nothing takes nothing.
    rub([150, 200])
    expect(marks()).toHaveLength(1)
    vi.useRealTimers()
    // Picking the chalk up puts him down; Escape puts the chalk back and
    // his button returns the favour with focus.
    await user.keyboard('d')
    expect(eraser()).toHaveAttribute('aria-pressed', 'false')
    expect(stick()).toHaveAttribute('aria-pressed', 'true')
    await user.click(eraser())
    expect(stick()).toHaveAttribute('aria-pressed', 'false')
    expect(eraser()).toHaveAttribute('aria-pressed', 'true')
    await user.keyboard('{Escape}')
    expect(eraser()).toHaveAttribute('aria-pressed', 'false')
    expect(eraser()).toHaveFocus()
    // Wipe all, from the erasing line: his sweep, nothing left, no fragment.
    await user.keyboard('e')
    await user.click(screen.getByRole('button', { name: 'Wipe all' }))
    expect(marks()).toHaveLength(0)
    expect(smudge()).toHaveAttribute('data-pose', 'sweep')
    await waitFor(() => expect(window.location.hash).toBe(''))
    expect(layer()).toBeNull()
    expect(smudge().tagName).toBe('SPAN')
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

  it('keeps the marks through a resize, scaled a little and waiting out a lot, and lets a faceless Smudge erase too', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(stick())
    draw([10, 10], [60, 40])
    expect(marks()).toHaveLength(1)
    room(900)
    expect(marks()).toHaveLength(1)
    expect(marks()[0]!.parentElement).toHaveAttribute('transform', 'scale(0.9)')
    room(600)
    expect(marks()).toHaveLength(0)
    expect(dust()).toHaveLength(0)
    // Own marks wait quietly; the notice is for a link's.
    expect(line()).toHaveTextContent('Doodling.')
    room(1000)
    expect(marks()).toHaveLength(1)
    expect(marks()[0]!.parentElement).not.toHaveAttribute('transform')
    act(() => {
      setSmudgeOn(false)
    })
    expect(smudge()).not.toHaveAttribute('data-pose')
    await user.click(eraser())
    expect(eraser()).toHaveAttribute('aria-pressed', 'true')
    rub([35, 25])
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
