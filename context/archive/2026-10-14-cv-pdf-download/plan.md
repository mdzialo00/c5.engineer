# CV PDF download Implementation Plan

## Overview

Add a Download CV button to the live page. The PDF ships as a static file in `public/`, carries a noindex header, and the deploy smoke test fails if the link or the file goes missing.

## Current State Analysis

S-01 is done. `app/page.tsx` has a row with GitHub and LinkedIn buttons sharing one `linkClass`, and `lib/profile.ts` holds all page data. Cloudflare serves `public/` as static assets (`wrangler.jsonc` assets directory), and `public/_headers` already works there. The smoke test in `.github/workflows/deploy.yml` greps the HTML only, so it would not notice a missing PDF. The CV exists at `C:\Users\mdzia\Documents\Maciek Działo CV English.pdf` (60 KB).

## Desired End State

The page shows a third button, "Download CV", after LinkedIn. Clicking it saves `Maciek Działo CV English.pdf`. The PDF URL is `/Maciek-Dzialo-CV-English.pdf`, served as `application/pdf` with `X-Robots-Tag: noindex, nofollow`. A deploy goes red if the CV href is missing from the HTML, or the PDF returns a non-200, the wrong type, or no noindex header.

### Key Discoveries:

- `public/_headers` uses Cloudflare's format, and a `/*.pdf` rule applies to static assets (`public/_headers:1`).
- The `download` attribute only works same-origin, which is one reason to keep the file in `public/` and not in R2.
- The S-01 plan deferred the `X-Robots-Tag` header to this slice, because the PDF has no HTML to carry a meta tag and contains the phone and email.
- Button styling lives in a shared `linkClass` in `app/page.tsx:3`. Reuse it.
- The smoke test already loops with retries and collects missing strings (`deploy.yml:40-58`). Extend that loop, do not add a second one.

## What We're NOT Doing

- Summary, experience, skills, education, hobbies. Those are S-03 and S-04.
- Storing the PDF in R2 or any other external host.
- Generating the PDF from page content. The CV is a hand-made file.
- A PDF viewer page or an open-in-new-tab variant.
- Vitest, Playwright or any new dependency.

## Implementation Approach

Two phases. Phase 1 changes the app and is checkable locally. Phase 2 changes only CI. The URL name is ASCII and the saved name is the real one, set through the `download` attribute, so the smoke test never handles non-ASCII.

## Critical Implementation Details

- **Debug & observability**: A missing or renamed PDF is the new failure mode, and recruiters would hit a 404 with no signal. The Phase 2 smoke test is the observability for it, so no runtime logging is added.

## Phase 1: Button, file and header

### Overview

Publish the PDF, link it from the page, and mark it noindex.

### Changes Required:

#### 1. CV file

**File**: `public/Maciek-Dzialo-CV-English.pdf`

**Intent**: Copy the final CV into the repo under an ASCII name.

**Contract**: Source is `C:\Users\mdzia\Documents\Maciek Działo CV English.pdf`. The binary is committed as is. `.gitattributes` must not mangle it, so check that it has no text rule that applies to `*.pdf`.

#### 2. Profile data

**File**: `lib/profile.ts`

**Intent**: Keep the URL path and the saved name next to the other links so markup has no hardcoded strings.

**Contract**: Add `cv` and `cvDownloadName` to `profile`. `cv` is `"/Maciek-Dzialo-CV-English.pdf"`, `cvDownloadName` is `"Maciek Działo CV English.pdf"`. Still `as const`.

#### 3. Page

**File**: `app/page.tsx`

**Intent**: Add the Download CV button after LinkedIn.

**Contract**: An `<a href={profile.cv} download={profile.cvDownloadName} className={linkClass}>` with a decorative inline download icon (`aria-hidden`, same size and color classes as the other icons) and the visible text "Download CV". No `target` and no `rel`. The row already wraps, so check three buttons at 360px.

#### 4. Headers

**File**: `public/_headers`

**Intent**: Tell crawlers not to index the PDF.

**Contract**: Add a block `/*.pdf` with `X-Robots-Tag: noindex, nofollow`. Keep the existing `/_next/static/*` block unchanged.

