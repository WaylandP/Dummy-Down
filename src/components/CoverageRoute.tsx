import { useEffect, useState } from 'react'

type CoverageModule = typeof import('./CoveragePage')

/** The source inventory and mapping data load only when this page is visited. */
export function CoverageRoute() {
  const [module, setModule] = useState<CoverageModule | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    import('./CoveragePage')
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
    <section className="coverage-page section-shell">
      <h1>Assessment coverage</h1>
      <p role="status" aria-busy={!failed}>
        {failed
          ? 'The coverage report could not load. Your lessons are still available.'
          : 'Loading the coverage report…'}
      </p>
      {failed && (
        <>
          <button
            className="button button-primary"
            type="button"
            onClick={() => window.location.reload()}
          >
            Reload report
          </button>{' '}
          <a
            className="text-link"
            href="/learn?view=discover&collection=references"
          >
            Browse lessons
          </a>
        </>
      )}
    </section>
  )
}
