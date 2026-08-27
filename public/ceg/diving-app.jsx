// CEG — Services / Commercial Diving Page

const { useState: useDS, useEffect: useDE, useRef: useDR } = React;

// ─── Services grid data ───────────────────────────────────────────────────────
const SERVICES = [
  {
    title: "Structural Inspection",
    desc: "PE-led underwater assessment",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    tooltip: "PE divers perform Level 1, 2, and 3 structural inspections of bridges, seawalls, piers, dams, and underwater infrastructure. Defect documentation, material testing, and PE-stamped reports included. NHI/FHWA and ASDSO certified teams available.",
  },
  {
    title: "Underwater Repair",
    desc: "Concrete, welding, structural fixes",
    icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z",
    tooltip: "Underwater concrete placement, certified topside and underwater welding, pile and bulkhead repair, sluice gate work, stop log installation and removal, and trash rack repair. PE oversight on all structural repairs.",
  },
  {
    title: "Bridge Inspection",
    desc: "NHI/FHWA Level 2 certified",
    icon: "M3 10h18M3 14h18M10 3v18M14 3v18",
    tooltip: "In-house PE divers with NHI/FHWA bridge inspection certification. All types of underwater bridge and culvert inspections per NBIS standards for NJDOT, state DOTs, and transportation authorities. All ADCI and relevant safety certifications maintained.",
  },
  {
    title: "Dam Inspection",
    desc: "ASDSO certified teams",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    tooltip: "Routine, standard, and special dam inspections above and below water. ASDSO-certified inspection staff evaluating structural compliance, outlet works, spillways, and gate operations. Confined space penetration and pipe crawler available for outlet pipe access.",
  },
  {
    title: "Confined Space Diving",
    desc: "OSHA CFR 1910.146 compliant",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    tooltip: "Confined space structural inspections and repairs including penetration dives, pipe crawler, and ROV services. All staff trained in confined space entry and fall arrest. Full compliance with OSHA 29 CFR 1910.146. Active facilities can remain in service during operations.",
  },
  {
    title: "Hazmat Diving",
    desc: "Contaminated water certified",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    tooltip: "Certified dive operations in adverse conditions including contaminated water and hazardous material environments. Teams equipped and trained for high-risk underwater work where standard dive protocols are insufficient.",
  },
  {
    title: "Water Tank Services",
    desc: "Inspection, repair, sediment removal",
    icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    tooltip: "Potable water tank inspection, repair, and sediment removal with zero service interruption. Active contracts with major water district and municipal operators for routine maintenance programs. All operations comply with AWWA and potable water safety standards.",
  },
  {
    title: "Underwater Construction",
    desc: "Marine construction below the waterline",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    tooltip: "Full underwater construction capability including cofferdam installation, piling and bulkhead work, pier construction, seawall repair, dredging, and debris removal. PE divers direct construction operations with real-time engineering oversight.",
  },
  {
    title: "ROV Inspection",
    desc: "Where divers can't go",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    tooltip: "Remotely operated vehicle inspection for areas too small, too hazardous, or otherwise inaccessible for diver entry. Imaging data provides comprehensive evaluation of substructure units and confined underwater spaces.",
  },
  {
    title: "Utility Locating",
    desc: "Submarine lines, all types",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    tooltip: "High-quality underwater utility locating for power, telecom, gas, sewer, and water lines. Physical and tone location methods. Minimal environmental impact. Experienced teams improving efficiency through technology and methodology refinement.",
  },
  {
    title: "Scanning & Sonar",
    desc: "Structural defects, debris, obstructions",
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    tooltip: "Sonar and scanning services to detect debris, structural defects, scour, and underwater obstructions. Fathometric and hydrographic surveys. Imaging data documented for engineering reports and asset condition records.",
  },
  {
    title: "Aquarium & Sensitive Environments",
    desc: "Zero environmental impact",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    tooltip: "Specialized repair techniques for active aquatic exhibits, theme parks, and sensitive marine environments. Divers work in live exhibits without environmental disturbance. Facility remains open to the public during all operations.",
  },
];

