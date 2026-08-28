// CEG — Shared Services template. One data-driven page that renders any of the
// non-diving service divisions (construction, engineering, dredging, marine
// services) from SERVICE_PAGES, reusing the fed-*/div-* styling established by
// the Commercial Diving page so all service pages share one visual language.
//
// The active service is chosen by window.__CEG_SERVICE, set by each route
// (app/services/<key>/page.tsx) before this file runs — the same pattern the
// project-detail page uses with window.__CEG_SLUG.
//
// Per Kevin's review against the Ballard reference pages: these pages carried
// too much — a "Why/The Difference" section and two "narrative" prose bands
// that mostly restated the Overview, plus a full Professional-Engineering
// state grid — on top of an already-solid Overview, capability grid, and
// project gallery. Cut to match Ballard's lean shape (hero, short overview,
// capabilities, projects, then Full Services List) while keeping certs and
// FAQ, which Kevin specifically wanted kept. One genuinely useful, non-
// redundant bit from the old narratives per division (a deliverables list,
// a method comparison, an asset-disclosure note) now lives as a compact
// addendum inside Overview itself instead of its own section.

const { useState: useSS, useEffect: useSE, useRef: useSR } = React;

// Reusable line-icon paths (Heroicons-style, stroked).
const ICON = {
  structure:  "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  layers:     "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  grid:       "M3 10h18M3 14h18M10 3v18M14 3v18",
  doc:        "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  wrench:     "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z",
  waves:      "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M3 12h.01M3 8h.01M3 16h.01",
  anchor:     "M12 8a2 2 0 100-4 2 2 0 000 4zm0 0v13m0 0a8 8 0 01-8-8h2m6 8a8 8 0 008-8h-2",
  truck:      "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1",
  bolt:       "M13 10V3L4 14h7v7l9-11h-7z",
  shield:     "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  map:        "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  beaker:     "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
  ship:       "M3 13l1.5 5.5a2 2 0 001.92 1.5h11.16a2 2 0 001.92-1.5L21 13M3 13l9-4 9 4M3 13h18M12 3v6",
};

