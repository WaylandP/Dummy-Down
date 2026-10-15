import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'
import { referenceControls } from '../data/content'
import { levelOneLearningActivities } from '../data/level-one-learning'
import { expandedLearningActivities } from '../data/expanded-learning'
import { hasVisualExplanation } from '../data/visual-lesson-index'

function openReference(key: string, tab = 'decode') {
  window.history.replaceState(
    null,
    '',
    `/?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=beginner${tab === 'decode' ? '' : `&tab=${tab}`}`,
  )
  render(<App />)
}

const viewNames = ['Decode', 'Explain', 'Evidence', 'Practice', 'Related']

beforeEach(() => window.history.replaceState(null, '', '/learn'))

describe('Control views', () => {
  it.each([...levelOneLearningActivities, ...expandedLearningActivities])(
    'offers five views and keeps the practice on its own view for $id',
    async (activity) => {
      const user = userEvent.setup()
      openReference(activity.lesson.controlKey, 'practice')
      const control = referenceControls.find(
        (item) => item.key === activity.lesson.controlKey,
      )!
      expect(
        await screen.findByRole('heading', { level: 1, name: control.title }),
      ).toBeVisible()
      const views = within(
        screen.getByRole('navigation', { name: 'Views of this control' }),
      )
      const links = views.getAllByRole('link')
      expect(links.map((link) => link.textContent)).toEqual(viewNames)
      for (const link of links) {
        const url = new URL(link.getAttribute('href')!, window.location.origin)
        expect(url.searchParams.get('control')).toBe(activity.lesson.controlKey)
        expect(url.searchParams.get('tab') ?? 'decode').toBe(
          link.textContent!.toLowerCase(),
        )
      }
      expect(links[3]).toHaveAttribute('aria-current', 'page')
      expect(screen.getByText(activity.title)).toBeVisible()
      if (hasVisualExplanation(activity.lesson))
        expect(
          screen.getByText('Watch the idea · 40 seconds', { exact: true }),
        ).toBeVisible()
      await user.click(links[0]!)
      expect(screen.getByText(control.requirement.text)).toBeVisible()
      expect(screen.getByText(activity.title)).not.toBeVisible()
      expect(new URLSearchParams(window.location.search).has('tab')).toBe(false)
      const ids = [...document.querySelectorAll('[id]')].map(
        (element) => element.id,
      )
      expect(new Set(ids).size).toBe(ids.length)
    },
  )

  it.each(['AC.L1-b.1.iii', 'IR.L3-3.6.1e'])(
    'says when there is no practice yet for %s',
    async (id) => {
      const control = referenceControls.find((item) => item.id === id)!
      openReference(control.key, 'practice')
      expect(
        await screen.findByText('No practice for this control yet.'),
      ).toBeVisible()
      expect(
        screen.getByRole('link', { name: 'See the activities that exist' }),
      ).toHaveAttribute('href', '/practice')
      expect(screen.queryByText('Practice activity')).not.toBeInTheDocument()
    },
  )

  it('keeps a selected practice answer while the chalk changes on another view', async () => {
    const user = userEvent.setup()
    const activity = levelOneLearningActivities[0]!
    openReference(activity.lesson.controlKey, 'practice')
    await screen.findByText(activity.title)
    await user.click(
      screen.getByText('Check your understanding', { selector: 'summary' }),
    )
    const choice = screen.getByRole('radio', {
      name: activity.questions[0]!.choices[0]!.label,
    })
    await user.click(choice)
    const views = within(
      screen.getByRole('navigation', { name: 'Views of this control' }),
    )
    await user.click(views.getByRole('link', { name: 'Explain' }))
    await user.click(
      await screen.findByRole('tab', { name: 'I run the systems' }),
    )
    expect(
      screen.getByRole('tabpanel', { name: 'I run the systems' }),
    ).toBeVisible()
    expect(choice).not.toBeVisible()
    await user.click(views.getByRole('link', { name: 'Practice' }))
    expect(choice).toBeVisible()
    expect(choice).toBeChecked()
    expect(window.location.pathname).toBe('/')
    const params = new URLSearchParams(window.location.search)
    expect(params.get('mode')).toBe('it-cyber')
    expect(params.get('tab')).toBe('practice')
  })
})
