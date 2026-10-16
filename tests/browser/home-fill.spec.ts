import { expect, test } from '@playwright/test'

const sixty = 'CMMC in sixty seconds'
/** Real browser windows, in CSS pixels, from a 13" laptop to a 27" display. */
const targets = [
  [1280, 800],
  [1366, 768],
  [1440, 900],
  [1470, 830],
  [1512, 860],
  [1536, 864],
  [1728, 980],
  [1920, 1080],
  [2560, 1300],
] as const

test('Home fills big screens: the hero and the panel scale with the window, both ending 24 to 64px above "Pick up a chalk to start.", nothing to scroll, nothing overlapping, the headline on two lines and every board word 11px or more', async ({
  page,
}) => {
  for (const [width, height] of targets) {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const talk = page.getByRole('region', { name: sixty })
    await expect(talk).toBeVisible()
    const m = await page.evaluate(() => {
      const box = (selector: string) => {
        const el = document.querySelector(selector)
        if (!el) throw new Error(`No ${selector}`)
        const b = el.getBoundingClientRect()
        return {
          x: b.x,
          y: b.y,
          right: b.right,
          bottom: b.bottom,
          width: b.width,
          height: b.height,
        }
      }
      const main = document.getElementById('main')!
      const title = document.querySelector<HTMLElement>('.home-title')!
      const titleSize = parseFloat(getComputedStyle(title).fontSize)
      const svg = document.querySelector<SVGSVGElement>('svg.sixty-board')!
      const scale = Math.hypot(svg.getScreenCTM()!.a, svg.getScreenCTM()!.b)
      const words = Array.from(svg.querySelectorAll('.sixty-word')).map(
        (word) => Number(word.getAttribute('data-size')) * scale,
      )
      return {
        scroll: main.scrollHeight - main.clientHeight,
        wide: document.documentElement.scrollWidth,
        kicker: box('.home-kicker'),
        title: box('.home-title'),
        lead: box('.home-lead'),
        talk: box('.home-talk'),
        panel: box('.sixty'),
        board: box('svg.sixty-board'),
        pick: box('.home-pick'),
        start: box('.home-start'),
        titleSize,
        leadSize: parseFloat(
          getComputedStyle(document.querySelector('.home-lead')!).fontSize,
        ),
        lines: Math.round(
          title.getBoundingClientRect().height / (titleSize * 0.95),
        ),
        smallest: Math.min(...words),
        words: words.length,
      }
    })
    const at = `${width}×${height}`
    // Nothing to scroll, nothing wider than the window.
    expect(m.scroll, at).toBeLessThanOrEqual(0)
    expect(m.wide, at).toBeLessThanOrEqual(width)
    // The panel and the lead both end 24 to 64px above "Pick up a chalk to
    // start.", at about the same height.
    const gapPanel = m.pick.y - m.panel.bottom
    const gapLead = m.pick.y - m.lead.bottom
    expect(gapPanel, `${at} under the panel`).toBeGreaterThanOrEqual(24)
    expect(gapPanel, `${at} under the panel`).toBeLessThanOrEqual(64)
    expect(gapLead, `${at} under the lead`).toBeGreaterThanOrEqual(24)
    expect(gapLead, `${at} under the lead`).toBeLessThanOrEqual(64)
    expect(Math.abs(m.panel.bottom - m.lead.bottom), at).toBeLessThanOrEqual(40)
    // Nothing overlaps or clips: the kicker, the headline and the lead in
    // order in their column, the panel beside them in its own, the board
    // inside the panel, the chalks row below both.
    expect(m.kicker.bottom, at).toBeLessThanOrEqual(m.title.y + 1)
    expect(m.title.bottom, at).toBeLessThanOrEqual(m.lead.y + 1)
    expect(m.lead.right, at).toBeLessThanOrEqual(m.talk.x + 1)
    expect(m.title.right, at).toBeLessThanOrEqual(m.talk.x + 1)
    expect(m.panel.x, at).toBeGreaterThanOrEqual(m.talk.x)
    expect(m.panel.right, at).toBeLessThanOrEqual(width - 40)
    expect(m.board.x, at).toBeGreaterThanOrEqual(m.panel.x - 1)
    expect(m.board.right, at).toBeLessThanOrEqual(m.panel.right + 1)
    expect(m.panel.bottom, at).toBeLessThanOrEqual(m.start.y + 1)
    expect(m.lead.bottom, at).toBeLessThanOrEqual(m.start.y + 1)
    // The headline stays on two lines, sized from its column; the panel
    // grows from 397px, its board with it; the lead from 20px.
    expect(m.lines, at).toBe(2)
    expect(m.titleSize, at).toBeGreaterThanOrEqual(96)
    expect(m.titleSize, at).toBeLessThanOrEqual(200)
    expect(m.panel.width, at).toBeGreaterThanOrEqual(396)
    expect(m.panel.width, at).toBeLessThanOrEqual(1100)
    expect(Math.abs(m.board.width - m.panel.width), at).toBeLessThanOrEqual(1)
    expect(m.leadSize, at).toBeGreaterThanOrEqual(20)
    // Every board word is 11px or more, and grows with the board.
    expect(m.words, at).toBe(24)
    expect(m.smallest, at).toBeGreaterThanOrEqual(11)
    expect(m.smallest, at).toBeGreaterThanOrEqual(
      (11.1 * m.board.width) / 397 - 0.2,
    )
  }
  // The guide: at 1728×980 a panel about 640px wide, a headline around
  // 130px, a lead around 24px.
  await page.setViewportSize({ width: 1728, height: 980 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const guide = await page.evaluate(() => ({
    panel: document.querySelector('.sixty')!.getBoundingClientRect().width,
    title: parseFloat(
      getComputedStyle(document.querySelector('.home-title')!).fontSize,
    ),
    lead: parseFloat(
      getComputedStyle(document.querySelector('.home-lead')!).fontSize,
    ),
  }))
  expect(guide.panel).toBeGreaterThanOrEqual(600)
  expect(guide.panel).toBeLessThanOrEqual(680)
  expect(guide.title).toBeGreaterThanOrEqual(124)
  expect(guide.title).toBeLessThanOrEqual(140)
  expect(guide.lead).toBeGreaterThanOrEqual(23)
  expect(guide.lead).toBeLessThanOrEqual(26)
})
