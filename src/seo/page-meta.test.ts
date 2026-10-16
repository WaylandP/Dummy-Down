import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
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

describe('the static head, which link previews read', () => {
  const page = new DOMParser().parseFromString(indexHtml, 'text/html')
  const content = (selector: string) =>
    page.head.querySelector(selector)?.getAttribute('content')

  it('previews the site in its own words', () => {
    expect(page.title).toBe('Cipher & Chalk — CMMC, in plain words.')
    expect(content('meta[property="og:title"]')).toBe(page.title)
    expect(content('meta[name="twitter:title"]')).toBe(page.title)
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ])
      expect(content(selector)).toBe(DEFAULT_DESCRIPTION)
    expect(content('meta[property="og:image:alt"]')).toContain(
      'CMMC, in plain words.',
    )
  })

  it('points the card at an image of the size it declares', () => {
    const image = new URL(content('meta[property="og:image"]')!)
    expect(image.origin).toBe(SITE_ORIGIN)
    expect(content('meta[name="twitter:image"]')).toBe(image.href)
    // The tests run from the repository root, which holds public/.
    const png = readFileSync(`${process.cwd()}/public${image.pathname}`)
    // A PNG's IHDR chunk holds its width and height at bytes 16 and 20.
    expect(png.readUInt32BE(16)).toBe(
      Number(content('meta[property="og:image:width"]')),
    )
    expect(png.readUInt32BE(20)).toBe(
      Number(content('meta[property="og:image:height"]')),
    )
  })
})
