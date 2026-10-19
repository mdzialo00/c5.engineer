# Copyright footer Implementation Plan

## Overview

Add a footer to the page with a copyright line and "All rights reserved", where the year follows the current date without a redeploy. Guard the footer in the deploy smoke test.

## Current State Analysis

`app/layout.tsx` renders `{children}` inside `<body class="min-h-full flex flex-col font-sans">` and nothing else. `app/page.tsx` ends at the Hobbies section. No footer, `©` or copyright string exists in `app/` or `lib/`. The repo is public with no `LICENSE`.

## Desired End State

Every page load shows `© <current year> Maciek Działo. All rights reserved.` at the bottom of the page, in the same 640px column and muted text style as the rest. Rolling over to a new year changes the text with no deploy. The deploy smoke test fails if the footer is missing.

### Key Discoveries:

- `<body>` is already `flex flex-col` with `min-h-full`, so a footer with `mt-auto` sits at the viewport bottom on short pages (`app/layout.tsx:15`).
- `next.config.ts` has no `cacheComponents`, so `new Date()` in a server component is evaluated at build time and frozen until the next deploy.
- Per-request year via `connection()` was built first and worked, but made the whole route dynamic (`ƒ`). Partial prerendering (`cacheComponents: true`) kept the shell static but hung on the Workers runtime locally (500, "Worker's code had hung"), and `opennextjs-cloudflare` has about 15 mostly open issues on `cacheComponents` and PPR (#1450, #1318, #1369). Both were dropped (decided with user).
- Chosen: a client component reads the year in the browser with `useSyncExternalStore`, with the build-time year as the server snapshot. The route stays static and the year updates after hydration with no redeploy.
- The smoke test greps the live HTML for fixed strings (`.github/workflows/deploy.yml:34`). A footer string belongs in that list.
- Name comes from `profile.name` in `lib/profile.ts`. Colors come from the `text-muted` token in `app/globals.css`.

## What We're NOT Doing

- No `LICENSE` file, README line or `package.json` license field. Repo-level rights are a follow-up change (decided with user).
- No notice inside the CV PDF.
- No privacy, cookie or licence-terms text.
- No contact or social links in the footer.
- No tests. The repo has no test setup.

## Implementation Approach

A server component renders the line and passes the build-time year to a small client component, `FooterYear`. The client component reads the current year with `useSyncExternalStore`, so the browser corrects the text after hydration with no redeploy and no hydration warning. The footer is mounted once in the root layout, after `{children}`, and the route stays static.

## Critical Implementation Details

- **Timing & lifecycle**: the server snapshot of `useSyncExternalStore` must return the build-time year passed as a prop, or React reports a hydration mismatch after 1 January. The static HTML and no-JS visitors show the build year.
- **User experience spec**: the footer must not shift the page. Keep one line of text with bottom padding so the page end does not look cramped. `main` already has `pb-24`, so the footer needs only light padding.
- **Debug & observability**: no new external call or failure mode. Existing coverage is the deploy smoke test, extended in this plan.

## Phase 1: Footer, layout mount, smoke test

### Overview

Render the footer on every page and guard it after deploy.

### Changes Required:

#### 1. Footer component

**File**: `app/footer.tsx` (new), `app/footer-year.tsx` (new)

**Intent**: A server component renders the rights line using the name from `profile`. A client component renders the year.

**Contract**: `Footer` is a sync default export returning `<footer>` with text `© <FooterYear buildYear={new Date().getFullYear()} /> {profile.name}. All rights reserved.` Container matches the page column (`mx-auto w-full max-w-[640px] px-6`) with `mt-auto`, `pb-10`, `text-center`, `text-sm text-muted`. `FooterYear` (`"use client"`) takes `buildYear: number` and returns the year from `useSyncExternalStore(() => () => {}, () => new Date().getFullYear(), () => buildYear)`.

#### 2. Mount in layout

**File**: `app/layout.tsx`

**Intent**: Render the footer once for every route, after `{children}`.

**Contract**: import `Footer` and place `<Footer />` as the last child of `<body>`.

#### 3. Smoke test

**File**: `.github/workflows/deploy.yml`

**Intent**: Fail the deploy check when the footer is missing.

**Contract**: add `All rights reserved` to the `expected` list in the page-check loop. Match the stable part only, since the year changes.

### Success Criteria:

#### Automated Verification:

- Linting passes: `yarn lint`
- Build succeeds: `yarn build`
- Build output still shows the home route as static (`○`): `yarn build` route table
- Footer present in served HTML: `curl -s http://localhost:3000 | grep -F "All rights reserved"` against `yarn start`

#### Manual Verification:

- Footer sits at the bottom of the page on a short viewport and below the Hobbies section on a long page
- Text style and column width match the rest of the page on mobile and desktop
- Year equals the current year; temporarily forcing a different system date changes the output without a rebuild
- After push to `main`, the deploy smoke test passes

**Implementation Note**: After automated verification passes, pause for manual confirmation before pushing.

---

## Testing Strategy

### Unit Tests:

- None. No test runner is configured.

### Integration Tests:

- The deploy smoke test covers the live page.

### Manual Testing Steps:

1. Run `yarn dev` and check the footer on a short and a long viewport.
2. Run `yarn build && yarn start` and curl the page for the footer string.
3. Run `yarn preview` to confirm the page renders on the Workers runtime.

## Performance Considerations

None. The route stays static, and the client component adds a few lines of JavaScript.

## References

- Frame brief: `context/changes/add-copyright-footer/frame.md`
- Layout: `app/layout.tsx`
- Smoke test: `.github/workflows/deploy.yml`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Footer, layout mount, smoke test

#### Automated

- [x] 1.1 Linting passes: `yarn lint` — cbb46e2
- [x] 1.2 Build succeeds: `yarn build` — cbb46e2
- [x] 1.3 Build output still shows the home route as static — cbb46e2
- [x] 1.4 Footer present in served HTML via curl — cbb46e2

#### Manual

- [x] 1.5 Footer sits at the bottom on short and long pages — cbb46e2
- [x] 1.6 Style and column width match the page on mobile and desktop — cbb46e2
- [x] 1.7 Year follows the current date without a rebuild — cbb46e2
- [ ] 1.8 Deploy smoke test passes after push to `main`
