import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LearningRoute } from './LearningRoute'

function Content() {
  return <h1>Loaded learning content</h1>
}

describe('learning route loading', () => {
  it('shows a readable state then mounts the actual page without rewriting its address', async () => {
    const address =
      '/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access&mode=compliance#explorer'
    window.history.replaceState(null, '', address)
    let resolve!: (module: { default: typeof Content }) => void
    const load = vi.fn(
      () =>
        new Promise<{ default: typeof Content }>((done) => {
          resolve = done
        }),
    )
    render(<LearningRoute load={load} />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Learning workspace',
    )
    expect(
      window.location.pathname + window.location.search + window.location.hash,
    ).toBe(address)
    await act(async () => resolve({ default: Content }))
    expect(
      screen.getByRole('heading', { name: 'Loaded learning content' }),
    ).toBeVisible()
    expect(
      window.location.pathname + window.location.search + window.location.hash,
    ).toBe(address)
    expect(load).toHaveBeenCalledOnce()
  })

  it('provides recovery after a failed chunk load and preserves the requested lesson', async () => {
    const address =
      '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ia-l2-3-5-3'
    window.history.replaceState(null, '', address)
    const load = vi.fn(async () => {
      throw new Error('Chunk unavailable')
    })
    render(<LearningRoute load={load} />)
    expect(
      await screen.findByRole('button', {
        name: 'Reload this lesson or search',
      }),
    ).toBeVisible()
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'false')
    expect(screen.getByRole('status')).toHaveTextContent('could not load')
    expect(screen.getByRole('link', { name: 'Return home' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(window.location.pathname + window.location.search).toBe(address)
  })

  it('does not render content from a request after the route unmounts', async () => {
    let resolve!: (module: { default: typeof Content }) => void
    const load = () =>
      new Promise<{ default: typeof Content }>((done) => {
        resolve = done
      })
    const { unmount } = render(<LearningRoute load={load} />)
    unmount()
    await act(async () => resolve({ default: Content }))
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})
