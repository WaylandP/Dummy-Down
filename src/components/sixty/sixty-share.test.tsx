import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Home } from '../Home'
import { trackUsage } from '../../analytics/usage'
import { renderWithProgress } from '../../test/renderWithProgress'
import { SixtyShare } from './SixtyShare'
import { sixtyTitle } from './sixty-script'

vi.mock('../../analytics/usage', () => ({ trackUsage: vi.fn() }))

const video = '/media/cmmc-in-sixty-seconds.mp4'
const link = 'http://localhost:3000/?play=sixty'

/** jsdom has no media queries: the test says which ones match. */
function media(matches: (query: string) => boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: matches(query),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }))
}

/** The frames under the test's hand, as in sixty.test.tsx. */
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

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  window.localStorage.clear()
  vi.mocked(trackUsage).mockClear()
  media(() => false)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const share = () => screen.getByRole('button', { name: 'Share' })
const menu = () => screen.getByRole('menu', { name: 'Share' })

describe('Share', () => {
  it('is a 44px button at the end of the player row that opens a menu with the three ways to share, and nothing is counted', async () => {
    const user = userEvent.setup()
    render(<SixtyShare video={video} link={link} />)
    const button = share()
    expect(button).toHaveClass('sixty-share')
    expect(button).toHaveAttribute('aria-haspopup', 'menu')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).toBeNull()
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    const items = within(menu()).getAllByRole('menuitem')
    // No file sharing in this browser: the link and the download only.
    expect(items.map((item) => item.textContent)).toEqual([
      'Copy link',
      'Download the videoMP4 · 1:00',
    ])
    expect(items[0]).toHaveFocus()
    const download = within(menu()).getByRole('menuitem', {
      name: /Download the video/,
    })
    expect(download).toHaveAttribute('href', video)
    expect(download).toHaveAttribute('download', 'cmmc-in-sixty-seconds.mp4')
    expect(trackUsage).not.toHaveBeenCalled()
  })

  it('copies the link and says so in a status region; refused, it shows the link selected in a read-only field', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    try {
      render(<SixtyShare video={video} link={link} />)
      await user.click(share())
      const status = within(menu()).getByRole('status')
      expect(status).toHaveAttribute('aria-live', 'polite')
      expect(status).toHaveTextContent('')
      await user.click(
        within(menu()).getByRole('menuitem', { name: 'Copy link' }),
      )
      expect(writeText).toHaveBeenCalledWith(link)
      expect(status).toHaveTextContent('Link copied')
      expect(screen.queryByRole('textbox')).toBeNull()
      // Refused: the field, with the link selected and focused.
      writeText.mockRejectedValueOnce(new Error('denied'))
      await user.click(
        within(menu()).getByRole('menuitem', { name: 'Copy link' }),
      )
      const field = screen.getByRole('textbox', { name: 'Link to copy' })
      expect(field).toHaveValue(link)
      expect(field).toHaveAttribute('readonly')
      expect(field).toHaveFocus()
      expect((field as HTMLInputElement).selectionEnd).toBe(link.length)
      expect(status).toHaveTextContent('')
      expect(trackUsage).not.toHaveBeenCalled()
    } finally {
      Reflect.deleteProperty(navigator, 'clipboard')
    }
  })

  it('offers "Send the video…" where the browser can share an MP4 as a file, fetches the file when the menu opens, and shares it', async () => {
    const user = userEvent.setup()
    const blob = new Blob(['mp4'], { type: 'video/mp4' })
    const fetched = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => blob,
    } as unknown as Response)
    const shared = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: shared,
    })
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: (data: { files?: File[] }) =>
        (data.files ?? []).every((file) => file.type === 'video/mp4'),
    })
    try {
      render(<SixtyShare video={video} link={link} />)
      expect(fetched).not.toHaveBeenCalled()
      await user.click(share())
      expect(fetched).toHaveBeenCalledWith(video)
      const send = within(menu()).getByRole('menuitem', {
        name: 'Send the video…',
      })
      expect(within(menu()).getAllByRole('menuitem')[0]).toBe(send)
      await user.click(send)
      await act(async () => {})
      expect(shared).toHaveBeenCalledTimes(1)
      const [data] = shared.mock.calls[0] as [{ files: File[]; title: string }]
      expect(data.title).toBe('CMMC in sixty seconds')
      expect(data.files).toHaveLength(1)
      expect(data.files[0]!.name).toBe('cmmc-in-sixty-seconds.mp4')
      expect(data.files[0]!.type).toBe('video/mp4')
      // Shared: the menu closes and focus returns to Share.
      expect(screen.queryByRole('menu')).toBeNull()
      expect(share()).toHaveFocus()
      expect(trackUsage).not.toHaveBeenCalled()
    } finally {
      Reflect.deleteProperty(navigator, 'share')
      Reflect.deleteProperty(navigator, 'canShare')
    }
  })

  it('closes on Escape and on a click outside, returning focus to Share; the arrows move between items', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <p>outside</p>
        <SixtyShare video={video} link={link} />
      </div>,
    )
    await user.click(share())
    const items = within(menu()).getAllByRole('menuitem')
    expect(items[0]).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(items[1]).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(items[0]).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(items[1]).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).toBeNull()
    expect(share()).toHaveFocus()
    await user.click(share())
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await user.click(screen.getByText('outside'))
    expect(screen.queryByRole('menu')).toBeNull()
    expect(share()).toHaveFocus()
  })
})

