# Skills and education: Plan Brief

> Full plan: `context/changes/skills-and-education/plan.md`

## What & Why

Add the skills list and education to the live page. They are the last two must-have CV sections (FR-004, FR-005), so after this the page carries everything the PRD requires except the parked hobbies.

## Starting Point

The page shows identity, three link buttons, the summary and work experience. All text lives in `lib/profile.ts`, and the deploy smoke test already checks the employer names.

## Desired End State

Below Work experience, the page shows six labelled skill rows and two education entries, all readable at 360px. If either section vanishes in a later change, the deploy fails.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Skills layout | Grouped rows, comma-separated | Fastest to scan on mobile and needs no new styling | Plan |
| Education layout | Stacked entries reusing the experience header | Keeps one layout pattern | Plan |
| Skill order | CV visual order, AI & Agentic Coding second | Matches what a recruiter sees in the PDF | Plan |
| CI strings | `Tanstack Query`, `ZSTIL High School` | The HTML escapes `&`, so strings must avoid it | Plan |
| Hobbies | Left out | Parked as FR-006 | Roadmap |

## Scope

**In scope:** skills data and section, education data and section, two CI strings.

**Out of scope:** hobbies, chips or ratings, rewording skills, a test runner.

## Architecture / Approach

Extend `lib/profile.ts` with `skills` and `education`. `app/page.tsx` maps over both, following the S-03 markup. The smoke test in `deploy.yml` gets two more strings.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Skills and education on the page | Both sections rendered from profile data | Long skill rows overflowing at 360px |
| 2. CI check | Deploy fails if either section is missing | Using a string with `&` that the HTML escapes |

**Prerequisites:** S-01 to S-03, all done.
**Estimated effort:** about one short session across two phases.

## Open Risks & Assumptions

- The PDF is the source of truth. If the CV changes, the profile data needs the same edit.

## Success Criteria (Summary)

- A recruiter sees skills and education on the live page, on a phone and on a desktop.
- A deploy that drops either section fails its smoke test.
