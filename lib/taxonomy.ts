// The fixed lists the dashboard offers. They mirror public/ceg/data.jsx
// (MARKETS, DIVISIONS) and news-archive-app.jsx (FILTER_LABELS), which define
// the site's pages and filters: change them there and here together.

export const MARKETS = [
  { key: "federal", name: "Federal & Defense" },
  { key: "transportation", name: "Bridges & Transportation" },
  { key: "ports", name: "Ports, Harbors & Waterfronts" },
  { key: "water", name: "Water & Wastewater" },
  { key: "dams", name: "Dams & Water Resources" },
  { key: "energy-industrial", name: "Energy & Industrial" },
] as const

/** `tag` is the short label the homepage project cards show for a project's first service. */
export const SERVICES = [
  { key: "construction", name: "Marine Construction", tag: "Construction" },
  { key: "engineering", name: "Marine Engineering & Inspection", tag: "Engineering" },
  { key: "dredging", name: "Dredging", tag: "Dredging" },
  { key: "diving", name: "Commercial Diving & Underwater Construction", tag: "Diving" },
  { key: "marine-services", name: "Fleet & Marine Support", tag: "Marine Services" },
] as const

export const NEWS_CATEGORIES = ["Press Release", "News", "Industry Insight", "Project Update"] as const

export const DIVISION_LABELS = ["Construction", "Engineering", "Dredging", "Diving", "Marine Services", "Corporate"] as const

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD",
  "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "PR", "GU", "VI",
] as const

export function marketName(key: string): string {
  return MARKETS.find((m) => m.key === key)?.name ?? key
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
