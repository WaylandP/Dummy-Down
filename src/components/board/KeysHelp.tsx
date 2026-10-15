import { useEffect, useRef } from 'react'
import { boardKeys } from './keys'

/** The keys, on request. Escape or the button closes it; focus goes back where it was. */
export function KeysHelp({ onClose }: { readonly onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null)
  const closeNow = useRef(onClose)
  useEffect(() => {
    closeNow.current = onClose
  })
  useEffect(() => {
    const opener = document.activeElement
    close.current?.focus()
    // Escape closes wherever focus is, even after a tap on the dialog's text.
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      closeNow.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [])
  return (
    <div className="keys-help-backdrop" onClick={onClose}>
      <div
        className="keys-help"
        role="dialog"
        aria-modal="true"
        aria-labelledby="keys-help-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => {
          // A press on the text must not move focus to the page behind.
          const target = event.target
          if (target instanceof Element && !target.closest('button'))
            event.preventDefault()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Tab') {
            // Close is the only control, so focus stays on it.
            event.preventDefault()
            close.current?.focus()
          }
        }}
      >
        <h2 id="keys-help-title" className="chalk">
          Keys
        </h2>
        <dl className="keys-list">
          {boardKeys.map((entry) => (
            <div key={entry.does}>
              <dt>
                {entry.keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </dt>
              <dd>{entry.does}</dd>
            </div>
          ))}
        </dl>
        <button
          ref={close}
          type="button"
          className="control-action keys-close"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}
