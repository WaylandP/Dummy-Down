import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

beforeEach(() => window.history.replaceState(null, '', '/learn'))

describe('Learning page and reading navigation', () => {
  it('focuses the title when the rail picks the control already on the board', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole(
      'region',
      { name: 'Control Explorer' },
      { timeout: 5000 },
    )
    await screen.findByRole('heading', { level: 1 })
    const rail = within(
      screen.getByRole('navigation', { name: 'All controls' }),
    )
    const current = rail.getByRole('link', {
      name: /^AC\.L1-b\.1\.i Authorized/,
    })
    expect(current).toHaveAttribute('aria-current', 'page')
    await user.click(current)
    expect(
      screen.getByRole('heading', {
        name: 'Authorized Access Control [FCI Data]',
      }),
    ).toHaveFocus()
    expect(window.location.search).toBe('')
  })
  it('opens a real Level 1 control immediately, with the rail of every control beside it', async () => {
    render(<App />)
    await screen.findByRole(
      'region',
      { name: 'Control Explorer' },
      { timeout: 5000 },
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Authorized Access Control [FCI Data]',
    )
    const rail = within(
      screen.getByRole('navigation', { name: 'All controls' }),
    )
    expect(rail.getAllByRole('link', { name: /^[A-Z]{2} / })).toHaveLength(14)
    expect(
      rail.getByRole('link', { name: /^AC\.L1-b\.1\.i Authorized/ }),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      screen.getByRole('heading', {
        name: 'Authorized Access Control [FCI Data]',
      }),
    ).toBeVisible()
    expect(
      screen.getByText(
        (_, node) =>
          node?.tagName === 'BLOCKQUOTE' &&
          /Limit information system access to authorized users/.test(
            node.textContent ?? '',
          ),
      ),
    ).toBeVisible()
  })

  it('puts another control from the rail on the board, focused, and marks it in the rail', async () => {
    const user = userEvent.setup()
    render(<App />)
    const explorer = within(
      await screen.findByRole(
        'region',
        { name: 'Control Explorer' },
        { timeout: 5000 },
      ),
    )
    await explorer.findByRole('heading', { level: 1 })
    const rail = within(
      explorer.getByRole('navigation', { name: 'All controls' }),
    )
    // The family of the control on the board is the open one.
    expect(
      rail.getByRole('link', { name: /^AC Access Control/ }),
    ).toHaveAttribute('aria-expanded', 'true')
    const next = rail.getByRole('link', {
      name: /^AC\.L1-b\.1\.ii Transaction/,
    })
    expect(next).not.toHaveAttribute('aria-current')
    await user.click(next)
    expect(
      explorer.getByRole('heading', {
        name: 'Transaction & Function Control [FCI Data]',
      }),
    ).toHaveFocus()
    expect(
      rail.getByRole('link', { name: /^AC\.L1-b\.1\.ii Transaction/ }),
    ).toHaveAttribute('aria-current', 'page')
    expect(new URLSearchParams(window.location.search).get('control')).toBe(
      'ac-l1-b-1-ii',
    )
    expect(
      explorer.queryByRole('button', { name: /Browse & filter/ }),
    ).not.toBeInTheDocument()
  })
})
