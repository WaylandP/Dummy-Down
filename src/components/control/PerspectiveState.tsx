import type { PerspectiveDraftState } from './usePerspectiveDraft'

/** The same words every tab uses while the drafts are not on screen. */
export function PerspectiveState({
  state,
}: {
  readonly state: Exclude<PerspectiveDraftState, { status: 'ready' }>
}) {
  return (
    <div
      className="perspective-pending"
      role={state.status === 'pending' ? undefined : 'status'}
      aria-busy={state.status === 'loading'}
    >
      {state.status === 'loading' && <p>Loading teaching perspectives…</p>}
      {state.status === 'failed' && (
        <>
          <p>
            The teaching perspectives could not load. You can still read the
            requirement and sources.
          </p>
          <button
            className="inline-action"
            type="button"
            onClick={() => window.location.reload()}
          >
            Reload page to retry
          </button>
        </>
      )}
      {state.status === 'pending' && (
        <>
          <p className="hand">Teaching explanations are pending.</p>
          <p>
            This publication entry has no teaching draft for this exact
            framework and edition. Consult its cited assessment guide.
          </p>
        </>
      )}
    </div>
  )
}
