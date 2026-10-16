import { readFileSync } from 'node:fs'
import path from 'node:path'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { Home } from '../Home'
import { cueSmudge } from '../board/tray-state'
import { glossaryTerms } from '../../data/content'
import { trackUsage } from '../../analytics/usage'
import { renderWithProgress } from '../../test/renderWithProgress'
import { boards } from './sixty-drawing'
import {
  formatTime,
  sixtyBoardTitle,
  sixtyChapters,
  sixtyDescription,
  sixtyTitle,
} from './sixty-script'
import { sixtyWords } from './sixty-words'

vi.mock('../../analytics/usage', () => ({ trackUsage: vi.fn() }))
vi.mock('../board/tray-state', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../board/tray-state')>()
  return { ...actual, cueSmudge: vi.fn(actual.cueSmudge) }
})

/** The captions, exactly as the owner wrote them. */
const captions = [
  'The Department of Defense shares information with the companies it hires, and they create more for it. CMMC is how it checks that you protect it.',
  'Federal Contract Information (FCI) needs Level 1. Controlled Unclassified Information (CUI) needs Level 2. CUI on the most critical programs adds Level 3.',
  'Level 2 runs on a three-year clock. Every result lands in the middle: SPRS, the DoD’s Supplier Performance Risk System.',
  'Day one: an independent C3PAO assesses all 110 requirements. Pass, and your status in SPRS is current for three years.',
  'Every year, you assess your own controls and a senior official affirms compliance in SPRS. Skip the affirmation and your status is no longer current.',
  'A significant change, like adding Wi-Fi or merging in systems that were never assessed, means a new assessment now, not at year three.',
  'Year two, same routine. At year three, the C3PAO comes back and the clock starts over.',
  'Before an award that requires CMMC, the DoD checks SPRS. No current status, no contract.',
]
const blurb = 'Three years of CMMC Level 2, drawn in one minute.'

/** jsdom has no media queries: the test says which ones match. */
function media(matches: (query: string) => boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: matches(query),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }))
}

/**
 * The frames under the test's hand: each requestAnimationFrame waits for a
 * tick, which says how much time passed before it came (the player moves
 * at most a tenth of a second per frame).
 */
function frames() {
  const queue = new Map<number, FrameRequestCallback>()
  let id = 0
  let now = 1000
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    queue.set(++id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (handle: number) => {
    queue.delete(handle)
  })
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  return {
    tick(milliseconds: number) {
      now += milliseconds
      const next = queue.entries().next().value
      if (!next) throw new Error('No frame is waiting')
      queue.delete(next[0])
      act(() => next[1](now))
    },
    /** So many tenths of a second, one frame each. */
    tenths(count: number) {
      for (let step = 0; step < count; step += 1) this.tick(100)
    },
    waiting: () => queue.size,
  }
}

const region = () => screen.getByRole('region', { name: sixtyTitle })
const button = (name: string) => within(region()).getByRole('button', { name })
const board = () => region().querySelector<SVGSVGElement>('svg.sixty-board')!
const time = () => region().querySelector('.sixty-time')!.textContent
const eyebrow = () => region().querySelector('.sixty-eyebrow')!.textContent
const caption = () =>
  region().querySelector<HTMLElement>('.sixty-caption[aria-live]')!
const opacity = (selector: string) =>
  Number(board().querySelector<SVGElement>(selector)!.style.opacity)
const offset = (selector: string) =>
  Number(board().querySelector<SVGElement>(selector)!.style.strokeDashoffset)
const items = () => Array.from(board().querySelectorAll<SVGElement>('[data-t]'))
const startOf = (item: SVGElement) =>
  Number(item.getAttribute('data-t')!.split(',')[0])
/** A key pressed with focus on the play button, inside the panel. */
const key = (name: string) =>
  act(() => {
    fireEvent.keyDown(document.activeElement ?? region(), { key: name })
  })

/** Renders Home and lets the board read itself. */
async function mount(ui = <Home />) {
  renderWithProgress(ui)
  await act(async () => {})
}

