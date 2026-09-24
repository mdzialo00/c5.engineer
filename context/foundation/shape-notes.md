---
project: "c5-engineer"
context_type: greenfield
product_type: web-app
target_scale:
  users: small
  qps: low
  data_volume: small
created: 2026-09-22
updated: 2026-09-25
timeline_budget:
  mvp_weeks: 1
  hard_deadline: null
  after_hours_only: true
checkpoint:
  current_phase: 9
  phases_completed: [1, 2, 3, 4, 5, 6, 7, 8]
  gray_areas_resolved:
    - topic: "pain category"
      decision: "missing capability + signaling/impression"
    - topic: "insight"
      decision: "the site is proof of skill, not just a claim"
    - topic: "primary persona scope"
      decision: "recruiters and hiring managers across many companies, not tied to one org"
    - topic: "style picker"
      decision: "design-exploration tool only, not a shipped feature; one style ships"
    - topic: "no-index guardrail"
      decision: "not recorded as a Success Criteria guardrail; captured as an NFR instead"
  frs_drafted: 9
  quality_check_status: warned
---

# Shape notes

## Seed idea

> I want to create simple, personal website, where I showcase my work experience and skills as a software engineer. Also some basics contact info plus links to github, linkedin and possibility to download my resume

## Vision & Problem Statement

Recruiters and hiring managers evaluating a software engineer candidate currently only see a PDF resume and a LinkedIn profile, sent right after a job application or referenced from the CV. Neither shows a working example of the candidate's skill, and neither is centralized: no single link ties together experience, skills, contact info, GitHub, and a downloadable resume.

A self-built site works as proof, not just a claim. A working, well-built site is itself evidence the candidate can build software, something a resume PDF or LinkedIn profile can't demonstrate on its own.

## User & Persona

**Primary persona**: Recruiter or hiring manager, external or in-house, evaluating the candidate at any company, not tied to one org. They reach the site right after receiving a job application, where it's linked in the application or the CV itself.

### Secondary persona

Technical reviewer a recruiter forwards the page to for a deeper technical read.

## Access Control

Public, read-only site. No accounts, no login, no roles. Anyone with the link can view all content.

## Success Criteria

### Primary
- A recruiter opens the link, sees name, title, contact info, and the GitHub / LinkedIn / Download CV links, then successfully reaches GitHub, LinkedIn, or downloads the CV as a PDF.

### Secondary
- None specified.

### Guardrails
- None specified.

## Functional Requirements

### CV content
- FR-001: Recruiter can view name, title, location, and contact info. Priority: must-have
  > Socrates: Counter-argument considered: "public email/phone invites scraping and spam; location adds no value in remote-first hiring." Resolution: kept as written.
- FR-002: Recruiter can view professional summary. Priority: must-have
  > Socrates: Counter-argument considered: "duplicates the CV PDF; recruiters skip summaries and scan for experience/skills first." Resolution: kept as written.
- FR-003: Recruiter can view work experience. Priority: must-have
  > Socrates: Counter-argument considered: "duplicates LinkedIn 1:1; a hardcoded section goes stale the moment the person changes roles." Resolution: kept as written.
- FR-004: Recruiter can view skills. Priority: must-have
  > Socrates: Counter-argument considered: "a flat list is as unverifiable as a resume bullet, and the site's own existence already proves the skills." Resolution: kept as written.
- FR-005: Recruiter can view education. Priority: must-have
  > Socrates: Counter-argument considered: "low signal for a working engineer; duplicates the CV PDF." Resolution: kept as written.
- FR-006: Recruiter can view hobbies. Priority: nice-to-have
  > Socrates: Counter-argument considered: "risks unconscious bias in screening and dilutes a proof-focused page." Resolution: kept as written.

### External links and CV download
- FR-007: Recruiter can click the GitHub link and reach the GitHub profile. Priority: must-have
  > Socrates: Counter-argument considered: "a thin GitHub profile could undercut the proof-of-skill pitch instead of supporting it." Resolution: kept as written.
- FR-008: Recruiter can click the LinkedIn link and reach the LinkedIn profile. Priority: must-have
  > Socrates: Counter-argument considered: "an outbound link near the top could pull the recruiter off-site before they see the experience/skills sections." Resolution: kept as written.
- FR-009: Recruiter can download the CV as a PDF file. Priority: must-have
  > Socrates: Counter-argument considered: "offering a static PDF alongside the living page partly reverts to the artifact the site was meant to replace." Resolution: kept as written.

## User Stories

### US-01: Recruiter reviews the CV and reaches GitHub, LinkedIn, or the CV download
Given a recruiter has received a link to the site (e.g. from a job application or a CV)
When they open the link
Then they see the candidate's name, title, contact info, and links to GitHub, LinkedIn, and Download CV
And when they click one of those links or buttons, they reach the destination (GitHub profile, LinkedIn profile) or download the CV as a PDF

## Business Logic

# TODO: domain rule, see Open Questions

## Non-Functional Requirements

- The site does not appear in search engine results for the candidate's name (no-index).
- The site is fully usable on mobile-sized screens: all content readable, all links and buttons reachable, no horizontal scrolling.
- A recruiter sees visible page content within 2 seconds of opening the link.

## Open Questions

1. **What is the one-sentence business rule?**: User confirmed no domain logic exists; this is a static, read-only CV site by design, not an oversight. Owner: user (resolved). Block: no.

## Non-Goals

- No CMS or admin panel to edit content. Content is hardcoded; changes require editing code and redeploying.
- No contact form. Contact is a direct mailto/tel link, no backend collecting submissions.
- No live style-switcher in the shipped product. The prototype's three visual directions were a design-exploration tool only; one style ships as the fixed look (decided during earlier shaping).

## Quality cross-check

- **Business Logic**: recorded as `# TODO: domain rule, see Open Questions`. No domain rule exists because this is a static, read-only CV site by deliberate choice, confirmed and resolved in Open Questions (not blocking). `/c5-prd` should mirror this into its own Open Questions, but it does not need to hold up the PRD.

## Forward: design assets

An existing Claude-artifact prototype (three visual directions: "Quiet", "Editorial", "Terminal") already covers the one-page layout and real content (name, title, location, contact, summary, experience, skills, education, hobbies). One style will be picked for the shipped site; the live style-switcher in the prototype is a design-exploration tool only, not a shipped feature.
Artifact link: https://claude.ai/artifact/Q3dWPxi83QcaEz9m3MBudP
