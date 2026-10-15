import { useRef } from 'react'
import { explorerCatalog } from '../../data/content'
import {
  createLessonUrl,
  lessonIdentity,
  pathControls,
  pathIndex,
} from '../../state/explorer-state'
import { plainClick } from '../families'
import { ControlRail, type ControlRailProps } from './ControlRail'

/**
 * Below desktop widths the rail is a sheet: an "All controls" line at the top
 * of the page opens it over everything, and "Start here" stays visible as one
 * line. The sheet is a native dialog, so Escape closes it and focus stays in.
 */
export function RailSheet(props: Omit<ControlRailProps, 'onPick'>) {
  const sheet = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  // A pick moves focus to the control; only a plain close returns it here.
  const picked = useRef(false)
  const { state, onFollowPath } = props
  const path = pathControls('basics', explorerCatalog)
  const onPathAt =
    state.view === 'lesson' && state.path
      ? pathIndex('basics', state.lesson, explorerCatalog)
      : -1
  const pathStart = onPathAt >= 0 ? path[onPathAt]! : path[0]!
  const pathHref = createLessonUrl(
    lessonIdentity(pathStart),
    state.mode,
    new URL('/learn', window.location.origin),
    'decode',
    'basics',
  ).replace(window.location.origin, '')
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
        <a
          className="rail-line-path"
          href={pathHref}
          aria-current={onPathAt >= 0 ? 'true' : undefined}
          onClick={(event) => {
            if (!plainClick(event)) return
            event.preventDefault()
            onFollowPath(pathStart)
          }}
        >
          <span className="hand">Start here</span>
          {onPathAt >= 0 && (
            <span className="rail-line-count">
              {' '}
              · {onPathAt + 1} of {path.length}
            </span>
          )}
        </a>
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
