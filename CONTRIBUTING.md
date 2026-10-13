# Contributing to Dummy-Down

Dummy-Down welcomes developers, educators, cybersecurity practitioners, and people
learning these subjects for the first time. Read the [README](README.md) for the
mission, planned features, project status, and MIT license. Practical installation
and validation instructions are in [Developing Dummy-Down](docs/DEVELOPMENT.md).

## Propose a change

Search existing issues and pull requests before starting. For a substantial feature
or a new framework, open an issue describing the learner's need, the proposed
scope, and how the change fits the roadmap. Small corrections and focused bug
fixes can go directly into a pull request.

Keep changes focused and describe what a learner can do after the change. Planned
features must remain clearly marked as planned until implemented and validated.
Do not imply that a prototype contains comprehensive or reviewed control coverage.

## Development workflow

1. Fork the repository if you do not have write access, then clone your fork.
2. Create a feature branch from `main`, for example
   `git switch -c feature/improve-control-search`.
3. Run `npm ci`, make your change, and add a meaningful behavioral test when the
   change affects how the application works.
4. Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
5. Commit the change and open a pull request against `main` with a clear summary
   and validation results. Maintainers review and merge accepted contributions.

In an isolated Codex cloud task, use the existing checkout rather than creating a
second Git worktree unless the task explicitly requests one.

Prefer reusable components and typed data over duplicated markup. Keep framework
content separate from presentation, use framework identifiers to relate records,
and avoid assumptions that every framework has CMMC levels. Include keyboard
interaction, descriptive labels, and visible focus in new UI controls.

## Contribute educational content

The application separates simplified explanations and practical examples from
official requirements. An example of possible evidence is not an assessment
objective, certification, or guarantee of success.

When proposing a control explanation:

- Identify the framework, applicable version, control identifier, and authoritative
  source. Prefer official agency or standards-body publications.
- Preserve the requirement's intent across Beginner, IT & Cybersecurity, and
  Compliance & Assessment modes. Do not invent requirements or objectives.
- Clearly label paraphrases and scenarios as educational. Do not reproduce
  restricted or copyrighted standards content without appropriate permission.
- Include source/version metadata and an honest review status. Link the specific
  applicable publication rather than treating a newer publication as automatically
  interchangeable with the version used by a program.
- Keep new content marked as draft until reviewed by someone qualified to assess
  its accuracy. Record review information only for a review that actually occurred.
- Explain any uncertainty in the pull request. Passing application tests does not
  establish that regulatory content is accurate or complete.

The initial CMMC example is draft educational content. Additional CMMC coverage
and future frameworks require their own content work and review; adding a name to
the framework model does not constitute support for that framework.

## Protect sensitive information

Do not place CUI, real organizational assessment evidence, credentials, personal
information, or other protected data in issues, pull requests, fixtures, or example
content. Use fictional, non-sensitive examples. Report ordinary bugs with steps to
reproduce them, the expected behavior, and relevant browser details.
