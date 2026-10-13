import { useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ClipboardCheck,
  Code2,
  GitFork,
  Layers3,
  Sparkles,
} from 'lucide-react'
import type { ExplanationMode } from './types/content'
import { Brand } from './components/Brand'
import { ControlExplorer } from './components/ControlExplorer'

const repositoryUrl = 'https://github.com/WaylandP/Dummy-Down'
const perspectives = [
  {
    icon: BookOpen,
    mode: 'beginner',
    number: '01',
    title: 'Beginner',
    prompt: 'Start with the everyday.',
    description:
      'Plain English, relatable analogies, and no assumed cybersecurity knowledge.',
  },
  {
    icon: Code2,
    mode: 'it-cyber',
    number: '02',
    title: 'IT & Cyber',
    prompt: 'Connect it to your work.',
    description:
      'Technical context and practical examples for the people working with systems.',
  },
  {
    icon: ClipboardCheck,
    mode: 'compliance',
    number: '03',
    title: 'Compliance',
    prompt: 'Understand the context.',
    description:
      'Explore evidence examples and source links, with clear limits on what a draft can tell you.',
  },
] satisfies {
  icon: typeof BookOpen
  mode: ExplanationMode
  number: string
  title: string
  prompt: string
  description: string
}[]

export default function App() {
  const [mode, setMode] = useState<ExplanationMode>('beginner')
  return (
    <div id="top">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header section-shell">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#explorer">Control Explorer</a>
          <a href="#approach">Our approach</a>
          <a
            className="github-link"
            aria-label="Dummy-Down on GitHub (opens in a new tab)"
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitFork size={17} aria-hidden="true" />
            <span>GitHub</span>
            <ArrowUpRight size={13} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="hero section-shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="hero-eyebrow">
              <span className="live-dot" /> OPEN SOURCE. OPEN TO EVERYONE.
            </p>
            <h1 id="hero-title">
              Less jargon.
              <br />
              More <span>understanding.</span>
            </h1>
            <p className="hero-description">
              Cybersecurity compliance can be complex.
              <br className="desktop-break" /> Understanding it shouldn’t have
              to be.
            </p>
            <p className="hero-support">
              Explore controls in plain English, connect them to real life, and
              learn at a level that makes sense for you.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#explorer">
                Explore a control <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a className="button button-text" href="#approach">
                How it works <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="hero-footnote">
              <span className="tiny-check">
                <Check size={12} aria-hidden="true" />
              </span>{' '}
              Free to explore <span className="dot-separator">·</span> No
              account needed <span className="dot-separator">·</span> Early
              preview
            </div>
          </div>

          <div
            className="hero-visual"
            aria-label="A preview of the beginner access-control explanation"
          >
            <div className="visual-grid" aria-hidden="true" />
            <div className="orbit-label">
              <Sparkles size={14} aria-hidden="true" /> A little clarity goes a
              long way.
            </div>
            <div className="preview-card">
              <div className="preview-card-top">
                <span className="preview-icon">
                  <Layers3 size={22} aria-hidden="true" />
                </span>
                <span>
                  CMMC · ACCESS CONTROL
                  <small>AC.L2-3.1.1 · Draft example</small>
                </span>
                <span className="preview-dot" />
              </div>
              <p className="preview-original">
                “Restrict system access to authorized users…”
              </p>
              <div className="translation-divider">
                <span />
                <span className="translate-icon">
                  <ArrowDown size={16} aria-hidden="true" />
                </span>
                <span />
              </div>
              <span className="preview-mode">
                <BookOpen size={13} aria-hidden="true" /> BEGINNER PERSPECTIVE
              </span>
              <p className="preview-simple">
                Think of it like keys
                <br />
                to your building.
              </p>
              <p className="preview-explanation">
                Only approved people, applications, and devices should be able
                to get in.
              </p>
              <div className="key-diagram" aria-hidden="true">
                <span className="diagram-person">
                  <Check size={17} />
                </span>
                <span className="diagram-line" />
                <span className="diagram-door">
                  <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
                    <path
                      d="M8 27V5h15v22M5 27h22M18 16h1"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="diagram-line" />
                <span className="diagram-caption">
                  Approved access.
                  <br />
                  <strong>Simple idea.</strong>
                </span>
              </div>
              <div className="preview-card-bottom">
                <span>Educational paraphrase</span>
                <span>Not an official requirement</span>
              </div>
            </div>
            <span className="visual-note">
              <span className="note-line" /> Same concept. Clearer perspective.
            </span>
          </div>
        </section>

        <div className="framework-strip section-shell">
          <p>
            STARTING WITH <strong>CMMC</strong>
          </p>
          <span className="strip-divider" />
          <p>BUILT TO GROW</p>
          <div className="framework-names">
            <span>NIST</span>
            <span>FedRAMP</span>
            <span>SOC 2</span>
            <span>ISO 27001</span>
            <span>HIPAA</span>
          </div>
          <span className="planned-label">Future frameworks</span>
        </div>

        <section
          id="approach"
          className="section-shell approach-section"
          aria-labelledby="approach-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span className="section-number">01 /</span> LEARNING, ON YOUR
                TERMS
              </p>
              <h2 id="approach-title">
                A different perspective.
                <br className="mobile-break" /> The same core idea.
              </h2>
            </div>
            <p className="heading-aside">
              New to cybersecurity or years into it?
              <br />
              There’s a way in for you.
            </p>
          </div>
          <div className="perspective-grid">
            {perspectives.map(({ icon: Icon, ...item }) => (
              <article className="perspective-card" key={item.number}>
                <div className="perspective-top">
                  <span className="perspective-icon">
                    <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="perspective-number">{item.number}</span>
                </div>
                <h3>{item.title}</h3>
                <p className="perspective-prompt">{item.prompt}</p>
                <p>{item.description}</p>
                <a href="#explorer" onClick={() => setMode(item.mode)}>
                  Try this perspective{' '}
                  <ArrowUpRight size={16} aria-hidden="true" />
                  <span className="sr-only">
                    : {item.title} in the Control Explorer
                  </span>
                </a>
              </article>
            ))}
          </div>
        </section>

        <ControlExplorer mode={mode} onModeChange={setMode} />

        <section
          className="mission-section section-shell"
          aria-labelledby="mission-title"
        >
          <div className="mission-art" aria-hidden="true">
            <Layers3 size={54} strokeWidth={1} />
            <span>BUILT IN THE OPEN</span>
          </div>
          <div>
            <p className="eyebrow">SMALL START. SHARED MISSION.</p>
            <h2 id="mission-title">
              Let’s make cybersecurity
              <br />
              make sense. Together.
            </h2>
            <p>
              Dummy-Down is an independent, open-source project. This foundation
              starts with one draft example; reviewed content, a glossary, and
              interactive learning are still ahead.
            </p>
            <a
              href={repositoryUrl}
              className="mission-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow the project on GitHub{' '}
              <ArrowUpRight size={17} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer section-shell">
        <div className="footer-top">
          <Brand />
          <p>Complex compliance. Dummy-simple explanations.</p>
          <a
            href={`${repositoryUrl}/blob/main/LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT licensed <ArrowUpRight size={13} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
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
          <span>Made for curious minds.</span>
        </div>
      </footer>
    </div>
  )
}
