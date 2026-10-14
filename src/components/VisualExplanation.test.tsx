import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { referenceControls } from '../data/cmmc-references'
import {
  findVisualExplanation,
  visualExplanations,
} from '../data/visual-explanations'
import { VisualExplanation } from './VisualExplanation'
import { visualLessonIdentities } from '../data/visual-lesson-index'

const first = visualExplanations[0]!
let now = 0
let frameId = 0
let frames = new Map<number, FrameRequestCallback>()
let motionListeners = new Set<(event: MediaQueryListEvent) => void>()
let reduced = false
let hidden = false

function advance(milliseconds: number) {
  act(() => {
    now += milliseconds
    const queued = [...frames.values()]
    frames.clear()
    queued.forEach((callback) => callback(now))
  })
}

function changeMotion(matches: boolean) {
  act(() => {
    reduced = matches
    for (const listener of motionListeners)
      listener({ matches } as MediaQueryListEvent)
  })
}

function setHidden(value: boolean) {
  act(() => {
    hidden = value
    document.dispatchEvent(new Event('visibilitychange'))
  })
}

beforeEach(() => {
  now = 0
  frameId = 0
  frames = new Map()
  motionListeners = new Set()
  reduced = false
  hidden = false
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frameId, callback)
    return frameId
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return reduced
    },
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (
      _name: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => motionListeners.add(listener),
    removeEventListener: (
      _name: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => motionListeners.delete(listener),
  }))
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('visual teaching source boundaries', () => {
  it('binds three 40-second draft explanations to exact pinned source quotations', () => {
    expect(visualExplanations.map((item) => item.lesson.controlKey)).toEqual([
      'ac-l1-b-1-i',
      'ia-l2-3-5-3',
      'ir-l3-3-6-2e',
    ])
    expect(visualExplanations.map((item) => item.lesson)).toEqual(
      visualLessonIdentities,
    )
    for (const item of visualExplanations) {
      const reference = referenceControls.find(
        (control) =>
          control.frameworkId === item.lesson.frameworkId &&
          control.editionId === item.lesson.editionId &&
          control.key === item.lesson.controlKey,
      )!
      expect(item.reviewStatus).toBe('draft')
      expect(item.humanReview).toBe('pending')
      expect(item.stages.map((stage) => stage.kind)).toEqual([
        'requirement',
        'meaning',
        'example',
        'takeaway',
      ])
      expect(item.stageDurationMs * item.stages.length).toBe(40_000)
      expect(item.stages[0].text).toBe(reference.requirement.text)
      expect(
        item.stages.every((stage) => stage.diagramDescription.length > 40),
      ).toBe(true)
      expect(reference.sources).toContainEqual(item.source)
      expect(item.source.kind).toBe('official-publication')
    }
  })

  it.each([
    { ...first.lesson, frameworkId: 'another-framework' },
    { ...first.lesson, editionId: 'another-edition' },
    { ...first.lesson, controlKey: 'another-control' },
  ])(
    'does not borrow an animation for a partial identity match: %o',
    (lesson) => {
      expect(findVisualExplanation(lesson)).toBeUndefined()
      const { container } = render(<VisualExplanation lesson={lesson} />)
      expect(container).toBeEmptyDOMElement()
    },
  )
})

