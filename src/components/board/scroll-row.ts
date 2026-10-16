import { useEffect, useState, type RefObject } from 'react'

/** Which edges of a row are hiding more of it: the fade shows there. */
export type RowFade = 'none' | 'start' | 'end' | 'both'

export function rowFade(element: {
  readonly scrollLeft: number
  readonly scrollWidth: number
  readonly clientWidth: number
}): RowFade {
  const hidden = element.scrollWidth - element.clientWidth
  if (hidden <= 1) return 'none'
  const start = element.scrollLeft > 1
  const end = element.scrollLeft < hidden - 1
  return start && end ? 'both' : start ? 'start' : end ? 'end' : 'none'
}

/**
 * A row that scrolls sideways instead of wrapping (the header's places to go,
 * a control's tabs on a phone): which of its edges hides more, kept current
 * as it scrolls and as the screen changes, for a soft fade there.
 */
export function useScrollFade(row: RefObject<HTMLElement | null>): RowFade {
  const [fade, setFade] = useState<RowFade>('none')
  useEffect(() => {
    const element = row.current
    if (!element) return
    const measure = () => setFade(rowFade(element))
    measure()
    element.addEventListener('scroll', measure, { passive: true })
    const watcher =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    watcher?.observe(element)
    window.addEventListener('resize', measure)
    // The webfonts arrive after the first paint and change the row's width.
    const fonts = document.fonts
    fonts?.addEventListener('loadingdone', measure)
    void fonts?.ready.then(measure)
    return () => {
      element.removeEventListener('scroll', measure)
      watcher?.disconnect()
      window.removeEventListener('resize', measure)
      fonts?.removeEventListener('loadingdone', measure)
    }
  }, [row])
  return fade
}
