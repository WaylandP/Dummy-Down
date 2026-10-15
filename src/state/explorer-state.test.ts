import { describe, expect, it } from 'vitest'
import { controls } from '../data/controls'
import type {
  Control,
  LessonIdentity,
  ReferenceControl,
} from '../types/content'
import {
  createLessonUrl,
  effectiveCollection,
  explorerResults,
  parseExplorerSearch,
  resolveLesson,
  serializeExplorerSearch,
  transitionExplorerState,
  type ExplorerCatalog,
  type ExplorerFilters,
  type ExplorerIntent,
  type ParsedExplorerState,
  type ValidExplorerState,
} from './explorer-state'

const sampleIdentity: LessonIdentity = {
  frameworkId: 'cmmc',
  editionId: 'readme-example',
  controlKey: 'authorized-access',
}

const nextIdentity: LessonIdentity = {
  ...sampleIdentity,
  editionId: 'next-example',
}

const independentIdentity: LessonIdentity = {
  frameworkId: 'research-framework',
  editionId: 'guide-v1',
  controlKey: 'access',
}

const referenceIdentity: LessonIdentity = {
  frameworkId: 'cmmc',
  editionId: 'source-fixture',
  controlKey: 'source-access',
}

const sample: Control = {
  ...controls[0]!,
  key: sampleIdentity.controlKey,
  editionId: sampleIdentity.editionId,
}

const nextEdition: Control = {
  ...sample,
  editionId: nextIdentity.editionId,
  title: 'Authorized access, a different editorial edition',
}

const differentFamily: Control = {
  ...sample,
  id: 'IA.EXAMPLE',
  key: 'device-approval',
  family: 'IA',
  familyName: 'Identification',
  level: 'Level 1',
  title: 'Device approval',
}

const independent: Control = {
  ...sample,
  key: independentIdentity.controlKey,
  frameworkId: independentIdentity.frameworkId,
  editionId: independentIdentity.editionId,
  family: 'Identity',
  familyName: 'Identity management',
  level: undefined,
}

/** Synthetic source records exercise navigation, not real control requirements. */
const reference: ReferenceControl = {
  id: 'REFERENCE.ONE',
  key: referenceIdentity.controlKey,
  frameworkId: referenceIdentity.frameworkId,
  editionId: referenceIdentity.editionId,
  title: 'Synthetic access reference',
  family: 'REF',
  familyName: 'Reference fixture',
  level: 'Level 1',
  contentKind: 'official-reference',
  reviewStatus: 'unreviewed-import',
  versionContext: 'Synthetic quotation fixture used only for state tests.',
  disclaimer: 'This fixture is not cybersecurity teaching content.',
  tags: ['source fixture'],
  sources: sample.sources,
  requirement: {
    text: 'Synthetic guide text with a unique guide-search token.',
    sourceId: 'fixture-guide',
    pdfPage: 4,
    printedPage: 2,
  },
  modelRequirement: {
    text: 'Synthetic model text with a unique model-search token.',
    sourceId: 'fixture-model',
    pdfPage: 5,
    printedPage: 3,
    differsFromGuide: true,
  },
  sourceDocuments: [],
}

const otherReference: ReferenceControl = {
  ...reference,
  id: 'REFERENCE.TWO',
  key: 'source-device',
  family: 'SOURCE',
  familyName: 'Another reference fixture',
  level: 'Level 2',
}

const catalog: ExplorerCatalog = {
  frameworks: [
    {
      id: 'cmmc',
      name: 'CMMC test catalog',
      shortName: 'CMMC',
      description: 'Test fixture, not teaching content.',
      status: 'preview',
      levels: ['Level 1', 'Level 2', 'Level 3'],
      sourceUrl: 'https://example.com/cmmc',
    },
    {
      id: 'research-framework',
      name: 'Independent test framework',
      shortName: 'Research',
      description: 'A test framework without CMMC levels.',
      status: 'preview',
      levels: [],
      sourceUrl: 'https://example.com/research',
    },
    {
      id: 'planned-framework',
      name: 'Planned test framework',
      shortName: 'Planned',
      description: 'No content is available.',
      status: 'planned',
      levels: [],
      sourceUrl: 'https://example.com/planned',
    },
  ],
  editions: [
    {
      id: sampleIdentity.editionId,
      frameworkId: sampleIdentity.frameworkId,
      title: 'README example',
      versionContext: 'Editorial fixture, not an official framework version.',
    },
    {
      id: nextIdentity.editionId,
      frameworkId: nextIdentity.frameworkId,
      title: 'Next example',
      versionContext: 'Another editorial fixture.',
    },
    {
      id: independentIdentity.editionId,
      frameworkId: independentIdentity.frameworkId,
      title: 'Independent guide',
      versionContext: 'An independent editorial fixture.',
    },
    {
      id: referenceIdentity.editionId,
      frameworkId: referenceIdentity.frameworkId,
      title: 'Synthetic publication fixture',
      versionContext: 'A source snapshot fixture, not a project explanation.',
      kind: 'publication',
    },
  ],
  controls: [
    sample,
    nextEdition,
    differentFamily,
    independent,
    reference,
    otherReference,
  ],
  defaultLesson: sampleIdentity,
}

const unfiltered: ExplorerFilters = {
  catalog: 'cmmc',
  query: '',
  family: '',
  level: '',
}