describe('the deep link', () => {
  it('/?play=sixty opens Home with the panel playing from 0:00, the address kept, nothing counted', async () => {
    window.history.replaceState(null, '', '/?play=sixty')
    const frame = frames()
    const scrolled = vi.fn()
    Element.prototype.scrollIntoView = scrolled
    try {
      renderWithProgress(<Home />)
      await act(async () => {})
      const talk = screen.getByRole('region', { name: sixtyTitle })
      expect(scrolled).toHaveBeenCalled()
      expect(
        within(talk).getByRole('button', { name: 'Pause' }),
      ).toBeInTheDocument()
      expect(frame.waiting()).toBe(1)
      expect(talk.querySelector('.sixty-time')!.textContent).toBe('0:00 / 1:00')
      frame.tick(100)
      frame.tick(100)
      frame.tick(100)
      frame.tick(100)
      frame.tick(100)
      frame.tick(100)
      frame.tick(100)
      expect(talk.querySelector('.sixty-time')!.textContent).toBe('0:00 / 1:00')
      expect(
        talk
          .querySelector('.sixty-word[data-text="DoD"]')!
          .getAttribute('data-drawn'),
      ).toBe('none')
      expect(window.location.search).toBe('?play=sixty')
      expect(trackUsage).not.toHaveBeenCalled()
      // Share's link is the same address.
      fireEvent.click(within(talk).getByRole('button', { name: 'Share' }))
      expect(
        within(talk).getByRole('menuitem', { name: /Download the video/ }),
      ).toHaveAttribute('href', '/media/cmmc-in-sixty-seconds.mp4')
    } finally {
      Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
    }
  })

  it('with reduced motion shows the finished board and does not play', async () => {
    media((query) => query.includes('reduced-motion'))
    window.history.replaceState(null, '', '/?play=sixty')
    const frame = frames()
    Element.prototype.scrollIntoView = vi.fn()
    try {
      renderWithProgress(<Home />)
      await act(async () => {})
      const talk = screen.getByRole('region', { name: sixtyTitle })
      expect(
        within(talk).getByRole('button', { name: 'Play' }),
      ).toBeInTheDocument()
      expect(frame.waiting()).toBe(0)
      expect(talk.querySelector('.sixty-time')!.textContent).toBe('1:00')
      expect(
        Array.from(talk.querySelectorAll('[data-start]')).every(
          (mark) => mark.getAttribute('data-drawn') === 'done',
        ),
      ).toBe(true)
    } finally {
      Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
    }
  })

  it('without the parameter nothing plays on its own', async () => {
    const frame = frames()
    renderWithProgress(<Home />)
    await act(async () => {})
    const talk = screen.getByRole('region', { name: sixtyTitle })
    expect(
      within(talk).getByRole('button', { name: 'Play' }),
    ).toBeInTheDocument()
    expect(frame.waiting()).toBe(0)
  })
})
