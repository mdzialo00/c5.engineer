# First Deploy to Cloudflare Workers Implementation Plan

## Overview

Add the OpenNext Cloudflare adapter to the existing Next.js app and deploy it to a workers.dev URL from GitHub Actions on every push to `main`. The default create-next-app page is the payload. The point is to prove the pipeline before any real content exists (roadmap F-01, unlocks S-01).

## Current State Analysis

The repo is a bare bootstrap: Next 16.3.6, React 19.2.8, Tailwind 4, Biome, Yarn 4 (`nodeLinker: node-modules`), Node 24.21.0 in `.nvmrc`. There is no `.github/`, no `wrangler` config, no adapter and no git hooks. `next.config.ts` is empty. The remote is `github.com/mdzialo00/c5.engineer` and work goes straight to `main`, with no PRs.

`context/foundation/tech-stack.md` names Cloudflare Workers via OpenNext and GitHub Actions auto-deploy, but says `package_manager: npm`. The repo uses Yarn, so that line is wrong.

## Desired End State

A push to `main` runs lint, builds with the OpenNext adapter, deploys to `https://c5-engineer.<account-subdomain>.workers.dev`, and fails the run if that URL does not answer HTTP 200. Verify by pushing a trivial change and seeing a green run and the default page at the URL.

### Key Discoveries:

- OpenNext supports all minor and patch versions of Next 16 (external, verified with user), source: https://opennext.js.org/cloudflare
- Windows is not fully supported by OpenNext. The docs recommend WSL or a Linux CI runner (external, verified with user), source: https://opennext.js.org/cloudflare
- The docs' `wrangler.jsonc` uses `main: .open-next/worker.js`, `nodejs_compat`, a `compatibility_date` of 2024-12-30 or later, an `assets` binding on `.open-next/assets` and a `WORKER_SELF_REFERENCE` service binding. The R2 incremental cache is optional for a page with no ISR (external, verified with user), source: https://opennext.js.org/cloudflare/get-started
- CI needs the secrets `CLOUDFLARE_API_TOKEN` (token with "Edit Cloudflare Workers") and `CLOUDFLARE_ACCOUNT_ID`, and Cloudflare recommends `cloudflare/wrangler-action@v4` (external, verified with user), source: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
- Next's own docs list Cloudflare as an unverified integration built outside the Adapter API (`node_modules/next/dist/docs/01-app/01-getting-started/17-deploying.md:91`).
- The app has no proxy, middleware, bindings or database, so the known OpenNext gaps do not apply.

## What We're NOT Doing

- Custom domain. The site stays on workers.dev until a later change.
- Vitest, Playwright or any test harness (parked in the roadmap).
- PR checks and PR preview deploys. Lint and build run in a local pre-push hook.
- R2 incremental cache, KV, D1 or any binding beyond the self-reference.
- The no-index rule and real content. Those ship in S-01.
- vinext. Not chosen, it is experimental and replaces Next's build.

## Implementation Approach

Three phases, each ending in something you can check. Phase 1 makes the app buildable by the adapter and cleans up the stack doc. Phase 2 adds the local guard that replaces PR checks. Phase 3 adds the workflow and does the first real deploy, which needs your Cloudflare account and two GitHub secrets.

## Critical Implementation Details

- **Timing & lifecycle**: `opennextjs-cloudflare build` runs `next build` itself, so CI must not run a separate `yarn build` before it. On Windows the adapter build may fail locally. If it does, treat CI on Linux as the source of truth and do not spend time fixing Windows.
- **Debug & observability**: CI is a new failure surface. A failed run emails you through GitHub's default notifications, and the curl smoke test turns a deploy that succeeds but serves an error into a red run. No other instrumentation is needed for a static page.
- **Deploy command**: no R2 or KV binding exists, so plain `wrangler deploy` (through `wrangler-action` with `command: deploy`) is enough after the adapter build. If the first CI run shows the action cannot deploy from the `.open-next` output, fall back to running `yarn deploy` with the two secrets as environment variables.
- **Husky in CI**: Husky's `prepare` script runs on `yarn install`. Set `HUSKY: 0` in the workflow so CI skips hook setup.

## Phase 1: Adapter and local build

### Overview

Install the adapter and Wrangler, add their config, and correct the stack doc. After this phase the app still runs under `yarn dev` and builds under the adapter.