function lesson(
  overrides: Partial<Pick<ValidExplorerState, 'mode' | 'filters' | 'tab'>> = {},
  identity: LessonIdentity = sampleIdentity,
): ValidExplorerState {
  return {
    view: 'lesson',
    lesson: identity,
    mode: 'beginner',
    filters: unfiltered,
    ...overrides,
  }
}

function ready(state: ValidExplorerState): ParsedExplorerState {
  return { kind: 'ready', state, notices: [] }
}

function discovery(filters: ExplorerFilters = unfiltered): ValidExplorerState {
  return { view: 'discover', mode: 'beginner', filters }
}

function lessonSearch(identity: LessonIdentity = sampleIdentity): string {
  return `?view=lesson&framework=${identity.frameworkId}&edition=${identity.editionId}&control=${identity.controlKey}`
}

function parameters(state: ValidExplorerState): URLSearchParams {
  return new URLSearchParams(serializeExplorerSearch(state))
}

describe('parseExplorerSearch', () => {
  it('chooses only the configured default for an address without recognized state', () => {
    expect(parseExplorerSearch('', catalog)).toEqual(ready(lesson()))
    expect(
      parseExplorerSearch('?campaign=fall&campaign=winter', catalog),
    ).toEqual(ready(lesson()))
    expect(
      parseExplorerSearch('', { ...catalog, defaultLesson: null }),
    ).toEqual(ready(discovery()))
  })

  it('ignores unknown values while rejecting undecodable raw keys', () => {
    expect(parseExplorerSearch('?unrelated=%E0%A4%A', catalog)).toEqual(
      ready(lesson()),
    )
    expect(parseExplorerSearch('?%E0%A4%A=ignored', catalog)).toEqual({
      kind: 'invalid',
      reason: 'malformed-encoding',
    })
  })

  it.each([
    '?mode=beginner',
    '?catalog=cmmc',
    '?q=accounts',
    '?view=',
    '?view=unknown',
  ])(
    'rejects recognized state without an explicit valid view: %s',
    (search) => {
      expect(parseExplorerSearch(search, catalog)).toEqual({
        kind: 'invalid',
        reason: 'invalid-view',
      })
    },
  )

  it.each([
    '?view=lesson',
    '?view=lesson&framework=cmmc&edition=readme-example',
    '?view=lesson&framework=cmmc&edition=&control=authorized-access',
    '?view=lesson&framework=&edition=readme-example&control=authorized-access',
    '?view=lesson&framework=cmmc&edition=readme-example&control=',
  ])('never completes a partial identity using the default: %s', (search) => {
    expect(parseExplorerSearch(search, catalog)).toEqual({
      kind: 'invalid',
      reason: 'incomplete-identity',
    })
  })

  it.each(['framework', 'edition', 'control'])(
    'rejects discovery with a hidden %s identity field, including an empty one',
    (key) => {
      expect(parseExplorerSearch(`?view=discover&${key}=`, catalog)).toEqual({
        kind: 'invalid',
        reason: 'conflicting-state',
      })
    },
  )

  it.each([
    '?view=discover&view=discover',
    '?view=discover&%76iew=discover',
    '?view=discover&q=access&%71=access',
    `${lessonSearch()}&framework=cmmc`,
    '?view=discover&mode=beginner&mode=compliance',
  ])('rejects duplicate decoded recognized keys: %s', (search) => {
    expect(parseExplorerSearch(search, catalog)).toEqual({
      kind: 'invalid',
      reason: 'duplicate-parameter',
    })
  })

  it.each([
    '?view=discover&q=%',
    '?view=discover&q=%E0%A4%A',
    '?view=discover&%ZZ=ignored',
    `${lessonSearch()}&mode=%C0%AF`,
  ])(
    'rejects malformed query escapes before content resolution: %s',
    (search) => {
      expect(parseExplorerSearch(search, catalog)).toEqual({
        kind: 'invalid',
        reason: 'malformed-encoding',
      })
    },
  )

  it.each([
    'AUTHORIZED-ACCESS',
    'authorized+access',
    'authorized%2Faccess',
    'authorized%252Daccess',
    '%E8%A8%B1%E5%8F%AF',
  ])('validates decoded editorial slugs exactly once: %s', (controlKey) => {
    expect(
      parseExplorerSearch(
        `?view=lesson&framework=cmmc&edition=readme-example&control=${controlKey}`,
        catalog,
      ),
    ).toEqual({ kind: 'invalid', reason: 'invalid-identity' })
  })

  it('decodes encoded known keys and Unicode search without treating it as markup', () => {
    const query = '安全 café <script> 100%'
    expect(
      parseExplorerSearch(
        `?%76iew=discover&q=${encodeURIComponent(query)}`,
        catalog,
      ),
    ).toEqual(ready(discovery({ ...unfiltered, query })))
    expect(
      parseExplorerSearch('?view=discover&q=approved+accounts', catalog),
    ).toEqual(ready(discovery({ ...unfiltered, query: 'approved accounts' })))
  })

  it('uses Beginner for missing mode and visibly normalizes invalid or empty modes', () => {
    expect(parseExplorerSearch(lessonSearch(), catalog)).toEqual(
      ready(lesson()),
    )
    for (const mode of ['', 'expert', 'COMPLIANCE']) {
      expect(
        parseExplorerSearch(`${lessonSearch()}&mode=${mode}`, catalog),
      ).toEqual({ ...ready(lesson()), notices: ['mode-reset'] })
    }
    for (const mode of ['it-cyber', 'compliance'] as const) {
      expect(
        parseExplorerSearch(`${lessonSearch()}&mode=${mode}`, catalog),
      ).toEqual(ready(lesson({ mode })))
    }
  })

  it('derives absent discovery catalog from the lesson even with other filters', () => {
    expect(
      parseExplorerSearch(
        `${lessonSearch(independentIdentity)}&q=accounts&family=Identity`,
        catalog,
      ),
    ).toEqual(
      ready(
        lesson(
          {
            filters: {
              catalog: 'research-framework',
              query: 'accounts',
              family: 'Identity',
              level: '',
            },
          },
          independentIdentity,
        ),
      ),
    )
  })

  it('clears unsupported constraints with notices and leaves empty ones unrestricted', () => {
    expect(
      parseExplorerSearch(
        '?view=discover&family=missing&level=Level+9',
        catalog,
      ),
    ).toEqual({
      ...ready(discovery()),
      notices: ['family-reset', 'level-reset'],
    })
    expect(
      parseExplorerSearch('?view=discover&q=&family=&level=', catalog),
    ).toEqual(ready(discovery()))
    expect(
      parseExplorerSearch(
        '?view=discover&catalog=research-framework&family=Identity&level=Level+2',
        catalog,
      ),
    ).toEqual({
      ...ready(
        discovery({
          ...unfiltered,
          catalog: 'research-framework',
          family: 'Identity',
        }),
      ),
      notices: ['level-reset'],
    })
  })

  it.each(['', 'missing-framework'])(
    'rejects an unknown or empty explicit catalog: %s',
    (value) => {
      expect(
        parseExplorerSearch(`?view=discover&catalog=${value}`, catalog),
      ).toEqual({ kind: 'invalid', reason: 'unknown-catalog' })
      expect(
        parseExplorerSearch(`${lessonSearch()}&catalog=${value}`, catalog),
      ).toEqual({ kind: 'invalid', reason: 'unknown-catalog' })
    },
  )

  it('preserves a complete unknown lesson instead of replacing it with the default', () => {
    const unknown: LessonIdentity = {
      frameworkId: 'unknown-framework',
      editionId: 'unknown-edition',
      controlKey: 'unknown-control',
    }
    expect(parseExplorerSearch(lessonSearch(unknown), catalog)).toEqual(
      ready(
        lesson(
          { filters: { ...unfiltered, catalog: 'unknown-framework' } },
          unknown,
        ),
      ),
    )
  })

  it('preserves replayed mismatched filters and an explicit empty selection', () => {
    expect(
      parseExplorerSearch(`${lessonSearch()}&family=IA&q=device`, catalog),
    ).toEqual(
      ready(
        lesson({
          filters: { ...unfiltered, family: 'IA', query: 'device' },
        }),
      ),
    )
    expect(
      parseExplorerSearch(
        '?view=discover&family=IA&q=device&mode=compliance',
        catalog,
      ),
    ).toEqual(
      ready({
        ...discovery({ ...unfiltered, family: 'IA', query: 'device' }),
        mode: 'compliance',
      }),
    )
  })
})