### Success Criteria:

#### Automated Verification:

- Lint passes: `yarn lint`
- Build passes: `yarn build`
- Built assets contain the PDF and headers: `.open-next/assets/Maciek-Dzialo-CV-English.pdf` and `.open-next/assets/_headers` exist after `yarn opennextjs-cloudflare build`
- Local HTML links the CV: `curl -s localhost:3000 | grep -F 'href="/Maciek-Dzialo-CV-English.pdf"'`

#### Manual Verification:

- At 360px width, three buttons wrap cleanly with no horizontal scroll
- Clicking Download CV saves a file named `Maciek Działo CV English.pdf` that opens and matches the final CV
- Tab order is GitHub, LinkedIn, Download CV, with a visible focus ring on each
- On a phone, the button either downloads the file or opens it in the viewer, and both are acceptable

**Implementation Note**: After this phase passes, pause for manual confirmation before Phase 2.

---

## Phase 2: CI check

### Overview

Make the deploy fail when the CV link or file breaks.

### Changes Required:

#### 1. Smoke test

**File**: `.github/workflows/deploy.yml`

**Intent**: Add the CV href to the HTML grep list, then fetch the PDF and check status, type and the robots header, all inside the existing retry loop.

**Contract**: Add `href="/Maciek-Dzialo-CV-English.pdf"` to the `expected` list. After the HTML checks pass, run `curl --fail --silent --show-error -D headers.txt -o cv.pdf "$DEPLOYMENT_URL/Maciek-Dzialo-CV-English.pdf"`, then `grep -qi '^content-type: application/pdf'` and `grep -qi '^x-robots-tag: noindex'` on `headers.txt`. Each miss appends to `missing` with a name like `[cv pdf content-type]` and sets `status=1`, same as today. Header names are case-insensitive over HTTP/2, so match with `-i`.

### Success Criteria:

#### Automated Verification:

- Deploy run goes green on `main` with the new checks

#### Manual Verification:

- Live page shows the Download CV button, and the live PDF URL returns the CV
- `curl -sI <live-url>/Maciek-Dzialo-CV-English.pdf` shows `x-robots-tag: noindex, nofollow`
- Optional: point the PDF check at a bogus path on a branch to confirm the step fails with a clear message, then revert

---

## Testing Strategy

### Unit Tests:

- None. No test runner exists and the roadmap parks one.

### Integration Tests:

- The Phase 2 smoke test against the deployed site.

### Manual Testing Steps:

1. Open the live URL on a phone and tap Download CV.
2. Open the saved file and compare it with the source CV.
3. Run `curl -sI` on the PDF URL and read the headers.
4. Tab through the buttons on desktop.

## Performance Considerations

The PDF is 60 KB and loads only on click. Nothing is added to the initial page weight except one link and a small SVG.

## Migration Notes

None. To update the CV later, replace the file in `public/` and redeploy. The URL and download name stay the same.

## References

- Roadmap: `context/foundation/roadmap.md` (S-02)
- PRD: US-01, FR-009
- Previous slice: `context/archive/2026-10-13-live-identity-and-links/plan.md`
- Deploy flow: `context/foundation/architecture/deploy.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Button, file and header

#### Automated

- [x] 1.1 Lint passes: `yarn lint` — ea2132a
- [x] 1.2 Build passes: `yarn build` — ea2132a
- [x] 1.3 Built assets contain the PDF and headers — ea2132a
- [x] 1.4 Local HTML links the CV — ea2132a

#### Manual

- [x] 1.5 Three buttons wrap cleanly at 360px with no horizontal scroll — ea2132a
- [x] 1.6 Download saves `Maciek Działo CV English.pdf` and it matches the final CV — ea2132a
- [x] 1.7 Tab order and focus rings are correct — ea2132a
- [x] 1.8 Phone download or viewer open works — ea2132a

### Phase 2: CI check

#### Automated

- [x] 2.1 Deploy run goes green on `main` — 679027a

#### Manual

- [x] 2.2 Live page shows the button and the live PDF URL returns the CV — 679027a
- [x] 2.3 Live PDF response has `x-robots-tag: noindex, nofollow` — 679027a
