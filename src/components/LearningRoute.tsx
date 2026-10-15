import { useEffect, useState } from 'react'
import { setPageMeta } from '../seo/page-meta'

type LearningModule = typeof import('./LearningPage')
const loadLearningPage = () => import('./LearningPage')

/** Keep Explorer UI off non-learning pages without changing their address contract. */
export function LearningRoute({
  load = loadLearningPage,
}: {
  readonly load?: () => Promise<LearningModule>
}) {
  const [module, setModule] = useState<LearningModule | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    setPageMeta({ title: 'Learning workspace' })
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
    <section className="about-page page">
      <h1>Learning workspace</h1>
      <p role="status" aria-busy={!failed}>
        {failed
          ? 'The learning workspace could not load. Reload this page to retry, or return home.'
          : 'Loading the control explorer…'}
      </p>
      {failed && (
        <>
          <button
            type="button"
            className="practice-action"
            onClick={() => window.location.reload()}
          >
            Reload this lesson or search
          </button>{' '}
          <a className="text-link" href="/">
            Return home
          </a>
        </>
      )}
    </section>
  )
}