const CERTS = [
  "ADCI Certified", "OSHA 10/30/40", "NHI / FHWA", "ASDSO Dam Safety",
  "USACE CQM", "ASCE Waterfront", "EM385", "Confined Space", "Hazmat", "CPR / First Aid",
];

const PROJECTS = [
  {
    badge: "NAVFAC · Maryland",
    title: "USNA — Farragut, Robert Crown & Santee Basin Seawall Repairs",
    body: "Multi-site seawall and bulkhead repair at the US Naval Academy. PE-led underwater QC dive team across three basin locations.",
    tags: ["Seawall", "QA/QC", "NAVFAC"],
    img: "/assets/diver-helmet.jpg",
    imgAlt: "Diver preparing for underwater seawall inspection",
  },
  {
    badge: "NAVFAC · Navy Submarine Base",
    title: "Pier 32 — Acoustic Monitoring & Environmental Protection",
    body: "Survey boat operations, acoustic monitoring, and environmental protection diving at a US Navy submarine base facility.",
    tags: ["Pier", "Navy", "Survey"],
    img: "/assets/commercial-diving.jpg",
    imgAlt: "Commercial diver in federal facility operations",
  },
  {
    badge: "NJ DOT · Multi-Site",
    title: "Type 2 NBIS Underwater Bridge & Culvert Inspections",
    body: "NHI/FHWA-compliant Level 2 bridge and culvert inspections across New Jersey Department of Transportation's underwater inspection program.",
    tags: ["Bridge", "NHI/FHWA", "NBIS"],
    img: "/assets/federal-hydrographic.jpg",
    imgAlt: "Hydrographic survey and scanning operations",
  },
];

