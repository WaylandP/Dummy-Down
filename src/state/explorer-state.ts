import { filterControls } from '../data/control-search'
import type {
  ContentEdition,
  CatalogControl,
  ExplanationMode,
  Framework,
  LessonIdentity,
  ReferenceControl,
} from '../types/content'

export interface ExplorerCatalog {
  readonly frameworks: readonly Framework[]
  readonly editions: readonly ContentEdition[]
  readonly controls: readonly CatalogControl[]
  readonly defaultLesson: LessonIdentity | null
}

/**
 * The one collection on the board: the pinned source references. The first
 * version kept a second, `lessons`, for its README demo; an older address
 * that names it opens the references, and every address still writes
 * `collection=references` so existing links keep working.
 */
export type ExplorerCollection = 'references'

/** The views of a control; Decode is the one a bare address opens. Rev 3 exists for Level 2 controls. */
export type ControlTab =
  'decode' | 'explain' | 'evidence' | 'practice' | 'related' | 'rev3'
export const controlTabs: readonly ControlTab[] = [
  'decode',
  'explain',
  'evidence',
  'practice',
  'related',
  'rev3',
]

export interface ExplorerFilters {
  readonly catalog: string
  readonly query: string
  readonly family: string
  readonly level: string
  /** Always the references; absent means the same. */
  readonly collection?: ExplorerCollection
}

export type ValidExplorerState = {
  readonly mode: ExplanationMode
  readonly filters: ExplorerFilters
  /** Absent means Decode; never serialized as the default. */
  readonly tab?: ControlTab
} & (
  | { readonly view: 'lesson'; readonly lesson: LessonIdentity }
  | { readonly view: 'discover' }
)

export type AddressError =
  | 'malformed-encoding'
  | 'duplicate-parameter'
  | 'invalid-view'
  | 'incomplete-identity'
  | 'conflicting-state'
  | 'invalid-identity'
  | 'unknown-catalog'
  | 'invalid-collection'

export type NormalizationNotice =
  'mode-reset' | 'tab-reset' | 'chalk-reset' | 'family-reset' | 'level-reset'

export type ParsedExplorerState =
  | {
      readonly kind: 'ready'
      readonly state: ValidExplorerState
      readonly notices: readonly NormalizationNotice[]
    }
  | { readonly kind: 'invalid'; readonly reason: AddressError }

export type LessonResolution =
  | {
      readonly kind: 'lesson'
      readonly control: ReferenceControl
      readonly framework: Framework
      readonly edition: ContentEdition
      readonly excludedByFilters: boolean
    }
  | { readonly kind: 'not-found'; readonly identity: LessonIdentity }
  | { readonly kind: 'planned-framework'; readonly framework: Framework }

export type ExplorerIntent =
  | { readonly type: 'select-lesson'; readonly identity: LessonIdentity }
  | { readonly type: 'change-mode'; readonly mode: ExplanationMode }
  /** A chalk from the tray or the keys: the mode and the Explain view in one step. */
  | { readonly type: 'pick-chalk'; readonly mode: ExplanationMode }
  | { readonly type: 'set-tab'; readonly tab: ControlTab }
  | { readonly type: 'set-query'; readonly query: string }
  | { readonly type: 'set-catalog'; readonly catalog: string }
  | { readonly type: 'set-family'; readonly family: string }
  | { readonly type: 'set-level'; readonly level: string }
  | { readonly type: 'clear-filters' }
  | { readonly type: 'back-to-discovery' }
  | { readonly type: 'recover-discovery'; readonly mode?: ExplanationMode }
  | { readonly type: 'open-example'; readonly mode: ExplanationMode }
  | { readonly type: 'show-lesson-in-results' }

export interface ExplorerTransition {
  readonly parsed: ParsedExplorerState
  readonly history: 'push' | 'replace' | 'none'
  readonly fragment?: 'explorer'
}

const recognizedKeys = new Set([
  'view',
  'framework',
  'edition',
  'control',
  'mode',
  'catalog',
  'q',
  'family',
  'level',
  'collection',
  'tab',
  'chalk',
])
// `path=basics` named the Start here path, removed on October 15. It is not
// recognized on purpose: an old link opens its control and the parameter is
// ignored, like any other unrelated query data.
const identitySlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const modes: readonly ExplanationMode[] = ['beginner', 'it-cyber', 'compliance']

