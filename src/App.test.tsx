import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act, render as renderView } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { followPageLink } from './test/page-navigation'
import { chalkFor } from './components/board/chalks'

const chalkPrompt = {
  Beginner: chalkFor('beginner').prompt,
  'IT & Cyber': chalkFor('it-cyber').prompt,
  Compliance: chalkFor('compliance').prompt,
} as const

beforeEach(() =>
  window.history.replaceState(
    null,
    '',
    '/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access',
  ),
)

async function renderApp() {
  const user = userEvent.setup()
  render(<App />)
  const explorer = within(
    await screen.findByRole('region', { name: 'Control Explorer' }),
  )
  return { user, explorer }
}

describe('Control Explorer learning experience', () => {
  it('renders the original demo with a clearly marked draft and beginner explanation', async () => {
    const { explorer } = await renderApp()

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Learning workspace',
      }),
    ).toBeVisible()
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('1 example found')
    expect(
      explorer.getByRole('button', {
        name: /AC\.L2-3\.1\.1.*Authorized access/,
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(explorer.getByText('Simplified teaching example')).toBeVisible()
    expect(
      explorer.getByText(
        'Paraphrase from our README; not the official requirement.',
      ),
    ).toBeVisible()
    expect(explorer.getByRole('tab', { name: 'Beginner' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      explorer.getByRole('tabpanel', { name: 'Beginner' }),
    ).toHaveTextContent('Give the right people the keys.')
  })

  it('changes the explanation when a reader chooses a different mode', async () => {
    const { user, explorer } = await renderApp()

    await user.click(explorer.getByRole('tab', { name: 'IT & Cyber' }))
    expect(explorer.getByRole('tab', { name: 'IT & Cyber' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(explorer.getByRole('tab', { name: 'Beginner' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    expect(
      explorer.getByRole('tabpanel', { name: 'IT & Cyber' }),
    ).toHaveTextContent('Make access deliberate, then keep it current.')

    await user.click(explorer.getByRole('tab', { name: 'Compliance' }))
    const compliance = explorer.getByRole('tabpanel', { name: 'Compliance' })
    expect(compliance).toHaveTextContent(
      'Connect the example to the official sources.',
    )
    expect(compliance).toHaveTextContent(
      'These are discussion examples, not an official evidence list or assessment objectives.',
    )

    await user.click(explorer.getByRole('tab', { name: 'Beginner' }))
    expect(
      explorer.getByRole('tabpanel', { name: 'Beginner' }),
    ).toHaveTextContent('Give the right people the keys.')
  })

  it('supports arrow navigation, wrapping, Home, and End with focus following selection', async () => {
    const { user, explorer } = await renderApp()
    const beginner = explorer.getByRole('tab', { name: 'Beginner' })
    const technical = explorer.getByRole('tab', { name: 'IT & Cyber' })
    const compliance = explorer.getByRole('tab', { name: 'Compliance' })

    await user.click(beginner)
    await user.keyboard('{ArrowRight}')
    expect(technical).toHaveFocus()
    expect(technical).toHaveAttribute('aria-selected', 'true')
    expect(technical).toHaveAttribute('tabindex', '0')
    expect(beginner).toHaveAttribute('tabindex', '-1')

    await user.keyboard('{End}')
    expect(compliance).toHaveFocus()
    expect(explorer.getByRole('tabpanel', { name: 'Compliance' })).toBeVisible()

    await user.keyboard('{ArrowRight}')
    expect(beginner).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(compliance).toHaveFocus()

    await user.keyboard('{Home}')
    expect(beginner).toHaveFocus()
    expect(beginner).toHaveAttribute('aria-selected', 'true')
    expect(explorer.getByRole('tabpanel', { name: 'Beginner' })).toBeVisible()
  })

  it.each(['Beginner', 'IT & Cyber', 'Compliance'] as const)(
    'opens the %s chalk from its About page link',
    async (mode) => {
      const { user, explorer } = await renderApp()
      await user.click(
        explorer.getByRole('tab', {
          name: mode === 'Compliance' ? 'Beginner' : 'Compliance',
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
        await screen.findByRole('tab', { name: chalkPrompt[mode] }),
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
    const search = explorer.getByRole('searchbox', { name: 'Search controls' })

    await user.type(search, 'AC.L2-3.1.1')
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('1 example found')
    expect(
      explorer.getByRole('heading', { name: 'Authorized access' }),
    ).toBeVisible()

    await user.clear(search)
    await user.type(search, 'unavailable control')
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('0 examples found')
    expect(
      explorer.getByRole('heading', { name: 'No matching examples.' }),
    ).toBeVisible()
    expect(explorer.queryByRole('tabpanel')).not.toBeInTheDocument()

    await user.click(explorer.getByRole('button', { name: 'Clear filters' }))
    expect(search).toHaveValue('')
    expect(search).toHaveFocus()
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('1 example found')
    expect(
      explorer.getByRole('heading', { name: 'Choose an example.' }),
    ).toBeVisible()
    expect(explorer.queryByRole('tabpanel')).not.toBeInTheDocument()
    await user.click(
      explorer.getByRole('button', {
        name: /AC\.L2-3\.1\.1.*Authorized access/,
      }),
    )
    expect(
      explorer.getByRole('heading', { name: 'Authorized access' }),
    ).toBeVisible()
  })

  it('supports family and level filters and clears them together with search', async () => {
    const { user, explorer } = await renderApp()
    const family = explorer.getByRole('combobox', { name: 'Control family' })
    const level = explorer.getByRole('combobox', { name: 'Level' })
    const search = explorer.getByRole('searchbox', { name: 'Search controls' })

    await user.selectOptions(family, 'AC')
    await user.selectOptions(level, 'Level 2')
    expect(family).toHaveValue('AC')
    expect(level).toHaveValue('Level 2')
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('1 example found')

    await user.type(search, 'no matching topic')
    await user.click(explorer.getByRole('button', { name: 'Clear filters' }))
    expect(family).toHaveValue('')
    expect(level).toHaveValue('')
    expect(search).toHaveValue('')
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('1 example found')
  })

  it('offers only frameworks with published content in the dropdown', async () => {
    const { explorer } = await renderApp()
    const framework = explorer.getByRole('combobox', { name: 'Framework' })
    expect(
      within(framework)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['CMMC'])
  })

  it('still resolves a saved planned-framework link and restores the CMMC example without claiming coverage', async () => {
    window.history.replaceState(
      null,
      '',
      '?view=discover&catalog=nist-sp-800-53',
    )
    const { user, explorer } = await renderApp()
    const framework = explorer.getByRole('combobox', { name: 'Framework' })
    const family = explorer.getByRole('combobox', { name: 'Control family' })
    expect(framework).toHaveValue('nist-sp-800-53')
    expect(
      within(framework).getByRole('option', { name: 'NIST 800-53 · planned' }),
    ).toBeInTheDocument()

    expect(family).toHaveValue('')
    expect(
      explorer.queryByRole('combobox', { name: 'Level' }),
    ).not.toBeInTheDocument()
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('0 examples found')
    expect(
      explorer.getByRole('heading', { name: 'NIST 800-53 is on the roadmap.' }),
    ).toBeVisible()
    expect(
      explorer.getByText(/This framework has no published content here yet/),
    ).toBeVisible()
    expect(explorer.queryByRole('tabpanel')).not.toBeInTheDocument()

    await user.click(
      explorer.getByRole('button', { name: 'Browse available examples' }),
    )
    expect(
      explorer.getByRole('searchbox', { name: 'Search controls' }),
    ).toHaveFocus()
    expect(framework).toHaveValue('cmmc')
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('1 example found')
    expect(
      explorer.getByRole('heading', { name: 'Choose an example.' }),
    ).toBeVisible()
    await user.click(
      explorer.getByRole('button', {
        name: /AC\.L2-3\.1\.1.*Authorized access/,
      }),
    )
    expect(
      explorer.getByRole('heading', { name: 'Authorized access' }),
    ).toBeVisible()
  })

  it('shows source versions and official links when the reader opens content context', async () => {
    const { user, explorer } = await renderApp()

    await user.click(explorer.getByText('Sources & content context'))
    expect(
      explorer.getByText(/The README uses the CMMC Level 2 identifier/),
    ).toBeVisible()
    expect(
      explorer.getByRole('link', {
        name: /DoD CMMC resources and documentation/,
      }),
    ).toHaveAttribute(
      'href',
      'https://dodcio.defense.gov/CMMC/Resources-Documentation/',
    )
    expect(
      explorer.getByRole('link', { name: /^NIST SP 800-171 Rev. 2/ }),
    ).toHaveAttribute(
      'href',
      'https://csrc.nist.gov/pubs/sp/800/171/r2/upd1/final',
    )
    expect(explorer.getByText(/Later NIST revisions exist/)).toBeVisible()
    expect(
      explorer.getByText(
        /This is not the full official requirement, an assessment checklist, or a guarantee of compliance/,
      ),
    ).toBeVisible()
  })
})

const lessonAddress =
  '?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access'

describe('Shareable lessons and reading tools', () => {
  it('restores a shared perspective and preserves an incoming lesson excluded by search', async () => {
    window.history.replaceState(
      null,
      '',
      `${lessonAddress}&mode=compliance&q=unavailable`,
    )
    const { user, explorer } = await renderApp()
    expect(explorer.getByRole('tabpanel', { name: 'Compliance' })).toBeVisible()
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('0 examples found')
    expect(
      explorer.getByText('This lesson is outside the current results.'),
    ).toBeVisible()
    await user.click(
      explorer.getByRole('button', { name: 'Show this lesson in results' }),
    )
    expect(
      explorer.getByRole('searchbox', { name: 'Search controls' }),
    ).toHaveValue('')
    expect(explorer.getByRole('tabpanel', { name: 'Compliance' })).toBeVisible()
    expect(
      explorer.getByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('1 example found')
  })

  it.each([
    ['?view=lesson&framework=cmmc', 'This lesson link is invalid.'],
    [
      '?view=lesson&framework=cmmc&edition=readme-example&control=missing',
      'This lesson isn’t available here.',
    ],
    ['?view=discover&catalog=nist-sp-800-53', 'NIST 800-53 is on the roadmap.'],
    ['?view=discover', 'Choose an example.'],
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

  it('replays navigation addresses without reopening a lesson on discovery reload', async () => {
    window.history.replaceState(
      null,
      '',
      '?view=discover&q=access&mode=it-cyber',
    )
    const view = renderView(<App />)
    await screen.findByRole('region', { name: 'Control Explorer' })
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
    act(() => {
      window.history.replaceState(null, '', `${lessonAddress}&mode=compliance`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByRole('tabpanel', { name: 'Compliance' })).toBeVisible()
    act(() => {
      window.history.replaceState(
        null,
        '',
        '?view=discover&q=access&mode=it-cyber',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
    view.unmount()
    renderView(<App />)
    await screen.findByRole('region', { name: 'Control Explorer' })
    expect(
      screen.getByRole('heading', { name: 'Choose an example.' }),
    ).toBeVisible()
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
  })

  it('keeps definitions and glossary search independent of lesson navigation', async () => {
    const { user, explorer } = await renderApp()
    await user.click(explorer.getByRole('tab', { name: 'IT & Cyber' }))
    const address = window.location.href
    const term = explorer.getByRole('button', { name: 'Account' })
    await user.click(term)
    expect(term).toHaveFocus()
    expect(term).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(term).toHaveFocus()
    expect(term).toHaveAttribute('aria-expanded', 'false')
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
      await screen.findByRole('tabpanel', { name: 'IT & Cyber' }),
    ).toBeVisible()
    expect(window.location.href).toBe(address)
  })
})
