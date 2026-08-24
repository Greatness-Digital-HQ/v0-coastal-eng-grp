// Shared content data for all three concepts
// Sourced from meeting notes + coastalengineeringllc.com

// Card copy and order per the client edit package (homepage capabilities
// section). Marine construction and engineering lead; commercial diving is a
// prominent differentiating capability, not the whole identity. Badges renumber
// to match display order. Each card links to its dedicated capability page.
const CAPABILITIES = [
  {
    key: "construction",
    badge: "CAP-01",
    title: "Marine Construction",
    body: "Waterfront construction, structural rehabilitation, pile repair, concrete and steel repairs, outfalls, intakes, scour protection, and emergency marine work.",
    link: "Explore Marine Construction →",
    icon: "construction",
  },
  {
    key: "engineering",
    badge: "CAP-02",
    title: "Marine Engineering & Inspection",
    body: "Waterfront engineering, underwater and structural inspection, condition assessment, repair design, temporary works, construction engineering, and quality oversight.",
    link: "Explore Engineering & Inspection →",
    icon: "engineering",
  },
  {
    key: "dredging",
    badge: "CAP-03",
    title: "Dredging",
    body: "Mechanical and hydraulic dredging, sediment management, dewatering, material handling, disposal coordination, bathymetric support, and waterway maintenance.",
    link: "Explore Dredging →",
    icon: "dredging",
  },
  {
    key: "diving",
    badge: "CAP-04",
    title: "Commercial Diving & Underwater Construction",
    body: "Surface-supplied diving for inspection, repair, installation, welding, burning, concrete work, NDT support, dam work, intake and outfall work, and emergency response.",
    link: "Explore Diving & Underwater Construction →",
    icon: "diving",
  },
  {
    key: "marine-services",
    badge: "CAP-05",
    title: "Fleet & Marine Support",
    body: "Workboats, barges, cranes, marine logistics, crew support, equipment mobilization, and specialty project support for waterfront and offshore-access work.",
    link: "Explore Fleet & Marine Support →",
    icon: "marine",
  },
];

// Same intentional order as CAPABILITIES — construction/engineering first,
// diving as one specialized division among the rest. The services mega-menu
// features the first three (DIVISIONS.slice(0, 3)) and the divisions tabs
// default to index 0, so this order also drives what surfaces first there.
const DIVISIONS = [
  {
    key: "construction",
    name: "Marine Construction",
    short: "Construction",
    blurb: "Waterfront construction, structural rehabilitation, and repair over and below the waterline: piers, bulkheads, outfalls, intakes, and scour protection.",
    menuBlurb: "Waterfront construction and repair, above and below the waterline.",
    services: ["Pile Driving", "Bulkheads & Seawalls", "Bridge Substructures", "Pier & Wharf Construction"],
  },
  {
    key: "engineering",
    name: "Marine Engineering & Inspection",
    short: "Engineering & Inspection",
    blurb: "Waterfront engineering, underwater and structural inspection, condition assessment, and repair design informed by field conditions.",
    menuBlurb: "Underwater inspection, condition assessment, and repair design.",
    services: ["Underwater Inspection", "Condition Assessment", "Repair Design", "Construction Engineering"],
  },
  {
    key: "dredging",
    name: "Dredging",
    short: "Dredging",
    blurb: "Mechanical and hydraulic dredging, sediment management, dewatering, disposal coordination, and waterway maintenance.",
    menuBlurb: "Mechanical and hydraulic dredging and sediment management.",
    services: ["Maintenance Dredging", "Capital Dredging", "Environmental Dredging", "Sediment Management"],
  },
  {
    key: "diving",
    name: "Commercial Diving & Underwater Construction",
    short: "Diving & Underwater Construction",
    blurb: "Surface-supplied commercial diving for underwater construction, inspection, repair, welding, concrete work, and emergency response.",
    menuBlurb: "Surface-supplied diving for underwater construction and repair.",
    services: ["Underwater Construction", "Inspection & NDT", "Welding & Burning", "Salvage & Recovery"],
  },
  {
    key: "marine-services",
    name: "Fleet & Marine Support",
    short: "Fleet & Marine Support",
    blurb: "Workboats, barges, cranes, marine logistics, and equipment mobilization supporting our own work and prime contractors.",
    menuBlurb: "Workboats, barges, cranes, and marine logistics support.",
    services: ["Workboats & Crew Transport", "Deck & Crane Barges", "Lifting & Rigging", "Marine Logistics"],
  },
];

