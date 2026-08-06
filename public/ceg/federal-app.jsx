// CEG — Markets / Federal Page

const { useState: useFS, useEffect: useFE } = React;

// ─── Page Data ────────────────────────────────────────────────────────────────
const FED_DATA = {
  hero: {
    eyebrow: "Federal Market",
    headline: "Federal Marine Infrastructure Delivery",
    lede: "Coastal Engineering Group supports federal agencies and prime contractors with marine construction, dredging, commercial diving, underwater inspection, engineering, quality control, and marine support. Our teams are structured for high-documentation environments where safety planning, schedule coordination, technical compliance, and responsive field execution are essential.",
  },
  credentials: [
    { value: "VOSB Certified", desc: "Veteran-Owned Small Business" },
    { value: "ADCI Certified", desc: "All Dive Teams" },
    { value: "EM385 Compliant", desc: "USACE/NAVFAC Safety Standard" },
    { value: "USACE CQM", desc: "Construction Quality Management" },
  ],
  stats: [
    { value: "VOSB",   label: "Designation",         sub: "SBA & VA recognized" },
    { value: "Pre-Qual", label: "NAVFAC Status",      sub: "Multiple IDIQs" },
    { value: "47+",    label: "Federal Projects",     sub: "Completed & active" },
    { value: "$28M",   label: "Largest Award",        sub: "NAVFAC Mid-Atlantic" },
    { value: "24/7",   label: "Emergency Response",   sub: "365 days / year" },
    { value: "27",     label: "Years on the Water",   sub: "Est. 1998" },
  ],
  advantageCards: [
    {
      title: "VOSB Set-Aside Eligible",
      body: "As a Veteran-Owned Small Business (VOSB) certified through SBA VetCert, CEG is eligible for NAVFAC and USACE set-aside procurements. Federal agencies with veteran-owned contracting goals have direct incentive to work with us — and so do prime contractors seeking qualified VOSB teaming partners.",
    },
    {
      title: "EM385 Safety Program",
      body: "Every federal project operates under a CEG Accident Prevention Plan (APP) built to EM 385-1-1 standards. Our dive supervisors are trained and certified on USACE/NAVFAC safety requirements, ensuring zero compliance surprises on federally-contracted work.",
    },
    {
      title: "PE-Led Oversight",
      body: "Licensed Professional Engineers lead every inspection and QA/QC engagement. PE-stamped reports, PE dive supervisors, and PE-signed drawings are standard deliverables — not add-ons. We're licensed in 13 states to support East Coast federal facility coverage.",
    },
    {
      title: "Teaming Ready",
      body: "CEG actively teams with prime contractors on NAVFAC and USACE MACC vehicles. We bring specialized diving, engineering, and QA/QC capability that most primes cannot self-perform. If you're a prime looking for a compliant VOSB sub — let's talk.",
    },
  ],
  capabilities: [
    {
      title: "Dry Dock & Port Infrastructure",
      body: "Underwater inspection, structural repair, and construction for Navy dry docks, piers, wharves, and port facilities. Familiar with NAVFAC project requirements and federal facility protocols.",
      services: ["Dry dock inspection", "Pier & wharf repair", "Underwater concrete", "Cathodic protection assessment"],
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    },
    {
      title: "Seawall & Bulkhead",
      body: "Full-cycle seawall repair and bulkhead construction from initial PE inspection through underwater construction and QA/QC closeout. Deployed at US Naval Academy and other federal coastal facilities.",
      services: ["Seawall repair & reinforcement", "Sheet pile installation", "Tieback installation", "PE-stamped drawings"],
      icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    },
    {
      title: "QA/QC & Construction Oversight",
      body: "Underwater QC dive teams and full-time structural QC specialists for NAVFAC and USACE construction contracts. APP creation, weekly QC reports, submittal review, and full project documentation.",
      services: ["UWQC teams", "F/T QC specialist", "CQ plan creation", "Submittal & RFI support"],
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    },
    {
      title: "Underwater Inspection & Assessment",
      body: "PE-led structural inspection of federal waterfront and underwater infrastructure. Level 1, 2, and 3 inspections with full photographic documentation and PE-stamped engineering reports.",
      services: ["Structural inspection", "Scour evaluation", "Fathometric survey", "PE-stamped reports"],
      icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    },
    {
      title: "Dredging & Debris Removal",
      body: "Precision dredging and underwater debris removal for federal navigation channels, port facilities, and critical water control infrastructure.",
      services: ["Navigation channel dredging", "Debris removal", "Low-flow port bulkhead work", "Sediment management"],
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
    },
    {
      title: "Diving in Restricted Environments",
      body: "Hazmat diving, confined space penetration, and operations in security-restricted federal facilities. Cleared personnel available. OSHA 29 CFR 1910.146 compliant on all confined space operations.",
      services: ["Hazmat diving", "Confined space entry", "Restricted facility operations", "ROV for no-diver-access areas"],
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    },
  ],
  projects: [
    {
      badge: "NAVFAC · Maryland",
      title: "US Naval Academy — Farragut Field Seawall Repair",
      body: "PE-led underwater QC dive team and full-time structural QC specialist for seawall and bulkhead repairs along the Santee River Basin. EM385-compliant operations throughout.",
      tags: ["QA/QC", "Seawall", "NAVFAC"],
      img: "/assets/diver-helmet.jpg",
      imgAlt: "Diver preparing for underwater seawall inspection",
    },
    {
      badge: "USACE · Multi-State",
      title: "Low-Flow Port Bulkhead Replacement & Debris Removal",
      body: "Underwater construction and debris removal services for US Army Corps of Engineers. Full documentation package and PE oversight from mobilization through closeout.",
      tags: ["Construction", "USACE", "Bulkhead"],
      img: "/assets/federal-project-dam.jpg",
      imgAlt: "Federal dam and waterway infrastructure project",
    },
    {
      badge: "Federal Transit · New York",
      title: "NYC MTA — Inspection, Scanning & ROV Services",
      body: "Multi-discipline underwater inspection, sonar scanning, and ROV services for New York City Metropolitan Transportation Authority bridge and waterway infrastructure.",
      tags: ["Inspection", "ROV", "Scanning"],
      img: "/assets/federal-hydrographic.jpg",
      imgAlt: "Hydrographic survey and scanning operations",
    },
  ],
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
function FedHero() {
  return (
    <section className="fed-hero">
      <div className="ceg-container">
        <div className="fed-hero-inner">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>{FED_DATA.hero.eyebrow}</span>
          </div>
          <h1 className="fed-hero-h1">{FED_DATA.hero.headline}</h1>
          <p className="fed-hero-lede">{FED_DATA.hero.lede}</p>
          <div className="fed-hero-btns">
            <a href="/contact" className="fed-btn fed-btn-primary">Request Capabilities Statement →</a>
            <a href="#projects" className="fed-btn fed-btn-secondary">View Federal Projects</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Credential Bar ───────────────────────────────────────────────────────────
function FedCredentialBar() {
  return (
    <div className="fed-cred-bar">
      <div className="ceg-container">
        <div className="fed-cred-inner">
          {FED_DATA.credentials.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="fed-cred-divider" aria-hidden="true" />}
              <div className="fed-cred-item">
                <span className="fed-cred-value">{c.value}</span>
                <span className="fed-cred-desc">{c.desc}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Quick-Facts Stats Band ───────────────────────────────────────────────────
function FedStats() {
  return (
    <div className="fed-stats" aria-label="Key qualifications at a glance">
      <div className="ceg-container fed-stats-grid">
        {FED_DATA.stats.map((s) => (
          <div key={s.label} className="fed-stat">
            <div className="fed-stat-label">{s.label}</div>
            <div className="fed-stat-value">{s.value}</div>
            <div className="fed-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Federal Advantage ────────────────────────────────────────────────────────
function FedAdvantage() {
  return (
    <section className="fed-section fed-advantage">
      <div className="ceg-container">
        <div className="fed-section-head">
          <div className="ceg-eyebrow fed-eyebrow-blue">
            <span className="ceg-eyebrow-mark" />
            <span>Federal Advantage</span>
          </div>
          <h2 className="fed-h2 fed-dark">Built for the Requirements That Eliminate Most Contractors</h2>
          <p className="fed-body-copy fed-subhead-muted">
            Federal marine projects demand a level of compliance, documentation, and on-site oversight that general contractors can't meet. CEG is structured from the ground up for this environment.
          </p>
        </div>

        <div className="fed-advantage-layout">
          <div className="fed-advantage-photo">
            <img
              src="/assets/federal-team.jpg"
              alt="CEG dive team preparing for federal waterfront project"
              loading="lazy"
            />
          </div>
          <div className="fed-advantage-stack">
            {FED_DATA.advantageCards.map((card, i) => (
              <div key={i} className="fed-advantage-card">
                <h3 className="fed-advantage-title">{card.title}</h3>
                <p className="fed-advantage-body">{card.body}</p>
              </div>
            ))}

            <div className="fed-callout-band">
              <div className="fed-callout-band-label">Deep dive</div>
              <div className="fed-callout-band-h">How VOSB set-asides work on NAVFAC contracts</div>
              <p className="fed-callout-band-body">
                VOSB status lets CEG compete on contracts reserved exclusively for veteran-owned
                firms — and to team as a preferred partner on large NAVFAC procurements where
                agencies have active small-business participation goals.
                <a href="/contact"> Request our SAM profile and certifications →</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Federal Capabilities ─────────────────────────────────────────────────────
function FedCapabilities() {
  return (
    <section className="fed-section fed-caps">
      <div className="ceg-container">
        <div className="fed-section-head">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>What We Deliver</span>
          </div>
          <h2 className="fed-h2 fed-light">Full-Spectrum Marine Capability for Federal Projects</h2>
          <p className="fed-subhead-light">
            From first inspection to final as-built — one contractor, one contract, no gaps.
          </p>
        </div>
        <div className="fed-caps-grid">
          {FED_DATA.capabilities.map((cap, i) => (
            <div key={i} className="fed-cap-card">
              <div className="fed-cap-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={cap.icon} />
                </svg>
              </div>
              <h3 className="fed-cap-title">{cap.title}</h3>
              <p className="fed-cap-body">{cap.body}</p>
              <ul className="fed-cap-services">
                {cap.services.map((s, j) => (
                  <li key={j}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Federal Projects ─────────────────────────────────────────────────────────
function FedProjects() {
  return (
    <section id="projects" className="fed-section fed-projects">
      <div className="ceg-container">
        <div className="fed-section-head">
          <div className="ceg-eyebrow fed-eyebrow-blue">
            <span className="ceg-eyebrow-mark" />
            <span>Federal Track Record</span>
          </div>
          <h2 className="fed-h2 fed-dark">Projects That Meet the Standard</h2>
        </div>
        <div className="fed-projects-grid">
          {FED_DATA.projects.map((p, i) => (
            <div key={i} className="fed-project-card">
              <div className="fed-project-media">
                <img src={p.img} alt={p.imgAlt} loading="lazy" />
              </div>
              <span className="fed-project-badge">{p.badge}</span>
              <h3 className="fed-project-title">{p.title}</h3>
              <p className="fed-project-body">{p.body}</p>
              <div className="fed-project-footer">
                <div className="fed-project-tags">
                  {p.tags.map((t, j) => (
                    <span key={j} className="fed-project-tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a href="/projects/featured-work#market=Federal" className="fed-project-link">View All Federal Projects →</a>
        </div>

        <div className="fed-callout-band">
          <div className="fed-callout-band-label">Need more detail?</div>
          <div className="fed-callout-band-h">Request our full past-performance package</div>
          <p className="fed-callout-band-body">
            We can provide a formatted CPARs summary, project data sheets, and agency
            references for any active procurement.
            <a href="/contact"> Contact our opportunity team →</a>
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Teaming & Procurement ────────────────────────────────────────────────────
function FedTeaming() {
  return (
    <section className="fed-section fed-teaming">
      <div className="ceg-container">
        <div className="fed-teaming-layout">
          <div className="fed-teaming-left">
            <div className="ceg-eyebrow fed-eyebrow">
              <span className="ceg-eyebrow-mark" />
              <span>Work With Us</span>
            </div>
            <h2 className="fed-h2 fed-light">VOSB Teaming Partners &amp; Prime Contractors</h2>
            <p className="fed-teaming-body">
              If you're a prime contractor pursuing NAVFAC or USACE work, Coastal Engineering Group is the teaming partner that closes your capability gap. We bring PE-led diving, QA/QC, and marine construction — all VOSB-certified — to joint ventures and subcontracting arrangements across the East Coast.
            </p>
            <p className="fed-teaming-body">
              NAVFAC agencies have active goals for veteran-owned small business participation. Teaming with CEG helps primes meet those goals while adding genuine, self-performing marine capability to the team.
            </p>
          </div>
          <div className="fed-teaming-right">
            <div className="fed-teaming-card">
              <h3 className="fed-teaming-card-title">For Prime Contractors</h3>
              <p className="fed-teaming-card-body">
                Looking for a VOSB sub with real marine capability? Let's discuss teaming on your next NAVFAC or USACE pursuit.
              </p>
              <a href="/contact" className="fed-btn fed-btn-primary fed-btn-sm">Discuss a Project →</a>
            </div>
            <div className="fed-teaming-card fed-teaming-card-outline">
              <h3 className="fed-teaming-card-title">Capabilities Statement</h3>
              <p className="fed-teaming-card-body">
                Download our full Capabilities Statement for SAM.gov registration, NAICS codes, bonding capacity, and past performance references.
              </p>
              <a href="/contact" className="fed-btn fed-btn-outline-blue fed-btn-sm">Request Capabilities Statement →</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function FedCTA() {
  return (
    <section className="fed-cta">
      <div className="ceg-container">
        <div className="fed-cta-inner">
          <h2 className="fed-cta-h2">Pursuing a Federal Marine Contract?</h2>
          <p className="fed-cta-lede">
            CEG is available for NAVFAC task orders, USACE projects, and federal teaming arrangements across the East Coast. Let's talk scope.
          </p>
          <div className="fed-cta-btns">
            <a href="/contact" className="fed-btn fed-btn-white">Discuss a Project →</a>
            <a href="tel:8453283178" className="fed-btn fed-btn-outline-white">Call 845-328-3178</a>
          </div>
          <div className="fed-cta-trust">
            <span>VOSB</span><span className="fed-dot">·</span>
            <span>EM385</span><span className="fed-dot">·</span>
            <span>ADCI</span><span className="fed-dot">·</span>
            <span>13 Licensed States</span><span className="fed-dot">·</span>
            <span>Veteran-Owned Small Business</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
function FederalApp() {
  const theme = window.CEG_THEMES.drydock;
  const data = window.CEG_DATA;
  const [mobileOpen, setMobileOpen] = useFS(false);

  useFE(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = "federal";
  }, []);

  const themeStyle = window.applyThemeVars(theme);

  return (
    <div className="ceg-app concept-drydock page-federal" style={themeStyle}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        <FedHero />
        <FedCredentialBar />
        <FedAdvantage />
        <FedCapabilities />
        <FedStats />
        <FedProjects />
        <FedTeaming />
        <FedCTA />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<FederalApp />);
