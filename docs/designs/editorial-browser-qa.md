# Independent editorial browser QA

**Status: DONE_WITH_CONCERNS.** The selected browser flows ran independently. One visible identity defect was found, fixed by the parent implementation agent and rechecked. No unresolved product defect was observed in the selected flows. The formal evidence formatter remains **INCONCLUSIVE: no evidence rows**; this report preserves that verdict.

| Field                 | Observed scope                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Date                  | October 13, 2026                                                                                                                |
| Target                | Actual Vite application at http://localhost:5173                                                                                |
| Branch                | feat/level-one-editorial-learning                                                                                               |
| Inputs                | Commit 36f6965dcc2a25ce1db7d2e2c0b89646b6199a7b plus the parent’s wordmark border fix                                           |
| CSS SHA-256           | 87b4b8cba79fa4e6be46e254dddcb8e319c3bd3c271f2ee953d7e1fd71464240                                                                |
| Driver                | Installed Playwright and separate /usr/bin/chromium contexts                                                                    |
| Authority             | Report-only local browser probes, fictional answers and owned fixtures; no shared tabs, imported sessions or production account |
| Scope                 | One React/Vite SPA, 36 guarded commands/flows, five real controls and two address-recovery cases                                |
| Probe budget          | 900 seconds; start 22:06:31.518 UTC; final command finished 22:20:37.712 UTC; stopped after selected checks                     |
| Guarded command time  | Unmeasured across repeated attempts; no application latency claim                                                               |
| Total session elapsed | Unmeasured; reporting and cleanup occur after probing                                                                           |
| Scores                | Not assigned; parent requested fact-based findings                                                                              |

## Charters

1. **Homepage and identity:** compact homepage, functioning search entrypoint, new readable wordmark, current metadata/favicon, safe internal anchors and loaded assets. Risk: stale brand or broken primary navigation. Entrypoint `/`; owned fresh desktop/mobile Chromium contexts. Exit: rendered evidence and no missing assets/console exceptions on selected path.
2. **Three Level 1 lessons:** AC.L1-b.1.i, AC.L1-b.1.iv, MP.L1-b.1.vii, September 2024 v2.13 edition. Risk: scenario/diagram/question/source mismatch or wrong progress reuse. Entrypoints canonical control links; fictional answer choices only. Exit: three complete explained practice flows, accessible diagrams/text equivalents and distinct all-three modes, no implied human approval.
3. **Discovery/history/share/recovery:** real search/filter empty recovery, exact control links, Back/Forward, glossary focus dismissal. Risk: losing reader context, misleading copied state or unresolvable source routes. Fresh contexts, clipboard fixture rejection only in owned browser. Exit: success/recovery state and focus observed.
4. **Responsive/accessibility/privacy:** 320/390/768/1440 widths; keyboard tab selection/focus; touch hit areas; measured contrast; actual browser zoom if controllable, otherwise clearly limited reflow. Risk: horizontal overflow, clipped modes/source context, broken keyboard flow or accidental analytics. Fresh local contexts with browser privacy preference fixtures, native opt-out controls only. Exit: actual geometry and navigation evidence; production-provider receipt explicitly excluded.

Probe commands: existing Node Playwright runner, wrapped by installed gstack 900-second deadline guard. Synthetic input only; page metadata, console errors, response failures, readonly geometry and screenshots retained. The owned runner closes all contexts and Chromium in `finally`.

## Verified browser behavior

