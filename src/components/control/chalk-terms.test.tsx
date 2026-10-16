import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../../App'
import { glossaryTerms, referenceControls } from '../../data/content'
import { findCmmcPerspective } from '../../data/cmmc-perspectives'

function control(id: string) {
  const found = referenceControls.find((item) => item.id === id)
  if (!found) throw new Error(`Missing control ${id}`)
  return found
}
function open(key: string, mode = 'beginner') {
  window.history.replaceState(
    null,
    '',
    `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=${mode}&tab=explain`,
  )
  render(<App />)
}
const term = (id: string) => glossaryTerms.find((item) => item.id === id)!
const device = term('device')
// The teaching drafts load on demand; under a full run the first wait is long.
const word = (name = 'devices') =>
  screen.findByRole('button', { name }, { timeout: 5000 })
const settle = () => new Promise((resolve) => setTimeout(resolve, 400))
// The marked words of a panel, which also holds the reflection's buttons.
const marked = (panel: Element) =>
  [...panel.querySelectorAll('.term-chalk')].map((node) => node.textContent)

beforeEach(() => window.history.replaceState(null, '', '/learn'))

describe('Chalk popovers in the explanation', () => {
  it('marks the first mention of each of the lesson’s words and keeps the text verbatim', async () => {
    const item = control('AC.L1-b.1.i')
    const draft = findCmmcPerspective(item)!
    open(item.key)
    const devices = await word()
    const text = devices.closest('.explain-text')!
    expect(text.textContent).toBe(draft.beginner.meaning)
    expect(
      within(text as HTMLElement)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['devices', 'processes'])
    expect(devices).toHaveAttribute('aria-expanded', 'false')
    expect(devices).toHaveAttribute('aria-haspopup', 'dialog')
    expect(screen.queryByRole('dialog')).toBeNull()
    const margin = text.parentElement!.querySelector('.explain-margin')!
    expect(margin.textContent).toContain(draft.beginner.example)
  })

  it('marks a word once across the view, in every chalk, and keeps each block verbatim', async () => {
    const item = control('AC.L1-b.1.i')
    const draft = findCmmcPerspective(item)!
    const { unmount } = render(<></>)
    unmount()
    open(item.key, 'it-cyber')
    const first = await word('device')
    const panel = first.closest('.explain-panel')!
    expect(marked(panel)).toEqual(['process', 'device'])
    expect(panel.querySelector('.explain-text')!.textContent).toBe(
      draft.technical.focus,
    )
    expect(panel.textContent).toContain(draft.technical.example)
    expect(panel.textContent).toContain(draft.technical.watchFor)
    window.history.replaceState(null, '', '/learn')
    open(item.key, 'compliance')
    const processes = await word('processes')
    const asked = processes.closest('.explain-panel')!
    for (const question of draft.compliance.reviewQuestions)
      expect(asked.textContent).toContain(question)
    expect(marked(asked)).toEqual(['processes', 'devices'])
  })

  it('shows the definition and its source on hover without taking focus, and hides it on leave', async () => {
    const user = userEvent.setup()
    open(control('AC.L1-b.1.i').key)
    const devices = await word()
    await user.hover(devices)
    const popover = await screen.findByRole('dialog', { name: device.title })
    expect(popover).toHaveTextContent(device.definition)
    expect(popover).toHaveAccessibleDescription(device.definition)
    const sources = within(popover).getAllByRole('link')
    expect(sources.map((link) => link.getAttribute('href'))).toEqual(
      device.sources.map((source) => source.url),
    )
    sources.forEach((link, index) =>
      expect(link).toHaveAccessibleName(
        `${device.sources[index]!.title} (opens in a new tab)`,
      ),
    )
    expect(popover).not.toHaveFocus()
    expect(devices).toHaveAttribute('aria-expanded', 'true')
    expect(devices).toHaveAttribute('aria-controls', popover.id)
    await user.unhover(devices)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(devices).toHaveAttribute('aria-expanded', 'false')
  })

  it('names a publication its sources share once, and keeps each link’s full name', async () => {
    const user = userEvent.setup()
    open(control('AC.L1-b.1.i').key)
    await user.click(await word())
    const popover = await screen.findByRole('dialog', { name: device.title })
    const line = popover
      .querySelector('.chalk-popover-source')!
      .cloneNode(true) as HTMLElement
    for (const hidden of line.querySelectorAll('.sr-only')) hidden.remove()
    const publication = device.sources[0]!.title.split(' — ')[0]!
    expect(device.sources.every((s) => s.title.startsWith(publication))).toBe(
      true,
    )
    expect(line.textContent!.split(publication)).toHaveLength(2)
    for (const source of device.sources)
      expect(line.textContent).toContain(source.title.split(' — ')[1]!)
  })

  it('stays while the pointer moves into it and back to the word; Escape closes it without moving focus', async () => {
    const user = userEvent.setup()
    open(control('AC.L1-b.1.i').key)
    const devices = await word()
    await user.hover(devices)
    const popover = await screen.findByRole('dialog', { name: device.title })
    await user.hover(popover)
    await user.hover(devices)
    await settle()
    expect(screen.getByRole('dialog', { name: device.title })).toBeVisible()
    const focused = document.activeElement
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(focused)
  })

  it('pins the popover on a tap with focus inside; Escape closes it and gives focus back', async () => {
    const user = userEvent.setup()
    open(control('AC.L1-b.1.i').key)
    const devices = await word()
    await user.click(devices)
    const popover = await screen.findByRole('dialog', { name: device.title })
    expect(popover).toHaveFocus()
    await user.unhover(devices)
    await settle()
    expect(screen.getByRole('dialog', { name: device.title })).toBeVisible()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(devices).toHaveFocus()
    // Pressing the word again closes it too.
    await user.click(devices)
    await screen.findByRole('dialog', { name: device.title })
    await user.click(devices)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(devices).toHaveFocus()
  })

  it('pins a hovered popover when it is pressed, so leaving does not drop focus', async () => {
    const user = userEvent.setup()
    open(control('AC.L1-b.1.i').key)
    const devices = await word()
    await user.hover(devices)
    const popover = await screen.findByRole('dialog', { name: device.title })
    await user.click(within(popover).getByText(device.definition))
    expect(popover).toHaveFocus()
    await user.unhover(popover)
    await settle()
    expect(screen.getByRole('dialog', { name: device.title })).toBeVisible()
    await user.keyboard('{Escape}')
    expect(devices).toHaveFocus()
  })

  it('works from the keyboard: Enter or Space opens it, Tab reaches the source, leaving closes it', async () => {
    const user = userEvent.setup()
    open(control('AC.L1-b.1.i').key)
    const devices = await word()
    devices.focus()
    await user.keyboard('{Enter}')
    const popover = await screen.findByRole('dialog', { name: device.title })
    expect(popover).toHaveFocus()
    for (const link of within(popover).getAllByRole('link')) {
      await user.tab()
      expect(link).toHaveFocus()
    }
    await user.tab()
    expect(screen.getByRole('button', { name: 'processes' })).toHaveFocus()
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await user.tab({ shift: true })
    expect(devices).toHaveFocus()
    await user.keyboard(' ')
    expect(
      await screen.findByRole('dialog', { name: device.title }),
    ).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(devices).toHaveFocus()
  })

  it('closes on a press elsewhere', async () => {
    const user = userEvent.setup()
    open(control('AC.L1-b.1.i').key)
    const devices = await word()
    await user.click(devices)
    await screen.findByRole('dialog', { name: device.title })
    await user.click(screen.getByRole('heading', { level: 1 }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('marks nothing on a control with no words listed', async () => {
    const item = control('AC.L2-3.1.1')
    const draft = findCmmcPerspective(item)!
    open(item.key)
    const text = await screen.findByText(draft.beginner.meaning, undefined, {
      timeout: 5000,
    })
    expect(text).toHaveClass('explain-text')
    expect(within(text).queryAllByRole('button')).toHaveLength(0)
  })
})
