/** Native page links keep routing small; legacy root lesson URLs still resolve. */
export type SitePage = 'home' | 'learn' | 'glossary' | 'about' | 'not-found'

export function sitePage(url: URL): SitePage {
  const path = url.pathname.replace(/\/$/, '') || '/'
  if (path === '/learn') return 'learn'
  if (path === '/glossary') return 'glossary'
  if (path === '/about') return 'about'
  if (path !== '/') return 'not-found'
  // Retain historical section links as well as exact shared lesson addresses.
  if (url.hash === '#glossary') return 'glossary'
  if (url.hash === '#about' || url.hash === '#approach') return 'about'
  if (
    [
      'view',
      'framework',
      'edition',
      'control',
      'mode',
      'catalog',
      'q',
      'family',
      'level',
      'collection',
    ].some((key) => url.searchParams.has(key)) ||
    ['#explorer', '#control-search'].includes(url.hash)
  )
    return 'learn'
  return 'home'
}
