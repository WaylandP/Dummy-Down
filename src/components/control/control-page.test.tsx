import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../App'
import { explorerCatalog, referenceControls } from '../../data/content'
import { assessmentObjectivesFor } from '../../data/cmmc-objectives'
import { relatedControls } from '../../data/related-controls'
import {
  explorerResults,
  parseExplorerSearch,
} from '../../state/explorer-state'
import { decodeControlId } from './decode-id'
import { quotation } from '../../test/quotation'

function control(id: string) {
  const found = referenceControls.find((item) => item.id === id)
  if (!found) throw new Error(`Missing control ${id}`)
  return found
}
function address(key: string, extra = '') {
  return `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=beginner${extra}`
}
const levelOne = explorerResults(
  {
    view: 'discover',
    mode: 'beginner',
    filters: {
      catalog: 'cmmc',
      collection: 'references',
      query: '',
      family: '',
      level: 'Level 1',
    },
  },
  explorerCatalog,
)
const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  'clipboard',
)

beforeEach(() => window.history.replaceState(null, '', '/learn'))
afterEach(() => {
  vi.restoreAllMocks()
  if (originalClipboard)
    Object.defineProperty(navigator, 'clipboard', originalClipboard)
  else Reflect.deleteProperty(navigator, 'clipboard')
})

describe('The control ID, decoded', () => {
  it('reads each level back to the publication its number names', () => {
    expect(decodeControlId(control('AC.L1-b.1.i'))).toEqual({
      family: 'AC',
      level: 'L1',
      number: 'b.1.i',
      pieces: [
        { code: 'AC', meaning: 'Access Control' },
        { code: 'L1', meaning: 'Level 1, FCI' },
        { code: 'b.1.i', meaning: 'FAR 52.204-21, paragraph b.1.i' },
      ],
    })
    expect(decodeControlId(control('AC.L2-3.1.1'))?.pieces.slice(1)).toEqual([
      { code: 'L2', meaning: 'Level 2, CUI' },
      { code: '3.1.1', meaning: 'NIST SP 800-171 Rev. 2, requirement 3.1.1' },
    ])
    expect(decodeControlId(control('AC.L3-3.1.2e'))?.pieces.slice(1)).toEqual([
      { code: 'L3', meaning: 'Level 3, CUI, enhanced' },
      { code: '3.1.2e', meaning: 'NIST SP 800-172, requirement 3.1.2e' },
    ])
  })

  it('names no publication for another edition, framework or identifier shape', () => {
    const base = control('AC.L2-3.1.1')
    expect(decodeControlId({ ...base, editionId: 'cmmc-3-0' })).toBeNull()
    expect(
      decodeControlId({ ...base, frameworkId: 'nist-sp-800-53' }),
    ).toBeNull()
    expect(decodeControlId({ ...base, id: 'AC-2' })).toBeNull()
  })
})

describe('Related controls from identifiers and titles', () => {
  it('pairs the same practice across levels and the enhanced requirement with its basis', () => {
    const ids = (list: readonly { id: string }[]) => list.map((item) => item.id)
    const levelOneAccess = relatedControls(
      control('AC.L1-b.1.i'),
      referenceControls,
    )
    expect(ids(levelOneAccess.siblings)).toEqual(['AC.L2-3.1.1'])
    expect(levelOneAccess.builds).toEqual([])
    expect(levelOneAccess.basis).toEqual([])
    expect(ids(levelOneAccess.family)).not.toContain('AC.L1-b.1.i')
    expect(ids(levelOneAccess.family)).not.toContain('AC.L2-3.1.1')
    expect(levelOneAccess.family.every((item) => item.family === 'AC')).toBe(
      true,
    )
    expect(
      ids(relatedControls(control('AC.L2-3.1.2'), referenceControls).builds),
    ).toEqual(['AC.L3-3.1.2e'])
    expect(
      ids(relatedControls(control('AC.L3-3.1.2e'), referenceControls).basis),
    ).toEqual(['AC.L2-3.1.2'])
    expect(
      relatedControls(control('RA.L3-3.11.4e'), referenceControls).basis,
    ).toEqual([])
  })

  it('never relates across editions', () => {
    const foreign = { ...control('AC.L2-3.1.1'), editionId: 'other-edition' }
    const related = relatedControls(control('AC.L1-b.1.i'), [
      ...referenceControls,
      foreign,
    ])
    expect(related.siblings.map((item) => item.id)).toEqual(['AC.L2-3.1.1'])
    expect(related.siblings[0]?.editionId).toBe('cmmc-2-13-sep-2024')
  })
})

