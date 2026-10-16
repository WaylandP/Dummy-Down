import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { controlsPath } from './state/site-page'

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as {
  rewrites: { source: string; destination: string }[]
  redirects: { source: string; destination: string; permanent: boolean }[]
  headers: { source: string; headers: { key: string; value: string }[] }[]
  git: { deploymentEnabled: Record<string, boolean> }
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

  it('sends the security headers on every path without limiting what the pages load', () => {
    expect(vercel.headers).toHaveLength(1)
    const [rule] = vercel.headers
    expect(rule!.source).toBe('/(.*)')
    const sent = Object.fromEntries(
      rule!.headers.map(({ key, value }) => [key.toLowerCase(), value]),
    )
    expect(sent['x-content-type-options']).toBe('nosniff')
    expect(sent['x-frame-options']).toBe('DENY')
    expect(sent['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(sent['strict-transport-security']).toMatch(/^max-age=\d{8,}/)
    expect(sent['cross-origin-opener-policy']).toBe('same-origin')
    // The policy stops framing, plugins and foreign form targets only; it
    // names no script, style, font, image, media or connect source, so
    // nothing the app loads from its own origin can be blocked by it.
    const policy = sent['content-security-policy']!
    expect(policy).toContain("frame-ancestors 'none'")
    expect(policy).not.toMatch(
      /(default|script|style|font|img|media|connect)-src/,
    )
    // Sharing and copying stay allowed; only unused device features are off.
    const permissions = sent['permissions-policy']!
    expect(permissions).not.toMatch(/web-share|clipboard/)
    expect(permissions).toContain('camera=()')
  })

  it('builds production from main and skips branches that are not the site', () => {
    const enabled = vercel.git.deploymentEnabled
    expect(enabled.main).not.toBe(false)
    for (const branch of ['screenshots', 'archive/*', 'claude/*', 'content/*'])
      expect(enabled[branch]).toBe(false)
  })
})