describe('serializeExplorerSearch', () => {
  it('roundtrips the complete lesson tuple, mode and Unicode discovery context', () => {
    const state = lesson({
      mode: 'it-cyber',
      filters: {
        catalog: 'cmmc',
        query: 'café approved & devices',
        family: 'AC',
        level: 'Level 2',
      },
    })
    expect(
      parseExplorerSearch(serializeExplorerSearch(state), catalog),
    ).toEqual(ready(state))
    expect(parameters(state).get('control')).toBe('authorized-access')
    expect(parameters(state).get('control')).not.toBe(sample.id)
  })

  it('roundtrips discovery without smuggling in a lesson identity', () => {
    const state = discovery({ ...unfiltered, query: 'accounts', family: 'AC' })
    const search = parameters(state)
    expect(search.get('view')).toBe('discover')
    for (const key of ['framework', 'edition', 'control']) {
      expect(search.has(key)).toBe(false)
    }
    expect(parseExplorerSearch(search.toString(), catalog)).toEqual(
      ready(state),
    )
  })

  it('keeps a complete unknown lesson not-found after a state write and reload', () => {
    const identity: LessonIdentity = {
      frameworkId: 'unknown-framework',
      editionId: 'unknown-edition',
      controlKey: 'unknown-control',
    }
    const parsed = parseExplorerSearch(lessonSearch(identity), catalog)
    if (parsed.kind !== 'ready') throw new Error('Expected a complete identity')
    const search = serializeExplorerSearch(parsed.state)
    expect(new URLSearchParams(search).has('catalog')).toBe(false)
    expect(parseExplorerSearch(search, catalog)).toEqual(parsed)
    expect(resolveLesson(identity, parsed.state.filters, catalog)).toEqual({
      kind: 'not-found',
      identity,
    })
  })

  it('omits empty constraints and never resurrects unknown incoming parameters', () => {
    const parsed = parseExplorerSearch(
      `${lessonSearch()}&tracking=private`,
      catalog,
    )
    expect(parsed.kind).toBe('ready')
    if (parsed.kind !== 'ready') throw new Error('Expected a valid fixture')
    const search = parameters(parsed.state)
    for (const key of ['q', 'family', 'level', 'tracking']) {
      expect(search.has(key)).toBe(false)
    }
    expect(search.get('mode')).toBe('beginner')
  })
})

