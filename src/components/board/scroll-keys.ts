/** A screen less a little, as browsers page; and a line. */
const screen = 0.875
const line = 40

/** Elements that take the space bar themselves. */
const takesSpace =
  'button, summary, [role="button"], [role="switch"], [role="checkbox"], [role="menuitem"], [role="option"]'
/** Elements that take the arrow keys themselves. */
const takesArrows =
  '[role="tab"], [role="radio"], [role="slider"], [role="listbox"], [role="menu"], [role="menubar"], [role="tree"], [role="grid"], audio, video'
/** Elements that take every key. */
const takesAll = 'input, textarea, select, [contenteditable]'

/** The scroller the keys should move: a page's own (`data-scroller`), else main. */
function scroller(main: HTMLElement): HTMLElement | null {
  const own = main.querySelector<HTMLElement>('[data-scroller]')
  return (
    [own, main].find(
      (area) =>
        area &&
        getComputedStyle(area).overflowY === 'auto' &&
        area.scrollHeight > area.clientHeight,
    ) ?? null
  )
}

/**
 * At desktop sizes the content scrolls, not the page (board.css), and a
 * browser sends the scrolling keys only where focus is. With nothing focused
 * inside the content, as on a fresh load or after one of the header's links,
 * they would do nothing: this sends them on, to the page's own scroller when
 * it has one. Inside the content, and wherever the page itself scrolls, the
 * browser does the work.
 */
export function scrollContentWithKeys(event: KeyboardEvent): void {
  if (event.defaultPrevented || event.isComposing) return
  if (event.altKey || event.ctrlKey || event.metaKey) return
  const main = document.getElementById('main')
  if (!main || main.contains(document.activeElement)) return
  if (
    document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')
  )
    return
  const target = event.target instanceof Element ? event.target : null
  if (target?.closest(takesAll)) return
  const area = scroller(main)
  if (!area) return
  const page = area.clientHeight * screen
  let top: number
  switch (event.key) {
    case ' ':
      if (target?.closest(takesSpace)) return
      top = event.shiftKey ? -page : page
      break
    case 'PageDown':
      top = page
      break
    case 'PageUp':
      top = -page
      break
    case 'ArrowDown':
      if (target?.closest(takesArrows)) return
      top = line
      break
    case 'ArrowUp':
      if (target?.closest(takesArrows)) return
      top = -line
      break
    case 'Home':
      top = -area.scrollTop
      break
    case 'End':
      top = area.scrollHeight
      break
    default:
      return
  }
  event.preventDefault()
  area.scrollBy({
    top,
    behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? 'instant'
      : 'smooth',
  })
}
