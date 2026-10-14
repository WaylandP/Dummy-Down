import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  objectiveCoverage,
  perspectiveExcerpt,
  resolveCoverage,
} from './objective-coverage'
import inventory from './cmmc-objectives.json'
import mappings from './cmmc-objective-mappings.json'
import { cmmcPerspectiveDrafts } from './cmmc-perspectives'
import { referenceControls } from './cmmc-references'
import { coverageUrl } from '../state/coverage-url'
import type {
  AssessmentStatement,
  ControlCoverageMapping,
  PerspectiveLocation,
} from '../types/coverage'

const statements = inventory.objectives as readonly AssessmentStatement[]
const records = mappings.controls as readonly ControlCoverageMapping[]
const digest = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex')

describe('source-bound explanation coverage', () => {
  it('accounts for every source row and every control exactly once, without counting quotes as teaching', () => {
    expect(objectiveCoverage.map((row) => row.statement.id)).toEqual(
      statements.map((row) => row.id),
    )
    expect(records.map((record) => record.controlId).sort()).toEqual(
      referenceControls.map((control) => control.id).sort(),
    )
    expect(
      objectiveCoverage.filter((row) => row.coverage === 'explained-in-draft'),
    ).toHaveLength(466)
    expect(
      objectiveCoverage
        .filter((row) => row.coverage === 'missing')
        .map((row) => row.statement.id),
    ).toEqual(['SI.L3-3.14.3e[a]', 'SI.L3-3.14.3e[b]'])
    for (const row of objectiveCoverage) {
      expect(row.contentStatus).toBe('draft')
      expect(row.humanReview).toBe('pending')
      expect(row.sourceVerification).toBe('pinned-snapshot-verified')
      if (row.coverage === 'missing') {
        expect(row.excerpts).toEqual([])
        expect(row.explanation).toBeUndefined()
        expect(row.aiReview).toBe('unresolved')
        expect(row.unresolvedQuestions.length).toBeGreaterThan(0)
      } else {
        expect(row.excerpts.length || row.explanation?.length).toBeGreaterThan(
          0,
        )
        expect(row.aiReview).toBe('compared')
      }
    }
  })
  it('requires source and teaching re-review when fingerprints change', () => {
    expect(digest(inventory.objectives)).toBe(mappings.sourceStatementsSha256)
    // Reviewed mappings include notes, labels, fields, practice links and unresolved text.
    expect(digest(mappings)).toBe(
      '00ea0e494f7e97089d4b328d833b51b0025404ed7ab8ed1bcba9fccc45cfc9d0',
    )
    for (const record of records) {
      const draft = cmmcPerspectiveDrafts.find(
        (item) => item.id === record.controlId,
      )
      expect(digest(draft), `Stale coverage review: ${record.controlId}`).toBe(
        record.perspectiveSha256,
      )
    }
    expect(mappings.humanReview).toBe('pending')
    expect(mappings.reviewedAt).toBe('2026-10-14')
    expect(mappings.frameworkId).toBe(inventory.frameworkId)
    expect(mappings.editionId).toBe(inventory.editionId)
  })
  it('links only the thirteen selected examples from the exact source-bound activities', () => {
    const examples = objectiveCoverage.filter((row) => row.practice)
    expect(examples).toHaveLength(13)
    expect(new Set(examples.map((row) => row.statement.controlId))).toEqual(
      new Set(['AC.L1-b.1.i', 'AC.L1-b.1.iv', 'MP.L1-b.1.vii']),
    )
  })
  it('rejects omitted, duplicated and invented mappings', () => {
    expect(() => resolveCoverage(statements, records.slice(1))).toThrow(
      'Missing control/source/teaching mapping',
    )
    expect(() =>
      resolveCoverage(statements, [...records, records[0]!]),
    ).toThrow('duplicate mapped control')
    const [first, ...rest] = records
    expect(() =>
      resolveCoverage(statements, [
        { ...first!, mappings: [...first!.mappings, first!.mappings[0]!] },
        ...rest,
      ]),
    ).toThrow('Duplicate mapping')
    expect(() =>
      resolveCoverage(statements, [
        {
          ...first!,
          mappings: [
            ...first!.mappings,
            { labels: ['ODP9'], locations: ['technical.focus'] },
          ],
        },
        ...rest,
      ]),
    ).toThrow('Orphan mapping')
  })
  it('rejects missing, duplicated, cross-control and mis-cited source rows', () => {
    expect(() => resolveCoverage(statements.slice(1), records)).toThrow(
      'Orphan mapping',
    )
    expect(() =>
      resolveCoverage([...statements, statements[0]!], records),
    ).toThrow('Duplicate or cross-control')
    expect(() =>
      resolveCoverage(
        [
          { ...statements[0]!, controlId: 'AC.L2-3.1.1' },
          ...statements.slice(1),
        ],
        records,
      ),
    ).toThrow('cross-control')
    expect(() =>
      resolveCoverage(
        [{ ...statements[0]!, pdfPage: 99 }, ...statements.slice(1)],
        records,
      ),
    ).toThrow('Wrong source citation')
  })
  it('rejects cross-edition coverage and cross-control practice links', () => {
    expect(() =>
      resolveCoverage(statements, records, {
        ...mappings,
        editionId: 'readme-example',
      }),
    ).toThrow('Unsupported coverage edition')
    const [first, ...rest] = records
    const changed = {
      ...first!,
      mappings: [
        {
          ...first!.mappings[0]!,
          practiceStep: {
            activityId: 'level-one-media-disposal',
            stepId: 'dispose-paper',
          },
        },
        ...first!.mappings.slice(1),
      ],
    }
    expect(() => resolveCoverage(statements, [changed, ...rest])).toThrow(
      'Invalid practice identity/step',
    )
    expect(
      coverageUrl({
        id: 'AC.L1-b.1.i',
        frameworkId: 'cmmc',
        editionId: 'readme-example',
      }),
    ).toBeUndefined()
    expect(coverageUrl(referenceControls[0]!)).toBe(
      '/coverage?control=AC.L1-b.1.i',
    )
  })
  it('rejects unknown teaching fields and unexplained false-positive mappings', () => {
    expect(() =>
      perspectiveExcerpt(
        cmmcPerspectiveDrafts[0]!,
        'requirement.text' as PerspectiveLocation,
      ),
    ).toThrow('Unknown teaching field')
    const [first, ...rest] = records
    expect(() =>
      resolveCoverage(statements, [
        {
          ...first!,
          mappings: [
            { ...first!.mappings[0]!, locations: [], explanation: '' },
            ...first!.mappings.slice(1),
          ],
        },
        ...rest,
      ]),
    ).toThrow('Missing explanation')
    expect(() =>
      resolveCoverage(statements, [
        {
          ...first!,
          mappings: [
            { ...first!.mappings[0]!, unresolvedQuestion: 'Unresolved source' },
            ...first!.mappings.slice(1),
          ],
        },
        ...rest,
      ]),
    ).toThrow('must not claim explanation')
  })
})
