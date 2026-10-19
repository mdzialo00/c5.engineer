# Hobbies: Plan Brief

> Full plan: `context/changes/hobbies/plan.md`

## What & Why

Add a Hobbies line to the live page. It is the last PRD requirement (FR-006, nice-to-have) and the CV PDF already carries the text, so the page and the PDF will match.

## Starting Point

The page shows identity, link buttons, summary, experience, skills and education. All text lives in `lib/profile.ts`, and the deploy smoke test checks one string per content section.

## Desired End State

Below Education, a "Hobbies" section shows "Volleyball, video games, cars, bootstrapped SaaS business" on one wrapping line, readable at 360px. If the section vanishes in a later change, the deploy fails.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Placement | Last, after Education | Matches the CV order and keeps proof content first | Plan |
| Format | One line, items joined by ", " | Smallest section, no new markup pattern | Plan |
| Wording | CV text, "saas" becomes "SaaS" | Lowercase reads like a typo on a craft-focused page | Plan |
| CI check | `bootstrapped SaaS business`, own phase | Same guard as every other section, no `&` to escape | Plan |

## Scope

**In scope:** hobbies data, one section, one CI string.

**Out of scope:** new or reworded hobbies, chips, icons, a bulleted list, a test runner.

## Architecture / Approach

Extend `lib/profile.ts` with a `hobbies` array. `app/page.tsx` renders one section after Education, copying the Summary markup. The smoke test in `deploy.yml` gets one more string.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Hobbies on the page | Section rendered from profile data | Almost none, it is a single paragraph |
| 2. CI check | Deploy fails if the section is missing | Using a string with `&` that the HTML escapes |

**Prerequisites:** S-01 to S-04, all done.
**Estimated effort:** about one short session across two phases.

## Open Risks & Assumptions

- The PDF is the source of truth. If the CV hobbies change, the profile data needs the same edit.
- The PRD notes that hobbies could dilute a proof-focused page. It was kept as written, and the placement at the bottom limits the effect.

## Success Criteria (Summary)

- A recruiter sees the hobbies line at the bottom of the live page, on a phone and on a desktop.
- A deploy that drops the section fails its smoke test.
