import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  chmodSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  readlinkSync,
  readdirSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  CANONICAL_NAMES,
  EXECUTABLE_RUNTIME_ASSETS,
  PINNED_REVISION,
  RUNTIME_ASSETS,
  checkGstackCoverage,
  checkGstackInstalled,
  checkGstackRegistry,
  checkGstackTrackedSource,
  checkGstackUpstream,
} from './check-gstack.mjs'
import {
  preflightSkillOwnership,
  repairQaTemplate,
} from './repair-gstack-qa.mjs'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const registry = JSON.parse(
  readFileSync(join(projectRoot, 'docs/gstack-skills.json'), 'utf8'),
)
const clone = () => structuredClone(registry)
const accounting = () =>
  CANONICAL_NAMES.map(
    (name) =>
      `| \`${name}\` | not-applicable | This fixture has no triggered work. |`,
  ).join('\n')

function write(path, value) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, value)
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'dummy-down-gstack-check-'))
  for (const skill of registry.skills.filter((entry) => entry.codexSupported)) {
    write(
      join(root, skill.installedPath, 'SKILL.md'),
      `---\nname: ${skill.codexFrontmatterName}\ndescription: fixture\n---\n`,
    )
    if (skill.metadataPath)
      write(
        join(root, skill.metadataPath),
        `interface:\n  display_name: "${skill.codexFacingDisplayName}"\n`,
      )
    for (const section of skill.supportingSections)
      write(join(root, skill.installedPath, section.path), 'fixture section\n')
  }
  write(
    join(
      root,
      '.agents/skills/gstack-qa/templates/functional-report-template.md',
    ),
    'fixture report\n',
  )
  write(
    join(root, '.agents/skills/gstack-qa/templates/qa-report-template.md'),
    'fixture browser report\n',
  )
  for (const asset of RUNTIME_ASSETS)
    write(join(root, '.agents/skills/gstack', asset), 'fixture runtime asset\n')
  for (const asset of EXECUTABLE_RUNTIME_ASSETS)
    chmodSync(join(root, '.agents/skills/gstack', asset), 0o755)
  return root
}

function qaRepairFixture() {
  const root = mkdtempSync(join(tmpdir(), 'dummy-down-gstack-repair-'))
  const project = join(root, 'project')
  const source = join(root, 'source')
  const generated = join(source, '.agents/skills/gstack-qa')
  const mapping = join(project, '.agents/skills/gstack-qa')
  const overlay = join(project, '.gstack/integration/skills/gstack-qa')
  write(join(generated, 'SKILL.md'), 'pinned generated QA instructions\n')
  write(
    join(generated, 'templates/functional-report-template.md'),
    'functional\n',
  )
  write(join(source, 'qa/templates/qa-report-template.md'), 'pinned browser\n')
  mkdirSync(dirname(mapping), { recursive: true })
  symlinkSync(generated, mapping, 'dir')
  return { root, project, source, generated, mapping, overlay }
}

