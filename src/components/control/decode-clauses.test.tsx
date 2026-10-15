import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { referenceControls } from '../../data/content'
import { clauseMapFor } from '../../data/cmmc-clause-map'
import { DecodeTab } from './DecodeTab'

function control(id: string) {
  const found = referenceControls.find((item) => item.id === id)
  if (!found) throw new Error(`Missing control ${id}`)
  return found
}

/** The quotation's text is the sentence alone: the letters are drawn from an attribute. */
function quotation(blockquote: HTMLElement) {
  return blockquote.textContent
}

describe('The requirement sentence, decoded', () => {
  it('underlines each mapped clause with the letters of the objectives it produces', () => {
    const mapped = control('AC.L1-b.1.i')
    render(<DecodeTab control={mapped} />)
    const sentence = screen.getByText(/Limit information system access/, {
      selector: 'blockquote',
    })
    expect(quotation(sentence)).toBe(mapped.requirement.text)
    const clauses = [...sentence.querySelectorAll('.decode-clause')]
    expect(clauses.map((clause) => clause.textContent)).toEqual([
      'authorized users',
      'processes acting on behalf of authorized users',
      'devices (including other information systems)',
    ])
    expect(clauses.map((clause) => clause.getAttribute('data-stroke'))).toEqual(
      ['0', '1', '2'],
    )
    for (const clause of clauses) {
      expect(clause.nextElementSibling).toHaveClass('decode-letters', 'hand')
      expect(clause.nextElementSibling).toHaveAttribute('aria-hidden', 'true')
    }
    expect(
      [...sentence.querySelectorAll('.decode-letters')].map((letters) =>
        letters.getAttribute('data-letters'),
      ),
    ).toEqual(['a d', 'b e', 'c f'])
    expect(sentence.querySelector('.decode-letters')).toBeEmptyDOMElement()
    expect(
      screen.getByText(/Clauses and the objectives they produce/),
    ).toHaveTextContent(
      'authorized users: a, d; processes acting on behalf of authorized users: b, e; devices (including other information systems): c, f.',
    )
    // Every letter names an objective listed under the sentence.
    const listed = [...document.querySelectorAll('.objective-label')].map(
      (label) => label.textContent,
    )
    for (const span of clauseMapFor(mapped))
      for (const letter of span.letters) expect(listed).toContain(`[${letter}]`)
  })

  it('shows the sentence plain, with no underlines, where no clean map exists', () => {
    const plain = control('AC.L1-b.1.iv')
    expect(clauseMapFor(plain)).toEqual([])
    render(<DecodeTab control={plain} />)
    const sentence = screen.getByText(plain.requirement.text, {
      selector: 'blockquote',
    })
    expect(sentence.querySelector('.decode-clause')).toBeNull()
    expect(sentence.querySelector('.decode-letters')).toBeNull()
    expect(screen.queryByText(/Clauses and the objectives/)).toBeNull()
  })

  it('shows the sentence plain when a mapped clause is not found in it', async () => {
    vi.doMock('../../data/cmmc-clause-map', async (importOriginal) => {
      const original =
        await importOriginal<typeof import('../../data/cmmc-clause-map')>()
      return {
        ...original,
        clauseMapFor: () => [{ text: 'not in this sentence', letters: ['a'] }],
      }
    })
    vi.resetModules()
    const { DecodeTab: Stubbed } = await import('./DecodeTab')
    const item = control('AC.L1-b.1.i')
    render(<Stubbed control={item} />)
    const sentence = screen.getByText(item.requirement.text, {
      selector: 'blockquote',
    })
    expect(sentence.querySelector('.decode-clause')).toBeNull()
    expect(screen.queryByText(/Clauses and the objectives/)).toBeNull()
    vi.doUnmock('../../data/cmmc-clause-map')
    vi.resetModules()
  })

  it('keeps the quotation verbatim for every mapped control', () => {
    for (const item of referenceControls) {
      if (clauseMapFor(item).length === 0) continue
      const { unmount } = render(<DecodeTab control={item} />)
      const sentence = document.querySelector('blockquote.decode-sentence')!
      expect(quotation(sentence as HTMLElement)).toBe(item.requirement.text)
      unmount()
    }
  })
})