describe('resolveLesson', () => {
  it('distinguishes editorial editions sharing the same official identifier', () => {
    expect(sample.id).toBe(nextEdition.id)
    expect(resolveLesson(sampleIdentity, unfiltered, catalog)).toMatchObject({
      kind: 'lesson',
      control: sample,
      edition: catalog.editions[0],
      excludedByFilters: false,
    })
    expect(resolveLesson(nextIdentity, unfiltered, catalog)).toMatchObject({
      kind: 'lesson',
      control: nextEdition,
      edition: catalog.editions[1],
    })
  })

  it('resolves the full tuple for a different framework without levels', () => {
    expect(
      resolveLesson(
        independentIdentity,
        { ...unfiltered, catalog: independentIdentity.frameworkId },
        catalog,
      ),
    ).toMatchObject({
      kind: 'lesson',
      control: independent,
      framework: catalog.frameworks[1],
      edition: catalog.editions[2],
      excludedByFilters: false,
    })
  })

  it.each([
    { ...sampleIdentity, editionId: 'missing-edition' },
    { ...sampleIdentity, controlKey: 'missing-control' },
    { ...sampleIdentity, frameworkId: 'research-framework' },
    { ...sampleIdentity, editionId: independentIdentity.editionId },
    { ...sampleIdentity, frameworkId: 'missing-framework' },
  ])(
    'never substitutes a result for a missing or crossed tuple: %o',
    (identity) => {
      expect(resolveLesson(identity, unfiltered, catalog)).toEqual({
        kind: 'not-found',
        identity,
      })
    },
  )

  it('keeps planned frameworks truthful instead of substituting CMMC', () => {
    const identity: LessonIdentity = {
      frameworkId: 'planned-framework',
      editionId: 'future-edition',
      controlKey: 'future-control',
    }
    expect(resolveLesson(identity, unfiltered, catalog)).toEqual({
      kind: 'planned-framework',
      framework: catalog.frameworks[2],
    })
  })

  it.each([
    { ...unfiltered, query: 'nonexistent phrase' },
    { ...unfiltered, family: 'IA' },
    { ...unfiltered, level: 'Level 1' },
    { ...unfiltered, catalog: 'research-framework' },
  ])('retains the exact lesson excluded by replayed filters: %o', (filters) => {
    expect(resolveLesson(sampleIdentity, filters, catalog)).toMatchObject({
      kind: 'lesson',
      control: sample,
      excludedByFilters: true,
    })
  })
})

