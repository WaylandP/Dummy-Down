import type { SitePage } from '../../state/site-page'
import { UsagePreferences } from '../../analytics/UsagePreferences'
import { DashSwitch } from './DashSwitch'

const repositoryUrl = 'https://github.com/WaylandP/cipher-and-chalk'

/**
 * One line above the tray: the project's limits, and the pages that live off
 * the nav. Home carries the stranger's line instead: made by whom, the source,
 * and the privacy promise.
 */
export function SiteFooter({ page }: { readonly page: SitePage }) {
  if (page === 'home')
    return (
      <footer className="site-footer site-footer-home">
        <p className="footer-note">
          Made by one person, in the open.{' '}
          <a href={repositoryUrl} target="_blank" rel="noopener noreferrer">
            Source on GitHub
            <span className="sr-only"> (opens in a new tab)</span>
          </a>{' '}
          · No account. Nothing you type is collected.
        </p>
      </footer>
    )
  return (
    <footer className="site-footer">
      <p className="footer-note">
        Independent and educational. Not legal advice; not affiliated with DoD,
        NIST or any certification body.{' '}
        <a
          href="/disclaimer"
          aria-current={page === 'disclaimer' ? 'page' : undefined}
        >
          Disclaimer &amp; terms of use
        </a>
      </p>
      <div className="footer-links">
        <a
          href="/coverage"
          aria-current={page === 'coverage' ? 'page' : undefined}
        >
          Assessment objectives
        </a>
        <UsagePreferences />
        <DashSwitch />
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
