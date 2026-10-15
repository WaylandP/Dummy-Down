import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

beforeEach(() => window.history.replaceState(null, '', '/learn'))

describe('Learning page and reading navigation', () => {
  it('closes discovery when the reader selects the already displayed control', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('region', { name: 'Control Explorer' })
    await screen.findByRole('heading', { level: 1 })
    await user.click(
      screen.getByRole('button', { name: 'Browse & filter controls (149)' }),
    )
    await user.click(
      screen.getByRole('button', { name: /AC\.L1-b\.1\.i.*Authorized/ }),
    )
    expect(
      screen.getByRole('button', { name: 'Browse & filter controls (149)' }),
    ).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.getByRole('heading', {
        name: 'Authorized Access Control [FCI Data]',
      }),
    ).toHaveFocus()
    expect(window.location.search).toBe('')
  })
  it('opens the full reference collection and a real Level 1 control immediately', async () => {
    render(<App />)
    await screen.findByRole('region', { name: 'Control Explorer' })
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Authorized Access Control [FCI Data]',
    )
    expect(
      screen.getByRole('combobox', { name: 'Content collection' }),
    ).toHaveValue('references')
    expect(
      screen.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('149 references found')
    expect(
      screen.getByRole('heading', {
        name: 'Authorized Access Control [FCI Data]',
      }),
    ).toBeVisible()
    expect(
      screen.getByText(/Limit information system access to authorized users/),
    ).toBeVisible()
  })

  it('lets readers expand discovery and returns to reading after choosing another result', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('region', { name: 'Control Explorer' })
    const explorer = within(
      await screen.findByRole('region', { name: 'Control Explorer' }),
    )
    await explorer.findByRole('heading', { level: 1 })
    const toggle = explorer.getByRole('button', {
      name: 'Browse & filter controls (149)',
    })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(
      explorer.getByRole('button', { name: 'Return to reading' }),
    ).toHaveAttribute('aria-expanded', 'true')
    await user.click(
      explorer.getByRole('button', { name: /AC\.L1-b\.1\.ii.*Transaction/ }),
    )
    expect(
      explorer.getByRole('button', { name: 'Browse & filter controls (149)' }),
    ).toHaveAttribute('aria-expanded', 'false')
    expect(
      explorer.getByRole('heading', {
        name: 'Transaction & Function Control [FCI Data]',
      }),
    ).toHaveFocus()
    expect(new URLSearchParams(window.location.search).get('control')).toBe(
      'ac-l1-b-1-ii',
    )
  })
})