export function lessonIdentity(control: CatalogControl): LessonIdentity {
  return {
    frameworkId: control.frameworkId,
    editionId: control.editionId,
    controlKey: control.key,
  }
}

/** Official display identifiers can collide; editorial tuples cannot. */
export function lessonIdentityKey(identity: LessonIdentity): string {
  return `${identity.frameworkId}/${identity.editionId}/${identity.controlKey}`
}

function defaultCatalog(catalog: ExplorerCatalog): string {
  return (
    catalog.defaultLesson?.frameworkId ??
    catalog.frameworks.find((framework) => framework.id === 'cmmc')?.id ??
    catalog.frameworks[0]?.id ??
    'cmmc'
  )
}

export function effectiveCollection(
  filters: ExplorerFilters,
): ExplorerCollection {
  return filters.collection ?? 'references'
}

/** Only an official reference is on the board; the catalog keeps the retired demo for its identity. */
function isReference(control: CatalogControl): control is ReferenceControl {
  return control.contentKind === 'official-reference'
}

function referencesIn(catalog: ExplorerCatalog): ReferenceControl[] {
  return catalog.controls.filter(isReference)
}

function sameIdentity(control: CatalogControl, identity: LessonIdentity) {
  return (
    lessonIdentityKey(lessonIdentity(control)) === lessonIdentityKey(identity)
  )
}

/**
 * The first version taught one README demo lesson beside the references
 * (`edition=readme-example`, `control=authorized-access`). Its data stays in
 * the catalog so the identity is stable, but it is not on the board: an
 * address that names it, or any other control that is not an official
 * reference, opens the reference with the same official identifier in its
 * framework, the control the demo taught.
 */
export function retiredLessonTarget(
  identity: LessonIdentity,
  catalog: ExplorerCatalog,
): LessonIdentity | null {
  const retired = catalog.controls.find(
    (control) => !isReference(control) && sameIdentity(control, identity),
  )
  if (!retired) return null
  const reference = referencesIn(catalog).find(
    (control) =>
      control.frameworkId === retired.frameworkId && control.id === retired.id,
  )
  return reference ? lessonIdentity(reference) : null
}

function emptyFilters(catalogId: string): ExplorerFilters {
  return {
    catalog: catalogId,
    query: '',
    family: '',
    level: '',
    collection: 'references',
  }
}

function defaultState(catalog: ExplorerCatalog): ValidExplorerState {
  const shared = {
    mode: 'beginner' as const,
    filters: emptyFilters(defaultCatalog(catalog)),
  }
  return catalog.defaultLesson
    ? { ...shared, view: 'lesson', lesson: catalog.defaultLesson }
    : { ...shared, view: 'discover' }
}

function ready(
  state: ValidExplorerState,
  notices: readonly NormalizationNotice[] = [],
): ParsedExplorerState {
  return { kind: 'ready', state, notices }
}

function invalid(reason: AddressError): ParsedExplorerState {
  return { kind: 'invalid', reason }
}

function decodeQueryPart(value: string): string {
  return decodeURIComponent(value.replace(/\+/g, ' '))
}

function normalizeFilters(
  filters: ExplorerFilters,
  catalog: ExplorerCatalog,
): { filters: ExplorerFilters; notices: NormalizationNotice[] } {
  const available = referencesIn(catalog).filter(
    (control) => control.frameworkId === filters.catalog,
  )
  const validFamily =
    !filters.family ||
    available.some((control) => control.family === filters.family)
  const validLevel =
    !filters.level ||
    available.some((control) => control.level === filters.level)
  const notices: NormalizationNotice[] = []
  if (!validFamily) notices.push('family-reset')
  if (!validLevel) notices.push('level-reset')
  return {
    filters: {
      ...filters,
      family: validFamily ? filters.family : '',
      level: validLevel ? filters.level : '',
    },
    notices,
  }
}

/**
 * location.search -> strict raw decoding -> explicit state -> exact local lesson.
 * Intent transitions alone may clear a selection; history replay never does.
 */
export interface ParseOptions {
  /** The chalk for an address that names none; white when absent. */
  readonly defaultMode?: ExplanationMode
}