const MARKETS = [
  { key: "federal", name: "Federal", detail: "NAVFAC, USACE, Coast Guard", projects: 47 },
  { key: "state-local", name: "State & Local", detail: "DOTs, port authorities, municipal", projects: 32 },
  { key: "energy", name: "Energy", detail: "Offshore wind, LNG, transmission", projects: 18 },
  { key: "commercial", name: "Commercial", detail: "Marinas, terminals, private piers", projects: 24 },
  { key: "industrial", name: "Industrial", detail: "Heavy industry waterfront facilities", projects: 15 },
];

const PROJECTS = [
  {
    slug: "railroad-bridge-inspection",
    title: "Railroad Bridge Inspection Over Open Water",
    client: "CSX Transportation",
    market: "Commercial",
    state: "NY",
    year: "2024",
    tag: "Diving",
    blurb: "Underwater inspection of timber pile substructure on active overwater railroad bridge crossing.",
    image: "/assets/railroad-bridge-inspection.jpg",
    scope: ["Timber pile inspection", "Underwater photography & defect mapping", "Structural condition report", "PE-stamped assessment", "Priority repair recommendations"],
    scopeStats: [{ value: "47", label: "Piles Inspected" }, { value: "3", label: "Span Crossings" }, { value: "10 days", label: "Report Turnaround" }],
    challenge: "CSX needed a structural assessment of an active overwater railroad bridge while maintaining daily freight operations. Standard above-water inspection couldn't evaluate submerged timber pile condition, and any work stoppage on this crossing carried significant operational cost.",
    approach: "CEG deployed a two-person ADCI dive team led by a PE diver for direct underwater structural inspection of all submerged pile elements. Underwater photography and defect mapping was conducted on each pile, with real-time engineering evaluation performed in-water — no footage review lag.",
    outcome: "PE-stamped condition report delivered within 10 business days with zero disruption to rail operations. Priority repair items were identified, documented, and presented with engineered repair options — giving CSX what they needed to plan their next maintenance cycle.",
  },
  {
    slug: "freshwater-utility-cable-relocation",
    title: "Freshwater Utility Cable Relocation",
    client: "Public Service Electric & Gas",
    market: "Utility",
    state: "PA",
    year: "2024",
    tag: "Diving",
    blurb: "Underwater installation and relocation of 3 miles of high-voltage transmission cable across Conowingo Lake.",
    image: "/assets/cable-relocation.jpg",
    scope: ["Submarine cable route survey", "Cable trench excavation", "High-voltage cable installation", "Backfill & environmental restoration", "As-built documentation"],
    scopeStats: [{ value: "3 mi", label: "Cable Relocated" }, { value: "0", label: "Service Interruptions" }, { value: "2024", label: "Completion" }],
    challenge: "PSE&G required relocation of high-voltage transmission cable under a freshwater reservoir without disrupting power delivery to downstream customers or disturbing the lake's sensitive ecology. The crossing depth and water clarity required precision placement over three miles.",
    approach: "CEG performed a full route survey before mobilization, identifying optimal cable trench positioning to avoid existing infrastructure. Dive teams executed precision trench excavation and cable lay using controlled placement methods that minimized bottom disturbance and turbidity impact.",
    outcome: "Three miles of high-voltage submarine cable successfully relocated on schedule with zero service interruptions. Environmental monitoring throughout the project confirmed no measurable impact to the reservoir ecosystem. As-built survey delivered to PSE&G for their records.",
  },
  {
    slug: "port-of-baltimore-water-tank-repair",
    title: "Port of Baltimore Water Tank Repair",
    client: "Baltimore City Department of Public Works",
    market: "State & Local",
    state: "MD",
    year: "2023",
    tag: "Diving",
    blurb: "In-tank commercial dive operation for internal coating inspection, structural assessment, and weld repairs on a 1.5 million gallon elevated storage tank.",
    image: "/assets/water-tank-repair.jpg",
    scope: ["Internal coating inspection", "Structural assessment", "Weld repair", "Cathodic protection evaluation", "PE-stamped report", "AWWA compliance documentation"],
    scopeStats: [{ value: "1.5M gal", label: "Tank Capacity" }, { value: "0", label: "Service Outage Days" }, { value: "AWWA", label: "Compliance Standard" }],
    challenge: "Baltimore City needed internal inspection and repairs on an elevated storage tank serving the Port without taking it out of service — a process that would normally require draining, cleaning, confined space entry under atmospheric conditions, and weeks of downtime.",
    approach: "CEG dive teams entered the active tank under potable water conditions, completing a full internal inspection, weld repair, and cathodic protection assessment without interrupting service. All materials used were certified for potable water contact.",
    outcome: "Tank returned to uninterrupted service with all repairs complete. PE-stamped report delivered to the City documenting conditions, repairs, and recommended maintenance intervals. No service disruption throughout the operation.",
  },
  {
    slug: "delaware-river-bridge-inspection",
    title: "Delaware River Bridge Inspection",
    client: "DRJTBC",
    market: "State & Local",
    state: "PA",
    year: "2025",
    tag: "Diving",
    blurb: "Underwater inspection of substructure across four crossings.",
    image: "/assets/diver-helmet.jpg",
    scope: ["Level 2 NBIS underwater inspection", "Scour evaluation", "Fathometric survey", "PE-stamped reports", "NHI/FHWA certified inspection teams"],
    scopeStats: [{ value: "4", label: "Bridge Crossings" }, { value: "L2", label: "NBIS Inspection" }, { value: "NHI/FHWA", label: "Certification" }],
    challenge: "The Delaware River Joint Toll Bridge Commission required NBIS-compliant Level 2 underwater inspections across four bridge crossings under active traffic with varying water depths and visibility conditions.",
    approach: "CEG deployed NHI/FHWA certified PE divers for all four crossings, executing Level 2 underwater inspections per NBIS standards. Scour evaluation and fathometric surveys were completed concurrently to maximize mobilization efficiency.",
    outcome: "All four crossings inspected, documented, and reported with full NBIS compliance. PE-stamped reports delivered to DRJTBC within the required timeframe, meeting their regulatory reporting obligations.",
  },
  {
    slug: "atlantic-shores-offshore-wind",
    title: "Atlantic Shores Offshore Wind",
    client: "Atlantic Shores OW",
    market: "Energy",
    state: "NJ",
    year: "2025",
    tag: "Marine Services",
    blurb: "Tug and barge support for cable lay vessel mobilization.",
    image: "/assets/marine-services.jpg",
    scope: ["Tug mobilization & positioning", "Deck barge support", "Cable lay vessel escort", "Port coordination", "Marine logistics management"],
    scopeStats: [{ value: "2", label: "Tugs Deployed" }, { value: "Offshore NJ", label: "Work Area" }, { value: "2025", label: "Active" }],
    challenge: "Atlantic Shores required reliable tug and marine logistics support for cable lay vessel operations in the NJ offshore wind development area, with port-to-site coordination demanding tight scheduling and vessel positioning precision.",
    approach: "CEG provided dedicated tug and deck barge support integrated with the cable lay vessel's operational schedule. Our captains coordinated directly with vessel operations to maintain positioning, respond to weather windows, and ensure safe port transits.",
    outcome: "Cable lay vessel mobilization completed on schedule with no operational delays attributable to marine support logistics. Ongoing support contract continues through project completion.",
  },
  {
    slug: "port-newark-container-terminal",
    title: "Port Newark Container Terminal",
    client: "Port Authority NY/NJ",
    market: "Commercial",
    state: "NJ",
    year: "2023",
    tag: "Engineering",
    blurb: "Condition assessment and rehabilitation design for 2,400 LF of wharf.",
    image: "/assets/marine-engineering.jpg",
    scope: ["Underwater structural assessment", "Above-water condition survey", "Rehabilitation design", "PE-stamped drawings", "Construction document package", "Permitting support"],
    scopeStats: [{ value: "2,400 LF", label: "Wharf Assessed" }, { value: "13", label: "Licensed States" }, { value: "PE-Stamped", label: "Deliverables" }],
    challenge: "The Port Authority needed a comprehensive condition assessment and rehabilitation design package for a high-throughput container terminal wharf — with findings reliable enough to directly support a capital repair procurement.",
    approach: "CEG engineers conducted both underwater and above-water structural assessment across the full 2,400 LF, evaluating pile condition, fender systems, deck structure, and utility systems. The assessment fed directly into a PE-stamped rehabilitation design package.",
    outcome: "Full condition assessment and rehabilitation design delivered on schedule. PE-stamped construction documents provided a ready-to-bid package that the Port Authority used to procure the repair contract directly.",
  },
  {
    slug: "mayport-naval-station-wharf-repair",
    title: "Mayport Naval Station Wharf Repair",
    client: "NAVFAC Southeast",
    market: "Federal",
    state: "FL",
    year: "2025",
    tag: "Diving",
    blurb: "Underwater pile inspection and concrete jacket repair on active wharf.",
    image: "/assets/diver-city.jpg",
    scope: ["Underwater pile inspection", "Concrete jacket repair", "EM385 safety compliance", "Underwater QC dive team", "PE-stamped documentation", "NAVFAC project coordination"],
    scopeStats: [{ value: "EM385", label: "Safety Standard" }, { value: "NAVFAC SE", label: "Client" }, { value: "Active Wharf", label: "Environment" }],
    challenge: "NAVFAC Southeast required pile inspection and concrete repair on an active Navy wharf at Mayport Naval Station — an operational facility where work had to be sequenced around vessel berthing schedules and base access protocols.",
    approach: "CEG coordinated closely with base operations to sequence work windows around active berthing. Our EM385-compliant dive team performed all underwater inspection and concrete jacket repairs with a full-time PE diver lead maintaining direct coordination with the NAVFAC COR.",
    outcome: "All repair work completed within the approved work windows with no operational disruption to the station. PE-stamped as-built documentation delivered to NAVFAC within 30 days of project completion.",
  },
  {
    slug: "greenwood-lake-dam-rehabilitation",
    title: "Greenwood Lake Dam Rehabilitation",
    client: "Greenwood Lake Commission",
    market: "State & Local",
    state: "NY",
    year: "2024",
    tag: "Engineering",
    blurb: "Spillway redesign and embankment stabilization for aging dam structure.",
    image: "/assets/federal-project-dam.jpg",
    scope: ["Dam safety inspection", "Spillway hydraulic analysis", "Spillway redesign", "Embankment stabilization design", "PE-stamped drawings", "NYSDEC permit coordination"],
    scopeStats: [{ value: "ASDSO", label: "Certified Inspection" }, { value: "PE-Stamped", label: "Design Package" }, { value: "NYSDEC", label: "Permitted" }],
    challenge: "The Greenwood Lake Dam required rehabilitation to address spillway deterioration and embankment stability concerns flagged in a dam safety inspection — with design and permitting complexity driven by the structure's age, the lake's recreational use, and state dam safety regulations.",
    approach: "CEG performed a full ASDSO-compliant dam safety inspection before advancing to design. The spillway was redesigned to meet current hydraulic standards, and an embankment stabilization plan was developed and coordinated through NYSDEC permitting.",
    outcome: "PE-stamped design package completed and permitted through NYSDEC. The Commission received a fully coordinated construction document set ready for contractor procurement.",
  },
];

