import { useRef } from 'react'
import { ControlRail, type ControlRailProps } from './ControlRail'

/**
 * Below desktop widths the rail is a sheet: an "All controls" line at the top
 * of the page opens it over everything. The sheet is a native dialog, so
 * Escape closes it and focus stays in.
 */
export function RailSheet(props: Omit<ControlRailProps, 'onPick'>) {
  const sheet = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  // A pick moves focus to the control; only a plain close returns it here.
  const picked = useRef(false)
  function close() {
    sheet.current?.close()
  }
  function pick() {
    picked.current = true
    close()
  }
  return (
    <>
      <div className="rail-line">
        <button
          ref={opener}
          type="button"
          className="rail-open"
          onClick={() => {
            sheet.current?.showModal()
            sheet.current?.querySelector('input')?.focus()
          }}
        >
          All controls
        </button>
      </div>
      <dialog
        ref={sheet}
        className="rail-sheet"
        aria-label="All controls"
        onClose={() => {
          if (!picked.current) opener.current?.focus()
          picked.current = false
        }}
      >
        <button type="button" className="rail-close" onClick={close}>
          Close
        </button>
        <ControlRail {...props} onPick={pick} />
      </dialog>
    </>
  )
}
