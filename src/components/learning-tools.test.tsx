import { StrictMode } from 'react'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GlossaryTerm, SourceReference } from '../types/content'
import { ContextTerms, TermDefinition } from './ContextTerms'
import { Glossary } from './Glossary'
import { ShareLesson } from './ShareLesson'

const resourceSource: SourceReference = {
  id: 'resource-index',
  title: 'Resource index',
  url: 'https://example.org/resources',
  versionContext: 'Find the applicable publication here.',
  kind: 'official-resource-index',
}
const deviceTerm: GlossaryTerm = {
  id: 'device',
  title: 'Device',
  definition: 'A computer or other piece of equipment connecting to a system.',
  reviewStatus: 'draft',
  versionContext: 'Project teaching context; not an official definition.',
  sources: [resourceSource],
}
const accountTerm: GlossaryTerm = {
  id: 'account',
  title: 'Account',
  definition: 'An identity used to sign in to a company system.',
  reviewStatus: 'draft',
  versionContext: 'Read alongside the draft authorized-access example.',
  sources: [
    {
      id: 'project',
      title: 'Teaching source',
      url: 'https://example.org/readme',
      versionContext: 'A pinned project snapshot.',
      kind: 'project-readme',
    },
  ],
}
const terms: readonly GlossaryTerm[] = [deviceTerm, accountTerm]

const lessonUrl =
  'https://dummy-down.example/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access&mode=beginner#explorer'
const complianceUrl = lessonUrl.replace('mode=beginner', 'mode=compliance')
const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  'clipboard',
)

function clipboard(value: unknown) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value,
  })
}