### Changes Required:

#### 1. Dependencies and scripts

**File**: `package.json`

**Intent**: Add `@opennextjs/cloudflare` and `wrangler` as dev dependencies, and the scripts the docs use for preview and deploy.

**Contract**: `yarn add -D @opennextjs/cloudflare wrangler`. Scripts added: `preview` (`opennextjs-cloudflare build && opennextjs-cloudflare preview`) and `deploy` (`opennextjs-cloudflare build && opennextjs-cloudflare deploy`). `build` stays `next build`.

#### 2. Worker config

**File**: `wrangler.jsonc`

**Intent**: Describe the Worker the adapter produces.

**Contract**: Follow the get-started config. `name` is `c5-engineer` (this sets the workers.dev host). `main` is `.open-next/worker.js`. `compatibility_flags` are `nodejs_compat` and `global_fetch_strictly_public`. `compatibility_date` is 2024-12-30 or later, set to the day of implementation. `assets` points at `.open-next/assets` with binding `ASSETS`. `services` holds the `WORKER_SELF_REFERENCE` binding that points at `c5-engineer`. No R2 bucket.

#### 3. Adapter config

**File**: `open-next.config.ts`

**Intent**: Minimal adapter config with no cache override.

**Contract**: `export default defineCloudflareConfig();` imported from `@opennextjs/cloudflare`.

#### 4. Dev init and headers

**Files**: `next.config.ts`, `public/_headers`

**Intent**: Enable binding access during `next dev` and cache static assets for a year.

**Contract**: `next.config.ts` calls `initOpenNextCloudflareForDev()` after the default export, as in the docs. `public/_headers` contains `/_next/static/*` with `Cache-Control: public,max-age=31536000,immutable`.

#### 5. Ignore build output

**File**: `.gitignore`

**Intent**: Keep adapter and Wrangler output out of git.

**Contract**: Add `.open-next`, `.wrangler` and `.dev.vars`.

#### 6. Stack doc correction

**File**: `context/foundation/tech-stack.md`

**Intent**: Make the doc match the repo.

**Contract**: Front matter `package_manager: yarn`. In the prose, keep the OpenNext sentence and add that Yarn 4 is the package manager.

### Success Criteria:

#### Automated Verification:

- Lint passes: `yarn lint`
- Type check passes: `yarn tsc --noEmit`
- Next build passes: `yarn build`
- Adapter build produces `.open-next/worker.js`: `yarn opennextjs-cloudflare build` (run in WSL if it fails on Windows, otherwise CI covers it in Phase 3)

#### Manual Verification:

- `yarn dev` still serves the default page at localhost:3000
- `git status` shows no `.open-next` or `.wrangler` files
- `tech-stack.md` says Yarn

**Implementation Note**: After this phase passes, pause for confirmation before Phase 2.

---

## Phase 2: Pre-push hook

### Overview

Replace PR checks with a local guard. Every push runs lint and build first.

### Changes Required:

#### 1. Husky

**Files**: `package.json`, `.husky/pre-push`

**Intent**: Block a push when lint or build fails.

**Contract**: `yarn add -D husky`. Add `"prepare": "husky"` to scripts. `.husky/pre-push` runs `yarn lint && yarn build` and is committed with the executable bit.

### Success Criteria:

#### Automated Verification:

- Hook file exists and is executable: `git ls-files -s .husky/pre-push` shows mode 100755
- Hooks path is set after install: `git config core.hooksPath` prints `.husky/_`

#### Manual Verification:

- Introduce a lint error, run `git push`, and confirm the push is blocked. Revert the error.
- A clean `git push` passes the hook.

**Implementation Note**: Pause for confirmation before Phase 3. Do not push to `main` in this phase beyond what the hook test needs (test with `git push --dry-run` if the hook runs there, otherwise run `.husky/pre-push` directly).

---

## Phase 3: CI deploy and first release

### Overview

Add the GitHub Actions workflow, set up Cloudflare, and push. The first green run and the live URL close F-01.

### Changes Required:

#### 1. Workflow

**File**: `.github/workflows/deploy.yml`

**Intent**: Build and deploy on every push to `main`, then check the URL.

