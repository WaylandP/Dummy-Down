import type { SitePage } from '../../state/site-page'
import { UsagePreferences } from '../../analytics/UsagePreferences'
import { useDoodleUp } from './doodle-state'
import { SmudgeSwitch } from './SmudgeSwitch'

const repositoryUrl = 'https://github.com/WaylandP/cipher-and-chalk'

/**
 * One line directly above the tray on every page: the project's limits, and
 * the pages and switches that live off the nav. While the doodle chalk is up
 * the line says so instead, once, politely.
 */
export function SiteFooter({ page }: { readonly page: SitePage }) {
  const doodling = useDoodleUp()
  return (
    <footer className={`site-footer${doodling ? ' is-doodling' : ''}`}>
      <p className="footer-doodling" role="status">
        {doodling && (
          <>
            <span className="hand">Doodling.</span> Your marks stay on this
            screen only. Esc or the tray puts the chalk back. Click Smudge to
            wipe them.
          </>
        )}
      </p>
      {!doodling && (
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
      <div className="footer-links" hidden={doodling}>
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
