import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act, render as renderView } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { followPageLink } from './test/page-navigation'
import { chalkFor } from './components/board/chalks'
import { referenceControls } from './data/content'
import { findCmmcPerspective } from './data/cmmc-perspectives'
import { quotation } from './test/quotation'

const chalkPrompt = {
  Beginner: chalkFor('beginner').prompt,
  'IT & Cyber': chalkFor('it-cyber').prompt,
  Compliance: chalkFor('compliance').prompt,
} as const

// The first version's demo link. It opens AC.L2-3.1.1, the control the demo
// taught, and the address is rewritten to that control.
const demoAddress =
  '/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access'
const control = referenceControls.find((item) => item.id === 'AC.L2-3.1.1')!
const draft = findCmmcPerspective(control)!
const controls = '/learn?view=discover&collection=references'

beforeEach(() => window.history.replaceState(null, '', demoAddress))

async function renderApp() {
  const user = userEvent.setup()
  render(<App />)
  const explorer = within(
    await screen.findByRole(
      'region',
      { name: 'Control Explorer' },
      { timeout: 5000 },
    ),
  )
  return { user, explorer }
}

async function openExplain(
  user: ReturnType<typeof userEvent.setup>,
  explorer: ReturnType<typeof within>,
) {
  await user.click(explorer.getByRole('link', { name: 'Explain' }))
  await explorer.findByRole('tabpanel', { name: chalkPrompt.Beginner })
}

