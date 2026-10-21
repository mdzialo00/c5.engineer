# Add PostHog analytics with click tracking Implementation Plan

## Overview

Add PostHog (EU Cloud, cookieless) to the site and fire one named event each time a visitor clicks GitHub, LinkedIn or Download CV. "Who" means PostHog's anonymous visitor data (country, referrer, device), not a named person.

## Current State Analysis

`app/page.tsx` is a static server component. The three buttons are plain `<a>` tags sharing `linkClass` (`app/page.tsx:30`, `:41`, `:52`). There is no client JS, no analytics, no cookie banner and no `.env` file. The site is `noindex` (`app/layout.tsx:9`) and deploys to Cloudflare Workers through OpenNext. CI builds with `yarn opennextjs-cloudflare build` (`.github/workflows/deploy.yml:29`) and smoke-tests the HTML for the exact link strings (`:44`).

## Desired End State

Opening the deployed site sends a pageview to PostHog EU with no cookie or storage written. Clicking GitHub, LinkedIn or Download CV sends `github_link_clicked`, `linkedin_link_clicked` or `cv_download_clicked`, each with the destination `href`. All three show in PostHog Live events. The rendered HTML still contains every string the smoke test greps for.

### Key Discoveries:

- Next 16.3 supports `instrumentation-client.ts` at the app root for analytics init, run before the app becomes interactive (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation-client.md`).
- `cookieless_mode: 'always'` sets no cookies and uses no local or session storage, so no banner is needed. It must also be enabled in the PostHog project settings or events are ignored (external, verified with user), source: https://posthog.com/docs/libraries/js/config
- `NEXT_PUBLIC_*` vars are inlined at build time, so CI needs them during the build step. Cloudflare runtime config is not involved because the code is client-only.
- Imports use the `@c5-engineer/` alias (`app/page.tsx:1`). Lint is `biome check`, run in CI and on pre-push.

## What We're NOT Doing

- No cookie banner and no consent state.
- No `posthog.identify`, no `?ref` tagging, no named visitors.
- No reverse proxy. Ad blockers will hide some events, accepted.
- No tracking on the email and phone links, and no autocapture of other elements.
- No session replay, heatmaps or web vitals.
- No `PostHogProvider` or React context. Plain `posthog.capture` is enough.

## Implementation Approach

Initialize once in `instrumentation-client.ts`. Add a tiny client component, `TrackedLink`, that renders the same `<a>` and calls `posthog.capture` in `onClick`. Swap the three anchors in `page.tsx` to it. The server component stays a server component, and only the three links ship client JS beyond PostHog itself.

## Critical Implementation Details

- **Timing & lifecycle**: GitHub and LinkedIn navigate away in the same tab, which can cancel an in-flight request. Capture with `{ transport: "sendBeacon" }` so the event survives navigation. Phase 2 confirms all three events land; if GitHub or LinkedIn events go missing, add `target="_blank" rel="noopener noreferrer"` to those two links.
- **Debug & observability**: PostHog's Live events view is the check that tracking works. Init is skipped when the token is unset, so local dev and forks without the token run silently. `onClick` must never throw, so a tracking failure cannot break a link.

## Phase 1: Install and initialize PostHog

### Overview

Add the SDK, init it cookieless against EU Cloud, and wire the token into local env and the CI build.

### Changes Required:

#### 1. SDK dependency

**File**: `package.json`, `yarn.lock`

**Intent**: Add `posthog-js` via `yarn add posthog-js`.

**Contract**: `dependencies.posthog-js` present, lockfile updated, `yarn install --immutable` passes.

#### 2. Client init

**File**: `instrumentation-client.ts` (new, repo root)

**Intent**: Initialize PostHog once in the browser when a token is configured.

**Contract**: Reads `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`; returns early if unset. Calls `posthog.init(token, { api_host: "https://eu.i.posthog.com", ui_host: "https://eu.posthog.com", cookieless_mode: "always", defaults: "2026-05-30" })`. Pageview capture stays at the default.

#### 3. Env wiring

**File**: `.env.local` (untracked, gitignored by `.env*`), `.github/workflows/deploy.yml`

**Intent**: Give local dev and the CI build the public project token.

**Contract**: `.env.local` holds `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=<token>`. The deploy workflow's build step gets `env: NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: ${{ vars.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN }}`, backed by a GitHub repository variable. The token is public by design, so a variable is enough and no secret is needed.

#### 4. PostHog project setting (manual)

**Intent**: In the EU PostHog project, enable cookieless mode in project settings. Without it, events are ignored.

### Success Criteria:

#### Automated Verification:

- Lint passes: `yarn lint`
- Type check passes: `yarn tsc --noEmit`
- Build passes: `yarn build`

#### Manual Verification:

- Cookieless mode is enabled in PostHog project settings
- `yarn dev`, load the page: a pageview shows in PostHog Live events
- DevTools Application tab shows no PostHog cookie and no PostHog localStorage key

**Implementation Note**: Pause here for manual confirmation before Phase 2.

---

## Phase 2: Track the three buttons

### Overview

Replace the three anchors with a tracked link that fires a named event.

### Changes Required:

#### 1. Tracked link component

**File**: `app/tracked-link.tsx` (new)

**Intent**: Client component that renders an `<a>` and captures a PostHog event on click without changing look or behavior.

**Contract**: `"use client"`. Props: `event: string` plus all standard anchor props. `onClick` calls `posthog.capture(event, { href }, { transport: "sendBeacon" })` inside try/catch, then calls any `onClick` passed in. Renders `<a {...rest}>` unchanged otherwise.

#### 2. Use it on the buttons

**File**: `app/page.tsx`

**Intent**: Swap the GitHub, LinkedIn and Download CV anchors for `TrackedLink`, keeping `href`, `download`, `className` and the SVG children as they are.

**Contract**: Events `github_link_clicked`, `linkedin_link_clicked`, `cv_download_clicked`. The mailto and tel links stay plain anchors. Rendered HTML keeps `href="https://github.com/mdzialo00"`, `href="https://www.linkedin.com/in/mdzialo/"` and `href="/Maciek-Dzialo-CV-English.pdf"`.

### Success Criteria:

#### Automated Verification:

- Lint passes: `yarn lint`
- Type check passes: `yarn tsc --noEmit`
- Build passes: `yarn build`
- Built HTML still contains every string in the smoke test list (`.github/workflows/deploy.yml:44`)

#### Manual Verification:

- Buttons look and behave exactly as before, including the CV download name
- Each click shows its event in PostHog Live events with the right `href`
- GitHub and LinkedIn events arrive even though the tab navigates away

**Implementation Note**: Pause here for manual confirmation before Phase 3.

---

## Phase 3: Verify in production

### Overview

Deploy and confirm events from the live site.

### Changes Required:

#### 1. Repository variable

**Intent**: Create the `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` repository variable in GitHub before pushing to `main`, or the deployed build ships with tracking off.

### Success Criteria:

#### Automated Verification:

- Deploy workflow passes, including the smoke test

#### Manual Verification:

- Pageview and all three click events show in PostHog Live events from the deployed URL
- No PostHog cookie or storage key on the live site

---

## Testing Strategy

The repo has no test runner, so verification is the build, the existing smoke test and PostHog Live events. No unit tests are added.

### Manual Testing Steps:

1. Load the site, check Live events for a pageview.
2. Click each of the three buttons, check for the three named events.
3. Check DevTools Application tab for cookies and storage.
4. Repeat on the deployed URL.

## Performance Considerations

`posthog-js` adds client JS to a page that shipped none. Acceptable for this page. Skipping autocapture and replay keeps it small.

## References

- Change identity: `context/changes/add-posthog-analytics/change.md`
- Link markup: `app/page.tsx:30-70`
- Smoke test strings: `.github/workflows/deploy.yml:44`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Install and initialize PostHog

#### Automated

- [x] 1.1 Lint passes: `yarn lint`
- [x] 1.2 Type check passes: `yarn tsc --noEmit`
- [x] 1.3 Build passes: `yarn build`

#### Manual

- [x] 1.4 Cookieless mode is enabled in PostHog project settings

### Phase 2: Track the three buttons

#### Automated

- [ ] 2.1 Lint passes: `yarn lint`
- [ ] 2.2 Type check passes: `yarn tsc --noEmit`
- [ ] 2.3 Build passes: `yarn build`
- [ ] 2.4 Built HTML still contains every string in the smoke test list

#### Manual

- [ ] 2.5 Buttons look and behave exactly as before, including the CV download name
- [ ] 2.6 Each click shows its event in PostHog Live events with the right `href`
- [ ] 2.7 GitHub and LinkedIn events arrive even though the tab navigates away

### Phase 3: Verify in production

#### Automated

- [ ] 3.1 Deploy workflow passes, including the smoke test

#### Manual

- [ ] 3.2 Pageview and all three click events show in PostHog Live events from the deployed URL
- [ ] 3.3 No PostHog cookie or storage key on the live site
- [ ] 3.4 Load the deployed page: a pageview shows in PostHog Live events (moved from 1.5, no local env file)
- [ ] 3.5 DevTools Application tab shows no PostHog cookie and no PostHog localStorage key (moved from 1.6)
