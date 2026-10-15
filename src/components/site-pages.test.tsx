import { act, render, screen, within } from '@testing-library/react'
import { describe, it, beforeEach, vi } from 'vitest'
import App from '../App'
import { followPageLink } from '../test/page-navigation'
import { trackUsage } from '../analytics/usage'

vi.mock('../analytics/usage', () => ({ trackUsage: vi.fn() }))
beforeEach(() => {
  window.history.replaceState(null, '', '/')
  vi.mocked(trackUsage).mockClear()
})

describe('Separate blackboard pages', () => {
  it('keeps the homepage calm and does not count an unseen control as viewed', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'CMMC, in plain words.',
    )
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
    expect(
      screen.getByRole('searchbox', { name: 'Find a control' }),
    ).toBeVisible()
    expect(
      screen.queryByRole('region', { name: 'Control Explorer' }),
    ).not.toBeInTheDocument()
    expect(
      within(
        screen.getByRole('list', { name: 'Pick up a chalk to start.' }),
      ).getAllByRole('link'),
    ).toHaveLength(3)
    expect(
      screen.queryByRole('navigation', { name: 'Control families' }),
    ).not.toBeInTheDocument()
    expect(trackUsage).not.toHaveBeenCalled()
  })
  it('opens discovery without a preselected lesson and renders the shared sample from home', async () => {
    render(<App />)
    followPageLink(screen.getByRole('link', { name: 'Controls' }))
    expect(
      await screen.findByRole(
        'status',
        { name: 'Control search results' },
        { timeout: 5000 },
      ),
    ).toHaveTextContent('149 references found')
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
    followPageLink(screen.getByRole('link', { name: 'Cipher & Chalk home' }))
    followPageLink(screen.getByRole('link', { name: /^I’m new to this/ }))
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Authorized Access Control [FCI Data]',
      }),
    ).toBeVisible()
    expect(new URLSearchParams(window.location.search).get('control')).toBe(
      'ac-l1-b-1-i',
    )
  })
  it.each(['/glossary', '/about', '/disclaimer', '/glossary/', '/about/'])(
    'opens %s on direct load without rendering a hidden lesson',
    (path) => {
      window.history.replaceState(null, '', path)
      render(<App />)
      expect(screen.getByRole('heading', { level: 1 })).toBeVisible()
      expect(
        screen.queryByRole('region', { name: 'Control Explorer' }),
      ).not.toBeInTheDocument()
      expect(trackUsage).not.toHaveBeenCalled()
    },
  )
  it('restores historical section links on hash navigation without borrowing a control view', () => {
    render(<App />)
    act(() => {
      window.history.replaceState(null, '', '/#glossary')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(
      screen.getByRole('searchbox', { name: 'Search words' }),
    ).toBeVisible()
    expect(trackUsage).not.toHaveBeenCalled()
  })
  it.each(['glossary', 'about', 'approach', 'explorer'])(
    'keeps the legacy #%s page when skipping to its content',
    async (hash) => {
      window.history.replaceState(null, '', `/#${hash}`)
      render(<App />)
      if (hash === 'explorer')
        await screen.findByRole('region', { name: 'Control Explorer' })
      const before = screen.getByRole('heading', { level: 1 }).textContent
      followPageLink(screen.getByRole('link', { name: 'Skip to content' }))
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        before!,
      )
      expect(window.location.hash).toBe('#main')
      expect(window.location.pathname).not.toBe('/')
    },
  )
  it('keeps broken root lesson links visibly invalid instead of substituting the homepage', async () => {
    window.history.replaceState(null, '', '/?view=lesson&framework=cmmc')
    render(<App />)
    expect(
      await screen.findByRole('heading', {
        name: 'This lesson link is invalid.',
      }),
    ).toBeVisible()
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
  })
})
