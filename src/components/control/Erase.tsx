import { Component, createRef, type ReactNode } from 'react'
import { cueSmudge } from '../board/tray-state'

interface EraseProps {
  /** The erase runs when this changes: one control replaced by another. */
  readonly subject: string
  readonly children: ReactNode
}

/** Where the change would be a cut anyway, no dust is made at all. */
const cut = '(prefers-reduced-motion: reduce), (forced-colors: active)'

/**
 * The board is erased between controls: the last control's chalk sweeps off
 * as dust while the next is already on the board, with focus and the
 * announcement exactly as before. The dust is a copy of the old markup laid
 * over the new one at the old height, hidden from assistive technology and
 * inert, gone when its 400 ms are up. A class, because only
 * getSnapshotBeforeUpdate sees the old markup before React replaces it.
 */
export class Erase extends Component<EraseProps> {
  private frame = createRef<HTMLDivElement>()
  private dust: HTMLElement | null = null
  private timer = 0

  override getSnapshotBeforeUpdate(previous: EraseProps): HTMLElement | null {
    if (previous.subject === this.props.subject) return null
    if (window.matchMedia?.(cut).matches) return null
    const board = this.frame.current?.querySelector(
      ':scope > :not(.erase-dust)',
    )
    if (!(board instanceof HTMLElement)) return null
    const dust = board.cloneNode(true) as HTMLElement
    // The old geometry, read in the one phase that still has it.
    dust.style.height = `${board.offsetHeight}px`
    for (const node of [dust, ...dust.querySelectorAll('[id]')])
      node.removeAttribute('id')
    for (const node of dust.querySelectorAll('.chalk-popover, .share-fallback'))
      node.remove()
    dust.setAttribute('aria-hidden', 'true')
    dust.setAttribute('inert', '')
    dust.classList.add('erase-dust')
    return dust
  }

  override componentDidUpdate(
    _previous: EraseProps,
    _state: unknown,
    dust: HTMLElement | null,
  ) {
    const frame = this.frame.current
    if (!dust || !frame) return
    this.settle()
    this.dust = dust
    frame.append(dust)
    dust.addEventListener('animationend', this.onAnimationEnd)
    this.timer = window.setTimeout(this.settle, 600)
    cueSmudge('sweep')
  }

  override componentWillUnmount() {
    this.settle()
  }

  /** A descendant's own animation must not end the sweep early. */
  private onAnimationEnd = (event: Event) => {
    if (event.target === this.dust) this.settle()
  }

  private settle = () => {
    window.clearTimeout(this.timer)
    this.dust?.removeEventListener('animationend', this.onAnimationEnd)
    this.dust?.remove()
    this.dust = null
  }

  override render() {
    return (
      <div className="erase-frame" ref={this.frame}>
        {this.props.children}
      </div>
    )
  }
}
