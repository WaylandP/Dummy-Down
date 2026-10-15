import { defaultLesson, referenceControls } from '../data/content'
import { createLessonUrl } from '../state/explorer-state'
import type { ExplanationMode } from '../types/content'
import { chalkFor } from './board/chalks'
import { publicationLabel } from './publication-label'

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
    'explain',
  )
}

/** Why the site exists, in sentences; the three chalks at the end lead to a control. */
export function AboutPage() {
  return (
    <div className="about-page page">
      <section id="about" aria-labelledby="mission-title">
        <h1 id="mission-title" className="chalk">
          A little clarity
          <br /> goes a long way.
        </h1>
        <p>
          Cybersecurity requirements can be hard to read. Cipher &amp; Chalk
          keeps the official sentence on the page and then says, in plain words,
          what it is asking for.
        </p>
        <p>
          This independent, open-source project covers all{' '}
          {referenceControls.length} CMMC controls, pinned to{' '}
          {publicationLabel()}. Each one carries the official requirement,
          quoted word for word with its page citation, and three perspectives
          written to explain it.
        </p>
      </section>
      <section id="what-cmmc-is" aria-labelledby="cmmc-title">
        <h2 id="cmmc-title">CMMC in one paragraph.</h2>
        <p>
          The Cybersecurity Maturity Model Certification is how the Department
          of Defense checks that its contractors protect the information it
          shares with them. Level 1 covers 15 basic safeguards for Federal
          Contract Information and is self-assessed. Level 2 covers the 110
          requirements of NIST SP 800-171 for Controlled Unclassified
          Information and is either self-assessed or assessed by a certified
          third party. Level 3 adds 24 enhanced requirements and is assessed by
          the Government. The requirements come from existing standards; what
          CMMC adds is the assessment, the status recorded in SPRS, and the
          contract clause that requires it. The <a href="/glossary">glossary</a>{' '}
          defines every term in that paragraph.
        </p>
      </section>
      <section id="who-makes-this" aria-labelledby="author-title">
        <h2 id="author-title">Who makes this.</h2>
        <p>
          I’m Wayland. I work in IT and compliance, and CMMC Level 2 is part of
          my day job: the system security plan, the policies, the evidence, and
          the meetings where a technical person and an assessor use the same
          word to mean different things. I started Cipher &amp; Chalk because
          the explanation I kept wishing existed didn’t: one that respects the
          source, speaks to the person reading it, and doesn’t require a
          consultant to decode.
        </p>
        <p>
          It is a side project, built in the open. If a control is explained
          badly, or you know a clearer way to say it, the repository is the
          place to fix it.
        </p>
      </section>
      <section id="how-content-is-made" aria-labelledby="method-title">
        <h2 id="method-title">How the explanations are made.</h2>
        <p>
          Every explanation is written from the pinned assessment guides and
          checked against them by automated tests and an AI-assisted comparison
          of all 468 determination statements. Qualified review by CMMC
          practitioners is the next step and is still open, so treat the
          explanations as a study companion rather than an official
          interpretation.
        </p>
        <p>
          If you assess or prepare organizations for CMMC and want to review a
          control, start with the{' '}
          <a href="https://github.com/WaylandP/cipher-and-chalk/blob/main/docs/content-review/QUALIFIED_REVIEW.md">
            review packet on GitHub
          </a>
          .
        </p>
      </section>
      <section id="approach" aria-labelledby="approach-title">
        <h2 id="approach-title">Pick a chalk.</h2>
        <p>
          Switch perspective inside any control. The source stays alongside the
          explanation.
        </p>
        <div className="perspective-list">
          {perspectives.map((item) => (
            <a
              className="perspective-link"
              key={item.mode}
              href={sampleUrl(item.mode)}
            >
              <span
                className={`stick-bar tray-stick-${chalkFor(item.mode).color}`}
                aria-hidden="true"
              />
              <span className="perspective-title">{item.title}</span>{' '}
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
      <p className="page-foot">
        <a
          className="line-action"
          href={repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Contribute a correction or an idea
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    </div>
  )
}
