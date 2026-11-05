# Move Contact Info to Env Variables Implementation Plan

## Overview

Move the email and phone out of `lib/profile.json` into the `CONTACT_EMAIL` and `CONTACT_PHONE` env variables so they stop appearing in GitHub code search. The site keeps showing them, because the build inlines them into the static HTML. History cleanup is a runbook the user runs by hand.

This plan never writes the real values. Wherever it needs them, it uses `<email>` and `<phone>`.

## Current State Analysis

- `lib/profile.json:5-6` holds `email` and `phone` in plain text.
- `app/page.tsx:7` builds the `tel:` href from `profile.phone`. Lines 20, 23, 26 and 27 render both values.
- The page is fully static. It uses no request-time APIs, so env vars are read once at `next build`.
- `.github/workflows/deploy.yml:29-31` builds in GitHub Actions and already passes `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` from `vars`. The smoke test (lines 38-74) greps the deployed page for fixed strings.
- `.gitignore:34` ignores `.env*`, which would also hide a committed `.env.example`.
- The values also appear in `context/archive/2026-10-13-live-identity-and-links/plan.md:55` and inside `public/Maciek-Dzialo-CV-English.pdf` (plain text, 3 matches).
- The repo has 48 commits on `main`. Every commit that touched `profile.json` or the archived plan carries the values.

## Desired End State

- No tracked file outside the CV PDF contains the email or phone.
- `yarn build` fails with a clear message when either env var is empty.
- The deployed page shows both values, and the smoke test checks for them.
- A runbook exists for the history rewrite. The user has run it, and GitHub search no longer finds the values.

### Key Discoveries:

- Next.js loads `.env.local` into `process.env` and only inlines `NEXT_PUBLIC_` vars into client JS (`node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`). The contact info is rendered by a server component, so plain `CONTACT_EMAIL` and `CONTACT_PHONE` work and nothing extra reaches client bundles.
- The deploy builds in CI, so Cloudflare needs no runtime secrets. The values are baked in at build time.
- Pushing to `main` triggers the deploy (`deploy.yml:3-5`). A push without the GitHub secrets set fails the build by design.

## What We're NOT Doing

- Moving the CV PDF out of git or regenerating it. It stays as the site's download.
- Using `NEXT_PUBLIC_` names or Cloudflare runtime secrets.
- Running the history rewrite for the user. The plan only writes the runbook.
- Hiding the values on the live site. They stay visible there.

## Implementation Approach

A small `lib/contact.ts` is the single reader of the two env vars. It throws on empty values at import time, so a missing secret stops the build before anything deploys. `page.tsx` imports from it instead of from `profile.json`. CI passes the secrets to the build step and the smoke test. The leftovers (archive plan, git history) are handled in separate phases because they are not code.

## Critical Implementation Details

- **Ordering:** set `CONTACT_EMAIL` and `CONTACT_PHONE` as GitHub Actions secrets and create `.env.local` before pushing Phase 1 or 2 to `main`. The build throws without them, so the deploy fails and the pre-push hook (`yarn lint && yarn build`) fails locally.
- **Debug & observability:** no new instrumentation. The build-time throw catches a missing value, and the smoke test catches a build that deployed without the values rendered.

## Phase 1: Read contact info from env

### Overview

Take the values out of source and read them from env.

### Changes Required:

#### 1. Contact reader

**File**: `lib/contact.ts` (new)

**Intent**: Export `email` and `phone` read from `process.env.CONTACT_EMAIL` and `process.env.CONTACT_PHONE`. Throw an error naming the missing variable if either is empty.

**Contract**: `import { contact } from "@c5-engineer/lib/contact"` gives `{ email: string; phone: string }`. Read each variable by its literal name, not through a dynamic lookup.

#### 2. Profile data

**File**: `lib/profile.json`

**Intent**: Delete the `email` and `phone` keys. Nothing else changes.

#### 3. Home page

**File**: `app/page.tsx`

**Intent**: Import `contact` and use `contact.email` and `contact.phone` in place of `profile.email` and `profile.phone` (lines 7, 20, 23, 26, 27).

#### 4. Env template and ignore rule

**Files**: `.env.example` (new), `.gitignore`

**Intent**: `.env.example` lists `CONTACT_EMAIL=` and `CONTACT_PHONE=` with empty values and a one-line comment on where the real ones live. Add `!.env.example` after the `.env*` line in `.gitignore`.

### Success Criteria:

#### Automated Verification:

- Lint passes: `yarn lint`
- Types and build pass with env set: `CONTACT_EMAIL=<email> CONTACT_PHONE=<phone> yarn build`
- Build fails without env: `yarn build` with both unset exits non-zero and names the variable
- No tracked source file contains the values: `git grep -n -i -E "<email-local-part>|<phone-digits>" -- . ':!public' ':!context/archive'` returns nothing

#### Manual Verification:

- `.env.local` created with the real values, `yarn dev` shows both on the page
- The `tel:` link still dials the number with spaces and dashes stripped
- `git status` shows `.env.example` as trackable and `.env.local` as ignored

**Implementation Note**: pause here for manual confirmation before Phase 2.

---

## Phase 2: Wire up CI

### Overview

Give the deploy workflow the secrets and make the smoke test prove they rendered.

### Changes Required:

#### 1. Build step env

**File**: `.github/workflows/deploy.yml`

