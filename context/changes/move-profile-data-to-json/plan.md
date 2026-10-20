# Move profile data to JSON Implementation Plan

## Overview

Replace the `as const` object in `lib/profile.ts` with a plain `lib/profile.json` file. The two files that read the data import the JSON directly, and `lib/profile.ts` is deleted.

## Current State Analysis

`lib/profile.ts` exports one 130-line `as const` object named `profile`. It holds contact details, a summary, two jobs, six skill groups, two degrees and the hobbies. Two files import it through the `@c5-engineer/*` alias:

- `app/page.tsx` renders every field.
- `app/footer.tsx` reads `profile.name` only.

No test files exist. `architecture.md` never mentions the profile file.

## Desired End State

`lib/profile.json` holds the same data, byte for byte in its string values. `app/page.tsx` and `app/footer.tsx` import it as `import profile from "@c5-engineer/lib/profile.json"`. `lib/profile.ts` no longer exists. The prerendered homepage HTML is identical before and after, `yarn lint` passes, and `yarn build` passes.

### Key Discoveries:

- `tsconfig.json:12` already sets `resolveJsonModule: true`, so no config change is needed.
- `tsconfig.json:25-31` includes `**/*.ts` and `**/*.tsx` only. JSON imports resolve through the module system, so the include list needs no change.
- `app/page.tsx:1` and `app/footer.tsx:1` are the only import sites for `@c5-engineer/lib/profile`.
- `.github/workflows/deploy.yml:44` smoke-tests the deployed page for strings that come from the profile data: the GitHub and LinkedIn URLs, `Tesco Technology`, `Forte Digital`, `Tanstack Query`, `ZSTIL High School`, `bootstrapped SaaS business`, the CV link and the footer text. A dropped or mangled value fails the deploy.
- `biome.json` formats JSON with 2-space indent, and `.husky/pre-push` runs `yarn lint && yarn build`.
- A JSON import loses the `as const` literal and readonly types. `page.tsx` only calls `.map`, `.join` and `.replace` on the data, which work on plain arrays and strings.

## What We're NOT Doing

- No split into per-section files.
- No explicit `Profile` type, Zod schema or other runtime validation.
- No change to what the page renders, its markup or its styling.
- No change to the deploy smoke test.
- No rename of the `@c5-engineer/*` alias or `tsconfig.json` edits.

## Implementation Approach

Do the move in one phase. Deleting `lib/profile.ts` breaks both imports until they point at the JSON, so the data file, the import switch and the deletion land together. Capture the prerendered homepage HTML before touching anything, then diff it against the HTML built afterwards to prove the page did not change.

## Critical Implementation Details

- **Timing & lifecycle**: Capture the baseline HTML before any edit. After the edits it can no longer be produced from this tree.

## Phase 1: Move profile data to JSON

### Overview

Create `lib/profile.json`, point both consumers at it, delete `lib/profile.ts`, and confirm the rendered page is unchanged.

### Changes Required:

#### 1. Baseline capture

**File**: scratch copy outside the repo (use the session scratchpad)

**Intent**: Save the homepage HTML as it renders today, so the end result can be diffed against it.

**Contract**: Run `yarn build` on the untouched tree and copy the prerendered homepage HTML from under `.next/server/app/` to the scratchpad.

#### 2. Data file

**File**: `lib/profile.json`

**Intent**: Hold the same object that `lib/profile.ts` exports today, as JSON.

**Contract**: Top-level keys stay `name`, `title`, `location`, `email`, `phone`, `github`, `linkedin`, `cv`, `cvDownloadName`, `summary`, `experience`, `skills`, `education`, `hobbies`, with the same nested keys (`role`, `company`, `period`, `highlights`, `group`, `items`, `degree`, `school`). Copy string values verbatim, including the non-ASCII characters in `Działo`, `Kraków` and `Żywiec`, in UTF-8. Keep the 2-space indent Biome expects.

#### 3. Consumers

**File**: `app/page.tsx`

**Intent**: Read the profile from the JSON file.

**Contract**: Line 1 becomes `import profile from "@c5-engineer/lib/profile.json";`. Nothing else in the file changes.

**File**: `app/footer.tsx`

**Intent**: Read the profile from the JSON file.

**Contract**: Line 1 becomes `import profile from "@c5-engineer/lib/profile.json";`. Nothing else in the file changes.

#### 4. Removal

**File**: `lib/profile.ts`

**Intent**: Delete it, since the JSON file replaces it.

**Contract**: After deletion, `grep` for `lib/profile"` and `lib/profile'` across the repo (excluding `node_modules`, `.next` and `context/`) finds no match.

### Success Criteria:

#### Automated Verification:

- Baseline homepage HTML is saved before any edit.
- Linting passes: `yarn lint`
- Build passes: `yarn build`
- Prerendered homepage HTML after the change is identical to the baseline.
- No remaining imports of `@c5-engineer/lib/profile` without the `.json` extension.

#### Manual Verification:

- `yarn dev` shows the homepage with the name, contact line, links, summary, both jobs, all six skill groups, both degrees and the hobbies.
- Polish characters in the name, location and school render correctly.
- The Download CV link still downloads `Maciek Działo CV English.pdf`.

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding.

---

## Testing Strategy

### Unit Tests:

- None. The repo has no test runner, and the change adds no logic.

### Integration Tests:

- The deploy workflow's smoke test greps the deployed page for strings drawn from every profile section, which covers a dropped value after merge.

### Manual Testing Steps:

1. Run `yarn dev` and read the homepage top to bottom against the old content.
2. Click Download CV and check the saved file name.

## Performance Considerations

None. The JSON is bundled at build time like the TS module was, and both pages are prerendered.

## Migration Notes

None. The data has no runtime consumers outside the two imports.

## References

- Change identity: `context/changes/move-profile-data-to-json/change.md`
- Current data: `lib/profile.ts`
- Consumers: `app/page.tsx:1`, `app/footer.tsx:1`
- Existing check on rendered content: `.github/workflows/deploy.yml:44`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Move profile data to JSON

#### Automated

- [x] 1.1 Baseline homepage HTML is saved before any edit
- [x] 1.2 Linting passes: `yarn lint`
- [x] 1.3 Build passes: `yarn build`
- [x] 1.4 Prerendered homepage HTML after the change is identical to the baseline
- [x] 1.5 No remaining imports of `@c5-engineer/lib/profile` without the `.json` extension

#### Manual

- [x] 1.6 `yarn dev` shows every homepage section with the old content
- [x] 1.7 Polish characters in the name, location and school render correctly
- [x] 1.8 The Download CV link still downloads `Maciek Działo CV English.pdf`
