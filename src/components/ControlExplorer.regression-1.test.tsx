import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { chalkFor } from './board/chalks'

// The first version's demo link; it opens AC.L2-3.1.1, the control it taught.
beforeEach(() =>
  window.history.replaceState(
    null,
    '',
    '/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access',
  ),
)

// Regression: ISSUE-001/002/003 — deliberate lesson navigation preserves focus.
// Found by /review and /qa on 2026-10-13.
// Report: archive/ai-review-records branch, docs/designs/shareable-lessons-code-review.md
async function setup() {
  render(<App />)
  return {
    user: userEvent.setup(),
    explorer: within(
      await screen.findByRole(
        'region',
        { name: 'Control Explorer' },
        { timeout: 5000 },
      ),
    ),
  }
}

describe('Explorer navigation regressions', () => {
  it('does not let reselection steal focus from a subsequent chalk tab', async () => {
    const { user, explorer } = await setup()
    // Picking the control already on the board again reads from its title.
    await user.click(
      within(
        explorer.getByRole('navigation', { name: 'All controls' }),
      ).getByRole('link', { name: /^AC\.L2-3\.1\.1 / }),
    )
    expect(explorer.getByRole('heading', { level: 1 })).toHaveFocus()
    await user.click(explorer.getByRole('link', { name: 'Explain' }))
    const compliance = await explorer.findByRole('tab', {
      name: chalkFor('compliance').prompt,
    })
    await user.click(compliance)
    expect(compliance).toHaveFocus()
    expect(compliance).toHaveAttribute('aria-selected', 'true')
  })

  it('focuses the find line after recovering an invalid address', async () => {
    window.history.replaceState(null, '', '?view=lesson&framework=cmmc')
    const { user, explorer } = await setup()
    // An invalid address has no state for the rail to show.
    expect(
      explorer.queryByRole('searchbox', { name: 'Find controls' }),
    ).not.toBeInTheDocument()
    await user.click(explorer.getByRole('link', { name: 'All controls' }))
    const search = explorer.getByRole('searchbox', { name: 'Find controls' })
    expect(search).toBeEnabled()
    expect(search).toHaveFocus()
    expect(explorer.queryByRole('tabpanel')).not.toBeInTheDocument()
  })

  it('keeps the filters and mode of an old demo link on the control it opens', async () => {
    window.history.replaceState(
      null,
      '',
      '?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access&mode=compliance&q=access&family=AC&level=Level+2',
    )
    const { user, explorer } = await setup()
    expect(
      explorer.getByRole('heading', {
        level: 1,
        name: 'Authorized Access Control [CUI Data]',
      }),
    ).toBeVisible()
    // The store rewrites the address once it subscribes, after the lazy page
    // mounts, so the canonical address can land a tick after the title.
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get('control')).toBe(
        'ac-l2-3-1-1',
      ),
    )
    const params = new URLSearchParams(window.location.search)
    expect(params.get('view')).toBe('lesson')
    expect(params.get('mode')).toBe('compliance')
    expect(params.get('q')).toBe('access')
    expect(params.get('family')).toBe('AC')
    expect(params.get('level')).toBe('Level 2')
    const rail = within(
      explorer.getByRole('navigation', { name: 'All controls' }),
    )
    expect(rail.getByRole('searchbox', { name: 'Find controls' })).toHaveValue(
      'access',
    )
    expect(
      within(rail.getByRole('group', { name: 'Level' })).getByRole('link', {
        name: '2',
      }),
    ).toHaveAttribute('aria-current', 'true')
    expect(
      rail.getByRole('link', { name: /^AC Access Control/ }),
    ).toHaveAttribute('aria-expanded', 'true')
    await user.click(explorer.getByRole('link', { name: 'Explain' }))
    expect(
      await explorer.findByRole('tabpanel', {
        name: chalkFor('compliance').prompt,
      }),
    ).toBeVisible()
  })
})
