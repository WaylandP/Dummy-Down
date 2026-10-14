import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { explorerCatalog, glossaryTerms } from '../data/content'
import type { UsageEvent } from './usage'
import { trackUsage, usageProperties } from './usage'
import {
  beforeUsageSend,
  getUsageStatus,
  isUsageDeploymentEnabled,
  sanitizeUsageUrl,
  setUsagePreference,
} from './privacy'
import { UsageAnalytics } from './UsageAnalytics'
import { UsagePreferences } from './UsagePreferences'

const sdk = vi.hoisted(() => ({
  track: vi.fn(),
  analytics: vi.fn<(props: Record<string, unknown>) => null>(() => null),
}))

vi.mock('@vercel/analytics', () => ({ track: sdk.track }))
vi.mock('@vercel/analytics/react', () => ({ Analytics: sdk.analytics }))

const lesson = {
  frameworkId: 'cmmc',
  editionId: 'readme-example',
  controlKey: 'authorized-access',
}

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
  setUsagePreference(true)
  sdk.track.mockClear()
  sdk.analytics.mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
  setUsagePreference(true)
  vi.unstubAllEnvs()
})

describe('usage deployment and privacy gates', () => {
  it.each([
    [false, 'production', false],
    [true, 'preview', false],
    [true, 'development', false],
    [true, undefined, false],
    [true, 'production', true],
  ])(
    'only enables actual production deployments: %s / %s',
    (PROD, deployment, expected) => {
      expect(
        isUsageDeploymentEnabled({ PROD, VITE_USAGE_DEPLOYMENT: deployment }),
      ).toBe(expected)
    },
  )

  it('does not inject the SDK or emit interactions in a preview', () => {
    vi.stubEnv('VITE_USAGE_DEPLOYMENT', 'preview')
    render(<UsageAnalytics />)
    trackUsage({ name: 'control_open', lesson })
    expect(getUsageStatus()).toBe('preview')
    expect(sdk.analytics).not.toHaveBeenCalled()
    expect(sdk.track).not.toHaveBeenCalled()
  })

  it('does not inject analytics during local development', () => {
    vi.stubEnv('PROD', false)
    render(<UsageAnalytics />)
    trackUsage({ name: 'control_open', lesson })
    expect(getUsageStatus()).toBe('development')
    expect(sdk.analytics).not.toHaveBeenCalled()
    expect(sdk.track).not.toHaveBeenCalled()
  })

  it.each([
    ['doNotTrack', '1'],
    ['doNotTrack', 'yes'],
    ['globalPrivacyControl', true],
  ])('honors the browser preference %s = %s', (key, value) => {
    Object.defineProperty(navigator, key, { configurable: true, value })
    setUsagePreference(true)
    render(<UsageAnalytics />)
    trackUsage({ name: 'control_open', lesson })
    expect(getUsageStatus()).toBe('browser-preference')
    expect(sdk.analytics).not.toHaveBeenCalled()
    expect(sdk.track).not.toHaveBeenCalled()
  })

  it('fails closed when preference storage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    render(<UsageAnalytics />)
    trackUsage({ name: 'control_open', lesson })
    expect(getUsageStatus()).toBe('unavailable')
    expect(sdk.analytics).not.toHaveBeenCalled()
    expect(sdk.track).not.toHaveBeenCalled()
  })

  it('applies an opt-out even when its persistence fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    setUsagePreference(false)
    trackUsage({ name: 'control_open', lesson })
    expect(getUsageStatus()).toBe('unavailable')
    expect(sdk.track).not.toHaveBeenCalled()
    expect(
      beforeUsageSend({ type: 'pageview', url: window.location.href }),
    ).toBeNull()
  })

  it('updates public preferences and stops submissions from an already mounted SDK', async () => {
    const user = userEvent.setup()
    render(
      <>
        <UsageAnalytics />
        <UsagePreferences />
      </>,
    )
    expect(sdk.analytics).toHaveBeenCalled()
    await user.click(screen.getByText('Usage & privacy'))
    sdk.track.mockClear()
    await user.click(
      screen.getByRole('button', { name: 'Pause usage measurement' }),
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'paused for this browser',
    )
    expect(getUsageStatus()).toBe('opted-out')
    expect(
      beforeUsageSend({ type: 'event', url: window.location.href }),
    ).toBeNull()
    trackUsage({ name: 'control_open', lesson })
    expect(sdk.track).not.toHaveBeenCalled()
    await user.click(
      screen.getByRole('button', { name: 'Allow usage measurement' }),
    )
    expect(getUsageStatus()).toBe('active')
  })

  it('honors an opt-out from another browser tab', () => {
    render(<UsagePreferences />)
    screen.getByText('Usage & privacy').click()
    act(() => {
      window.localStorage.setItem('dummy-down:usage-preference', 'off')
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'dummy-down:usage-preference' }),
      )
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      'paused for this browser',
    )
  })

  it('disables automatic URL history pageviews for the query-driven Explorer', () => {
    render(<UsageAnalytics />)
    const props = sdk.analytics.mock.calls[0]?.[0] as unknown as Record<
      string,
      unknown
    >
    expect(props).toMatchObject({
      mode: 'production',
      debug: false,
      route: '/',
      path: '/',
      beforeSend: beforeUsageSend,
    })
  })
})

