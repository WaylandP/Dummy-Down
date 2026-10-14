# Phase 1: owner and learner acceptance

Use the PR's exact Vercel preview and commit SHA. The owner may need to sign in to
Vercel to view a protected preview. No terminal is needed. Plan about 20 minutes
per participant; longer is fine. This is a usability session, not an exam.

Recruit a beginner, an IT administrator unfamiliar with CMMC, and an experienced
compliance reader where possible. Record roles, not unnecessary personal details.
Use fictional examples only. Do not paste CUI, credentials, client information or
organizational evidence into the website or feedback. Ask before recording a
session; a short written observation is sufficient.

The owner should observe without leading the learner through the steps. Mark each
task **Pass**, **Fail**, or **Not tested**, and note any assistance required. An
assisted task needs follow-up rather than silently becoming a pass. Do not invent
answers or infer comprehension from time on a page or analytics.

| Task                                                               | Pass criterion                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Start at Home and find a control about authorized access.          | Reader reaches `AC.L1-b.1.i` using search or its existing practice path, and can name the control.                                                                                                                                                                                                                                        |
| Browse all three CMMC levels, filter one, then clear filters.      | Reader recognizes Level 1/2/3, sees the appropriate results, and can return to the full collection without help.                                                                                                                                                                                                                          |
| Read the same control as Beginner, IT & Cyber and Compliance.      | Reader finds all three modes and can describe how their purposes differ without mistaking them for different requirements.                                                                                                                                                                                                                |
| Identify official text and teaching drafts.                        | Reader identifies the attributed requirement quotation and the separately authored draft; understands qualified review is pending.                                                                                                                                                                                                        |
| Find the source citation and version.                              | Reader can identify the September 2024 v2.13 guide and page, open a citation, and explain that a historical snapshot does not establish current applicability. If the external host is blocked, record that separately.                                                                                                                   |
| Explain the idea back.                                             | Beginner explains authorization versus a working login in their own words. IT reader names a possible implementation and one limitation. Compliance reader names a verification question without calling a teaching example mandatory or sufficient evidence. Record actual words; a qualified reviewer must judge technical correctness. |
| Look up an unfamiliar term inside a lesson, then return.           | Reader opens and closes a definition without losing the lesson/mode, and recognizes the definition is a draft.                                                                                                                                                                                                                            |
| Use Practice, check an answer, read feedback, retry and finish.    | Reader understands the explanation, can correct an answer and restart, and does not interpret completion as a compliance score.                                                                                                                                                                                                           |
| Copy a lesson link, open it in another tab, then use Back/Forward. | Control and mode restore. Reader does not expect saved quiz progress across page loads.                                                                                                                                                                                                                                                   |
| Search for an absent term/control and recover.                     | Empty-state guidance leads back to usable results, with no silent replacement of a requested missing control.                                                                                                                                                                                                                             |
| Read on a phone and a larger display.                              | Navigation and controls remain reachable; no clipping, overlapping text or two-direction reading is required. Reader reports whether contrast, line length and spacing are comfortable.                                                                                                                                                   |

## Keyboard and assistive-technology session

Record the actual OS, browser, assistive technology and versions. Test with the
reader's normal settings. Chromium automation and an accessibility tree are not
VoiceOver, NVDA, JAWS, TalkBack or Safari/iOS validation.

1. Without a mouse, use Tab and Shift+Tab, the skip link, search, native selects,
   results, pagination, source disclosures and lesson outline. Every action must
   be reachable with visible focus; no trap or unexpected jump to the header.
2. Change perspectives with Left/Right and Home/End. Selected mode and panel must
   be understandable. Tab should continue into the explanation.
3. With an actual screen reader, navigate by headings/landmarks and controls.
   Confirm names, selected/expanded/disabled states, search counts, mode changes,
   errors and quiz feedback are announced usefully. Note missing or duplicate
   announcements, especially feedback receiving focus inside a live region.
4. Operate quiz radios and check/retry/next/restart using only the keyboard. Focus
   must stay understandable, and explanatory feedback must be read before moving on.
5. Set browser zoom to **200%**, then **400%**, on a desktop window at least 1280px
   wide at 100%. Repeat search, mode changes and practice. Pass only if text and
   controls remain readable, operable and unclipped. Reset zoom afterward.
6. Test reduced motion and the platform's high-contrast/forced-color setting.
   Focus, selected tabs, inputs and answer feedback must remain distinguishable.
7. On an actual Mac/Safari and iPhone/iPad/Safari where available, repeat native
   navigation, deep-link refresh, source disclosure, modes, quiz and copy fallback.
   Include VoiceOver with its actual version. Record unavailable environments as
   **Not tested**, never as a pass.

## Feedback template

```text
Preview URL / commit SHA:
Date:
Participant role (beginner / IT / compliance / owner):
Browser + version / OS + version / device:
Assistive technology + version, if used:
Zoom and contrast/motion settings:
Task number/name:
Result: Pass / Fail / Not tested
Assistance needed:
What I expected:
What happened (steps; fictional content only):
My plain-English explanation, where requested:
Comfort or confusion notes:
Suggested improvement (optional):
Maintainer disposition: fix / accepted limitation / needs investigation
Retest build and result:
```

## Acceptance gate

No human results are recorded by creating this document. The owner must explicitly
accept a named build and scoped cycle after reviewing actual observations and
dispositions. Blocking navigation, unreadable content, traps or misleading
official/draft distinctions require correction and retesting. Preserve unresolved
items and unavailable environments in the roadmap. Technical checks can be
complete while this human-validation milestone stays unchecked.
