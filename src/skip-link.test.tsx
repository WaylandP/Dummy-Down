import { render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'
import { announceAddress } from './state/address'

const control =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i'

afterEach(() => window.history.replaceState(null, '', '/'))

describe('the skip links', () => {
  it('offer a second skip, to the explanation, only while a control is on the board', () => {
    window.history.replaceState(null, '', control)
    render(<App />)
    const skips = screen.getAllByRole('link', { name: /^Skip to/ })
    expect(skips.map((link) => link.textContent)).toEqual([
      'Skip to content',
      'Skip to the explanation',
    ])
    expect(skips[1]).toHaveAttribute('href', '#control-title')
    // Discovery lists controls; there is no explanation to skip to.
    act(() => {
      window.history.replaceState(
        null,
        '',
        '/learn?view=discover&collection=references',
      )
      announceAddress()
    })
    expect(
      screen.queryByRole('link', { name: 'Skip to the explanation' }),
    ).toBeNull()
    expect(screen.getByRole('link', { name: 'Skip to content' })).toBeVisible()
  })

  it('is one skip link on Home', () => {
    window.history.replaceState(null, '', '/')
    render(<App />)
    expect(screen.getAllByRole('link', { name: /^Skip to/ })).toHaveLength(1)
  })
})
