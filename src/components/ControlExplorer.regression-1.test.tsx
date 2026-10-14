import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

beforeEach(() =>
  window.history.replaceState(
    null,
    '',
    '/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access',
  ),
)

// Regression: ISSUE-001/002/003 — deliberate lesson navigation preserves focus.
// Found by /review and /qa on 2026-10-13.
// Report: docs/designs/shareable-lessons-code-review.md
async function setup() {
  render(<App />)
  return {
    user: userEvent.setup(),
    explorer: within(
      await screen.findByRole('region', { name: 'Control Explorer' }),
    ),
  }
}

describe('Explorer navigation regressions', () => {
  it('does not let reselection steal focus from a subsequent learning tab', async () => {
    const { user, explorer } = await setup()
    await user.click(
      explorer.getByRole('button', {
        name: /AC\.L2-3\.1\.1.*Authorized access/,
      }),
    )
    const compliance = explorer.getByRole('tab', { name: 'Compliance' })
    await user.click(compliance)
    expect(compliance).toHaveFocus()
    expect(compliance).toHaveAttribute('aria-selected', 'true')
  })

  it('focuses enabled search after recovering an invalid address', async () => {
    window.history.replaceState(null, '', '?view=lesson&framework=cmmc')
    const { user, explorer } = await setup()
    const search = explorer.getByRole('searchbox', { name: 'Search controls' })
    expect(search).toBeDisabled()
    await user.click(explorer.getByRole('button', { name: 'Browse examples' }))
    expect(search).toBeEnabled()
    expect(search).toHaveFocus()
    expect(explorer.queryByRole('tabpanel')).not.toBeInTheDocument()
  })

  it('returns to results with filters and mode intact', async () => {
    window.history.replaceState(
      null,
      '',
      '?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access&mode=compliance&q=access&family=AC&level=Level+2',
    )
    const { user, explorer } = await setup()
    await user.click(explorer.getByRole('button', { name: 'Back to results' }))
    const params = new URLSearchParams(window.location.search)
    expect(params.get('view')).toBe('discover')
    expect(params.has('control')).toBe(false)
    expect(params.get('mode')).toBe('compliance')
    expect(params.get('q')).toBe('access')
    expect(params.get('family')).toBe('AC')
    expect(params.get('level')).toBe('Level 2')
    expect(
      explorer.getByRole('searchbox', { name: 'Search controls' }),
    ).toHaveFocus()
    expect(explorer.queryByRole('tabpanel')).not.toBeInTheDocument()
    await user.click(
      explorer.getByRole('button', {
        name: /AC\.L2-3\.1\.1.*Authorized access/,
      }),
    )
    expect(explorer.getByRole('tabpanel', { name: 'Compliance' })).toBeVisible()
  })
})