// ─── Page content ──────────────────────────────────────────────────────────
// Copy per the client edit package, sections 09–13. Editorial rules applied
// throughout: no exact PE state count until the license roster is verified,
// no "100% Safety Record", and no asset-ownership claim that Coastal has not
// confirmed (see the Fleet & Marine Support disclosure note).
const SERVICE_PAGES = {
  construction: {
    page: "construction",
    heroImg: "/assets/marine-construction.jpg",
    eyebrow: "Marine Construction",
    h1: ["Marine Construction and", "Waterfront Rehabilitation."],
    lede: "Coastal Engineering Group performs construction, rehabilitation, and repair work on waterfront and submerged infrastructure throughout the Eastern United States. Our project teams combine marine access, commercial diving, engineering support, equipment coordination, and disciplined project controls for work that cannot be executed effectively from land alone.",
    heroCta: "Discuss a Project →",
    stats: [
      { value: "Self-Performed", sub: "Field crews, divers, operators, and marine equipment under one team" },
      { value: "Engineering-Led", sub: "Constructability and field conditions addressed before work begins" },
      { value: "Eastern U.S.", sub: "Operations throughout the Eastern United States" },
    ],
    servicesHead: { h2: "Marine Construction Capabilities", sub: "Hover any capability to see typical scope and applications." },
    services: [
      { title: "Piers, Docks & Wharves", desc: "Waterfront facilities", icon: ICON.grid, tooltip: "Construction and rehabilitation of piers, docks, wharves, platforms, and waterfront facilities — deck framing, pile caps, fender systems, and utility supports for commercial, municipal, and federal berthing." },
      { title: "Bulkheads & Sheet Pile", desc: "Fender & mooring systems", icon: ICON.layers, tooltip: "Bulkheads, sheet-pile structures, fender systems, and mooring systems. Tieback installation, cap construction, and shoreline stabilization for new and replacement work." },
      { title: "Pile Installation & Repair", desc: "Timber, steel, concrete, composite", icon: ICON.structure, tooltip: "Timber, steel, concrete, and composite pile installation and repair — driving, splicing, jacketing, and structural restoration of load-bearing marine foundations." },
      { title: "Concrete & Steel Rehab", desc: "Above and below water", icon: ICON.wrench, tooltip: "Concrete and structural steel rehabilitation above and below the waterline — spall repair, section replacement, tremie placement, welding, and coating." },
      { title: "Cofferdams & Temporary Works", desc: "Dewatering & access", icon: ICON.shield, tooltip: "Cofferdams, dewatering, engineered temporary works, and access systems that create controlled conditions for below-waterline construction and repair." },
      { title: "Outfalls, Intakes & Crossings", desc: "Pipelines & diffusers", icon: ICON.waves, tooltip: "Outfalls, intakes, pipelines, diffusers, and utility crossings — installation, replacement, and rehabilitation in active waterways and at operating facilities." },
      { title: "Scour & Shoreline Protection", desc: "Riprap & stabilization", icon: ICON.map, tooltip: "Scour repair, riprap placement, shoreline stabilization, and erosion protection to preserve the capacity and service life of submerged foundations." },
      { title: "Dam, Lock & Navigation Work", desc: "Gates & bulkheads", icon: ICON.beaker, tooltip: "Dam, lock, gate, bulkhead, and navigation infrastructure work — including repairs performed under differential-pressure and restricted-access conditions." },
      { title: "Demolition & Emergency Repair", desc: "Debris, salvage, response", icon: ICON.bolt, tooltip: "Demolition, debris removal, salvage, and emergency marine repairs where damage assessment and time-sensitive mobilization are required." },
    ],
    certs: ["VOSB", "USACE CQM", "EM 385-1-1", "OSHA 10/30", "ADCI", "AWS Welding", "PE-Stamped"],
    projectSlugs: ["mayport-naval-station-wharf-repair", "port-newark-container-terminal", "greenwood-lake-dam-rehabilitation"],
    projectsHead: { eyebrow: "Projects", h2: "Related Marine Construction Projects" },
    intro: {
      eyebrow: "Overview",
      h2: "Construction and Repair of Waterfront Infrastructure",
      body: [
        "Coastal Engineering Group is a veteran-owned marine infrastructure contractor working the waterfronts of the Eastern United States. We build, rehabilitate, and repair the structures that keep ports, crossings, utilities, and industrial facilities in service — piers and wharves, bulkheads and seawalls, outfalls and intakes, and submerged foundations.",
        "What sets our marine construction apart is integration. Field crews work alongside licensed Professional Engineers and commercial divers, and we self-perform the core work rather than subcontracting it out. Design intent carries straight through to the field, and one accountable team owns the project from planning to closeout.",
      ],
    },
    faqs: [
      { q: "What does a marine construction contractor do?", a: "A marine construction contractor builds, rehabilitates, and repairs structures over and below the waterline — piers, wharves, bulkheads, outfalls and intakes, scour protection, and submerged foundations. Coastal Engineering Group self-performs this work with its own crews, divers, and equipment, directed by licensed Professional Engineers." },
      { q: "What areas does Coastal Engineering Group serve?", a: "Coastal works federal, state, municipal, utility, transportation, and industrial waterfronts throughout the Eastern United States, with Professional Engineers licensed across multiple states." },
      { q: "Do you self-perform marine construction or subcontract it?", a: "We self-perform our core marine construction with our own crews, commercial divers, and equipment under one accountable team — reducing the handoffs and split accountability common to multi-prime delivery." },
      { q: "What types of marine structures do you build and repair?", a: "Piers, docks, wharves, and platforms; bulkheads, sheet-pile structures, fender and mooring systems; timber, steel, concrete, and composite piles; outfalls, intakes, and utility crossings; scour and shoreline protection; and dam, lock, and navigation infrastructure." },
      { q: "Can you support a prime contractor as a specialty marine subcontractor?", a: "Yes. Coastal frequently integrates underwater investigation, engineered temporary works, dredging, and specialty marine equipment into a prime contractor's work plan as a specialty marine subcontractor." },
    ],
    cta: {
      h2: "Planning a waterfront repair or marine construction project?",
      lede: "Engage Coastal early for access planning, constructability, underwater verification, specialty pricing, and execution strategy.",
      btn: "Discuss a Construction Project",
      trust: ["Veteran-Owned Small Business", "ADCI-Certified", "Multi-State PE Licensure", "Eastern U.S. Operations"],
    },
  },

  engineering: {
    page: "engineering",
    heroImg: "/assets/marine-engineering.jpg",
    eyebrow: "Marine Engineering & Inspection",
    h1: ["Engineering Informed", "by Field Conditions."],
    lede: "Coastal Engineering Group provides marine engineering, underwater inspection, condition assessment, repair development, and construction support for bridges, waterfront structures, dams, utilities, industrial facilities, and submerged infrastructure. Our engineering teams work closely with field personnel so recommendations reflect actual access, equipment, sequencing, and constructability.",
    heroCta: "Discuss a Project →",
    stats: [
      { value: "Multi-State PE", sub: "Professional Engineering licensure across the Eastern United States" },
      { value: "Field-Verified", sub: "Inspection and analysis grounded in observed conditions" },
      { value: "Design to Build", sub: "Engineering paired with self-performed construction" },
    ],
    servicesHead: { h2: "Marine Engineering & Inspection Capabilities", sub: "Hover any capability to see typical scope and applications." },
    services: [
      { title: "Waterfront Structural Engineering", desc: "Rehabilitation design", icon: ICON.doc, tooltip: "Structural engineering and rehabilitation design for piers, wharves, bulkheads, seawalls, and submerged foundations — load analysis, material selection, and construction documents ready for procurement." },
      { title: "Underwater Inspection", desc: "Condition assessment", icon: ICON.map, tooltip: "Underwater inspection and condition assessment combining topside survey with diver-performed examination. Defect mapping, condition ratings, and prioritized findings traceable from field record to final report." },
      { title: "Structure-Specific Inspection", desc: "Bridges, dams, intakes", icon: ICON.grid, tooltip: "Bridge, pier, bulkhead, pile, dam, intake, and outfall inspection scoped to the structure type, the governing standard, and the owner's decision-making needs." },
      { title: "Repair Development", desc: "Plans, specs, cost support", icon: ICON.wrench, tooltip: "Repair recommendations, plans, specifications, and cost support developed against observed conditions rather than record drawings alone." },
      { title: "Construction Engineering", desc: "Engineered temporary works", icon: ICON.shield, tooltip: "Construction engineering and engineered temporary works — cofferdams, shoring, access systems, and load paths verified for the means and methods actually planned." },
      { title: "Means & Methods Support", desc: "Access, rigging, lifting", icon: ICON.anchor, tooltip: "Cofferdam, access, rigging, lifting, and marine means-and-methods support developed with the crews and equipment that will perform the work." },
      { title: "Construction Management & QA/QC", desc: "USACE CQM support", icon: ICON.layers, tooltip: "Construction management, quality control, and USACE Construction Quality Management support — inspection points, submittals, hold points, and acceptance documentation." },
      { title: "Specialty Data Integration", desc: "Hydrographic, sonar, NDT", icon: ICON.beaker, tooltip: "Hydrographic, sonar, NDT, and specialty data integration where applicable, indexed to structure and elevation so findings remain traceable." },
      { title: "Bid-Phase Support", desc: "Constructability review", icon: ICON.bolt, tooltip: "Bid-phase constructability and technical proposal support — scope development, risk identification, and execution strategy for pursuits." },
    ],
    certs: ["VOSB", "Multi-State PE", "USACE CQM", "NBIS", "ASCE", "ASDSO", "QA/QC"],
    projectSlugs: ["port-newark-container-terminal", "greenwood-lake-dam-rehabilitation", "delaware-river-bridge-inspection"],
    projectsHead: { eyebrow: "Projects", h2: "Related Engineering & Inspection Projects" },
    intro: {
      eyebrow: "Overview",
      h2: "Engineering Grounded in Observed Conditions",
      body: [
        "Coastal Engineering Group provides marine engineering, underwater inspection, and repair development for bridges, waterfront structures, dams, utilities, industrial facilities, and submerged infrastructure throughout the Eastern United States.",
        "Because our engineers work alongside the crews and divers who execute the work, our recommendations reflect actual access, equipment, sequencing, and constructability. From underwater condition assessment through stamped construction documents, we deliver design grounded in field reality and ready to procure.",
      ],
      extra: {
        label: "Typical Deliverables",
        items: [
          "Stamped engineering drawings and calculations where authorized",
          "Underwater inspection reports and condition ratings",
          "Photographic, video, sonar, and measurement records",
          "Repair concepts and prioritized recommendations",
          "Technical specifications and bid documents",
          "Construction submittals, temporary-works packages, and work plans",
          "Quality-control documentation and as-built records",
        ],
      },
    },
    faqs: [
      { q: "What does a marine engineering firm do?", a: "A marine engineering firm designs and assesses waterfront and submerged structures — piers, wharves, bulkheads, seawalls, dams, intakes, and bridge substructures — and produces construction documents. Coastal pairs that design work with underwater inspection and in-house self-perform construction." },
      { q: "Are your engineering deliverables stamped?", a: "Stamped engineering drawings and calculations are provided where authorized, signed and sealed by licensed Professional Engineers. Licensure varies by discipline and responsible professional; contact Coastal for the current roster." },
      { q: "Can you both assess and repair a marine structure?", a: "Yes. Coastal can investigate the condition, develop the repair, and self-perform the work — a continuous chain of accountability from inspection through as-built documentation." },
      { q: "What inspection standards do you work to?", a: "Inspection scope and condition rating are set by the governing standard for the structure type and the owner's requirements. Coastal identifies the applicable standard during planning and documents findings so they remain traceable from field record to final report." },
      { q: "Do you support prime contractors during the bid phase?", a: "Yes. Coastal provides bid-phase constructability review, scope development, risk identification, and technical proposal support for pursuits involving marine and underwater work." },
    ],
    cta: {
      h2: "Need to understand a submerged condition or develop a practical repair?",
      lede: "Coastal can investigate the structure, analyze what the field record shows, and develop a repair that can actually be installed.",
      btn: "Discuss an Engineering or Inspection Need",
      trust: ["Veteran-Owned Small Business", "Multi-State PE Licensure", "ADCI-Certified", "Eastern U.S. Operations"],
    },
  },

  dredging: {
    page: "dredging",
    heroImg: "/assets/dredging.jpg",
    eyebrow: "Dredging",
    h1: ["Dredging, Sediment Management,", "and Waterway Maintenance."],
    lede: "Coastal Engineering Group performs mechanical and hydraulic dredging for channels, basins, lagoons, waterfront facilities, waterways, and environmental applications. We plan the work around production, access, sediment characteristics, water management, dewatering, transportation, disposal, environmental controls, and the operational needs of the facility.",
    heroCta: "Discuss a Project →",
    stats: [
      { value: "Mechanical & Hydraulic", sub: "Method matched to sediment, access, and disposal pathway" },
      { value: "Full Material Pathway", sub: "Excavation through dewatering, transport, and disposal" },
      { value: "Documented Production", sub: "Survey reconciliation and daily production reporting" },
    ],
    servicesHead: { h2: "Dredging Capabilities", sub: "Hover any capability to see typical scope and applications." },
    services: [
      { title: "Mechanical Dredging", desc: "Precise, debris-tolerant", icon: ICON.wrench, tooltip: "Excavator, crane, and bucket dredging with barge or scow transport — suited to precise excavation, debris handling, confined access, and controlled removal." },
      { title: "Hydraulic Dredging", desc: "Pipeline transport", icon: ICON.waves, tooltip: "Cutterhead and pump dredging with pipeline transport to a dewatering or disposal area, including booster, return-water, and production controls where the capability applies." },
      { title: "Maintenance & Capital Dredging", desc: "Depth restoration & new cut", icon: ICON.layers, tooltip: "Restoration of authorized depths and new-depth or widening work, with hydrographic pre- and post-survey documenting quantities against the design template." },
      { title: "Environmental & Residuals", desc: "Contaminated sediment", icon: ICON.shield, tooltip: "Precision removal of contaminated sediment and residuals with containment, turbidity control, dewatering, and coordinated disposal to permitted facilities." },
      { title: "Channels, Basins & Intakes", desc: "Slips, marinas, lagoons", icon: ICON.map, tooltip: "Dredging of channels, slips, marinas, basins, lagoons, and intake areas where facility operations, vessel traffic, or access windows constrain the work." },
      { title: "Handling & Dewatering", desc: "Separation & water management", icon: ICON.beaker, tooltip: "Sediment handling, separation, and dewatering — including staging, water management, and treatment where discharge requirements apply." },
      { title: "Transport & Disposal", desc: "Barge, truck, pipeline", icon: ICON.truck, tooltip: "Barge, truck, pipeline, and disposal coordination, including material characterization and disposal documentation required by the permit." },
      { title: "Debris & Obstruction Removal", desc: "Diver-assisted recovery", icon: ICON.anchor, tooltip: "Removal of submerged debris and obstructions from channels and berths, with diver-assisted rigging and crane recovery where required." },
      { title: "Survey & Quantity Tracking", desc: "Bathymetric coordination", icon: ICON.grid, tooltip: "Bathymetric survey coordination and quantity tracking, reconciling in-place volumes against paid quantities throughout the project." },
      { title: "Environmental Controls", desc: "Turbidity & containment", icon: ICON.bolt, tooltip: "Turbidity monitoring, containment, water treatment, and water-quality documentation integrated into the dredging plan as the permit requires." },
    ],
    certs: ["VOSB", "USACE", "EM 385-1-1", "OSHA 10/30", "Environmental Compliance", "Hydrographic Survey"],
    projectSlugs: ["freshwater-utility-cable-relocation", "greenwood-lake-dam-rehabilitation", "atlantic-shores-offshore-wind"],
    projectsHead: { eyebrow: "Projects", h2: "Representative Dredging Projects" },
    intro: {
      eyebrow: "Overview",
      h2: "Dredging Planned as One Connected Operation",
      body: [
        "Coastal Engineering Group provides mechanical and hydraulic dredging and sediment management throughout the Eastern United States — restoring navigation channels and berths, removing contaminated sediment, clearing debris and obstructions, and maintaining waterways and facility intakes.",
        "Dredging success depends on what happens after the material leaves the bottom. We plan excavation, transport, dewatering, water management, and disposal as one connected operation, and document conditions throughout with bathymetric pre- and post-survey and daily production reporting.",
      ],
      extra: {
        label: "Choosing the Method",
        cols: [
          { k: "Mechanical Dredging", d: "Best suited where precise excavation, debris handling, barge transport, limited pipeline access, or controlled removal is required." },
          { k: "Hydraulic Dredging", d: "Best suited where pumpable sediment can be transported through pipeline to a dewatering or disposal area over distance." },
        ],
      },
    },
    faqs: [
      { q: "What kinds of dredging does Coastal Engineering Group perform?", a: "Mechanical and hydraulic dredging for maintenance and capital work, environmental and residuals dredging, channels, slips, marinas, basins, lagoons and intake areas, and debris and obstruction removal — with the method matched to sediment, access, and the disposal pathway." },
      { q: "How do you protect water quality during dredging?", a: "Depending on permit conditions, Coastal integrates turbidity controls, containment, water-quality monitoring, dewatering, treatment, and disposal documentation directly into the dredging plan, with daily production reporting and survey reconciliation." },
      { q: "Why does the material pathway matter so much?", a: "Excavation is rarely what controls a dredging schedule. Transport, offloading, dewatering, water management, staging, and disposal capacity usually govern production, so Coastal plans the full pathway before mobilization rather than solving it in the field." },
      { q: "How are dredged quantities verified?", a: "Bathymetric pre- and post-survey coordination and quantity tracking reconcile in-place volumes against the design template and paid quantities throughout the project." },
      { q: "What areas does your dredging service cover?", a: "Federal, state, municipal, and industrial waterways throughout the Eastern United States." },
    ],
    cta: {
      h2: "Have a dredging or sediment project?",
      lede: "Bring Coastal in early to evaluate the material pathway, production assumptions, disposal requirements, and facility constraints as one plan.",
      btn: "Discuss a Dredging Project",
      trust: ["Veteran-Owned Small Business", "USACE Experience", "EM 385-1-1", "Eastern U.S. Operations"],
    },
  },

  "marine-services": {
    page: "marine-services",
    heroImg: "/assets/marine-services.jpg",
    eyebrow: "Fleet & Marine Support",
    h1: ["Marine Equipment and Logistics", "for Difficult-Access Work."],
    lede: "Coastal Engineering Group provides workboats, barges, lifting support, equipment mobilization, crew logistics, and specialty marine support for construction, dredging, inspection, and commercial diving projects. Equipment is selected around access, draft, capacity, operating conditions, and the work sequence — not simply availability.",
    heroCta: "Discuss a Project →",
    stats: [
      { value: "Access-Driven", sub: "Equipment selected for draft, capacity, and operating conditions" },
      { value: "Integrated Planning", sub: "Coordinated with engineering, diving, dredging, and permits" },
      { value: "Eastern U.S.", sub: "Mobilization throughout the Eastern United States" },
    ],
    servicesHead: { h2: "Fleet & Marine Support Capabilities", sub: "Hover any capability to see typical scope and applications." },
    services: [
      { title: "Workboats & Crew Transport", desc: "Personnel and access", icon: ICON.ship, tooltip: "Workboats and crew transport for personnel movement, site access, and support of over-water operations in active waterways." },
      { title: "Material, Equipment & Crane Barges", desc: "Working platforms", icon: ICON.layers, tooltip: "Material, equipment, and crane barges providing stable working platforms for over-water construction, inspection, and dredging support." },
      { title: "Lifting, Rigging & Placement", desc: "Marine lifts", icon: ICON.anchor, tooltip: "Lifting, rigging, and placement support for pile handling, precast placement, debris recovery, and heavy rigging over the water." },
      { title: "Diving Platforms", desc: "Underwater work support", icon: ICON.shield, tooltip: "Diving platforms and underwater work support — dive station staging, surface support, and topside coordination for commercial diving operations." },
      { title: "Survey, Inspection & ROV Support", desc: "Vessel-based deployment", icon: ICON.beaker, tooltip: "Vessel-based support for survey, inspection, and ROV deployment where areas are inaccessible to divers or require supplementary data." },
      { title: "Towing & Repositioning", desc: "Coordination", icon: ICON.truck, tooltip: "Towing and repositioning coordination for barges and marine plant, sequenced around port operations, traffic, and weather windows." },
      { title: "Temporary Access & Platforms", desc: "Floating work surfaces", icon: ICON.grid, tooltip: "Temporary access and floating work platforms enabling construction and inspection at structures without land-side access." },
      { title: "Emergency Mobilization", desc: "Specialty logistics", icon: ICON.bolt, tooltip: "Emergency mobilization and specialty logistics for time-sensitive marine work, damage assessment, and obstruction response." },
    ],
    certs: ["VOSB", "USCG-Compliant Operations", "EM 385-1-1", "OSHA 10/30", "Marine Insurance"],
    projectSlugs: ["atlantic-shores-offshore-wind", "freshwater-utility-cable-relocation", "mayport-naval-station-wharf-repair"],
    projectsHead: { eyebrow: "Projects", h2: "Related Marine Support Projects" },
    intro: {
      eyebrow: "Overview",
      h2: "Marine Equipment Matched to the Work",
      body: [
        "Coastal Engineering Group provides the workboats, barges, lifting support, logistics, and crew support that waterfront construction, dredging, inspection, and commercial diving projects depend on throughout the Eastern United States.",
        "Equipment is selected around access, draft, capacity, operating conditions, and the work sequence rather than simple availability. Coastal identifies the ownership and control status of each major asset during planning, so project teams know exactly what is committed to the work.",
      ],
      extra: {
        note: "Marine assets are provided as Coastal-owned, leased, subcontracted, or partner-provided depending on the project. A detailed asset schedule with current capacities and certificates is available on request for a specific scope.",
      },
    },
    // No PE-licensure section: Fleet & Marine Support is equipment and
    // logistics, not an engineering discipline, unlike the other four
    // divisions.
    faqs: [
      { q: "What marine support does Coastal provide?", a: "Workboats and crew transport, material and crane barges, lifting and rigging support, diving platforms, survey and ROV support, towing and repositioning coordination, temporary access platforms, and emergency mobilization." },
      { q: "Does Coastal own the equipment it provides?", a: "Marine assets are provided as Coastal-owned, leased, subcontracted, or partner-provided depending on the project. Coastal identifies the ownership and control status of each major asset during planning, along with its capacities and operating limitations." },
      { q: "Can a prime contractor use Coastal's marine support on its own project?", a: "Yes. Coastal can provide a complete support package or integrate selected assets and crews into a prime contractor's work plan as a specialty marine subcontractor." },
      { q: "How is marine equipment selected for a project?", a: "Selection is driven by access, draft, deck or payload capacity, lifting requirements, operating conditions, tides and access windows, and the construction sequence — coordinated with engineering, diving, dredging, and permit constraints." },
      { q: "Where does Coastal mobilize marine support?", a: "Throughout the Eastern United States, sequenced around port operations, marine traffic, and weather windows." },
    ],
    cta: {
      h2: "Need marine equipment or project support?",
      lede: "Tell us the structure, the access constraints, and the work sequence. Coastal will identify what the scope actually requires and what can be committed to it.",
      btn: "Discuss Marine Equipment or Project Support",
      trust: ["Veteran-Owned Small Business", "EM 385-1-1", "ADCI-Certified", "Eastern U.S. Operations"],
    },
  },
};

