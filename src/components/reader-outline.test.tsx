import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { referenceControls } from '../data/content'
import { levelOneLearningActivities } from '../data/level-one-learning'

function openReference(key: string) {
  window.history.replaceState(
    null,
    '',
    `/?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=beginner`,
  )
  render(<App />)
}

function destination(link: HTMLElement) {
  const fragment = link.getAttribute('href')
  expect(fragment).toMatch(/^#.+/)
  const target = document.getElementById(fragment!.slice(1))
  expect(target).not.toBeNull()
  expect(target).toHaveAttribute('tabindex', '-1')
  return target!
}

beforeEach(() => window.history.replaceState(null, '', '/learn'))

describe('Reference reading outline', () => {
  it.each(levelOneLearningActivities)(
    'links to the source, explanation and existing practice for $id',
    async (activity) => {
      openReference(activity.lesson.controlKey)
      const panel = await screen.findByRole('tabpanel', { name: 'Beginner' })
      const outline = within(
        screen.getByRole('navigation', { name: 'On this page' }),
      )
      const links = outline.getAllByRole('link')
      expect(links.map((link) => link.textContent)).toEqual([
        '01 Source',
        '02 Explain it',
        '03 Practice',
      ])
      const source = destination(links[0]!)
      const control = referenceControls.find(
        (item) => item.key === activity.lesson.controlKey,
      )!
      expect(source).toHaveTextContent(control.requirement.text)
      expect(destination(links[1]!)).toContainElement(panel)
      expect(destination(links[2]!)).toHaveTextContent(activity.title)
      const ids = [...document.querySelectorAll('[id]')].map(
        (element) => element.id,
      )
      expect(new Set(ids).size).toBe(ids.length)
    },
  )

  it.each(['AC.L1-b.1.ii', 'IR.L3-3.6.1e'])(
    'does not offer unavailable practice for %s',
    async (id) => {
      const control = referenceControls.find((item) => item.id === id)!
      openReference(control.key)
      await screen.findByRole('tabpanel', { name: 'Beginner' })
      const outline = within(
        screen.getByRole('navigation', { name: 'On this page' }),
      )
      expect(outline.getAllByRole('link')).toHaveLength(2)
      expect(
        outline.queryByRole('link', { name: '03 Practice' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Draft learning activity'),
      ).not.toBeInTheDocument()
    },
  )

  it('keeps the reading targets and selected practice answer when the perspective changes', async () => {
    const user = userEvent.setup()
    const activity = levelOneLearningActivities[0]!
    openReference(activity.lesson.controlKey)
    await screen.findByRole('tabpanel', { name: 'Beginner' })
    const outline = within(
      screen.getByRole('navigation', { name: 'On this page' }),
    )
    const targets = outline.getAllByRole('link').map(destination)
    await user.click(
      screen.getByText('Check your understanding', { selector: 'summary' }),
    )
    const choice = screen.getByRole('radio', {
      name: activity.questions[0]!.choices[0]!.label,
    })
    await user.click(choice)
    await user.click(screen.getByRole('tab', { name: 'IT & Cyber' }))
    expect(screen.getByRole('tabpanel', { name: 'IT & Cyber' })).toBeVisible()
    expect(choice).toBeChecked()
    outline.getAllByRole('link').forEach((link, index) => {
      expect(destination(link)).toBe(targets[index])
    })
    expect(window.location.pathname).toBe('/')
    expect(new URLSearchParams(window.location.search).get('mode')).toBe(
      'it-cyber',
    )
  })
})