describe('transitionExplorerState', () => {
  it('selects a known lesson using its tuple and retains discovery context', () => {
    const filters = { ...unfiltered, query: 'accounts', family: 'AC' }
    expect(
      transitionExplorerState(
        ready({ ...discovery(filters), mode: 'compliance' }),
        { type: 'select-lesson', identity: nextIdentity },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready(lesson({ mode: 'compliance', filters }, nextIdentity)),
      history: 'push',
    })
  })

  it('selects only a known tuple included in the current discovery results', () => {
    const current = ready(discovery({ ...unfiltered, family: 'IA' }))
    expect(
      transitionExplorerState(
        current,
        { type: 'select-lesson', identity: sampleIdentity },
        catalog,
      ),
    ).toMatchObject({ parsed: current, history: 'none' })
  })

  it('changes perspective without losing identity or filters', () => {
    const filters = { ...unfiltered, query: 'accounts', family: 'AC' }
    expect(
      transitionExplorerState(
        ready(lesson({ filters })),
        { type: 'change-mode', mode: 'it-cyber' },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready(lesson({ filters, mode: 'it-cyber' })),
      history: 'push',
    })
  })

  it('replaces search immediately and clears a selected lesson it excludes', () => {
    expect(
      transitionExplorerState(
        ready(lesson()),
        { type: 'set-query', query: 'does not match' },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready(discovery({ ...unfiltered, query: 'does not match' })),
      history: 'replace',
    })
    expect(
      transitionExplorerState(
        ready(lesson()),
        { type: 'set-query', query: 'accounts' },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready(lesson({ filters: { ...unfiltered, query: 'accounts' } })),
      history: 'replace',
    })
  })

  it.each([
    { type: 'set-family', family: 'IA' },
    { type: 'set-level', level: 'Level 1' },
  ] as const)(
    'clears excluded selection on a deliberate filter change: %o',
    (intent) => {
      const field =
        intent.type === 'set-family'
          ? { family: intent.family }
          : { level: intent.level }
      expect(
        transitionExplorerState(ready(lesson()), intent, catalog),
      ).toMatchObject({
        parsed: ready(discovery({ ...unfiltered, ...field })),
        history: 'push',
      })
    },
  )

  it('evaluates all prospective filters after replay, not just the changed field', () => {
    const incoming = ready(
      lesson({
        filters: { ...unfiltered, family: 'IA', query: 'does not match' },
      }),
    )
    expect(
      transitionExplorerState(
        incoming,
        { type: 'set-family', family: 'AC' },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready(
        discovery({ ...unfiltered, family: 'AC', query: 'does not match' }),
      ),
      history: 'push',
    })
  })

  it('changes catalog while retaining search and clearing catalog-specific constraints', () => {
    expect(
      transitionExplorerState(
        ready(
          lesson({
            filters: {
              ...unfiltered,
              query: 'accounts',
              family: 'AC',
              level: 'Level 2',
            },
          }),
        ),
        { type: 'set-catalog', catalog: 'research-framework' },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready(
        discovery({
          ...unfiltered,
          catalog: 'research-framework',
          query: 'accounts',
        }),
      ),
      history: 'push',
    })
  })

  it('clears filters without automatically selecting a result', () => {
    const filtered = {
      ...unfiltered,
      query: 'no results',
      family: 'IA',
      level: 'Level 1',
    }
    expect(
      transitionExplorerState(
        ready(discovery(filtered)),
        { type: 'clear-filters' },
        catalog,
      ),
    ).toMatchObject({ parsed: ready(discovery()), history: 'push' })
    expect(
      transitionExplorerState(
        ready(lesson({ filters: filtered })),
        { type: 'clear-filters' },
        catalog,
      ),
    ).toMatchObject({ parsed: ready(lesson()), history: 'push' })
  })

  it('returns to discovery with the same mode and filters and no lesson identity', () => {
    const filters = { ...unfiltered, query: 'accounts', family: 'AC' }
    expect(
      transitionExplorerState(
        ready(lesson({ mode: 'compliance', filters })),
        { type: 'back-to-discovery' },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready({ ...discovery(filters), mode: 'compliance' }),
      history: 'push',
    })
  })

  it('requires named recovery when an unknown lesson has no valid discovery catalog', () => {
    const identity: LessonIdentity = {
      frameworkId: 'unknown-framework',
      editionId: 'unknown-edition',
      controlKey: 'unknown-control',
    }
    const current = parseExplorerSearch(lessonSearch(identity), catalog)
    expect(
      transitionExplorerState(current, { type: 'back-to-discovery' }, catalog),
    ).toMatchObject({ parsed: current, history: 'none' })
    const recovered = transitionExplorerState(
      current,
      { type: 'recover-discovery' },
      catalog,
    )
    expect(recovered).toMatchObject({
      parsed: ready(discovery()),
      history: 'push',
    })
    if (recovered.parsed.kind !== 'ready')
      throw new Error('Recovery must create valid discovery')
    expect(
      parseExplorerSearch(
        serializeExplorerSearch(recovered.parsed.state),
        catalog,
      ),
    ).toEqual(recovered.parsed)
  })

  it('makes a restored lesson visible in results without changing identity or mode', () => {
    expect(
      transitionExplorerState(
        ready(
          lesson({
            mode: 'it-cyber',
            filters: {
              catalog: 'research-framework',
              query: 'missing',
              family: 'Identity',
              level: '',
            },
          }),
        ),
        { type: 'show-lesson-in-results' },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready(lesson({ mode: 'it-cyber' })),
      history: 'push',
    })
  })

  it('uses named recovery to construct empty discovery, without reopening the sample', () => {
    expect(
      transitionExplorerState(
        { kind: 'invalid', reason: 'incomplete-identity' },
        { type: 'recover-discovery' },
        catalog,
      ),
    ).toMatchObject({ parsed: ready(discovery()), history: 'push' })
  })

  it.each([
    { kind: 'invalid', reason: 'duplicate-parameter' } as ParsedExplorerState,
    ready(discovery({ ...unfiltered, catalog: 'planned-framework' })),
    ready(lesson({}, { ...sampleIdentity, controlKey: 'missing' })),
  ])(
    'opens the known unfiltered sample explicitly from recovery states: %o',
    (current) => {
      expect(
        transitionExplorerState(
          current,
          { type: 'open-example', mode: 'compliance' },
          catalog,
        ),
      ).toMatchObject({
        parsed: ready(lesson({ mode: 'compliance' })),
        history: 'push',
        fragment: 'explorer',
      })
    },
  )

  it.each([
    { type: 'set-query', query: 'accounts' },
    { type: 'set-catalog', catalog: 'cmmc' },
    { type: 'set-family', family: 'AC' },
    { type: 'set-level', level: 'Level 2' },
    { type: 'change-mode', mode: 'compliance' },
    { type: 'clear-filters' },
  ] as const)(
    'does not silently repair invalid identity through another action: %o',
    (intent) => {
      const invalid: ParsedExplorerState = {
        kind: 'invalid',
        reason: 'incomplete-identity',
      }
      expect(transitionExplorerState(invalid, intent, catalog)).toMatchObject({
        parsed: invalid,
        history: 'none',
      })
      const missing = ready(
        lesson({}, { ...sampleIdentity, controlKey: 'missing' }),
      )
      const transitioned = transitionExplorerState(missing, intent, catalog)
      expect(transitioned.parsed).toMatchObject({
        kind: 'ready',
        state: {
          view: 'lesson',
          lesson: { ...sampleIdentity, controlKey: 'missing' },
        },
      })
      if (
        transitioned.parsed.kind !== 'ready' ||
        transitioned.parsed.state.view !== 'lesson'
      )
        throw new Error('Missing lesson must keep its exact identity')
      expect(
        resolveLesson(
          transitioned.parsed.state.lesson,
          transitioned.parsed.state.filters,
          catalog,
        ),
      ).toEqual({
        kind: 'not-found',
        identity: { ...sampleIdentity, controlKey: 'missing' },
      })
    },
  )

  it.each([
    { type: 'change-mode', mode: 'beginner' },
    { type: 'set-query', query: '' },
    { type: 'set-catalog', catalog: 'cmmc' },
    { type: 'set-family', family: '' },
    { type: 'set-level', level: '' },
    { type: 'clear-filters' },
    { type: 'show-lesson-in-results' },
  ] satisfies ExplorerIntent[])(
    'does not create redundant history for unchanged events: %o',
    (intent) => {
      const current = ready(lesson())
      expect(transitionExplorerState(current, intent, catalog)).toMatchObject({
        parsed: current,
        history: 'none',
      })
    },
  )

  it('ignores an unknown selection or unsupported catalog rather than substituting content', () => {
    const current = ready(discovery())
    expect(
      transitionExplorerState(
        current,
        {
          type: 'select-lesson',
          identity: { ...sampleIdentity, editionId: 'missing' },
        },
        catalog,
      ),
    ).toMatchObject({ parsed: current, history: 'none' })
    expect(
      transitionExplorerState(
        current,
        { type: 'set-catalog', catalog: 'missing-framework' },
        catalog,
      ),
    ).toMatchObject({ parsed: current, history: 'none' })
  })

  it('never mutates an incoming lesson when deriving discovery', () => {
    const current = ready(
      lesson({ filters: { ...unfiltered, query: 'accounts' } }),
    )
    const before = structuredClone(current)
    transitionExplorerState(
      current,
      { type: 'set-query', query: 'missing' },
      catalog,
    )
    expect(current).toEqual(before)
  })
})

