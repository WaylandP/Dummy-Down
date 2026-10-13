#!/usr/bin/env node
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  accessSync,
  constants,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PINNED_REVISION = '945ac301a91dff5db9fc1ddaea5b77828eeca2ed'
export const CANONICAL_NAMES = Object.freeze([
  'gstack',
  'autoplan',
  'benchmark',
  'benchmark-models',
  'browse',
  'canary',
  'careful',
  'claude-code',
  'codex',
  'context-restore',
  'context-save',
  'cso',
  'design-consultation',
  'design-html',
  'design-review',
  'design-shotgun',
  'deslop-shared-libs',
  'devex-review',
  'diagram',
  'document-generate',
  'document-release',
  'eval-plan',
  'freeze',
  'gstack-upgrade',
  'guard',
  'health',
  'investigate',
  'ios-clean',
  'ios-design-review',
  'ios-fix',
  'ios-qa',
  'ios-sync',
  'land-and-deploy',
  'landing-report',
  'learn',
  'make-pdf',
  'office-hours',
  'open-gstack-browser',
  'pair-agent',
  'plan-ceo-review',
  'plan-design-review',
  'plan-devex-review',
  'plan-eng-review',
  'plan-tune',
  'qa',
  'qa-only',
  'retro',
  'review',
  'scrape',
  'setup-browser-cookies',
  'setup-deploy',
  'setup-gbrain',
  'ship',
  'skillify',
  'spec',
  'sync-gbrain',
  'test-audit',
  'unfreeze',
])

const LAZY_SECTIONS = Object.freeze({
  'office-hours': [
    'design-and-handoff',
    'phase-2a-startup-diagnostic',
    'phase-2b-builder-brainstorm',
  ],
  'plan-ceo-review': ['checklist', 'review-sections'],
  qa: [
    'browser-setup',
    'browser-verify',
    'exploratory',
    'qa-patterns',
    'scope',
    'system-functional',
    'test-bootstrap',
  ],
  'qa-only': ['exploratory', 'reporting'],
  ship: [
    'adversarial',
    'apple-release',
    'changelog',
    'documentation',
    'greptile-early',
    'greptile',
    'handoff',
    'measure',
    'plan-completion',
    'pr-body',
    'review-army',
    'shared-code-reuse',
    'test-coverage',
    'tests',
  ],
})

// Required by the pinned supported runtime, not optional CSO/provider integrations.
export const RUNTIME_ASSETS = Object.freeze([
  'VERSION',
  'ETHOS.md',
  'bin/gstack-config',
  'bin/gstack-paths',
  'bin/gstack-browser-ensure',
  'browse/dist/browse',
  'scripts/jargon-list.json',
  'scripts/question-registry.ts',
  'docs/askuserquestion-split.md',
  'docs/askuserquestion-cjk.md',
  'docs/test-value-bar.md',
  'review/checklist.md',
  'review/design-checklist.md',
  'review/greptile-triage.md',
  'review/TODOS-format.md',
  'plan-devex-review/dx-hall-of-fame.md',
  'careful/bin/check-careful.sh',
  'freeze/bin/check-freeze.sh',
  'design-html/vendor/pretext.js',
  'office-hours/SKILL.md',
  'plan-design-review/SKILL.md',
])

export const EXECUTABLE_RUNTIME_ASSETS = Object.freeze([
  'bin/gstack-config',
  'bin/gstack-paths',
  'bin/gstack-browser-ensure',
  'browse/dist/browse',
])

function text(value, context) {
  assert.equal(typeof value, 'string', `${context}: expected text`)
  assert.ok(value.trim(), `${context}: must not be empty`)
}

function textList(value, context) {
  assert.ok(
    Array.isArray(value) && value.length,
    `${context}: expected entries`,
  )
  value.forEach((entry, index) => text(entry, `${context}[${index}]`))
}

function equalSet(actual, expected, context) {
  assert.equal(new Set(actual).size, actual.length, `${context}: duplicates`)
  assert.deepEqual(
    [...actual].sort(),
    [...expected].sort(),
    `${context}: missing or unexpected entries`,
  )
}

