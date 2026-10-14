# Live identity and links Implementation Plan

## Overview

Replace the create-next-app default page with the Quiet layout from the prototype. It shows name, title, location, email, phone, and GitHub and LinkedIn links. No-index ships in the same change because the site goes public here. A CI check then guards the no-index tag and both profile links.

## Current State Analysis

F-01 is done, so every merge to `main` deploys to Cloudflare Workers. `app/page.tsx` is still the create-next-app template, `app/layout.tsx` still says "Create Next App", and `app/globals.css` forces Arial and a dark-mode media query. The prototype artifact (Quiet variant) holds the content and styling to port. Its GitHub and LinkedIn hrefs are `"#"`.

## Desired End State

Opening the deployed URL shows the Quiet header: name, title, a meta line with location, email and phone, and GitHub and LinkedIn buttons. Both buttons reach the real profiles. The page is readable at 360px with no horizontal scroll. The HTML carries `<meta name="robots" content="noindex, nofollow">`, and `/robots.txt` disallows everything. The deploy smoke test fails if the noindex tag or either profile link is missing.

### Key Discoveries:

- Next 16 builds the robots meta tag from `metadata.robots`, and `app/robots.ts` returns `MetadataRoute.Robots` (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md`).
- `app/layout.tsx` types its props as `LayoutProps<"/">`, a Next 16 global helper. Keep it.
- The tsconfig alias is `@c5-engineer/*` mapped to `./*`, not the usual `@/*`.
- The deploy smoke test already curls `steps.deploy.outputs.deployment-url` with retries (`.github/workflows/deploy.yml`), so the new assertion reuses that URL.
- The prototype Quiet variant uses a system font stack and no web fonts, so the 2 second NFR needs no font work.
- `public/_headers` only sets a cache rule for `/_next/static/*`. No change needed there.

## What We're NOT Doing

- CV download button, summary, experience, skills, education, hobbies. Those are S-02 to S-04.
- Dark mode. Quiet ships light only.
- Web fonts, animations, a style switcher.
- Vitest, Playwright or any new dependency.
- An X-Robots-Tag header. Revisit in S-02 when the PDF is served.
- A contact form (PRD non-goal).

## Implementation Approach

Two phases. Phase 1 changes the app and is checkable locally. Phase 2 changes only CI, so it can be reviewed on its own. Profile data lives in one typed module so S-02 to S-04 add fields to it instead of editing markup.

## Critical Implementation Details

- **Debug & observability**: No runtime logging is needed for a static page. The Phase 2 CI assertion is the observability for the one failure that matters here, which is the noindex tag or a profile link disappearing in a later slice.

## Phase 1: Page and no-index

### Overview

Port the Quiet header into Next, add real links, and ship no-index.

### Changes Required:

#### 1. Profile data

**File**: `lib/profile.ts`

**Intent**: One exported constant holding the identity and contact data, so markup has no hardcoded strings.

**Contract**: `profile` has `name` ("Maciek Działo"), `title` ("Software Engineer"), `location` ("Kraków, Poland"), `email` ("mdzialo05@gmail.com"), `phone` ("+48 606-204-018"), `github` ("https://github.com/mdzialo00") and `linkedin` ("https://www.linkedin.com/in/mdzialo/"). Typed with `as const`. Import it through `@c5-engineer/lib/profile`.

#### 2. Page

**File**: `app/page.tsx`

**Intent**: Replace the template with the Quiet header: `h1` name, role line, a meta line (location, email as `mailto:`, phone as `tel:` with the number stripped of spaces and dashes), and a row with GitHub and LinkedIn link buttons.

**Contract**: Single `<main>` with max width 640px, side padding 24px, centered. Link buttons are at least 44px tall and wrap on narrow screens. Use `rel="noopener"` only where `target="_blank"` is set. Each link has visible text, with the GitHub and LinkedIn icons as decorative inline SVG (`aria-hidden`). Do not add the CV button.

#### 3. Layout and metadata

**File**: `app/layout.tsx`

**Intent**: Real title and description, no-index, and drop the Geist web fonts since Quiet uses the system stack.

**Contract**: `metadata = { title: "Maciek Działo, Software Engineer", description: ..., robots: { index: false, follow: false } }`. Remove the `next/font/google` imports and font variable classes. Keep `lang="en"`.

#### 4. Global styles

**File**: `app/globals.css`

**Intent**: Light-only Quiet tokens and the system font stack.

**Contract**: Remove the `prefers-color-scheme: dark` block and the Arial body rule. Keep the Tailwind import. Define background, text, muted and border colors in `:root` and expose them through `@theme inline`, using the Quiet oklch values from the prototype. Set `color-scheme: light`.

#### 5. robots.txt

**File**: `app/robots.ts`

**Intent**: Tell crawlers not to fetch anything.

**Contract**: Default export returns `{ rules: { userAgent: "*", disallow: "/" } }` typed as `MetadataRoute.Robots`. The meta tag in the layout stays, since a Disallow alone can leave the URL listed in results.

#### 6. Remove template assets

**File**: `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`

**Intent**: Delete files only the old page used. Keep `public/_headers`.

### Success Criteria:

#### Automated Verification:

- Lint passes: `yarn lint`
- Build passes: `yarn build`
- Local HTML has the noindex tag: run `yarn dev`, then `curl -s localhost:3000 | grep -i 'name="robots" content="noindex, nofollow"'`
- Local robots.txt disallows all: `curl -s localhost:3000/robots.txt` shows `Disallow: /`

#### Manual Verification:

- At 360px width in devtools, all text and buttons are visible with no horizontal scroll
- GitHub and LinkedIn buttons open the correct profiles
- Email link opens a mail draft and the phone link offers a call on a phone
- Tab order is GitHub, then LinkedIn, with a visible focus ring on each
- Page title shows "Maciek Działo, Software Engineer", not "Create Next App"

**Implementation Note**: After this phase passes, pause for manual confirmation before Phase 2.

---

## Phase 2: CI assertion

### Overview

Make the deploy fail when the no-index tag or a profile link goes missing.

### Changes Required:

#### 1. Smoke test

**File**: `.github/workflows/deploy.yml`

**Intent**: Replace the current smoke test with one that fetches the HTML once and greps it for the three strings that must stay.

**Contract**: The step saves the response using the same URL and retry flags as today, then runs `grep -q` for `name="robots" content="noindex`, `https://github.com/mdzialo00` and `https://www.linkedin.com/in/mdzialo/`. Any miss exits non-zero with a message naming what was missing. Keep the existing retry behavior for the first-deploy 404 (see commit 113744c).

### Success Criteria:

#### Automated Verification:

- Workflow lint and run start succeed on push
- Deploy run goes green on `main` with the new step

#### Manual Verification:

- Live URL renders the page, and view-source shows the noindex tag
- Live `/robots.txt` shows `Disallow: /`
- Optional: change a grep string to a bogus value on a branch to confirm the step fails with a clear message, then revert

---

## Testing Strategy

### Unit Tests:

- None. No test runner exists and the roadmap parks one.

### Integration Tests:

- The Phase 2 CI grep against the deployed HTML.

### Manual Testing Steps:

1. Open the live URL on a phone and scroll the whole page.
2. Tap GitHub and LinkedIn.
3. View source and find the robots meta tag.
4. Open `/robots.txt`.

## Performance Considerations

No web fonts, no client JavaScript beyond Next's runtime, and one small page. The 2 second NFR should hold with margin.

## Migration Notes

None. No data or prior content to migrate.

## References

- Roadmap: `context/foundation/roadmap.md` (S-01)
- PRD: FR-001, FR-007, FR-008, no-index NFR, mobile NFR
- Prototype: https://claude.ai/artifact/Q3dWPxi83QcaEz9m3MBudP (Quiet variant)
- Deploy flow: `context/foundation/architecture/deploy.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Page and no-index

#### Automated

- [x] 1.1 Lint passes: `yarn lint` — 3d37395
- [x] 1.2 Build passes: `yarn build` — 3d37395
- [x] 1.3 Local HTML has the noindex tag — 3d37395
- [x] 1.4 Local robots.txt disallows all — 3d37395

#### Manual

- [x] 1.5 360px width has no horizontal scroll and all content is visible — 3d37395
- [x] 1.6 GitHub and LinkedIn buttons open the correct profiles — 3d37395
- [x] 1.7 Email and phone links work — 3d37395
- [x] 1.8 Tab order and focus rings are correct — 3d37395
- [x] 1.9 Page title is correct — 3d37395

### Phase 2: CI assertion

#### Automated

- [x] 2.1 Workflow lint and run start succeed — ced2207
- [x] 2.2 Deploy run goes green on `main` — ced2207

#### Manual

- [x] 2.3 Live page and view-source show the noindex tag — ced2207
- [x] 2.4 Live `/robots.txt` shows `Disallow: /` — ced2207