describe('createLessonUrl', () => {
  it('shares the exact tuple and mode while excluding filters and unknown query data', () => {
    const location = new URL(
      'https://preview.example.com/base/?view=discover&catalog=cmmc&q=private+search&family=IA&level=Level+1&tracking=ignored#old',
    )
    const original = location.href
    const shared = new URL(
      createLessonUrl(nextIdentity, 'compliance', location),
    )
    expect(shared.origin).toBe(location.origin)
    expect(shared.pathname).toBe('/base/')
    expect(shared.hash).toBe('#explorer')
    expect([...shared.searchParams.keys()].sort()).toEqual([
      'control',
      'edition',
      'framework',
      'mode',
      'view',
    ])
    expect(parseExplorerSearch(shared.search, catalog)).toEqual(
      ready(lesson({ mode: 'compliance' }, nextIdentity)),
    )
    expect(location.href).toBe(original)
  })

  it('opens an independent framework unfiltered without imposing CMMC levels', () => {
    const shared = new URL(
      createLessonUrl(
        independentIdentity,
        'it-cyber',
        new URL('https://preview.example.com/?catalog=cmmc'),
      ),
    )
    expect(parseExplorerSearch(shared.search, catalog)).toEqual(
      ready(
        lesson(
          {
            mode: 'it-cyber',
            filters: { ...unfiltered, catalog: 'research-framework' },
          },
          independentIdentity,
        ),
      ),
    )
  })
})

