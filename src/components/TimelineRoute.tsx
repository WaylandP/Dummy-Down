import { useEffect, useState } from 'react'

type TimelineModule = typeof import('./TimelinePage')
const loadTimelinePage = () => import('./TimelinePage')

/** The timeline loads on its own, like Practice and Coverage; a failed chunk says so and offers a reload. */
export function TimelineRoute({
  load = loadTimelinePage,
}: {
  readonly load?: () => Promise<TimelineModule>
}) {
  const [module, setModule] = useState<TimelineModule | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    load()
      .then((loaded) => {
        if (active) setModule(loaded)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [load])
  if (module) {
    const Page = module.default
    return <Page />
  }
  return (
    <div className="timeline-page page">
      <h1 className="chalk">The dates that matter.</h1>
      <p role="status" aria-busy={!failed}>
        {failed
          ? 'The timeline could not load. The rest of the site is still available.'
          : 'Loading the timeline…'}
      </p>
      {failed && (
        <button
          type="button"
          className="line-action"
          onClick={() => window.location.reload()}
        >
          Reload the timeline
        </button>
      )}
    </div>
  )
}
