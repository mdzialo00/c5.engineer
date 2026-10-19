# Copyright footer: Plan Brief

> Full plan: `context/changes/add-copyright-footer/plan.md`
> Frame brief: `context/changes/add-copyright-footer/frame.md`

## What & Why

Add a footer reading "© year Maciek Działo. All rights reserved." to the page. The problem to plan around, from the frame: the page lacks a visible ownership notice, and the "all rights reserved" intent for the source code has no home because a page footer cannot express it. This change covers the first half. The code half is a follow-up.

## Starting Point

`app/layout.tsx` renders only `{children}`, and the page ends at Hobbies. The repo is public with no `LICENSE`.

## Desired End State

Every page load ends with the rights line in the page's muted style. The year follows the date with no redeploy, and the deploy smoke test fails if the footer disappears.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Code rights | Footer now, repo statement later | Keeps this change to one visible feature | Plan |
| Year | Client component, build year as server snapshot | No redeploy after 1 January, route stays static. Per-request rendering and PPR were tried and dropped | Plan |
| Smoke test | Add "All rights reserved" | Every other page element is already guarded | Plan |
| Scope of notice | Page content only | Footer cannot cover code or the PDF | Frame |

## Scope

**In scope:** footer component, layout mount, smoke-test string.

**Out of scope:** `LICENSE` or README text, notice inside the CV PDF, privacy or cookie text, footer links.

## Architecture / Approach

A server component renders the line and hands the build-time year to a small client component, which shows the browser's current year after hydration. It is mounted once in the root layout. The route stays static.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Footer, mount, smoke test | Visible footer with live year, guarded after deploy | Year is the build year in static HTML and for no-JS visitors |

**Prerequisites:** none.
**Estimated effort:** one short session.

## Open Risks & Assumptions

- No-JS visitors and crawlers see the build year. Acceptable because the site is `noindex`.
- Partial prerendering hung on the Workers runtime locally and `opennextjs-cloudflare` has open issues on it, so it was dropped.
- The code stays without an explicit rights statement until the follow-up change.
- Frame confidence was MEDIUM.

## Success Criteria (Summary)

- Footer visible at the bottom with the current year.
- Year changes with no deploy.
- Deploy smoke test passes on `main`.
