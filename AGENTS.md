# Cipher & Chalk development

Read README.md for the mission and roadmap, docs/DEVELOPMENT.md for the project
commands, and docs/DESIGN.md for the active blackboard design direction.
Use the exact display name “Cipher & Chalk.” The owner's latest October 14 feedback
calls for a useful, distinctive reference desk with clear structure, while retaining
matte black, soft chalk and comfortable spacing. Home leads with a real control
search, three existing draft practice paths, a teaching board, and source/glossary
shortcuts. Use IBM Plex Sans for the interface and reading; reserve handwritten
Kalam for teaching and margin notes. Keep the supplied four-part mark and use warm
ochre accents sparingly. Home, Learn, Glossary and About have separate native pages.
Preserve content identities, legacy links, analytics privacy and source/draft labels.
Keep normal practice usable without storage. Optional, explicit local saving can
restore version-matched checked answers; preserve its privacy and deletion guards. Follow docs/DESIGN.md and prioritize reading comfort.
GitHub now reports the externally renamed repository as WaylandP/cipher-and-chalk.
Keep existing deployment/project, package, storage and content IDs; do not rename
infrastructure or rewrite historical source URLs for a display-name change.
See docs/designs/cipher-and-chalk.md for the existing UI inventory; its earlier
missing-image limitation is historical. Both reference images have now been seen.
Update documentation to match implemented behavior and honest content status.
Preserve LICENSE and third-party notices; distinguish the approved direction from
final owner visual sign-off and qualified content approval.

Keep the public progress documents aligned. Update `docs/ROADMAP.md` whenever a
milestone is completed, materially advanced, blocked, re-scoped, or removed, and
preserve planned milestones unless a documented project decision changes them.
Update `TODOS.md` for next actionable priorities and `CHANGELOG.md` for meaningful
changes merged into `main`. Keep the README concise and audience-facing. Never use
fabricated completion percentages or equate automated/AI review with qualified
human approval.

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

## Current visual direction

The reference-desk implementation was merged in PR #12. Preserve its useful entry
points: direct search, three existing draft practice paths, a teaching board, and
lesson links to Source, Explain it, and Practice only where an activity exists. Phase 3 adds source-bound draft activities, controlled visual explanations and
optional local progress; its engineering and external-review status lives in the roadmap. The owner, screen-reader,
Safari/iOS, and real-learner reviews remain pending; do not describe the design as
finally accepted or accessibility-certified. Its evidence and limits are recorded
in [the study-desk checkpoint](docs/reviews/study-desk-2026-10-14.md).

## gstack for Codex

At task start, verify the exact pinned installation and evaluate every canonical
skill's trigger in [docs/GSTACK-SKILLS.md](docs/GSTACK-SKILLS.md). Read
[docs/GSTACK.md](docs/GSTACK.md) for setup and compatibility. Follow the inventory's
six default routes and utility gates; a spelling correction does not require a
product-planning cycle. Account for every skill, including unsupported, inapplicable,
blocked and approval-gated cases. Installation and reading are not execution.
Activate the project-local runtime with `source scripts/gstack-env.sh` in each
shell session. If installation is missing, run `bash scripts/setup-gstack.sh`.
Run `npm run check:gstack:installed`; use the bootstrap to repair demonstrated gaps.
Run `npm run check:gstack` before publishing workflow changes. These checks verify
structure and mappings, not review authenticity, quality or native discovery.

Automatically run every applicable supported skill within the authorized scope.
Read its actual installed SKILL.md and required sections before execution; never
substitute a generic review silently. Record source revision, reviewed inputs,
commands/artifacts, findings, fixes and exact omissions in one dated coverage record.
Rerun reviews invalidated by later changes. Retrospective planning is retrospective;
partial/adapted execution is not a full skill pass. Native discovery and enforced
hooks must be verified separately. These project rules do not affect other repos.

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