**Contract**: Trigger `push` on `main`. `concurrency` group `deploy` with `cancel-in-progress: false`. `permissions: contents: read`. `HUSKY: 0` in env. Job on `ubuntu-latest` with these steps in order: `actions/checkout`, `corepack enable`, `actions/setup-node` with `node-version-file: .nvmrc` and `cache: yarn`, `yarn install --immutable`, `yarn lint`, `yarn opennextjs-cloudflare build`, `cloudflare/wrangler-action@v4` (id `deploy`) with `apiToken` and `accountId` from secrets and `command: deploy`, then a smoke test step. The smoke test runs `curl --fail --silent --show-error --retry 5 --retry-delay 5 "${{ steps.deploy.outputs.deployment-url }}"`. Pin the action versions to current majors at implementation time.

#### 2. Cloudflare and GitHub setup (you do this)

**Intent**: Give CI the credentials and a workers.dev subdomain.

**Contract**: Create or confirm a Cloudflare account and register a workers.dev subdomain. Create an API token from the "Edit Cloudflare Workers" template scoped to that account. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets on `mdzialo00/c5.engineer`.

### Success Criteria:

#### Automated Verification:

- Workflow file is valid YAML: `yarn dlx yaml-lint .github/workflows/deploy.yml` or an equivalent parse
- The push to `main` produces a green GitHub Actions run: `gh run watch`
- The smoke test step passes inside that run
- The URL answers: `curl -I https://c5-engineer.<subdomain>.workers.dev` returns 200

#### Manual Verification:

- The default Next.js page opens in a browser at the workers.dev URL
- The page shows visible content in under 2 seconds on a normal connection (PRD NFR)
- A second trivial push redeploys and the run is green again
- A deliberately failed run (for example a wrong token) shows a red run and a GitHub email, then is fixed

**Implementation Note**: The secrets must exist before the push, or the first run fails on auth. That is a fine test, but do it on purpose.

---

## Testing Strategy

### Unit Tests:

None. There is no test harness and no logic to test.

### Integration Tests:

The CI smoke test is the integration test: deploy, then curl the live URL.

### Manual Testing Steps:

1. Push a trivial change, watch the run, open the URL.
2. Break the token, push, confirm a red run and an email.
3. Restore the token, push, confirm green.

## Performance Considerations

The NFR asks for visible content within 2 seconds. A static default page on Workers with cached assets should meet it. Check once by hand in Phase 3. No tuning is planned.

## Migration Notes

None. Nothing exists to migrate. The default page is public and indexable on workers.dev until S-01 adds no-index. The URL is not linked from anywhere, so exposure is low.

## References

- Roadmap: `context/foundation/roadmap.md` (F-01)
- Stack: `context/foundation/tech-stack.md`
- OpenNext get started: https://opennext.js.org/cloudflare/get-started
- Cloudflare GitHub Actions: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Adapter and local build

#### Automated

- [x] 1.1 Lint passes: `yarn lint` — 94f78cb
- [x] 1.2 Type check passes: `yarn tsc --noEmit` — 94f78cb
- [x] 1.3 Next build passes: `yarn build` — 94f78cb
- [x] 1.4 Adapter build produces `.open-next/worker.js`: `yarn opennextjs-cloudflare build` — 94f78cb

#### Manual

- [x] 1.5 `yarn dev` still serves the default page at localhost:3000 — 94f78cb
- [x] 1.6 `git status` shows no `.open-next` or `.wrangler` files — 94f78cb
- [x] 1.7 `tech-stack.md` says Yarn — 94f78cb

### Phase 2: Pre-push hook

#### Automated

- [x] 2.1 Hook file exists and is executable
- [x] 2.2 Hooks path is set after install

#### Manual

- [x] 2.3 A lint error blocks the push, then is reverted
- [x] 2.4 A clean push passes the hook

### Phase 3: CI deploy and first release

#### Automated

- [ ] 3.1 Workflow file is valid YAML
- [ ] 3.2 The push to `main` produces a green GitHub Actions run
- [ ] 3.3 The smoke test step passes inside that run
- [ ] 3.4 The workers.dev URL returns 200

#### Manual

- [ ] 3.5 The default Next.js page opens in a browser at the workers.dev URL
- [ ] 3.6 Visible content appears in under 2 seconds
- [ ] 3.7 A second trivial push redeploys and the run is green
- [ ] 3.8 A deliberately failed run shows red and sends a GitHub email, then is fixed
