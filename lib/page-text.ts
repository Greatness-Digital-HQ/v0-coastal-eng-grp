import { z } from "zod"

// Editable page text (dashboard: Pages → Edit page text). Stored as one
// settings row, `page_text`. The defaults mirror the copy built into
// public/ceg (components.jsx HeroStats and the intro, data.jsx STATS, CERTS,
// CLIENTS, CAREERS, CONTACT.hours), which the site falls back to when a
// section has never been saved.

const s = (max: number) => z.string().trim().max(max)

export const PageText = z.object({
  home: z.object({
    heroLine1: s(80),
    heroLine2: s(120),
    /** A word or phrase in line 2 shown in italics. */
    heroEmphasis: s(40),
    heroLede: s(400),
    heroButton: s(40),
    introHeading: s(120),
    introParagraphs: z.array(s(1200)).max(4),
  }),
  stats: z.array(z.object({ value: s(40), label: s(60) })).max(6),
  certs: z.array(z.object({ abbr: s(20), full: s(80) })).max(12),
  clients: z.array(s(80)).max(24),
  careers: z.object({
    pitch: s(120),
    lede: s(900),
    benefits: z.array(z.object({ h: s(60), v: s(300) })).max(8),
  }),
  hours: s(80),
})
export type PageText = z.infer<typeof PageText>

export const PAGE_TEXT_DEFAULTS: PageText = {
  home: {
    heroLine1: "Marine Infrastructure.",
    heroLine2: "Engineered, Built, and Maintained.",
    heroEmphasis: "Engineered",
    heroLede:
      "Coastal Engineering Group self-performs marine construction, dredging, commercial diving, underwater inspection, and waterfront engineering throughout the Eastern United States.",
    heroButton: "Learn More",
    introHeading: "One Team Above and Below the Waterline.",
    introParagraphs: [
      "Marine infrastructure problems rarely fit within a single discipline. Coastal combines engineering judgment, specialty field crews, marine equipment, dredging capability, and commercial diving so clients can move from investigation to repair with fewer gaps between design and execution.",
      "Our teams work in active waterways, restricted-access facilities, industrial environments, transportation corridors, and federal installations where planning, documentation, safety, and constructability are essential.",
    ],
  },
  stats: [
    { value: "Veteran-Owned", label: "Small Business" },
    { value: "ADCI-Certified", label: "Commercial Diving Contractor" },
    { value: "Multi-State PE", label: "Professional Engineering Licensure" },
    { value: "Eastern U.S.", label: "Operations" },
  ],
  certs: [
    { abbr: "VOSB", full: "Veteran-Owned Small Business" },
    { abbr: "ADCI", full: "Association of Diving Contractors Intl." },
    { abbr: "SAM", full: "System for Award Management" },
    { abbr: "DBE", full: "Disadvantaged Business Enterprise" },
    { abbr: "ISO 9001", full: "Quality Management Certified" },
    { abbr: "OSHA 30", full: "Construction Safety Trained" },
  ],
  clients: ["NAVFAC", "U.S. Army Corps of Engineers", "U.S. Coast Guard", "Port Authority NY/NJ", "Maryland Port Admin.", "NJDOT", "DRJTBC", "Atlantic Shores OW", "Equinor"],
  careers: {
    pitch: "Build Your Career on the Water",
    lede: "Coastal Engineering Group is building a team for complex marine infrastructure work throughout the Eastern United States. We are looking for engineers, project managers, commercial divers, dredging professionals, operators, field leaders, and shared-services professionals who want meaningful responsibility and the opportunity to grow with the company.",
    benefits: [
      { h: "Health & wellness", v: "Medical, dental, vision · 100% employer-paid options for divers and field crew." },
      { h: "Financial", v: "401(k) with company match · paid life and disability insurance." },
      { h: "Time off", v: "Generous PTO scaling with tenure · paid holidays · per-diem on travel." },
      { h: "Development", v: "ADCI dive certifications · OSHA training paid · tuition support." },
    ],
  },
  hours: "Mon–Fri  7:00–17:00 ET",
}

/** Saved text over the defaults, section by section. */
export function withDefaults(saved: unknown): PageText {
  const v = (saved ?? {}) as Partial<PageText>
  return {
    home: { ...PAGE_TEXT_DEFAULTS.home, ...(v.home ?? {}) },
    stats: v.stats ?? PAGE_TEXT_DEFAULTS.stats,
    certs: v.certs ?? PAGE_TEXT_DEFAULTS.certs,
    clients: v.clients ?? PAGE_TEXT_DEFAULTS.clients,
    careers: { ...PAGE_TEXT_DEFAULTS.careers, ...(v.careers ?? {}) },
    hours: v.hours ?? PAGE_TEXT_DEFAULTS.hours,
  }
}
