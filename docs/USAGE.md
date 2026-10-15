# Usage measurement

Cipher & Chalk uses the official `@vercel/analytics` React SDK. The website does not
display fabricated visitor counts or expose an owner-only dashboard publicly.
The owner reviews actual traffic in Vercel, through a browser.

## Open the owner dashboard

1. Sign in at [Vercel](https://vercel.com/dashboard), select the team that owns
   the project, and open the `cipherandchalk` project.
2. Open **Analytics**. If Web Analytics is disabled, select **Enable** and follow
   Vercel's account instructions. This repository change does not activate the
   service or approve charges on the owner's behalf.
3. After the owner approves a merge and Vercel builds the production deployment,
   visit the production site and interact with it. Preview deployments intentionally
   do not generate usage data. Use the Analytics production-environment filter.
4. Review visitors, views, referral sources, devices, and the events below where
   the current Vercel plan makes them available. Custom events and retention are
   subject to Vercel's current plan, limits, and pricing; installing the SDK does
   not guarantee account entitlement or that the provider has received data.

No Vercel token, analytics secret, or account activation call belongs in client
code. The normal Vercel Git integration continues to build previews for review;
this change does not merge a pull request or deploy production manually.

## What the app measures

The app sends a sanitized public-page path on a full production-page load.
It disables automatic pageviews for the query-driven Explorer's history updates,
so typing a search does not create a series of artificial visits. Deliberate
actions explain how readers use the learning workspace:

| Event                  | Purpose                                                         | Allowed metadata                                              |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- |
| `section_open`         | Which main sections readers choose                              | Known section                                                 |
| `control_open`         | Which controls attract attention                                | Catalog-resolved framework, edition, official ID, kind, level |
| `control_view`         | Which controls are rendered, including shared links and history | Known control and mode                                        |
| `perspective_change`   | Which explanations readers choose                               | Known control and mode                                        |
| `perspective_feedback` | Where explanations need improvement                             | Known control, mode, helpful yes/no                           |
| `filter_change`        | How readers narrow the catalog                                  | Known filter and catalog value                                |
| `search_used`          | Whether search produces useful results                          | Search scope, active yes/no, result bucket: none/one/few/many |
| `results_page`         | Whether readers explore beyond the first page                   | Previous/next and content collection                          |
| `practice_action`      | Whether readers try and continue practice                       | Known supported lesson and action category                    |
| `source_open`          | Whether readers consult primary publications                    | Known control, source ID, publisher/mirror/index category     |
| `share_link`           | Whether readers share the material                              | Known control and copied/fallback category                    |

Helpers validate values at runtime against the shipped catalog, and construct
new property objects instead of forwarding caller payloads. There are no raw
search terms, answer choices, correctness/scores, clipboard contents, full lesson
links, organizational evidence, or invented visitor identifiers in these custom
event properties. Do not add free-text properties to this allowlist. Search
measurements happen on deliberate submission or leaving the search field, not
on every keystroke. Incoming links and browser Back/Forward are not counted as
fresh deliberate control selections or perspective changes.
Their rendered controls are measured separately as `control_view`, without
duplicating unchanged rerenders or React StrictMode effects. A rendered control
may be below the fold; this event does not establish visibility, reading,
understanding or time spent. Do not add view and open counts together as unique
visitors or treat either as assessment progress.

## Deployment and visitor preferences

The Vite build exposes only the non-secret Vercel deployment category through
`import.meta.env.VITE_USAGE_DEPLOYMENT`. Measurement requires **both** a production
Vite build and the exact Vercel category `production`. Development, preview, tests,
and deployments without that category do not inject the analytics script or emit
custom events. A local `vite preview` of a production artifact still contains the
artifact's build category; avoid using production artifacts for synthetic traffic.

The visible **Usage & privacy** section lets a reader pause measurement. It stores
only `on` or `off` in `localStorage` under `cipher-and-chalk:usage-preference`; it does not
store a visitor ID. Do Not Track (`1` or `yes`) and Global Privacy Control take
precedence over allowing measurement. If preference storage cannot be accessed,
collection fails closed. The SDK's `beforeSend` hook checks the current preference
for each pageview and custom event, including after a previously allowed SDK was
loaded. Pausing cannot undo an event already sent or an in-flight request.

Every pageview and custom-event URL is restricted to the current origin's `/`,
`/learn`, `/glossary`, `/practice`, `/coverage`, `/about`, `/disclaimer` or `/timeline` path (trailing slash normalized), with all query
parameters and fragments removed. Known control metadata
comes from the local catalog, never by forwarding the address bar. Unknown paths
and external URLs are discarded. If new app routes are added, explicitly review
and extend the pathname allowlist.

Vercel operates the collection service. It receives network traffic and processes
information such as browser/device, approximate location, and referral information
under its own policy. The public SDK's `beforeSend` interface exposes the event
URL, not a separate referrer field; the app therefore does not claim to sanitize
provider-managed referrers or all network metadata. Review
[Vercel's Web Analytics privacy information](https://vercel.com/docs/analytics/privacy-policy)
and the applicable account settings before using the collected data. Cipher & Chalk
does not add session replay, fingerprinting code, or personalized profiles.

## Reading the results

Useful first questions: Which CMMC levels and families are opened? Which
perspective is used for those controls? Which explanations receive “need another
angle” feedback? Do searches often return no results? Do people open citations
and the glossary? Does practice get opened but seldom completed? These are
aggregate signals for editorial and usability improvements, not assessment or
learning-success scores. Counts can be reduced by opt-outs, browser protection,
ad blockers, failed delivery, and the provider's retention or limits.

Application events contain no person identifier and are intended for aggregate
review rather than reconstructing individual learning journeys. For reliable quality checks, combine
aggregate usage with voluntary issue reports and usability testing; do not infer
compliance readiness from reading activity.

## Verification and source context

The focused analytics tests check production gating, privacy preferences, URL
sanitization, and rejected metadata. Additional unmocked SDK tests inspect its
queue and script configuration, including pageview counts across privacy toggles.
jsdom does not fetch or execute the collector script. These checks prove local
integration behavior, not successful receipt by Vercel or dashboard activation.

The implementation was checked against the installed official SDK `2.0.1` and
the [official SDK source](https://github.com/vercel/analytics/tree/main/packages/web/src).
The documentation host returned HTTP 403 from the cloud environment during
development, so account-plan availability and live collector behavior were not
independently verified here. The SDK itself links the
[package documentation](https://vercel.com/docs/analytics/package),
[custom-event documentation](https://vercel.com/docs/analytics/custom-events), and
[quickstart](https://vercel.com/docs/analytics/quickstart).

The coverage report adds only `/coverage` to the public pathname allowlist.
Control, search, level, coverage status and pagination query values are stripped
before any SDK submission. No coverage-search or objective-level custom event is
added. Existing production gating, opt-out, DNT and GPC protections still apply;
preview deployment success does not establish provider receipt of analytics.

The Practice page adds only `/practice` to that same allowlist. Its situation,
question, level and search queries are removed; question choices and feedback
are not collected.

Chalk marks live only in your browser tab and in links you choose to share;
Cipher & Chalk never receives them. The doodle chalk's marks are kept in memory,
per page, while the page stays loaded (never in local or session storage) and in the
page's own address as the fragment `#ink=…`, which Copy link and Send this chalk
carry; usage URLs have their fragment removed before any submission, so the
marks are not stored, not sent and not counted. No event records that the chalk
or Smudge was picked up.

Optional learning progress is a separate local feature. Its opt-in stores public
catalog and checked-choice identifiers on this origin; it never sends those
records to usage measurement. Progress permission and analytics permission do not
change each other. Search, level, situation and question queries are all removed
from analytics URLs. See [LOCAL_PROGRESS.md](LOCAL_PROGRESS.md) for fields, deletion,
GPC/DNT and browser-storage restrictions.
