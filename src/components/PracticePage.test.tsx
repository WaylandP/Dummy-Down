import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import PracticePage from './PracticePage'
import { learningActivities } from '../data/learning'
import { sitePage } from '../state/site-page'

afterEach(() => window.history.replaceState(null, '', '/'))

describe('practice index', () => {
  it.each([
    ['MFA', 'ia-l2-3-5-3'],
    ['hash', 'si-l3-3-14-1e'],
    ['execution', 'cm-l2-3-4-8'],
  ])(
    'finds the taught concept %s in the learning goal or explanation',
    (query, key) => {
      window.history.replaceState(null, '', `/practice?q=${query}`)
      render(<PracticePage />)
      const activity = learningActivities.find(
        (item) => item.lesson.controlKey === key,
      )!
      expect(screen.getByRole('link', { name: activity.title })).toBeVisible()
    },
  )
  it('links every real activity to its exact edition and control without mounting questions', () => {
    window.history.replaceState(null, '', '/practice')
    render(<PracticePage />)
    expect(sitePage(new URL(window.location.href))).toBe('practice')
    expect(screen.getByRole('status')).toHaveTextContent(
      `${learningActivities.length} activities available`,
    )
    for (const activity of learningActivities) {
      const url = new URL(
        screen
          .getByRole('link', { name: activity.title })
          .getAttribute('href')!,
        window.location.origin,
      )
      expect(url.searchParams.get('framework')).toBe(
        activity.lesson.frameworkId,
      )
      expect(url.searchParams.get('edition')).toBe(activity.lesson.editionId)
      expect(url.searchParams.get('control')).toBe(activity.lesson.controlKey)
    }
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.getByText(/Project example/)).toBeVisible()
  })

  it('makes unmatched search and unavailable levels recoverable without substituting an activity', () => {
    window.history.replaceState(
      null,
      '',
      '/practice?q=no-such-topic&level=unavailable',
    )
    render(<PracticePage />)
    expect(screen.getByRole('status')).toHaveTextContent(
      '0 activities available',
    )
    expect(
      screen.getByRole('heading', { name: 'No matching activities.' }),
    ).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Browse all activities' }),
    ).toHaveAttribute('href', '/practice')
  })
})
