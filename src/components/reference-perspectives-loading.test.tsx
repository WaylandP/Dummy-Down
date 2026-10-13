import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'
import { referenceControls } from '../data/content'

vi.mock('../data/cmmc-perspectives', () => {
  throw new Error('Simulated failed curriculum chunk')
})

describe('Curriculum load failure', () => {
  it('keeps the exact source text readable and offers full-page recovery', async () => {
    const control = referenceControls[0]!
    window.history.replaceState(
      null,
      '',
      `/?view=lesson&framework=cmmc&edition=${control.editionId}&control=${control.key}&mode=compliance`,
    )
    render(<App />)
    expect(
      await screen.findByRole('button', { name: 'Reload page to retry' }),
    ).toBeVisible()
    expect(screen.getByText(control.requirement.text)).toBeVisible()
    expect(
      screen.getByText(/You can still read the requirement and sources/),
    ).toBeVisible()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(new URLSearchParams(window.location.search).get('mode')).toBe(
      'compliance',
    )
  })
})
