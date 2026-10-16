import { act, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { rowFade, useScrollFade } from './scroll-row'

function Row({ children }: { readonly children: string }) {
  const row = useRef<HTMLDivElement>(null)
  const fade = useScrollFade(row)
  return (
    <div ref={row} data-testid="row" data-fade={fade}>
      {children}
    </div>
  )
}

/** jsdom lays nothing out: the test says how wide the row and its content are. */
function size(
  element: HTMLElement,
  sizes: { scrollWidth: number; clientWidth: number; scrollLeft?: number },
) {
  Object.defineProperty(element, 'scrollWidth', {
    configurable: true,
    get: () => sizes.scrollWidth,
  })
  Object.defineProperty(element, 'clientWidth', {
    configurable: true,
    get: () => sizes.clientWidth,
  })
  Object.defineProperty(element, 'scrollLeft', {
    configurable: true,
    get: () => sizes.scrollLeft ?? 0,
    set: (value: number) => {
      sizes.scrollLeft = value
    },
  })
}

describe('a row that scrolls instead of wrapping', () => {
  it('fades the edge that hides more of the row, and neither when it all fits', () => {
    expect(rowFade({ scrollLeft: 0, scrollWidth: 300, clientWidth: 300 })).toBe(
      'none',
    )
    expect(rowFade({ scrollLeft: 0, scrollWidth: 360, clientWidth: 300 })).toBe(
      'end',
    )
    expect(
      rowFade({ scrollLeft: 30, scrollWidth: 360, clientWidth: 300 }),
    ).toBe('both')
    expect(
      rowFade({ scrollLeft: 60, scrollWidth: 360, clientWidth: 300 }),
    ).toBe('start')
  })

  it('keeps the fade current as the row scrolls and as the screen changes', () => {
    render(<Row>Home Controls Glossary Practice Timeline About</Row>)
    const row = screen.getByTestId('row')
    expect(row).toHaveAttribute('data-fade', 'none')
    const sizes = { scrollWidth: 360, clientWidth: 280, scrollLeft: 0 }
    size(row, sizes)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(row).toHaveAttribute('data-fade', 'end')
    sizes.scrollLeft = 80
    act(() => {
      row.dispatchEvent(new Event('scroll'))
    })
    expect(row).toHaveAttribute('data-fade', 'start')
    sizes.clientWidth = 360
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(row).toHaveAttribute('data-fade', 'none')
  })
})
