import type { SitePage } from '../../state/site-page'
import { UsagePreferences } from '../../analytics/UsagePreferences'
import { marksShown, pickUpSmudge, useDoodle, wipeMarks } from './doodle-state'
import { SmudgeSwitch } from './SmudgeSwitch'

const repositoryUrl = 'https://github.com/WaylandP/cipher-and-chalk'

/**
 * One line directly above the tray on every page: the project's limits, and
 * the pages and switches that live off the nav. While a hand holds the chalk
 * or Smudge, or the page carries marks that need a word, the line says so
 * instead, once, politely.
 */
export function SiteFooter({ page }: { readonly page: SitePage }) {
  const doodle = useDoodle()
  const { up, eraser, full, foreign, marks, room } = doodle
  // Marks the screen is too different for say why they are not drawn.
  const mismatch = marks.length > 0 && room > 0 && !marksShown(doodle)
  // A footer action takes its own button away: focus goes somewhere real.
  const wipe = () => {
    wipeMarks()
    document.getElementById('main')?.focus()
  }
  const line = eraser ? (
    <>
      <span className="hand">Erasing.</span> Esc or the tray puts Smudge back ·{' '}
      <button type="button" className="footer-action" onClick={wipe}>
        Wipe all
      </button>
    </>
  ) : up ? (
    full ? (
      <>
        <span className="hand">The board is full.</span> Erase something to keep
        drawing.
      </>
    ) : (
      <>
        <span className="hand">Doodling.</span> Your marks stay on this page and
        go with its link. Esc or the tray puts the chalk back. Pick up Smudge to
        erase.
      </>
    )
  ) : mismatch ? (
    <>
      This link has chalk marks drawn on a different screen size. Open it on a
      wider screen to see them.
    </>
  ) : foreign ? (
    <>
      Chalk marks from the link you opened. They aren’t part of Cipher &amp;
      Chalk.{' '}
      <button
        type="button"
        className="footer-action"
        onClick={() => pickUpSmudge(true)}
      >
        Pick up Smudge to erase them
      </button>{' '}
      ·{' '}
      <button type="button" className="footer-action" onClick={wipe}>
        Wipe all
      </button>
    </>
  ) : null
  return (
    <footer className={`site-footer${line ? ' is-doodling' : ''}`}>
      <p className="footer-doodling" role="status">
        {line}
      </p>
      {!line && (
        <p className="footer-note">
          Independent and educational. Not legal advice; not affiliated with DoD
          or NIST.{' '}
          <a
            href="/disclaimer"
            aria-current={page === 'disclaimer' ? 'page' : undefined}
          >
            Disclaimer &amp; terms
          </a>
        </p>
      )}
      <div className="footer-links" hidden={Boolean(line)}>
        <a
          href="/coverage"
          aria-current={page === 'coverage' ? 'page' : undefined}
        >
          Assessment objectives
        </a>
        <UsagePreferences />
        <SmudgeSwitch />
        <a
          href={`${repositoryUrl}/blob/main/LICENSE`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open source · MIT
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </footer>
  )
}
