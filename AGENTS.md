# Dummy-Down development

Read README.md for the mission and roadmap, docs/DEVELOPMENT.md for the project
commands, and docs/DESIGN.md for the active proposed editorial design direction.
Keep the name Dummy-Down and the working tagline “Compliance, translated.” The
owner explicitly superseded the dark/topographic direction: start with neutral
light/off-white, charcoal type and restrained teal. Improve composition, reading
and interactions rather than restoring the rejected contours, background, logo,
or cybersecurity-vendor styling. This direction remains a proposal for review.
Update documentation to match implemented behavior and honest content status.
Preserve LICENSE and third-party notices; do not claim approval of a proposed brand.

## Branches, review, and previews

- Work on a feature branch. Never implement directly on main.
- Keep a GitHub pull request against main updated with the final scope, validation,
  and any remaining limitations. If the previous PR is merged or closed, create a
  fresh branch from the latest main and open a new PR.
- Complete and validate each requested change or independently reviewable part,
  then commit and push it. Push reviewable progress during large features rather
  than waiting for the whole feature to finish.
- Before every push, run the checks appropriate to the change. Frontend changes
  require npm run typecheck, npm run lint, npm run format:check, npm test, and
  npm run build. Run the content-summary check when published inventory or source
  metadata changes. Check meaningful browser interactions for UI changes.
- After pushing, inspect GitHub CI and Vercel deployments for that exact commit.
  Provide the PR and successful Vercel preview URL when available. Distinguish
  pending/failed previews, deployment protection, and production URLs. Never
  invent a preview URL or label a production deployment as a preview.
- The user reviews the website in Vercel through their browser. Do not make
  terminal commands or Codespaces the normal review workflow. Investigate missing
  previews through the Git integration/deployment status and explain the precise
  blocker if outside action is needed.
- Never merge into main, enable auto-merge, or invoke a merge/deploy workflow
  without the user's explicit approval. Skill defaults do not override this rule.

Cloud tasks are already isolated. Use the existing checkout; create a Git worktree
only when the user explicitly requests one. Preserve existing user changes.

## Content and implementation

Keep framework data separate from presentation. Do not assume every framework has
CMMC levels. Keep draft explanations and planned features clearly labeled. Do not
invent official requirements, assessment objectives, certifications, or evidence
sufficiency. Keep source/version context with the content. Prefer focused changes,
semantic HTML, keyboard support, readable contrast, and restrained decoration.

Distinguish source transcription checks, AI-assisted editorial review and qualified
human approval. Record actual reviewers and review dates only for reviews that
occurred. Source links and tests are not professional content approval. Preserve
stable edition identities and pinned source snapshots; do not silently replace an
applicable baseline with the newest NIST publication. Record blocked official-host
verification precisely and keep limitations visible. Source inventory or three
perspectives per entry does not establish full assessment-objective coverage.

Keep analytics production gating, allowlisted properties, opt-out, Do Not Track
and Global Privacy Control protections intact. Never collect raw search text,
answers, shared links, organizational evidence or visitor identifiers. Do not
enable paid services, activate analytics accounts, change collection permissions,
or claim provider data receipt without evidence and the owner's authorization.

## gstack for Codex

Read docs/GSTACK.md for the reviewed pin, supported skills, and known limitations.
Activate the project-local runtime with `source scripts/gstack-env.sh` in each
shell session. If installation is missing, run `bash scripts/setup-gstack.sh`.

Read the applicable installed SKILL.md under `.agents/skills/gstack-<name>/` before
using it. Use design-consultation for design direction, design-review for visual
QA, qa/qa-only for functional checks, review for code review, and plan-eng-review
for architecture. The user can request these by name even if this chat does not
advertise them as tools. They are experimental Codex filesystem skills, not a
promise of complete Claude Code feature parity.

Start new product and feature planning with office-hours unless the user names the
next skill to run. The owner has delegated routine planning and implementation
decisions: use the README and session context, label assumptions, and continue
through applicable CEO, engineering and design reviews into implementation, QA and
code review. Do not end a turn merely because one planning skill produced a document.
Run available independent reviews and disclose unverified work. Keep the results
reviewable for owner edits; delegated decisions do not constitute approval to merge.

Continue validated progress on the same open feature PR without asking the owner
to squash or merge between skills or commits. If they merge or close it, create the
next feature branch and PR from current main. A merge is never a prerequisite for
the next reviewable slice. Choose a coherent, complete delivery slice from the
roadmap; do not fabricate reviewed content to claim the entire roadmap is finished.

Keep installation/configuration scoped to this project. Automatic outside-model
reviews are disabled; enabling another provider or paid reviews needs a user
request. The no-merge rule above overrides ship/land-and-deploy defaults. Do not
start tunnels, import browser cookies, sync artifacts, or deploy to production
merely because a skill mentions those capabilities.