test('QA overlay survives repeated bootstrap and an official installer relink', () => {
  const { root, project, source, generated, mapping, overlay } =
    qaRepairFixture()
  try {
    assert.match(repairQaTemplate(project, source), /project overlay/)
    assert.equal(readlinkSync(mapping), overlay)
    assert.equal(repairQaTemplate(project, source), 'healthy overlay reused')
    unlinkSync(mapping)
    symlinkSync(generated, mapping, 'dir')
    assert.match(repairQaTemplate(project, source), /project overlay/)
    assert.equal(readlinkSync(mapping), overlay)
    assert.equal(
      readFileSync(join(overlay, 'templates/qa-report-template.md'), 'utf8'),
      'pinned browser\n',
    )
    assert.equal(
      preflightSkillOwnership(registry, project, source),
      'existing mappings are project-managed',
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('foreign skill links block broad repair and stay untouched', () => {
  const { root, project, source } = qaRepairFixture()
  try {
    const foreign = join(root, 'user-review')
    write(join(foreign, 'SKILL.md'), 'user-owned instructions\n')
    const mapping = join(project, '.agents/skills/gstack-review')
    symlinkSync(foreign, mapping, 'dir')
    assert.throws(
      () => preflightSkillOwnership(registry, project, source),
      /Preserving foreign skill mapping/,
    )
    assert.equal(readlinkSync(mapping), foreign)
    assert.equal(
      readFileSync(join(foreign, 'SKILL.md'), 'utf8'),
      'user-owned instructions\n',
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('partial, altered or symlinked QA overlays are preserved rather than overwritten', () => {
  for (const altered of ['partial', 'content', 'symlink']) {
    const { root, project, source, generated, mapping, overlay } =
      qaRepairFixture()
    try {
      repairQaTemplate(project, source)
      unlinkSync(mapping)
      symlinkSync(generated, mapping, 'dir')
      const router = join(overlay, 'SKILL.md')
      if (altered === 'partial') rmSync(router)
      if (altered === 'content') writeFileSync(router, 'user change\n')
      if (altered === 'symlink') {
        rmSync(router)
        symlinkSync(join(generated, 'SKILL.md'), router)
      }
      assert.throws(() => repairQaTemplate(project, source))
      assert.equal(readlinkSync(mapping), generated)
      if (altered === 'content')
        assert.equal(readFileSync(router, 'utf8'), 'user change\n')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  }
})

test('repair refuses foreign QA mappings and symlinked integration parents', () => {
  for (const foreign of ['mapping', 'parent']) {
    const { root, project, source, mapping } = qaRepairFixture()
    try {
      const user = join(root, 'user-directory')
      mkdirSync(user)
      if (foreign === 'mapping') {
        unlinkSync(mapping)
        symlinkSync(user, mapping, 'dir')
      } else symlinkSync(user, join(project, '.gstack'), 'dir')
      assert.throws(() => repairQaTemplate(project, source), /Preserving/)
      assert.deepEqual(readdirSync(user), [])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  }
})

test('actual registry accounts for the fixed canonical source and Codex host', () => {
  assert.deepEqual(checkGstackRegistry(registry), {
    canonical: 58,
    supported: 57,
    sections: 28,
  })
  assert.deepEqual(checkGstackCoverage(accounting(), registry), {
    accountedFor: 58,
    proof: 'structure only',
  })
})

test('missing canonical, duplicate, wrong pin and wrong host mapping are rejected', () => {
  for (const mutate of [
    (copy) => {
      delete copy.coverageRecord
    },
    (copy) => {
      copy.coverageRecord = '../outside.md'
    },
    (copy) => copy.skills.pop(),
    (copy) => copy.skills.push(copy.skills[0]),
    (copy) => {
      copy.pinnedRevision = '0'.repeat(PINNED_REVISION.length)
    },
    (copy) => {
      copy.skills.find(
        (entry) => entry.canonicalName === 'codex',
      ).codexSupported = true
    },
    (copy) => {
      copy.skills.find(
        (entry) => entry.canonicalName === 'review',
      ).installedPath = '.agents/skills/review'
    },
  ]) {
    const copy = clone()
    mutate(copy)
    assert.throws(() => checkGstackRegistry(copy))
  }
})

test('missing source, runtime/gate metadata and lazy section omissions are rejected', () => {
  for (const mutate of [
    (copy) => {
      delete copy.hostRules
    },
    (copy) => {
      delete copy.skills[0].purposeAndTrigger
    },
    (copy) => {
      copy.skills[0].requiredToolsAuthRuntime = []
    },
    (copy) => {
      delete copy.skills[0].sideEffectsAndGates
    },
    (copy) => {
      copy.skills
        .find((entry) => entry.canonicalName === 'office-hours')
        .supportingSections.pop()
    },
  ]) {
    const copy = clone()
    mutate(copy)
    assert.throws(() => checkGstackRegistry(copy))
  }
})

test('coverage omission, duplicate or bare marker cannot pass accounting', () => {
  assert.throws(
    () =>
      checkGstackCoverage(
        accounting().replace(
          '| `review` | not-applicable | This fixture has no triggered work. |',
          '',
        ),
        registry,
      ),
    /exactly 58/,
  )
  assert.throws(
    () =>
      checkGstackCoverage(
        `${accounting()}\n| \`review\` | not-applicable | Duplicate. |`,
        registry,
      ),
    /exactly 58/,
  )
  assert.throws(
    () =>
      checkGstackCoverage(
        `${accounting()}\n<!-- gstack-skill:invented -->`,
        registry,
      ),
    /unknown skill/,
  )
  assert.throws(
    () =>
      checkGstackCoverage(
        CANONICAL_NAMES.map((name) => `<!-- gstack-skill:${name} -->`).join(
          '\n',
        ),
        registry,
      ),
    /exactly 58/,
  )
  assert.equal(
    checkGstackCoverage(
      `${accounting()}\n<!-- gstack-skill:review -->`,
      registry,
    ).accountedFor,
    58,
  )
})

test('blank reasons, unknown statuses and unsupported completion claims fail', () => {
  const row =
    '| `review` | not-applicable | This fixture has no triggered work. |'
  for (const [replacement, error] of [
    ['| `review` | blocked | |', /evidenceOrReason/],
    [
      '| `review` | installed | Instructions exist. |',
      /unknown execution status/,
    ],
    ['| `review` | completed | Passed. |', /explicit evidence reference/],
    [
      '| `review` | completed | [Review](docs/review.md). |',
      /reviewed revision/,
    ],
  ]) {
    assert.throws(
      () =>
        checkGstackCoverage(accounting().replace(row, replacement), registry),
      error,
    )
  }
  const completed = accounting().replace(
    row,
    '| `review` | completed | [Review](docs/review.md) on commit 8b061a6. |',
  )
  assert.equal(checkGstackCoverage(completed, registry).accountedFor, 58)
  const declared =
    'Reviewed base: `8b061a6`\n' +
    accounting().replace(
      row,
      '| `review` | completed | [Review](docs/review.md). |',
    )
  assert.equal(checkGstackCoverage(declared, registry).accountedFor, 58)
})

test('upstream rejects tracked modifications without touching the retained checkout', () => {
  const root = mkdtempSync(join(tmpdir(), 'dummy-down-gstack-source-'))
  try {
    execFileSync('git', ['init', '-q', root])
    write(join(root, 'tracked.txt'), 'original\n')
    execFileSync('git', ['-C', root, 'add', 'tracked.txt'])
    execFileSync('git', [
      '-C',
      root,
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.invalid',
      'commit',
      '-qm',
      'fixture',
    ])
    assert.throws(
      () => checkGstackUpstream(registry, root),
      /wrong pinned HEAD/,
    )
    write(join(root, 'untracked-cache.txt'), 'cache\n')
    checkGstackTrackedSource(root)
    write(join(root, 'tracked.txt'), 'modified\n')
    assert.throws(
      () => checkGstackTrackedSource(root),
      /tracked source modifications/,
    )
    execFileSync('git', ['-C', root, 'add', 'tracked.txt'])
    assert.throws(
      () => checkGstackTrackedSource(root),
      /tracked source modifications/,
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('isolated complete installation validates without optional CSO or Claude tools', () => {
  const root = fixture()
  try {
    assert.equal(checkGstackInstalled(registry, root).installedInstructions, 57)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('individual missing SKILL and broken directory mapping are caught', () => {
  for (const brokenLink of [false, true]) {
    const root = fixture()
    try {
      const directory = join(root, '.agents/skills/gstack-review')
      if (brokenLink) {
        rmSync(directory, { recursive: true })
        symlinkSync(join(root, 'nonexistent-render'), directory)
      } else rmSync(join(directory, 'SKILL.md'))
      assert.throws(
        () => checkGstackInstalled(registry, root),
        /Installed mapping review/,
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  }
})

test('required Codex metadata, lazy asset and QA template failures are distinct', () => {
  for (const [path, expected] of [
    [
      '.agents/skills/gstack-review/agents/openai.yaml',
      /Installed metadata review/,
    ],
    [
      '.agents/skills/gstack-office-hours/sections/design-and-handoff.md',
      /Installed lazy asset office-hours/,
    ],
    [
      '.agents/skills/gstack-qa/templates/functional-report-template.md',
      /Installed QA functional template/,
    ],
    [
      '.agents/skills/gstack-qa/templates/qa-report-template.md',
      /Installed QA browser template/,
    ],
    [
      '.agents/skills/gstack/review/checklist.md',
      /Installed runtime asset review\/checklist.md/,
    ],
  ]) {
    const root = fixture()
    try {
      rmSync(join(root, path))
      assert.throws(() => checkGstackInstalled(registry, root), expected)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  }
})

test('present but non-executable native runtime assets are rejected', () => {
  for (const asset of EXECUTABLE_RUNTIME_ASSETS) {
    const root = fixture()
    try {
      chmodSync(join(root, '.agents/skills/gstack', asset), 0o644)
      assert.throws(
        () => checkGstackInstalled(registry, root),
        /not executable/,
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  }
})

test('a symlinked SKILL file and incorrect frontmatter do not pass installation', () => {
  for (const symlinked of [false, true]) {
    const root = fixture()
    try {
      const path = join(root, '.agents/skills/gstack-review/SKILL.md')
      if (symlinked) {
        const target = join(root, 'source-review.md')
        writeFileSync(target, readFileSync(path))
        rmSync(path)
        symlinkSync(target, path)
      } else writeFileSync(path, '---\nname: wrong\n---\n')
      assert.throws(
        () => checkGstackInstalled(registry, root),
        /Installed mapping review/,
      )
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  }
})

test('body prose cannot substitute for a missing frontmatter name', () => {
  const root = fixture()
  try {
    writeFileSync(
      join(root, '.agents/skills/gstack-review/SKILL.md'),
      '---\ndescription: fixture\n---\nname: review\n',
    )
    assert.throws(
      () => checkGstackInstalled(registry, root),
      /wrong frontmatter name/,
    )
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
