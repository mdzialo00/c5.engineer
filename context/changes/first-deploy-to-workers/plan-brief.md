# First Deploy to Cloudflare Workers: Plan Brief

> Full plan: `context/changes/first-deploy-to-workers/plan.md`

## What & Why

Put the default Next.js page on a public Cloudflare Workers URL, deployed by GitHub Actions on every push to `main`. The adapter setup is the riskiest unknown in the stack, so it goes first while only the default page is at stake. S-01 cannot count as "live" without this.

## Starting Point

A bare Next.js 16 bootstrap with Yarn 4 and Biome. No `.github/`, no Wrangler config, no adapter, no hooks. `tech-stack.md` wrongly says npm.

## Desired End State

Pushing to `main` lints, builds with OpenNext, deploys to `https://c5-engineer.<subdomain>.workers.dev` and fails the run if that URL does not return 200. You see the default page at the URL.

## Key Decisions Made

| Decision | Choice | Why | Source |
| --- | --- | --- | --- |
| Deploy route | OpenNext adapter | Real Next.js, supports all Next 16 versions, matches the stack doc | Plan |
| Package manager in CI | Yarn 4, Node from `.nvmrc` | Matches the repo and lockfile, `tech-stack.md` gets corrected | Plan |
| Checks | Local pre-push hook (Husky), CI also lints | You push straight to `main`, and `--no-verify` skips hooks | Plan |
| Triggers | Deploy on push to `main` only | No PRs on this project | Plan |
| URL | workers.dev, no custom domain | No domain decided, roadmap lists it as unknown | Plan |
| Verification | curl smoke test after deploy | Turns a dead deploy into a red run | Plan |
| CI auth | `wrangler-action@v4` with two secrets | Cloudflare's documented path | Plan |
| Cache | No R2, default adapter config | No ISR, and the PRD rules out dynamic content | Plan |

## Scope

**In scope:** adapter and Wrangler config, pre-push hook, deploy workflow, Cloudflare and GitHub secret setup, `tech-stack.md` fix.

**Out of scope:** custom domain, test harness, PR checks and previews, bindings, no-index, real content, vinext.

## Architecture / Approach

`opennextjs-cloudflare build` runs `next build` and converts the output into `.open-next/worker.js` plus static assets. `wrangler deploy` uploads that Worker. GitHub Actions on Ubuntu runs both, because OpenNext does not fully support Windows.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Adapter and local build | Adapter config, scripts, stack doc fix | Adapter build may fail on Windows, CI covers it |
| 2. Pre-push hook | Lint and build before every push | Husky with Yarn 4 needs a quick check |
| 3. CI deploy and first release | Workflow, secrets, live URL | Token or secret mistakes fail the first run |

**Prerequisites:** a Cloudflare account with a workers.dev subdomain, an API token, and two GitHub repository secrets.
**Estimated effort:** about 1 to 2 sessions across 3 phases, plus the account setup.

## Open Risks & Assumptions

- `wrangler deploy` may not accept the `.open-next` output through the action. Fallback is `yarn deploy` with the secrets as environment variables.
- The default page is public and indexable until S-01. The URL is not linked anywhere.
- The Cloudflare account does not exist yet, per the roadmap unknown.

## Success Criteria (Summary)

- A push to `main` gives a green run and a working workers.dev URL.
- A broken deploy shows up as a red run and an email.
- A bad push is blocked locally by the hook.
