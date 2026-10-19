# Hobbies Implementation Plan

## Overview

Add the hobbies line to the live page as a last section below Education, using the text from the CV PDF. The data goes into `lib/profile.ts`, the page renders one new section, and a CI check then guards it.

## Current State Analysis

S-01 to S-04 are done. `app/page.tsx` renders the header, three buttons, then "Summary", "Work experience", "Skills" and "Education" sections in one `<main>` with a 640px max width. Each section is `<section className="mt-12">` with an `h2` styled `text-sm font-medium text-muted`. `lib/profile.ts` holds all page text as one `as const` object. The smoke test in `.github/workflows/deploy.yml:44` greps the HTML for a list of strings, the last two being `Tanstack Query` and `ZSTIL High School`.

The CV PDF (`public/Maciek-Dzialo-CV-English.pdf`) ends with a Hobbies section: "Volleyball, video games, cars, bootstrapped saas business".

## Desired End State

Below Education, the page shows a "Hobbies" section with one line: "Volleyball, video games, cars, bootstrapped SaaS business". At 360px there is no horizontal scroll. The deploy smoke test fails if the section's content is missing from the HTML.

### Key Discoveries:

- All page strings come from `lib/profile.ts`, imported as `@c5-engineer/lib/profile`. Extend that module, do not hardcode text in markup.
- The tsconfig alias is `@c5-engineer/*`, not `@/*`.
- The Summary section in `app/page.tsx:72` is the closest pattern: an `h2` and a single `text-base` paragraph.
- The smoke test uses `grep -qF`, a fixed string match. The HTML escapes `&`, so the new check string must not contain one.
- PRD FR-006 is nice-to-have, with a noted bias and dilution risk that resolved to "kept as written".

## What We're NOT Doing

- Rewriting or adding hobbies. The wording is the CV's, with only "saas" capitalized as "SaaS".
- Chips, icons or a bulleted list. One line of text.
- Reordering existing sections.
- Client JavaScript, a CMS, or a test runner.

## Implementation Approach

Two phases. Phase 1 changes data and markup and is checkable locally. Phase 2 changes only CI. The section is server-rendered HTML in the existing column.

## Critical Implementation Details

- **Debug & observability**: No new instrumentation. The Phase 2 grep covers the failure that matters, which is the section disappearing in a later change.

## Phase 1: Hobbies on the page

### Overview

Put the hobbies text into `lib/profile.ts` and render it below Education.

### Changes Required:

#### 1. Profile data

**File**: `lib/profile.ts`

**Intent**: Hold hobbies as typed data so the markup has no hardcoded strings.

**Contract**: Add `hobbies`, an array of strings: "Volleyball", "video games", "cars", "bootstrapped SaaS business". Place it after `education`, keep `as const`.

#### 2. Page section

**File**: `app/page.tsx`

**Intent**: Render Hobbies as the last section, after Education.

**Contract**: One `<section className="mt-12">` with an `h2` "Hobbies" using the existing heading classes, followed by a `<p className="text-[15px] leading-[1.6]">` with the items joined by ", ". Use `mb-3` on the heading as Summary does, since the content is a single paragraph. Use only existing tokens.

### Success Criteria:

#### Automated Verification:

- Lint passes: `yarn lint`
- Build passes: `yarn build`
- Local HTML contains the section: run `yarn dev`, then `curl -s localhost:3000 | grep -F 'bootstrapped SaaS business'`

#### Manual Verification:

- At 360px width in devtools, no horizontal scroll and the line wraps inside the column
- Hobbies is the last section and matches the PDF wording, with "SaaS" capitalized
- Header, buttons, summary, experience, skills and education are unchanged
- Heading order is h1, then h2 sections, and focus order is unchanged

**Implementation Note**: After this phase passes, pause for manual confirmation before Phase 2.

---

## Phase 2: CI check

### Overview

Make the deploy fail when the hobbies section disappears.

### Changes Required:

#### 1. Smoke test

**File**: `.github/workflows/deploy.yml`

**Intent**: Add one string from the new section to the list the smoke test must find in the HTML.

**Contract**: Append `bootstrapped SaaS business` to the `for expected in` list at line 44. The string has no `&`. Keep the retry loop, the quoting style and the PDF checks unchanged.

### Success Criteria:

#### Automated Verification:

- Deploy run goes green on `main` with the new string

#### Manual Verification:

- Live URL shows the Hobbies section
- Optional: set the string to a bogus value on a branch to confirm the step fails with a clear message, then revert

---

## Testing Strategy

### Unit Tests:

- None. No test runner exists and the roadmap parks one.

### Integration Tests:

- The Phase 2 CI grep against the deployed HTML.

### Manual Testing Steps:

1. Open the live URL on a phone and scroll to the bottom.
2. Compare the hobbies line to the PDF.
3. Check 360px and a desktop width for wrapping.

## Performance Considerations

Static server-rendered text, no new dependencies and no client JavaScript. The 2 second NFR is unaffected.

## Migration Notes

None. After archiving, the roadmap's Parked entry for FR-006 should move to Done.

## References

- Roadmap: `context/foundation/roadmap.md` (Parked, FR-006)
- PRD: FR-006
- Content source: `public/Maciek-Dzialo-CV-English.pdf`
- Similar implementation: `context/archive/2026-10-19-skills-and-education/plan.md`
- Deploy flow: `context/foundation/architecture/deploy.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Hobbies on the page

#### Automated

- [x] 1.1 Lint passes: `yarn lint` — 0efc3e5
- [x] 1.2 Build passes: `yarn build` — 0efc3e5
- [x] 1.3 Local HTML contains the section — 0efc3e5

#### Manual

- [x] 1.4 360px width has no horizontal scroll and the line wraps inside the column — 0efc3e5
- [x] 1.5 Hobbies is last and matches the PDF wording, with "SaaS" capitalized — 0efc3e5
- [x] 1.6 Existing sections are unchanged — 0efc3e5
- [x] 1.7 Heading order and focus order are correct — 0efc3e5

### Phase 2: CI check

#### Automated

- [x] 2.1 Deploy run goes green on `main` with the new string — ae08732

#### Manual

- [x] 2.2 Live URL shows the Hobbies section — ae08732
