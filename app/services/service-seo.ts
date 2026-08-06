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

type Faq = { q: string; a: string }

type ServiceSeo = {
  slug: string
  name: string
  serviceType: string
  metaTitle: string
  metaDescription: string
  schemaDescription: string
  faqs: Faq[]
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
    faqs: [
      { q: "What does a marine construction contractor do?", a: "A marine construction contractor builds, rehabilitates, and repairs structures over and below the waterline — piers, wharves, bulkheads, outfalls and intakes, scour protection, and submerged foundations. Coastal Engineering Group self-performs this work with its own crews, divers, and equipment, directed by licensed Professional Engineers." },
      { q: "What areas does Coastal Engineering Group serve?", a: "Coastal works federal, state, municipal, utility, transportation, and industrial waterfronts throughout the Eastern United States, with Professional Engineers licensed across multiple states." },
      { q: "Do you self-perform marine construction or subcontract it?", a: "We self-perform our core marine construction with our own crews, commercial divers, and equipment under one accountable team — reducing the handoffs and split accountability common to multi-prime delivery." },
      { q: "What types of marine structures do you build and repair?", a: "Piers, docks, wharves, and platforms; bulkheads, sheet-pile structures, fender and mooring systems; timber, steel, concrete, and composite piles; outfalls, intakes, and utility crossings; scour and shoreline protection; and dam, lock, and navigation infrastructure." },
      { q: "Can you support a prime contractor as a specialty marine subcontractor?", a: "Yes. Coastal frequently integrates underwater investigation, engineered temporary works, dredging, and specialty marine equipment into a prime contractor's work plan as a specialty marine subcontractor." },
    ],
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
    faqs: [
      { q: "What does a marine engineering firm do?", a: "A marine engineering firm designs and assesses waterfront and submerged structures — piers, wharves, bulkheads, seawalls, dams, intakes, and bridge substructures — and produces construction documents. Coastal pairs that design work with underwater inspection and in-house self-perform construction." },
      { q: "Are your engineering deliverables stamped?", a: "Stamped engineering drawings and calculations are provided where authorized, signed and sealed by licensed Professional Engineers. Licensure varies by discipline and responsible professional; contact Coastal for the current roster." },
      { q: "Can you both assess and repair a marine structure?", a: "Yes. Coastal can investigate the condition, develop the repair, and self-perform the work — a continuous chain of accountability from inspection through as-built documentation." },
      { q: "What inspection standards do you work to?", a: "Inspection scope and condition rating are set by the governing standard for the structure type and the owner's requirements. Coastal identifies the applicable standard during planning and documents findings so they remain traceable from field record to final report." },
      { q: "Do you support prime contractors during the bid phase?", a: "Yes. Coastal provides bid-phase constructability review, scope development, risk identification, and technical proposal support for pursuits involving marine and underwater work." },
    ],
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
    faqs: [
      { q: "What kinds of dredging does Coastal Engineering Group perform?", a: "Mechanical and hydraulic dredging for maintenance and capital work, environmental and residuals dredging, channels, slips, marinas, basins, lagoons and intake areas, and debris and obstruction removal — with the method matched to sediment, access, and the disposal pathway." },
      { q: "How do you protect water quality during dredging?", a: "Depending on permit conditions, Coastal integrates turbidity controls, containment, water-quality monitoring, dewatering, treatment, and disposal documentation directly into the dredging plan, with daily production reporting and survey reconciliation." },
      { q: "Why does the material pathway matter so much?", a: "Excavation is rarely what controls a dredging schedule. Transport, offloading, dewatering, water management, staging, and disposal capacity usually govern production, so Coastal plans the full pathway before mobilization rather than solving it in the field." },
      { q: "How are dredged quantities verified?", a: "Bathymetric pre- and post-survey coordination and quantity tracking reconcile in-place volumes against the design template and paid quantities throughout the project." },
      { q: "What areas does your dredging service cover?", a: "Federal, state, municipal, and industrial waterways throughout the Eastern United States." },
    ],
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
    faqs: [
      { q: "What marine support does Coastal provide?", a: "Workboats and crew transport, material and crane barges, lifting and rigging support, diving platforms, survey and ROV support, towing and repositioning coordination, temporary access platforms, and emergency mobilization." },
      { q: "Does Coastal own the equipment it provides?", a: "Marine assets are provided as Coastal-owned, leased, subcontracted, or partner-provided depending on the project. Coastal identifies the ownership and control status of each major asset during planning, along with its capacities and operating limitations." },
      { q: "Can a prime contractor use Coastal's marine support on its own project?", a: "Yes. Coastal can provide a complete support package or integrate selected assets and crews into a prime contractor's work plan as a specialty marine subcontractor." },
      { q: "How is marine equipment selected for a project?", a: "Selection is driven by access, draft, deck or payload capacity, lifting requirements, operating conditions, tides and access windows, and the construction sequence — coordinated with engineering, diving, dredging, and permit constraints." },
      { q: "Where does Coastal mobilize marine support?", a: "Throughout the Eastern United States, sequenced around port operations, marine traffic, and weather windows." },
    ],
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
    faqs: [
      { q: "What is surface-supplied commercial diving?", a: "Surface-supplied diving delivers breathing gas to the diver from the surface through an umbilical that also carries communications and, where required, hot water and video. It is the standard configuration for commercial underwater construction and inspection because it supports longer bottom times, direct topside communication, and a tended, task-specific work plan." },
      { q: "What underwater construction work can Coastal self-perform?", a: "Underwater structural repair, welding, burning, cutting, drilling, bolting and installation, concrete placement and formwork, pile repair and jacket installation, and dam, lock, gate, bulkhead, intake, outfall and pipeline work." },
      { q: "How is a dive operation planned?", a: "Every diving operation is supported by a task-specific dive plan, hazard analysis, equipment and personnel verification, emergency procedures, communications, and qualified supervision. Applicable ADCI, OSHA, USACE, owner, and project requirements are identified before mobilization." },
      { q: "Can Coastal document underwater conditions for an engineer?", a: "Yes. Coastal documents submerged conditions through video, photography, measurements, sketches, sonar, and NDT support under engineer direction, distinguishing observed conditions, measured data, limitations, urgent findings, and recommended follow-up." },
      { q: "Do you perform contaminated-water diving?", a: "Contaminated-water and other specialized diving is performed only when Coastal is properly equipped and qualified for the specific exposure. The hazard, decontamination approach, and equipment are identified during dive planning." },
    ],
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
      {
        "@type": "FAQPage",
        mainEntity: s.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  }
}
