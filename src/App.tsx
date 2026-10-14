import { useEffect, useSyncExternalStore } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { defaultLesson, glossaryTerms, referenceControls } from './data/content'
import { createLessonUrl } from './state/explorer-state'
import { sitePage } from './state/site-page'
import type { ExplanationMode } from './types/content'
import { Glossary } from './components/Glossary'
import { BoardDefs, BoardDust, BoardGround } from './components/board/BoardDefs'
import { SiteHeader, browseUrl } from './components/board/SiteHeader'
import { SiteFooter } from './components/board/SiteFooter'
import { ChalkTray, TrayLegend } from './components/board/ChalkTray'
import { CoverageRoute } from './components/CoverageRoute'
import { PracticeRoute } from './components/PracticeRoute'
import { Home } from './components/Home'
import { DisclaimerPage } from './components/DisclaimerPage'
import { LearningRoute } from './components/LearningRoute'
import { UsageAnalytics } from './analytics/UsageAnalytics'
import { LocalProgressProvider } from './progress/LocalProgressProvider'
import { learningActivities } from './data/learning'
import { setPageMeta } from './seo/page-meta'

const repositoryUrl = 'https://github.com/WaylandP/cipher-and-chalk'
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
        disclaimer: {
          title: 'Disclaimer & terms of use',
          description:
            'What Cipher & Chalk is and is not: an independent educational project, not official guidance or professional advice.',
          canonicalPath: '/disclaimer',
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
    <div id="top" className={`board-page site-page page-${page}`}>
      <BoardDefs />
      <BoardGround />
      <BoardDust />
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
      <SiteHeader page={page} />
      <main id="main" className="board-main" tabIndex={-1}>
        {page === 'home' && <Home />}
        {page === 'coverage' && <CoverageRoute />}
        {page === 'disclaimer' && <DisclaimerPage />}
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
                Cybersecurity requirements can be hard to read. Cipher &amp;
                Chalk keeps the official sentence on the page and then says, in
                plain words, what it is asking for.
              </p>
              <p>
                This independent, open-source project covers all{' '}
                {referenceControls.length} CMMC controls from the September 2024
                v2.13 publications. Each one carries the official requirement,
                quoted word for word with its page citation, and three
                perspectives written to explain it.
              </p>
            </section>
            <section id="what-cmmc-is" aria-labelledby="cmmc-title">
              <h2 id="cmmc-title">CMMC in one paragraph.</h2>
              <p>
                The Cybersecurity Maturity Model Certification is how the
                Department of Defense checks that its contractors protect the
                information it shares with them. Level 1 covers 15 basic
                safeguards for Federal Contract Information and is
                self-assessed. Level 2 covers the 110 requirements of NIST SP
                800-171 for Controlled Unclassified Information and is either
                self-assessed or assessed by a certified third party. Level 3
                adds 24 enhanced requirements and is assessed by the Government.
                The requirements come from existing standards; what CMMC adds is
                the assessment, the status recorded in SPRS, and the contract
                clause that requires it. The <a href="/glossary">glossary</a>{' '}
                defines every term in that paragraph.
              </p>
            </section>
            <section id="who-makes-this" aria-labelledby="author-title">
              <h2 id="author-title">Who makes this.</h2>
              <p>
                I’m Wayland. I work in IT and compliance, and CMMC Level 2 is
                part of my day job: the system security plan, the policies, the
                evidence, and the meetings where a technical person and an
                assessor use the same word to mean different things. I started
                Cipher &amp; Chalk because the explanation I kept wishing
                existed didn’t: one that respects the source, speaks to the
                person reading it, and doesn’t require a consultant to decode.
              </p>
              <p>
                It is a side project, built in the open. If a control is
                explained badly, or you know a clearer way to say it, the
                repository is the place to fix it.
              </p>
            </section>
            <section id="how-content-is-made" aria-labelledby="method-title">
              <h2 id="method-title">How the explanations are made.</h2>
              <p>
                Every explanation is written from the pinned assessment guides
                and checked against them by automated tests and an AI-assisted
                comparison of all 468 determination statements. Qualified review
                by CMMC practitioners is the next step and is still open, so
                treat the explanations as a study companion rather than an
                official interpretation.
              </p>
              <p>
                If you assess or prepare organizations for CMMC and want to
                review a control, start with the{' '}
                <a href="https://github.com/WaylandP/cipher-and-chalk/blob/main/docs/content-review/QUALIFIED_REVIEW.md">
                  review packet on GitHub
                </a>
                .
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
      <SiteFooter page={page} />
      <ChalkTray label={page === 'home' ? undefined : <TrayLegend />} />
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
