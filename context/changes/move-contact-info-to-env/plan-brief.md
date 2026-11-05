# Move Contact Info to Env Variables: Plan Brief

> Full plan: `context/changes/move-contact-info-to-env/plan.md`

## What & Why

Move the email and phone from `lib/profile.json` into env variables so GitHub code search stops finding them. The live site keeps showing both. The goal is to keep them out of the repo, not off the page.

## Starting Point

`lib/profile.json` holds both values and `app/page.tsx` renders them. The page is static, so the values are read at build time. CI builds and deploys on every push to `main`. The values also sit in an archived plan, in the CV PDF, and in git history.

## Desired End State

No tracked file except the CV PDF contains the values. The build fails loudly if an env var is missing. The deployed page still shows both, and the smoke test checks for them. The user has run a history rewrite so GitHub search finds nothing.

## Key Decisions Made

| Decision | Choice | Why (1 sentence) | Source |
| --- | --- | --- | --- |
| Git history | Runbook the user runs | The rewrite is destructive and outward-facing, so the user keeps control. | Plan |
| CV PDF | Keep it, scrub it from history | GitHub does not index PDF text and the CV is meant to be shared. | Plan |
| Missing env var | Fail the build | A forgotten secret should never deploy a blank contact line. | Plan |
| Variable names | `CONTACT_EMAIL`, `CONTACT_PHONE`, no `NEXT_PUBLIC_` | The page is a server component, so nothing needs to reach client JS. | Plan |
| CI storage | GitHub Actions secrets | Secrets are masked in logs, repo variables are not. | Plan |

## Scope

**In scope:** env reader, page and profile edits, `.env.example`, CI secrets and smoke checks, archived plan redaction, history runbook.

**Out of scope:** moving or regenerating the PDF, Cloudflare runtime secrets, running the rewrite for the user.

## Architecture / Approach

`lib/contact.ts` reads the two env vars and throws if either is empty. `page.tsx` imports from it. The deploy workflow passes the secrets to the build and smoke-test steps. Next.js inlines the values into the static HTML at build time.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Read from env | `contact.ts`, page and JSON edits, `.env.example` | Local build breaks until `.env.local` exists |
| 2. Wire up CI | Secrets in build and smoke test | Push before secrets are set fails the deploy |
| 3. Scrub the tree | Archived plan redacted | Missing another doc that quotes the values |
| 4. History runbook | Steps to rewrite history and purge GitHub caches | Force push rewrites 48 SHAs; cached views need GitHub support |

**Prerequisites:** `gh` CLI logged in with rights to set repo secrets, `git-filter-repo` installed for Phase 4.

## Open Risks & Assumptions

- Values stay searchable on GitHub until Phase 4 is run and GitHub clears its caches.
- Forks or clones made earlier still hold the old history.
- The live page keeps both values in its HTML, so scrapers can still read them there.

## Success Criteria (Summary)

- GitHub code search for the email and phone returns nothing for this repo.
- The live site still shows both and the contact links work.
- A build without the env vars fails with a clear message.
