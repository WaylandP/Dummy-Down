#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const projectRoot = new URL('../', import.meta.url)

function text(value, context) {
  assert.equal(typeof value, 'string', `${context}: expected text`)
  assert.ok(value.trim(), `${context}: must not be empty`)
}

function httpsUrl(value, context) {
  text(value, context)
  const url = new URL(value)
  assert.equal(url.protocol, 'https:', `${context}: expected HTTPS`)
  assert.equal(
    url.username + url.password,
    '',
    `${context}: credentials forbidden`,
  )
}

function page(value, context) {
  assert.ok(Number.isInteger(value) && value > 0, `${context}: invalid page`)
}

function textList(value, context) {
  assert.ok(
    Array.isArray(value) && value.length,
    `${context}: expected entries`,
  )
  value.forEach((entry, index) => text(entry, `${context}[${index}]`))
}

/** Check publication facts and draft coverage, never regulatory correctness. */
export function checkContentSummary({ catalog, drafts, manifest, readme }) {
  assert.ok(Array.isArray(catalog.controls), 'Catalog: missing controls')
  assert.ok(Array.isArray(catalog.sources), 'Catalog: missing source documents')
  const sources = [catalog.modelSource, ...catalog.sources]
  const sourceIds = new Set()

  for (const source of sources) {
    const context = `Source ${source.id}`
    for (const field of [
      'id',
      'title',
      'version',
      'publicationDate',
      'documentId',
      'sha256',
      'publicationNotice',
      'retrievedDate',
      'acquisitionNote',
      'extractionNote',
    ])
      text(source[field], `${context}.${field}`)
    assert.ok(!sourceIds.has(source.id), `${context}: duplicate ID`)
    sourceIds.add(source.id)
    assert.match(source.sha256, /^[a-f0-9]{64}$/, `${context}: invalid SHA-256`)
    assert.match(
      source.retrievedDate,
      /^\d{4}-\d{2}-\d{2}$/,
      `${context}: invalid date`,
    )
    assert.match(
      source.publicationDate,
      /^\d{4}-\d{2}$/,
      `${context}: invalid month`,
    )
    assert.ok(source.downloadedBytes > 0, `${context}: missing byte count`)
    httpsUrl(source.officialUrl, `${context}.officialUrl`)
    httpsUrl(source.retrievedFrom, `${context}.retrievedFrom`)
    const recorded = manifest.sources.find((entry) => entry.id === source.id)
    assert.ok(recorded, `${context}: absent from source manifest`)
    for (const field of ['sha256', 'version', 'publicationDate', 'documentId'])
      assert.equal(
        source[field],
        recorded[field],
        `${context}: manifest ${field} differs`,
      )
  }

  const ids = new Set()
  const levelCounts = { 1: 0, 2: 0, 3: 0 }
  for (const control of catalog.controls) {
    const context = `Control ${control.id}`
    for (const field of [
      'id',
      'title',
      'family',
      'familyName',
      'officialRequirement',
      'modelStatement',
      'sourceId',
      'modelSourceId',
      'sourceSection',
    ])
      text(control[field], `${context}.${field}`)
    assert.ok(!ids.has(control.id), `${context}: duplicate ID`)
    ids.add(control.id)
    assert.ok([1, 2, 3].includes(control.level), `${context}: unknown level`)
    assert.ok(
      control.id.startsWith(`${control.family}.L${control.level}-`),
      `${context}: ID/level mismatch`,
    )
    levelCounts[control.level] += 1
    assert.ok(
      sourceIds.has(control.sourceId),
      `${context}: missing guide source`,
    )
    assert.equal(
      control.modelSourceId,
      catalog.modelSource.id,
      `${context}: missing model source`,
    )
    assert.equal(
      control.sourceSection,
      control.id,
      `${context}: section mismatch`,
    )
    for (const field of [
      'sourcePdfPage',
      'sourcePrintedPage',
      'modelSourcePdfPage',
      'modelSourcePrintedPage',
    ])
      page(control[field], `${context}.${field}`)
  }
  for (const level of [1, 2, 3]) {
    assert.equal(
      catalog.counts[`level${level}`],
      levelCounts[level],
      `Catalog Level ${level}: cached count differs`,
    )
    assert.equal(
      manifest.verification.counts[`level${level}`],
      levelCounts[level],
      `Manifest Level ${level}: count differs`,
    )
  }

  const draftIds = new Set()
  let perspectiveCount = 0
  for (const draft of drafts) {
    const context = `Draft ${draft.id}`
    assert.ok(ids.has(draft.id), `${context}: no corresponding reference`)
    assert.ok(!draftIds.has(draft.id), `${context}: duplicate draft`)
    draftIds.add(draft.id)
    text(draft.beginner?.meaning, `${context}.beginner.meaning`)
    text(draft.beginner?.example, `${context}.beginner.example`)
    text(draft.technical?.focus, `${context}.technical.focus`)
    text(draft.technical?.example, `${context}.technical.example`)
    text(draft.technical?.watchFor, `${context}.technical.watchFor`)
    text(draft.compliance?.focus, `${context}.compliance.focus`)
    textList(
      draft.compliance?.reviewQuestions,
      `${context}.compliance.reviewQuestions`,
    )
    textList(
      draft.compliance?.evidenceExamples,
      `${context}.compliance.evidenceExamples`,
    )
    perspectiveCount += 3
  }
  assert.deepEqual(
    draftIds,
    ids,
    'Draft coverage: catalog and teaching identities differ',
  )

  const block = readme.match(
    /<!-- content-summary:start -->([\s\S]*?)<!-- content-summary:end -->/,
  )
  assert.ok(block, 'README: missing content-summary markers')
  const published = new Map()
  for (const match of block[1].matchAll(
    /^\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|\s*$/gm,
  )) {
    const label = match[1].trim()
    assert.ok(!published.has(label), `README: duplicate count ${label}`)
    published.set(label, Number(match[2]))
  }
  const expected = new Map([
    ['Level 1 references', levelCounts[1]],
    ['Level 2 references', levelCounts[2]],
    ['Level 3 references', levelCounts[3]],
    ['Total references', ids.size],
    ['Draft perspective texts', perspectiveCount],
  ])
  assert.deepEqual(
    published,
    expected,
    'README: published inventory differs from repository data',
  )
  assert.ok(
    readme.includes(`CMMC v${catalog.modelSource.version}`),
    'README: source version is missing',
  )

  return {
    references: ids.size,
    levelCounts,
    perspectiveCount,
    sourceDocuments: sources.length,
  }
}

async function main() {
  const readJson = async (path) =>
    JSON.parse(await readFile(new URL(path, projectRoot), 'utf8'))
  const [catalog, manifest, readme, ...draftFiles] = await Promise.all([
    readJson('src/data/cmmc-213-catalog.json'),
    readJson('docs/sources/cmmc-2-13-manifest.json'),
    readFile(new URL('README.md', projectRoot), 'utf8'),
    readJson('src/data/perspectives/level-1-3.json'),
    readJson('src/data/perspectives/level-2-a.json'),
    readJson('src/data/perspectives/level-2-b.json'),
  ])
  const summary = checkContentSummary({
    catalog,
    manifest,
    readme,
    drafts: draftFiles.flat(),
  })
  console.log(
    `Content summary verified: ${summary.references} references (${Object.values(summary.levelCounts).join('/')}), ${summary.perspectiveCount} draft perspectives, ${summary.sourceDocuments} source documents. Qualified review is not established by this check.`,
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`Content summary failed: ${error.message}`)
    process.exitCode = 1
  })
}