describe('source-reference collections', () => {
  const referenceFilters: ExplorerFilters = {
    ...unfiltered,
    collection: 'references',
  }

  it('defaults discovery, the sample and unknown tuples to teaching lessons', () => {
    expect(effectiveCollection(unfiltered)).toBe('lessons')
    expect(effectiveCollection({ ...unfiltered, collection: 'lessons' })).toBe(
      'lessons',
    )
    for (const search of [
      '?view=discover',
      lessonSearch(),
      lessonSearch({ ...referenceIdentity, editionId: 'unknown-edition' }),
      lessonSearch({ ...referenceIdentity, controlKey: 'unknown-control' }),
      lessonSearch({ ...referenceIdentity, frameworkId: 'research-framework' }),
    ]) {
      const parsed = parseExplorerSearch(search, catalog)
      if (parsed.kind !== 'ready') throw new Error('Expected complete state')
      expect(effectiveCollection(parsed.state.filters)).toBe('lessons')
      expect(parsed.state.filters.collection).toBeUndefined()
    }
  })

  it('infers references only from the exact known source identity', () => {
    expect(
      parseExplorerSearch(lessonSearch(referenceIdentity), catalog),
    ).toEqual(ready(lesson({ filters: referenceFilters }, referenceIdentity)))
    expect(
      parseExplorerSearch(
        `${lessonSearch(referenceIdentity)}&mode=compliance&q=guide-search&family=REF&level=Level+1`,
        catalog,
      ),
    ).toEqual(
      ready(
        lesson(
          {
            mode: 'compliance',
            filters: {
              ...referenceFilters,
              query: 'guide-search',
              family: 'REF',
              level: 'Level 1',
            },
          },
          referenceIdentity,
        ),
      ),
    )
  })

  it.each(['', 'all', 'REFERENCES', 'references%2520'])(
    'rejects unsupported or empty explicit collection without silently choosing lessons: %s',
    (collection) => {
      expect(
        parseExplorerSearch(`?view=discover&collection=${collection}`, catalog),
      ).toEqual({ kind: 'invalid', reason: 'invalid-collection' })
    },
  )

  it('strictly decodes collection names and rejects encoded duplicate aliases', () => {
    expect(
      parseExplorerSearch('?view=discover&collection=%72eferences', catalog),
    ).toEqual(ready(discovery(referenceFilters)))
    expect(
      parseExplorerSearch(
        '?view=discover&collection=references&%63ollection=references',
        catalog,
      ),
    ).toEqual({ kind: 'invalid', reason: 'duplicate-parameter' })
    expect(
      parseExplorerSearch('?view=discover&collection=%E0%A4%A', catalog),
    ).toEqual({ kind: 'invalid', reason: 'malformed-encoding' })
  })

  it('keeps explicit collection authoritative while preserving a mismatched source identity', () => {
    const parsed = parseExplorerSearch(
      `${lessonSearch(referenceIdentity)}&collection=lessons`,
      catalog,
    )
    expect(parsed).toEqual(
      ready(
        lesson(
          { filters: { ...unfiltered, collection: 'lessons' } },
          referenceIdentity,
        ),
      ),
    )
    expect(
      parseExplorerSearch(
        serializeExplorerSearch(
          parsed.kind === 'ready' ? parsed.state : discovery(),
        ),
        catalog,
      ),
    ).toEqual(parsed)
    expect(resolveLesson(referenceIdentity, unfiltered, catalog)).toMatchObject(
      {
        kind: 'lesson',
        control: reference,
        excludedByFilters: true,
      },
    )
    expect(
      parseExplorerSearch(`${lessonSearch()}&collection=references`, catalog),
    ).toEqual(ready(lesson({ filters: referenceFilters })))
    expect(
      resolveLesson(sampleIdentity, referenceFilters, catalog),
    ).toMatchObject({
      kind: 'lesson',
      control: sample,
      excludedByFilters: true,
    })
  })

  it('validates family and level against entries in the active collection', () => {
    expect(
      parseExplorerSearch(
        '?view=discover&collection=references&family=AC&level=Level+3',
        catalog,
      ),
    ).toEqual({
      ...ready(discovery(referenceFilters)),
      notices: ['family-reset', 'level-reset'],
    })
    expect(
      parseExplorerSearch('?view=discover&family=REF&level=Level+3', catalog),
    ).toEqual({
      ...ready(discovery()),
      notices: ['family-reset', 'level-reset'],
    })
    expect(
      parseExplorerSearch(
        '?view=discover&collection=references&family=REF&level=Level+1',
        catalog,
      ),
    ).toEqual(
      ready(
        discovery({ ...referenceFilters, family: 'REF', level: 'Level 1' }),
      ),
    )
  })

  it('roundtrips reference discovery explicitly and omits the default lessons collection', () => {
    const state = discovery({ ...referenceFilters, query: 'guide-search' })
    expect(parameters(state).get('collection')).toBe('references')
    expect(
      parseExplorerSearch(serializeExplorerSearch(state), catalog),
    ).toEqual(ready(state))
    expect(parameters(discovery()).has('collection')).toBe(false)
    expect(
      parameters(discovery({ ...unfiltered, collection: 'lessons' })).has(
        'collection',
      ),
    ).toBe(false)
  })

  it('keeps source requirement and model text searchable independently of teaching prose', () => {
    expect(
      explorerResults(
        discovery({ ...referenceFilters, query: 'guide-search' }),
        catalog,
      ),
    ).toEqual([reference, otherReference])
    expect(
      explorerResults(
        discovery({ ...referenceFilters, query: 'model-search' }),
        catalog,
      ),
    ).toEqual([reference, otherReference])
    expect(explorerResults(discovery(), catalog)).toEqual([
      sample,
      nextEdition,
      differentFamily,
    ])
    expect(
      explorerResults(
        discovery({ ...unfiltered, query: 'guide-search' }),
        catalog,
      ),
    ).toEqual([])
    expect(
      explorerResults(
        discovery({ ...referenceFilters, query: 'locked front door' }),
        catalog,
      ),
    ).toEqual([])
  })

  it('changes collection with query retained, constraints cleared and excluded selection removed', () => {
    const current = ready(
      lesson({
        mode: 'it-cyber',
        filters: {
          ...unfiltered,
          query: 'accounts',
          family: 'AC',
          level: 'Level 2',
        },
      }),
    )
    expect(
      transitionExplorerState(
        current,
        { type: 'set-collection', collection: 'references' },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready({
        ...discovery({ ...referenceFilters, query: 'accounts' }),
        mode: 'it-cyber',
      }),
      history: 'push',
    })
    expect(
      transitionExplorerState(
        ready(lesson({ filters: referenceFilters }, referenceIdentity)),
        { type: 'set-collection', collection: 'lessons' },
        catalog,
      ),
    ).toMatchObject({ parsed: ready(discovery()), history: 'push' })
  })

  it('does not write redundant history for a collection that is already selected', () => {
    for (const collection of ['lessons', 'references'] as const) {
      const current = ready(
        discovery(collection === 'lessons' ? unfiltered : referenceFilters),
      )
      expect(
        transitionExplorerState(
          current,
          { type: 'set-collection', collection },
          catalog,
        ),
      ).toMatchObject({ parsed: current, history: 'none' })
    }
  })

  it('keeps a known restored source outside current results until deliberate filtering', () => {
    const filters: ExplorerFilters = { ...referenceFilters, family: 'SOURCE' }
    const parsed = parseExplorerSearch(
      `${lessonSearch(referenceIdentity)}&family=SOURCE`,
      catalog,
    )
    expect(parsed).toEqual(ready(lesson({ filters }, referenceIdentity)))
    expect(resolveLesson(referenceIdentity, filters, catalog)).toMatchObject({
      kind: 'lesson',
      control: reference,
      excludedByFilters: true,
    })
    expect(
      transitionExplorerState(
        parsed,
        { type: 'set-query', query: 'guide-search' },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready(discovery({ ...filters, query: 'guide-search' })),
      history: 'replace',
    })
  })

  it('selects source results using the exact edition tuple and retains their collection', () => {
    expect(
      transitionExplorerState(
        ready(discovery(referenceFilters)),
        { type: 'select-lesson', identity: referenceIdentity },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready(lesson({ filters: referenceFilters }, referenceIdentity)),
      history: 'push',
    })
  })

  it('shows the exact entry in its own collection when recovering a mismatch', () => {
    expect(
      transitionExplorerState(
        ready(lesson({ mode: 'compliance' }, referenceIdentity)),
        { type: 'show-lesson-in-results' },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready(
        lesson(
          { mode: 'compliance', filters: referenceFilters },
          referenceIdentity,
        ),
      ),
      history: 'push',
    })
    expect(
      transitionExplorerState(
        ready(lesson({ filters: referenceFilters })),
        { type: 'show-lesson-in-results' },
        catalog,
      ),
    ).toMatchObject({ parsed: ready(lesson()), history: 'push' })
  })

  it('clears filters and returns to discovery without leaving the selected collection', () => {
    expect(
      transitionExplorerState(
        ready(
          discovery({
            ...referenceFilters,
            query: 'none',
            family: 'REF',
            level: 'Level 1',
          }),
        ),
        { type: 'clear-filters' },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready(discovery(referenceFilters)),
      history: 'push',
    })
    const current = ready(
      lesson(
        {
          mode: 'compliance',
          filters: { ...referenceFilters, query: 'guide-search' },
        },
        referenceIdentity,
      ),
    )
    expect(
      transitionExplorerState(current, { type: 'back-to-discovery' }, catalog),
    ).toMatchObject({
      parsed: ready({
        ...discovery({ ...referenceFilters, query: 'guide-search' }),
        mode: 'compliance',
      }),
      history: 'push',
    })
  })

  it('returns recovery and homepage example actions to teaching lessons', () => {
    expect(
      transitionExplorerState(
        { kind: 'invalid', reason: 'invalid-collection' },
        { type: 'recover-discovery' },
        catalog,
      ),
    ).toMatchObject({ parsed: ready(discovery()), history: 'push' })
    expect(
      transitionExplorerState(
        ready(lesson({ filters: referenceFilters }, referenceIdentity)),
        { type: 'open-example', mode: 'compliance' },
        catalog,
      ),
    ).toMatchObject({
      parsed: ready(lesson({ mode: 'compliance' })),
      history: 'push',
      fragment: 'explorer',
    })
  })

  it('copies only source identity and mode, then infers references on recipient load', () => {
    const copied = new URL(
      createLessonUrl(
        referenceIdentity,
        'it-cyber',
        new URL(
          'https://preview.example.com/?collection=lessons&q=private&family=AC#old',
        ),
      ),
    )
    expect(copied.searchParams.has('collection')).toBe(false)
    expect(copied.searchParams.has('q')).toBe(false)
    expect(copied.hash).toBe('#explorer')
    expect(parseExplorerSearch(copied.search, catalog)).toEqual(
      ready(
        lesson(
          { mode: 'it-cyber', filters: referenceFilters },
          referenceIdentity,
        ),
      ),
    )
  })
})

