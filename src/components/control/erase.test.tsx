import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { referenceControls } from '../../data/content'

function control(id: string) {
  const found = referenceControls.find((item) => item.id === id)
  if (!found) throw new Error(`Missing control ${id}`)
  return found
}
const first = control('AC.L1-b.1.i')
const second = control('AC.L1-b.1.ii')
const third = control('AC.L1-b.1.iii')
const address = (key: string) =>
  `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=beginner`
const dust = () => document.querySelector('.erase-dust')
const title = () => document.getElementById('control-title')
function cut(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: matches && /reduced-motion|forced-colors/.test(query),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }))
}
async function openFirst() {
  window.history.replaceState(null, '', address(first.key))
  render(<App />)
  await screen.findByRole('heading', { level: 1, name: first.title })
}

beforeEach(() => window.history.replaceState(null, '', '/learn'))
afterEach(() => vi.unstubAllGlobals())

describe('Erase between controls', () => {
  it('sweeps the old control off as inert dust while the new one is on the board, focused and announced at once', async () => {
    const user = userEvent.setup()
    await openFirst()
    expect(dust()).toBeNull()
    await user.click(screen.getByRole('button', { name: `Next: ${second.id}` }))
    // The commit is synchronous: the dust and the new control are both here.
    const old = dust()!
    expect(old).toHaveAttribute('aria-hidden', 'true')
    expect(old).toHaveAttribute('inert')
    expect(old.querySelector('[id]')).toBeNull()
    expect(old.textContent).toContain(first.title)
    expect(title()).toHaveTextContent(second.title)
    expect(title()!.closest('.erase-dust')).toBeNull()
    expect(
      screen.getByText(`${second.id}: ${second.title}`, {
        selector: '[role="status"]',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: `Next: ${third.id}` }),
    ).toHaveFocus()
    // A key moves on at once, to the real title, and the dust starts over.
    await user.keyboard('j')
    const next = dust()!
    expect(next).not.toBe(old)
    expect(document.querySelectorAll('.erase-dust')).toHaveLength(1)
    expect(next.textContent).toContain(second.title)
    expect(title()).toHaveTextContent(third.title)
    expect(title()).toHaveFocus()
    act(() => {
      next.dispatchEvent(new Event('animationend'))
    })
    expect(dust()).toBeNull()
  })

  it('leaves the dust alone on a view change and takes it away with the page', async () => {
    const user = userEvent.setup()
    await openFirst()
    await user.click(screen.getByRole('button', { name: `Next: ${second.id}` }))
    const old = dust()
    expect(old).not.toBeNull()
    // A view change is replayed from the address so that nothing slow runs
    // inside the dust's 600 ms; the subject is the same, so no new dust.
    act(() => {
      window.history.replaceState(
        null,
        '',
        `${address(second.key)}&tab=explain`,
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(document.querySelectorAll('.erase-dust')).toHaveLength(1)
    expect(dust()).toBe(old)
    act(() => {
      window.history.replaceState(
        null,
        '',
        '/learn?view=discover&collection=references',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(title()).toBeNull()
    expect(dust()).toBeNull()
  })

  it.each(['reduced motion', 'forced colours'])(
    'is a cut under %s',
    async () => {
      cut(true)
      const user = userEvent.setup()
      await openFirst()
      await user.click(
        screen.getByRole('button', { name: `Next: ${second.id}` }),
      )
      expect(title()).toHaveTextContent(second.title)
      expect(dust()).toBeNull()
    },
  )

  it('does not run on a view change or a chalk change', async () => {
    const user = userEvent.setup()
    await openFirst()
    await user.click(screen.getByRole('link', { name: 'Explain' }))
    await screen.findByRole('tab', { name: 'I run the systems' })
    await user.click(screen.getByRole('tab', { name: 'I run the systems' }))
    expect(dust()).toBeNull()
  })
})
