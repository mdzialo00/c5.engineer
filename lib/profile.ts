export const profile = {
  name: "Maciek Działo",
  title: "Software Engineer",
  location: "Kraków, Poland",
  email: "mdzialo05@gmail.com",
  phone: "+48 606-204-018",
  github: "https://github.com/mdzialo00",
  linkedin: "https://www.linkedin.com/in/mdzialo/",
  cv: "/Maciek-Dzialo-CV-English.pdf",
  cvDownloadName: "Maciek Działo CV English.pdf",
  summary:
    "Software engineer with 5+ years of experience building scalable web applications with React, Next.js, TypeScript, and Node.js. Currently driving development on My Tesco, an internal platform used by ~1 million employees worldwide, within a micro-frontend architecture. Own end-to-end delivery of complex features, make independent architecture and implementation decisions, and mentor engineers joining the team.",
  experience: [
    {
      role: "Software engineer",
      company: "Tesco Technology",
      period: "12.2023 - Present",
      highlights: [
        "Own end-to-end delivery of key parts of the Digital Sickness Absence workflow (Phase 2 & 3) within the absence management domain.",
        "Design and build complex, production-grade forms and workflows (React Hook Form, Zod) across micro-frontends and API layers (React, TypeScript, Node.js, Express).",
        "Make independent architecture and API design decisions for the features I own, consulting backend and cross-functional teams where needed.",
        "Contribute to shared platform libraries and the internal design system, used by ~250 engineers across 20-30 projects.",
        "Onboard and mentor new engineers joining the team; several are now full members of the organization.",
        "Support production systems on an on-call rotation (incident handling, Splunk-based debugging)",
        "Take part in Tesco's discovery centre, interviewing and evaluating early-career candidates for internship and full-time roles.",
      ],
    },
    {
      role: "Front-end developer",
      company: "Forte Digital",
      period: "07.2021 - 12.2023",
      highlights: [
        "Built user-facing features and application logic for two web-based e-learning platforms (education and healthcare domains) serving the Norwegian market, using React and TypeScript.",
        "Designed and implemented content structures and custom content models in Sanity CMS, enabling non-technical editors to manage platform content independently.",
        "Built and maintained a reusable component library aligned with product-specific design systems, improving consistency across both platforms.",
        "Integrated frontend applications with a C#-based REST API, working directly with backend engineers on contract design.",
        "Owned UI quality and consistency using Storybook and Chromatic, catching visual regressions before release.",
        "Worked directly with the client on planning, demos and requirements gathering in an international, English-speaking environment.",
      ],
    },
  ],
} as const;
