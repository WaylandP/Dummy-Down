import type { MouseEvent } from 'react'
import { ArrowRight, ArrowUpRight, GitFork } from 'lucide-react'
import type { ExplanationMode } from './types/content'
import { explorerCatalog, defaultLesson, glossaryTerms } from './data/content'
import { createLessonUrl } from './state/explorer-state'
import { useExplorerState } from './state/useExplorerState'
import { Glossary } from './components/Glossary'
import { Brand } from './components/Brand'
import { ControlExplorer } from './components/ControlExplorer'
import { Topography } from './components/Topography'
import { UsageAnalytics } from './analytics/UsageAnalytics'
import { UsagePreferences } from './analytics/UsagePreferences'
import { trackUsage } from './analytics/usage'
import { useControlView } from './analytics/useControlView'

const repositoryUrl = 'https://github.com/WaylandP/Dummy-Down'
const perspectives = [
  {
    mode: 'beginner',
    title: 'Beginner',
    description: 'Everyday language. Familiar examples.',
  },
  {
    mode: 'it-cyber',
    title: 'IT & Cyber',
    description: 'Technical context. Practical approaches.',
  },
  {
    mode: 'compliance',
    title: 'Compliance',
    description: 'Source context. Evidence to discuss.',
  },
] satisfies { mode: ExplanationMode; title: string; description: string }[]

export default function App() {
  const controller = useExplorerState(explorerCatalog)
  const mode =
    controller.parsed.kind === 'ready'
      ? controller.parsed.state.mode
      : 'beginner'
  useControlView(
    controller.resolution?.kind === 'lesson'
      ? controller.resolution.control
      : null,
    mode,
  )
  function sampleUrl(perspective: ExplanationMode) {
    return createLessonUrl(
      defaultLesson,
      perspective,
      new URL(window.location.href),
    )
  }
  function openSample(
    event: MouseEvent<HTMLAnchorElement>,
    perspective: ExplanationMode,
  ) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    event.preventDefault()
    trackUsage({ name: 'section_open', section: 'explorer' })
    controller.dispatch({ type: 'open-example', mode: perspective })
    document.getElementById('explorer')?.scrollIntoView?.({ block: 'start' })
  }

  return (
    <div id="top">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header section-shell">
        <Brand />
        <nav aria-label="Main navigation">
          <a
            href="#explorer"
            onClick={() =>
              trackUsage({ name: 'section_open', section: 'explorer' })
            }
          >
            Control Explorer
          </a>
          <a
            href="#approach"
            onClick={() =>
              trackUsage({ name: 'section_open', section: 'approach' })
            }
          >
            Learning modes
          </a>
          <a
            className="glossary-nav"
            href="#glossary"
            onClick={() =>
              trackUsage({ name: 'section_open', section: 'glossary' })
            }
          >
            Glossary
          </a>
          <a
            className="github-link"
            aria-label="Dummy-Down on GitHub (opens in a new tab)"
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitFork size={17} aria-hidden="true" />
            <span>GitHub</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </nav>
      </header>

      <main id="main">
        <div className="hero-stage">
          <Topography />
          <section className="hero section-shell" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="hero-intro">A field guide to cybersecurity.</p>
              <h1 id="hero-title">
                Navigate the <br />
                complexity.
              </h1>
              <p className="hero-description">
                Complex compliance. Dummy-simple explanations.
              </p>
              <p className="hero-support">
                Find your footing with plain-English explanations of security
                controls. Learn at your level, one concept at a time.
              </p>
              <div className="hero-actions">
                <a
                  className="button button-primary"
                  href={`/?view=discover&catalog=cmmc&collection=references&mode=${mode}#explorer`}
                  onClick={() =>
                    trackUsage({ name: 'section_open', section: 'explorer' })
                  }
                >
                  Explore CMMC controls{' '}
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
                <span className="hero-access">
                  Free to explore. No account needed.
                </span>
              </div>
            </div>
            <div className="hero-footer">
              <div className="hero-scope">
                <span className="scope-marker" aria-hidden="true" />
                <span>
                  CMMC first.
                  <br />
                  <span>More frameworks on the horizon.</span>
                </span>
              </div>
              <a
                href={sampleUrl(mode)}
                onClick={(event) => openSample(event, mode)}
                className="hero-start"
                aria-label="Start with the draft authorized-access example"
              >
                <span className="start-label">Your starting point</span>
                <span>
                  <span className="start-code">AC.L2-3.1.1</span> Authorized
                  access <ArrowRight size={17} aria-hidden="true" />
                </span>
                <span className="start-status">Draft educational example</span>
              </a>
            </div>
          </section>
        </div>

        <section
          id="approach"
          className="approach-section section-shell"
          aria-labelledby="approach-title"
        >
          <div className="approach-intro">
            <h2 id="approach-title">Find your perspective.</h2>
            <p>The same concept, explained for you.</p>
          </div>
          <div className="perspective-list">
            {perspectives.map((item) => (
              <a
                key={item.mode}
                className="perspective-link"
                href={sampleUrl(item.mode)}
                onClick={(event) => openSample(event, item.mode)}
              >
                <span className="perspective-title">
                  {item.title} <ArrowUpRight size={16} aria-hidden="true" />
                </span>{' '}
                <span className="perspective-description">
                  {item.description}
                </span>{' '}
                <span className="sr-only">
                  {' '}
                  — Try this perspective in the Control Explorer
                </span>
              </a>
            ))}
          </div>
        </section>

        <ControlExplorer controller={controller} />
        <Glossary terms={glossaryTerms} />

        <section
          className="mission-section section-shell"
          aria-labelledby="mission-title"
        >
          <div>
            <p className="section-caption">Built in the open</p>
            <h2 id="mission-title">
              Understanding is
              <br />a shared mission.
            </h2>
          </div>
          <div className="mission-copy">
            <p>
              Dummy-Down is an independent, open-source project. We’re starting
              with 149 CMMC source references across all three levels and draft
              explanations for each perspective. The catalog follows the
              September 2024 v2.13 publications. Teaching content grows through
              careful review.
            </p>
            <p className="roadmap-note">
              On the roadmap: reviewed CMMC content, NIST SP 800-53, FedRAMP,
              SOC 2, ISO 27001, HIPAA, and interactive learning.
            </p>
            <a
              className="text-link"
              href={repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore the project on GitHub{' '}
              <ArrowUpRight size={16} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer section-shell">
        <UsagePreferences />
        <div className="footer-top">
          <Brand />
          <p>Make cybersecurity make sense.</p>
          <a
            href={`${repositoryUrl}/blob/main/LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT licensed<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <div className="footer-bottom">
          <p>
            Educational material only. No certification, legal advice, or
            guarantee of assessment success.
            <br />
            Independent project. Not affiliated with or endorsed by DoD, NIST,
            or any certification body.
          </p>
          <span>Stay curious.</span>
        </div>
      </footer>
      <UsageAnalytics />
    </div>
  )
}
