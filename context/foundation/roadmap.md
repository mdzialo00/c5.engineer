---
project: c5-engineer
version: 1
status: draft
created: 2026-09-29
updated: 2026-09-29
prd_version: 1
main_goal: speed
top_blocker: time
---

# Roadmap: c5-engineer

> Derived from `context/foundation/prd.md` (v1) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Vision recap

Recruiters only see a PDF resume and a LinkedIn profile, and neither proves the candidate can build software. This site is a single public link that holds name, contact info, experience, skills, GitHub, LinkedIn and a CV download, and because the candidate built it, the site is itself evidence of skill.

## North star

**S-01: Recruiter opens the live link and sees name, title, contact info, and working GitHub and LinkedIn links**: it is the first page a recruiter could actually use, and the primary Success Criterion starts there, so with a one-week budget it goes live before anything else.

> "North star" here means the smallest end-to-end slice that proves the core idea works. It is placed as early as its prerequisites allow, because the rest of the roadmap only matters if this page is live and usable.

## At a glance

| ID   | Change ID                 | Outcome (user can …)                                                        | Prerequisites | PRD refs                                        | Status   |
| ---- | ------------------------- | --------------------------------------------------------------------------- | ------------- | ----------------------------------------------- | -------- |
| F-01 | first-deploy-to-workers   | (foundation) merged code auto-deploys to a public Cloudflare Workers URL    | —             | NFR (visible content within 2 seconds)          | ready    |
| S-01 | live-identity-and-links   | open the live link and see identity, contact, GitHub and LinkedIn links     | F-01          | US-01, FR-001, FR-007, FR-008                   | blocked  |
| S-02 | cv-pdf-download           | download the CV as a PDF                                                    | S-01          | US-01, FR-009                                   | proposed |
| S-03 | summary-and-experience    | read the professional summary and work experience                           | S-01          | FR-002, FR-003                                  | proposed |
| S-04 | skills-and-education      | scan skills and education                                                   | S-01          | FR-004, FR-005                                  | proposed |

## Baseline

What's already in place in the codebase as of `2026-09-29` (auto-researched + user-confirmed).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** partial. Next.js 16.3.6, React 19, Tailwind 4 and Biome are installed (`package.json`, `app/`). `app/page.tsx` and `app/layout.tsx` are still create-next-app defaults with no CV content.
- **Backend / API:** absent. Not needed, the PRD has no forms and no backend.
- **Data:** absent. Content is hardcoded by design (PRD Non-Goals).
- **Auth:** absent. Public read-only site (PRD Access Control).
- **Deploy / infra:** absent. `tech-stack.md` names Cloudflare Workers via the OpenNext adapter and GitHub Actions auto-deploy. No `.github/` and no adapter config exist yet.
- **Observability:** absent.
- **Testing:** absent. `tech-stack.md` names Vitest and Playwright, neither is installed.
- **Package manager:** the repo uses Yarn 4 (`.yarnrc.yml`, `yarn.lock`), while `tech-stack.md` says npm.

## Foundations

### F-01: First deploy to Cloudflare Workers

- **Outcome:** (foundation) a merge to the main branch builds and deploys the app to a public Workers URL through GitHub Actions, with the default page as the first payload.
- **Change ID:** first-deploy-to-workers
- **PRD refs:** NFR (visible content within 2 seconds); deploy target from `tech-stack.md`
- **Unlocks:** S-01, which cannot be verified as "live" without a public URL. Also retires the OpenNext adapter unknown, which `tech-stack.md` calls a manual step.
- **Prerequisites:** —
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Is there a Cloudflare account, and which URL or domain will the site use? Owner: user. Block: no.
- **Risk:** The OpenNext adapter is not covered by the scaffold, so this is the step most likely to eat an evening. Doing it first, with only the default page at stake, keeps that cost away from real content.
- **Status:** ready

## Slices

### S-01: Live identity and links

