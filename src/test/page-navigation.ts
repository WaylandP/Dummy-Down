import { act } from '@testing-library/react'

/** jsdom cannot follow native documents; replay the real link's address. Browser QA clicks it. */
export function followPageLink(link: HTMLElement) {
  const href = link.getAttribute('href')
  if (!href) throw new Error('Expected a native page link')
  act(() => {
    window.history.pushState(null, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
}
