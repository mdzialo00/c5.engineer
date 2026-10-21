# Add PostHog analytics with click tracking: Plan Brief

> Full plan: `context/changes/add-posthog-analytics/plan.md`

## What & Why

Add PostHog to the site and record a named event when someone clicks GitHub, LinkedIn or Download CV. You get to see which of the three links visitors use, from which country and referrer.

## Starting Point

The page is a static server component with three plain anchors and no client JS, no analytics and no cookie banner. It deploys to Cloudflare Workers via OpenNext, and CI smoke-tests the HTML for the exact link strings.

## Desired End State

Loading the site sends a pageview and each button click sends its own event to PostHog EU, with no cookie or storage written. All of it shows in Live events, and the smoke test still passes.

## Key Decisions Made

| Decision | Choice | Why |
| --- | --- | --- |
| Consent | Cookieless (`cookieless_mode: 'always'`), no banner | Keeps the page as clean as it is now |
| Identity | Anonymous visitors, one named event per button | No `?ref`, no `identify`, no personal data |
| Proxy | Direct to PostHog | Simpler config, accepts some ad-blocker loss |
| Region | EU Cloud | Poland-based site, fits PostHog's GDPR guidance |
| Init | `instrumentation-client.ts` | Next 16's documented place for analytics |
| Click capture | `TrackedLink` client component with `sendBeacon` | Keeps `page.tsx` a server component, survives navigation |

## Scope

**In scope:** PostHog init, three tracked buttons, env wiring in local and CI.

**Out of scope:** cookie banner, identify, proxy, email and phone tracking, autocapture, replay.

## Architecture / Approach

`instrumentation-client.ts` initializes PostHog once if the token exists. `TrackedLink` renders the usual anchor and calls `posthog.capture(event, { href })` on click. `page.tsx` swaps three anchors for it.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Install and init | SDK, cookieless init, token in env and CI | Cookieless setting forgotten in PostHog, events ignored |
| 2. Track the buttons | `TrackedLink` and three named events | Same-tab navigation cancelling the request |
| 3. Verify in production | Live events from the deployed site | GitHub variable missing, build ships without tracking |

**Prerequisites:** an EU PostHog project with its token, and permission to add a GitHub repository variable.
**Estimated effort:** about 1-2 short sessions across 3 phases.

## Open Risks & Assumptions

- `transport: "sendBeacon"` is assumed to be enough for same-tab links. The fallback is `target="_blank"` on GitHub and LinkedIn.
- Ad blockers will hide some events because there is no proxy.

## Success Criteria (Summary)

- A click on each button appears in PostHog Live events with its name and destination.
- No cookie or storage key is written on the site.
- The deploy and smoke test pass.