// Derived: states where we've actually performed work — drives projects filter.
const STATES_WORKED = Array.from(new Set(PROJECTS.map(p => p.state))).sort();

// TODO(client): confirm the exact certification terminology and current status
// of every badge below before launch (edit package, Section 01 — "Confirm the
// exact certification terminology before publication"). "DBE" and "ISO 9001"
// in particular are specific third-party certifications that Coastal has not
// yet verified; remove any Coastal does not actively hold.
const CERTS = [
  { abbr: "VOSB", full: "Veteran-Owned Small Business" },
  { abbr: "ADCI", full: "Association of Diving Contractors Intl." },
  { abbr: "SAM", full: "System for Award Management" },
  { abbr: "DBE", full: "Disadvantaged Business Enterprise" },
  { abbr: "ISO 9001", full: "Quality Management Certified" },
  { abbr: "OSHA 30", full: "Construction Safety Trained" },
];

// TODO(client): CLIENTS below names federal agencies as Coastal customers.
// Verify each relationship — and confirm logo/name usage is permitted — before
// launch. The edit package forbids using owner logos without permission.
const CLIENTS = [
  "NAVFAC", "U.S. Army Corps of Engineers", "U.S. Coast Guard",
  "Port Authority NY/NJ", "Maryland Port Admin.", "NJDOT",
  "DRJTBC", "Atlantic Shores OW", "Equinor",
];

