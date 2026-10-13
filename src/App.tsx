import type { MouseEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { ExplanationMode } from './types/content'
import {
  explorerCatalog,
  defaultLesson,
  glossaryTerms,
  referenceControls,
} from './data/content'
import { createLessonUrl } from './state/explorer-state'
import { useExplorerState } from './state/useExplorerState'
import { Glossary } from './components/Glossary'
import { Brand } from './components/Brand'
import { ControlExplorer } from './components/ControlExplorer'
import { UsageAnalytics } from './analytics/UsageAnalytics'
import { UsagePreferences } from './analytics/UsagePreferences'
import { trackUsage } from './analytics/usage'
import { useControlView } from './analytics/useControlView'

const repositoryUrl = 'https://github.com/WaylandP/Dummy-Down'
const perspectives = [
  {
    mode: 'beginner',
    title: 'Beginner',
    description: 'Start with everyday language and a familiar situation.',
  },
  {
    mode: 'it-cyber',
    title: 'IT & Cyber',
    description: 'Explore an approach, then look for its limitations.',
  },
  {
    mode: 'compliance',
    title: 'Compliance',
    description: 'Read the source and ask better assessment questions.',
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
            GitHub <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </nav>
      </header>
      <main id="main">
        <section
          className="editorial-intro section-shell"
          aria-labelledby="hero-title"
        >
          <div className="intro-copy">
            <p className="intro-kicker">Compliance, translated.</p>
            <h1 id="hero-title">What does this requirement actually mean?</h1>
            <p className="intro-description">
              Plain-English explanations, practical examples, and different
              learning perspectives for cybersecurity requirements. Starting
              with CMMC.
            </p>
          </div>
          <div className="intro-meta">
            <p>Not sure where to start?</p>
            <a
              className="text-link"
              href={sampleUrl('beginner')}
              onClick={(event) => openSample(event, 'beginner')}
            >
              Who can access a system?{' '}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <p>Start with one Level 1 requirement, explained three ways.</p>
          </div>
        </section>
        <ControlExplorer controller={controller} />
        <section
          id="approach"
          className="approach-section section-shell"
          aria-labelledby="approach-title"
        >
          <div className="approach-intro">
            <h2 id="approach-title">One requirement. Three ways in.</h2>
            <p>You can change perspective as you read.</p>
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
                  — Try this perspective in the Control Explorer
                </span>
              </a>
            ))}
          </div>
        </section>
        <Glossary terms={glossaryTerms} />
        <section
          className="mission-section section-shell"
          aria-labelledby="mission-title"
        >
          <h2 id="mission-title">Useful explanations. Honest limits.</h2>
          <div className="mission-copy">
            <p>
              This independent, open-source project currently covers{' '}
              {referenceControls.length} CMMC references from the September 2024
              v2.13 publications. Explanations are educational drafts; qualified
              human review is pending.
            </p>
            <p>
              Other frameworks are planned. They are not learning libraries here
              yet.
            </p>
            <a
              className="text-link"
              href={repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contribute a correction or an idea{' '}
              <ArrowUpRight size={16} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </section>
      </main>
      <footer className="site-footer section-shell">
        <div className="footer-top">
          <Brand />
          <p>Compliance, translated.</p>
          <a
            href={`${repositoryUrl}/blob/main/LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT licensed<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <UsagePreferences />
        <div className="footer-bottom">
          <p>
            Educational material only. No certification, legal advice, or
            guarantee of assessment success.
            <br />
            Independent project. Not affiliated with or endorsed by DoD, NIST,
            or any certification body.
          </p>
        </div>
      </footer>
      <UsageAnalytics />
    </div>
  )
}