function displayName(name) {
  return name === 'gstack' || name === 'gstack-upgrade'
    ? name
    : `gstack-${name}`
}

/** Validate structure and pinned coverage, never authenticity or review quality. */
export function checkGstackRegistry(registry) {
  assert.match(
    registry.coverageRecord ?? '',
    /^docs\/reviews\/gstack-coverage-\d{4}-\d{2}-\d{2}\.md$/,
    'Registry coverageRecord must name a dated repository coverage record',
  )
  assert.equal(registry.schemaVersion, 1, 'Registry: unsupported schemaVersion')
  assert.equal(
    registry.pinnedRevision,
    PINNED_REVISION,
    'Registry: wrong pinned revision',
  )
  assert.equal(registry.canonicalCount, 58, 'Registry: wrong canonical count')
  assert.equal(
    registry.codexSupportedCount,
    57,
    'Registry: wrong Codex supported count',
  )
  assert.ok(Array.isArray(registry.skills), 'Registry: missing skills')
  equalSet(
    registry.skills.map((skill) => skill.canonicalName),
    CANONICAL_NAMES,
    'Canonical skills',
  )
  for (const field of ['aliases', 'notCanonical', 'hostRules']) {
    assert.ok(
      Array.isArray(registry[field]) && registry[field].length,
      `Registry.${field}: required metadata missing`,
    )
  }

  let sections = 0
  for (const skill of registry.skills) {
    const name = skill.canonicalName
    const context = `Skill ${name}`
    assert.equal(
      skill.sourcePath,
      name === 'gstack' ? 'SKILL.md.tmpl' : `${name}/SKILL.md.tmpl`,
      `${context}: wrong source path`,
    )
    const supported = name !== 'codex'
    assert.equal(
      skill.codexSupported,
      supported,
      `${context}: wrong host support`,
    )
    const installedPath = supported
      ? `.agents/skills/${displayName(name)}`
      : null
    assert.equal(
      skill.installedPath,
      installedPath,
      `${context}: wrong installed mapping`,
    )
    assert.equal(
      skill.codexFacingDisplayName,
      supported ? displayName(name) : null,
      `${context}: wrong Codex display name`,
    )
    assert.equal(
      skill.codexFrontmatterName,
      supported ? name : null,
      `${context}: wrong Codex frontmatter name`,
    )
    assert.equal(
      skill.metadataPath,
      supported && name !== 'gstack'
        ? `${installedPath}/agents/openai.yaml`
        : null,
      `${context}: wrong metadata mapping`,
    )
    text(skill.purposeAndTrigger, `${context}.purposeAndTrigger`)
    textList(
      skill.requiredToolsAuthRuntime,
      `${context}.requiredToolsAuthRuntime`,
    )
    textList(skill.sideEffectsAndGates, `${context}.sideEffectsAndGates`)
    assert.ok(
      Array.isArray(skill.supportingSections),
      `${context}: missing supporting sections`,
    )
    const expected = (LAZY_SECTIONS[name] ?? []).map(
      (section) => `sections/${section}.md`,
    )
    equalSet(
      skill.supportingSections.map((section) => section.path),
      expected,
      `${context} supporting sections`,
    )
    sections += expected.length
    if (skill.sourceSha256 !== undefined) {
      assert.match(
        skill.sourceSha256,
        /^[a-f0-9]{64}$/,
        `${context}: invalid source SHA-256`,
      )
    }
  }
  assert.equal(sections, 28, 'Registry: wrong lazy section count')
  return { canonical: 58, supported: 57, sections }
}

