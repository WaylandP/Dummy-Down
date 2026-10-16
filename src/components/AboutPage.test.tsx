import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AboutPage } from './AboutPage'
import { glossaryTerms, referenceControls } from '../data/content'
import { learningActivities } from '../data/learning'
import { chalks } from './board/chalks'
import { laterFrameworks } from './home-later'

/** The roadmap's lines, with their apostrophes straightened, in lower case. */
const roadmapLines = readFileSync(
  join(__dirname, '..', '..', 'docs', 'ROADMAP.md'),
  'utf8',
)
  .replace(/’/g, "'")
  .toLocaleLowerCase('en-US')
  .split('\n')
/** The roadmap as one line, for phrases that wrap. */
const roadmap = roadmapLines.join(' ').replace(/\s+/g, ' ')
/** The roadmap entry a phrase sits in: a bullet or a paragraph with its wrapped lines. */
function roadmapEntry(phrase: string): string {
  const needle = phrase.replace(/’/g, "'").toLocaleLowerCase('en-US')
  const entries: string[] = []
  for (const line of roadmapLines) {
    // Wrapped lines are indented; anything else starts an entry of its own.
    if (/^\s+\S/.test(line) && entries.length)
      entries[entries.length - 1] += ` ${line.trim()}`
    else entries.push(line)
  }
  const entry = entries.find((item) => item.includes(needle))
  if (!entry) throw new Error(`docs/ROADMAP.md does not say "${phrase}"`)
  return entry
}

function column() {
  render(<AboutPage />)
  const aside = within(
    screen.getByRole('complementary', { name: 'What’s next on the board' }),
  )
  const items = (name: string) =>
    within(aside.getByRole('list', { name }))
      .getAllByRole('listitem')
      .map((item) => ({
        text: item.querySelector('.about-next-text')!.textContent!,
        note: item.querySelector('.about-next-sub')?.textContent ?? null,
        done: item.classList.contains('is-done'),
      }))
  return { aside, items }
}

describe('About: what’s next on the board', () => {
  it('counts what is on the board from the data, ticked', () => {
    // The literal lines pin the data they count; a changed count fails here.
    expect(referenceControls).toHaveLength(149)
    expect(chalks).toHaveLength(3)
    expect(learningActivities).toHaveLength(13)
    expect(glossaryTerms).toHaveLength(54)
    const { items } = column()
    const done = items('On the board')
    expect(done.map((item) => item.text)).toEqual([
      'CMMC, all three levels: 149 controls, quoted and cited',
      'Three chalks for three readers',
      'Decode, the Rev 3 view and the timeline',
      'The first chalk talk, CMMC in sixty seconds',
      'Thirteen practice situations and 54 glossary words',
    ])
    expect(done.every((item) => item.done)).toBe(true)
    // The roadmap counts the same glossary.
    expect(roadmap).toContain(`${glossaryTerms.length}-term`)
  })

  it('says next and later only in the roadmap’s words, on lines it has not ticked, with no dates', () => {
    const { items } = column()
    const next = items('Next')
    const later = items('Later')
    expect(next.map((item) => item.text)).toEqual([
      'One fictional company, CedarPoint, through every family’s examples',
      'Review by qualified CMMC professionals',
    ])
    expect(later.map((item) => item.text)).toEqual([
      'More frameworks',
      'More chalk talks for visual learners',
      'Flashcards for every objective',
      'Two controls side by side',
    ])
    for (const item of [...next, ...later]) {
      expect(item.done).toBe(false)
      expect(roadmapEntry(item.text)).not.toMatch(/^- \[x\]/)
      expect(item.text).not.toMatch(/\b20\d\d\b|\bQ[1-4]\b/)
    }
    expect(next[1]!.note).toBe('Know one? The repository says how to help.')
  })

  it('names every framework the catalog lists as planned under More frameworks, and no more', () => {
    const { items } = column()
    const line = items('Later')[0]!.note!
    const named = line.split(', ')
    expect(named).toHaveLength(laterFrameworks.length)
    for (const framework of laterFrameworks)
      expect(
        named.includes(framework.shortName) || named.includes(framework.name),
        `${framework.name} is listed`,
      ).toBe(true)
    for (const name of named)
      expect(roadmap).toContain(name.toLocaleLowerCase('en-US'))
  })

  it('ends with directions, not dates, and a way to suggest something', () => {
    const { aside } = column()
    expect(aside.getByText(/Directions, not dates\./)).toBeVisible()
    const suggest = aside.getByRole('link', {
      name: /^Suggest something on GitHub/,
    })
    expect(suggest).toHaveTextContent('(opens in a new tab)')
    expect(suggest).toHaveAttribute(
      'href',
      'https://github.com/WaylandP/cipher-and-chalk/issues/new',
    )
    expect(suggest).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('keeps the sentences first: the mission, who makes this, then CMMC in one paragraph, and says the review status once', () => {
    render(<AboutPage />)
    const headings = screen
      .getAllByRole('heading')
      .map((heading) => heading.textContent)
    expect(headings.slice(0, 3)).toEqual([
      'A little clarity goes a long way.',
      'Who makes this.',
      'CMMC in one paragraph.',
    ])
    expect(headings).toContain('What’s next on the board')
    // The review status, once: the method paragraph says no qualified assessor
    // has reviewed the explanations yet; "Review by qualified CMMC
    // professionals" in the column is what is next, not a status.
    expect(screen.getAllByText(/has reviewed them yet/)).toHaveLength(1)
    expect(
      screen.queryAllByText(/draft|not been reviewed|pending review/i),
    ).toHaveLength(0)
  })
})