export function parseExplorerSearch(
  search: string,
  catalog: ExplorerCatalog,
  options: ParseOptions = {},
): ParsedExplorerState {
  const values = new Map<string, string>()
  for (const pair of search.replace(/^\?/, '').split('&')) {
    if (!pair) continue
    const separator = pair.indexOf('=')
    const rawKey = separator === -1 ? pair : pair.slice(0, separator)
    const rawValue = separator === -1 ? '' : pair.slice(separator + 1)
    let key: string
    try {
      key = decodeQueryPart(rawKey)
    } catch {
      // An undecodable name cannot safely be classified as unrelated input.
      return invalid('malformed-encoding')
    }
    if (!recognizedKeys.has(key)) continue
    if (values.has(key)) return invalid('duplicate-parameter')
    try {
      values.set(key, decodeQueryPart(rawValue))
    } catch {
      return invalid('malformed-encoding')
    }
  }
  if (!values.size)
    return ready({
      ...defaultState(catalog),
      mode: options.defaultMode ?? 'beginner',
    })

  const view = values.get('view')
  if (view !== 'lesson' && view !== 'discover') return invalid('invalid-view')
  const hasIdentity = ['framework', 'edition', 'control'].some((key) =>
    values.has(key),
  )
  if (view === 'discover' && hasIdentity) return invalid('conflicting-state')

  let identity: LessonIdentity | undefined
  if (view === 'lesson') {
    const frameworkId = values.get('framework')
    const editionId = values.get('edition')
    const controlKey = values.get('control')
    if (!frameworkId || !editionId || !controlKey)
      return invalid('incomplete-identity')
    if (
      ![frameworkId, editionId, controlKey].every((key) =>
        identitySlug.test(key),
      )
    )
      return invalid('invalid-identity')
    const named = { frameworkId, editionId, controlKey }
    // An older link to the retired demo opens the control it taught; the
    // store then rewrites the address to that control.
    identity = retiredLessonTarget(named, catalog) ?? named
  }

  const explicitCatalog = values.get('catalog')
  if (
    values.has('catalog') &&
    !catalog.frameworks.some((framework) => framework.id === explicitCatalog)
  )
    return invalid('unknown-catalog')
  const catalogId =
    explicitCatalog ?? identity?.frameworkId ?? defaultCatalog(catalog)
  // `lessons` was the first version's demo collection: it opens the references.
  const explicitCollection = values.get('collection')
  if (
    values.has('collection') &&
    explicitCollection !== 'lessons' &&
    explicitCollection !== 'references'
  )
    return invalid('invalid-collection')
  const rawMode = values.get('mode')
  const notices: NormalizationNotice[] = []
  // A chalk in a lesson address owns the perspective and opens Explain unless
  // the link names a view; it is read once and never written back. A colour
  // the tray lacks shows the white chalk. Discovery ignores a chalk quietly.
  const namesChalk = Boolean(identity) && values.has('chalk')
  const rawChalk = values.get('chalk')
  const chalk =
    rawChalk && Object.hasOwn(chalkColours, rawChalk)
      ? chalkColours[rawChalk as ChalkColour]
      : null
  // An address without a mode opens in the chalk the visitor picked on Home.
  const mode = namesChalk
    ? (chalk ?? 'beginner')
    : (modes.find((item) => item === rawMode) ??
      options.defaultMode ??
      'beginner')
  if (!namesChalk && values.has('mode') && rawMode !== mode)
    notices.push('mode-reset')
  if (namesChalk && !chalk) notices.push('chalk-reset')
  // A view only belongs to a lesson address; discovery ignores one quietly.
  const rawTab = identity ? values.get('tab') : null
  const tab =
    controlTabs.find((item) => item === rawTab) ??
    (namesChalk && !values.has('tab') ? 'explain' : 'decode')
  if (identity && values.has('tab') && rawTab !== tab) notices.push('tab-reset')
  const normalized = normalizeFilters(
    {
      ...emptyFilters(catalogId),
      query: values.get('q') ?? '',
      family: values.get('family') ?? '',
      level: values.get('level') ?? '',
    },
    catalog,
  )
  notices.push(...normalized.notices)
  const shared = {
    mode,
    filters: normalized.filters,
    ...(tab === 'decode' ? {} : { tab }),
  }
  return ready(
    identity
      ? { ...shared, view: 'lesson', lesson: identity }
      : { ...shared, view: 'discover' },
    notices,
  )
}

