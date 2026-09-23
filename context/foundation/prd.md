---
project: "# TODO: project, see Open Questions"
version: 1
status: draft
created: 2026-09-22
context_type: greenfield
product_type: "# TODO: product_type, see Open Questions"
target_scale: "# TODO: target_scale, see Open Questions"
timeline_budget:
  mvp_weeks: 1
  hard_deadline: null
  after_hours_only: null
---

# PRD

## Vision & Problem Statement

Recruiters and hiring managers evaluating a software engineer candidate currently only see a PDF resume and a LinkedIn profile, sent right after a job application or referenced from the CV. Neither shows a working example of the candidate's skill, and neither is centralized: no single link ties together experience, skills, contact info, GitHub, and a downloadable resume.

A self-built site works as proof, not just a claim. A working, well-built site is itself evidence the candidate can build software, something a resume PDF or LinkedIn profile can't demonstrate on its own.

## User & Persona

**Primary persona**: Recruiter or hiring manager, external or in-house, evaluating the candidate at any company, not tied to one org. They reach the site right after receiving a job application, where it's linked in the application or the CV itself.

### Secondary persona

Technical reviewer a recruiter forwards the page to for a deeper technical read.

## Success Criteria

### Primary
- A recruiter opens the link, sees name, title, contact info, and the GitHub / LinkedIn / Download CV links, then successfully reaches GitHub, LinkedIn, or downloads the CV as a PDF.

### Secondary
- None specified.

### Guardrails
- None specified.

## User Stories

# TODO: User Stories, see Open Questions

## Functional Requirements

# TODO: Functional Requirements, see Open Questions

## Non-Functional Requirements

# TODO: Non-Functional Requirements, see Open Questions

(Shaping resolved that a no-index guardrail should exist as an NFR rather than a Success Criteria guardrail, but the measurable NFR itself was never drafted; see Open Questions.)

## Business Logic

# TODO: domain rule, see Open Questions

## Access Control

Public, read-only site. No accounts, no login, no roles. Anyone with the link can view all content.

## Non-Goals

- The live style-switcher (three visual directions explored during shaping) is a design-exploration tool only; it does not ship. One style is chosen and shipped as the site's fixed look.

# TODO: remaining Non-Goals, see Open Questions

## Open Questions

1. **What is the project's name?**: TBD by user. Block: no (frontmatter needs a value before this PRD is review-ready).
2. **What is the product type?**: TBD by user. Block: no.
3. **What is the target scale (users, qps, data volume)?**: TBD by user. Block: no.
4. **What are the User Stories (Given/When/Then) for this site?**: TBD by user, resume `/c5-shape` at phase 4+. Block: yes (PRD has no acceptance criteria until resolved).
5. **What are the Functional Requirements (FR-NNN)?**: TBD by user, resume `/c5-shape` at phase 4. Block: yes.
6. **What is the one-sentence business rule?**: TBD by user. Block: yes (PRD is hollow until resolved).
7. **What is the no-index NFR's measurable target?**: Shaping decided this belongs in Non-Functional Requirements, not Success Criteria guardrails, but never drafted the actual NFR text. Owner: user.
8. **What Non-Goals exist beyond the style-picker exclusion?**: TBD by user.