describe('Assessment objectives on Decode', () => {
  it('keeps guide order, puts parameters first and belongs to the pinned edition only', () => {
    expect(
      assessmentObjectivesFor(control('AC.L1-b.1.i')).map((item) => item.label),
    ).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    const withParameters = assessmentObjectivesFor(control('RA.L3-3.11.2e'))
    expect(withParameters[0]?.label).toMatch(/^ODP/)
    expect(withParameters.at(-1)?.label).toMatch(/^[a-z]$/)
    expect(
      assessmentObjectivesFor({
        ...control('AC.L1-b.1.i'),
        editionId: 'other',
      }),
    ).toEqual([])
  })

  it('shows every statement verbatim with its letter', async () => {
    window.history.replaceState(null, '', address('ac-l1-b-1-i'))
    render(<App />)
    const list = within(
      await screen.findByRole('list', { name: 'Assessment objectives' }),
    )
    for (const objective of assessmentObjectivesFor(control('AC.L1-b.1.i'))) {
      expect(list.getByText(`[${objective.label}]`)).toBeVisible()
      expect(list.getByText(objective.text)).toBeVisible()
    }
    expect(
      screen.getByText(quotation(control('AC.L1-b.1.i').requirement.text)),
    ).toBeVisible()
  })
})

describe('Views in the address', () => {
  it('says so when a shared view is unknown and opens Decode', async () => {
    window.history.replaceState(null, '', address('ac-l1-b-1-i', '&tab=notes'))
    render(<App />)
    expect(
      await screen.findByText('That view is unavailable; showing Decode.'),
    ).toBeVisible()
    // The explorer rewrites the address once it subscribes, after the lazy
    // page mounts, so the canonical address can land a tick after the notice.
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).has('tab')).toBe(
        false,
      ),
    )
    expect(
      within(
        screen.getByRole('navigation', { name: 'Views of this control' }),
      ).getByRole('link', { name: 'Decode' }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('ignores a view on a discovery address without complaint', () => {
    const parsed = parseExplorerSearch(
      '?view=discover&collection=references&tab=explain',
      explorerCatalog,
    )
    expect(parsed.kind).toBe('ready')
    if (parsed.kind !== 'ready') return
    expect(parsed.state.tab).toBeUndefined()
    expect(parsed.notices).toEqual([])
  })

  it('copies a reference link that carries the open view', async () => {
    window.history.replaceState(
      null,
      '',
      address('ac-l1-b-1-i', '&tab=evidence'),
    )
    // user-event installs its own clipboard stub; the mock goes on after it.
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    render(<App />)
    await user.click(
      await screen.findByRole('button', { name: 'Copy reference link' }),
    )
    expect(writeText).toHaveBeenCalledTimes(1)
    const copied = new URL(writeText.mock.calls[0]![0] as string)
    expect(copied.searchParams.get('control')).toBe('ac-l1-b-1-i')
    expect(copied.searchParams.get('tab')).toBe('evidence')
    expect(copied.searchParams.get('mode')).toBe('beginner')
  })
})

describe('Previous and Next', () => {
  it('stay inside the current results, keep the view and keep focus on the button', async () => {
    const [first, second, third] = levelOne
    window.history.replaceState(
      null,
      '',
      address(first!.key, '&level=Level+1&tab=explain'),
    )
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { level: 1, name: first!.title })
    expect(
      screen.queryByRole('button', { name: /^Previous:/ }),
    ).not.toBeInTheDocument()
    const next = screen.getByRole('button', { name: `Next: ${second!.id}` })
    await user.click(next)
    expect(
      await screen.findByRole('heading', { level: 1, name: second!.title }),
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: `Next: ${third!.id}` }),
    ).toHaveFocus()
    expect(
      screen.getByRole('button', { name: `Previous: ${first!.id}` }),
    ).toBeVisible()
    expect(
      screen.getByText(`${second!.id}: ${second!.title}`, {
        selector: '[role="status"]',
      }),
    ).toBeInTheDocument()
    const params = new URLSearchParams(window.location.search)
    expect(params.get('control')).toBe(second!.key)
    expect(params.get('level')).toBe('Level 1')
    expect(params.get('tab')).toBe('explain')
  })

  it('move focus to the title when the pressed button has nowhere left to go', async () => {
    const last = levelOne.at(-1)!
    const beforeLast = levelOne.at(-2)!
    window.history.replaceState(
      null,
      '',
      address(beforeLast.key, '&level=Level+1'),
    )
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { level: 1, name: beforeLast.title })
    await user.click(screen.getByRole('button', { name: `Next: ${last.id}` }))
    const title = await screen.findByRole('heading', {
      level: 1,
      name: last.title,
    })
    expect(title).toHaveFocus()
    expect(
      screen.queryByRole('button', { name: /^Next:/ }),
    ).not.toBeInTheDocument()
    act(() => {
      window.history.back()
    })
  })
})
