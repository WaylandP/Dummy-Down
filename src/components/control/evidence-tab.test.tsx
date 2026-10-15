import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../App'
import { referenceControls } from '../../data/content'
import { assessmentMethodsFor } from '../../data/cmmc-assessment-methods'
import { EvidenceTab } from './EvidenceTab'

function control(id: string) {
  const found = referenceControls.find((item) => item.id === id)
  if (!found) throw new Error(`Missing control ${id}`)
  return found
}
function open(key: string) {
  window.history.replaceState(
    null,
    '',
    `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=beginner&tab=evidence`,
  )
  render(<App />)
}

beforeEach(() => window.history.replaceState(null, '', '/learn'))

describe('The assessor’s three words', () => {
  it.each(['AC.L2-3.1.1', 'AC.L1-b.1.i', 'AC.L3-3.1.2e'])(
    'lists Examine, Interview and Test verbatim from the guide above the evidence for %s',
    async (id) => {
      const item = control(id)
      const methods = assessmentMethodsFor(item)!
      open(item.key)
      const words = await screen.findByRole('region', {
        name: 'The assessor’s three words',
      })
      const headings = within(words).getAllByRole('heading', { level: 3 })
      expect(headings.map((heading) => heading.textContent)).toEqual([
        'Examine the document',
        'Interview the role',
        'Test the action',
      ])
      const lists = within(words).getAllByRole('list')
      expect(
        lists.map((list) =>
          within(list)
            .getAllByRole('listitem')
            .map((entry) => entry.textContent),
        ),
      ).toEqual([methods.examine, methods.interview, methods.test])
      const guide = item.sourceDocuments.find(
        (source) => source.id === methods.sourceId,
      )!
      const foot = document.querySelector<HTMLElement>('.control-foot-note')!
      expect(foot).toHaveTextContent(
        'The three words are the guide’s, verbatim',
      )
      expect(foot).toHaveTextContent(
        `${guide.title}, v${guide.version}, page ${methods.printedPage}.`,
      )
      expect(
        within(foot).getByRole('link', { name: /^Open the page/ }),
      ).toHaveAttribute('href', `${guide.url}#page=${guide.pdfPage}`)
      // The three words sit above the compliance chalk's questions and evidence.
      const panel = screen.getByRole('region', { name: 'Evidence' })
      const ask = await within(panel).findByRole('heading', { name: 'Ask' })
      expect(
        words.compareDocumentPosition(ask) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    },
  )

  it('shows nothing for a control outside the pinned edition', () => {
    const outside = { ...control('AC.L2-3.1.1'), editionId: 'readme-example' }
    expect(assessmentMethodsFor(outside)).toBeNull()
    render(<EvidenceTab control={outside} draft={{ status: 'pending' }} />)
    expect(
      screen.queryByRole('region', { name: 'The assessor’s three words' }),
    ).toBeNull()
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull()
  })
})