function deferred() {
  let resolve!: () => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

afterEach(() => {
  vi.restoreAllMocks()
  window.history.replaceState(null, '', '/')
  if (originalClipboard) {
    Object.defineProperty(navigator, 'clipboard', originalClipboard)
  } else {
    Reflect.deleteProperty(navigator, 'clipboard')
  }
})

describe('Glossary', () => {
  it('shows every word under its letter by default, with the text that defines each one', () => {
    const { container } = render(<Glossary terms={terms} />)

    // All is pressed; the letters file the words under headings, in order.
    const all = screen.getByRole('button', { name: 'All', pressed: true })
    expect(all).toBeVisible()
    expect(
      [...container.querySelectorAll('.glossary-letter')].map(
        (heading) => heading.textContent,
      ),
    ).toEqual(['A', 'D'])
    expect(
      [...container.querySelectorAll('.word h3')].map(
        (heading) => heading.textContent,
      ),
    ).toEqual(['Account', 'Device'])
    expect(screen.getByRole('region', { name: 'All words' })).toBeVisible()
    expect(
      screen.getByRole('status', { name: 'Glossary search results' }),
    ).toHaveTextContent('2 words')
    expect(screen.getByText(accountTerm.definition)).toBeVisible()
    expect(screen.getByText(deviceTerm.definition)).toBeVisible()
    const letters = within(
      screen.getByRole('navigation', { name: 'Jump to a letter' }),
    )
    expect(
      letters.getAllByRole('link').map((link) => link.textContent),
    ).toEqual(['A', 'D'])
    expect(letters.queryByRole('link', { current: 'page' })).toBeNull()
    expect(
      screen.getByText(/each linked to the text that defines it/),
    ).toBeVisible()
    expect(screen.queryByRole('link', { name: /^Next:/ })).toBeNull()
    expect(screen.queryByRole('link', { name: /^Previous:/ })).toBeNull()
  })

  it('files one letter from its link and brings every word back from All, in the address', async () => {
    const user = userEvent.setup()
    const { container } = render(<Glossary terms={terms} />)
    await user.click(screen.getByRole('link', { name: 'A' }))
    expect(window.location.search).toBe('?letter=A')
    expect(
      screen.getByRole('button', { name: 'All', pressed: false }),
    ).toBeVisible()
    expect(
      [...container.querySelectorAll('.word h2')].map(
        (heading) => heading.textContent,
      ),
    ).toEqual(['Account'])
    expect(container.querySelector('.glossary-letter')).toBeNull()
    expect(screen.getByRole('region', { name: 'Words under A' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Next: D' })).toHaveAttribute(
      'href',
      '/glossary?letter=D',
    )
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(window.location.pathname + window.location.search).toBe('/glossary')
    expect(
      screen.getByRole('button', { name: 'All', pressed: true }),
    ).toBeVisible()
    expect(screen.getByRole('region', { name: 'All words' })).toHaveFocus()
    expect(
      [...container.querySelectorAll('.word h3')].map(
        (heading) => heading.textContent,
      ),
    ).toEqual(['Account', 'Device'])
    // Back returns to the letter; a letter in the address wins over All.
    await act(async () => {
      window.history.back()
      await new Promise((resolve) => setTimeout(resolve, 0))
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByRole('region', { name: 'Words under A' })).toBeVisible()
  })

  it('turns a letter without leaving the page and links the source by its short name', async () => {
    const user = userEvent.setup()
    render(<Glossary terms={terms} />)
    await user.click(screen.getByRole('link', { name: 'D' }))
    expect(window.location.search).toBe('?letter=D')
    expect(screen.getByRole('link', { name: 'D' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('region', { name: 'Words under D' })).toHaveFocus()
    expect(screen.getByText(deviceTerm.definition)).toBeVisible()
    const source = screen.getByRole('link', { name: /Resource index/ })
    expect(source).toHaveAttribute('href', 'https://example.org/resources')
    expect(source).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: 'Previous: A' })).toBeVisible()
    expect(screen.queryByRole('link', { name: /^Next:/ })).toBeNull()
  })

  it('leaves All unpressed for a group, and presses it for a letter nobody has', async () => {
    window.history.replaceState(null, '', '/glossary?group=lessons')
    render(<Glossary terms={terms} />)
    expect(
      screen.getByRole('button', { name: 'All', pressed: false }),
    ).toBeVisible()
    expect(screen.queryByText(/Words under/)).toBeNull()
    window.history.replaceState(null, '', '/glossary?letter=Q')
    const user = userEvent.setup()
    const again = render(<Glossary terms={terms} />)
    // A letter with no words shows every word, and All clears the address.
    expect(
      within(again.container).getByRole('button', {
        name: 'All',
        pressed: true,
      }),
    ).toBeVisible()
    await user.click(
      within(again.container).getByRole('button', { name: 'All' }),
    )
    expect(window.location.pathname + window.location.search).toBe('/glossary')
  })

  it('does not touch history when All ends a search typed on the plain address', async () => {
    window.history.replaceState(null, '', '/glossary')
    const user = userEvent.setup()
    const push = vi.spyOn(window.history, 'pushState')
    render(<Glossary terms={terms} />)
    await user.type(
      screen.getByRole('searchbox', { name: 'Search words' }),
      'dev',
    )
    expect(screen.getByRole('region', { name: 'Search results' })).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'All', pressed: false }),
    ).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(push).not.toHaveBeenCalled()
    expect(screen.getByRole('region', { name: 'All words' })).toHaveFocus()
    expect(screen.getByRole('searchbox', { name: 'Search words' })).toHaveValue(
      '',
    )
    push.mockRestore()
  })

  it('searches title and definition conjunctively without navigation', async () => {
    const user = userEvent.setup()
    const address = window.location.href
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')
    render(<Glossary terms={terms} />)

    await user.type(
      screen.getByRole('searchbox', { name: 'Search words' }),
      '  ACCOUNT   company ',
    )
    expect(screen.getByRole('heading', { name: 'Account' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Device' })).toBeNull()
    expect(
      screen.getByRole('status', { name: 'Glossary search results' }),
    ).toHaveTextContent('1 word')
    expect(screen.getByRole('region', { name: 'Search results' })).toBeVisible()
    expect(window.location.href).toBe(address)
    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })

  it('recovers an empty search and focuses its own input', async () => {
    const user = userEvent.setup()
    render(
      <>
        <input aria-label="Control search" defaultValue="access" />
        <Glossary terms={terms} />
      </>,
    )
    const search = screen.getByRole('searchbox', { name: 'Search words' })
    await user.type(search, 'nothing-here')
    expect(
      screen.getByRole('heading', { name: 'No matching words.' }),
    ).toBeVisible()
    await user.click(
      screen.getByRole('button', { name: 'Clear glossary search' }),
    )
    expect(search).toHaveValue('')
    expect(search).toHaveFocus()
    expect(screen.getByRole('textbox', { name: 'Control search' })).toHaveValue(
      'access',
    )
    expect(
      screen.getByRole('status', { name: 'Glossary search results' }),
    ).toHaveTextContent('2 words')
  })
})

describe('ContextTerms', () => {
  it('keeps opening focus, shows one definition, and restores focus on Close/Escape', async () => {
    const user = userEvent.setup()
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')
    render(<ContextTerms termIds={['account', 'device']} terms={terms} />)
    const account = screen.getByRole('button', { name: 'Account' })
    const device = screen.getByRole('button', { name: 'Device' })

    await user.click(account)
    expect(account).toHaveFocus()
    expect(account).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(accountTerm.definition)).toBeVisible()

    await user.click(device)
    expect(device).toHaveFocus()
    expect(account).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(accountTerm.definition)).not.toBeInTheDocument()
    expect(screen.getByText(deviceTerm.definition)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Close definition' }))
    expect(device).toHaveFocus()
    expect(device).toHaveAttribute('aria-expanded', 'false')

    await user.click(account)
    await user.keyboard('{Escape}')
    expect(account).toHaveFocus()
    expect(account).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByRole('button', { name: 'Close definition' }),
    ).not.toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })

  it('handles unavailable and repeated references without inventing definitions', () => {
    render(
      <ContextTerms
        termIds={['account', 'missing', 'account']}
        terms={terms}
      />,
    )
    expect(screen.getAllByRole('button', { name: 'Account' })).toHaveLength(1)
    expect(
      screen.getByText("A definition isn't available for this term yet."),
    ).toBeVisible()
    expect(screen.queryByText('missing')).not.toBeInTheDocument()
  })

  it('dismisses inline help when the parent changes lesson identity', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <ContextTerms key="lesson-a" termIds={['account']} terms={terms} />,
    )
    await user.click(screen.getByRole('button', { name: 'Account' }))
    rerender(
      <ContextTerms key="lesson-b" termIds={['account']} terms={terms} />,
    )
    expect(screen.getByRole('button', { name: 'Account' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    rerender(
      <ContextTerms key="lesson-a" termIds={['account']} terms={terms} />,
    )
    expect(screen.getByRole('button', { name: 'Account' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('renders definition text safely and refuses non-HTTPS source links', async () => {
    const user = userEvent.setup()
    const unsafe: GlossaryTerm = {
      ...deviceTerm,
      definition: '<img src=x onerror=alert(1)> is example text.',
      sources: [{ ...resourceSource, url: 'javascript:alert(1)' }],
    }
    const { container } = render(<TermDefinition term={unsafe} />)
    expect(screen.getByText(unsafe.definition)).toBeVisible()
    expect(container.querySelector('img')).toBeNull()
    await user.click(screen.getByText('Definition sources & context'))
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText(/reference link unavailable/)).toBeVisible()
  })
})

describe('ShareLesson', () => {
  it('confirms only a completed write and prevents repeated pending activation', async () => {
    const user = userEvent.setup()
    const write = deferred()
    const writeText = vi.fn().mockReturnValue(write.promise)
    const readText = vi.fn()
    clipboard({ writeText, readText })
    render(<ShareLesson url={lessonUrl} />)

    await user.dblClick(
      screen.getByRole('button', { name: 'Copy lesson link' }),
    )
    expect(screen.getByRole('button', { name: 'Copying…' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Copying…' })).toHaveFocus()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(writeText).toHaveBeenCalledExactlyOnceWith(lessonUrl)
    await act(async () => write.resolve())
    expect(screen.getByRole('status')).toHaveTextContent('Lesson link copied.')
    expect(
      screen.getByRole('button', { name: 'Copy lesson link' }),
    ).toBeEnabled()
    expect(readText).not.toHaveBeenCalled()
  })

  it('offers a focused selectable read-only link when clipboard access is absent', async () => {
    const user = userEvent.setup()
    clipboard(undefined)
    render(<ShareLesson url={lessonUrl} />)
    await user.click(screen.getByRole('button', { name: 'Copy lesson link' }))

    const fallback = screen.getByRole('textbox', { name: 'Lesson link' })
    expect(fallback).toHaveValue(lessonUrl)
    expect(fallback).toHaveAttribute('readonly')
    expect(fallback).toHaveFocus()
    expect((fallback as HTMLTextAreaElement).selectionStart).toBe(0)
    expect((fallback as HTMLTextAreaElement).selectionEnd).toBe(
      lessonUrl.length,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      "Copy isn't available. Select the link below.",
    )
    expect(screen.queryByText('Lesson link copied.')).not.toBeInTheDocument()
  })

  it('shows manual copy without claiming success after permission denial', async () => {
    const user = userEvent.setup()
    clipboard({
      writeText: vi
        .fn()
        .mockRejectedValue(new DOMException('Denied', 'NotAllowedError')),
    })
    render(<ShareLesson url={lessonUrl} />)
    await user.click(screen.getByRole('button', { name: 'Copy lesson link' }))
    expect(screen.getByRole('textbox', { name: 'Lesson link' })).toHaveValue(
      lessonUrl,
    )
    expect(screen.getByRole('status')).not.toHaveTextContent('copied')
  })

  it('does not steal focus when a pending denial follows another reader action', async () => {
    const user = userEvent.setup()
    const write = deferred()
    clipboard({ writeText: vi.fn().mockReturnValue(write.promise) })
    render(
      <>
        <ShareLesson url={lessonUrl} />
        <input aria-label="Continue reading" />
      </>,
    )
    await user.click(screen.getByRole('button', { name: 'Copy lesson link' }))
    const next = screen.getByRole('textbox', { name: 'Continue reading' })
    await user.click(next)
    await act(async () => write.reject(new Error('Denied')))
    expect(next).toHaveFocus()
    expect(screen.getByRole('textbox', { name: 'Lesson link' })).toHaveValue(
      lessonUrl,
    )
  })

  it('invalidates an obsolete success across A → B → A and permits a new write', async () => {
    const user = userEvent.setup()
    const oldWrite = deferred()
    const newWrite = deferred()
    const writeText = vi
      .fn()
      .mockReturnValueOnce(oldWrite.promise)
      .mockReturnValueOnce(newWrite.promise)
    clipboard({ writeText })
    const { rerender } = render(<ShareLesson url={lessonUrl} />)
    await user.click(screen.getByRole('button', { name: 'Copy lesson link' }))
    rerender(<ShareLesson url={complianceUrl} />)
    rerender(<ShareLesson url={lessonUrl} />)
    await act(async () => oldWrite.resolve())
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(
      screen.getByRole('button', { name: 'Copy lesson link' }),
    ).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Copy lesson link' }))
    await act(async () => newWrite.resolve())
    expect(screen.getByRole('status')).toHaveTextContent('Lesson link copied.')
    expect(writeText).toHaveBeenCalledTimes(2)
  })

  it('invalidates an obsolete denial across A → B → A without feedback or focus changes', async () => {
    const user = userEvent.setup()
    const write = deferred()
    clipboard({ writeText: vi.fn().mockReturnValue(write.promise) })
    const { rerender } = render(<ShareLesson url={lessonUrl} />)
    await user.click(screen.getByRole('button', { name: 'Copy lesson link' }))
    rerender(<ShareLesson url={complianceUrl} />)
    rerender(<ShareLesson url={lessonUrl} />)
    const currentButton = screen.getByRole('button', {
      name: 'Copy lesson link',
    })
    currentButton.focus()
    await act(async () => write.reject(new Error('Denied')))
    expect(
      screen.queryByRole('textbox', { name: 'Lesson link' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(currentButton).toHaveFocus()
  })

  it('suppresses write feedback after unmount, including under StrictMode', async () => {
    const user = userEvent.setup()
    const write = deferred()
    clipboard({ writeText: vi.fn().mockReturnValue(write.promise) })
    const { unmount } = render(
      <StrictMode>
        <ShareLesson url={lessonUrl} />
      </StrictMode>,
    )
    await user.click(screen.getByRole('button', { name: 'Copy lesson link' }))
    unmount()
    render(<input aria-label="Next lesson" />)
    const next = screen.getByRole('textbox', { name: 'Next lesson' })
    next.focus()
    await act(async () => write.reject(new Error('Denied')))
    expect(next).toHaveFocus()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('textbox', { name: 'Lesson link' }),
    ).not.toBeInTheDocument()
  })
})
