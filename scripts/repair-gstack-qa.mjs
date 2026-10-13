#!/usr/bin/env node
import assert from 'node:assert/strict'
import {
  cpSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  renameSync,
  rmSync,
  symlinkSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const browserTemplate = 'templates/qa-report-template.md'
const generatedQa = (source) => join(source, '.agents/skills/gstack-qa')
const overlayQa = (project) =>
  join(project, '.gstack/integration/skills/gstack-qa')

function stat(path) {
  try {
    return lstatSync(path)
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

function sameEntry(source, copy) {
  const expected = lstatSync(source)
  const actual = stat(copy)
  assert.ok(actual, `Preserving incomplete overlay: ${copy}`)
  if (expected.isSymbolicLink()) {
    assert.ok(actual.isSymbolicLink(), `Preserving changed overlay: ${copy}`)
    assert.equal(readlinkSync(copy), readlinkSync(source), copy)
  } else if (expected.isDirectory()) {
    assert.ok(actual.isDirectory() && !actual.isSymbolicLink(), copy)
    const expectedNames = readdirSync(source).sort()
    const actualNames = readdirSync(copy)
      .filter(
        (name) =>
          !(copy.endsWith('/templates') && name === 'qa-report-template.md'),
      )
      .sort()
    assert.deepEqual(
      actualNames,
      expectedNames,
      `Preserving changed overlay: ${copy}`,
    )
    for (const name of expectedNames)
      sameEntry(join(source, name), join(copy, name))
  } else {
    assert.ok(
      expected.isFile() && actual.isFile() && !actual.isSymbolicLink(),
      copy,
    )
    assert.ok(
      readFileSync(source).equals(readFileSync(copy)),
      `Preserving changed overlay: ${copy}`,
    )
  }
}

function verifyOverlay(project, source) {
  const overlay = overlayQa(project)
  sameEntry(generatedQa(source), overlay)
  const target = join(overlay, browserTemplate)
  assert.ok(stat(target)?.isFile() && !stat(target).isSymbolicLink(), target)
  assert.ok(
    readFileSync(target).equals(
      readFileSync(join(source, 'qa', browserTemplate)),
    ),
    `Preserving changed browser template: ${target}`,
  )
}

function linkTarget(path) {
  assert.ok(
    stat(path)?.isSymbolicLink(),
    `Preserving unexpected skill mapping: ${path}`,
  )
  return resolve(dirname(path), readlinkSync(path))
}

function safeParents(project, relative, create = true) {
  let current = project
  for (const part of relative.split('/')) {
    current = join(current, part)
    if (!stat(current)) {
      if (!create) return
      mkdirSync(current)
    }
    assert.ok(
      stat(current).isDirectory() && !stat(current).isSymbolicLink(),
      `Preserving unexpected integration directory: ${current}`,
    )
  }
}

// Call only after the bootstrap has verified the exact, unmodified source pin.
export function repairQaTemplate(project, source) {
  safeParents(project, '.agents/skills', false)
  const mapping = join(project, '.agents/skills/gstack-qa')
  if (!stat(mapping)) return 'not installed'
  const target = linkTarget(mapping)
  const generated = generatedQa(source)
  const overlay = overlayQa(project)
  assert.ok(
    target === generated || target === overlay,
    `Preserving foreign QA mapping: ${mapping}`,
  )
  if (!stat(join(generated, 'SKILL.md'))) return 'generation needed'
  safeParents(project, '.gstack/integration/skills')
  if (target === overlay) {
    verifyOverlay(project, source)
    return 'healthy overlay reused'
  }
  if (stat(join(generated, browserTemplate)))
    return 'upstream template available'
  if (stat(overlay)) verifyOverlay(project, source)
  else {
    const scratch = mkdtempSync(join(dirname(overlay), '.qa-overlay-'))
    try {
      cpSync(generated, scratch, { recursive: true, verbatimSymlinks: true })
      cpSync(
        join(source, 'qa', browserTemplate),
        join(scratch, browserTemplate),
      )
      renameSync(scratch, overlay)
    } finally {
      rmSync(scratch, { recursive: true, force: true })
    }
    verifyOverlay(project, source)
  }
  // Only the expected generated mapping is replaced; no installation files deleted.
  const linkScratch = mkdtempSync(join(dirname(mapping), '.qa-link-'))
  try {
    symlinkSync(overlay, join(linkScratch, 'mapping'), 'dir')
    renameSync(join(linkScratch, 'mapping'), mapping)
  } finally {
    rmSync(linkScratch, { recursive: true, force: true })
  }
  return 'pinned browser template linked from project overlay'
}

export function preflightSkillOwnership(registry, project, source) {
  safeParents(project, '.agents/skills', false)
  for (const skill of registry.skills.filter((entry) => entry.codexSupported)) {
    const mapping = join(project, skill.installedPath)
    if (!stat(mapping)) continue
    const expected = join(source, skill.installedPath)
    if (skill.canonicalName === 'gstack' && !stat(mapping).isSymbolicLink()) {
      const router = join(mapping, 'SKILL.md')
      assert.ok(
        stat(router)?.isFile() && !stat(router).isSymbolicLink(),
        router,
      )
      assert.ok(
        readFileSync(router).equals(readFileSync(join(expected, 'SKILL.md'))),
        'Preserving changed root router before broad installer',
      )
    } else {
      const target = linkTarget(mapping)
      if (skill.canonicalName === 'qa' && target === overlayQa(project)) {
        safeParents(project, '.gstack/integration/skills', false)
        verifyOverlay(project, source)
      } else
        assert.equal(
          target,
          expected,
          `Preserving foreign skill mapping: ${mapping}`,
        )
    }
  }
  return 'existing mappings are project-managed'
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const [projectArg, sourceArg, mode] = process.argv.slice(2)
    assert.ok(
      projectArg && sourceArg && (!mode || mode === '--preflight'),
      'Usage: repair-gstack-qa.mjs PROJECT SOURCE [--preflight]',
    )
    const project = resolve(projectArg)
    const source = resolve(sourceArg)
    const registry = JSON.parse(
      readFileSync(join(project, 'docs/gstack-skills.json'), 'utf8'),
    )
    console.log(
      mode
        ? preflightSkillOwnership(registry, project, source)
        : repairQaTemplate(project, source),
    )
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
