# Move profile data to JSON: Plan Brief

> Full plan: `context/changes/move-profile-data-to-json/plan.md`

## What & Why

Move the site's profile data out of the `as const` object in `lib/profile.ts` and into a plain `lib/profile.json` file. The data is content, not code, and a JSON file keeps edits to it separate from TypeScript.

## Starting Point

`lib/profile.ts` exports one 130-line object that `app/page.tsx` renders in full and `app/footer.tsx` reads for the name. `tsconfig.json` already enables `resolveJsonModule`.

## Desired End State

`lib/profile.json` holds the same data, both pages import it directly, and `lib/profile.ts` is gone. The rendered homepage is identical to today's.

## Key Decisions Made

| Decision | Choice | Why |
| --- | --- | --- |
| File location | `lib/profile.json` | Sits next to the file it replaces, so the import path changes by one extension. |
| Fate of `lib/profile.ts` | Delete it, import the JSON directly | One source of truth, no wrapper to maintain. |
| Shape checking | TypeScript inference only | A missing field fails `yarn build`, and no new code or dependency is needed. |
| File layout | One `profile.json` | Mirrors the current object, so the move is mechanical and easy to review. |

## Scope

**In scope:** the new JSON file, two import lines, deleting `lib/profile.ts`.

**Out of scope:** per-section files, an explicit type or Zod schema, any change to markup or styling, the deploy smoke test.

## Architecture / Approach

Copy the data to JSON verbatim, switch the two imports to `import profile from "@c5-engineer/lib/profile.json"`, and delete the TS file in the same commit. A before/after diff of the prerendered homepage HTML proves nothing changed.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Move profile data to JSON | JSON file, switched imports, TS file removed | A value mangled in the copy, caught by the HTML diff and the deploy smoke test. |

**Prerequisites:** none.
**Estimated effort:** one short session, one phase.

## Open Risks & Assumptions

- The JSON import drops `as const` literal types. Both consumers only call `.map`, `.join` and `.replace`, so this should not matter.
- The prerendered HTML path under `.next/server/app/` is assumed from Next's usual output and gets confirmed when the baseline is captured.

## Success Criteria (Summary)

- The homepage renders exactly as before.
- `yarn lint` and `yarn build` pass.
- No file imports `@c5-engineer/lib/profile` without `.json`.
