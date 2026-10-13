import { describe, expect, it } from 'vitest'
import { filterControls } from './control-search'
import { controls } from './controls'
import { frameworks } from './frameworks'
import type { Control } from '../types/content'

describe('filterControls', () => {
  it('finds a control by identifier without case or surrounding whitespace sensitivity', () => {
    expect(filterControls(controls, { query: '  ac.l2-3.1.1  ' })).toEqual(
      controls,
    )
  })

  it('finds language from explanations as well as metadata', () => {
    expect(filterControls(controls, { query: 'locked front door' })).toEqual(
      controls,
    )
    expect(filterControls(controls, { query: 'Access Control' })).toEqual(
      controls,
    )
  })

  it('combines the query, framework, family, and level instead of ignoring filters', () => {
    expect(
      filterControls(controls, {
        query: 'accounts',
        frameworkId: 'cmmc',
        family: 'AC',
        level: 'Level 2',
      }),
    ).toEqual(controls)
    expect(
      filterControls(controls, { query: 'accounts', family: 'IA' }),
    ).toEqual([])
    expect(filterControls(controls, { level: 'Level 1' })).toEqual([])
    expect(filterControls(controls, { query: 'devices nonexistent' })).toEqual(
      [],
    )
  })

  it('keeps planned frameworks empty instead of substituting CMMC content', () => {
    for (const framework of frameworks.filter(
      (entry) => entry.status === 'planned',
    )) {
      expect(filterControls(controls, { frameworkId: framework.id })).toEqual(
        [],
      )
    }
  })

  it('supports framework-specific identifiers and controls without levels', () => {
    const example: Control = {
      ...controls[0]!,
      id: 'AC-2',
      frameworkId: 'another-framework',
      level: undefined,
    }
    expect(
      filterControls([example], {
        query: 'AC-2',
        frameworkId: 'another-framework',
      }),
    ).toEqual([example])
    expect(filterControls([example], { level: 'Level 2' })).toEqual([])
  })

  it('returns all available controls for an empty query without changing the input', () => {
    expect(filterControls(controls, { query: '   ' })).toEqual(controls)
    expect(filterControls(controls)).not.toBe(controls)
    expect(controls).toHaveLength(1)
  })
})
