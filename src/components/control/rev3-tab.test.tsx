import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../App'
import { referenceControls } from '../../data/content'
import { rev3For, rev3Source } from '../../data/cmmc-rev3'
import { quotation } from '../../test/quotation'

function control(id: string) {
  const found = referenceControls.find((item) => item.id === id)
  if (!found) throw new Error(`Missing control ${id}`)
  return found
}
function open(key: string, tab = '') {
  window.history.replaceState(
    null,
    '',
    `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=beginner${tab ? `&tab=${tab}` : ''}`,
  )
  render(<App />)
}
const views = () =>
  within(
    screen.getByRole('navigation', { name: 'Views of this control' }),
  ).getAllByRole('link')
const tabInAddress = () =>
  new URLSearchParams(window.location.search).get('tab')

beforeEach(() => window.history.replaceState(null, '', '/learn'))

describe('The Rev 3 view', () => {
  it('reads a Level 2 requirement beside its Rev. 3 counterpart, verbatim, with the change in chalk', async () => {
    const item = control('AC.L2-3.1.1')
    const row = rev3For(item)!
    open(item.key, 'rev3')
    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: item.title },
        { timeout: 5000 },
      ),
    ).toBeVisible()
    expect(views().map((link) => link.textContent)).toEqual([
      'Decode',
      'Explain',
      'Evidence',
      'Practice',
      'Related',
      'Rev 3',
    ])
    expect(views()[5]).toHaveAttribute('aria-current', 'page')
    const panel = screen.getByRole('region', { name: 'Rev 3' })
    expect(
      within(panel).getByText(quotation(item.requirement.text)),
    ).toBeVisible()
    const rev3 = within(panel).getByRole('region', {
      name: /^Rev 3 03\.01\.01/,
    })
    expect(rev3.querySelector('blockquote')).toHaveTextContent(row.rev3Text)
    expect(rev3).toHaveTextContent('Account Management')
    expect(rev3).toHaveTextContent(
      `NIST SP 800-171 Rev. 3, May 2024, page ${row.printedPage}.`,
    )
    expect(within(panel).getByText(row.note)).toBeVisible()
    expect(panel.querySelector('.rev3-change-kind')).toHaveTextContent(
      'New organization-defined parameter.',
    )
    expect(
      within(panel).getAllByText(
        /CMMC is pinned to NIST SP 800-171 Revision 2/,
      ),
    ).toHaveLength(1)
    const foot = screen.getByText(
      /Both texts verbatim; the change note is written by Cipher & Chalk\./,
    )
    expect(foot).toBeVisible()
    expect(
      within(foot).getByRole('link', { name: /^Open the page/ }),
    ).toHaveAttribute('href', `${rev3Source.officialUrl}#page=${row.pdfPage}`)
  })

  it('shows where a withdrawn requirement went and links to the page it went to', async () => {
    const item = control('AC.L2-3.1.13')
    open(item.key, 'rev3')
    const panel = await screen.findByRole(
      'region',
      { name: 'Rev 3' },
      { timeout: 5000 },
    )
    expect(panel.querySelector('.rev3-change-kind')).toHaveTextContent(
      'Withdrawn.',
    )
    expect(within(panel).getByText('Addressed by 03.13.08.')).toBeVisible()
    expect(within(panel).getByText(rev3For(item)!.note)).toBeVisible()
    const went = within(panel).getByRole('link', {
      name: '03.13.08 SC.L2-3.13.8',
    })
    const address = new URL(went.getAttribute('href')!, window.location.href)
    expect(address.searchParams.get('control')).toBe(
      control('SC.L2-3.13.8').key,
    )
    expect(address.searchParams.get('tab')).toBe('rev3')
    expect(address.searchParams.get('mode')).toBe('beginner')
  })

  it('offers five views for a control Rev. 3 does not restate and falls back to Decode', async () => {
    const item = control('AC.L1-b.1.i')
    open(item.key, 'rev3')
    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: item.title },
        { timeout: 5000 },
      ),
    ).toBeVisible()
    expect(views().map((link) => link.textContent)).toEqual([
      'Decode',
      'Explain',
      'Evidence',
      'Practice',
      'Related',
    ])
    expect(views()[0]).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText(quotation(item.requirement.text))).toBeVisible()
    expect(
      screen.getByText(
        /Rev 3 is read beside the Level 2 requirements; showing Decode\./,
      ),
    ).toBeVisible()
    expect(tabInAddress()).toBe('rev3')
  })

  it('carries Rev 3 in the address past a control that has no Rev 3', async () => {
    const user = userEvent.setup()
    const last = control('SI.L1-b.1.xv')
    open(last.key, 'rev3')
    await screen.findByRole(
      'heading',
      { level: 1, name: last.title },
      { timeout: 5000 },
    )
    expect(views()).toHaveLength(5)
    await user.click(screen.getByRole('button', { name: 'Next: AC.L2-3.1.1' }))
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: control('AC.L2-3.1.1').title,
      }),
    ).toBeVisible()
    expect(views()[5]).toHaveAttribute('aria-current', 'page')
    expect(tabInAddress()).toBe('rev3')
    await user.click(screen.getByRole('button', { name: 'Next: AC.L2-3.1.2' }))
    await screen.findByRole('heading', {
      level: 1,
      name: control('AC.L2-3.1.2').title,
    })
    expect(
      within(screen.getByRole('region', { name: 'Rev 3' })).getByRole(
        'region',
        { name: /^Rev 3 03\.01\.02 Access Enforcement/ },
      ),
    ).toBeVisible()
  })

  it('opens Rev 3 from the views and keeps it in the address', async () => {
    const user = userEvent.setup()
    const item = control('SC.L2-3.13.11')
    open(item.key)
    await screen.findByRole('heading', { level: 1, name: item.title })
    await user.click(views()[5]!)
    expect(tabInAddress()).toBe('rev3')
    expect(
      screen.getByRole('region', { name: 'Rev 3' }).querySelector('.rev3-note'),
    ).toHaveTextContent(rev3For(item)!.note)
  })
})
