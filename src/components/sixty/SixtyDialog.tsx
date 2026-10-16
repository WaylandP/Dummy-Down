import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cueSmudge } from '../board/tray-state'
import { SixtyPlayer } from './SixtyPlayer'
import { useSixtyPlayer } from './useSixtyPlayer'

const motionQuery = '(prefers-reduced-motion: reduce)'

/** Whether the visitor asked for less motion, now and as it changes. */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.(motionQuery).matches ?? false,
  )
  useEffect(() => {
    const preference = window.matchMedia?.(motionQuery)
    if (!preference) return
    const changed = (event: MediaQueryListEvent) => setReduced(event.matches)
    preference.addEventListener('change', changed)
    return () => preference.removeEventListener('change', changed)
  }, [])
  return reduced
}

interface SixtyDialogProps {
  /** The dialog has closed: Escape, Close, or the drawing's own link. */
  readonly onClose: () => void
}

/**
 * The full animation in a modal dialog: a native dialog, so the page behind
 * is inert and focus stays in, opened as it mounts and playing from 0:00.
 * Its keys (Space, K, the arrows, Home, End, Page Up and Page Down) work
 * only while focus is inside it, and the site's own keys wait while it is
 * open, since they ignore an open dialog. Escape closes it, unless a
 * glossary popover is open in the caption, which takes the key first. When
 * the drawing reaches 1:00, Smudge sweeps.
 */
export function SixtyDialog({ onClose }: SixtyDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const reduced = useReducedMotion()
  const { root, player } = useSixtyPlayer({
    reduced,
    onEnded: () => cueSmudge('sweep'),
  })

  // Shown before the board reads itself, so its strokes have lengths and
  // its labels have boxes; focus starts on the pause button.
  useLayoutEffect(() => {
    const element = dialog.current
    if (!element) return
    if (!element.open) element.showModal()
    element.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  }, [])

  function close() {
    dialog.current?.close()
  }

  return (
    <dialog
      ref={dialog}
      className="sixty-dialog"
      aria-labelledby={`${player.id}-title`}
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          // One way to close, ours, so a popover's Escape never closes both.
          event.preventDefault()
          if (dialog.current?.querySelector('.chalk-popover')) return
          event.stopPropagation()
          close()
          return
        }
        player.onKeyDown(event)
      }}
    >
      <div ref={root} className="sixty-stage">
        <div className="sixty-head">
          <button type="button" className="sixty-close" onClick={close}>
            Close
          </button>
        </div>
        <SixtyPlayer player={player} />
      </div>
    </dialog>
  )
}
