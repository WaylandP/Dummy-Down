# CMMC perspectives and usage validation

Validated 2026-10-13 on `feat/cmmc-perspectives-usage`, against main `079c395`.
README.md and LICENSE are unchanged. The first source/usage increment is commit
`c293f8f`; PR #4 remains open. No merge or production deployment was invoked.

## Content and source results

The source inventory has 15 Level 1, 110 Level 2 and 24 Level 3 identifiers in the
pinned September 2024 CMMC v2.13 snapshot. All149 references now have three
separate original teaching drafts: 447 perspectives. The original README-based
lesson, six glossary terms and its fictional practice activity remain separate.

The expanded source verifier passed all four PDF hashes/provenance records,
independent guide/model inventories, complete quoted paragraphs, model titles and
families, both sets of page citations and all10 publication wording differences.
It rejected 11 deliberately corrupted temporary catalogs. The
[complete editorial audit](cmmc-perspectives-editorial-audit.md) read all149
draft records against requirements/objectives and source discussion, leading to
six verified clarifications. Audited JSON fingerprints remain unchanged.

These checks do not establish current contract applicability, latest-publication
freshness or qualified human editorial approval. Direct official-host fetches
were blocked by proxy CONNECT403. Draft labels and version context remain visible;
questions and evidence examples are not official objectives or complete checklists.

## Automated checks

- `npm run lint`: passed.
- `npm run format:check`: passed.
- `npm test`: **245 tests passed in18 files**, including exact edition binding,
  all149 coverage, perspective/history behavior, load failure and analytics.
- `npm run build`: passed, including TypeScript. The teaching collection is a
  separate242.63kB chunk (66.16kB gzip); initial JS is397.40kB (107.62kB gzip).
- Full local PDF source verifier: passed.
- Production dependency audit after adding the official SDK: zero known findings.

The analytics tests exercise both mocked metadata/privacy boundaries and the
actual official SDK queue. They verify one sanitized root pageview, suppressed
query-history pageviews, production-only injection, opt-out/DNT/GPC behavior,
allowlisted metadata and no duplicate view on privacy toggles. Separate rendered
control events cover known incoming/history identities; they do not prove reading.
Search measurement does not duplicate Enter followed by blur or count untouched
fields. No raw search text, answers, copied URLs or visitor IDs are event properties.

## Browser and review results

Local Chromium checks exercised the homepage CTA, all-level navigation and
Level2/3 counts; actual source selection; three mode tabs; End-key selection with
focus; browser Back restoration; evidence disclosure; unclear reflection feedback;
and successful copy-reference feedback. The built app loaded a Level3 control and
its curriculum chunk correctly. Sampled320,390,768 and1440px layouts had no
horizontal overflow; teaching body text remained16px, and sampled mode targets
were47–62px tall. The browser reported no console errors on the final happy path.
Desktop and mobile viewport screenshots were visually inspected; they retain the
dark, spacious field-guide style.

An independent [code review](cmmc-perspectives-usage-code-review.md) identified a
cached dynamic-import failure that made the original retry ineffective. Reload
recovery was independently replayed in isolated Chromium: the chunk was requested
again, three tabs returned and the entire lesson URL/mode were preserved. A
failure-injection unit test also keeps the exact source text readable. The final
rendered-control analytics delta received a separate affected-code review.

The review's initial formal evidence aggregate was inconclusive because it mixed
superseded and expanded commands; that receipt remains intact. It is not relabeled
as a full formal QA pass. Direct native test output, isolated browser replay and
source audit evidence are described with their actual scopes.
The subsequent analytics delta used a fresh evidence root:46 affected tests
passed with a scoped PASS verdict, leaving the initial receipt unchanged.

## Owner usage dashboard

See [Usage measurement](../USAGE.md). The SDK is integrated, but no account secret
or owner-only dashboard is exposed publicly. Vercel Web Analytics activation,
custom-event entitlement and actual collector receipt could not be verified here.
If disabled, the owner enables Analytics in the Vercel project through their
browser. Preview/development collection is intentionally off. Production traffic
can begin after an owner-approved merge, subject to account configuration and
visitor preferences. No merge is required to review this feature preview.