// Qualitative proof points, not counters. The previous values ("20+ Years",
// "500+ Projects", "100% Safety Record") were never verified by Coastal, and
// the edit package forbids publishing unverified performance claims or
// animated counters that nobody owns and maintains.
const STATS = [
  { value: "Veteran-Owned", label: "Small Business" },
  { value: "ADCI-Certified", label: "Commercial Diving Contractor" },
  { value: "Multi-State PE", label: "Professional Engineering Licensure" },
  { value: "Eastern U.S.", label: "Operations" },
];

// States where Coastal Engineering's Professional Engineers are licensed.
// Drives the "Where We Work" section and the count shown on service pages
// (so the number always matches the list). Ordered north-to-south along the
// seaboard, inland last.
const LICENSED_STATES = [
  { abbr: "ME", name: "Maine" },
  { abbr: "NY", name: "New York" },
  { abbr: "CT", name: "Connecticut" },
  { abbr: "NJ", name: "New Jersey" },
  { abbr: "PA", name: "Pennsylvania" },
  { abbr: "DE", name: "Delaware" },
  { abbr: "MD", name: "Maryland" },
  { abbr: "VA", name: "Virginia" },
  { abbr: "NC", name: "North Carolina" },
  { abbr: "SC", name: "South Carolina" },
  { abbr: "GA", name: "Georgia" },
  { abbr: "FL", name: "Florida" },
  { abbr: "OH", name: "Ohio" },
];

