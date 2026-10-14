# Deployment and browser review

Cipher & Chalk is a static React/TypeScript frontend built with Vite. The existing
Vercel Git integration builds review deployments from GitHub; normal development
does not require a manual production deployment or an owner terminal session.
The display-name redesign does not rename the Dummy-Down repository, deployment
project, public hostname or service settings. Production changes require approval.

## Public website versus a review preview

The repository's configured public website is
[dummy-down.vercel.app](https://dummy-down.vercel.app). On October 13, 2026, the
public address returned HTTP 200 and the application's real HTML, JavaScript and
stylesheet references. GitHub recorded a successful **Production** deployment for
main commit `a7ccb99411641c3d31d7e0d6e33cfbbe147013c2`. This verifies an available
production site, not every feature or analytics delivery.

The corresponding deployment-specific Production URL required Vercel sign-in;
deployment protection and an application failure are different conditions. Do not
disable protection or import browser cookies to test it.

A feature branch's **Preview** is separate from production. Use the Vercel status
on the pull request to open the newest completed preview. A stable branch alias,
when Vercel actually publishes one, is convenient for continued review; an exact
deployment URL pins the revision. Do not invent an alias or infer success from a
URL alone.

## Maintainer workflow

1. Fetch current main and inspect the existing pull request. If the previous PR is
   merged or closed, start a fresh feature branch from current main. Otherwise
   continue the appropriate open branch and keep one coherent PR updated.
2. Install locked dependencies with `npm ci`. Use Node 22.12 or newer; GitHub CI
   uses Node 24.
3. Implement a reviewable increment. Run all current checks:

   ```sh
   npm run typecheck
   npm run lint
   npm run format:check
   npm test
   npm run build
   node scripts/check-content-summary.mjs
   ```

4. Inspect relevant real UI behavior on desktop and mobile. Browser review and
   software checks do not substitute for content approval.
5. Commit and push the validated increment, then check GitHub CI for that exact
   commit and the matching successful Vercel Preview deployment. Provide the PR,
   commit identifier, deployment status and actual preview URL.
6. Continue additional validated increments on the same PR. A merge is not needed
   between design, documentation and content work.

**Do not merge into main, enable auto-merge, bypass branch protection or promote a
deployment to production without explicit owner approval.** Vercel's normal Git
integration publishes production after an approved main change; this is not
permission to make that change autonomously.

## Build and service settings

Vercel should install from `package-lock.json`, run `npm run build`, and publish
Vite's `dist/` output. The app has no backend, authentication or runtime secrets.
The Explorer keeps state in the root URL's query and fragment, so its normal lesson
links do not require invented server routes.

Vite exposes only the non-secret `VERCEL_ENV` deployment category to the optional
analytics gate. Preview and development builds do not collect usage; production
collection still requires the visitor's allowed privacy state. SDK integration is
implemented, but account activation, entitlement and actual dashboard data receipt
remain unconfirmed. See [Usage measurement](USAGE.md). Do not enable paid services,
change analytics collection permissions or place tokens in client code.

## When a preview is unavailable

Inspect GitHub's commit checks and deployment status, then Vercel's build logs if
the owner has access. Report whether the exact revision is pending, failed,
protected by sign-in or missing a deployment. Do not substitute an older preview
and call it current. A successful deployment plus a protected browser response
requires the owner's normal Vercel sign-in; it does not justify bypassing access.

For local development only, `npm run dev -- --host 0.0.0.0` supports an environment
that forwards Vite's port. `npm run preview` serves an existing local `dist/` build.
These are developer tools, not the owner's normal review path or public hosting.