describe('control views', () => {
  it('reads a view from the address, leaves Decode implicit and resets unknown views visibly', () => {
    expect(parseExplorerSearch(lessonSearch(), catalog)).toEqual(
      ready(lesson()),
    )
    for (const tab of ['explain', 'evidence', 'practice', 'related'] as const) {
      expect(
        parseExplorerSearch(`${lessonSearch()}&tab=${tab}`, catalog),
      ).toEqual(ready(lesson({ tab })))
      expect(parameters(lesson({ tab })).get('tab')).toBe(tab)
    }
    expect(parameters(lesson()).has('tab')).toBe(false)
    for (const tab of ['', 'decode', 'DECODE', 'notes']) {
      const parsed = parseExplorerSearch(
        `${lessonSearch()}&tab=${tab}`,
        catalog,
      )
      expect(parsed).toEqual({
        ...ready(lesson()),
        notices: tab === 'decode' ? [] : ['tab-reset'],
      })
    }
  })

  it('changes the view without losing identity, chalk or filters, and never writes Decode', () => {
    const filters = { ...unfiltered, query: 'accounts', family: 'AC' }
    const opened = transitionExplorerState(
      ready(lesson({ filters, mode: 'it-cyber' })),
      { type: 'set-tab', tab: 'practice' },
      catalog,
    )
    expect(opened).toMatchObject({
      parsed: ready(lesson({ filters, mode: 'it-cyber', tab: 'practice' })),
      history: 'push',
    })
    const back = transitionExplorerState(
      opened.parsed,
      { type: 'set-tab', tab: 'decode' },
      catalog,
    )
    expect(back.history).toBe('push')
    if (back.parsed.kind !== 'ready') throw new Error('Expected a view')
    expect(back.parsed.state.tab).toBeUndefined()
    expect(serializeExplorerSearch(back.parsed.state)).toBe(
      serializeExplorerSearch(lesson({ filters, mode: 'it-cyber' })),
    )
    expect(
      transitionExplorerState(
        back.parsed,
        { type: 'set-tab', tab: 'decode' },
        catalog,
      ).history,
    ).toBe('none')
  })

  it('shares a view in the lesson address only when it is not Decode', () => {
    const location = new URL('https://preview.example.com/learn')
    expect(
      new URL(
        createLessonUrl(sampleIdentity, 'beginner', location, 'practice'),
      ).searchParams.get('tab'),
    ).toBe('practice')
    expect(
      new URL(
        createLessonUrl(sampleIdentity, 'beginner', location, 'decode'),
      ).searchParams.has('tab'),
    ).toBe(false)
    expect(
      new URL(createLessonUrl(sampleIdentity, 'beginner', location)).search,
    ).toBe(
      new URL(createLessonUrl(sampleIdentity, 'beginner', location, 'decode'))
        .search,
    )
  })
})
