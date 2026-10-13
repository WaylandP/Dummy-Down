import { track } from '@vercel/analytics'
import { explorerCatalog, glossaryTerms } from '../data/content'
import { findLearningActivity } from '../data/learning'
import type { ExplanationMode, LessonIdentity } from '../types/content'
import { getUsageStatus } from './privacy'

type Collection = 'lessons' | 'references'
type Property = string | number | boolean
type Properties = Record<string, Property>

export type UsageEvent =
  | {
      name: 'section_open'
      section: 'explorer' | 'glossary' | 'approach' | 'usage'
    }
  | { name: 'control_open'; lesson: LessonIdentity }
  | { name: 'control_view'; lesson: LessonIdentity; mode: ExplanationMode }
  | {
      name: 'perspective_change'
      lesson: LessonIdentity
      mode: ExplanationMode
    }
  | {
      name: 'perspective_feedback'
      lesson: LessonIdentity
      mode: ExplanationMode
      helpful: boolean
    }
  | {
      name: 'filter_change'
      filter: 'framework' | 'family' | 'level' | 'collection' | 'clear'
      value?: string
    }
  | {
      name: 'search_used'
      scope: 'explorer' | 'glossary'
      active: boolean
      resultCount: number
    }
  | {
      name: 'results_page'
      direction: 'next' | 'previous'
      collection: Collection
    }
  | { name: 'glossary_open'; termId: string }
  | {
      name: 'practice_action'
      lesson: LessonIdentity
      action: 'open' | 'check' | 'next' | 'retry' | 'reset' | 'complete'
    }
  | {
      name: 'source_open'
      lesson: LessonIdentity
      sourceId: string
      destination: 'publisher' | 'mirror' | 'index'
    }
  | {
      name: 'share_link'
      lesson: LessonIdentity
      action: 'copied' | 'fallback'
    }

function oneOf(value: unknown, values: readonly unknown[]) {
  return values.includes(value)
}

function resolveControl(lesson: LessonIdentity) {
  return explorerCatalog.controls.find(
    (control) =>
      control.frameworkId === lesson?.frameworkId &&
      control.editionId === lesson?.editionId &&
      control.key === lesson?.controlKey,
  )
}

function controlProperties(lesson: LessonIdentity): Properties | null {
  const control = resolveControl(lesson)
  if (!control) return null
  return {
    framework: control.frameworkId,
    edition: control.editionId,
    control: control.id,
    content: control.contentKind,
    ...(control.level ? { level: control.level } : {}),
  }
}

/** Runtime validation matters even when callers use TypeScript. */
export function usageProperties(event: UsageEvent): Properties | null {
  if (!event || typeof event !== 'object') return null
  switch (event.name) {
    case 'section_open':
      return oneOf(event.section, ['explorer', 'glossary', 'approach', 'usage'])
        ? { section: event.section }
        : null
    case 'control_open':
      return controlProperties(event.lesson)
    case 'perspective_change': {
      const properties = controlProperties(event.lesson)
      return properties &&
        oneOf(event.mode, ['beginner', 'it-cyber', 'compliance'])
        ? { ...properties, mode: event.mode }
        : null
    }
    case 'control_view': {
      const properties = controlProperties(event.lesson)
      return properties &&
        oneOf(event.mode, ['beginner', 'it-cyber', 'compliance'])
        ? { ...properties, mode: event.mode }
        : null
    }
    case 'perspective_feedback': {
      const properties = controlProperties(event.lesson)
      return properties &&
        oneOf(event.mode, ['beginner', 'it-cyber', 'compliance']) &&
        typeof event.helpful === 'boolean'
        ? { ...properties, mode: event.mode, helpful: event.helpful }
        : null
    }
    case 'filter_change': {
      if (event.filter === 'clear') return { filter: 'clear' }
      const values = {
        framework: explorerCatalog.frameworks.map((framework) => framework.id),
        family: [
          'all',
          ...new Set(explorerCatalog.controls.map((control) => control.family)),
        ],
        level: [
          'all',
          ...new Set(explorerCatalog.controls.map((control) => control.level)),
        ],
        collection: ['lessons', 'references'],
      }
      if (!Object.hasOwn(values, event.filter)) return null
      const allowed = values[event.filter]
      return allowed &&
        typeof event.value === 'string' &&
        oneOf(event.value, allowed)
        ? { filter: event.filter, value: event.value }
        : null
    }
    case 'search_used':
      if (
        !oneOf(event.scope, ['explorer', 'glossary']) ||
        typeof event.active !== 'boolean' ||
        !Number.isInteger(event.resultCount) ||
        event.resultCount < 0 ||
        event.resultCount > 1000
      )
        return null
      return {
        scope: event.scope,
        active: event.active,
        results:
          event.resultCount === 0
            ? 'none'
            : event.resultCount === 1
              ? 'one'
              : event.resultCount <= 8
                ? 'few'
                : 'many',
      }
    case 'results_page':
      return oneOf(event.direction, ['next', 'previous']) &&
        oneOf(event.collection, ['lessons', 'references'])
        ? { direction: event.direction, collection: event.collection }
        : null
    case 'glossary_open':
      return glossaryTerms.some((term) => term.id === event.termId)
        ? { term: event.termId }
        : null
    case 'practice_action': {
      const properties = controlProperties(event.lesson)
      return properties &&
        findLearningActivity(event.lesson) &&
        oneOf(event.action, [
          'open',
          'check',
          'next',
          'retry',
          'reset',
          'complete',
        ])
        ? { ...properties, action: event.action }
        : null
    }
    case 'source_open': {
      const control = resolveControl(event.lesson)
      const properties = controlProperties(event.lesson)
      return control &&
        properties &&
        (control.sources.some((source) => source.id === event.sourceId) ||
          (control.contentKind === 'official-reference' &&
            control.sourceDocuments.some(
              (document) => document.id === event.sourceId,
            ))) &&
        oneOf(event.destination, ['publisher', 'mirror', 'index'])
        ? {
            ...properties,
            source: event.sourceId,
            destination: event.destination,
          }
        : null
    }
    case 'share_link': {
      const properties = controlProperties(event.lesson)
      return properties && oneOf(event.action, ['copied', 'fallback'])
        ? { ...properties, action: event.action }
        : null
    }
    default:
      return null
  }
}

/** Analytics must never interrupt reading, navigation, or an interaction. */
export function trackUsage(event: UsageEvent): void {
  if (getUsageStatus() !== 'active') return
  const properties = usageProperties(event)
  if (!properties) return
  try {
    track(event.name, properties)
  } catch {
    // Unsupported/blocked analytics cannot prevent the requested action.
  }
}
