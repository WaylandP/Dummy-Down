import { filterControls } from '../../data/control-search'
import { referenceControls } from '../../data/content'
import { trackUsage } from '../../analytics/usage'

/** The native GET contract every find-a-control line shares with Home. */
export const findControlAction = '/learn'
export const findControlFields = {
  view: 'discover',
  collection: 'references',
  catalog: 'cmmc',
} as const

/** Record the outcome of a submitted search; the text itself never leaves the page. */
export function reportFindControl(query: string) {
  trackUsage({
    name: 'search_used',
    scope: 'explorer',
    active: Boolean(query.trim()),
    resultCount: filterControls(referenceControls, {
      frameworkId: 'cmmc',
      query,
    }).length,
  })
}
