---
starter_id: next
package_manager: npm
project_name: c5-engineer
hints:
  language_family: js
  deployment_target: cloudflare-workers
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: verified
  quality_override: false
  monorepo_wrapper: none
  testing_setup: [vitest, playwright]
  has_auth: false
  has_payments: false
  has_realtime: false
  has_ai: false
  has_background_jobs: false
---

## Why this stack

A public, read-only recruiter-facing profile site (name, title, contact, GitHub/LinkedIn/CV links) with no accounts, no payments, and no realtime or AI needs, shipping in 1 week. The registry's own reasoning pass favored Astro for this exact shape (content-first, zero JS by default), but the user explicitly chose Next.js at the framework-variant question, and Next clears all four agent-friendly gates (typed, convention-based, popular in training, well-documented) with a verified bootstrapper confidence, so no quality override was needed. The deploy target is Cloudflare Workers via the OpenNext adapter rather than the card's own listed default of Cloudflare Pages; this isn't wired into bootstrapper's scaffold command, so the adapter setup is a manual step after scaffolding, not something the CLI invocation handles. CI runs on GitHub Actions with auto-deploy-on-merge, the starter's own default. Vitest and Playwright cover unit and e2e testing respectively; the project stays single-package, no monorepo wrapper.