/** Presses Play, with focus left on the button, and lets the board respond. */
async function play() {
  const play = button('Play')
  act(() => play.focus())
  await act(async () => {
    fireEvent.click(play)
  })
}

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  window.localStorage.clear()
  vi.mocked(trackUsage).mockClear()
  vi.mocked(cueSmudge).mockClear()
  media(() => false)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('the panel on Home', () => {
  it('rests on the finished clock: the title, the board as an image, the player row, the caption slot and the note; no dialog, nothing playing, nothing collected', async () => {
    const frame = frames()
    await mount()
    const talk = region()
    expect(talk.tagName).toBe('SECTION')
    expect(within(talk).getByRole('heading', { level: 2 })).toHaveTextContent(
      sixtyTitle,
    )
    // The board: an image with its title and the description of both scenes,
    // every word of the drawing on it, in the order they are written, in
    // the wide arrangement; resting, everything stands finished.
    const svg = board()
    expect(svg).toHaveAttribute('role', 'img')
    expect(svg.querySelector('title')!.textContent).toBe(sixtyBoardTitle)
    expect(svg.querySelector('desc')!.textContent).toBe(sixtyDescription)
    expect(sixtyDescription).toContain('the board is wiped clean')
    expect(svg).toHaveAttribute('data-arrangement', 'wide')
    expect(svg).toHaveAttribute(
      'viewBox',
      `0 0 ${boards.wide.width} ${boards.wide.height}`,
    )
    expect(
      Array.from(svg.querySelectorAll('text')).map((node) => node.textContent),
    ).toEqual(sixtyWords)
    expect(items().length).toBeGreaterThan(40)
    expect(items().every((item) => item.dataset.drawn === 'done')).toBe(true)
    expect(offset('.sixty-erase-stroke')).toBe(0)
    expect(opacity('.sixty-stick')).toBe(0)
    expect(opacity('.sixty-eraser')).toBe(0)
    expect(svg.querySelector('.sixty-eraser .smudge-felt')).not.toBeNull()
    // The player row: Play, the seek bar, the length in mono, the speed.
    expect(button('Play')).toHaveClass('sixty-play')
    const slider = within(talk).getByRole('slider', { name: 'Seek' })
    expect(slider).toHaveAttribute('aria-valuenow', '0')
    expect(slider).toHaveAttribute('aria-valuetext', '0:00, Who')
    expect(talk.querySelector('.sixty-labels')).toBeNull()
    expect(time()).toBe('1:00')
    expect(talk.querySelector('.sixty-time')).toHaveClass('mono')
    expect(button('Playback speed 1 times')).toHaveTextContent('1×')
    // The caption slot and the note.
    expect(eyebrow()).toBe('60 seconds · 8 parts')
    expect(caption().textContent).toBe(blurb)
    expect(caption()).toHaveAttribute('aria-live', 'polite')
    expect(
      within(talk).getByRole('link', { name: 'Timeline' }),
    ).toHaveAttribute('href', '/timeline')
    expect(talk).toHaveTextContent(
      'Shown: the Level 2 (C3PAO) cycle. Phase 2, which would require it, has been on hold since July 13, 2026.',
    )
    // No dialog, no frames, nothing collected.
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(talk.querySelector('.sixty-close')).toBeNull()
    expect(frame.waiting()).toBe(0)
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('keeps Home to one h1, with the region after the chalks and the search in the DOM', async () => {
    frames()
    await mount()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getAllByRole('heading')).toHaveLength(2)
    expect(region().closest('.home-talk')).not.toBeNull()
    const search = screen.getByRole('search', { name: 'Find a control' })
    expect(
      search.compareDocumentPosition(region()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('takes the narrow arrangement where the board is narrower than 395px', async () => {
    frames()
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get(this: HTMLElement) {
        return this.classList.contains('sixty-screen') ? 350 : 0
      },
    })
    try {
      await mount()
      const svg = board()
      expect(svg).toHaveAttribute('data-arrangement', 'narrow')
      expect(svg).toHaveAttribute(
        'viewBox',
        `0 0 ${boards.narrow.width} ${boards.narrow.height}`,
      )
      expect(
        Array.from(svg.querySelectorAll('text')).map(
          (node) => node.textContent,
        ),
      ).toEqual(sixtyWords)
      expect(items().every((item) => item.dataset.drawn === 'done')).toBe(true)
    } finally {
      Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth')
    }
  })
})

describe('playing in the panel', () => {
  it('Play clears the board with a quick pass of Smudge, then draws from 0:00 in place; the address does not change', async () => {
    const frame = frames()
    const before = window.location.href
    await mount()
    await play()
    expect(button('Pause')).toHaveFocus()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(frame.waiting()).toBe(1)
    // Half a second of Smudge: the finished board stands, hidden a stroke
    // at a time, the time reads 0:00 and part one is up.
    expect(time()).toBe('0:00 / 1:00')
    expect(eyebrow()).toBe('Part 1 of 8 · Who')
    expect(caption().textContent).toBe(captions[0])
    expect(items().every((item) => item.dataset.drawn === 'done')).toBe(true)
    frame.tenths(2)
    expect(opacity('.sixty-eraser')).toBe(1)
    expect(offset('.sixty-clear-stroke')).toBeCloseTo(0.6, 5)
    expect(time()).toBe('0:00 / 1:00')
    expect(opacity('.sixty-stick')).toBe(0)
    frame.tenths(3)
    // 0:00: the board is empty, Smudge has gone, and the drawing begins.
    expect(opacity('.sixty-eraser')).toBe(0)
    expect(items().every((item) => item.dataset.drawn === 'none')).toBe(true)
    expect(offset('.sixty-erase-stroke')).toBe(1)
    frame.tenths(10)
    expect(time()).toBe('0:01 / 1:00')
    frame.tenths(22)
    expect(time()).toBe('0:03 / 1:00')
    expect(
      items().find((item) => item.textContent === 'DoD')!.dataset.drawn,
    ).toBe('done')
    expect(frame.waiting()).toBe(1)
    expect(window.location.href).toBe(before)
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('wipes scene 1 off between 0:15.7 and 0:16.9 with Smudge, leaving the haze, and draws the clock from 0:17', async () => {
    const frame = frames()
    await mount()
    await play()
    frame.tenths(5)
    key('ArrowRight')
    key('ArrowRight')
    key('ArrowRight')
    expect(time()).toBe('0:15 / 1:00')
    // By 0:15 scene 1 is whole and the circle has begun.
    const first = items().filter((item) => startOf(item) < 15)
    expect(first.length).toBeGreaterThan(15)
    expect(first.every((item) => item.dataset.drawn === 'done')).toBe(true)
    expect(opacity('.sixty-eraser')).toBe(0)
    expect(offset('.sixty-erase-stroke')).toBe(1)
    frame.tenths(7)
    // 0:15.7: Smudge comes in; half way his strokes have taken half of scene 1.
    frame.tenths(6)
    expect(opacity('.sixty-eraser')).toBe(1)
    expect(offset('.sixty-erase-stroke')).toBeCloseTo(0.5, 5)
    expect(offset('.sixty-haze')).toBeCloseTo(0.5, 5)
    expect(opacity('.sixty-stick')).toBe(0)
    frame.tenths(6)
    // 0:16.9: scene 1 is gone, the haze stays, and the clock is next.
    expect(offset('.sixty-erase-stroke')).toBe(0)
    expect(offset('.sixty-haze')).toBe(0)
    expect(opacity('.sixty-eraser')).toBe(0)
    expect(
      items().find((item) => item.textContent === 'Level 2 runs on this clock')!
        .dataset.drawn,
    ).toBe('none')
    frame.tenths(10)
    expect(time()).toBe('0:17 / 1:00')
    expect(
      items().find((item) => item.textContent === 'Level 2 runs on this clock')!
        .dataset.drawn,
    ).not.toBe('none')
  })

  it('carries the eight captions word for word, their glossary words opening chalk popovers that take Escape', async () => {
    const user = userEvent.setup()
    frames()
    expect(sixtyChapters.map((chapter) => chapter.caption)).toEqual(captions)
    await mount()
    await play()
    key('Home')
    for (let index = 0; index < sixtyChapters.length; index += 1) {
      const chapter = sixtyChapters[index]!
      expect(caption().textContent).toBe(captions[index])
      expect(eyebrow()).toBe(`Part ${index + 1} of 8 · ${chapter.name}`)
      expect(
        within(region()).getByRole('slider', { name: 'Seek' }),
      ).toHaveAttribute(
        'aria-valuetext',
        `${formatTime(chapter.start)}, ${chapter.name}`,
      )
      for (const word of chapter.words)
        expect(
          within(caption()).getByRole('button', { name: word.phrase }),
        ).toHaveClass('term-chalk')
      if (index < sixtyChapters.length - 1) key('PageDown')
    }
    // Only the four words, each a glossary term.
    const named = [
      ...new Set(
        sixtyChapters.flatMap((chapter) =>
          chapter.words.map((word) => word.term),
        ),
      ),
    ].sort()
    expect(named).toEqual(['c3pao', 'cui', 'fci', 'sprs'])
    for (const id of named)
      expect(glossaryTerms.some((term) => term.id === id)).toBe(true)
    // The popover opens in the panel; Escape closes it and the panel stays.
    await user.click(within(caption()).getByRole('button', { name: 'SPRS' }))
    expect(region().querySelector('.chalk-popover')).toHaveTextContent(
      'Supplier Performance Risk System',
    )
    await user.keyboard('{Escape}')
    expect(region().querySelector('.chalk-popover')).toBeNull()
    expect(region()).toBeInTheDocument()
  })

  it('answers its keys only with focus in the panel, and a key it takes never reaches the window', async () => {
    const user = userEvent.setup()
    const frame = frames()
    const reached = vi.fn()
    window.addEventListener('keydown', reached)
    try {
      render(<App />)
      await act(async () => {})
      // With focus on the search line, the player's keys are the page's.
      const search = document.getElementById('home-q') as HTMLInputElement
      act(() => search.focus())
      await user.keyboard(' ')
      await user.keyboard('k')
      expect(button('Play')).toBeInTheDocument()
      expect(frame.waiting()).toBe(0)
      expect(time()).toBe('1:00')
      expect(reached).toHaveBeenCalledTimes(2)
      reached.mockClear()
      // With focus on the seek bar: Space and K play and pause, the arrows
      // skip five seconds, Home and End go to either end, Page Up and Page
      // Down change part; none of those reach the window.
      const slider = within(region()).getByRole('slider', { name: 'Seek' })
      act(() => slider.focus())
      await user.keyboard(' ')
      expect(button('Pause')).toBeInTheDocument()
      expect(frame.waiting()).toBe(1)
      await user.keyboard('k')
      expect(button('Play')).toBeInTheDocument()
      expect(frame.waiting()).toBe(0)
      key('ArrowRight')
      expect(time()).toBe('0:05 / 1:00')
      key('ArrowRight')
      expect(time()).toBe('0:10 / 1:00')
      key('ArrowLeft')
      expect(time()).toBe('0:05 / 1:00')
      key('PageDown')
      expect(time()).toBe('0:07 / 1:00')
      expect(slider).toHaveAttribute('aria-valuetext', '0:07, Levels')
      key('PageUp')
      expect(time()).toBe('0:00 / 1:00')
      key('End')
      expect(time()).toBe('1:00 / 1:00')
      expect(cueSmudge).not.toHaveBeenCalled()
      key('Home')
      expect(time()).toBe('0:00 / 1:00')
      expect(reached).not.toHaveBeenCalled()
      // A button keeps Space and Enter: on the speed button they cycle the speed.
      const speed = button('Playback speed 1 times')
      act(() => speed.focus())
      await user.keyboard(' ')
      expect(speed).toHaveAccessibleName('Playback speed 0.75 times')
      await user.keyboard('{Enter}')
      expect(speed).toHaveAccessibleName('Playback speed 0.5 times')
      await user.click(speed)
      expect(speed).toHaveAccessibleName('Playback speed 1.5 times')
      await user.click(speed)
      expect(speed).toHaveAccessibleName('Playback speed 1 times')
      // The site's own keys still work from the panel: "?" shows the keys.
      act(() => slider.focus())
      await user.keyboard('?')
      expect(screen.getByRole('dialog', { name: 'Keys' })).toBeInTheDocument()
      expect(trackUsage).not.toHaveBeenCalled()
    } finally {
      window.removeEventListener('keydown', reached)
    }
  })

  it('under reduced motion starts at 0:00 with no pass, shows each chapter finished from its start, cuts scene 1 at 0:15.7, and has no stick, Smudge, sector or pulse', async () => {
    media((query) => query.includes('reduced-motion'))
    const frame = frames()
    await mount()
    await play()
    expect(frame.waiting()).toBe(1)
    expect(time()).toBe('0:00 / 1:00')
    expect(items().every((item) => item.dataset.drawn === 'none')).toBe(true)
    expect(opacity('.sixty-eraser')).toBe(0)
    key('Home')
    for (const chapter of sixtyChapters) {
      const at = chapter.start
      for (const item of items())
        expect(item.dataset.drawn).toBe(startOf(item) <= at ? 'done' : 'none')
      expect(offset('.sixty-erase-stroke')).toBe(at >= 15.7 ? 0 : 1)
      expect(opacity('.sixty-stick')).toBe(0)
      expect(opacity('.sixty-eraser')).toBe(0)
      expect(opacity('.sixty-wedge')).toBe(0)
      expect(opacity('.sixty-glow')).toBe(0)
      key('PageDown')
    }
    // The end: the hand has come round, and nothing is half drawn.
    expect(time()).toBe('1:00 / 1:00')
    expect(
      board()
        .querySelector<SVGElement>('.sixty-hand')!
        .getAttribute('transform'),
    ).toBe(`rotate(360.00 ${boards.wide.dial.cx} ${boards.wide.dial.cy})`)
    expect(items().every((item) => item.dataset.drawn === 'done')).toBe(true)
  })

  it('ends at 1:00 with Replay and one sweep from Smudge; Replay clears and starts over; a click on the board pauses and plays', async () => {
    const frame = frames()
    await mount()
    await play()
    frame.tenths(5)
    key('End')
    key('PageUp')
    expect(time()).toBe('0:56 / 1:00')
    expect(button('Pause')).toBeInTheDocument()
    for (let step = 0; step < 50 && frame.waiting(); step += 1) frame.tick(100)
    expect(time()).toBe('1:00 / 1:00')
    expect(frame.waiting()).toBe(0)
    expect(button('Replay')).toBeInTheDocument()
    expect(cueSmudge).toHaveBeenCalledTimes(1)
    expect(cueSmudge).toHaveBeenCalledWith('sweep')
    expect(caption().textContent).toBe(captions[7])
    expect(items().every((item) => item.dataset.drawn === 'done')).toBe(true)
    // Replay: Smudge's pass, then from the top.
    await act(async () => {
      fireEvent.click(button('Replay'))
    })
    expect(time()).toBe('0:00 / 1:00')
    expect(button('Pause')).toBeInTheDocument()
    expect(caption().textContent).toBe(captions[0])
    frame.tenths(2)
    expect(opacity('.sixty-eraser')).toBe(1)
    frame.tenths(3)
    expect(items().every((item) => item.dataset.drawn === 'none')).toBe(true)
    expect(frame.waiting()).toBe(1)
    // A click on the board pauses, and another plays.
    await act(async () => {
      fireEvent.click(region().querySelector('.sixty-screen')!)
    })
    expect(button('Play')).toBeInTheDocument()
    expect(frame.waiting()).toBe(0)
    await act(async () => {
      fireEvent.click(region().querySelector('.sixty-screen')!)
    })
    expect(button('Pause')).toBeInTheDocument()
    expect(frame.waiting()).toBe(1)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('sends nothing off the site: no stylesheet, script or fetch to another host, and the site’s own faces', async () => {
    const frame = frames()
    const fetched = vi.spyOn(globalThis, 'fetch')
    await mount()
    await play()
    frame.tenths(8)
    expect(fetched).not.toHaveBeenCalled()
    for (const node of document.querySelectorAll(
      'link[href], script[src], img[src], iframe[src], object[data], embed[src]',
    )) {
      const url = new URL(
        node.getAttribute('href') ??
          node.getAttribute('src') ??
          node.getAttribute('data') ??
          '',
        window.location.href,
      )
      expect(url.origin).toBe(window.location.origin)
    }
    expect(document.querySelector('link[rel="preconnect"]')).toBeNull()
    const css = readFileSync(
      path.join(process.cwd(), 'src/components/sixty/sixty.css'),
      'utf8',
    )
    expect(css).not.toMatch(/https?:\/\//)
    expect(css).not.toMatch(/@import|@font-face/)
    expect(css).toContain('var(--font-hand)')
    expect(css).toContain('var(--color-yellow)')
    expect(css).not.toContain('dialog')
    expect(trackUsage).not.toHaveBeenCalled()
  })
})