describe('analytics URL sanitization', () => {
  it.each([
    '/learn',
    '/glossary',
    '/about',
    '/coverage',
    '/coverage/',
    '/practice',
    '/practice/',
    '/learn/',
    '/glossary/',
  ])('allows only the public page path for %s', (path) => {
    const origin = window.location.origin
    expect(
      beforeUsageSend({
        type: 'event',
        url: `${origin}${path}?q=private-customer&answer=secret#private`,
      }),
    ).toEqual({ type: 'event', url: `${origin}${path.replace(/\/$/, '')}` })
  })

  it.each(['pageview', 'event'] as const)(
    'strips all query and fragment data from a %s',
    (type) => {
      const origin = window.location.origin
      const result = beforeUsageSend({
        type,
        url: `${origin}/?q=private+customer&control=not-allowed#confidential`,
      })
      expect(result).toEqual({ type, url: `${origin}/` })
    },
  )

  it.each([
    'https://untrusted.example/?q=secret',
    '/private-customer-name',
    'javascript:alert(1)',
    'https://[bad',
  ])('rejects unrecognized URLs: %s', (url) => {
    expect(sanitizeUsageUrl(url, window.location.origin)).toBeNull()
  })
})

describe('bounded interaction metadata', () => {
  it('resolves exact catalog identities and strips caller-supplied fields', () => {
    const event = {
      name: 'control_open',
      lesson,
      query: 'private customer',
      answer: 'my answer',
      url: '?q=secret',
    } as UsageEvent
    expect(usageProperties(event)).toEqual({
      framework: 'cmmc',
      edition: 'readme-example',
      control: 'AC.L2-3.1.1',
      content: 'educational-example',
      level: 'Level 2',
    })
    trackUsage(event)
    expect(sdk.track).toHaveBeenCalledWith(
      'control_open',
      usageProperties(event),
    )
    expect(JSON.stringify(sdk.track.mock.calls)).not.toContain(
      'private customer',
    )
  })

  it('rejects mismatched edition identities instead of recording an arbitrary identifier', () => {
    const event: UsageEvent = {
      name: 'control_open',
      lesson: { ...lesson, editionId: 'cmmc-2-13-sep-2024' },
    }
    expect(usageProperties(event)).toBeNull()
    trackUsage(event)
    expect(sdk.track).not.toHaveBeenCalled()
  })

  it.each([
    ['framework', 'cmmc'],
    ['family', 'AC'],
    ['level', 'Level 3'],
    ['collection', 'references'],
  ] as const)(
    'accepts a known %s filter and excludes free text',
    (filter, value) => {
      expect(usageProperties({ name: 'filter_change', filter, value })).toEqual(
        {
          filter,
          value,
        },
      )
      expect(
        usageProperties({
          name: 'filter_change',
          filter,
          value: 'customer secret',
        }),
      ).toBeNull()
    },
  )

  it.each([
    [0, 'none'],
    [1, 'one'],
    [5, 'few'],
    [149, 'many'],
  ])('buckets %s search results as %s', (resultCount, results) => {
    expect(
      usageProperties({
        name: 'search_used',
        scope: 'explorer',
        active: true,
        resultCount,
      }),
    ).toEqual({ scope: 'explorer', active: true, results })
  })

  it('validates perspective feedback independently from quiz answers', () => {
    expect(
      usageProperties({
        name: 'perspective_feedback',
        lesson,
        mode: 'beginner',
        helpful: false,
      }),
    ).toMatchObject({ mode: 'beginner', helpful: false })
    expect(
      usageProperties({
        name: 'perspective_change',
        lesson,
        mode: 'unknown',
      } as unknown as UsageEvent),
    ).toBeNull()
  })

  it('accepts trusted document IDs from a source reference', () => {
    const control = explorerCatalog.controls.find(
      (candidate) => candidate.contentKind === 'official-reference',
    )!
    if (control.contentKind !== 'official-reference')
      throw new Error('missing reference')
    expect(
      usageProperties({
        name: 'source_open',
        lesson: {
          frameworkId: control.frameworkId,
          editionId: control.editionId,
          controlKey: control.key,
        },
        sourceId: control.sourceDocuments[0]!.id,
        destination: 'mirror',
      }),
    ).toMatchObject({
      source: control.sourceDocuments[0]!.id,
      destination: 'mirror',
    })
  })

  it('accepts only known glossary terms and sources belonging to the exact control', () => {
    const term = glossaryTerms[0]!
    const source = explorerCatalog.controls.find(
      (control) => control.key === lesson.controlKey,
    )!.sources[0]!
    expect(usageProperties({ name: 'glossary_open', termId: term.id })).toEqual(
      { term: term.id },
    )
    expect(
      usageProperties({ name: 'glossary_open', termId: 'private-customer' }),
    ).toBeNull()
    expect(
      usageProperties({
        name: 'source_open',
        lesson,
        sourceId: source.id,
        destination: 'publisher',
      }),
    ).toMatchObject({ source: source.id, destination: 'publisher' })
    expect(
      usageProperties({
        name: 'source_open',
        lesson,
        sourceId: 'private-customer',
        destination: 'publisher',
      }),
    ).toBeNull()
  })

  it('records practice action categories without choices, correctness, or scores', () => {
    const event = {
      name: 'practice_action',
      lesson,
      action: 'check',
      choice: 'credentials-work',
      correct: true,
      score: 100,
    } as UsageEvent
    expect(usageProperties(event)).toMatchObject({ action: 'check' })
    const properties = JSON.stringify(usageProperties(event))
    expect(properties).not.toContain('choice')
    expect(properties).not.toContain('correct')
    expect(properties).not.toContain('score')
  })

  it('rejects unsupported practices and malformed runtime events', () => {
    expect(
      usageProperties({
        name: 'practice_action',
        lesson: { ...lesson, controlKey: 'unknown' },
        action: 'check',
      }),
    ).toBeNull()
    expect(
      usageProperties({
        name: 'filter_change',
        filter: '__proto__',
        value: 'secret',
      } as unknown as UsageEvent),
    ).toBeNull()
    expect(usageProperties(null as unknown as UsageEvent)).toBeNull()
    expect(
      usageProperties({ name: 'unknown' } as unknown as UsageEvent),
    ).toBeNull()
  })

  it('cannot break an interaction when the analytics SDK throws', () => {
    sdk.track.mockImplementationOnce(() => {
      throw new Error('analytics blocked')
    })
    expect(() => trackUsage({ name: 'control_open', lesson })).not.toThrow()
  })
})
