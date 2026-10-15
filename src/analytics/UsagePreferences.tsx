import { useUsagePreference } from './privacy'
import { trackUsage } from './usage'

export function UsagePreferences() {
  const { status, preferenceEnabled, setEnabled } = useUsagePreference()
  const message =
    status === 'active'
      ? 'Usage measurement is allowed on this production site.'
      : status === 'browser-preference'
        ? 'Usage measurement is paused by your browser’s privacy preference.'
        : status === 'opted-out'
          ? 'Usage measurement is paused for this browser.'
          : status === 'unavailable'
            ? 'Usage measurement is paused because browser preferences are unavailable.'
            : 'Usage measurement is off in this development or preview environment.'

  return (
    <details
      id="usage"
      className="usage-preferences"
      onToggle={(event) => {
        if (event.currentTarget.open)
          trackUsage({ name: 'section_open', section: 'usage' })
      }}
    >
      <summary>Usage &amp; privacy</summary>
      <div className="usage-panel">
        <svg className="usage-panel-dust" aria-hidden="true" focusable="false">
          <rect width="100%" height="100%" filter="url(#dust)" />
        </svg>
        <p>
          On the production site, Vercel Web Analytics measures visits and
          learning interactions so we can improve Cipher &amp; Chalk.
          Interaction events use catalog identifiers and categories; search
          text, answer choices, and copied links are excluded. Page URLs have
          their query and fragment removed. Chalk marks live only in your
          browser tab and in links you choose to share; Cipher &amp; Chalk never
          receives them.
        </p>
        <p>
          We respect Do Not Track and Global Privacy Control. Your preference
          below is stored in this browser. Vercel processes traffic information
          under its{' '}
          <a
            href="https://vercel.com/docs/analytics/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Web Analytics privacy information
          </a>
          .
        </p>
        <p role="status" aria-live="polite">
          {message}
        </p>
        <button
          type="button"
          className="inline-action"
          onClick={() => setEnabled(!preferenceEnabled)}
        >
          {preferenceEnabled
            ? 'Pause usage measurement'
            : 'Allow usage measurement'}
        </button>
      </div>
    </details>
  )
}
