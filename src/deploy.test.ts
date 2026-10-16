import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { controlsPath } from './state/site-page'

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
  rewrites: { source: string; destination: string }[]
  redirects: { source: string; destination: string; permanent: boolean }[]
}

describe('the deployment', () => {
  it('rewrites the seven page paths to the app and sends /controls to the Controls page', () => {
    expect(vercel.rewrites.map((rule) => rule.source).sort()).toEqual([
      '/about',
      '/coverage',
      '/disclaimer',
      '/glossary',
      '/learn',
      '/practice',
      '/timeline',
    ])
    for (const rule of vercel.rewrites)
      expect(rule.destination).toBe('/index.html')
    expect(vercel.redirects).toEqual([
      { source: '/controls', destination: controlsPath, permanent: true },
    ])
  })
})
