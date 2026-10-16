import { describe, expect, it } from 'vitest'
import { aliasOf, controlsPath, sitePage } from './site-page'

describe('an unknown path', () => {
  it('is the blank board, never a page', () => {
    for (const path of ['/nope', '/controls/all', '/learn/anything', '/404'])
      expect(sitePage(new URL(`https://example.test${path}`))).toBe('not-found')
  })

  it('has no alias; /controls alone is the Controls page', () => {
    expect(aliasOf(new URL('https://example.test/controls'))).toBe(controlsPath)
    expect(aliasOf(new URL('https://example.test/controls/'))).toBe(
      controlsPath,
    )
    for (const path of ['/nope', '/controls/all', '/learn', '/'])
      expect(aliasOf(new URL(`https://example.test${path}`))).toBeNull()
  })
})
