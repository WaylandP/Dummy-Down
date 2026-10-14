import { useEffect, useState } from 'react'

type PracticeModule = typeof import('./PracticePage')

export function PracticeRoute() {
  const [module, setModule] = useState<PracticeModule | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    import('./PracticePage')
      .then((loaded) => {
        if (active) setModule(loaded)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [])
  if (module) {
    const Page = module.default
    return <Page />
  }
  return (
    <section className="section-shell practice-page">
      <h1>The practice room</h1>
      <p role="status" aria-busy={!failed}>
        {failed
          ? 'The practice index could not load. Your lessons are still available.'
          : 'Loading practice activities…'}
      </p>
      {failed && (
        <>
          <button
            type="button"
            className="practice-action"
            onClick={() => window.location.reload()}
          >
            Reload practice
          </button>{' '}
          <a href="/learn?view=discover&collection=references">
            Browse controls
          </a>
        </>
      )}
    </section>
  )
}
