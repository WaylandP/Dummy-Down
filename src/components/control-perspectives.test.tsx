import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { referenceControls } from '../data/content'
import { findCmmcPerspective } from '../data/cmmc-perspectives'
import { ReferencePerspectives } from './ReferencePerspectives'

beforeEach(() => window.history.replaceState(null, '', '/'))

function fixture(id: string) {
  const control = referenceControls.find((item) => item.id === id)
  if (!control) throw new Error('Expected a catalog fixture')
  const draft = findCmmcPerspective(control)
  if (!draft) throw new Error('Expected teaching draft coverage')
  return { control, draft }
}
function address(key: string, mode = 'beginner') {
  return `/?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=${mode}`
}

describe('Control-specific teaching perspectives', () => {
  it.each(['AC.L1-b.1.i', 'IA.L2-3.5.3', 'IR.L3-3.6.1e'])(
    'explains %s in all three perspectives without changing its official text',
    async (id) => {
      const { control, draft } = fixture(id)
      window.history.replaceState(null, '', address(control.key))
      const user = userEvent.setup()
      render(<App />)
      const explorer = within(
        screen.getByRole('region', { name: 'Control Explorer' }),
      )
      const quote = explorer.getByText(control.requirement.text)
      const beginner = await explorer.findByRole('tabpanel', {
        name: 'Beginner',
      })
      expect(beginner).toHaveTextContent(draft.beginner.meaning)
      expect(beginner).toHaveTextContent(draft.beginner.example)
      await user.click(explorer.getByRole('tab', { name: 'IT & Cyber' }))
      const technical = explorer.getByRole('tabpanel', { name: 'IT & Cyber' })
      expect(technical).toHaveTextContent(draft.technical.focus)
      expect(technical).toHaveTextContent(draft.technical.watchFor)
      expect(quote).toBeVisible()
      await user.keyboard('{End}')
      expect(explorer.getByRole('tab', { name: 'Compliance' })).toHaveFocus()
      const compliance = explorer.getByRole('tabpanel', { name: 'Compliance' })
      expect(compliance).toHaveTextContent(draft.compliance.focus)
      expect(compliance).toHaveTextContent(draft.compliance.reviewQuestions[0]!)
      await user.click(
        within(compliance).getByText('Possible evidence to discuss'),
      )
      expect(compliance).toHaveTextContent(
        draft.compliance.evidenceExamples[0]!,
      )
      expect(compliance).toHaveTextContent('not official assessment objectives')
      expect(compliance).toHaveTextContent(
        'Qualified editorial review is pending',
      )
      expect(quote).toBeVisible()
      if (id === 'AC.L1-b.1.i') {
        expect(explorer.getByText('Draft learning activity')).toBeVisible()
        expect(explorer.getByText(/^Fictional scenario:/)).toBeVisible()
      } else {
        expect(
          explorer.queryByText('Draft learning activity'),
        ).not.toBeInTheDocument()
      }
      expect(new URLSearchParams(window.location.search).get('mode')).toBe(
        'compliance',
      )
    },
  )

  it('restores a perspective from history and resets reflection for another mode or control', async () => {
    const first = fixture('AC.L1-b.1.i')
    const second = fixture('IR.L3-3.6.1e')
    window.history.replaceState(null, '', address(first.control.key))
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('tabpanel', { name: 'Beginner' })
    await user.click(screen.getByRole('button', { name: 'Still unclear' }))
    expect(screen.getByText(/Try another perspective above/)).toBeVisible()
    await user.click(screen.getByRole('tab', { name: 'IT & Cyber' }))
    expect(
      screen.queryByText(/Try another perspective above/),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Yes, it clicked' }))
    act(() => {
      window.history.replaceState(
        null,
        '',
        address(second.control.key, 'compliance'),
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(
      screen.getByRole('tabpanel', { name: 'Compliance' }),
    ).toHaveTextContent(second.draft.compliance.focus)
    expect(
      screen.getByRole('button', { name: 'Yes, it clicked' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText(second.control.requirement.text)).toBeVisible()
  })

  it('keeps unimplemented framework/edition perspectives explicitly pending', async () => {
    const { control } = fixture('AC.L1-b.1.i')
    render(
      <ReferencePerspectives
        control={{ ...control, editionId: 'unknown-edition' }}
        mode="beginner"
        onChange={() => {}}
      />,
    )
    expect(
      await screen.findByText('Teaching explanations are pending.'),
    ).toBeVisible()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })

  it('makes every level directly discoverable through canonical shareable addresses', () => {
    render(<App />)
    const navigation = within(
      screen.getByRole('navigation', { name: 'CMMC levels' }),
    )
    for (const [index, count] of [
      [1, 15],
      [2, 110],
      [3, 24],
    ]) {
      const link = navigation.getByRole('link', {
        name: new RegExp(`^Level ${index} .*${count} source references$`),
      })
      const url = new URL(link.getAttribute('href')!, window.location.origin)
      expect(url.searchParams.get('level')).toBe(`Level ${index}`)
      expect(url.searchParams.get('collection')).toBe('references')
      expect(url.searchParams.get('view')).toBe('discover')
      expect(url.hash).toBe('#explorer')
    }
  })
})
