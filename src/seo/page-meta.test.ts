import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_DESCRIPTION, SITE_ORIGIN, setPageMeta } from './page-meta'

function head(selector: string) {
  return document.head.querySelector(selector)
}

describe('setPageMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = `
      <meta name="description" content="x" />
      <meta property="og:title" content="x" />
      <meta property="og:description" content="x" />
      <meta property="og:url" content="x" />
      <meta name="twitter:title" content="x" />
      <meta name="twitter:description" content="x" />
      <link rel="canonical" href="x" />`
    window.history.replaceState(null, '', '/glossary')
  })

  it('sets the title, descriptions and canonical for a page', () => {
    setPageMeta({ title: 'Glossary', description: 'Plain words.' })
    expect(document.title).toBe('Glossary | Cipher & Chalk')
    expect(head('meta[name="description"]')?.getAttribute('content')).toBe(
      'Plain words.',
    )
    expect(head('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'Glossary | Cipher & Chalk',
    )
    expect(
      head('meta[name="twitter:description"]')?.getAttribute('content'),
    ).toBe('Plain words.')
    expect(head('meta[property="og:url"]')?.getAttribute('content')).toBe(
      `${SITE_ORIGIN}/glossary`,
    )
    expect(head('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${SITE_ORIGIN}/glossary`,
    )
  })

  it('falls back to the site description and honors an explicit canonical', () => {
    setPageMeta({ title: 'Home', canonicalPath: '/' })
    expect(head('meta[name="description"]')?.getAttribute('content')).toBe(
      DEFAULT_DESCRIPTION,
    )
    expect(head('link[rel="canonical"]')?.getAttribute('href')).toBe(
      `${SITE_ORIGIN}/`,
    )
  })

  it('tolerates a head without the expected tags', () => {
    document.head.innerHTML = ''
    expect(() => setPageMeta({ title: 'About' })).not.toThrow()
    expect(document.title).toBe('About | Cipher & Chalk')
  })
})
