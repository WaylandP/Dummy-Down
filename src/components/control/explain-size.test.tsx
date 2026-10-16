import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { referenceControls } from '../../data/content'
import { findCmmcPerspective } from '../../data/cmmc-perspectives'
import type { ExplanationMode } from '../../types/content'
import { ExplainTab } from './ExplainTab'

function explanation(id: string, mode: ExplanationMode) {
  const control = referenceControls.find((item) => item.id === id)
  if (!control) throw new Error('Expected a catalog fixture')
  const draft = findCmmcPerspective(control)
  if (!draft) throw new Error('Expected teaching draft coverage')
  const first =
    mode === 'beginner'
      ? draft.beginner.meaning
      : mode === 'it-cyber'
        ? draft.technical.focus
        : draft.compliance.focus
  const { container } = render(
    <ExplainTab
      control={control}
      draft={{ status: 'ready', draft }}
      mode={mode}
      onModeChange={() => {}}
      idPrefix="test"
    />,
  )
  const text = container.querySelector('.explain-text')
  if (!text) throw new Error('Expected the explanation')
  return { length: first.length, size: text.getAttribute('data-size') }
}

/** The explanation is 28px; past about 220 characters it steps to 24px, past 330 to 21px, past 400 to 19px. */
function expectedSize(length: number) {
  return length > 400 ? 'xs' : length > 330 ? 's' : length > 220 ? 'm' : null
}

describe('A long explanation steps its size down', () => {
  it.each([
    ['IA.L2-3.5.3', 'beginner'],
    ['AU.L2-3.3.7', 'compliance'],
    ['IA.L2-3.5.10', 'it-cyber'],
    ['IA.L2-3.5.7', 'beginner'],
    ['IR.L2-3.6.1', 'it-cyber'],
    ['AC.L1-b.1.i', 'beginner'],
    ['SC.L2-3.13.8', 'compliance'],
  ] as const)('sizes %s (%s) by the length of its first block', (id, mode) => {
    const { length, size } = explanation(id, mode)
    expect(size).toBe(expectedSize(length))
  })

  it('keeps the full size for a short explanation and steps down for the longest', () => {
    expect(explanation('SC.L2-3.13.8', 'compliance').size).toBeNull()
    expect(explanation('IA.L2-3.5.3', 'beginner').size).toBe('xs')
    expect(explanation('IR.L2-3.6.1', 'it-cyber').size).toBe('s')
  })
})