export function serializeExplorerSearch(state: ValidExplorerState): string {
  const params = new URLSearchParams({ view: state.view })
  if (state.view === 'lesson') {
    params.set('framework', state.lesson.frameworkId)
    params.set('edition', state.lesson.editionId)
    params.set('control', state.lesson.controlKey)
  }
  params.set('mode', state.mode)
  if (state.tab && state.tab !== 'decode') params.set('tab', state.tab)
  // The implicit lesson catalog may be an unknown framework in a not-found URL.
  // Emitting it explicitly would turn that exact address into a catalog error.
  if (
    state.view === 'discover' ||
    state.filters.catalog !== state.lesson.frameworkId
  )
    params.set('catalog', state.filters.catalog)
  if (state.filters.query) params.set('q', state.filters.query)
  if (state.filters.family) params.set('family', state.filters.family)
  if (state.filters.level) params.set('level', state.filters.level)
  // Every address names the collection, as the first version's links did.
  params.set('collection', effectiveCollection(state.filters))
  return `?${params.toString()}`
}

export function explorerResults(
  state: ValidExplorerState,
  catalog: ExplorerCatalog,
): ReferenceControl[] {
  return filterControls(referencesIn(catalog), {
    frameworkId: state.filters.catalog,
    query: state.filters.query,
    family: state.filters.family,
    level: state.filters.level,
  })
}

export function resolveLesson(
  identity: LessonIdentity,
  filters: ExplorerFilters,
  catalog: ExplorerCatalog,
): LessonResolution {
  const framework = catalog.frameworks.find(
    (item) => item.id === identity.frameworkId,
  )
  if (framework?.status === 'planned')
    return { kind: 'planned-framework', framework }
  const edition = catalog.editions.find(
    (item) =>
      item.frameworkId === identity.frameworkId &&
      item.id === identity.editionId,
  )
  const matching = referencesIn(catalog).filter((control) =>
    sameIdentity(control, identity),
  )
  const control = matching.length === 1 ? matching[0] : undefined
  if (!framework || !edition || !control) return { kind: 'not-found', identity }
  const excludedByFilters = !explorerResults(
    { view: 'lesson', lesson: identity, mode: 'beginner', filters },
    catalog,
  ).includes(control)
  return { kind: 'lesson', framework, edition, control, excludedByFilters }
}

function withFilters(
  state: ValidExplorerState,
  filters: ExplorerFilters,
  catalog: ExplorerCatalog,
): ParsedExplorerState {
  const normalized = normalizeFilters(filters, catalog)
  const updated = { ...state, filters: normalized.filters }
  if (
    updated.view === 'lesson' &&
    resolveLesson(updated.lesson, updated.filters, catalog).kind === 'lesson' &&
    !explorerResults(updated, catalog).some((control) =>
      sameIdentity(control, updated.lesson),
    )
  ) {
    return ready(
      { view: 'discover', mode: updated.mode, filters: updated.filters },
      normalized.notices,
    )
  }
  return ready(updated, normalized.notices)
}

