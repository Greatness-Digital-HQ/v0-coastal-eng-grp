import type { Metadata } from "next"

// Sitewide SEO constants and per-route metadata.
//
// Titles and descriptions follow the client edit package (Section 19-A: every
// page has one unique, descriptive title and one unique meta description).
//
// NOTE: confirm the canonical production domain before launch — the v0/Vercel
// preview host must never be canonical (Section 19-A).
export const SITE = "https://www.coastalengineeringgroup.com"
export const ORG_ID = `${SITE}/#organization`
export const ORG_NAME = "Coastal Engineering Group"
export const PHONE = "+1-845-328-3178"

type PageSeo = { title: string; description: string; path: string }

export const PAGE_SEO = {
  home: {
    title: "Coastal Engineering Group | Marine Construction, Dredging & Engineering",
    description:
      "Marine construction, dredging, commercial diving, underwater inspection and waterfront engineering throughout the Eastern United States.",
    path: "/",
  },
  about: {
    title: "About Coastal Engineering Group | Marine Infrastructure Contractor",
    description:
      "Veteran-owned marine infrastructure contractor and engineering firm integrating marine construction, dredging, commercial diving, underwater inspection and waterfront engineering across the Eastern United States.",
    path: "/about",
  },
  services: {
    title: "Marine Construction, Engineering & Diving Services | Coastal Engineering Group",
    description:
      "Marine construction, engineering & inspection, dredging, commercial diving and fleet & marine support — five self-performed divisions delivered by one accountable team.",
    path: "/services",
  },
  safetyQuality: {
    title: "Marine Construction Safety & Quality | Coastal Engineering Group",
    description:
      "Marine, diving and construction safety planning, quality control, documentation, training and project-specific compliance for complex waterfront work.",
    path: "/safety-quality",
  },
  federal: {
    title: "Federal Marine Contractor & Engineering Firm | Coastal Engineering Group",
    description:
      "Veteran-owned marine construction, dredging, commercial diving, underwater inspection and engineering support for federal agencies and prime contractors.",
    path: "/markets/federal",
  },
  projects: {
    title: "Marine Construction, Dredging & Diving Projects | Coastal",
    description:
      "Selected marine infrastructure projects in construction, dredging, engineering, underwater inspection and commercial diving throughout the Eastern U.S.",
    path: "/projects/featured-work",
  },
  careers: {
    title: "Marine Construction, Engineering & Diving Careers | Coastal",
    description:
      "Explore careers in marine construction, engineering, dredging, commercial diving, project management and shared services with Coastal Engineering Group.",
    path: "/careers",
  },
  news: {
    title: "Marine Infrastructure News & Insights | Coastal Engineering Group",
    description:
      "Project news, company updates and technical insights on marine construction, dredging, underwater inspection, engineering and commercial diving.",
    path: "/insights/news",
  },
  contact: {
    title: "Contact Coastal Engineering Group | Discuss a Marine Project",
    description:
      "Contact Coastal Engineering Group regarding marine construction, dredging, engineering, commercial diving, teaming, emergency response or careers.",
    path: "/contact",
  },
} satisfies Record<string, PageSeo>

export function pageMetadata(key: keyof typeof PAGE_SEO): Metadata {
  const p = PAGE_SEO[key]
  const url = `${SITE}${p.path}`
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: {
      title: p.title,
      description: p.description,
      url,
      siteName: ORG_NAME,
      type: "website",
    },
  }
}

/** Metadata for a detail page built from content data rather than a fixed map. */
export function detailMetadata(opts: {
  title: string
  description: string
  path: string
  type?: "article" | "website"
}): Metadata {
  const url = `${SITE}${opts.path}`
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: ORG_NAME,
      type: opts.type ?? "website",
    },
  }
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE}${t.path}`,
    })),
  }
}

export function organizationJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: ORG_NAME,
    url: SITE,
    telephone: PHONE,
    description: PAGE_SEO.home.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: "2 Seneca Hill",
      addressLocality: "Greenwood Lake",
      addressRegion: "NY",
      postalCode: "10925",
      addressCountry: "US",
    },
  }
}
