import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

function renderApp() {
  const user = userEvent.setup()
  render(<App />)
  const explorer = within(
    screen.getByRole('region', { name: 'Control Explorer' }),
  )
  return { user, explorer }
}

describe('Control Explorer learning experience', () => {
  it('starts with a clearly marked draft and the beginner explanation', () => {
    const { explorer } = renderApp()

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Navigate the\s*complexity\./,
      }),
    ).toBeVisible()
    expect(explorer.getByRole('status')).toHaveTextContent('1 example found')
    expect(
      explorer.getByRole('button', {
        name: /AC\.L2-3\.1\.1.*Authorized access/,
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(explorer.getByText('Draft educational example')).toBeVisible()
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
    expect(
      explorer.getByText(/Learning material, not a compliance checklist/),
    ).toBeVisible()
  })

  it('changes the explanation when a reader chooses a different mode', async () => {
    const { user, explorer } = renderApp()

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
    const { user, explorer } = renderApp()
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

  it.each(['Beginner', 'IT & Cyber', 'Compliance'])(
    'opens the %s perspective from its homepage link',
    async (mode) => {
      const { user, explorer } = renderApp()
      // Start from another perspective so the beginner entry also proves a change.
      await user.click(
        explorer.getByRole('tab', {
          name: mode === 'Compliance' ? 'Beginner' : 'Compliance',
        }),
      )
      await user.click(
        screen.getByRole('link', {
          name: new RegExp(
            `^${mode} .*Try this perspective in the Control Explorer$`,
          ),
        }),
      )

      expect(explorer.getByRole('tab', { name: mode })).toHaveAttribute(
        'aria-selected',
        'true',
      )
      expect(explorer.getByRole('tabpanel', { name: mode })).toBeVisible()
    },
  )

  it('finds a control by its identifier and recovers from a search with no matches', async () => {
    const { user, explorer } = renderApp()
    const search = explorer.getByRole('searchbox', { name: 'Search controls' })

    await user.type(search, 'AC.L2-3.1.1')
    expect(explorer.getByRole('status')).toHaveTextContent('1 example found')
    expect(
      explorer.getByRole('heading', { name: 'Authorized access' }),
    ).toBeVisible()

    await user.clear(search)
    await user.type(search, 'unavailable control')
    expect(explorer.getByRole('status')).toHaveTextContent('0 examples found')
    expect(
      explorer.getByRole('heading', { name: 'No matching examples yet.' }),
    ).toBeVisible()
    expect(explorer.queryByRole('tabpanel')).not.toBeInTheDocument()

    await user.click(explorer.getByRole('button', { name: 'Clear filters' }))
    expect(search).toHaveValue('')
    expect(search).toHaveFocus()
    expect(explorer.getByRole('status')).toHaveTextContent('1 example found')
    expect(
      explorer.getByRole('heading', { name: 'Authorized access' }),
    ).toBeVisible()
  })

  it('supports family and level filters and clears them together with search', async () => {
    const { user, explorer } = renderApp()
    const family = explorer.getByRole('combobox', { name: 'Control family' })
    const level = explorer.getByRole('combobox', { name: 'Level' })
    const search = explorer.getByRole('searchbox', { name: 'Search controls' })

    await user.selectOptions(family, 'AC')
    await user.selectOptions(level, 'Level 2')
    expect(family).toHaveValue('AC')
    expect(level).toHaveValue('Level 2')
    expect(explorer.getByRole('status')).toHaveTextContent('1 example found')

    await user.type(search, 'no matching topic')
    await user.click(explorer.getByRole('button', { name: 'Clear filters' }))
    expect(family).toHaveValue('')
    expect(level).toHaveValue('')
    expect(search).toHaveValue('')
    expect(explorer.getByRole('status')).toHaveTextContent('1 example found')
  })

  it('labels future frameworks as planned and restores the CMMC example without claiming coverage', async () => {
    const { user, explorer } = renderApp()
    const framework = explorer.getByRole('combobox', { name: 'Framework' })
    const family = explorer.getByRole('combobox', { name: 'Control family' })
    const level = explorer.getByRole('combobox', { name: 'Level' })

    await user.selectOptions(family, 'AC')
    await user.selectOptions(level, 'Level 2')
    expect(
      within(framework).getByRole('option', { name: 'NIST 800-53 · planned' }),
    ).toBeInTheDocument()
    await user.selectOptions(framework, 'nist-sp-800-53')

    expect(family).toHaveValue('')
    expect(level).toHaveValue('')
    expect(explorer.getByRole('status')).toHaveTextContent('0 examples found')
    expect(
      explorer.getByRole('heading', { name: 'NIST 800-53 is on the roadmap.' }),
    ).toBeVisible()
    expect(
      explorer.getByText(/This framework has no published content here yet/),
    ).toBeVisible()
    expect(explorer.queryByRole('tabpanel')).not.toBeInTheDocument()

    await user.click(
      explorer.getByRole('button', { name: 'Explore the CMMC example' }),
    )
    expect(
      explorer.getByRole('searchbox', { name: 'Search controls' }),
    ).toHaveFocus()
    expect(framework).toHaveValue('cmmc')
    expect(explorer.getByRole('status')).toHaveTextContent('1 example found')
    expect(
      explorer.getByRole('heading', { name: 'Authorized access' }),
    ).toBeVisible()
  })

  it('shows source versions and official links when the reader opens content context', async () => {
    const { user, explorer } = renderApp()

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
      explorer.getByRole('link', { name: /NIST SP 800-171 Rev. 2/ }),
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