export function transitionExplorerState(
  current: ParsedExplorerState,
  intent: ExplorerIntent,
  catalog: ExplorerCatalog,
): ExplorerTransition {
  let next: ParsedExplorerState = current
  const fragment = intent.type === 'open-example' ? 'explorer' : undefined
  if (intent.type === 'recover-discovery') {
    next = ready({
      view: 'discover',
      mode: intent.mode ?? 'beginner',
      filters: emptyFilters(defaultCatalog(catalog)),
    })
  } else if (intent.type === 'open-example') {
    next = ready({ ...defaultState(catalog), mode: intent.mode })
  } else if (current.kind === 'ready') {
    const state = current.state
    switch (intent.type) {
      case 'select-lesson': {
        let filters = state.filters
        let resolution = resolveLesson(intent.identity, filters, catalog)
        if (resolution.kind === 'lesson' && resolution.excludedByFilters) {
          // The rail lists every control whatever the filters say, so a pick
          // from it gives way: the framework follows the control, then a
          // family, a level, a query that would hide it.
          const base = { ...filters, catalog: resolution.control.frameworkId }
          for (const next of [
            base,
            { ...base, family: '' },
            { ...base, family: '', level: '' },
            { ...base, family: '', level: '', query: '' },
          ]) {
            resolution = resolveLesson(intent.identity, next, catalog)
            filters = next
            if (resolution.kind !== 'lesson' || !resolution.excludedByFilters)
              break
          }
        }
        if (resolution.kind === 'lesson' && !resolution.excludedByFilters)
          next = ready({
            mode: state.mode,
            filters,
            ...(state.tab ? { tab: state.tab } : {}),
            view: 'lesson',
            lesson: intent.identity,
          })
        break
      }
      case 'change-mode':
        next = ready({ ...state, mode: intent.mode })
        break
      case 'pick-chalk':
        next = ready({ ...state, mode: intent.mode, tab: 'explain' })
        break
      case 'set-tab':
        next = ready({
          ...state,
          tab: intent.tab === 'decode' ? undefined : intent.tab,
        })
        break
      case 'set-query':
        next = withFilters(
          state,
          { ...state.filters, query: intent.query },
          catalog,
        )
        break
      case 'set-catalog':
        if (
          catalog.frameworks.some(
            (framework) => framework.id === intent.catalog,
          )
        )
          next = withFilters(
            state,
            {
              ...state.filters,
              catalog: intent.catalog,
              family: '',
              level: '',
            },
            catalog,
          )
        break
      case 'set-family':
        next = withFilters(
          state,
          { ...state.filters, family: intent.family },
          catalog,
        )
        break
      case 'set-level':
        next = withFilters(
          state,
          { ...state.filters, level: intent.level },
          catalog,
        )
        break
      case 'clear-filters':
        next = ready({
          ...state,
          filters: emptyFilters(state.filters.catalog),
        })
        break
      case 'back-to-discovery':
        if (
          catalog.frameworks.some(
            (framework) => framework.id === state.filters.catalog,
          )
        )
          next = ready({
            view: 'discover',
            mode: state.mode,
            filters: state.filters,
          })
        break
      case 'show-lesson-in-results':
        if (
          state.view === 'lesson' &&
          resolveLesson(state.lesson, state.filters, catalog).kind === 'lesson'
        )
          next = ready({
            ...state,
            filters: emptyFilters(state.lesson.frameworkId),
          })
        break
    }
  }
  const unchanged =
    next === current ||
    (next.kind === 'ready' &&
      current.kind === 'ready' &&
      serializeExplorerSearch(next.state) ===
        serializeExplorerSearch(current.state))
  if (unchanged) return { parsed: current, history: 'none', fragment }
  return {
    parsed: next,
    history: intent.type === 'set-query' ? 'replace' : 'push',
    fragment,
  }
}

/** The three chalks are the three perspectives; a shared link may name the chalk. */
export const chalkColours = {
  white: 'beginner',
  yellow: 'it-cyber',
  blue: 'compliance',
} as const satisfies Record<string, ExplanationMode>
export type ChalkColour = keyof typeof chalkColours

export function chalkColourOf(mode: ExplanationMode): ChalkColour {
  return (Object.keys(chalkColours) as ChalkColour[]).find(
    (colour) => chalkColours[colour] === mode,
  )!
}

/** Whether an address names a chalk; the store rewrites such an address once it is read. */
export function addressNamesChalk(search: string): boolean {
  return new URLSearchParams(search).has('chalk')
}

/**
 * Whether an address names the first version's demo lesson or its `lessons`
 * collection; the store rewrites such an address once it is read, as it does
 * for a chalk, so the link shows the control it opens.
 */
export function addressNamesRetired(
  search: string,
  catalog: ExplorerCatalog,
): boolean {
  const params = new URLSearchParams(search)
  if (params.get('collection') === 'lessons') return true
  const frameworkId = params.get('framework')
  const editionId = params.get('edition')
  const controlKey = params.get('control')
  return Boolean(
    frameworkId &&
    editionId &&
    controlKey &&
    retiredLessonTarget({ frameworkId, editionId, controlKey }, catalog),
  )
}

/** A link that opens this control's explanation in one chalk: `chalk=` in place of `mode=`. */
export function createChalkUrl(
  identity: LessonIdentity,
  mode: ExplanationMode,
  location: URL,
): string {
  const url = new URL(location.href)
  url.search = new URLSearchParams({
    view: 'lesson',
    framework: identity.frameworkId,
    edition: identity.editionId,
    control: identity.controlKey,
    chalk: chalkColourOf(mode),
  }).toString()
  url.hash = 'explorer'
  return url.href
}

/** A share URL contains the lesson, mode and view, never someone's discovery query. */
export function createLessonUrl(
  identity: LessonIdentity,
  mode: ExplanationMode,
  location: URL,
  tab: ControlTab = 'decode',
): string {
  const url = new URL(location.href)
  const params = new URLSearchParams({
    view: 'lesson',
    framework: identity.frameworkId,
    edition: identity.editionId,
    control: identity.controlKey,
    mode,
  })
  if (tab !== 'decode') params.set('tab', tab)
  url.search = params.toString()
  url.hash = 'explorer'
  return url.href
}