// Primary navigation. Per the client edit package, the top level is:
// About | Capabilities | Markets | Projects | Safety & Quality | Careers | Contact
// Flat nav only — no mega-menus, no dropdowns. Kevin's review flagged the old
// mega-menu structure (About/Capabilities/Markets each opening a multi-column
// panel) as cumbersome and hard to audit, on top of too many thin, single-
// purpose pages. Every item below is a single click straight to its page:
// - About and Capabilities lost their dropdowns; Capabilities now points at
//   one consolidated /services overview (see services-overview-app.jsx) that
//   surfaces the same five divisions and links into the existing per-division
//   pages for anyone who wants to go deeper.
// - Markets is gone from the nav entirely; MARKETS still feeds the homepage.
// - Safety & Quality dropped from the top level — linked from About and the
//   footer instead — so the primary bar stays short.
const NAV = {
  about:        { label: "About",       href: "/about" },
  capabilities: { label: "Capabilities", href: "/services" },
  projects:     { label: "Projects",     href: "/projects/featured-work" },
  careers:      { label: "Careers",      href: "/careers" },
  contact:      { label: "Contact",      href: "/contact" },
};

// NOTE: general email and emergency-response line pending client verification.
// HQ address is from the current business listing (Greenwood Lake, NY).
const CONTACT = {
  phone: "845-328-3178",
  email: "info@coastalengineeringgroup.com",
  hq: "Coastal Engineering Group",
  addressLine1: "2 Seneca Hill",
  addressLine2: "Greenwood Lake, NY 10925",
  hours: "Mon–Fri  7:00–17:00 ET",
  emergency: "Emergency Marine Response",
};

