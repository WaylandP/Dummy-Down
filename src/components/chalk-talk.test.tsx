import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ChalkTalk } from './ChalkTalk'
import { Home } from './Home'
import { browseUrl } from './board/SiteHeader'
import { cueSmudge } from './board/tray-state'
import { glossaryTerms, referenceControls } from '../data/content'
import {
  chalkTalkParts,
  chalkTalkScenes,
  chalkTalkTitle,
  sceneSeconds,
} from '../data/chalk-talk'
import { trackUsage } from '../analytics/usage'
import { renderWithProgress } from '../test/renderWithProgress'

vi.mock('../analytics/usage', () => ({ trackUsage: vi.fn() }))
vi.mock('./board/tray-state', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./board/tray-state')>()
  return { ...actual, cueSmudge: vi.fn(actual.cueSmudge) }
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
const desktop = () => media((query) => query.includes('min-width'))
const phone = () => media(() => false)
const stillDesktop = () =>
  media((query) => query.includes('min-width') || query.includes('reduced'))

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

const talk = () => within(screen.getByRole('region', { name: chalkTalkTitle }))
const play = () => talk().getByRole('button', { name: 'Play' })
const pause = () => talk().getByRole('button', { name: 'Pause' })
const dashes = () =>
  within(talk().getByRole('list', { name: 'Scenes' })).getAllByRole('button')
const time = () => talk().getByText(/^\d:\d\d \/ 1:00$/).textContent
const current = () =>
  talk()
    .getAllByRole('listitem')
    .find((item) => item.getAttribute('aria-current') === 'step')!
const click = (element: HTMLElement) =>
  act(() => {
    fireEvent.click(element)
  })

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  window.localStorage.clear()
  vi.mocked(trackUsage).mockClear()
  vi.mocked(cueSmudge).mockClear()
  desktop()
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('the script', () => {
  it('has eight scenes of twenty words or fewer, each resting on a pinned source but the last', () => {
    expect(chalkTalkScenes).toHaveLength(8)
    expect(sceneSeconds * chalkTalkScenes.length).toBe(60)
    for (const scene of chalkTalkScenes) {
      expect(scene.caption.split(/\s+/).length).toBeLessThanOrEqual(20)
      if (scene.id === 'board') {
        expect(scene.sources).toHaveLength(0)
        continue
      }
      expect(scene.sources.length).toBeGreaterThan(0)
      for (const source of scene.sources) {
        expect(source.reference.kind).toBe('official-publication')
        expect(source.reference.url).toMatch(/^https:\/\//)
        expect(source.where).not.toBe('')
        expect(source.quote.length).toBeGreaterThan(20)
      }
    }
    // Only the two pinned records the glossary and the timeline cite.
    const titles = new Set(
      chalkTalkScenes.flatMap((scene) =>
        scene.sources.map((source) => source.reference.title),
      ),
    )
    for (const title of titles)
      expect(title).toMatch(
        /^32 CFR § 170\.|^DFARS 252\.204-7021|^FAR 52\.204-21/,
      )
    // Every part is drawn once, by one scene; the last scene adds nothing.
    expect(new Set(chalkTalkParts).size).toBe(chalkTalkParts.length)
    expect(chalkTalkScenes[7]!.parts).toEqual([])
  })

  it('takes its counts from the catalog and its words from the glossary', () => {
    const count = (level: string) =>
      referenceControls.filter((control) => control.level === level).length
    expect(chalkTalkScenes[2]!.caption).toContain(
      count('Level 1') === 15 ? 'fifteen' : String(count('Level 1')),
    )
    expect(chalkTalkScenes[3]!.caption).toContain(`the ${count('Level 2')} `)
    expect(chalkTalkScenes[4]!.caption).toContain(` ${count('Level 3')} `)
    for (const scene of chalkTalkScenes)
      for (const word of scene.words) {
        expect(glossaryTerms.some((term) => term.id === word.term)).toBe(true)
        expect(scene.caption.split(word.phrase)).toHaveLength(2)
      }
    const named = chalkTalkScenes.flatMap((scene) =>
      scene.words.map((word) => word.term),
    )
    for (const id of ['fci', 'cui', 'c3pao', 'sprs', 'affirming-official'])
      expect(named).toContain(id)
    expect(chalkTalkScenes[7]!.links?.map((link) => link.href)).toEqual([
      '/glossary',
      browseUrl,
    ])
    // Level 3 rests on Level 2, in the words of the rule.
    expect(
      chalkTalkScenes[4]!.sources.some((source) =>
        source.quote.includes('prerequisite to undergo a Level 3'),
      ),
    ).toBe(true)
    // The status scene says what its quotes say: a score met, SPRS, compliance.
    expect(
      chalkTalkScenes[5]!.sources.some((source) =>
        source.quote.includes('officially stored in SPRS'),
      ),
    ).toBe(true)
  })
})

describe('the chalk talk', () => {
  it('plays once from the top on a desktop, with the drawing hidden and the eight captions listed', async () => {
    const user = userEvent.setup()
    render(<ChalkTalk autoplay />)
    const region = screen.getByRole('region', { name: chalkTalkTitle })
    expect(region.querySelector('svg.chalk-talk-drawing')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
    // Its title names the region: a heading, smaller than Home's headline.
    expect(talk().getByRole('heading', { level: 2 })).toHaveTextContent(
      chalkTalkTitle,
    )
    expect(talk().queryByRole('status')).toBeNull()
    expect(region.querySelector('[aria-live]')).toBeNull()
    // Lists stay lists for every screen reader, styled or not.
    expect(region.querySelectorAll('ol[role="list"]')).toHaveLength(2)
    const captions = talk()
      .getAllByRole('listitem')
      .filter((item) => item.closest('.chalk-talk-script'))
    expect(captions).toHaveLength(8)
    expect(current()).toHaveTextContent(chalkTalkScenes[0]!.caption)
    // The captions off the screen are plain text: nothing hidden to tab to.
    for (const item of captions)
      if (item !== current()) {
        expect(item).toHaveClass('sr-only')
        expect(item.querySelector('a, button, [tabindex]')).toBeNull()
      }
    // The play/pause button toggles, a 44px target with a label that says which.
    expect(pause()).toBeInTheDocument()
    await user.click(pause())
    expect(play()).toBeInTheDocument()
    await user.click(play())
    expect(pause()).toBeInTheDocument()
    expect(time()).toBe('0:00 / 1:00')
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('pauses where it is and plays on from there; a jump while playing keeps playing; unmounting stops the frames', () => {
    const frame = frames()
    const { unmount } = render(<ChalkTalk autoplay />)
    expect(frame.waiting()).toBe(1)
    for (let step = 0; step < 12; step += 1) frame.tick(100)
    expect(time()).toBe('0:01 / 1:00')
    click(pause())
    expect(frame.waiting()).toBe(0)
    click(play())
    frame.tick(100)
    expect(time()).toBe('0:01 / 1:00')
    click(dashes()[3]!)
    expect(time()).toBe('0:22 / 1:00')
    expect(pause()).toBeInTheDocument()
    expect(current()).toHaveTextContent(chalkTalkScenes[3]!.caption)
    unmount()
    expect(frame.waiting()).toBe(0)
  })

  it('waits for a hidden tab, and a stalled frame never jumps it ahead', () => {
    const frame = frames()
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    })
    const { unmount } = render(<ChalkTalk autoplay />)
    expect(play()).toBeInTheDocument()
    expect(frame.waiting()).toBe(0)
    delete (document as { hidden?: boolean }).hidden
    unmount()
    render(<ChalkTalk autoplay />)
    expect(pause()).toBeInTheDocument()
    // A frame thirty seconds late (the tab was away) moves it on a quarter second.
    frame.tick(30_000)
    expect(time()).toBe('0:00 / 1:00')
    expect(pause()).toBeInTheDocument()
    // Hidden while it plays: it pauses.
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true,
    })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(play()).toBeInTheDocument()
    delete (document as { hidden?: boolean }).hidden
  })

  it('jumps to a scene from its dash, and the caption follows', async () => {
    const user = userEvent.setup()
    render(<ChalkTalk autoplay={false} />)
    const buttons = dashes()
    expect(buttons).toHaveLength(8)
    expect(buttons[0]).toHaveAccessibleName(
      `Scene 1: ${chalkTalkScenes[0]!.caption}`,
    )
    await user.click(buttons[2]!)
    expect(buttons[2]).toHaveAttribute('aria-current', 'step')
    expect(current()).toHaveTextContent(chalkTalkScenes[2]!.caption)
    expect(time()).toBe('0:15 / 1:00')
    // Paused, the scene stands drawn: its own parts are on the board.
    const drawing = document.querySelector('svg.chalk-talk-drawing')!
    expect(drawing).not.toHaveClass('is-preview')
    const label = (text: string) =>
      Array.from(drawing.querySelectorAll('text'))
        .find((node) => node.textContent === text)!
        .closest('g')!
    expect(label('Level 1').getAttribute('style') ?? '').not.toContain('hidden')
    expect(label('Level 2').getAttribute('style') ?? '').toContain('hidden')
    // A glossary word in the caption opens its chalk popover.
    const fci = within(current()).getByRole('button', { name: /^FCI/ })
    await user.click(fci)
    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Federal Contract Information',
    )
    await user.keyboard('{Escape}')
    // The last scene links to the glossary and the board.
    await user.click(buttons[7]!)
    expect(
      within(current()).getByRole('link', { name: 'the glossary' }),
    ).toHaveAttribute('href', '/glossary')
    expect(
      within(current()).getByRole('link', { name: 'this board' }),
    ).toHaveAttribute('href', browseUrl)
    expect(play()).toBeInTheDocument()
  })

  it('holds still while a caption word has focus, so a popover opened from the keyboard stays', () => {
    frames()
    render(<ChalkTalk autoplay />)
    click(dashes()[1]!)
    expect(pause()).toBeInTheDocument()
    const word = within(current()).getByRole('button', {
      name: /^Federal Contract Information/,
    })
    act(() => {
      word.focus()
    })
    expect(play()).toBeInTheDocument()
    expect(current()).toHaveTextContent(chalkTalkScenes[1]!.caption)
  })

  it('ends on the full drawing with Watch again, which has Smudge sweep before it plays from the start', () => {
    const frame = frames()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    render(<ChalkTalk autoplay={false} />)
    // From the last scene, standing drawn, play goes on past its drawing.
    click(dashes()[7]!)
    expect(play()).toBeInTheDocument()
    click(play())
    expect(time()).toBe('0:57 / 1:00')
    for (let step = 0; step < 20 && frame.waiting(); step += 1) frame.tick(200)
    const again = () => screen.getByRole('button', { name: 'Watch again' })
    expect(again()).toBeInTheDocument()
    expect(time()).toBe('1:00 / 1:00')
    expect(frame.waiting()).toBe(0)
    expect(current()).toHaveTextContent(chalkTalkScenes[7]!.caption)
    const drawing = document.querySelector('svg.chalk-talk-drawing')!
    expect(drawing.querySelectorAll('[style*="hidden"]')).toHaveLength(0)
    // Watch again: the drawing stands while Smudge sweeps.
    click(again())
    expect(cueSmudge).toHaveBeenCalledWith('sweep')
    expect(time()).toBe('1:00 / 1:00')
    expect(drawing.querySelectorAll('[style*="hidden"]')).toHaveLength(0)
    click(dashes()[2]!)
    expect(time()).toBe('1:00 / 1:00')
    // His sweep done, the board is clean and it plays from the start.
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(time()).toBe('0:00 / 1:00')
    expect(pause()).toBeInTheDocument()
    expect(
      drawing.querySelectorAll('[style*="hidden"]').length,
    ).toBeGreaterThan(0)
    expect(frame.waiting()).toBe(1)
  })

  it('does not autoplay on a phone, or under reduced motion, where the finished drawing stands with a stepped list', async () => {
    phone()
    const user = userEvent.setup()
    const { unmount } = renderWithProgress(<Home />)
    expect(play()).toBeInTheDocument()
    expect(time()).toBe('0:00 / 1:00')
    // Before the first play the finished drawing shows faintly.
    expect(document.querySelector('svg.chalk-talk-drawing')).toHaveClass(
      'is-preview',
    )
    await user.click(play())
    expect(document.querySelector('svg.chalk-talk-drawing')).not.toHaveClass(
      'is-preview',
    )
    unmount()
    stillDesktop()
    renderWithProgress(<Home />)
    expect(talk().queryByRole('button', { name: /Play|Pause/ })).toBeNull()
    expect(talk().queryByRole('list', { name: 'Scenes' })).toBeNull()
    const items = talk().getAllByRole('listitem')
    expect(items).toHaveLength(8)
    expect(items.filter((item) => !item.classList.contains('sr-only'))).toEqual(
      [current()],
    )
    expect(current()).toHaveTextContent(chalkTalkScenes[0]!.caption)
    expect(talk().getByText('1 / 8')).toBeInTheDocument()
    // Every part is on the board, drawn in full.
    const drawing = document.querySelector('svg.chalk-talk-drawing')!
    expect(drawing).not.toHaveClass('is-preview')
    expect(drawing.querySelectorAll('[style*="hidden"]')).toHaveLength(0)
    expect(drawing.querySelectorAll('[style*="clip-path"]')).toHaveLength(0)
    // Previous and Next: at either end the button stays focusable and does nothing.
    const previous = talk().getByRole('button', { name: 'Previous' })
    const next = talk().getByRole('button', { name: 'Next' })
    expect(previous).toHaveAttribute('aria-disabled', 'true')
    await user.click(previous)
    expect(current()).toHaveTextContent(chalkTalkScenes[0]!.caption)
    await user.click(next)
    expect(current()).toHaveTextContent(chalkTalkScenes[1]!.caption)
    expect(previous).not.toHaveAttribute('aria-disabled')
    await user.click(previous)
    expect(current()).toHaveTextContent(chalkTalkScenes[0]!.caption)
    for (let step = 0; step < 7; step += 1) await user.click(next)
    expect(next).toHaveAttribute('aria-disabled', 'true')
    expect(next).toHaveFocus()
    expect(talk().getByText('8 / 8')).toBeInTheDocument()
  })

  it('keeps Home to one h1, with the talk a region after the chalks and nothing of it larger than the headline', () => {
    renderWithProgress(<Home />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'CMMC, in plain words.',
    )
    const region = screen.getByRole('region', { name: chalkTalkTitle })
    expect(region.closest('.home-talk')).not.toBeNull()
    expect(screen.getAllByRole('heading')).toHaveLength(2)
    expect(screen.queryByRole('complementary')).toBeNull()
    // In the DOM the talk follows "Pick up a chalk to start." and the search.
    const search = screen.getByRole('search', { name: 'Find a control' })
    expect(
      search.compareDocumentPosition(region) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(trackUsage).not.toHaveBeenCalled()
  })
})