// ─── Tooltip-enabled service card ────────────────────────────────────────────
function ServiceCard({ svc }) {
  const [open, setOpen] = useDS(false);
  const ref = useDR(null);

  useDE(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
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

// ─── Hero ─────────────────────────────────────────────────────────────────────
function DivHero() {
  return (
    <section className="div-hero">
      <div className="ceg-container">
        <div className="div-hero-inner">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>Commercial Diving &amp; Underwater Construction</span>
          </div>
          <h1 className="div-hero-h1">Construction Capability<br />Below the Waterline.</h1>
          <p className="div-hero-lede">
            Coastal Engineering Group provides surface-supplied commercial diving for underwater
            construction, inspection, repair, installation, demolition, and emergency response.
            Our dive teams operate as part of an integrated marine construction and engineering
            organization — bringing construction experience, technical documentation, and field
            accountability below the waterline.
          </p>
          <a href="/contact" className="fed-btn fed-btn-primary">Discuss a Project →</a>
        </div>
      </div>
    </section>
  );
}

// ─── Section 1 — PE Diver Difference Band ────────────────────────────────────
function DivStatBand() {
  const stats = [
    { value: "PE Divers On Staff",  sub: "Licensed engineers certified to dive" },
    { value: "ADCI Certified",      sub: "All commercial dive teams" },
    { value: "Surface-Supplied",    sub: "Commercial diving systems and qualified supervision" },
  ];
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

// ─── Section 2 — Why PE-Led Diving ───────────────────────────────────────────
function DivWhy() {
  return (
    <section className="fed-section div-why">
      <div className="ceg-container">
        <div className="div-why-grid">
          <div className="div-why-text">
            <div className="ceg-eyebrow fed-eyebrow-blue">
              <span className="ceg-eyebrow-mark" />
              <span>The Difference</span>
            </div>
            <h2 className="fed-h2 fed-dark div-why-h2">Most Contractors Send a Diver. We Send an Engineer.</h2>
            <p className="div-why-body">
              A standard commercial diver documents what they see. A PE diver understands what it means.
            </p>
            <p className="div-why-body">
              When Coastal Engineering Group deploys a dive team, the lead diver holds a Professional
              Engineer license. That means structural assessments happen underwater in real time —
              not after the fact in an office. Defects are evaluated on the spot, repair recommendations
              are drafted with engineering authority, and PE-stamped reports are delivered faster.
            </p>
            <p className="div-why-body">
              One mobilization. Inspection and engineering in the same dive.
            </p>
          </div>
          <div className="div-why-cards">
            <div className="div-stat-card">
              <h3 className="div-stat-card-title">Faster Decisions</h3>
              <p className="div-stat-card-body">No waiting for an engineer to review dive footage. Our PE diver evaluates structural conditions directly and issues recommendations the same day.</p>
            </div>
            <div className="div-stat-card">
              <h3 className="div-stat-card-title">PE-Stamped Reports</h3>
              <p className="div-stat-card-body">Every inspection report is signed and sealed by a licensed Professional Engineer — accepted by NAVFAC, DOT, and state agencies without additional review layers.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 3 — Services Grid ───────────────────────────────────────────────
function DivServices() {
  return (
    <section className="fed-section div-services">
      <div className="ceg-container">
        <div className="fed-section-head">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>What We Do</span>
          </div>
          <h2 className="fed-h2 fed-light">Full-Spectrum Commercial Diving</h2>
          <p className="fed-subhead-light">Hover any service to see full scope, certifications, and applicable project types.</p>
        </div>
        <div className="div-services-grid">
          {SERVICES.map((svc) => (
            <ServiceCard key={svc.title} svc={svc} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 4 — Certifications ──────────────────────────────────────────────
function DivCerts() {
  return (
    <div className="div-cert-strip">
      <div className="ceg-container">
        <div className="div-cert-label">Certifications Held By Our Dive Teams</div>
        <div className="div-cert-pills">
          {CERTS.map((c) => (
            <span key={c} className="div-cert-pill">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section 5 — Featured Projects ───────────────────────────────────────────
function DivProjects() {
  return (
    <section id="projects" className="fed-section div-projects">
      <div className="ceg-container">
        <div className="fed-section-head">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>Dive Operations</span>
          </div>
          <h2 className="fed-h2 fed-light">Projects That Required More Than a Diver</h2>
        </div>
        {/* Photo-only, matching the other service pages and the homepage
            gallery — real photos instead of cards, one button out. */}
        <div className="svc-project-photos">
          {PROJECTS.map((p, i) => (
            <div key={i} className="svc-project-photo">
              <img src={p.img} alt={p.imgAlt} loading="lazy" />
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

// ─── Section 6 — CTA ─────────────────────────────────────────────────────────
function DivCTA() {
  return (
    <section className="fed-cta">
      <div className="ceg-container">
        <div className="fed-cta-inner">
          <h2 className="fed-cta-h2">Need a Certified Dive Team?</h2>
          <p className="fed-cta-lede">
            ADCI certified. PE-led. Deployed across 13 states. Tell us your project and we'll respond within 24 hours.
          </p>
          <div className="fed-cta-btns">
            <a href="/contact" className="fed-btn fed-btn-white">Discuss a Project →</a>
            <a href="tel:8453283178" className="fed-btn fed-btn-outline-white">Call 845-328-3178</a>
          </div>
          <div className="fed-cta-trust">
            <span>ADCI</span><span className="fed-dot">·</span>
            <span>PE Divers</span><span className="fed-dot">·</span>
            <span>Veteran-Owned Small Business</span><span className="fed-dot">·</span>
            <span>EM385</span><span className="fed-dot">·</span>
            <span>OSHA 10/30/40</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
function DivingApp() {
  const theme = window.CEG_THEMES.drydock;
  const data = window.CEG_DATA;
  const [mobileOpen, setMobileOpen] = useDS(false);

  useDE(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = "diving";
  }, []);

  return (
    <div className="ceg-app concept-drydock page-diving" style={window.applyThemeVars(theme)}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        <DivHero />
        <DivStatBand />
        <DivWhy />
        <DivServices />
        <DivCerts />
        <DivProjects />
        <DivCTA />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<DivingApp />);
