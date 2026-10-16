import { readFileSync } from 'node:fs'
import path from 'node:path'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import App from '../../App'
import { Home } from '../Home'
import { isDoodleUp, isSmudgeUp } from '../board/doodle-state'
import { keyIsFree } from '../board/keys'
import { cueSmudge } from '../board/tray-state'
import { glossaryTerms } from '../../data/content'
import { trackUsage } from '../../analytics/usage'
import { renderWithProgress } from '../../test/renderWithProgress'
import { STILL_VIEWBOX } from './sixty-drawing'
import {
  sixtyBoardTitle,
  sixtyChapters,
  sixtyDescription,
  sixtyTitle,
} from './sixty-script'

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

/** jsdom has no modal dialogs: open and close as the browser would. */
beforeAll(() => {
  const proto = HTMLDialogElement.prototype
  if (typeof proto.showModal !== 'function')
    proto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
  if (typeof proto.close !== 'function')
    proto.close = function (this: HTMLDialogElement) {
      if (!this.hasAttribute('open')) return
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
})

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
 * tick, which says how much time passed before it came.
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
    waiting: () => queue.size,
  }
}

const region = () => screen.getByRole('region', { name: sixtyTitle })
const homePlay = () => within(region()).getByRole('button', { name: 'Play' })
const dialog = () => screen.getByRole('dialog', { name: sixtyBoardTitle })
const time = () => dialog().querySelector('.sixty-time')!.textContent
const caption = () => dialog().querySelector<HTMLElement>('.sixty-caption')!
const key = (name: string) =>
  act(() => {
    fireEvent.keyDown(document.activeElement ?? dialog(), { key: name })
  })