describe('Control Explorer learning experience', () => {
  it('opens the first version’s demo link on the control it taught, with the address rewritten', async () => {
    const { explorer } = await renderApp()

    expect(
      explorer.getByRole('heading', { level: 1, name: control.title }),
    ).toBeVisible()
    // The store rewrites the address once it subscribes, after the lazy page
    // mounts, so the canonical address can land a tick after the title.
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get('control')).toBe(
        'ac-l2-3-1-1',
      ),
    )
    const params = new URLSearchParams(window.location.search)
    expect(params.get('edition')).toBe('cmmc-2-13-sep-2024')
    expect(params.get('collection')).toBe('references')
    expect(window.location.search).not.toContain('readme-example')
    expect(
      explorer.getByText(quotation(control.requirement.text)),
    ).toBeVisible()
    // The demo's own words are gone with it: no draft tag, no README paraphrase.
    expect(
      explorer.queryByText('Simplified teaching example'),
    ).not.toBeInTheDocument()
    expect(
      explorer.queryByText(/Paraphrase from our README/),
    ).not.toBeInTheDocument()
    expect(explorer.queryByRole('combobox')).not.toBeInTheDocument()
    expect(
      within(
        explorer.getByRole('navigation', { name: 'All controls' }),
      ).getByRole('link', { name: /^AC\.L2-3\.1\.1 / }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('changes the explanation when a reader chooses a different chalk', async () => {
    const { user, explorer } = await renderApp()
    await openExplain(user, explorer)
    expect(
      explorer.getByRole('tabpanel', { name: chalkPrompt.Beginner }),
    ).toHaveTextContent(draft.beginner.meaning)

    await user.click(
      explorer.getByRole('tab', { name: chalkPrompt['IT & Cyber'] }),
    )
    expect(
      explorer.getByRole('tab', { name: chalkPrompt['IT & Cyber'] }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(
      explorer.getByRole('tab', { name: chalkPrompt.Beginner }),
    ).toHaveAttribute('aria-selected', 'false')
    expect(
      explorer.getByRole('tabpanel', { name: chalkPrompt['IT & Cyber'] }),
    ).toHaveTextContent(draft.technical.focus)

    await user.click(
      explorer.getByRole('tab', { name: chalkPrompt.Compliance }),
    )
    const compliance = explorer.getByRole('tabpanel', {
      name: chalkPrompt.Compliance,
    })
    expect(compliance).toHaveTextContent(draft.compliance.focus)
    expect(compliance).toHaveTextContent(draft.compliance.reviewQuestions[0]!)
    expect(new URLSearchParams(window.location.search).get('mode')).toBe(
      'compliance',
    )

    await user.click(explorer.getByRole('tab', { name: chalkPrompt.Beginner }))
    expect(
      explorer.getByRole('tabpanel', { name: chalkPrompt.Beginner }),
    ).toHaveTextContent(draft.beginner.meaning)
  })

  it('supports arrow navigation, wrapping, Home, and End with focus following selection', async () => {
    const { user, explorer } = await renderApp()
    await openExplain(user, explorer)
    const beginner = explorer.getByRole('tab', { name: chalkPrompt.Beginner })
    const technical = explorer.getByRole('tab', {
      name: chalkPrompt['IT & Cyber'],
    })
    const compliance = explorer.getByRole('tab', {
      name: chalkPrompt.Compliance,
    })

    await user.click(beginner)
    await user.keyboard('{ArrowRight}')
    expect(technical).toHaveFocus()
    expect(technical).toHaveAttribute('aria-selected', 'true')
    expect(technical).toHaveAttribute('tabindex', '0')
    expect(beginner).toHaveAttribute('tabindex', '-1')

    await user.keyboard('{End}')
    expect(compliance).toHaveFocus()
    expect(
      explorer.getByRole('tabpanel', { name: chalkPrompt.Compliance }),
    ).toBeVisible()

    await user.keyboard('{ArrowRight}')
    expect(beginner).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(compliance).toHaveFocus()

    await user.keyboard('{Home}')
    expect(beginner).toHaveFocus()
    expect(beginner).toHaveAttribute('aria-selected', 'true')
    expect(
      explorer.getByRole('tabpanel', { name: chalkPrompt.Beginner }),
    ).toBeVisible()
  })

  it.each(['Beginner', 'IT & Cyber', 'Compliance'] as const)(
    'opens the %s chalk from its About page link',
    async (mode) => {
      const { user, explorer } = await renderApp()
      await openExplain(user, explorer)
      await user.click(
        explorer.getByRole('tab', {
          name: chalkPrompt[mode === 'Compliance' ? 'Beginner' : 'Compliance'],
        }),
      )
      followPageLink(screen.getByRole('link', { name: 'About' }))
      followPageLink(
        screen.getByRole('link', {
          name: new RegExp(
            `^${mode} .*Try this perspective in the Control Explorer$`,
          ),
        }),
      )
      expect(
        await screen.findByRole(
          'tab',
          { name: chalkPrompt[mode] },
          { timeout: 5000 },
        ),
      ).toHaveAttribute('aria-selected', 'true')
      expect(
        await screen.findByRole('tabpanel', { name: chalkPrompt[mode] }),
      ).toBeVisible()
      expect(window.location.pathname).toBe('/learn')
      expect(new URLSearchParams(window.location.search).get('tab')).toBe(
        'explain',
      )
    },
  )

  it('finds a control by its identifier and recovers from a search with no matches', async () => {
    const { user, explorer } = await renderApp()
    const search = explorer.getByRole('searchbox', { name: 'Find controls' })

    // The control on the board matches its own identifier and stays.
    await user.type(search, 'AC.L2-3.1.1')
    expect(
      explorer.getByRole('heading', { level: 1, name: control.title }),
    ).toBeVisible()
    expect(new URLSearchParams(window.location.search).get('q')).toBe(
      'AC.L2-3.1.1',
    )

    await user.clear(search)
    await user.type(search, 'unavailable control')
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('0 controls')
    expect(
      explorer.getByRole('heading', { name: 'No controls match.' }),
    ).toBeVisible()
    expect(explorer.queryByRole('tabpanel')).not.toBeInTheDocument()
    expect(
      explorer.queryByRole('heading', { level: 1, name: control.title }),
    ).not.toBeInTheDocument()

    await user.click(explorer.getByRole('button', { name: 'Clear filters' }))
    expect(search).toHaveValue('')
    expect(search).toHaveFocus()
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('149 controls')
    // Nothing is on the board, so the results are the page.
    expect(
      explorer.getByRole('heading', { level: 1, name: 'Controls' }),
    ).toBeVisible()
    await user.type(search, 'AC.L2-3.1.1')
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('1 control')
    await user.click(
      explorer.getByRole('button', {
        name: /AC\.L2-3\.1\.1.*Authorized Access Control/,
      }),
    )
    expect(
      explorer.getByRole('heading', { level: 1, name: control.title }),
    ).toHaveFocus()
  }, 15000)

  it('supports family and level filters from the rail and clears them together with search', async () => {
    window.history.replaceState(null, '', controls)
    const { user, explorer } = await renderApp()
    const rail = within(
      explorer.getByRole('navigation', { name: 'All controls' }),
    )
    const family = () => rail.getByRole('link', { name: /^AC Access Control/ })
    const level = (name: string) =>
      within(rail.getByRole('group', { name: 'Level' })).getByRole('link', {
        name,
      })
    const search = rail.getByRole('searchbox', { name: 'Find controls' })

    await user.click(family())
    await user.click(level('2'))
    expect(family()).toHaveAttribute('aria-expanded', 'true')
    expect(level('2')).toHaveAttribute('aria-current', 'true')
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('22 controls')

    await user.type(search, 'no matching topic')
    expect(
      explorer.getByRole('heading', { name: 'No controls match.' }),
    ).toBeVisible()
    await user.click(explorer.getByRole('button', { name: 'Clear filters' }))
    expect(family()).toHaveAttribute('aria-expanded', 'false')
    expect(level('All')).toHaveAttribute('aria-current', 'true')
    expect(search).toHaveValue('')
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('149 controls')
  })

  it('offers no collection or framework to pick: there is one of each', async () => {
    window.history.replaceState(null, '', controls)
    const { explorer } = await renderApp()
    expect(explorer.queryByRole('combobox')).not.toBeInTheDocument()
    expect(explorer.queryByText('Content collection')).not.toBeInTheDocument()
    expect(explorer.queryByText('Framework')).not.toBeInTheDocument()
    expect(
      explorer.getByText(/^The 149 CMMC controls, quoted and cited\./),
    ).toBeVisible()
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('149 controls')
  })

  it('still resolves a saved planned-framework link and recovers to the CMMC controls without claiming coverage', async () => {
    window.history.replaceState(
      null,
      '',
      '?view=discover&catalog=nist-sp-800-53',
    )
    const { user, explorer } = await renderApp()
    expect(
      explorer.getByRole('heading', { name: 'NIST 800-53 is on the roadmap.' }),
    ).toBeVisible()
    expect(
      explorer.getByText('This framework has no content here yet.'),
    ).toBeVisible()
    // Nothing to count: the address opens no results.
    expect(
      explorer.queryByRole('status', { name: 'Control search results' }),
    ).not.toBeInTheDocument()
    expect(explorer.queryByRole('tabpanel')).not.toBeInTheDocument()

    const all = explorer.getByRole('link', { name: 'All controls' })
    expect(all).toHaveAttribute(
      'href',
      '/learn?view=discover&collection=references',
    )
    await user.click(all)
    expect(
      explorer.getByRole('searchbox', { name: 'Find controls' }),
    ).toHaveFocus()
    expect(new URLSearchParams(window.location.search).get('catalog')).toBe(
      'cmmc',
    )
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('149 controls')
    expect(
      explorer.getByRole('heading', { level: 1, name: 'Controls' }),
    ).toBeVisible()
  })

  it('shows source versions and official links when the reader opens the control’s sources', async () => {
    const { user, explorer } = await renderApp()
    await user.click(explorer.getByRole('link', { name: 'Related' }))
    await user.click(explorer.getByText('Sources & publication context'))
    const sources = within(
      explorer
        .getByText('Sources & publication context')
        .closest('details') as HTMLElement,
    )
    expect(
      sources.getByText(
        /Versioned September 2024 model and assessment-guide quotations/,
      ),
    ).toBeVisible()
    expect(
      sources.getByText(/CMMC model and assessment guides, version 2\.13/),
    ).toBeVisible()
    const guide = control.sourceDocuments[0]!
    expect(sources.getByText(guide.title)).toBeVisible()
    expect(
      sources.getAllByText(/Version 2\.13 · Published 2024-09/).length,
    ).toBeGreaterThan(0)
    expect(
      sources.getByText(`PDF page ${guide.pdfPage} (printed page 14)`),
    ).toBeVisible()
    for (const link of sources.getAllByRole('link', {
      name: /Official publication URL/,
    })) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      expect(link.getAttribute('href')).toMatch(
        /^https:\/\/dodcio\.defense\.gov\/.*#page=\d+$/,
      )
    }
    expect(
      explorer.getAllByText(/latest edition|latest DoD edition/).length,
    ).toBeGreaterThan(0)
  })
})

const lessonAddress = demoAddress

describe('Shareable lessons and reading tools', () => {
  it('restores a shared perspective and preserves an incoming lesson excluded by search', async () => {
    window.history.replaceState(
      null,
      '',
      `${lessonAddress}&mode=compliance&q=unavailable`,
    )
    const { user, explorer } = await renderApp()
    expect(
      explorer.getByRole('heading', { level: 1, name: control.title }),
    ).toBeVisible()
    expect(new URLSearchParams(window.location.search).get('mode')).toBe(
      'compliance',
    )
    expect(
      explorer.getByText('This control is outside the current results.'),
    ).toBeVisible()
    await user.click(
      explorer.getByRole('button', { name: 'Show this control in results' }),
    )
    expect(
      explorer.getByRole('searchbox', { name: 'Find controls' }),
    ).toHaveValue('')
    expect(
      explorer.queryByText('This lesson is outside the current results.'),
    ).not.toBeInTheDocument()
    expect(
      explorer.getByRole('heading', { level: 1, name: control.title }),
    ).toBeVisible()
    await user.click(explorer.getByRole('link', { name: 'Explain' }))
    expect(
      await explorer.findByRole('tabpanel', { name: chalkPrompt.Compliance }),
    ).toBeVisible()
  })

  it.each([
    ['?view=lesson&framework=cmmc', 'That control isn’t on the board.'],
    [
      '?view=lesson&framework=cmmc&edition=readme-example&control=missing',
      'That control isn’t on the board.',
    ],
    ['?view=discover&catalog=nist-sp-800-53', 'NIST 800-53 is on the roadmap.'],
    ['?view=discover', 'Controls'],
  ])(
    'opens a sample through About from %s without substituting an unavailable lesson',
    async (address, title) => {
      window.history.replaceState(null, '', address)
      const { explorer } = await renderApp()
      expect(explorer.getByRole('heading', { name: title })).toBeVisible()
      expect(explorer.queryByRole('tabpanel')).not.toBeInTheDocument()
      followPageLink(screen.getByRole('link', { name: 'About' }))
      followPageLink(
        screen.getByRole('link', {
          name: /^Compliance .*Try this perspective in the Control Explorer$/,
        }),
      )
      expect(
        await screen.findByRole('tabpanel', { name: chalkPrompt.Compliance }),
      ).toBeVisible()
      expect(window.location.hash).toBe('#explorer')
      expect(new URLSearchParams(window.location.search).get('control')).toBe(
        'ac-l1-b-1-i',
      )
    },
  )

  it('says the same thing for an invalid link and a missing control, with one line and a way out', async () => {
    window.history.replaceState(
      null,
      '',
      '?view=lesson&framework=cmmc&edition=readme-example&control=missing',
    )
    const { explorer } = await renderApp()
    expect(
      explorer.getByRole('heading', {
        name: 'That control isn’t on the board.',
      }),
    ).toBeVisible()
    expect(
      explorer.getByText('The address names a control that isn’t here.'),
    ).toBeVisible()
    expect(
      explorer.getByRole('link', { name: 'All controls' }),
    ).toHaveAttribute('href', '/learn?view=discover&collection=references')
    expect(
      explorer.queryByRole('status', { name: 'Control search results' }),
    ).not.toBeInTheDocument()
    expect(explorer.queryByRole('button', { name: /Browse/ })).toBeNull()
  })

  it('replays navigation addresses without reopening a lesson on discovery reload', async () => {
    window.history.replaceState(
      null,
      '',
      '?view=discover&q=access&mode=it-cyber',
    )
    const view = renderView(<App />)
    // The learning page is a lazy chunk; under load it can take a while.
    await screen.findByRole(
      'region',
      { name: 'Control Explorer' },
      { timeout: 5000 },
    )
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Controls' }),
    ).toBeVisible()
    act(() => {
      window.history.replaceState(null, '', `${lessonAddress}&mode=compliance`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    // So is the control's page: a loaded runner has taken over five seconds.
    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: control.title },
        { timeout: 10_000 },
      ),
    ).toBeVisible()
    expect(new URLSearchParams(window.location.search).get('control')).toBe(
      'ac-l2-3-1-1',
    )
    act(() => {
      window.history.replaceState(
        null,
        '',
        '?view=discover&q=access&mode=it-cyber',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(
      screen.queryByRole('heading', { level: 1, name: control.title }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Controls' }),
    ).toBeVisible()
    view.unmount()
    renderView(<App />)
    await screen.findByRole(
      'region',
      { name: 'Control Explorer' },
      { timeout: 5000 },
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Controls' }),
    ).toBeVisible()
    expect(
      [...document.querySelectorAll('.control-item')].every(
        (item) => item.getAttribute('aria-pressed') === 'false',
      ),
    ).toBe(true)
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
  }, 15000)

  it('keeps definitions and glossary search independent of lesson navigation', async () => {
    // A Level 1 control, whose explanation carries the lesson's words.
    window.history.replaceState(
      null,
      '',
      '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=it-cyber&tab=explain',
    )
    const { user, explorer } = await renderApp()
    await explorer.findByRole('tabpanel', { name: chalkPrompt['IT & Cyber'] })
    const address = window.location.href
    const word = await explorer.findByRole(
      'button',
      { name: 'device' },
      { timeout: 5000 },
    )
    await user.hover(word)
    expect(await screen.findByRole('dialog', { name: 'Device' })).toBeVisible()
    expect(word).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(word).toHaveAttribute('aria-expanded', 'false')
    expect(window.location.href).toBe(address)
    followPageLink(screen.getByRole('link', { name: 'Glossary' }))
    const glossaryAddress = window.location.href
    await user.type(
      screen.getByRole('searchbox', { name: 'Search words' }),
      'offboarding',
    )
    expect(
      screen.getByRole('status', { name: 'Glossary search results' }),
    ).toHaveTextContent('1 word')
    expect(window.location.href).toBe(glossaryAddress)
    act(() => {
      window.history.replaceState(null, '', address)
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(
      await screen.findByRole('tabpanel', { name: chalkPrompt['IT & Cyber'] }),
    ).toBeVisible()
    expect(window.location.href).toBe(address)
  })
})
