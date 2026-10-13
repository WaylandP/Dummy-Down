import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { checkContentSummary } from './check-content-summary.mjs'

const json = async (path) =>
  JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'))
const base = {
  catalog: await json('src/data/cmmc-213-catalog.json'),
  manifest: await json('docs/sources/cmmc-2-13-manifest.json'),
  drafts: (
    await Promise.all(
      ['level-1-3', 'level-2-a', 'level-2-b'].map((file) =>
        json(`src/data/perspectives/${file}.json`),
      ),
    )
  ).flat(),
  readme: await readFile(new URL('../README.md', import.meta.url), 'utf8'),
}

test('accepts the actual published snapshot and teaching inventory', () => {
  assert.equal(checkContentSummary(base).references, 149)
})
for (const [name, mutate] of [
  [
    'stale published total',
    (input) => {
      input.readme = input.readme.replace(
        /(\| Total references\s*\|\s*)149/,
        '$1148',
      )
    },
  ],
  [
    'missing quoted source page',
    (input) => {
      delete input.catalog.controls[0].sourcePdfPage
    },
  ],
  [
    'missing technical caution',
    (input) => {
      input.drafts[0].technical.watchFor = ''
    },
  ],
  [
    'duplicate teaching identity',
    (input) => {
      input.drafts.push(input.drafts[0])
    },
  ],
  [
    'changed source fingerprint',
    (input) => {
      input.catalog.modelSource.sha256 = '0'.repeat(64)
    },
  ],
]) {
  test(`rejects ${name}`, () => {
    const input = structuredClone(base)
    mutate(input)
    assert.throws(() => checkContentSummary(input))
  })
}
