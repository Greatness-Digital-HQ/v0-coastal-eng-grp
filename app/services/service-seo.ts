import type { Metadata } from "next"

// NOTE: confirm the canonical production domain — using the email domain for now.
const SITE = "https://www.coastalengineeringgroup.com"
const ORG_ID = `${SITE}/#organization`
const ORG_NAME = "Coastal Engineering Group"
const PHONE = "+1-845-328-3178"

// Mirrors LICENSED_STATES in /public/ceg/data.jsx — used for schema areaServed.
// Keep the two lists in sync. (Count pending client confirmation: 12 vs 13 / Ohio.)
const STATES = [
  "Maine", "New York", "Connecticut", "New Jersey", "Pennsylvania", "Delaware",
  "Maryland", "Virginia", "North Carolina", "South Carolina", "Georgia", "Florida", "Ohio",
]

type ServiceSeo = {
  slug: string
  name: string
  serviceType: string
  metaTitle: string
  metaDescription: string
  schemaDescription: string
}

export const SERVICE_SEO: Record<string, ServiceSeo> = {
  construction: {
    slug: "construction",
    name: "Marine Construction",
    serviceType: "Marine Construction",
    metaTitle: "Marine Construction Contractor | Eastern U.S. | Coastal Engineering Group",
    metaDescription:
      "Marine construction, waterfront rehabilitation, pile and concrete repair, bulkheads, outfalls, intakes, scour protection and emergency marine work.",
    schemaDescription:
      "Construction, rehabilitation, and repair of waterfront and submerged infrastructure — piers, docks and wharves; bulkheads, sheet-pile structures, fender and mooring systems; timber, steel, concrete and composite pile installation and repair; concrete and structural steel rehabilitation above and below water; cofferdams and engineered temporary works; outfalls, intakes and utility crossings; scour and shoreline protection; dam, lock and navigation infrastructure; and emergency marine repair throughout the Eastern United States.",
  },
  engineering: {
    slug: "engineering",
    name: "Marine Engineering & Inspection",
    serviceType: "Marine Engineering and Underwater Inspection",
    metaTitle: "Marine Engineering & Underwater Inspection | Coastal Engineering Group",
    metaDescription:
      "Waterfront engineering, underwater and structural inspection, condition assessment, repair design, construction engineering and QA/QC support.",
    schemaDescription:
      "Waterfront structural engineering and rehabilitation design, underwater inspection and condition assessment, bridge, pier, bulkhead, pile, dam, intake and outfall inspection, repair recommendations and specifications, construction engineering and engineered temporary works, construction management and USACE CQM support, and hydrographic, sonar and NDT data integration throughout the Eastern United States.",
  },
  dredging: {
    slug: "dredging",
    name: "Dredging",
    serviceType: "Dredging",
    metaTitle: "Dredging Contractor | Channels & Sediment | Coastal Engineering Group",
    metaDescription:
      "Mechanical and hydraulic dredging, sediment management, dewatering, handling, disposal coordination, bathymetric support and waterway maintenance.",
    schemaDescription:
      "Mechanical and hydraulic dredging for channels, basins, lagoons, waterfront facilities and environmental applications — maintenance and capital dredging, environmental and residuals dredging, sediment handling, separation and dewatering, barge, truck, pipeline and disposal coordination, debris and obstruction removal, bathymetric survey coordination and quantity tracking, and turbidity, containment and water-treatment controls throughout the Eastern United States.",
  },
  "marine-services": {
    slug: "marine-services",
    name: "Fleet & Marine Support",
    serviceType: "Marine Equipment and Logistics Support",
    metaTitle: "Fleet & Marine Support | Workboats, Barges & Equipment | Coastal",
    metaDescription:
      "Workboats, barges, cranes, marine logistics, crew support, equipment mobilization and specialty support for waterfront construction and diving projects.",
    schemaDescription:
      "Marine equipment and logistics support for construction, dredging, inspection and commercial diving — workboats and crew transport, material, equipment and crane barges, lifting, rigging and placement support, diving platforms, survey, inspection and ROV support, towing and repositioning coordination, temporary access and floating work platforms, and emergency mobilization throughout the Eastern United States.",
  },
  diving: {
    slug: "diving",
    name: "Commercial Diving & Underwater Construction",
    serviceType: "Commercial Diving and Underwater Construction",
    metaTitle: "Commercial Diving & Underwater Construction | Coastal Engineering",
    metaDescription:
      "Surface-supplied commercial diving for underwater construction, inspection, repair, welding, concrete work, NDT support, dams, intakes and outfalls.",
    schemaDescription:
      "Surface-supplied commercial diving for underwater construction and structural repair, underwater inspection and condition documentation, welding, burning, cutting, drilling and installation, concrete placement, formwork, pile repair and jacket installation, dam, lock, gate, bulkhead, intake, outfall and pipeline work, NDT and ultrasonic thickness support, and debris removal, salvage and emergency response throughout the Eastern United States.",
  },
}

export function serviceMetadata(key: string): Metadata {
  const s = SERVICE_SEO[key]
  if (!s) return {}
  const url = `${SITE}/services/${s.slug}`
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: s.metaTitle,
      description: s.metaDescription,
      url,
      siteName: ORG_NAME,
      type: "website",
    },
  }
}

export function serviceJsonLd(key: string): object | null {
  const s = SERVICE_SEO[key]
  if (!s) return null
  const url = `${SITE}/services/${s.slug}`
  const areaServed = STATES.map((name) => ({ "@type": "State", name }))
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: ORG_NAME,
        url: SITE,
        telephone: PHONE,
        areaServed,
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: s.name,
        serviceType: s.serviceType,
        description: s.schemaDescription,
        url,
        provider: { "@id": ORG_ID },
        areaServed,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: s.name, item: url },
        ],
      },
    ],
  }
}
