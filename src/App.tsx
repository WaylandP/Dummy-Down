import { useEffect, useSyncExternalStore } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { defaultLesson, glossaryTerms, referenceControls } from './data/content'
import { createLessonUrl } from './state/explorer-state'
import { sitePage } from './state/site-page'
import type { ExplanationMode } from './types/content'
import { Glossary } from './components/Glossary'
import { Brand } from './components/Brand'
import { CoverageRoute } from './components/CoverageRoute'
import { PracticeRoute } from './components/PracticeRoute'
import { StudyHome } from './components/StudyHome'
import { LearningRoute } from './components/LearningRoute'
import { UsageAnalytics } from './analytics/UsageAnalytics'
import { UsagePreferences } from './analytics/UsagePreferences'
import { trackUsage } from './analytics/usage'
import { LocalProgressProvider } from './progress/LocalProgressProvider'
import { learningActivities } from './data/learning'
import { setPageMeta } from './seo/page-meta'

const repositoryUrl = 'https://github.com/WaylandP/cipher-and-chalk'
const browseUrl = '/learn?view=discover&collection=references'
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

function sampleUrl(mode: ExplanationMode) {
  return createLessonUrl(
    defaultLesson,
    mode,
    new URL('/learn', window.location.origin),
  )
}
function subscribePage(listener: () => void) {
  window.addEventListener('popstate', listener)
  window.addEventListener('hashchange', listener)
  return () => {
    window.removeEventListener('popstate', listener)
    window.removeEventListener('hashchange', listener)
  }
}
function currentPage() {
  return sitePage(new URL(window.location.href))
}

function Application() {
  const page = useSyncExternalStore(subscribePage, currentPage)
  useEffect(() => {
    if (page !== 'learn') {
      const meta = {
        home: {
          title: 'Home',
          description:
            'Search every CMMC control, read it from three perspectives, and practice with short situations. Open source and free.',
          canonicalPath: '/',
        },
        glossary: {
          title: 'Glossary',
          description:
            'Plain-language definitions of the terms used in CMMC lessons, with sources.',
          canonicalPath: '/glossary',
        },
        about: {
          title: 'About',
          description:
            'Why Cipher & Chalk exists, how its CMMC explanations are written and reviewed, and how to help.',
          canonicalPath: '/about',
        },
        coverage: {
          title: 'Assessment objectives',
          description:
            'All 468 CMMC assessment objectives from the Level 1–3 guides, searchable by control and linked to the explanation that covers each one.',
          canonicalPath: '/coverage',
        },
        practice: {
          title: 'Practice',
          description:
            'Short fictional situations that check your understanding of specific CMMC controls, with explained answers.',
          canonicalPath: '/practice',
        },
        'not-found': { title: 'Page not found' },
      }[page]
      setPageMeta(meta)
    }
    // On a native page load, the browser can resolve the fragment before React
    // mounts its target. Honor an explicit skip link once the main exists.
    if (window.location.hash === '#main') {
      document.getElementById('main')?.focus()
    }
  }, [page])
  return (
    <div id="top" className={`site-page page-${page}`}>
      <a
        className="skip-link"
        href={
          window.location.pathname === '/' &&
          window.location.hash !== '#main' &&
          page !== 'home' &&
          page !== 'not-found'
            ? `/${page}${page === 'learn' ? window.location.search : ''}#main`
            : '#main'
        }
      >
        Skip to content
      </a>
      <header className="site-header section-shell">
        <Brand />
        <nav aria-label="Main navigation">
          <a
            href={browseUrl}
            aria-current={page === 'learn' ? 'page' : undefined}
            onClick={() =>
              trackUsage({ name: 'section_open', section: 'explorer' })
            }
          >
            Learn
          </a>
          <a
            href="/glossary"
            aria-current={page === 'glossary' ? 'page' : undefined}
            onClick={() =>
              trackUsage({ name: 'section_open', section: 'glossary' })
            }
          >
            Glossary
          </a>
          <a
            href="/practice"
            aria-current={page === 'practice' ? 'page' : undefined}
          >
            Practice
          </a>
          <a
            href="/coverage"
            aria-current={page === 'coverage' ? 'page' : undefined}
          >
            Coverage
          </a>
          <a href="/about" aria-current={page === 'about' ? 'page' : undefined}>
            About
          </a>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        {page === 'home' && <StudyHome />}
        {page === 'coverage' && <CoverageRoute />}
        {page === 'practice' && <PracticeRoute />}
        {page === 'learn' && <LearningRoute />}
        {page === 'glossary' && (
          <>
            <h1 className="page-title section-shell">The wordbook.</h1>
            <Glossary terms={glossaryTerms} />
          </>
        )}
        {page === 'about' && (
          <div className="about-page section-shell">
            <section id="about" aria-labelledby="mission-title">
              <p className="home-kicker">About Cipher &amp; Chalk</p>
              <h1 id="mission-title">
                A little clarity
                <br /> goes a long way.
              </h1>
              <p>
                Cybersecurity requirements can be hard to read. We unpack the
                language, explain the idea, and use everyday examples to help it
                stick.
              </p>
              <p>
                This independent, open-source project covers{' '}
                {referenceControls.length} CMMC references from the September
                2024 v2.13 publications. Explanations are educational drafts;
                qualified human review is pending.
              </p>
              <p>
                Other frameworks are planned. They are not learning libraries
                here yet.
              </p>
            </section>
            <section id="approach" aria-labelledby="approach-title">
              <h2 id="approach-title">Choose your starting point.</h2>
              <p>
                Switch perspective inside any control. The source stays
                alongside the explanation.
              </p>
              <div className="perspective-list">
                {perspectives.map((item) => (
                  <a
                    className="perspective-link"
                    key={item.mode}
                    href={sampleUrl(item.mode)}
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
        )}
        {page === 'not-found' && (
          <section className="about-page section-shell">
            <h1>This board is blank.</h1>
            <p>
              That page isn’t available. You can still browse the learning
              material.
            </p>
            <a className="button button-primary" href={browseUrl}>
              Explore the controls
            </a>
          </section>
        )}
      </main>
      <footer className="site-footer section-shell">
        <div className="footer-top">
          <p>Understand the idea. Keep asking questions.</p>
          <a
            href={`${repositoryUrl}/blob/main/LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open source · MIT
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <UsagePreferences />
        <p className="footer-disclaimer">
          Independent educational drafts. Not legal advice or a guarantee of
          compliance.
          <br />
          Not affiliated with or endorsed by DoD, NIST, or any certification
          body.
        </p>
      </footer>
      <UsageAnalytics />
    </div>
  )
}

export default function App() {
  return (
    <LocalProgressProvider activities={learningActivities}>
      <Application />
    </LocalProgressProvider>
  )
}
