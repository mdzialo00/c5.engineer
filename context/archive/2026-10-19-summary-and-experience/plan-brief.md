# Summary and experience: Plan Brief

> Full plan: `context/changes/summary-and-experience/plan.md`

## What & Why

Add the professional summary and work experience to the live page. This is S-03. It covers FR-002 and FR-003, the content a recruiter scans after the header.

## Starting Point

S-01 and S-02 are live with identity, contact info and three buttons. The text for this slice already exists in the CV PDF, and all page data lives in `lib/profile.ts`.

## Desired End State

Under the buttons, the page shows a summary paragraph and two stacked roles, Tesco Technology and Forte Digital, each with dates and every bullet from the CV. A deploy fails if either employer name disappears.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Bullet count | All bullets, verbatim from the CV | No editing pass, page matches the PDF | Plan |
| Role layout | Stacked entries, dates under the role on mobile | Wraps cleanly at 360px | Plan |
| Data location | Typed fields in `lib/profile.ts` | Same pattern as S-01 and S-02 | Plan |
| CI check | Grep for both employer names | Catches a lost section for two strings | Plan |

## Scope

**In scope:** summary and experience data, two page sections, smoke test extension.

**Out of scope:** skills, education, hobbies, trimming bullets, timeline graphics, test runner.

## Architecture / Approach

Plain server-rendered HTML in the existing 640px column. The page maps over `profile.experience`. The smoke test adds two strings to its existing grep list.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Summary and experience on the page | Data, two sections, 360px check | Long bullet text on a phone |
| 2. CI check | Deploy fails on a missing employer | Employer rename needs a workflow edit |

**Prerequisites:** S-01 and S-02 (done).
**Estimated effort:** under one evening across 2 phases.

## Open Risks & Assumptions

- Assumes the CV PDF text is current. Stale roles would go public.
- All 13 bullets make a long mobile page. Trimming later is a data-only change.

## Success Criteria (Summary)

- A recruiter sees the summary and both roles with all bullets.
- The page has no horizontal scroll at 360px.
- A deploy goes red if an employer name disappears.
