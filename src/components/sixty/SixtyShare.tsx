import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Share2 } from 'lucide-react'

interface SixtyShareProps {
  /** The MP4, on this site. */
  readonly video: string
  /** The address that plays the chalk talk. */
  readonly link: string
}

type Copied = 'idle' | 'copied' | 'fallback'

const VIDEO_NAME = 'cmmc-in-sixty-seconds.mp4'

/** Whether this browser can share an MP4 as a file (a phone, mostly). */
function canSendFiles(): boolean {
  try {
    return (
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      typeof File === 'function' &&
      navigator.canShare({
        files: [new File([], VIDEO_NAME, { type: 'video/mp4' })],
      })
    )
  } catch {
    return false
  }
}

/**
 * Share, at the end of the player row: a 44px button that opens a small
 * menu in the style of the chalk popovers. "Send the video…" (only where
 * the browser can share an MP4 as a file) shares the file itself, fetched
 * when the menu opens so the share runs straight from the tap; "Copy link"
 * copies the address that plays the chalk talk and says "Link copied" in a
 * status region (if the clipboard is refused, the link appears selected in
 * a read-only field); "Download the video" downloads it. Escape and a click
 * outside close the menu and return focus to Share. Nothing about sharing
 * is logged or counted.
 */
export function SixtyShare({ video, link }: SixtyShareProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [sendable, setSendable] = useState(false)
  const [copied, setCopied] = useState<Copied>('idle')
  const button = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLInputElement>(null)
  const file = useRef<Promise<File> | null>(null)

  const close = useCallback((focus: boolean) => {
    setOpen(false)
    setCopied('idle')
    if (focus) button.current?.focus()
  }, [])

  const toggle = useCallback(() => {
    if (open) {
      close(true)
      return
    }
    const sendable = canSendFiles()
    setSendable(sendable)
    // The file, fetched now, so a tap on "Send the video…" shares at once.
    if (sendable && !file.current)
      file.current = fetch(video)
        .then((response) => {
          if (!response.ok) throw new Error(`${response.status}`)
          return response.blob()
        })
        .then((blob) => new File([blob], VIDEO_NAME, { type: 'video/mp4' }))
        .catch((error: unknown) => {
          file.current = null
          throw error
        })
    setCopied('idle')
    setOpen(true)
  }, [close, open, video])

  // Open: focus the first item; a click outside closes and returns focus
  // to Share (after the click has moved focus wherever it was going).
  useEffect(() => {
    if (!open) return
    const first = menu.current?.querySelector<HTMLElement>('[role="menuitem"]')
    first?.focus()
    const outside = (event: MouseEvent) => {
      const target = event.target
      if (
        target instanceof Node &&
        (menu.current?.contains(target) || button.current?.contains(target))
      )
        return
      close(true)
    }
    document.addEventListener('click', outside)
    return () => document.removeEventListener('click', outside)
  }, [close, open])

  // The clipboard refused: the link, selected, in a read-only field.
  useEffect(() => {
    if (copied === 'fallback') {
      field.current?.focus()
      field.current?.select()
    }
  }, [copied])

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close(true)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const items = Array.from(
        menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
      )
      if (!items.length) return
      event.preventDefault()
      event.stopPropagation()
      const at = items.indexOf(document.activeElement as HTMLElement)
      const step = event.key === 'ArrowDown' ? 1 : -1
      items[(at + step + items.length) % items.length]?.focus()
    }
  }

  const send = async () => {
    try {
      const sent = await (file.current ?? Promise.reject(new Error('no file')))
      await navigator.share({ files: [sent], title: 'CMMC in sixty seconds' })
      close(true)
    } catch {
      // Cancelled, or the file could not be had: the menu stays for the other ways.
    }
  }

  const copy = async () => {
    try {
      if (typeof navigator.clipboard?.writeText !== 'function')
        throw new Error('no clipboard')
      await navigator.clipboard.writeText(link)
      setCopied('copied')
    } catch {
      setCopied('fallback')
    }
  }

  return (
    <div className="sixty-share-wrap">
      <button
        ref={button}
        type="button"
        className="sixty-share"
        aria-label="Share"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={toggle}
      >
        <Share2 aria-hidden="true" focusable="false" />
      </button>
      {open && (
        <div
          ref={menu}
          id={`${id}-menu`}
          className="sixty-menu"
          role="menu"
          aria-label="Share"
          onKeyDown={onKeyDown}
        >
          {sendable && (
            <button
              type="button"
              role="menuitem"
              className="sixty-menu-item"
              onClick={send}
            >
              Send the video…
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="sixty-menu-item"
            onClick={copy}
          >
            Copy link
          </button>
          <a
            role="menuitem"
            className="sixty-menu-item"
            href={video}
            download={VIDEO_NAME}
          >
            Download the video
            <span className="sixty-menu-note">MP4 · 1:00</span>
          </a>
          <p className="sixty-share-status" role="status" aria-live="polite">
            {copied === 'copied' && 'Link copied'}
          </p>
          {copied === 'fallback' && (
            <input
              ref={field}
              className="sixty-share-field mono"
              type="text"
              readOnly
              value={link}
              aria-label="Link to copy"
            />
          )}
        </div>
      )}
    </div>
  )
}
