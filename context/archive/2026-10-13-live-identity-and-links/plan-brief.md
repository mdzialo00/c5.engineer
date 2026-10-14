# Live identity and links: Plan Brief

> Full plan: `context/changes/live-identity-and-links/plan.md`

## What & Why

Recruiters get a single public link that shows the candidate's name, title, contact info and working GitHub and LinkedIn links. This is S-01, the north star slice, so it goes live before any other content. The site becomes public here, so no-index ships in the same change.

## Starting Point

F-01 is done and every merge to `main` deploys to Cloudflare Workers. The page itself is still the create-next-app template.

## Desired End State

Opening the live URL shows the Quiet-style header with real links, readable on a phone. Search engines are told not to index it, and CI fails if that tag or either link disappears.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Visual style | Quiet | No web fonts, easiest to extend in S-03 and S-04 | Plan |
| Links and contact | Real URLs given, prototype email and phone published | FR-001 needs contact info, links must work to meet US-01 | Plan |
| No-index | `metadata.robots` plus `app/robots.ts` | Meta tag removes results, robots.txt adds a crawl block | Plan |
| Page scope | Identity and links only | Keeps S-02 to S-04 in their own changes | Plan |
| Verification | CI grep on deployed HTML | Cheap guard for the rule that is costly to break | Plan |
| Dark mode | Not shipped | Quiet is light only | Plan |

## Scope

**In scope:** Quiet header, profile data module, real title and description, no-index, robots.txt, CI assertion, template asset cleanup.

**Out of scope:** CV button, summary, experience, skills, education, hobbies, dark mode, web fonts, test framework.

## Architecture / Approach

One server-rendered page reads a typed `profile` constant. The layout sets metadata including `robots`, and `app/robots.ts` serves robots.txt. The deploy workflow's smoke test fetches the live HTML and greps it.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Page and no-index | Quiet header, links, noindex, robots.txt | Mobile layout at 360px |
| 2. CI assertion | Deploy fails on missing noindex or links | Breaking the first-deploy 404 retry |

**Prerequisites:** F-01 (done).
**Estimated effort:** about one evening across 2 phases.

## Open Risks & Assumptions

- Email and phone are published on a public page, so scraping and spam are possible (accepted in FR-001).
- Assumes the prototype's email and phone are the ones to publish, since no correction was given.

## Success Criteria (Summary)

- The live URL shows identity and contact info, and both profile links work.
- The page works on a phone without sideways scrolling.
- View-source shows noindex and `/robots.txt` disallows all.
