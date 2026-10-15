/**
 * The address bar as a store. The browser announces Back, Forward and a
 * fragment change on its own; a pushState or replaceState announces nothing,
 * so every place that writes the address calls announceAddress() after it.
 * The chalk marks listen: they belong to the page the address names.
 */
const ADDRESS_EVENT = 'cipher-and-chalk:address'
const browserEvents = ['popstate', 'hashchange'] as const

export function announceAddress() {
  window.dispatchEvent(new Event(ADDRESS_EVENT))
}

export function subscribeAddress(listener: () => void): () => void {
  for (const type of browserEvents) window.addEventListener(type, listener)
  window.addEventListener(ADDRESS_EVENT, listener)
  return () => {
    for (const type of browserEvents) window.removeEventListener(type, listener)
    window.removeEventListener(ADDRESS_EVENT, listener)
  }
}
