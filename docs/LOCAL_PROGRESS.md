# Optional learning progress

Saving starts off. Open **Learning progress on this browser** in a lesson and
choose **Save learning on this browser**, or turn the Practice page's **Keep my
progress on this browser** line on. No account is needed.
Checked answers, the current question, visited/completed states and revisit marks
can then survive navigation and reload. A completion means the exercise was
finished, including any incorrect choices; it is never a compliance result.

The Practice page marks finished situations and can hide them, and a situation
opens on the question in hand (the address may look back at an answered one,
never ahead). In a lesson, an unfinished practice offers **Review earlier
answers** and a finished one **Review the reasoning**; both explain the latest
checked choice and the intended takeaway. An unchecked radio selection is
temporary. Retry replaces the latest answer; this is not a history of attempts.

## Stored data and deletion

Three localStorage keys use the existing project namespace:

- `cipher-and-chalk:learning-saving:v1`: the explicit `on` permission marker.
- `cipher-and-chalk:learning-progress:v1`: a schema-1 document containing public activity,
  framework, edition, control, question and choice identifiers; an authored content
  version; current question; and visited/completed/revisit flags.
- `cipher-and-chalk:last-control:v1`: the framework, edition and control
  identifiers of the control opened last, written only while saving is on and
  shown on Home as "Last time".

Three preference keys in the same namespace are not progress and are not
removed with it: `cipher-and-chalk:usage-preference` (the Usage & privacy
switch), `cipher-and-chalk:smudge:v1` (the footer's Smudge switch, which stores
only `off`) and `cipher-and-chalk:chalk:v1` (the chalk picked on Home: one of
`beginner`, `it-cyber` or `compliance`). No free text, search, organizational evidence, CUI,
scores, timestamps, visitor identifiers or network synchronization are added. Progress is not passed to
analytics and saving permission does not change usage-measurement permission.
Anyone using the same browser profile can see the saved practice. Storage is
specific to the website origin: a Vercel preview and production do not share it.
Browsers may evict data; this is a convenience, not a backup.

**Delete progress and stop saving** clears both saved and current in-memory
practice. It revokes permission first. Other tabs reconcile live storage, and an
ordinary practice action cannot grant saving permission. Removal failures fall
back to an off marker and empty document. If both removal and replacement fail,
the page stops saving and explicitly reports that deletion is unconfirmed. Clear
site data in browser settings in that case. A future page cannot remember an
unsaved revocation if the browser refuses every write/removal.

Global Privacy Control or Do Not Track (`1`/`yes`) disables optional persistence
and attempts to remove the three keys. Storage restrictions keep ordinary practice
usable in memory. Removing a privacy signal does not silently resume saving.

## Implementation boundaries

`LocalProgressProvider` owns one external store above the route. React reads stable
snapshots with `useSyncExternalStore`; the existing question player still renders
and focuses its native controls. Restore and cross-tab updates do not fabricate
practice events or move focus automatically. The Practice page's list marks
nothing; the situation running on it is visited, as a lesson is.

The decoder accepts only the exact schema and entry fields. It caps documents at
64,000 characters / 256 entries and validates lesson identity, content version,
question/choice membership, checked-answer order and completion consistency against
the actual catalog. Malformed documents fail closed; stale individual activities
are dropped while valid ones survive. All currently published activities are
covered by a catalog-support integrity assertion.

Editors must bump an activity's `contentVersion` whenever changed questions,
choices, feedback or teaching meaning invalidate an earlier attempt. A version
check cannot detect an editor forgetting to bump it. Source-bound changes also
require renewed editorial comparison before updating review fingerprints. A new
catalog needs a fresh provider/store, as a normal deployment/page load provides.

When one tab enables saving, distinct unsaved activities can join the live saved
record. Existing stored entries win same-activity conflicts, including a restart.
Explicit deletion/clear takes precedence over stale in-memory work. Ordinary
simultaneous writes still use localStorage's last-writer behavior; this is not a
transactional database or cross-device synchronization.

Unit tests exercise malformed/stale data, storage failures, consent and deletion
races, and cross-tab reconciliation. Browser tests exercise real reload, separate
tabs, interruption, review, completion, clear, privacy signals, keyboard controls,
forced colors, and responsive layouts. These checks do not establish real-learner
acceptance or assistive-technology certification.
