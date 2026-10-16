import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { referenceControls } from '../data/content'
import { findCmmcPerspective } from '../data/cmmc-perspectives'
import { chalkFor } from './board/chalks'
import { ExplainTab } from './control/ExplainTab'
import { quotation } from '../test/quotation'

beforeEach(() => window.history.replaceState(null, '', '/learn'))

const newTo = chalkFor('beginner').prompt
const runs = chalkFor('it-cyber').prompt
const preparing = chalkFor('compliance').prompt

function fixture(id: string) {
  const control = referenceControls.find((item) => item.id === id)
  if (!control) throw new Error('Expected a catalog fixture')
  const draft = findCmmcPerspective(control)
  if (!draft) throw new Error('Expected teaching draft coverage')
  return { control, draft }
}
function address(key: string, mode = 'beginner') {
  return `/?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=${mode}&tab=explain`
}

describe('Control-specific teaching perspectives', () => {
  it.each(['AC.L1-b.1.i', 'IA.L2-3.5.3', 'IR.L3-3.6.1e'])(
    'explains %s in all three chalks without changing its official text',
    async (id) => {
      const { control, draft } = fixture(id)
      window.history.replaceState(null, '', address(control.key))
      const user = userEvent.setup()
      render(<App />)
      const explorer = within(
        await screen.findByRole('region', { name: 'Control Explorer' }),
      )
      const beginner = await explorer.findByRole('tabpanel', { name: newTo })
      expect(beginner).toHaveTextContent(draft.beginner.meaning)
      expect(beginner).toHaveTextContent(draft.beginner.example)
      await user.click(explorer.getByRole('tab', { name: runs }))
      const technical = explorer.getByRole('tabpanel', { name: runs })
      expect(technical).toHaveTextContent(draft.technical.focus)
      expect(technical).toHaveTextContent(draft.technical.watchFor)
      await user.keyboard('{End}')
      expect(explorer.getByRole('tab', { name: preparing })).toHaveFocus()
      const compliance = explorer.getByRole('tabpanel', { name: preparing })
      expect(compliance).toHaveTextContent(draft.compliance.focus)
      expect(compliance).toHaveTextContent(draft.compliance.reviewQuestions[0]!)
      expect(
        explorer.getByText(/Written by Cipher & Chalk from the cited guide/),
      ).toBeVisible()
      expect(new URLSearchParams(window.location.search).get('mode')).toBe(
        'compliance',
      )
      const views = within(
        explorer.getByRole('navigation', { name: 'Views of this control' }),
      )
      await user.click(views.getByRole('link', { name: 'Evidence' }))
      expect(
        explorer.getByText(draft.compliance.evidenceExamples[0]!),
      ).toBeVisible()
      expect(
        explorer.getByText(/not an evidence list or assessment objectives/),
      ).toBeVisible()
      await user.click(views.getByRole('link', { name: 'Decode' }))
      expect(
        explorer.getByText(quotation(control.requirement.text)),
      ).toBeVisible()
      await user.click(views.getByRole('link', { name: 'Practice' }))
      if (id === 'AC.L1-b.1.i' || id === 'IA.L2-3.5.3') {
        expect(explorer.getByText('Practice activity')).toBeVisible()
        expect(explorer.getByText(/^Fictional scenario:/)).toBeVisible()
      } else {
        expect(
          explorer.queryByText('Practice activity'),
        ).not.toBeInTheDocument()
        expect(
          explorer.getByText('No practice for this control yet.'),
        ).toBeVisible()
      }
      expect(
        explorer.getByText(quotation(control.requirement.text)),
      ).toBeInTheDocument()
      expect(new URLSearchParams(window.location.search).get('tab')).toBe(
        'practice',
      )
    },
  )

  it('restores a chalk from history and resets reflection for another chalk or control', async () => {
    const first = fixture('AC.L1-b.1.i')
    const second = fixture('IR.L3-3.6.1e')
    window.history.replaceState(null, '', address(first.control.key))
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('region', { name: 'Control Explorer' })
    await screen.findByRole('tabpanel', { name: newTo })
    await user.click(screen.getByRole('button', { name: 'Still unclear' }))
    expect(screen.getByText(/Try another chalk/)).toBeVisible()
    await user.click(screen.getByRole('tab', { name: runs }))
    expect(screen.queryByText(/Try another chalk/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Yes, it clicked' }))
    act(() => {
      window.history.replaceState(
        null,
        '',
        address(second.control.key, 'compliance'),
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByRole('tabpanel', { name: preparing })).toHaveTextContent(
      second.draft.compliance.focus,
    )
    expect(
      screen.getByRole('button', { name: 'Yes, it clicked' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByText(quotation(second.control.requirement.text)),
    ).toBeInTheDocument()
  })

  it('keeps unimplemented framework/edition perspectives explicitly pending', () => {
    const { control } = fixture('AC.L1-b.1.i')
    const stranger = { ...control, editionId: 'unknown-edition' }
    expect(findCmmcPerspective(stranger)).toBeUndefined()
    render(
      <ExplainTab
        control={stranger}
        draft={{ status: 'pending' }}
        mode="beginner"
        onModeChange={() => {}}
        idPrefix="test"
      />,
    )
    expect(screen.getByText('Teaching explanations are pending.')).toBeVisible()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })

  it('makes every level directly discoverable through canonical shareable addresses', async () => {
    // The three levels as a row are the overview's, beside the results.
    window.history.replaceState(
      null,
      '',
      '/learn?view=discover&collection=references',
    )
    render(<App />)
    await screen.findByRole(
      'region',
      { name: 'Control Explorer' },
      { timeout: 5000 },
    )
    const navigation = within(
      screen.getByRole('navigation', { name: 'CMMC levels' }),
    )
    for (const [index, count] of [
      [1, 15],
      [2, 110],
      [3, 24],
    ]) {
      const link = navigation.getByRole('link', {
        name: new RegExp(`^Level ${index} .*${count} controls$`),
      })
      const url = new URL(link.getAttribute('href')!, window.location.origin)
      expect(url.searchParams.get('level')).toBe(`Level ${index}`)
      expect(url.searchParams.get('collection')).toBe('references')
      expect(url.searchParams.get('view')).toBe('discover')
      expect(url.hash).toBe('#explorer')
    }
  })
})