- The compact homepage rendered the new identity, headline, usable search and visible source/draft limits. Normal selected flows had no console errors, uncaught page errors or missing assets. Fonts and favicon loaded locally.
- Actual level links returned **15 / 110 / 24** references. A Level 2 Authorized Access Control and Level 3 Organizationally Controlled Assets reference each rendered all three distinct perspectives with no invented practice activity.
- The three new Level 1 activities—AC.L1-b.1.i, AC.L1-b.1.iv and MP.L1-b.1.vii—each completed its three-question flow. A later pass exercised **all 27 answer branches**, including retry, with distinct explanation text. Completion focused its heading and explicitly did not measure compliance or assessment readiness.
- ArrowRight, Home and End moved tab focus and selection; only the selected tab had tabindex 0. Question 2 persisted across mode changes and Back. Changing lessons and returning through Back reset practice to Question 1. Separate actual Back/Forward restored Compliance and IT & Cyber with matching address state.
- Quiz feedback appeared in a polite live status region. After the disabled Check answer control, keyboard Tab reached Try again. Next question focused the next prompt; completion focused its heading. This is Chromium observation, not screen-reader certification.
- Authorization opened a sourced draft definition. Escape closed it and restored its trigger’s focus. Searching “sanitization” returned three relevant glossary entries; Media sanitization expanded with its educational label and source context.
- A synthetic clipboard denial produced a focused, read-only canonical reference-link textarea preserving edition, control and Compliance mode, without false copying success. Empty search showed zero references; Clear filters restored 149 references and search focus.
- Unavailable identity and duplicate-framework-address inputs showed distinct honest states. Browse draft examples restored canonical discovery and enabled, focused search.
- A delayed perspective import showed “Loading teaching perspectives…”. An aborted import kept the official quotation and other draft lesson material readable. Removing the owned network fixture and using Reload page to retry restored the same AC.L1-b.1.iv Compliance address and panel. Its resource-error message was expected from the synthetic abort.
- Expanded determination statements, review notes and source metadata had no horizontal overflow at **320, 390, 768 and 1440 CSS pixels**. Phone tabs measured 52px high; desktop tabs measured 48px. Real Chromium touch events expanded results, selected the already-current control, collapsed results, focused the title, changed mode and submitted a fictional answer.
- **Actual native 200% page zoom** was set using Chromium appearance settings in an owned profile. Outer width stayed 1440; inner width became 720; devicePixelRatio became 2; document scroll width remained 720. The three tabs measured 52px high. Compliance, review, objectives and source disclosures remained operable. [Native browser-view capture](../screenshots/editorial-native-zoom-200.png).
- Normal and forced-colors headers were inspected at desktop and 390px phone widths. The actual favicon loaded and remained readable at native 16px and 32px. [Favicon specimen](../screenshots/editorial-favicon-16-32.png).
- Sampled text contrast: charcoal/white **14.86:1**, charcoal/canvas **13.84:1**, muted/white **6.46:1**, muted/canvas **6.02:1**, teal/white **6.39:1**, teal/canvas **5.95:1**. Field-border/white was **3.99:1**. A focused perspective had a 3px teal outline with 4px offset. This is sampled computed-color verification, not an exhaustive accessibility audit.
- Usage & privacy correctly reported measurement off locally. Pause changed to Allow usage measurement after reload. No third-party runtime requests occurred in the normal local flows. Observed internal fragment links had existing targets; Glossary and Explorer navigation changed the fragment correctly.

## Finding and recheck

**QA-001: The background-drawn wordmark hyphen disappeared in forced colors.**

**Observed:** Chromium forced colors showed “Dummy Down,” with the visual separator absent. **Expected:** preserve the designed separator while respecting browser colors. **Severity:** low visual defect; the accessible home-link name remained correct. **Evidence:** original local forced-colors screenshot and the current [high-contrast header](../screenshots/editorial-high-contrast-header.png). **Confirmation:** after the parent replaced the background with a currentColor border, fresh desktop and phone browser renders showed the hyphen again, with no horizontal overflow. **Status:** parent fix, independently rechecked. The QA agent edited no application code or tests.

## Evidence and limits

The owned run is .gstack/qa-reports/editorial-independent-20261013T2208Z/. Immutable four-field checkpoints retain exact preceding native-command results and next-command hypotheses; last.json retains the final loading/Forward result. The tracked screenshots are unchanged copies of actual captures.

Initial extension-based zoom attempts failed to produce a service worker, including an exact replay. Chromium’s own appearance settings subsequently provided genuine zoom. Initial touch fixtures timed out on a changing toggle label and normalized accessible name; observing the actual label and using corrected selectors completed the real touch flow. These are retained fixture limitations, not product defects.

One early native-zoom screenshot destination was reused before unique filenames were introduced; that superseded image is not relied upon. Playwright viewport capture produced blank images after native zoom and scrolling. The final separately named CDP browser-view capture (fromSurface:false) displayed actual content and is the tracked evidence. Native zoom settings, geometry and successful interactions were recorded independently. An old directory’s expired deadline was not reset; this run used a fresh directory.

Browser-only annotations intentionally have no functional captures. The installed materializer returned final **INCONCLUSIVE / no evidence rows**. No machine PASS or root product-test execution is attributed to this subagent. The actual installed QA template was read from the gstack runtime after its generated native template reference failed to resolve.

Production analytics activation, entitlement, provider receipt and production DNT/GPC enforcement were not independently checked. Neither were real phone hardware, all browser engines, assistive technology, all 149 lessons, current compliance applicability or qualified human approval. No paid service or collection permission was changed. The source/AI/human stages and unresolved limits remained visible.

## Durable operational notes

- Chromium’s isolated appearance-page selector supplies genuine page zoom when extension workers are unavailable. Verify outer/inner width and devicePixelRatio; use CDP browser-view capture after scrolling.
- The mobile toggle intentionally changes its accessible label after expansion. A stale locator timeout is not proof of a product bug.
- Forced colors can erase a currentColor background. A currentColor border preserved this wordmark separator in the actual browser.

No learning-store writes, application edits, product tests, commits, paid-account actions or shared-browser actions were performed by this report-only subagent.

## Local checkpoint index

Checkpoints `exploration-001.json` through `exploration-035.json` remain in the
owned `.gstack/qa-reports/editorial-independent-20261013T2208Z/` evidence folder.
That runtime folder is ignored from Git and is not published with the PR. The
observations, actual limits and selected unchanged screenshots above are the
reviewable evidence shipped in the repository; no public checkpoint links or
machine PASS are implied.