/** Validate required accounting fields; structure does not prove execution. */
export function checkGstackCoverage(record, registry) {
  text(record, 'Coverage record')
  const statuses = new Set([
    'completed',
    'applicable-not-yet-run',
    'not-applicable',
    'blocked',
    'awaiting-explicit-approval',
  ])
  const known = new Set(CANONICAL_NAMES)
  const rows = [
    ...record.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|([^|\n]*)\|([^\n]*)\|\s*$/gm),
  ]
  const skillRows = rows.filter((row) => known.has(row[1]))
  assert.equal(
    skillRows.length,
    58,
    'Coverage: expected exactly 58 canonical accounting rows',
  )
  equalSet(
    skillRows.map((row) => row[1]),
    CANONICAL_NAMES,
    'Coverage accounting rows',
  )
  const declaredRevision =
    /reviewed(?:\s+code)?\s+(?:base|revision)\s*[:=][\s*`]*[a-f0-9]{7,40}\b/i.test(
      record,
    )
  for (const [, name, rawStatus, rawReason] of skillRows) {
    const status = rawStatus.trim()
    const reason = rawReason.trim()
    assert.ok(
      statuses.has(status),
      `Coverage ${name}: unknown execution status ${status}`,
    )
    text(reason, `Coverage ${name}.evidenceOrReason`)
    if (status === 'completed') {
      const evidence =
        /\[[^\]]+\]\([^)]+\)|\b(?:docs|scripts|src|\.gstack)\/[^\s|]+|\b(?:Evidence|Reference):\s*\S+/i.test(
          reason,
        )
      assert.ok(
        evidence,
        `Coverage ${name}: completed requires an explicit evidence reference`,
      )
      assert.ok(
        declaredRevision || /\b[a-f0-9]{7,40}\b/.test(reason),
        `Coverage ${name}: completed requires a reviewed revision or declared reviewed base`,
      )
    }
  }
  const markerNames = []
  for (const match of record.matchAll(
    /<!--\s*gstack-skill:([a-z0-9-]+)\s*-->/g,
  )) {
    assert.ok(known.has(match[1]), `Coverage: unknown skill ${match[1]}`)
    markerNames.push(match[1])
  }
  assert.equal(
    new Set(markerNames).size,
    markerNames.length,
    'Coverage: duplicate accounting marker',
  )
  return { accountedFor: registry.skills.length, proof: 'structure only' }
}

function requireFile(path, context, realFile = false) {
  try {
    if (realFile)
      assert.ok(
        !lstatSync(path).isSymbolicLink(),
        `${context}: SKILL.md must be a real file`,
      )
    assert.ok(statSync(path).isFile(), `${context}: expected a file`)
    realpathSync(path)
  } catch (error) {
    throw new Error(`${context}: missing, broken, or invalid file ${path}`, {
      cause: error,
    })
  }
}

export function checkGstackInstalled(registry, projectRoot) {
  checkGstackRegistry(registry)
  for (const skill of registry.skills.filter((entry) => entry.codexSupported)) {
    const path = join(projectRoot, skill.installedPath, 'SKILL.md')
    requireFile(path, `Installed mapping ${skill.canonicalName}`, true)
    const frontmatter = readFileSync(path, 'utf8').match(
      /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/,
    )?.[1]
    const frontmatterName = frontmatter
      ?.match(/^name:[ \t]*([^\r\n]+)$/m)?.[1]
      ?.trim()
    assert.equal(
      frontmatterName,
      skill.codexFrontmatterName,
      `Installed mapping ${skill.canonicalName}: wrong frontmatter name`,
    )
    if (skill.metadataPath) {
      const metadata = join(projectRoot, skill.metadataPath)
      requireFile(metadata, `Installed metadata ${skill.canonicalName}`)
      const expected = skill.codexFacingDisplayName
      assert.match(
        readFileSync(metadata, 'utf8'),
        new RegExp(`display_name:\\s*["']?${expected}["']?\\s*(?:\\r?\\n|$)`),
        `Installed metadata ${skill.canonicalName}: wrong display name`,
      )
    }
    for (const { path: section } of skill.supportingSections) {
      requireFile(
        join(projectRoot, skill.installedPath, section),
        `Installed lazy asset ${skill.canonicalName}`,
      )
    }
  }
  requireFile(
    join(
      projectRoot,
      '.agents/skills/gstack-qa/templates/functional-report-template.md',
    ),
    'Installed QA functional template',
  )
  requireFile(
    join(
      projectRoot,
      '.agents/skills/gstack-qa/templates/qa-report-template.md',
    ),
    'Installed QA browser template',
  )
  for (const asset of RUNTIME_ASSETS) {
    requireFile(
      join(projectRoot, '.agents/skills/gstack', asset),
      `Installed runtime asset ${asset}`,
    )
  }
  for (const asset of EXECUTABLE_RUNTIME_ASSETS) {
    try {
      accessSync(
        join(projectRoot, '.agents/skills/gstack', asset),
        constants.X_OK,
      )
    } catch (error) {
      throw new Error(`Installed runtime asset is not executable: ${asset}`, {
        cause: error,
      })
    }
  }
  return {
    installedInstructions: 57,
    lazySections: 28,
    nativeDiscovery: 'unverified',
    optionalProviderRuntimes: 'not assessed',
  }
}