describe('VisualExplanation playback and alternatives', () => {
  it('waits for a deliberate play and exposes the exact source and complete transcript', () => {
    render(<VisualExplanation lesson={first.lesson} />)
    expect(
      screen.getByRole('button', { name: 'Play explanation' }),
    ).toBeEnabled()
    expect(frames.size).toBe(0)
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0')
    expect(screen.getByText('Visual explanation')).toBeVisible()
    const source = screen.getByRole('link', {
      name: new RegExp(first.sourceLabel.split(' · ')[0]!),
    })
    expect(source).toHaveAttribute('href', first.source.url)
    expect(source).toHaveAttribute('rel', 'noopener noreferrer')
    const transcript = screen
      .getByText('Read the full transcript', { selector: 'summary' })
      .closest('details')!
    fireEvent.click(within(transcript).getByText('Read the full transcript'))
    for (const stage of first.stages) {
      expect(within(transcript).getByText(stage.text)).toBeVisible()
      expect(
        within(transcript).getByText(stage.diagramDescription, {
          exact: false,
        }),
      ).toBeVisible()
    }
  })

  it('advances every 10 seconds, freezes on pause, completes at 40 seconds, and replays', () => {
    const { container } = render(
      <VisualExplanation lesson={visualExplanations[1]!.lesson} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Play explanation' }))
    advance(5_000)
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '5')
    const trace = container.querySelectorAll('.visual-path-traced')[1]!
    expect(Number(trace.getAttribute('stroke-dashoffset'))).toBeGreaterThan(0)
    expect(Number(trace.getAttribute('stroke-dashoffset'))).toBeLessThan(1)
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    const frozen = trace.getAttribute('stroke-dashoffset')
    advance(8_000)
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '5')
    expect(trace).toHaveAttribute('stroke-dashoffset', frozen)
    expect(screen.getByRole('status')).toHaveTextContent('Paused.')
    fireEvent.click(screen.getByRole('button', { name: 'Play explanation' }))
    advance(5_000)
    expect(
      screen.getByRole('button', { name: /Plain meaning/ }),
    ).toHaveAttribute('aria-current', 'step')
    advance(10_000)
    expect(screen.getByRole('button', { name: /Example/ })).toHaveAttribute(
      'aria-current',
      'step',
    )
    advance(10_000)
    expect(screen.getByRole('button', { name: /Takeaway/ })).toHaveAttribute(
      'aria-current',
      'step',
    )
    advance(10_000)
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '40')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Walkthrough complete.',
    )
    expect(frames.size).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: 'Replay explanation' }))
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0')
    expect(screen.getByRole('button', { name: 'Pause' })).toBeEnabled()
  })

  it('offers complete still diagrams when selecting a stage and restarts without autoplay', () => {
    const { container } = render(<VisualExplanation lesson={first.lesson} />)
    fireEvent.click(screen.getByRole('button', { name: /Example/ }))
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '20')
    expect(screen.getByRole('button', { name: /Example/ })).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(container.querySelector('.visual-caption')).toHaveTextContent(
      first.stages[2].text,
    )
    expect(container.querySelector('.visual-stop')).toHaveTextContent('Stop')
    expect(container.querySelector('.visual-path-traced')).toHaveAttribute(
      'stroke-dashoffset',
      '0',
    )
    expect(frames.size).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }))
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0')
    expect(screen.getByRole('button', { name: /Requirement/ })).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(frames.size).toBe(0)
  })

  it('provides a still walkthrough for initial reduced motion and stops when the preference changes', () => {
    reduced = true
    const { container } = render(
      <VisualExplanation lesson={visualExplanations[1]!.lesson} />,
    )
    expect(
      screen.getByRole('button', { name: 'Play explanation' }),
    ).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /Example/ }))
    expect(container.querySelectorAll('.visual-path-traced')).toHaveLength(3)
    for (const path of container.querySelectorAll('.visual-path-traced'))
      expect(path).toHaveAttribute('stroke-dashoffset', '0')
    expect(frames.size).toBe(0)
    changeMotion(false)
    expect(frames.size).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: 'Play explanation' }))
    advance(2_000)
    changeMotion(true)
    expect(frames.size).toBe(0)
    expect(
      screen.getByRole('button', { name: 'Play explanation' }),
    ).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Motion is off.')
    changeMotion(false)
    expect(frames.size).toBe(0)
    expect(screen.getByRole('status')).toHaveTextContent('Motion is available.')
  })

  it('pauses when hidden and requires deliberate resume after returning', () => {
    render(<VisualExplanation lesson={first.lesson} />)
    fireEvent.click(screen.getByRole('button', { name: 'Play explanation' }))
    advance(4_000)
    setHidden(true)
    advance(30_000)
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '4')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Paused while you were away.',
    )
    setHidden(false)
    expect(frames.size).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: 'Play explanation' }))
    advance(1_000)
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '5')
  })

  it('resets playback when lesson identity changes and cleans up frames and listeners', () => {
    const { rerender, unmount } = render(
      <VisualExplanation lesson={first.lesson} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Play explanation' }))
    advance(14_000)
    rerender(<VisualExplanation lesson={visualExplanations[2]!.lesson} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0')
    expect(
      screen.getByRole('button', { name: 'Play explanation' }),
    ).toBeEnabled()
    expect(frames.size).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: 'Play explanation' }))
    unmount()
    expect(frames.size).toBe(0)
    expect(motionListeners.size).toBe(0)
  })
})