// Careers — benefits + open roles teaser (JMT-leaning, talent-as-priority).
const CAREERS = {
  pitch: "Build Your Career on the Water",
  lede: "Coastal Engineering Group is building a team for complex marine infrastructure work throughout the Eastern United States. We are looking for engineers, project managers, commercial divers, dredging professionals, operators, field leaders, and shared-services professionals who want meaningful responsibility and the opportunity to grow with the company.",
  // Section 16: the "Why Build a Career at Coastal?" pillars.
  whyCards: [
    { h: "Meaningful Work", v: "Contribute to bridges, dams, ports, utilities, federal facilities, and waterfront infrastructure that communities and industries rely on." },
    { h: "Room to Advance", v: "Join a growing organization where capable employees can take responsibility, lead teams, and help shape a division." },
    { h: "Technical Variety", v: "Work across engineering, construction, dredging, diving, inspection, equipment, project controls, and client coordination." },
    { h: "Safety and Accountability", v: "Operate within a culture that expects planning, communication, documentation, and responsibility for the team." },
    { h: "One Company", v: "Field and office teams are expected to work toward the same project outcome — not as disconnected departments." },
  ],
  // Section 16: career paths, by function.
  paths: [
    { h: "Field Operations", v: "Commercial divers, dive supervisors, tenders, superintendents, operators, deckhands, welders, carpenters, mechanics, dredging personnel, and field engineers." },
    { h: "Project Delivery", v: "Project managers, project engineers, estimators, schedulers, quality-control managers, safety professionals, and project accountants." },
    { h: "Engineering", v: "Professional Engineers, Engineers-in-Training, inspectors, designers, and technical report writers." },
    { h: "Shared Services", v: "Accounting, recruiting, proposal management, administration, business development, and operational support." },
  ],
  veterans: {
    h: "Veterans at Coastal",
    p: "Coastal values military experience that translates into leadership, planning, technical discipline, field readiness, equipment responsibility, and team accountability. Veterans are encouraged to apply across field, project, engineering, and corporate roles.",
  },
  benefits: [
    { h: "Health & wellness", v: "Medical, dental, vision · 100% employer-paid options for divers and field crew." },
    { h: "Financial", v: "401(k) with company match · paid life and disability insurance." },
    { h: "Time off", v: "Generous PTO scaling with tenure · paid holidays · per-diem on travel." },
    { h: "Development", v: "ADCI dive certifications · OSHA training paid · tuition support." },
  ],
  openRoles: [
    { title: "Commercial Diver / Tender", division: "Diving", location: "Greenwood Lakes, NY", type: "Full-time" },
    { title: "Marine Project Manager", division: "Construction", location: "Jacksonville, FL", type: "Full-time" },
    { title: "Pile Driver / Heavy Equipment Operator", division: "Construction", location: "Field-based", type: "Full-time" },
    { title: "Coastal Structural Engineer", division: "Engineering", location: "Greenwood Lakes, NY", type: "Full-time" },
    { title: "Tugboat Captain", division: "Marine Services", location: "Mid-Atlantic", type: "Full-time" },
  ],
};

window.CEG_DATA = { CAPABILITIES, DIVISIONS, MARKETS, PROJECTS, STATES_WORKED, CERTS, CLIENTS, STATS, LICENSED_STATES, NAV, CONTACT, CAREERS };
