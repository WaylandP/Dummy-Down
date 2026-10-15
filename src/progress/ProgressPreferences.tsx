import { useRef } from 'react'
import { useLocalProgress } from './useLocalProgress'

export function ProgressPreferences() {
  const statusRef = useRef<HTMLParagraphElement>(null)
  const { mode, entries, discarded, deletionUnconfirmed, store } =
    useLocalProgress()
  const hasProgress = Object.keys(entries).length > 0
  const message =
    mode === 'loading'
      ? 'Checking this browser’s learning setting…'
      : mode === 'on'
        ? 'Saving is on for versioned activities on this browser.'
        : mode === 'browser-preference'
          ? 'Your browser privacy signal is on. Optional saving is disabled; practice still works on this page.'
          : mode === 'unavailable'
            ? 'Browser storage is unavailable. Practice still works; changes stay on this page.'
            : 'Saving is off. Practice stays on this page until you leave.'
  return (
    <details className="practice-disclosure progress-preferences">
      <summary>Learning progress on this browser</summary>
      <p>
        Saving is optional. It keeps visited activities, checked answer choices,
        your current question, completion and “revisit” marks, and the control
        you opened last, in this browser profile. It stores catalog identifiers,
        content versions and flags, not free text or visit times. Anyone using
        this profile can see the saved practice.
      </p>
      <p>
        No account or synchronization is involved. The app does not send this
        progress to analytics. This setting does not change usage measurement.
        Your browser can remove saved data, and an edited activity may reset its
        saved practice.
      </p>
      <p ref={statusRef} role="status" aria-live="polite" tabIndex={-1}>
        {message}
      </p>
      {discarded && (
        <p>
          Some saved practice was reset because its content changed or stored
          data was invalid.
        </p>
      )}
      {deletionUnconfirmed && (
        <p role="alert">
          This page stopped saving, but the browser did not confirm deletion.
          Saved data may remain. Try deleting again or clear this site’s data in
          your browser settings.
        </p>
      )}
      <div className="practice-actions">
        {mode !== 'on' && (
          <button
            className="practice-action"
            type="button"
            disabled={mode === 'loading' || mode === 'browser-preference'}
            onClick={() => {
              if (store.enable()) statusRef.current?.focus()
            }}
          >
            {mode === 'unavailable'
              ? 'Try saving on this browser again'
              : 'Save learning on this browser'}
          </button>
        )}
        <button
          className="practice-action practice-secondary"
          type="button"
          disabled={mode === 'loading'}
          onClick={() => store.deleteAndDisable()}
        >
          Delete progress and stop saving
        </button>
      </div>
      {hasProgress && (
        <p className="practice-context">
          Deleting resets this page’s practice too. You can enable saving again
          whenever you choose.
        </p>
      )}
    </details>
  )
}
