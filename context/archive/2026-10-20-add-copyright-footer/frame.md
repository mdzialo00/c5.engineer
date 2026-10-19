# Frame Brief: Copyright footer

> Framing step before /c5-plan. This document captures what is actually
> at issue, separated from what was initially assumed.

## Reported Observation

The site has no copyright footer. A grep for `footer`, `©` and `copyright` over `app/` and `lib/` finds nothing, and `context/` has no earlier decision about one.

## Initial Framing (preserved)

- **User's stated cause or approach**: none beyond the change note "copyright footer".
- **User's proposed direction**: add a copyright footer.
- **Pre-dispatch narrowing**: trigger is "seen on other sites", no specific problem. Scope is "Copyright + all rights reserved". Coverage should include the code.

## Dimension Map

1. **Page content notice**: the site text, name and CV link need a visible ownership line. `app/page.tsx` ends at the Hobbies section with no footer, and `app/layout.tsx` renders `{children}` only.
2. **Source code licensing**: the user wants the notice to cover code. A page footer cannot do that. The repo is public (GitHub API returns 200 unauthenticated) and has no `LICENSE` file. ← where "includes code" lands
3. **CV PDF**: `public/Maciek-Dzialo-CV-English.pdf` is served as a download. A footer on the page does not mark the file itself.
4. **Year source**: a static year goes stale. A computed year depends on whether the page is prerendered at build time or per request on Workers.

## Hypothesis Investigation

| Hypothesis | Evidence | Verdict |
| --- | --- | --- |
| Page needs a notice line | `app/page.tsx` ends at Hobbies, `app/layout.tsx` has only `{children}`, `<body>` is already `min-h-full flex flex-col` | STRONG |
| Footer alone covers the code | Footer renders on the web page only. Repo is public at github.com/mdzialo00/c5.engineer with no `LICENSE`, no license field in `package.json` | NONE |
| Footer covers the CV PDF | PDF is a static file in `public/`, linked from the page. The footer sits beside it, not inside it | WEAK |
| Year handling is a risk | `profile.ts` holds no year. Rendering mode on Workers not checked | WEAK |

## Narrowing Signals

- Trigger is imitation of other sites, not a dispute or incident. Nothing forces legal precision.
- The user wants "all rights reserved" and wants code included. That is a licensing statement, and it lives in a repo file, not in the UI.
- Under default copyright law an unlicensed public repo already reserves all rights. A `LICENSE` or README line would make that explicit but changes nothing legally.

## Cross-System Convention

Portfolio sites usually put one line in the layout footer, "© year Name. All rights reserved." Repos state licensing in `LICENSE` or the README. The two are rarely the same artifact.

## Reframed (or Confirmed) Problem Statement

> **The actual problem to plan around is**: the page lacks a visible ownership notice, and the "all rights reserved" intent for the source code has no home because a page footer cannot express it.

The footer request is sound for the site content. The "includes code" answer is a second, separate deliverable: an explicit statement in the repo. Planning them as one footer change would either leave the code uncovered or push repo licensing text into the UI.

## Confidence

**MEDIUM**. The code evidence is solid (no LICENSE, public repo, footer renders on web only). Whether the user wants a repo-level statement as part of this change, or only the footer, is their call. Year rendering mode on Workers was not verified.

## What Changes for /c5-plan

Plan the footer as the main deliverable. Decide explicitly whether a repo-level rights statement belongs in this change or a follow-up, and settle how the year is produced.

## References

- `app/layout.tsx:11-17`, `app/page.tsx` (ends at Hobbies section), `lib/profile.ts`
- `package.json` (no license field, `private: true`), repo root (no `LICENSE`)
- `public/Maciek-Dzialo-CV-English.pdf`
- Investigation tasks: none spawned. The surface is three files, read directly.
