# Dummy-Down development

Read README.md for the mission and roadmap, docs/DEVELOPMENT.md for the project
commands, and docs/DESIGN.md for the dark, spacious topographic design direction.
Preserve README.md and LICENSE unless the user explicitly asks to change them.

## Branches, review, and previews

- Work on a feature branch. Never implement directly on main.
- Keep a GitHub pull request against main updated with the final scope, validation,
  and any remaining limitations. If the previous PR is merged or closed, create a
  fresh branch from the latest main and open a new PR.
- Complete and validate each requested change or independently reviewable part,
  then commit and push it. Push reviewable progress during large features rather
  than waiting for the whole feature to finish.
- Before every push, run the checks appropriate to the change. Frontend changes
  require npm run lint, npm run format:check, npm test, and npm run build (which
  includes typechecking). Check meaningful browser interactions for UI changes.
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
