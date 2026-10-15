import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { referenceControls } from '../data/content'
import { lessonIdentity, lessonIdentityKey } from '../state/explorer-state'
import { chalkFor } from './board/chalks'
import { ControlResults } from './ControlResults'
import { quotation } from '../test/quotation'

beforeEach(() => window.history.replaceState(null, '', '/learn'))

function reference(id: string) {
  const control = referenceControls.find((item) => item.id === id)
  if (!control) throw new Error(`Missing expected source fixture ${id}`)
  return control
}
function address(id: string) {
  const control = reference(id)
  return `?view=lesson&framework=cmmc&edition=${control.editionId}&control=${control.key}&mode=compliance`
}
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
/** The explorer follows the address, as it does for Back and Forward. */
function replay(address: string) {
  act(() => {
    window.history.replaceState(null, '', address)
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
}

describe('Versioned CMMC reference catalog', () => {
  it('provides every source level in a restrained paginated collection without fabricated teaching content', async () => {
    window.history.replaceState(
      null,
      '',
      '/?view=discover&collection=references&catalog=cmmc',
    )
    const { user, explorer } = await setup()
    await user.selectOptions(
      explorer.getByRole('combobox', { name: 'Content collection' }),
      'references',
    )
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('149 references found')
    expect(
      explorer.getAllByRole('button', {
        name: /Source reference/,
      }),
    ).toHaveLength(8)
    expect(explorer.getAllByText('Practice available')).toHaveLength(4)
    expect(
      explorer.getByRole('status', { name: 'Control result page' }),
    ).toHaveTextContent('1–8 of 149')
    expect(explorer.queryByRole('tab')).not.toBeInTheDocument()
    expect(
      explorer.queryByText('Check your understanding'),
    ).not.toBeInTheDocument()
    const levels = within(
      within(
        explorer.getByRole('navigation', { name: 'All controls' }),
      ).getByRole('group', { name: 'Level' }),
    )
    for (const [label, count] of [
      ['1', 15],
      ['2', 110],
      ['3', 24],
    ] as const) {
      await user.click(levels.getByRole('link', { name: label }))
      expect(
        explorer.getByRole('status', { name: 'Control search results' }),
      ).toHaveTextContent(`${count} references found`)
    }
  })

  it.each(['compliance', 'unsupported-mode'])(
    'opens an exact source quotation with separate draft perspectives for mode %s',
    async (mode) => {
      window.history.replaceState(
        null,
        '',
        address('AC.L2-3.1.1').replace('mode=compliance', `mode=${mode}`),
      )
      const { user, explorer } = await setup()
      expect(
        explorer.queryByText('This lesson is outside the current results.'),
      ).not.toBeInTheDocument()
      expect(
        explorer.getByText(
          quotation(reference('AC.L2-3.1.1').requirement.text),
        ),
      ).toBeVisible()
      expect(
        explorer.getByRole('button', { name: 'Copy reference link' }),
      ).toBeVisible()
      expect(explorer.queryByRole('tab')).not.toBeInTheDocument()
      await user.click(explorer.getByRole('link', { name: 'Explain' }))
      expect(
        await explorer.findByRole('tabpanel', {
          name:
            mode === 'compliance'
              ? chalkFor('compliance').prompt
              : chalkFor('beginner').prompt,
        }),
      ).toBeVisible()
      expect(explorer.getByText('Pick a chalk')).toBeVisible()
      expect(explorer.getAllByRole('tab')).toHaveLength(3)
      expect(explorer.queryByText('Practice activity')).not.toBeInTheDocument()
    },
  )

  it('preserves model/guide differences and safe original and pinned page references', async () => {
    window.history.replaceState(null, '', address('AT.L2-3.2.1'))
    const { user, explorer } = await setup()
    const control = reference('AT.L2-3.2.1')
    await user.click(explorer.getByText('Compare model wording'))
    expect(explorer.getByText(control.modelRequirement.text)).toBeVisible()
    expect(
      explorer.getByText(quotation(control.requirement.text)),
    ).toBeVisible()
    await user.click(explorer.getByRole('link', { name: 'Related' }))
    await user.click(explorer.getByText('Sources & publication context'))
    for (const link of explorer.getAllByRole('link', {
      name: /Official publication URL|Pinned third-party PDF mirror/,
    })) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link.getAttribute('href')).toMatch(/^https:\/\/.*#page=\d+$/)
    }
    expect(
      explorer.getAllByText(/latest edition|latest DoD edition/).length,
    ).toBeGreaterThan(0)
  })

  it('preserves explicit collection mismatch on history replay and restores the reference collection deliberately', async () => {
    window.history.replaceState(
      null,
      '',
      `${address('AC.L2-3.1.1')}&collection=lessons`,
    )
    const { user, explorer } = await setup()
    expect(
      explorer.getByText('This lesson is outside the current results.'),
    ).toBeVisible()
    await user.click(
      explorer.getByRole('button', { name: 'Show this lesson in results' }),
    )
    expect(
      new URLSearchParams(window.location.search).get('collection'),
    ).not.toBe('lessons')
    expect(
      explorer.queryByText('This lesson is outside the current results.'),
    ).not.toBeInTheDocument()
    expect(
      explorer.getByText(quotation(reference('AC.L2-3.1.1').requirement.text)),
    ).toBeVisible()
    replay(`${address('AC.L2-3.1.1')}&collection=lessons`)
    expect(
      explorer.getByText('This lesson is outside the current results.'),
    ).toBeVisible()
  })

  it('shares a source identity without discovery text and keeps the old draft entry available', async () => {
    window.history.replaceState(
      null,
      '',
      `${address('AC.L2-3.1.1')}&q=access&family=AC`,
    )
    const { user, explorer } = await setup()
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    await user.click(
      explorer.getByRole('button', { name: 'Copy reference link' }),
    )
    const copied = write.mock.calls[0]?.[0]
    if (!copied) throw new Error('Expected a copied reference URL')
    const url = new URL(copied)
    expect(url.searchParams.get('edition')).toBe('cmmc-2-13-sep-2024')
    expect(url.searchParams.has('q')).toBe(false)
    expect(url.searchParams.has('collection')).toBe(false)
    expect(explorer.getByText('Reference link copied.')).toBeVisible()
    await user.click(explorer.getByRole('link', { name: 'Explain' }))
    await user.click(
      await explorer.findByRole('tab', { name: chalkFor('beginner').prompt }),
    )
    expect(
      await explorer.findByRole('tabpanel', {
        name: chalkFor('beginner').prompt,
      }),
    ).toBeVisible()
    // The demo lesson is reached from the overview's collection select.
    replay('/learn?view=discover&collection=references&mode=beginner')
    await user.selectOptions(
      explorer.getByRole('combobox', { name: 'Content collection' }),
      'lessons',
    )
    await user.click(
      explorer.getByRole('button', {
        name: /AC\.L2-3\.1\.1.*Authorized access/,
      }),
    )
    expect(
      explorer.getByRole('combobox', { name: 'Content collection' }),
    ).toHaveValue('lessons')
    expect(explorer.getByText('Practice activity')).toBeVisible()
    write.mockRestore()
  })
})

describe('Reference result pagination', () => {
  it('paginates, follows replayed selection, and retains the page on returning to discovery', async () => {
    const user = userEvent.setup()
    const selected = referenceControls[24]
    const first = referenceControls[0]
    if (!selected || !first)
      throw new Error('Expected source fixture page coverage')
    const onSelect = vi.fn()
    const view = render(
      <ControlResults
        results={referenceControls}
        selectedKey={null}
        onSelect={onSelect}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Previous results' }),
    ).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Next results' }))
    expect(
      screen.getByRole('status', { name: 'Control result page' }),
    ).toHaveTextContent('9–16 of 149')
    const visible = screen.getAllByRole('button', {
      name: /Source reference/,
    })
    const result = visible[0]
    if (!result) throw new Error('Expected a visible source result')
    await user.click(result)
    expect(onSelect).toHaveBeenCalledWith(referenceControls[8])
    view.rerender(
      <ControlResults
        results={referenceControls}
        selectedKey={lessonIdentityKey(lessonIdentity(selected))}
        onSelect={onSelect}
      />,
    )
    expect(
      screen.getByRole('status', { name: 'Control result page' }),
    ).toHaveTextContent('25–32 of 149')
    view.rerender(
      <ControlResults
        results={referenceControls}
        selectedKey={null}
        onSelect={onSelect}
      />,
    )
    expect(
      screen.getByRole('status', { name: 'Control result page' }),
    ).toHaveTextContent('25–32 of 149')
    view.rerender(
      <ControlResults
        results={referenceControls}
        selectedKey={lessonIdentityKey(lessonIdentity(first))}
        onSelect={onSelect}
      />,
    )
    expect(
      screen.getByRole('status', { name: 'Control result page' }),
    ).toHaveTextContent('1–8 of 149')
  })
})
