export const SITE_NAME = 'Cipher & Chalk'
export const SITE_ORIGIN = 'https://cipherandchalk.vercel.app'
export const DEFAULT_DESCRIPTION =
  'All 149 CMMC controls, each quoted from the official guide with its page, then explained three ways. Free and open source.'

export interface PageMeta {
  readonly title: string
  readonly description?: string
  /** Path (and query) that identifies this page; omit the origin. */
  readonly canonicalPath?: string
}

function setMeta(selector: string, attribute: string, value: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector)
  if (element) element.setAttribute(attribute, value)
}

/**
 * Keep the document head in step with client-side navigation. The static
 * shell carries the site-wide defaults; each page narrows them.
 */
export function setPageMeta({ title, description, canonicalPath }: PageMeta) {
  const fullTitle = `${title} | ${SITE_NAME}`
  document.title = fullTitle
  const text = description ?? DEFAULT_DESCRIPTION
  setMeta('meta[name="description"]', 'content', text)
  setMeta('meta[property="og:title"]', 'content', fullTitle)
  setMeta('meta[property="og:description"]', 'content', text)
  setMeta('meta[name="twitter:title"]', 'content', fullTitle)
  setMeta('meta[name="twitter:description"]', 'content', text)
  const path = canonicalPath ?? window.location.pathname
  const url = `${SITE_ORIGIN}${path}`
  setMeta('meta[property="og:url"]', 'content', url)
  const canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  )
  if (canonical) canonical.href = url
}