export function checkGstackTrackedSource(upstreamRoot) {
  const trackedChanges = execFileSync(
    'git',
    ['-C', upstreamRoot, 'status', '--porcelain', '--untracked-files=no'],
    {
      encoding: 'utf8',
      timeout: 5000,
    },
  ).trim()
  assert.equal(
    trackedChanges,
    '',
    'Upstream: tracked source modifications at pinned HEAD; preserve and inspect them',
  )
}

export function checkGstackUpstream(registry, upstreamRoot) {
  checkGstackRegistry(registry)
  const head = execFileSync('git', ['-C', upstreamRoot, 'rev-parse', 'HEAD'], {
    encoding: 'utf8',
    timeout: 5000,
  }).trim()
  assert.equal(head, PINNED_REVISION, 'Upstream: wrong pinned HEAD')
  checkGstackTrackedSource(upstreamRoot)
  const discovered = ['gstack']
  for (const entry of readdirSync(upstreamRoot, { withFileTypes: true })) {
    if (
      !entry.isDirectory() ||
      entry.name.startsWith('.') ||
      ['node_modules', 'dist'].includes(entry.name)
    )
      continue
    try {
      if (statSync(join(upstreamRoot, entry.name, 'SKILL.md.tmpl')).isFile())
        discovered.push(entry.name)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
  equalSet(discovered, CANONICAL_NAMES, 'Upstream canonical discovery')
  for (const skill of registry.skills) {
    const source = join(upstreamRoot, skill.sourcePath)
    requireFile(source, `Upstream template ${skill.canonicalName}`, true)
    if (skill.sourceSha256) {
      assert.equal(
        createHash('sha256').update(readFileSync(source)).digest('hex'),
        skill.sourceSha256,
        `Upstream ${skill.canonicalName}: changed template bytes`,
      )
    }
  }
  return { revision: head, canonical: discovered.length }
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export function runGstackCheck(args = process.argv.slice(2)) {
  let installed = false
  let upstream
  let inventoryOnly = false
  for (let index = 0; index < args.length; index++) {
    const flag = args[index]
    if (flag === '--installed') installed = true
    else if (flag === '--inventory-only') inventoryOnly = true
    else if (flag === '--upstream') {
      upstream = args[++index]
      assert.ok(
        upstream && !upstream.startsWith('--'),
        '--upstream requires a path',
      )
    } else throw new Error(`Unknown option: ${flag}`)
  }
  const registry = JSON.parse(
    readFileSync(join(projectRoot, 'docs/gstack-skills.json'), 'utf8'),
  )
  const results = { registry: checkGstackRegistry(registry) }
  if (!inventoryOnly) {
    results.coverage = checkGstackCoverage(
      readFileSync(join(projectRoot, registry.coverageRecord), 'utf8'),
      registry,
    )
  }
  if (installed)
    results.installation = checkGstackInstalled(registry, projectRoot)
  if (upstream)
    results.upstream = checkGstackUpstream(registry, resolve(upstream))
  return results
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    console.log(JSON.stringify(runGstackCheck(), null, 2))
    console.log(
      'Coverage structure does not prove execution, authenticity, review quality, or native discovery.',
    )
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
