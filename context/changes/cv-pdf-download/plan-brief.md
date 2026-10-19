# CV PDF download: Plan Brief

> Full plan: `context/changes/cv-pdf-download/plan.md`

## What & Why

Add a Download CV button to the live page so a recruiter can save the CV as a PDF. This is S-02 and completes the primary success criterion in the PRD: reach GitHub, LinkedIn, or download the CV.

## Starting Point

S-01 is live with name, contact info and GitHub and LinkedIn buttons. The CV already exists as a 60 KB PDF in `Documents/`. Cloudflare serves `public/` as static assets, and `public/_headers` already works.

## Desired End State

The page has a third button, "Download CV". It saves `Maciek Działo CV English.pdf`. The PDF is marked noindex, and a deploy fails if the link or file breaks.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| File hosting | `public/` in the repo, not R2 | Same-origin keeps `download` working, deploys atomically with the page | Plan |
| URL vs saved name | ASCII URL, real name via `download` attribute | Clean URL and CI grep, recruiter still gets your name | Plan |
| PDF indexing | `X-Robots-Tag: noindex, nofollow` in `_headers` | The PDF has your phone and email and no HTML for a meta tag | Plan |
| Button behavior | `download` attribute, same tab | FR-009 says download, no stray tabs on mobile | Plan |
| CI check | HTML href plus PDF status, type and header | Catches a missing file, a wrong path and a lost header | Plan |

## Scope

**In scope:** CV file, profile fields, button, `_headers` rule, smoke test extension.

**Out of scope:** Summary, experience, skills, education (S-03, S-04), R2 hosting, generated PDFs, test framework.

## Architecture / Approach

The PDF is a static asset copied from `public/` into the Worker's assets. The page reads the path and download name from `lib/profile.ts`. The smoke test fetches the HTML and the PDF in the same retry loop.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Button, file and header | PDF, button, noindex header | Three buttons wrapping at 360px |
| 2. CI check | Deploy fails on a missing link or PDF | Header name casing in the grep |

**Prerequisites:** S-01 (done).
**Estimated effort:** under one evening across 2 phases.

## Open Risks & Assumptions

- Assumes `Documents/Maciek Działo CV English.pdf` (dated Sep 18) is the final CV. A stale file would go public.
- Some mobile browsers ignore `download` and open the viewer. Accepted.

## Success Criteria (Summary)

- A recruiter taps Download CV and gets the CV.
- The PDF response carries noindex.
- A deploy goes red if the link or file disappears.
