import { useEffect, useState, useSyncExternalStore } from 'react'
import { glossaryTerms } from './data/content'
import { sitePage } from './state/site-page'
import { Glossary } from './components/Glossary'
import { BoardDefs, BoardDust, BoardGround } from './components/board/BoardDefs'
import { SiteHeader, browseUrl } from './components/board/SiteHeader'
import { SiteFooter } from './components/board/SiteFooter'
import { ChalkTray, TrayLegend } from './components/board/ChalkTray'
import { useLiftedChalk, useTrayControl } from './components/board/tray-state'
import { KeysHelp } from './components/board/KeysHelp'
import { scrollContentWithKeys } from './components/board/scroll-keys'
import { FIND_EVENT, keyIsFree, keyOf } from './components/board/keys'
import { DoodleLayer } from './components/board/DoodleChalk'
import {
  isDoodleUp,
  isSmudgeUp,
  pickUpDoodle,
  pickUpSmudge,
  putDownDoodle,
  putDownHeld,
  putDownSmudge,
  roomToDoodle,
  useDoodle,
} from './components/board/doodle-state'
import { CoverageRoute } from './components/CoverageRoute'
import { PracticeRoute } from './components/PracticeRoute'
import { Home } from './components/Home'
import { AboutPage } from './components/AboutPage'
import { DisclaimerPage } from './components/DisclaimerPage'
import { TimelineRoute } from './components/TimelineRoute'
import { LearningRoute } from './components/LearningRoute'
import { UsageAnalytics } from './analytics/UsageAnalytics'
import { LocalProgressProvider } from './progress/LocalProgressProvider'
import { learningActivities } from './data/learning'
import { setPageMeta } from './seo/page-meta'

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
  const lifted = useLiftedChalk()
  const trayControl = useTrayControl()
  const [keysOpen, setKeysOpen] = useState(false)
  const doodle = useDoodle()
  const layered = doodle.up || doodle.eraser || doodle.marks.length > 0
  // "/" finds a control, "?" shows the keys, "d" picks up the doodle chalk
  // and "e" Smudge, anywhere a key is free; the same key again and Escape
  // put it back in the tray, with focus on its place.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!keyIsFree(event)) return
      if (event.key === '?') {
        event.preventDefault()
        setKeysOpen(true)
      } else if (event.key === '/') {
        event.preventDefault()
        const home = document.getElementById('home-q')
        if (home instanceof HTMLInputElement) home.focus()
        else window.dispatchEvent(new Event(FIND_EVENT))
      } else if (keyOf(event) === 'd' && roomToDoodle()) {
        event.preventDefault()
        if (isDoodleUp()) putDownDoodle(true)
        else pickUpDoodle()
      } else if (keyOf(event) === 'e') {
        if (isSmudgeUp()) putDownSmudge(true)
        else pickUpSmudge()
      } else if (event.key === 'Escape' && putDownHeld(true)) {
        event.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keydown', scrollContentWithKeys)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keydown', scrollContentWithKeys)
    }
  }, [])
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
        timeline: {
          title: 'Timeline',
          description:
            'The dates that matter for CMMC: when the program rule took effect, when the DFARS clause reaches contracts in four phases, how long each status stays current, and what DoD has said about NIST SP 800-171 Revision 3.',
          canonicalPath: '/timeline',
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
        {page === 'timeline' && <TimelineRoute />}
        {page === 'practice' && <PracticeRoute />}
        {page === 'learn' && <LearningRoute />}
        {page === 'glossary' && <Glossary terms={glossaryTerms} />}
        {page === 'about' && <AboutPage />}
        {page === 'not-found' && (
          <section className="about-page page">
            <h1>This board is blank.</h1>
            <p>
              That page isn’t available. You can still browse the learning
              material.
            </p>
            <a className="line-action" href={browseUrl}>
              Explore the controls
            </a>
          </section>
        )}
        {layered && <DoodleLayer />}
      </main>
      <SiteFooter page={page} />
      <ChalkTray
        lifted={lifted}
        label={<TrayLegend />}
        control={page === 'learn' ? trayControl : null}
      />
      {keysOpen && <KeysHelp onClose={() => setKeysOpen(false)} />}
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
