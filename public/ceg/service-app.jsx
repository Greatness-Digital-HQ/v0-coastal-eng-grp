// CEG — Shared Services template. One data-driven page that renders any of the
// non-diving service divisions (construction, engineering, dredging, marine
// services) from SERVICE_PAGES, reusing the fed-*/div-* styling established by
// the Commercial Diving page so all service pages share one visual language.
//
// The active service is chosen by window.__CEG_SERVICE, set by each route
// (app/services/<key>/page.tsx) before this file runs — the same pattern the
// project-detail page uses with window.__CEG_SLUG.
//
// Kevin's round 1 review cut these pages down to three sections: a hero (the
// division name as H1 plus his intro copy), the capability grid, and a sample
// of projects. The stat strip, Overview, certifications, FAQ, and closing CTA
// band are gone — along with the FAQPage schema in app/services/service-seo.ts,
// which must not describe an FAQ the page no longer shows.

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
// Hero copy, capability intros, and card text per Kevin's round 1 review.
// On each card, `desc` is the short subtitle and `tooltip` is the write-up.
// `lede` may be a string or an array of paragraphs.
const SERVICE_PAGES = {
  construction: {
    page: "construction",
    heroImg: "/assets/marine-construction.jpg",
    h1: "Marine Construction",
    lede: [
      "Coastal Engineering Group builds, rehabilitates, and repairs marine infrastructure above and below the waterline. We combine construction expertise, commercial diving, and engineering support to solve challenging access, structural, and underwater conditions, with safety and accountability guiding every phase.",
      "We serve federal, state, and local agencies, waterfront asset owners, and prime contractors, with the ability to mobilize throughout the United States. From waterfront facilities to bridge and dam repairs, our teams bring practical planning and disciplined execution to critical infrastructure projects.",
    ],
    servicesHead: { h2: "Marine Construction Capabilities", sub: "Construction and rehabilitation of waterfront structures, bridge foundations, dams, and marine utilities. Explore our capabilities below for typical scopes and applications." },
    services: [
      { title: "Piers, Docks & Wharves", desc: "Waterfront construction & rehabilitation", icon: ICON.grid, tooltip: "Construction, rehabilitation, and repair of piers, docks, wharves, and associated waterfront structures, including decking, framing, and substructures." },
      { title: "Bulkheads & Sheet Pile", desc: "Waterfront retention & protection", icon: ICON.layers, tooltip: "Installation, replacement, and repair of bulkheads, seawalls, and sheet-pile structures, including tiebacks, caps, and associated shoreline improvements." },
      { title: "Pile Installation & Repair", desc: "Structural foundations & support", icon: ICON.structure, tooltip: "Installation and rehabilitation of timber, steel, concrete, and composite piles, including pile jackets, encasements, and repairs to deteriorated sections." },
      { title: "Bridge & Structural Rehabilitation", desc: "Concrete & steel repairs above and below water", icon: ICON.wrench, tooltip: "Repair of bridge substructures and marine structures, including concrete restoration, crack injection, steel repairs, and protective systems." },
      { title: "Cofferdams & Temporary Works", desc: "Dewatering, access & construction support", icon: ICON.shield, tooltip: "Installation and removal of cofferdams, temporary platforms, and access systems to support dewatering and construction in challenging marine environments." },
      { title: "Intakes, Outfalls & Crossings", desc: "Submerged utilities & water conveyance", icon: ICON.waves, tooltip: "Installation, repair, and rehabilitation of intake structures, outfalls, submerged pipelines, and diffusers, including associated supports and protection." },
      { title: "Scour & Shoreline Protection", desc: "Erosion control & stabilization", icon: ICON.map, tooltip: "Placement of riprap, articulated concrete mats, and other protective systems to stabilize shorelines and protect bridge foundations and waterfront structures from erosion and scour." },
      { title: "Dam, Gate & Lock Rehabilitation", desc: "Water-control & navigation structures", icon: ICON.beaker, tooltip: "Rehabilitation and repair of dam components, gates, locks, and associated structures, including gate replacement, concrete repairs, and underwater construction support." },
      { title: "Marine Demolition & Emergency Repairs", desc: "Removal, recovery, & emergency response", icon: ICON.bolt, tooltip: "Controlled removal of deteriorated marine structures, debris removal, salvage support, and emergency stabilization and repairs to damaged waterfront infrastructure." },
    ],
    projectSlugs: ["mayport-naval-station-wharf-repair", "port-newark-container-terminal", "greenwood-lake-dam-rehabilitation"],
    projectsHead: { h2: "Sample of Marine Construction Projects" },
  },

  engineering: {
    page: "engineering",
    heroImg: "/assets/marine-engineering.jpg",
    h1: "Marine Engineering & Inspection",
    lede: [
      "Coastal Engineering Group provides engineering, inspection, and construction support for bridges, dams, waterfront structures, and submerged infrastructure. We help clients understand existing conditions, prioritize repairs, and develop practical solutions that account for access, equipment, sequencing, and constructability.",
      "Our engineers work closely with inspection and construction teams to connect field findings with clear recommendations and actionable plans. We serve federal, state, and local agencies, infrastructure owners, and prime contractors, with the ability to mobilize throughout the United States. Safety, technical rigor, and clear documentation guide every assignment.",
    ],
    servicesHead: { h2: "Marine Engineering & Inspection Capabilities", sub: "From condition assessments and repair design to construction engineering and quality oversight, we help clients make informed decisions throughout the life of their infrastructure." },
    services: [
      { title: "Waterfront Structural Engineering", desc: "Structural evaluation & rehabilitation design", icon: ICON.doc, tooltip: "Engineering evaluation and rehabilitation design for piers, wharves, bulkheads, seawalls, and associated waterfront structures, informed by existing conditions and practical construction requirements." },
      { title: "Underwater Inspection & Assessment", desc: "Document conditions below the waterline", icon: ICON.map, tooltip: "PE Diver-led inspection of submerged structures to document deterioration, damage, and scour. Findings support condition assessments, maintenance planning, and repair recommendations." },
      { title: "Bridge, Dam & Utility Inspections", desc: "Assess critical infrastructure components", icon: ICON.grid, tooltip: "Targeted inspections of bridge substructures, dams, gates, intakes, and outfalls, with documentation tailored to the structure, owner requirements, and inspection objectives." },
      { title: "Repair Design & Documentation", desc: "Turn findings into construction-ready plans & specs", icon: ICON.wrench, tooltip: "Development of repair details, drawings, specifications, quantities, and cost estimates to help owners define the work, procure contractors, and plan rehabilitation." },
      { title: "Construction Engineering", desc: "Engineering for safe, practical execution", icon: ICON.shield, tooltip: "Engineering support that connects design requirements with field execution. We evaluate constructability, construction sequencing, material selections, and proposed field changes to help resolve technical challenges and keep projects moving safely and efficiently." },
      { title: "Access, Rigging & Lift Planning", desc: "Plan challenging construction activities", icon: ICON.anchor, tooltip: "Engineering support for marine access, rigging arrangements, lifting operations, and installation procedures, accounting for equipment capabilities, structural demands, and site constraints." },
      { title: "Construction Management & QA/QC", desc: "Field observation, documentation & QA/QC", icon: ICON.layers, tooltip: "Construction oversight, quality assurance and quality control support, submittal review, and field reporting to help verify conformance with project requirements, including USACE construction quality management support." },
      { title: "Hydrographic Surveying & Sonar Imaging", desc: "Map underwater conditions & features", icon: ICON.beaker, tooltip: "Hydrographic surveys and sonar imaging to document water depths, bottom conditions, and submerged features. We use these findings to support inspections, dredging plans, repair design, and construction verification, coordinating with specialty survey providers as needed." },
      { title: "Bid & Preconstruction Support", desc: "Define scope, quantities & execution risks", icon: ICON.bolt, tooltip: "Constructability reviews, quantity development, scope clarification, and technical support to help owners and contractors evaluate requirements, identify risks, and prepare informed bids." },
    ],
    projectSlugs: ["port-newark-container-terminal", "greenwood-lake-dam-rehabilitation", "delaware-river-bridge-inspection"],
    projectsHead: { h2: "Sample of Engineering & Inspection Projects" },
  },

  // Kevin supplied no new hero, intro, or card copy for Dredging in round 1.
  dredging: {
    page: "dredging",
    heroImg: "/assets/dredging.jpg",
    h1: "Dredging",
    lede: "Coastal Engineering Group performs mechanical and hydraulic dredging for channels, basins, lagoons, waterfront facilities, waterways, and environmental applications. We plan the work around production, access, sediment characteristics, water management, dewatering, transportation, disposal, environmental controls, and the operational needs of the facility.",
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
    projectSlugs: ["freshwater-utility-cable-relocation", "greenwood-lake-dam-rehabilitation", "atlantic-shores-offshore-wind"],
    projectsHead: { h2: "Sample of Dredging Projects" },
  },

  "marine-services": {
    page: "marine-services",
    heroImg: "/assets/marine-services.jpg",
    h1: "Fleet & Marine Support",
    lede: [
      "Coastal Engineering Group provides workboats, barges, floating work platforms, and marine logistics for construction, dredging, inspection, and commercial diving projects. We bring crews, equipment, and materials to the work, and coordinate the support needed to keep operations moving safely and efficiently.",
      "We support infrastructure owners and prime contractors, with project mobilization throughout the United States. Our teams plan around site access, water depths, equipment capacity, and operating conditions to match marine resources to the demands of each project.",
    ],
    servicesHead: { h2: "Fleet & Marine Support Capabilities", sub: "From crew transport and floating work platforms to material handling and equipment mobilization, we provide practical support for work on and around the water." },
    services: [
      { title: "Workboats & Crew Transport", desc: "Safe access to on-water work", icon: ICON.ship, tooltip: "Workboat support for transporting personnel, tools, and supplies between shore and marine work areas, with vessel selection and trip planning suited to site conditions." },
      { title: "Barges & Floating Work Platforms", desc: "Equipment, materials & construction access", icon: ICON.layers, tooltip: "Barge support for staging materials, carrying equipment, and establishing floating work areas for construction, dredging, and rehabilitation projects." },
      { title: "Marine Lifting & Material Placement", desc: "Coordinated handling over water", icon: ICON.anchor, tooltip: "Crane and rigging support for loading, unloading, and placing construction materials and equipment, coordinated around load requirements, working reach, and platform stability." },
      { title: "Commercial Diving Support", desc: "Platforms for underwater operations", icon: ICON.shield, tooltip: "Vessel and barge support for dive teams, including staging of diving equipment, tools, and support personnel near submerged work areas." },
      { title: "Survey, Inspection & ROV Support", desc: "Vessel support for field investigations", icon: ICON.beaker, tooltip: "Boats and working platforms for survey crews, inspectors, and remotely operated vehicle teams, with support for equipment deployment and access to inspection locations." },
      { title: "Towing & Barge Positioning", desc: "Move and position marine equipment", icon: ICON.truck, tooltip: "Coordination of towing, barge movements, and positioning within project work areas, accounting for access, water depths, weather, and construction sequencing." },
      { title: "Equipment Mobilization & Logistics", desc: "Coordinate delivery from yard to site", icon: ICON.grid, tooltip: "Planning and coordination of equipment transport, waterfront loading and unloading, staging, and demobilization to align marine resources with the project schedule." },
      { title: "Emergency Marine Support", desc: "Mobilization for urgent project needs", icon: ICON.bolt, tooltip: "Coordination of available crews, vessels, and equipment to support emergency inspections, stabilization, debris removal, and repairs following infrastructure damage or unexpected site conditions." },
      { title: "Mooring & Anchoring Support", desc: "Secure vessels & floating work platforms", icon: ICON.waves, tooltip: "Installation, adjustment, and removal of mooring lines, anchors, and spud systems to support barge and workboat operations. We plan around water depths, currents, tides, and site constraints to maintain position during construction." },
    ],
    projectSlugs: ["atlantic-shores-offshore-wind", "freshwater-utility-cable-relocation", "mayport-naval-station-wharf-repair"],
    projectsHead: { h2: "Sample of Fleet & Marine Support Projects" },
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
          <h1 className="div-hero-h1">{d.h1}</h1>
          {[].concat(d.lede).map((p, i) => (<p key={i} className="div-hero-lede">{p}</p>))}
        </div>
      </div>
    </section>
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

// Photo-only version of the old project-card grid — per Kevin's ask, applied
// sitewide alongside the homepage gallery: real photos instead of cards with
// project titles/blurbs, ending in a button to the real projects page. Still
// pulls from shared PROJECTS data (via slugs) so every photo is a genuine
// project; keeps the same faded background photo as before.
function SvcProjects({ head, slugs, photo, serviceKey }) {
  const all = (window.CEG_DATA && window.CEG_DATA.PROJECTS) || [];
  const projects = slugs.map((s) => all.find((p) => p.slug === s)).filter(Boolean);
  if (!projects.length) return null;
  return (
    <section id="projects" className="fed-section div-projects">
      {photo && <div className="svc-projects-photo" aria-hidden="true" style={{ backgroundImage: `url('${photo}')` }} />}
      <div className="ceg-container">
        <div className="fed-section-head">
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
          <a href={`/projects/featured-work#service=${serviceKey}`} className="fed-btn fed-btn-primary">View All Projects →</a>
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
        <SvcServices head={d.servicesHead} services={d.services} />
        <SvcProjects head={d.projectsHead} slugs={d.projectSlugs} photo={d.heroImg} serviceKey={key} />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ServiceApp />);
