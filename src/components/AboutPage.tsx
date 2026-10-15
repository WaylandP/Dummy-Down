import {
  defaultLesson,
  glossaryTerms,
  referenceControls,
} from '../data/content'
import { learningActivities } from '../data/learning'
import { createLessonUrl } from '../state/explorer-state'
import type { ExplanationMode } from '../types/content'
import { chalkFor, chalks } from './board/chalks'
import { laterFrameworkNames } from './home-later'
import { capitalize, numberWord } from './number-words'
import { publicationLabel } from './publication-label'

const repositoryUrl = 'https://github.com/WaylandP/cipher-and-chalk'
const suggestUrl = `${repositoryUrl}/issues/new`
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

interface NextItem {
  readonly text: string
  /** A smaller line under the item. */
  readonly note?: string
}

/**
 * The board column (docs/ROADMAP.md, in its words): what is here, counted
 * from the data; what comes next; what comes later. Directions, not dates.
 */
const onTheBoard: readonly NextItem[] = [
  {
    text: `CMMC, all three levels: ${referenceControls.length} controls, quoted and cited`,
  },
  {
    text: `${capitalize(numberWord(chalks.length))} chalks for ${numberWord(chalks.length)} readers`,
  },
  { text: 'Decode, the Rev 3 view and the timeline' },
  {
    text: `${capitalize(numberWord(learningActivities.length))} practice situations and ${glossaryTerms.length} glossary words`,
  },
]
const next: readonly NextItem[] = [
  {
    text: 'One fictional company, CedarPoint, through every family’s examples',
  },
  {
    text: 'Review by qualified CMMC professionals',
    note: 'Know one? The repository says how to help.',
  },
]
const later: readonly NextItem[] = [
  { text: 'More frameworks', note: laterFrameworkNames },
  { text: 'Animated chalk talks for visual learners' },
  { text: 'Flashcards for every objective' },
  { text: 'Two controls side by side' },
]

function NextGroup({
  id,
  title,
  items,
  done,
}: {
  readonly id: string
  readonly title: string
  readonly items: readonly NextItem[]
  /** Ticked: it is on the board. */
  readonly done?: boolean
}) {
  return (
    <div className="about-next-group">
      <h3 id={id} className="hand">
        {title}
      </h3>
      <ul role="list" aria-labelledby={id}>
        {items.map((item) => (
          <li key={item.text} className={done ? 'is-done' : undefined}>
            <svg
              className="about-next-mark chalk"
              viewBox="0 0 18 18"
              aria-hidden="true"
              focusable="false"
            >
              <path
                className="about-next-box"
                d="M3 3.5c4-.5 8-.4 12 0 .4 4 .4 7.5 0 11-4 .5-8 .4-12 0-.4-3.5-.4-7 0-11z"
              />
              {done && <path className="about-next-tick" d="M5 9.5l3 3 6-7" />}
            </svg>
            <span className="about-next-text">{item.text}</span>
            {item.note && <span className="about-next-sub">{item.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Why the site exists, in sentences, with what is next on the board beside
 * them (mockups/2026-10-15/About.html); the three chalks at the end lead to
 * a control.
 */
export function AboutPage() {
  return (
    <div className="about-page with-next page">
      <div className="about-main">
        <section id="about" aria-labelledby="mission-title">
          <h1 id="mission-title" className="chalk">
            A little clarity
            <br /> goes a long way.
          </h1>
          <p>
            Cybersecurity requirements can be hard to read. Cipher &amp; Chalk
            keeps the official sentence on the page and then says, in plain
            words, what it is asking for.
          </p>
          <p>
            This independent, open-source project covers all{' '}
            {referenceControls.length} CMMC controls, pinned to{' '}
            {publicationLabel()}. Each one carries the official requirement,
            quoted word for word with its page citation, and three perspectives
            written to explain it.
          </p>
        </section>
        <section id="who-makes-this" aria-labelledby="author-title">
          <h2 id="author-title">Who makes this.</h2>
          <p>
            I’m Wayland. I work in IT and compliance, and CMMC Level 2 is part
            of my day job: the system security plan, the policies, the evidence,
            and the meetings where a technical person and an assessor use the
            same word to mean different things. I started Cipher &amp; Chalk
            because the explanation I kept wishing existed didn’t: one that
            respects the source, speaks to the person reading it, and doesn’t
            require a consultant to decode.
          </p>
          <p>
            It is a side project, built in the open. If a control is explained
            badly, or you know a clearer way to say it, the repository is the
            place to fix it.
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
            third party. Level 3 adds 24 enhanced requirements and is assessed
            by the Government. The requirements come from existing standards;
            what CMMC adds is the assessment, the status recorded in SPRS, and
            the contract clause that requires it. The{' '}
            <a href="/glossary">glossary</a> defines every term in that
            paragraph.
          </p>
        </section>
        <section id="how-content-is-made" aria-labelledby="method-title">
          <h2 id="method-title">How the explanations are made.</h2>
          <p>
            Every explanation is written from the pinned assessment guides and
            checked against them by automated tests and an AI-assisted
            comparison of all 468 determination statements. Treat the
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
            Switch perspective inside any control. The source stays alongside
            the explanation.
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
      <aside className="about-next" aria-labelledby="about-next-title">
        <h2 id="about-next-title" className="hand chalk">
          What’s next on the board
        </h2>
        <NextGroup
          id="about-next-done"
          title="On the board"
          items={onTheBoard}
          done
        />
        <NextGroup id="about-next-next" title="Next" items={next} />
        <NextGroup id="about-next-later" title="Later" items={later} />
        <p className="about-next-foot">
          Directions, not dates.{' '}
          <a href={suggestUrl} target="_blank" rel="noopener noreferrer">
            Suggest something on GitHub
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </aside>
    </div>
  )
}
