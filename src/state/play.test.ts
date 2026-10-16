import { describe, expect, it } from 'vitest'
import { sanitizeUsageUrl } from '../analytics/privacy'
import { playRequest, playUrl } from './play'
import { sitePage } from './site-page'

describe('the play parameter', () => {
  it('names the chalk talk and nothing else', () => {
    expect(playRequest(new URL('https://example.test/?play=sixty'))).toBe(
      'sixty',
    )
    expect(playRequest(new URL('https://example.test/'))).toBeNull()
    expect(playRequest(new URL('https://example.test/?play=other'))).toBeNull()
    expect(playRequest(new URL('https://example.test/about?play=sixty'))).toBe(
      'sixty',
    )
  })

  it('keeps the address on Home, and analytics record only /', () => {
    expect(sitePage(new URL('https://example.test/?play=sixty'))).toBe('home')
    expect(playUrl('https://example.test')).toBe(
      'https://example.test/?play=sixty',
    )
    expect(sanitizeUsageUrl('/?play=sixty', 'https://example.test')).toBe(
      'https://example.test/',
    )
    expect(
      sanitizeUsageUrl(
        'https://example.test/?play=sixty#x',
        'https://example.test',
      ),
    ).toBe('https://example.test/')
  })
})
