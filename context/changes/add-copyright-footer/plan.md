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
- Per-request year: `connection()` from `next/server` marks rendering as request-time and is the documented companion for `new Date()` (external, verified with user), source: `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/connection.md`.
- The smoke test greps the live HTML for fixed strings (`.github/workflows/deploy.yml:34`). A footer string belongs in that list.
- Name comes from `profile.name` in `lib/profile.ts`. Colors come from the `text-muted` token in `app/globals.css`.

## What We're NOT Doing

- No `LICENSE` file, README line or `package.json` license field. Repo-level rights are a follow-up change (decided with user).
- No notice inside the CV PDF.
- No privacy, cookie or licence-terms text.
- No contact or social links in the footer.
- No tests. The repo has no test setup.

## Implementation Approach

A small server component renders the line. It awaits `connection()` before reading the year, so the year is computed per request. It lives in its own file and is mounted once in the root layout, after `{children}`. The route becomes server-rendered instead of static, which is fine for a single small `noindex` page.

## Critical Implementation Details

- **Timing & lifecycle**: `await connection()` must run before `new Date()`, or the year is baked in at build. Without `cacheComponents` a `<Suspense>` wrapper is not required. Add one only if `yarn build` reports a `blocking-prerender` error.
- **User experience spec**: the footer must not shift the page. Keep one line of text with bottom padding so the page end does not look cramped. `main` already has `pb-24`, so the footer needs only light padding.
- **Debug & observability**: no new external call or failure mode. Existing coverage is the deploy smoke test, extended in this plan.

## Phase 1: Footer, layout mount, smoke test

### Overview

Render the footer on every page and guard it after deploy.

### Changes Required:

#### 1. Footer component

**File**: `app/footer.tsx` (new)

**Intent**: Server component that renders the rights line with the current year, using the name from `profile`.

**Contract**: default export `Footer`, an async function returning `<footer>`. Text is `© {year} {profile.name}. All rights reserved.` Container matches the page column (`mx-auto w-full max-w-[640px] px-6`) with `mt-auto`, `pb-10`, `text-sm text-muted`. Calls `await connection()` (from `next/server`) before `new Date().getFullYear()`.

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
- Build output shows the home route as dynamic, not static: `yarn build` route table
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
3. Run `yarn preview` to confirm per-request rendering works on the Workers runtime.

## Performance Considerations

The home route moves from prerendered to rendered per request on Workers. The page is small and `noindex`, so the cost is negligible. Check the build route table to confirm the change.

## References

- Frame brief: `context/changes/add-copyright-footer/frame.md`
- Layout: `app/layout.tsx`
- Smoke test: `.github/workflows/deploy.yml`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Footer, layout mount, smoke test

#### Automated

- [x] 1.1 Linting passes: `yarn lint`
- [x] 1.2 Build succeeds: `yarn build`
- [x] 1.3 Build output shows the home route as dynamic
- [x] 1.4 Footer present in served HTML via curl

#### Manual

- [x] 1.5 Footer sits at the bottom on short and long pages
- [x] 1.6 Style and column width match the page on mobile and desktop
- [x] 1.7 Year follows the current date without a rebuild
- [ ] 1.8 Deploy smoke test passes after push to `main`
