import type { SitePage } from '../../state/site-page'
import { UsagePreferences } from '../../analytics/UsagePreferences'

const repositoryUrl = 'https://github.com/WaylandP/cipher-and-chalk'

/** One line above the tray: the project's limits, and the pages that live off the nav. */
export function SiteFooter({ page }: { readonly page: SitePage }) {
  return (
    <footer className="site-footer">
      <p className="footer-note">
        Independent and educational. Not legal advice; not affiliated with DoD,
        NIST or any certification body.
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
