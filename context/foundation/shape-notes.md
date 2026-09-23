---
project: null
context_type: greenfield
created: 2026-09-22
updated: 2026-09-22
timeline_budget:
  mvp_weeks: 1
  hard_deadline: null
  after_hours_only: null
checkpoint:
  current_phase: 4
  phases_completed: [1, 2, 3]
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
  frs_drafted: 0
  quality_check_status: pending
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

## Forward: design assets

An existing Claude-artifact prototype (three visual directions: "Quiet", "Editorial", "Terminal") already covers the one-page layout and real content (name, title, location, contact, summary, experience, skills, education, hobbies). One style will be picked for the shipped site; the live style-switcher in the prototype is a design-exploration tool only, not a shipped feature.
Artifact link: https://claude.ai/artifact/Q3dWPxi83QcaEz9m3MBudP
