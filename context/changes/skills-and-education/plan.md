# Skills and education Implementation Plan

## Overview

Add the skills list and the education entries to the live page, using the text from the CV PDF. The data goes into `lib/profile.ts` and the page renders two new sections below Work experience. A CI check then guards both sections.

## Current State Analysis

S-01 to S-03 are done. `app/page.tsx` renders the header, three buttons, a "Summary" section and a "Work experience" section in one `<main>` with a 640px max width. Section headings are `h2` with `text-sm font-medium text-muted`, and role headers use `flex-col` that becomes a row from `sm`. `lib/profile.ts` holds identity, links, CV file fields, `summary` and `experience`. The smoke test in `.github/workflows/deploy.yml` greps the HTML for the noindex tag, both profile links, the CV href and both employer names.

The content to publish is in `public/Maciek-Dzialo-CV-English.pdf`. It has six skill groups and two education entries.

## Desired End State

Below Work experience, the page shows a "Skills" section with six labelled rows, then an "Education" section with two stacked entries. At 360px there is no horizontal scroll. The deploy smoke test fails if either section's content is missing from the HTML.

### Key Discoveries:

- All page strings come from `lib/profile.ts`, imported as `@c5-engineer/lib/profile`. Extend that module, do not hardcode text in markup.
- The tsconfig alias is `@c5-engineer/*`, not `@/*`.
- Design tokens exist in `app/globals.css`. Reuse them, add no new colors.
- The experience header markup in `app/page.tsx:81` (role beside period from `sm` up) is the pattern for education entries.
- The smoke test checks strings in one `for expected in` list in `.github/workflows/deploy.yml:44`. React escapes `&` to `&amp;` in HTML, so a check on "Core & Architecture" would fail.

## What We're NOT Doing

- Hobbies. That is the parked FR-006.
- Skill chips, proficiency bars or any visual rating. Skills are plain grouped text.
- Reordering or rewording skills. They are copied from the CV.
- Client JavaScript, a CMS, or a test runner.

## Implementation Approach

Two phases. Phase 1 changes data and markup and is checkable locally. Phase 2 changes only CI. Both sections are server-rendered HTML in the existing column, with semantic headings.

## Critical Implementation Details

- **User experience spec**: On narrow screens the group label sits on its own line above its skills. From `sm` up it may sit beside them, but a long group like "Core & Architecture" must wrap inside the column, never overflow it. Education years follow the same stack-then-row rule as experience dates.
- **Debug & observability**: No new instrumentation. The Phase 2 grep covers the failure that matters, which is a section disappearing in a later change.

## Phase 1: Skills and education on the page

### Overview

Put the CV text into `lib/profile.ts` and render it.

### Changes Required:

#### 1. Profile data

**File**: `lib/profile.ts`

**Intent**: Hold skills and education as typed data so markup has no hardcoded strings.

**Contract**: Add `skills`, an array of `{ group, items }` where `items` is an array of strings. Use the six CV groups in the CV's visual order: Core & Architecture, AI & Agentic Coding, State, Forms & Data, UI & Testing, Databases & CMS, Cloud, Infra & Tooling. Add `education`, an array of `{ degree, school, period }` with "IT Technician" / "ZSTIL High School in Żywiec" / "2016 - 2020" and "Bachelor of Computer science" / "UAFM University in Kraków" / "2020 - 2024". Keep `as const`. Copy the text verbatim, fixing only the PDF line-break hyphenation ("Backend-for-frontend").

#### 2. Page sections

**File**: `app/page.tsx`

**Intent**: Render Skills and Education under Work experience.

**Contract**: Two `<section className="mt-12">` elements with `h2` headings "Skills" and "Education", matching the existing heading style. Skills render as a list of rows, each with the group label (muted, `text-sm`) and the items joined by ", " in body text. Education reuses the experience header markup, with the degree as `h3`, the school under it, and the period beside it from `sm` up. Map with the group or degree as key. Use only existing tokens.

### Success Criteria:

#### Automated Verification:

- Lint passes: `yarn lint`
- Build passes: `yarn build`
- Local HTML contains both sections: run `yarn dev`, then `curl -s localhost:3000 | grep -E 'ZSTIL High School|Tanstack Query'`

#### Manual Verification:

- At 360px width in devtools, no horizontal scroll and all text is visible
- All six skill groups and both education entries match the PDF wording
- Header, buttons, summary and experience from S-01 to S-03 are unchanged
- Heading order is h1, then h2 sections with h3 inside, and focus order is unchanged

**Implementation Note**: After this phase passes, pause for manual confirmation before Phase 2.

---

## Phase 2: CI check

### Overview

Make the deploy fail when skills or education disappear.

### Changes Required:

#### 1. Smoke test

**File**: `.github/workflows/deploy.yml`

**Intent**: Add one string from each new section to the list the smoke test must find in the HTML.

**Contract**: Append `Tanstack Query` and `ZSTIL High School` to the `for expected in` list. Avoid strings containing `&`, since the HTML escapes them. Keep the retry loop, the quoting style and the PDF checks unchanged.

### Success Criteria:

#### Automated Verification:

- Deploy run goes green on `main` with the new strings

#### Manual Verification:

- Live URL shows both new sections
- Optional: set one string to a bogus value on a branch to confirm the step fails with a clear message, then revert

---

## Testing Strategy

### Unit Tests:

- None. No test runner exists and the roadmap parks one.

### Integration Tests:

- The Phase 2 CI grep against the deployed HTML.

### Manual Testing Steps:

1. Open the live URL on a phone and scroll the whole page.
2. Compare each skill group and education entry to the PDF.
3. Check 360px and a desktop width for wrapping of long skill rows and the education header.

## Performance Considerations

Static server-rendered text, no new dependencies and no client JavaScript. The 2 second NFR is unaffected.

## Migration Notes

None.

## References

- Roadmap: `context/foundation/roadmap.md` (S-04)
- PRD: FR-004, FR-005
- Content source: `public/Maciek-Dzialo-CV-English.pdf`
- Similar implementation: `context/archive/2026-10-19-summary-and-experience/plan.md`
- Deploy flow: `context/foundation/architecture/deploy.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Skills and education on the page

#### Automated

- [x] 1.1 Lint passes: `yarn lint`
- [x] 1.2 Build passes: `yarn build`
- [x] 1.3 Local HTML contains both sections

#### Manual

- [x] 1.4 360px width has no horizontal scroll and all text is visible
- [x] 1.5 All six skill groups and both education entries match the PDF
- [x] 1.6 Header, buttons, summary and experience are unchanged
- [x] 1.7 Heading order and focus order are correct

### Phase 2: CI check

#### Automated

- [ ] 2.1 Deploy run goes green on `main` with the new strings

#### Manual

- [ ] 2.2 Live URL shows both new sections