**Intent**: Add `CONTACT_EMAIL: ${{ secrets.CONTACT_EMAIL }}` and `CONTACT_PHONE: ${{ secrets.CONTACT_PHONE }}` to the `env:` of the `opennextjs-cloudflare build` step, next to the PostHog token.

#### 2. Smoke test

**File**: `.github/workflows/deploy.yml`

**Intent**: Pass the same two secrets to the Smoke test step's `env:` and add `"$CONTACT_EMAIL"` and `"$CONTACT_PHONE"` to the `expected` list, so a build that deployed without them fails the run. GitHub masks secret values in the "missing" log line.

### Success Criteria:

#### Automated Verification:

- Lint passes: `yarn lint`
- Workflow YAML parses: `yarn dlx yaml-lint .github/workflows/deploy.yml` (or push to a branch and confirm Actions accepts it)

#### Manual Verification:

- Secrets set before pushing: `gh secret set CONTACT_EMAIL` and `gh secret set CONTACT_PHONE`, then `gh secret list` shows both
- The next deploy run is green, including the smoke test
- The live page shows the email and phone

**Implementation Note**: pause here for manual confirmation before Phase 3.

---

## Phase 3: Scrub the tree

### Overview

Remove the values from tracked context docs.

### Changes Required:

#### 1. Archived plan

**File**: `context/archive/2026-10-13-live-identity-and-links/plan.md`

**Intent**: At line 55, replace the literal email and phone with `<email>` and `<phone>`. Keep the rest of the sentence.

### Success Criteria:

#### Automated Verification:

- Only the CV PDF still matches: `git grep -l -i -E "<email-local-part>|<phone-digits>"` lists nothing, and `git grep -l -a` over `public/` lists only the PDF

#### Manual Verification:

- Skim the diff and confirm no other doc quotes the values

**Implementation Note**: pause here for manual confirmation before Phase 4.

---

## Phase 4: History runbook

### Overview

Write the steps for removing the values from the 48 existing commits. The user runs them.

### Changes Required:

#### 1. Runbook

**File**: `context/changes/move-contact-info-to-env/history-rewrite-runbook.md` (new)

**Intent**: An ordered, copy-pasteable runbook that never contains the real values. It tells the user to put the strings in a local `replacements.txt` outside the repo.

**Contract**: Steps in order:

1. Confirm Phases 1-3 are merged and the deploy is green.
2. Make a mirror backup: `git clone --mirror`.
3. Install `git-filter-repo` and run it with `--replace-text` pointing at `replacements.txt`, mapping the email and phone to `<redacted>`. Add `--path public/Maciek-Dzialo-CV-English.pdf --invert-paths` first, then re-add the current PDF in a normal commit (old PDFs carry the values in history; the current one stays as the download).
4. Re-add the `origin` remote and `git push --force --all` plus tags.
5. Re-clone to verify with `git log -p -S"<email>"`.
6. Contact GitHub support to remove cached views and old commit SHAs, and check forks.
7. Check `https://github.com/search?q=<email>&type=code` after a few hours.

Note: the force push triggers a deploy, so the secrets from Phase 2 must already exist.

### Success Criteria:

#### Automated Verification:

- Runbook file exists and contains no real values: `git grep -n -i -E "<email-local-part>|<phone-digits>" context/changes/move-contact-info-to-env/` returns nothing

#### Manual Verification:

- Runbook run to the end by the user
- GitHub code search for the email and phone returns nothing for this repo
- A fresh clone has no match in `git log -p -S`

---

## Testing Strategy

### Unit Tests:

None. The repo has no test runner, and `lib/contact.ts` is a few lines covered by the build.

### Manual Testing Steps:

1. Run `yarn build` with the vars unset and check the error names the missing variable.
2. Run `yarn preview` with `.env.local` set and check both values render.
3. After deploy, open the live page and click the email and phone links.

## Migration Notes

Existing deployments keep working until the next push. After Phase 1 lands on `main` without the GitHub secrets, the deploy fails and the old site stays live.

## References

- Env var docs: `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`
- Deploy workflow: `.github/workflows/deploy.yml:29-31,38-74`
- Archived plan carrying the values: `context/archive/2026-10-13-live-identity-and-links/plan.md:55`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Read contact info from env

#### Automated

- [x] 1.1 Lint passes
- [x] 1.2 Build passes with env set
- [x] 1.3 Build fails without env and names the variable
- [x] 1.4 No tracked source file contains the values

#### Manual

- [x] 1.5 `.env.local` created and `yarn dev` shows both values
- [x] 1.6 `tel:` link still dials the stripped number
- [x] 1.7 `.env.example` trackable, `.env.local` ignored

### Phase 2: Wire up CI

#### Automated

- [ ] 2.1 Lint passes
- [ ] 2.2 Workflow YAML is accepted

#### Manual

- [ ] 2.3 GitHub secrets set and listed before pushing
- [ ] 2.4 Deploy run is green including smoke test
- [ ] 2.5 Live page shows email and phone

### Phase 3: Scrub the tree

#### Automated

- [ ] 3.1 Only the CV PDF still matches the values

#### Manual

- [ ] 3.2 Diff skimmed, no other doc quotes the values

### Phase 4: History runbook

#### Automated

- [ ] 4.1 Runbook exists and contains no real values

#### Manual

- [ ] 4.2 Runbook run to the end by the user
- [ ] 4.3 GitHub code search returns nothing for this repo
- [ ] 4.4 Fresh clone has no match in `git log -p -S`
