import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { scrollContentWithKeys } from './scroll-keys'

function press(
  key: string,
  target: Element | Document = document.body,
  init: KeyboardEventInit = {},
) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  })
  target.dispatchEvent(event)
  return event
}

describe('the scrolling keys reach the content', () => {
  let main: HTMLElement
  let scrollBy: ReturnType<typeof vi.fn>
  beforeEach(() => {
    document.body.innerHTML = `
      <header><a href="/glossary" id="nav">Glossary</a>
        <button type="button" id="switch" role="switch" aria-checked="true">Smudge</button>
        <input id="q" /></header>
      <main id="main" tabindex="-1"><a href="#" id="inside">Inside</a></main>`
    main = document.getElementById('main')!
    main.style.overflowY = 'auto'
    Object.defineProperty(main, 'clientHeight', { value: 800 })
    Object.defineProperty(main, 'scrollHeight', { value: 3000 })
    scrollBy = vi.fn()
    main.scrollBy = scrollBy as unknown as HTMLElement['scrollBy']
    window.addEventListener('keydown', scrollContentWithKeys)
  })
  afterEach(() => {
    window.removeEventListener('keydown', scrollContentWithKeys)
    document.body.innerHTML = ''
  })

  it('pages the content from a fresh load, where nothing has focus', () => {
    const event = press('PageDown')
    expect(scrollBy).toHaveBeenCalledWith({ top: 700, behavior: 'smooth' })
    expect(event.defaultPrevented).toBe(true)
    press(' ')
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 700, behavior: 'smooth' })
    press(' ', document.body, { shiftKey: true })
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -700, behavior: 'smooth' })
    press('ArrowDown')
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 40, behavior: 'smooth' })
    press('End')
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 3000, behavior: 'smooth' })
  })

  it('scrolls from a header link, whose own keys are not the space bar', () => {
    const nav = document.getElementById('nav')!
    nav.focus()
    press(' ', nav)
    expect(scrollBy).toHaveBeenCalledTimes(1)
  })

  it('leaves the keys to buttons, fields, the content and a dialog', () => {
    const toggle = document.getElementById('switch')!
    toggle.focus()
    press(' ', toggle)
    press('PageDown', toggle)
    expect(scrollBy).toHaveBeenCalledTimes(1)
    const field = document.getElementById('q')!
    field.focus()
    press('PageDown', field)
    const inside = document.getElementById('inside')!
    inside.focus()
    press('PageDown', inside)
    inside.blur()
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div role="dialog" aria-modal="true"></div>',
    )
    press('PageDown')
    expect(scrollBy).toHaveBeenCalledTimes(1)
  })

  it("scrolls a page's own scroller when it has one, and main otherwise", () => {
    main.insertAdjacentHTML(
      'beforeend',
      '<div id="column" data-scroller="" style="overflow-y: auto"></div>',
    )
    const column = document.getElementById('column')!
    Object.defineProperty(column, 'clientHeight', { value: 600 })
    Object.defineProperty(column, 'scrollHeight', {
      value: 2400,
      configurable: true,
    })
    const columnScroll = vi.fn()
    column.scrollBy = columnScroll as unknown as HTMLElement['scrollBy']
    press('PageDown')
    expect(columnScroll).toHaveBeenCalledWith({ top: 525, behavior: 'smooth' })
    expect(scrollBy).not.toHaveBeenCalled()
    // With nothing of its own to scroll, main takes the key.
    Object.defineProperty(column, 'scrollHeight', { value: 600 })
    press('PageDown')
    expect(scrollBy).toHaveBeenCalledTimes(1)
  })

  it('does nothing where the page itself scrolls, or when the key is taken or modified', () => {
    main.style.overflowY = 'visible'
    press('PageDown')
    main.style.overflowY = 'auto'
    press('PageDown', document.body, { ctrlKey: true })
    const taken = new KeyboardEvent('keydown', {
      key: 'PageDown',
      bubbles: true,
      cancelable: true,
    })
    taken.preventDefault()
    document.body.dispatchEvent(taken)
    expect(scrollBy).not.toHaveBeenCalled()
  })
})
