# gstack in Dummy-Down

[Garry Tan's gstack](https://github.com/garrytan/gstack) is a suite of specialist
engineering skills, including product planning, design consultation, visual
review, functional QA, code review, and shipping. The current upstream has an
[official Codex installer](https://github.com/garrytan/gstack/blob/945ac301a91dff5db9fc1ddaea5b77828eeca2ed/README.md#other-ai-agents).
Codex is explicitly **experimental**, with advisory safety hooks. It is not
certified to have all the enforced hooks or behavior of Claude Code.

## Reviewed installation

This integration pins gstack **1.91.97.0** at commit
`945ac301a91dff5db9fc1ddaea5b77828eeca2ed`, with Bun **1.4.3**. It uses the official
`setup --host codex` path, not the separate `codex/SKILL.md` second-opinion wrapper.
The upstream MIT-licensed source and its frozen-lockfile dependencies are retained
outside the application in a sibling `tools/gstack` checkout. Its source is not
patched or vendored into this repository.

`bash scripts/setup-gstack.sh` prepares the Linux x64 cloud environment.
`source scripts/gstack-env.sh` activates the runtime for a shell command. Existing
checkouts at a different revision or existing skill links are preserved rather
than overwritten. Upgrading the pin is a separate reviewed change.

Generated Codex discovery files live in `.agents/skills/`. The
`.claude/skills/gstack` source link is an installation scope marker for the official
installer; it does not register a global Claude install. Runtime state, browser
artifacts, and caches live in ignored `.gstack/` directories. Application tests
are explicitly scoped to `src/` so they do not execute the tool's unrelated tests.
Vercel builds the application without installing gstack.

The initial upstream installer also writes welcome/setup markers to
`$HOME/.gstack`, despite the project-local/state settings. In a sandbox it needs
write access to that directory for initial registration. The current cloud
installation completed that registration with scoped filesystem permission.
Retained, healthy installations are reused by the bootstrap without repeating
registration. Never change HOME or CODEX_HOME to work around a restriction.

## Browser compatibility

The cloud provides Chromium. gstack supports its path through
`GSTACK_CHROMIUM_PATH`, but this pinned release's stock readiness probe ignores
that setting and assumes a downloaded Playwright browser. Its minimal Codex
runtime also omits the dependencies required by that probe.

The bootstrap links the retained dependencies into the ignored runtime and adds
a project-local readiness adapter. It performs a real Chromium launch and render
through the lockfile-installed Playwright. The adapter preserves upstream behavior
when no custom Chromium is configured. It changes the generated project runtime,
not upstream source, application code, assertions, or artifact verification.
The installed adapter is retained in ignored `.gstack/integration/`, so it can
run independently of tracked helper files on another branch. Local Git exclusions
keep those private runtime files out of status and commits across branch switches.
`scripts/check-gstack-browser.mjs` contains the check. Chromium uses the container
launch configuration; package integrity and TLS verification remain enabled.

Installation readiness was verified with the official install inventory (25
section links resolved), repeated bootstrap, and the custom browser render check.
The original compiled gstack browser opened Dummy-Down, switched all learning
modes, exercised search and planned-framework recovery, captured a mobile
screenshot, and inspected console errors. No paid model or outside-provider
review was run. This is current-environment evidence, not host-wide certification.

## Using the skills

Read the applicable installed SKILL.md before following its workflow. Useful
skill directories include:

| Directory under `.agents/skills/` | Purpose                                                |
| --------------------------------- | ------------------------------------------------------ |
| `gstack-design-consultation`      | Establish design direction and principles              |
| `gstack-plan-design-review`       | Review a planned interface before implementation       |
| `gstack-design-review`            | Inspect and improve the running interface              |
| `gstack-qa` / `gstack-qa-only`    | Verify functional flows, with or without fixes         |
| `gstack-browse`                   | Drive the original browser and capture visual evidence |
| `gstack-review`                   | Review code before publishing reviewable progress      |
| `gstack-plan-eng-review`          | Review architecture and implementation plans           |

These are Codex filesystem skills. This chat may not advertise them as plugin
tools; request a skill by name and the agent can read its installed instructions.

Telemetry, automatic updates, and automatic outside-model reviews are disabled.
Optional Claude second opinions require that CLI and its authentication, and are
not enabled here. Artifact/transcript synchronization and native CSO helpers are
not part of this installation. Never treat unassessed capabilities as verified.

## GitHub and Vercel review workflow

AGENTS.md is the project workflow contract: feature branches, relevant tests and
build before pushing, incremental validated commits, an updated PR, and Vercel
preview links for the actual deployed commit. Never merge, enable auto-merge, or
run `land-and-deploy` without explicit user approval, regardless of skill defaults.

Vercel's existing Git integration creates a preview after a feature-branch push.
The agent checks its GitHub status, deployment record, and bot comment, then shares
the successful branch-preview link. The stable branch link updates as later
commits deploy; an immutable deployment URL identifies one specific build. Preview
deployment protection may require signing into Vercel as the project owner.

gstack can inspect a site, but does not create Vercel hosting or grant access
through deployment protection. Do not bypass protection or ask for credentials
in chat. Report an authentication page separately from an application failure.
