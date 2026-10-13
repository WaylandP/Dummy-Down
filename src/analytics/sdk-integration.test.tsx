import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BeforeSend } from '@vercel/analytics/react'
import { UsageAnalytics } from './UsageAnalytics'
import { setUsagePreference } from './privacy'

/**
 * Exercise the real SDK queue and script configuration. jsdom does not fetch or
 * execute this injected external script; no collector request is made.
 */
beforeEach(() => {
  vi.stubEnv('PROD', true)
  vi.stubEnv('VITE_USAGE_DEPLOYMENT', 'production')
  window.localStorage.clear()
  Object.defineProperty(navigator, 'doNotTrack', {
    configurable: true,
    value: undefined,
  })
  Object.defineProperty(navigator, 'globalPrivacyControl', {
    configurable: true,
    value: undefined,
  })
  delete window.va
  delete window.vaq
  delete window.vam
  setUsagePreference(true)
})

afterEach(() => {
  document.head
    .querySelectorAll('script[src*="/_vercel/insights/"]')
    .forEach((script) => script.remove())
  delete window.va
  delete window.vaq
  delete window.vam
  vi.unstubAllEnvs()
})

function queuedViews() {
  return window.vaq?.filter(([name]) => name === 'pageview') ?? []
}

function sdkBeforeSend() {
  return window.vaq?.find(([name]) => name === 'beforeSend')?.[1] as BeforeSend
}

describe('official Vercel SDK integration', () => {
  it('injects once, disables query-history auto tracking, and preserves one pageview across privacy toggles', () => {
    render(<UsageAnalytics />)
    const scripts = document.head.querySelectorAll<HTMLScriptElement>(
      'script[src*="/_vercel/insights/"]',
    )
    expect(scripts).toHaveLength(1)
    expect(scripts[0]?.dataset.disableAutoTrack).toBe('1')
    expect(queuedViews()).toHaveLength(1)
    expect(queuedViews()[0]?.[1]).toEqual({ route: '/', path: '/' })

    act(() => setUsagePreference(false))
    expect(
      sdkBeforeSend()({
        type: 'event',
        url: `${window.location.origin}/?q=secret`,
      }),
    ).toBeNull()
    act(() => setUsagePreference(true))
    expect(queuedViews()).toHaveLength(1)
    expect(
      sdkBeforeSend()({
        type: 'pageview',
        url: `${window.location.origin}/?q=secret#private`,
      }),
    ).toEqual({ type: 'pageview', url: `${window.location.origin}/` })
    expect(
      document.head.querySelectorAll('script[src*="/_vercel/insights/"]'),
    ).toHaveLength(1)
  })

  it('does not inject or queue SDK traffic in previews', () => {
    vi.stubEnv('VITE_USAGE_DEPLOYMENT', 'preview')
    render(<UsageAnalytics />)
    expect(window.va).toBeUndefined()
    expect(window.vaq).toBeUndefined()
    expect(
      document.head.querySelector('script[src*="/_vercel/insights/"]'),
    ).toBeNull()
  })

  it('does not inject for an initial opt-out; first later allowance requests one view', () => {
    setUsagePreference(false)
    render(<UsageAnalytics />)
    expect(window.va).toBeUndefined()
    act(() => setUsagePreference(true))
    expect(queuedViews()).toHaveLength(1)
    act(() => setUsagePreference(false))
    act(() => setUsagePreference(true))
    expect(queuedViews()).toHaveLength(1)
  })
})