/** Opens the dialog from Home's play button and lets the board read itself. */
async function open() {
  await act(async () => {
    fireEvent.click(homePlay())
  })
  // The board reads its strokes and labels once the fonts are in, then plays.
  await act(async () => {})
  return dialog()
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

describe('the still on Home', () => {
  it('shows the finished clock under the title with a play button, the length and one line, and plays nothing on its own', () => {
    const frame = frames()
    renderWithProgress(<Home />)
    const talk = region()
    expect(within(talk).getByRole('heading', { level: 2 })).toHaveTextContent(
      sixtyTitle,
    )
    // The still: the dial only, every word of it, hidden from assistive technology.
    const still = talk.querySelector('svg.sixty-still-art')!
    expect(still).toHaveAttribute('aria-hidden', 'true')
    expect(still).toHaveAttribute('viewBox', STILL_VIEWBOX)
    expect(
      Array.from(still.querySelectorAll('text')).map(
        (node) => node.textContent,
      ),
    ).toEqual([
      'SPRS',
      'year 1',
      'year 2',
      'year 3',
      'C3PAO',
      'current',
      '3 yrs: recertify',
    ])
    expect(still.querySelector('.sixty-hand')).not.toBeNull()
    // The play row: a play button, the length in mono, one line.
    expect(homePlay()).toHaveClass('sixty-play')
    expect(within(talk).getByText('1:00')).toHaveClass('mono')
    expect(
      within(talk).getByText(
        'Three years of CMMC Level 2, drawn in one minute.',
      ),
    ).toBeInTheDocument()
    // Closed: no dialog, no frames, nothing announced, nothing collected.
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(talk.querySelector('[aria-live]')).toBeNull()
    expect(frame.waiting()).toBe(0)
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('keeps Home to one h1, with the region after the chalks and the search in the DOM', () => {
    renderWithProgress(<Home />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getAllByRole('heading')).toHaveLength(2)
    expect(region().closest('.home-talk')).not.toBeNull()
    const search = screen.getByRole('search', { name: 'Find a control' })
    expect(
      search.compareDocumentPosition(region()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      screen.getByRole('link', { name: /^I’m preparing for an assessment/ }),
    ).toHaveTextContent('Every objective, quoted.')
  })
})

describe('the dialog', () => {
  it('opens from the play button and starts from 0:00, with focus on pause; Escape closes it and focus returns', async () => {
    const frame = frames()
    renderWithProgress(<Home />)
    const box = await open()
    expect(box).toHaveAttribute('open')
    expect(box.tagName).toBe('DIALOG')
    const inside = within(box)
    expect(inside.getByRole('button', { name: 'Pause' })).toHaveFocus()
    expect(time()).toBe('0:00 / 1:00')
    expect(inside.getByText('Part 1 of 8 · Who')).toBeInTheDocument()
    expect(caption().textContent).toBe(captions[0])
    expect(caption()).toHaveAttribute('aria-live', 'polite')
    expect(inside.getByRole('slider', { name: 'Seek' })).toHaveAttribute(
      'aria-valuetext',
      '0:00, Who',
    )
    // The board: an image with its title and the description that matches the captions.
    const board = box.querySelector('svg.sixty-board')!
    expect(board).toHaveAttribute('role', 'img')
    expect(board.querySelector('title')!.textContent).toBe(sixtyBoardTitle)
    expect(board.querySelector('desc')!.textContent).toBe(sixtyDescription)
    expect(inside.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(inside.getByRole('link', { name: 'Timeline' })).toHaveAttribute(
      'href',
      '/timeline',
    )
    expect(box).toHaveTextContent(
      'Shown: the Level 2 (C3PAO) cycle. Phase 2, which would require it, has been on hold since July 13, 2026.',
    )
    // Playing: the frames run and the time moves.
    expect(frame.waiting()).toBe(1)
    for (let step = 0; step < 12; step += 1) frame.tick(100)
    expect(time()).toBe('0:01 / 1:00')
    expect(frame.waiting()).toBe(1)
    // Escape closes it, stops the frames and puts focus back on Play.
    key('Escape')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(homePlay()).toHaveFocus()
    expect(frame.waiting()).toBe(0)
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('opens from a click on the still too, and Close closes it with focus back on Play', async () => {
    frames()
    renderWithProgress(<Home />)
    await act(async () => {
      fireEvent.click(region().querySelector('.sixty-still')!)
    })
    await act(async () => {})
    const box = dialog()
    expect(time()).toBe('0:00 / 1:00')
    await act(async () => {
      fireEvent.click(within(box).getByRole('button', { name: 'Close' }))
    })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(homePlay()).toHaveFocus()
  })

  it('carries the eight captions word for word, their glossary words opening chalk popovers that take Escape first', async () => {
    const user = userEvent.setup()
    frames()
    expect(sixtyChapters.map((chapter) => chapter.caption)).toEqual(captions)
    renderWithProgress(<Home />)
    const box = await open()
    for (let index = 0; index < sixtyChapters.length; index += 1) {
      const chapter = sixtyChapters[index]!
      expect(caption().textContent).toBe(captions[index])
      expect(box.querySelector('.sixty-eyebrow')!.textContent).toBe(
        `Part ${index + 1} of 8 · ${chapter.name}`,
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
    // The popover opens in the dialog; Escape closes the popover, not the dialog.
    await user.click(within(caption()).getByRole('button', { name: 'SPRS' }))
    expect(box.querySelector('.chalk-popover')).toHaveTextContent(
      'Supplier Performance Risk System',
    )
    await user.keyboard('{Escape}')
    expect(box.querySelector('.chalk-popover')).toBeNull()
    expect(dialog()).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('under reduced motion shows each chapter finished from its start, with no stick, sector or pulse', async () => {
    media((query) => query.includes('reduced-motion'))
    const frame = frames()
    renderWithProgress(<Home />)
    const box = await open()
    const board = box.querySelector('svg.sixty-board')!
    const items = Array.from(board.querySelectorAll<SVGElement>('[data-t]'))
    expect(items.length).toBeGreaterThan(40)
    const startOf = (item: SVGElement) =>
      Number(item.getAttribute('data-t')!.split(',')[0])
    const stick = board.querySelector<SVGElement>('.sixty-stick')!
    const wedge = board.querySelector<SVGElement>('.sixty-wedge')!
    const glow = board.querySelector<SVGElement>('.sixty-glow')!
    const hand = board.querySelector<SVGElement>('.sixty-hand')!
    // It plays: frames come, and a chapter's start shows everything up to it, whole.
    expect(frame.waiting()).toBe(1)
    key('Home')
    for (const chapter of sixtyChapters) {
      const at = chapter.start
      for (const item of items)
        expect(item.getAttribute('data-drawn')).toBe(
          startOf(item) <= at ? 'done' : 'none',
        )
      expect(Number(stick.style.opacity)).toBe(0)
      expect(Number(wedge.style.opacity)).toBe(0)
      expect(Number(glow.style.opacity)).toBe(0)
      key('PageDown')
    }
    // The end: the hand has come round, and nothing is half drawn.
    expect(time()).toBe('1:00 / 1:00')
    expect(hand.getAttribute('transform')).toBe('rotate(360.00 280 335)')
    expect(items.every((item) => item.dataset.drawn === 'done')).toBe(true)
    expect(items.filter((item) => item.dataset.drawn === 'part')).toEqual([])
  })

  it('answers its keys only inside the dialog, and the site’s own keys wait while it is open', async () => {
    const user = userEvent.setup()
    const frame = frames()
    render(<App />)
    const box = await open()
    expect(within(box).getByRole('button', { name: 'Pause' })).toHaveFocus()
    // The site reads every key as taken while a dialog is open.
    expect(
      keyIsFree(new KeyboardEvent('keydown', { key: '?', bubbles: true })),
    ).toBe(false)
    await user.keyboard('?')
    expect(screen.queryByRole('dialog', { name: 'Keys' })).toBeNull()
    await user.keyboard('/')
    expect(document.getElementById('home-q')).not.toHaveFocus()
    await user.keyboard('d')
    expect(isDoodleUp()).toBe(false)
    await user.keyboard('e')
    expect(isSmudgeUp()).toBe(false)
    // Space and K pause and play; the arrows skip five seconds; Home and End
    // go to either end; Page Up and Page Down change part.
    await user.keyboard(' ')
    expect(within(box).getByRole('button', { name: 'Play' })).toHaveFocus()
    expect(frame.waiting()).toBe(0)
    await user.keyboard('k')
    expect(within(box).getByRole('button', { name: 'Pause' })).toBeVisible()
    expect(frame.waiting()).toBe(1)
    key('ArrowRight')
    expect(time()).toBe('0:05 / 1:00')
    key('ArrowRight')
    expect(time()).toBe('0:10 / 1:00')
    key('ArrowLeft')
    expect(time()).toBe('0:05 / 1:00')
    key('PageDown')
    expect(time()).toBe('0:07 / 1:00')
    expect(within(box).getByRole('slider', { name: 'Seek' })).toHaveAttribute(
      'aria-valuetext',
      '0:07, Levels',
    )
    key('PageUp')
    expect(time()).toBe('0:00 / 1:00')
    key('End')
    expect(time()).toBe('1:00 / 1:00')
    // A seek to the end is not the drawing ending: Smudge waits for that.
    expect(cueSmudge).not.toHaveBeenCalled()
    key('Home')
    expect(time()).toBe('0:00 / 1:00')
    // A button keeps Space and Enter for itself: on the speed button they cycle the speed.
    const speed = within(box).getByRole('button', {
      name: 'Playback speed 1 times',
    })
    act(() => speed.focus())
    await user.keyboard(' ')
    expect(speed).toHaveAccessibleName('Playback speed 0.75 times')
    expect(speed).toHaveTextContent('0.75×')
    await user.keyboard('{Enter}')
    expect(speed).toHaveAccessibleName('Playback speed 0.5 times')
    await user.click(speed)
    expect(speed).toHaveAccessibleName('Playback speed 1.5 times')
    await user.click(speed)
    expect(speed).toHaveAccessibleName('Playback speed 1 times')
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('ends at 1:00 with Replay and one sweep from Smudge, and Replay starts over from 0:00; a click on the board pauses', async () => {
    const frame = frames()
    renderWithProgress(<Home />)
    const box = await open()
    const inside = within(box)
    // From the last part, playing on reaches the end.
    key('End')
    key('PageUp')
    expect(time()).toBe('0:56 / 1:00')
    expect(inside.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    for (let step = 0; step < 50 && frame.waiting(); step += 1) frame.tick(100)
    expect(time()).toBe('1:00 / 1:00')
    expect(frame.waiting()).toBe(0)
    expect(inside.getByRole('button', { name: 'Replay' })).toBeInTheDocument()
    expect(cueSmudge).toHaveBeenCalledTimes(1)
    expect(cueSmudge).toHaveBeenCalledWith('sweep')
    expect(caption().textContent).toBe(captions[7])
    // Replay: from the top, playing.
    await act(async () => {
      fireEvent.click(inside.getByRole('button', { name: 'Replay' }))
    })
    expect(time()).toBe('0:00 / 1:00')
    expect(inside.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(caption().textContent).toBe(captions[0])
    expect(frame.waiting()).toBe(1)
    // A click on the board pauses, and another plays.
    await act(async () => {
      fireEvent.click(box.querySelector('.sixty-screen')!)
    })
    expect(inside.getByRole('button', { name: 'Play' })).toBeInTheDocument()
    expect(frame.waiting()).toBe(0)
    await act(async () => {
      fireEvent.click(box.querySelector('.sixty-screen')!)
    })
    expect(inside.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(frame.waiting()).toBe(1)
    // Unmounting stops the frames.
    key('Escape')
    expect(frame.waiting()).toBe(0)
  })

  it('sends nothing off the site: no stylesheet, script or fetch to another host, and the site’s own faces', async () => {
    const frame = frames()
    const fetched = vi.spyOn(globalThis, 'fetch')
    renderWithProgress(<Home />)
    await open()
    for (let step = 0; step < 5; step += 1) frame.tick(100)
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
    expect(trackUsage).not.toHaveBeenCalled()
  })
})
