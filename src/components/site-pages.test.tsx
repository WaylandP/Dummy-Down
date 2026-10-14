import { act, render, screen } from '@testing-library/react'
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
      'What are you trying to understand?',
    )
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
    expect(
      screen.getByRole('searchbox', {
        name: 'Search the control library',
      }),
    ).toBeVisible()
    expect(
      screen.queryByRole('region', { name: 'Control Explorer' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /^Browse practice activities/ }),
    ).toHaveAttribute('href', '/practice')
    expect(trackUsage).not.toHaveBeenCalled()
  })
  it('opens discovery without a preselected lesson and renders the shared sample from home', async () => {
    render(<App />)
    followPageLink(screen.getByRole('link', { name: 'Learn' }))
    expect(
      await screen.findByRole('status', { name: 'Control search results' }),
    ).toHaveTextContent('149 references found')
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
    followPageLink(screen.getByRole('link', { name: 'Cipher & Chalk home' }))
    followPageLink(screen.getByRole('link', { name: 'Try a short lesson' }))
    expect(
      await screen.findByRole('tabpanel', { name: 'Beginner' }),
    ).toBeVisible()
    expect(new URLSearchParams(window.location.search).get('control')).toBe(
      'ac-l1-b-1-i',
    )
  })
  it.each(['/glossary', '/about', '/glossary/', '/about/'])(
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
      screen.getByRole('searchbox', { name: 'Search glossary' }),
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