- **Outcome:** user can open the live link and see the candidate's name, title, location and contact info, and can click GitHub and LinkedIn links that reach the profiles. The page is readable on a phone and asks search engines not to index it.
- **Change ID:** live-identity-and-links
- **PRD refs:** US-01, FR-001, FR-007, FR-008, NFR (no-index), NFR (mobile-usable)
- **Prerequisites:** F-01
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Which visual style ships: Quiet, Editorial or Terminal? Owner: user. Block: yes.
- **Risk:** The site goes public here, so the no-index rule has to ship in this slice, not later.
- **Status:** blocked

### S-02: CV PDF download

- **Outcome:** user can download the CV as a PDF from the page.
- **Change ID:** cv-pdf-download
- **PRD refs:** US-01, FR-009
- **Prerequisites:** S-01
- **Parallel with:** S-03, S-04
- **Blockers:** —
- **Unknowns:**
  - Is the final CV PDF file ready to commit? Owner: user. Block: no.
- **Risk:** The slice is small. The only thing that can go wrong is a missing or outdated PDF.
- **Status:** proposed

### S-03: Summary and experience

- **Outcome:** user can read the professional summary and work experience on the page.
- **Change ID:** summary-and-experience
- **PRD refs:** FR-002, FR-003
- **Prerequisites:** S-01
- **Parallel with:** S-02, S-04
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Experience is the longest content block, so mobile layout is most likely to break here.
- **Status:** proposed

### S-04: Skills and education

- **Outcome:** user can scan the skills list and education on the page.
- **Change ID:** skills-and-education
- **PRD refs:** FR-004, FR-005
- **Prerequisites:** S-01
- **Parallel with:** S-02, S-03
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Low. It reuses the layout from S-01 and S-03, so the risk is inconsistent styling, not new technology.
- **Status:** proposed

## Backlog Handoff

| Roadmap ID | Change ID               | Suggested issue title                                 | Ready for `/c5-plan` | Notes                                                    |
| ---------- | ----------------------- | ----------------------------------------------------- | -------------------- | -------------------------------------------------------- |
| F-01       | first-deploy-to-workers | Deploy the app to Cloudflare Workers on merge         | yes                  | Run `/c5-plan first-deploy-to-workers`                   |
| S-01       | live-identity-and-links | Live page with identity, contact, GitHub and LinkedIn | no                   | Blocked on the visual style decision, and needs F-01     |
| S-02       | cv-pdf-download         | Add CV PDF download                                   | no                   | Needs S-01                                               |
| S-03       | summary-and-experience  | Show summary and work experience                      | no                   | Needs S-01                                               |
| S-04       | skills-and-education    | Show skills and education                             | no                   | Needs S-01                                               |

## Open Roadmap Questions

1. **Which visual style ships: Quiet, Editorial or Terminal?** Owner: user. Block: S-01, and through it S-02, S-03, S-04.
2. **Should CI follow Yarn or npm?** `tech-stack.md` says npm, the repo uses Yarn 4. Owner: user. Block: F-01 (not blocking, the repo's Yarn is the working default).
3. **What is the one-sentence business rule?** No domain rule exists, this is a static, read-only CV site by deliberate design choice, confirmed by the user during shaping. Owner: user (resolved). Block: no.

## Parked

- **FR-006 hobbies (nice-to-have):** Why parked: the goal is speed to launch, and hobbies are the only non-must-have requirement.
- **CMS or admin panel:** Why parked: PRD Non-Goals. Content is hardcoded.
- **Contact form:** Why parked: PRD Non-Goals. Contact is a mailto or tel link.
- **Live style-switcher:** Why parked: PRD Non-Goals. One style ships as the fixed look.
- **Test harness set up ahead of need (Vitest, Playwright):** Why parked: speed. Each slice adds only the verification it needs, starting with S-01.

## Done

(Empty on first generation. `/c5-archive` appends an entry here, and flips that item's `Status` to `done`, when a change whose `Change ID` matches the item is archived. Do NOT pre-populate. Format:)

- **<Slice ID>: <Outcome>**: Archived <YYYY-MM-DD> → `context/archive/<YYYY-MM-DD-change-id>/`. Lesson: <pointer to lessons.md if any, or `—`>.
