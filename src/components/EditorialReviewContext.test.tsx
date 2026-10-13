import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { referenceControls } from '../data/cmmc-references'
import { getLevelOneReview } from '../data/level-one-review'
import { EditorialReviewContext } from './EditorialReviewContext'

function fixture(id: string) {
  const control = referenceControls.find((entry) => entry.id === id)
  if (!control) throw new Error(`Missing fixture ${id}`)
  return control
}

beforeEach(() => window.history.replaceState(null, '', '/'))

describe('Visible editorial provenance', () => {
  it.each(['AC.L1-b.1.i', 'AC.L1-b.1.iv', 'MP.L1-b.1.vii'])(
    'keeps %s source, agent audit and pending human approval distinct',
    async (id) => {
      const control = fixture(id)
      const review = getLevelOneReview(control)!
      const user = userEvent.setup()
      render(<EditorialReviewContext control={control} />)
      await user.click(
        screen.getByText('Review record & assessment objectives'),
      )
      expect(screen.getByText('Source verification')).toBeVisible()
      expect(screen.getByText('AI-assisted editorial review')).toBeVisible()
      expect(screen.getByText('Qualified human approval')).toBeVisible()
      expect(
        screen.getByText(/does not establish current applicability/),
      ).toBeVisible()
      expect(screen.getByText(/Pending\. This explanation/)).toBeVisible()
      expect(
        screen.getByText(
          new RegExp(
            `PDF page ${review.source.pdfPage} \\(printed page ${review.source.printedPage}\\)`,
          ),
        ),
      ).toBeVisible()
      await user.click(
        screen.getByText(
          `Official determination statements (${review.assessmentObjectives.length})`,
        ),
      )
      expect(
        screen.getByText(/not a complete assessment or evidence checklist/),
      ).toBeVisible()
      for (const objective of review.assessmentObjectives) {
        expect(screen.getByText(objective.id)).toBeVisible()
        expect(screen.getByText(objective.text)).toBeVisible()
      }
      await user.click(screen.getByText('Review notes & unresolved questions'))
      expect(screen.getByText(/CONNECT 403/)).toBeVisible()
    },
  )

  it('does not confuse comparison counts with complete teaching coverage', async () => {
    const user = userEvent.setup()
    render(<EditorialReviewContext control={fixture('AC.L1-b.1.ii')} />)
    await user.click(screen.getByText('Review record & assessment objectives'))
    expect(
      screen.getByText(/teaching coverage has not been mapped/),
    ).toBeVisible()
    expect(
      screen.queryByText(/Official determination statements/),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/Pending\. This explanation/)).toBeVisible()
  })

  it.each([
    { ...fixture('AC.L1-b.1.i'), frameworkId: 'other' },
    { ...fixture('AC.L1-b.1.i'), editionId: 'other-edition' },
    fixture('IA.L2-3.5.3'),
  ])('never borrows an audit for a different source identity', (control) => {
    const { container } = render(<EditorialReviewContext control={control} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('links contextual definitions and resets them when navigating to another control', async () => {
    const user = userEvent.setup()
    render(<App />)
    const explorer = within(
      screen.getByRole('region', { name: 'Control Explorer' }),
    )
    await explorer.findByRole('tabpanel', { name: 'Beginner' })
    const opener = explorer.getByRole('button', {
      name: 'Federal Contract Information (FCI)',
    })
    await user.click(opener)
    expect(
      explorer.getByRole('button', { name: 'Close definition' }),
    ).toBeVisible()
    await user.keyboard('{Escape}')
    expect(opener).toHaveFocus()
    expect(
      explorer.queryByRole('button', { name: 'Close definition' }),
    ).not.toBeInTheDocument()
    await user.click(opener)
    await user.click(
      explorer.getByRole('button', { name: 'Browse & filter controls (149)' }),
    )
    await user.click(
      explorer.getByRole('button', { name: /AC\.L1-b\.1\.ii.*Transaction/ }),
    )
    expect(
      explorer.queryByRole('button', { name: 'Close definition' }),
    ).not.toBeInTheDocument()
    expect(
      explorer.queryByText('Draft learning activity'),
    ).not.toBeInTheDocument()
    await user.click(
      explorer.getByText('Review record & assessment objectives'),
    )
    expect(
      explorer.getByText(/teaching coverage has not been mapped/),
    ).toBeVisible()
  })
})
