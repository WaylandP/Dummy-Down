import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'
import { referenceControls } from '../data/content'
import { quotation } from '../test/quotation'

vi.mock('../data/cmmc-perspectives', () => {
  throw new Error('Simulated failed curriculum chunk')
})

describe('Curriculum load failure', () => {
  it('keeps the exact source text readable and offers full-page recovery', async () => {
    const control = referenceControls[0]!
    window.history.replaceState(
      null,
      '',
      `/?view=lesson&framework=cmmc&edition=${control.editionId}&control=${control.key}&mode=compliance&tab=explain`,
    )
    const user = userEvent.setup()
    render(<App />)
    expect(
      await screen.findByRole(
        'button',
        { name: 'Reload page to retry' },
        { timeout: 5000 },
      ),
    ).toBeVisible()
    expect(
      screen.getByText(/You can still read the requirement and sources/, {
        ignore: 'script, style, [hidden] *',
      }),
    ).toBeVisible()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(
      screen.getByText(quotation(control.requirement.text)),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Decode' }))
    expect(screen.getByText(quotation(control.requirement.text))).toBeVisible()
    expect(new URLSearchParams(window.location.search).get('mode')).toBe(
      'compliance',
    )
  })
})
