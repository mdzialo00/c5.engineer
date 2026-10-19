# Summary and experience Implementation Plan

## Overview

Add the professional summary and the work experience to the live page, using the text from the CV PDF. The data goes into `lib/profile.ts` and the page renders two new sections under the header. A CI check then guards both employer names.

## Current State Analysis

S-01 and S-02 are done. `app/page.tsx` renders the header (name, title, contact line) and three buttons (GitHub, LinkedIn, Download CV) in one `<main>` with a 640px max width. `lib/profile.ts` holds identity, links and CV file fields. The CI smoke test in `.github/workflows/deploy.yml` greps the HTML for the noindex tag, both profile links and the CV href, then checks the PDF headers.

The content to publish already exists in `public/Maciek-Dzialo-CV-English.pdf`. It has one summary paragraph, Tesco Technology (12.2023 to present, 7 bullets) and Forte Digital (07.2021 to 12.2023, 6 bullets).

## Desired End State

Below the buttons, the page shows a "Summary" section with the paragraph, then a "Work experience" section with two stacked entries. Each entry has the role and company, the dates, and every bullet from the CV. At 360px there is no horizontal scroll. The deploy smoke test fails if either employer name is missing from the HTML.

### Key Discoveries:

- All page strings come from `lib/profile.ts`, imported as `@c5-engineer/lib/profile`. Extend that module, do not hardcode text in markup.
- The tsconfig alias is `@c5-engineer/*`, not `@/*`.
- Design tokens exist in `app/globals.css` (`background`, `surface`, `foreground`, `muted`, `border`, `border-strong`). Reuse them, add no new colors.
- The smoke test builds its expected strings in one `for expected in ...` loop (`.github/workflows/deploy.yml`), so new checks are two more strings in that list.
- Experience is the longest block, so the roadmap flags mobile layout as the main risk (S-03 Risk).

## What We're NOT Doing

- Skills, education and hobbies. Those are S-04 and the parked FR-006.
- Trimming or rewriting the bullets. The user chose all bullets, verbatim from the CV.
- A timeline graphic, collapsible roles or any client JavaScript.
- A CMS or a content file format such as MDX. Content stays hardcoded (PRD non-goal).
- A test runner. The roadmap parks Vitest and Playwright.

## Implementation Approach

Two phases. Phase 1 changes data and markup and is checkable locally. Phase 2 changes only CI. Sections are plain server-rendered HTML in the existing single column, with semantic headings and lists so the page stays accessible and fast.

## Critical Implementation Details

- **User experience spec**: Dates must not push the role line off a 360px screen. Put the dates on their own line under the role at narrow widths, and beside it from the `sm` breakpoint up.
- **Debug & observability**: No runtime logging for a static page. The Phase 2 grep is the observability for the failure that matters, which is a section disappearing in a later slice.

## Phase 1: Summary and experience on the page

### Overview

Put the CV text into `lib/profile.ts` and render it.

### Changes Required:

#### 1. Profile data

**File**: `lib/profile.ts`

**Intent**: Hold the summary and experience as typed data so markup has no hardcoded strings.

**Contract**: Add `summary` (string, the CV paragraph) and `experience` (array). Each item has `role`, `company`, `period` (for example "12.2023 - Present") and `highlights` (array of strings, all bullets in CV order). Keep `as const`. Copy the text from the PDF verbatim, fixing only the line-break hyphenation the PDF extraction introduced (for example "micro-frontends", "20-30 projects", "English-speaking").

#### 2. Page sections

**File**: `app/page.tsx`

**Intent**: Render the summary and the experience entries under the button row.

**Contract**: Two `<section>` elements with `h2` headings "Summary" and "Work experience", following the existing type scale and muted tone. Each role is an `<article>` or list item with the role and company on one line, the period under it on narrow screens and beside it from `sm` up, then a `<ul>` of highlights. Use `map` over `profile.experience` with the company as key. Keep the 640px column and 24px side padding, and use only existing tokens.

### Success Criteria:

#### Automated Verification:

- Lint passes: `yarn lint`
- Build passes: `yarn build`
- Local HTML contains the summary and both employers: run `yarn dev`, then `curl -s localhost:3000 | grep -E 'Tesco Technology|Forte Digital'`

#### Manual Verification:

- At 360px width in devtools, no horizontal scroll and all text is visible
- All 7 Tesco bullets and all 6 Forte bullets appear, matching the PDF wording
- Header, buttons and the three links from S-01 and S-02 still work
- Heading order is h1, then h2 sections, and focus order is unchanged

**Implementation Note**: After this phase passes, pause for manual confirmation before Phase 2.

---

## Phase 2: CI check

### Overview

Make the deploy fail when an experience entry disappears.

### Changes Required:

#### 1. Smoke test

**File**: `.github/workflows/deploy.yml`

**Intent**: Add the two employer names to the strings the smoke test must find in the HTML.

**Contract**: Append `Tesco Technology` and `Forte Digital` to the `for expected in` list. Keep the retry loop, the quoting style and the existing PDF checks unchanged. A miss already reports the missing string through the existing message.

### Success Criteria:

#### Automated Verification:

- Deploy run goes green on `main` with the new strings

#### Manual Verification:

- Live URL shows the summary and both roles
- Optional: set one string to a bogus value on a branch to confirm the step fails with a clear message, then revert

---

## Testing Strategy

### Unit Tests:

- None. No test runner exists and the roadmap parks one.

### Integration Tests:

- The Phase 2 CI grep against the deployed HTML.

### Manual Testing Steps:

1. Open the live URL on a phone and scroll the whole page.
2. Compare each bullet to the PDF.
3. Check 360px and a desktop width for wrapping of the role and date line.

## Performance Considerations

Static server-rendered text, no new dependencies and no client JavaScript. The 2 second NFR is unaffected.

## Migration Notes

None.

## References

- Roadmap: `context/foundation/roadmap.md` (S-03)
- PRD: FR-002, FR-003
- Content source: `public/Maciek-Dzialo-CV-English.pdf`
- Similar implementation: `context/archive/2026-10-14-cv-pdf-download/plan.md`
- Deploy flow: `context/foundation/architecture/deploy.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Summary and experience on the page

#### Automated

- [x] 1.1 Lint passes: `yarn lint` — 5ea545f
- [x] 1.2 Build passes: `yarn build` — 5ea545f
- [x] 1.3 Local HTML contains the summary and both employers — 5ea545f

#### Manual

- [x] 1.4 360px width has no horizontal scroll and all text is visible — 5ea545f
- [x] 1.5 All 7 Tesco and 6 Forte bullets appear and match the PDF — 5ea545f
- [x] 1.6 Header, buttons and links still work — 5ea545f
- [x] 1.7 Heading order and focus order are correct — 5ea545f

### Phase 2: CI check

#### Automated

- [ ] 2.1 Deploy run goes green on `main` with the new strings

#### Manual

- [ ] 2.2 Live URL shows the summary and both roles