// ─── Tooltip-enabled service card (mirrors the diving page) ───────────────────
function SvcCard({ svc }) {
  const [open, setOpen] = useSS(false);
  const ref = useSR(null);
  useSE(() => {
    if (!open) return;
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  return (
    <div
      ref={ref}
      className={`div-service-card ${open ? "is-active" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      role="button"
      aria-expanded={open}
    >
      <div className="div-service-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={svc.icon} />
        </svg>
      </div>
      <div className="div-service-title">{svc.title}</div>
      <div className="div-service-desc">{svc.desc}</div>
      <div className="div-tooltip" role="tooltip" aria-hidden={!open}>
        <p>{svc.tooltip}</p>
      </div>
    </div>
  );
}

function SvcHero({ d }) {
  return (
    <section className="div-hero svc-hero">
      <div className="svc-hero-photo" aria-hidden="true" style={{ backgroundImage: `url('${d.heroImg}')` }} />
      <div className="ceg-container">
        <div className="div-hero-inner">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>{d.eyebrow}</span>
          </div>
          <h1 className="div-hero-h1">{d.h1[0]}<br />{d.h1[1]}</h1>
          <p className="div-hero-lede">{d.lede}</p>
          <a href="/contact" className="fed-btn fed-btn-primary">{d.heroCta}</a>
        </div>
      </div>
    </section>
  );
}

function SvcStatBand({ stats }) {
  return (
    <div className="div-stat-band">
      <div className="ceg-container">
        <div className="div-stat-band-inner">
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="div-stat-band-divider" aria-hidden="true" />}
              <div className="div-stat-band-item">
                <span className="div-stat-band-value">{s.value}</span>
                <span className="div-stat-band-sub">{s.sub}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function SvcServices({ head, services }) {
  return (
    <section className="fed-section div-services">
      <div className="ceg-container">
        <div className="fed-section-head">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>What We Do</span>
          </div>
          <h2 className="fed-h2 fed-light">{head.h2}</h2>
          <p className="fed-subhead-light">{head.sub}</p>
        </div>
        <div className="div-services-grid">
          {services.map((svc) => (<SvcCard key={svc.title} svc={svc} />))}
        </div>
      </div>
    </section>
  );
}

function SvcCerts({ certs }) {
  return (
    <div className="div-cert-strip">
      <div className="ceg-container">
        <div className="div-cert-label">Certifications & Qualifications</div>
        <div className="div-cert-pills">
          {certs.map((c) => (<span key={c} className="div-cert-pill">{c}</span>))}
        </div>
      </div>
    </div>
  );
}

// Photo-only version of the old project-card grid — per Kevin's ask, applied
// sitewide alongside the homepage gallery: real photos instead of cards with
// project titles/blurbs, ending in a button to the real projects page. Still
// pulls from shared PROJECTS data (via slugs) so every photo is a genuine
// project; keeps the same faded background photo and section header as
// before.
function SvcProjects({ head, slugs, photo }) {
  const all = (window.CEG_DATA && window.CEG_DATA.PROJECTS) || [];
  const projects = slugs.map((s) => all.find((p) => p.slug === s)).filter(Boolean);
  if (!projects.length) return null;
  return (
    <section id="projects" className="fed-section div-projects">
      {photo && <div className="svc-projects-photo" aria-hidden="true" style={{ backgroundImage: `url('${photo}')` }} />}
      <div className="ceg-container">
        <div className="fed-section-head">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>{head.eyebrow}</span>
          </div>
          <h2 className="fed-h2 fed-light">{head.h2}</h2>
        </div>
        <div className="svc-project-photos">
          {projects.map((p) => (
            <div key={p.slug} className="svc-project-photo">
              <img src={p.image} alt={p.title} loading="lazy" />
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a href="/projects/featured-work" className="fed-btn fed-btn-primary">View All Projects →</a>
        </div>
      </div>
    </section>
  );
}

function SvcCTA({ cta }) {
  return (
    <section className="fed-cta">
      <div className="ceg-container">
        <div className="fed-cta-inner">
          <h2 className="fed-cta-h2">{cta.h2}</h2>
          <p className="fed-cta-lede">{cta.lede}</p>
          <div className="fed-cta-btns">
            <a href="/contact" className="fed-btn fed-btn-white">{cta.btn || "Discuss a Project"} →</a>
            <a href="tel:8453283178" className="fed-btn fed-btn-outline-white">Call 845-328-3178</a>
          </div>
          <div className="fed-cta-trust">
            {cta.trust.map((t, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="fed-dot">·</span>}
                <span>{t}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Overview (crawlable intro prose) ────────────────────────────────────────
// This is now the ONE place for "why us" type content — the old separate
// Why/Narratives sections got folded in here (or cut, where they just
// restated the intro) per Kevin's review. `extra` carries at most one
// genuinely useful addendum per division: a deliverables list, a method
// comparison, or a short disclosure note — never a wall of extra prose.
function SvcOverview({ intro }) {
  if (!intro) return null;
  const extra = intro.extra;
  return (
    <section className="fed-section svc-overview">
      <div className="ceg-container">
        <div className="svc-prose">
          <div className="ceg-eyebrow fed-eyebrow-blue">
            <span className="ceg-eyebrow-mark" />
            <span>{intro.eyebrow}</span>
          </div>
          <h2 className="fed-h2 fed-dark">{intro.h2}</h2>
          {intro.body.map((p, i) => (<p key={i} className="svc-prose-p">{p}</p>))}
          {extra && extra.note && (<p className="svc-prose-p">{extra.note}</p>)}
          {extra && extra.label && <div className="svc-overview-extra-label">{extra.label}</div>}
          {extra && extra.items && (
            <ul className="svc-narrative-list">
              {extra.items.map((it, i) => (<li key={i}>{it}</li>))}
            </ul>
          )}
          {extra && extra.cols && (
            <div className="svc-narrative-cols">
              {extra.cols.map((c, i) => (
                <div key={i} className="svc-narrative-col">
                  <h3 className="svc-narrative-col-k">{c.k}</h3>
                  <p className="svc-narrative-col-d">{c.d}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ (native accordion, mirrors FAQPage JSON-LD) ─────────────────────────
function SvcFaq({ faqs }) {
  if (!faqs || !faqs.length) return null;
  return (
    <section className="fed-section svc-faq">
      <div className="ceg-container">
        <div className="fed-section-head">
          <div className="ceg-eyebrow fed-eyebrow-blue">
            <span className="ceg-eyebrow-mark" />
            <span>FAQ</span>
          </div>
          <h2 className="fed-h2 fed-dark">Frequently Asked Questions</h2>
        </div>
        <div className="svc-faq-list">
          {faqs.map((f, i) => (
            <details key={i} className="svc-faq-item">
              <summary className="svc-faq-q">{f.q}</summary>
              <p className="svc-faq-a">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── App Root ────────────────────────────────────────────────────────────────
function ServiceApp() {
  const theme = window.CEG_THEMES.drydock;
  const data = window.CEG_DATA;
  const key = window.__CEG_SERVICE;
  const d = SERVICE_PAGES[key];
  const [mobileOpen, setMobileOpen] = useSS(false);

  useSE(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = `service-${key || "unknown"}`;
  }, [key]);

  if (!d) {
    return (
      <div className="ceg-app concept-drydock" style={window.applyThemeVars(theme)}>
        <window.UtilityBar theme={theme} data={data} />
        <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
        <main>
          <section className="fed-section">
            <div className="ceg-container" style={{ padding: "80px 0", textAlign: "center" }}>
              <h1 className="fed-h2 fed-dark">Service not found</h1>
              <p><a href="/" className="div-view-all">Return home →</a></p>
            </div>
          </section>
        </main>
        <window.Footer theme={theme} data={data} />
        <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
      </div>
    );
  }

  return (
    <div className={`ceg-app concept-drydock page-service page-service-${key}`} style={window.applyThemeVars(theme)}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        <SvcHero d={d} />
        <SvcStatBand stats={d.stats} />
        <SvcOverview intro={d.intro} />
        <SvcServices head={d.servicesHead} services={d.services} />
        {/* Certs sits between the two dark sections (capabilities, projects)
            to break them up, per Kevin's note. */}
        <SvcCerts certs={d.certs} />
        <SvcProjects head={d.projectsHead} slugs={d.projectSlugs} photo={d.heroImg} />
        <SvcFaq faqs={d.faqs} />
        <SvcCTA cta={d.cta} />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ServiceApp />);
