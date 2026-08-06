// CEG Safety & Quality Page

const { useState: useS, useEffect: useE, useRef: useR } = React;

// ─── Page Data ───────────────────────────────────────────────────────────────
const SQ_DATA = {
  hero: {
    eyebrow: "Safety & Quality",
    headline: "Disciplined Planning. Safe Execution. Documented Quality.",
    lede: "Marine construction and commercial diving place people, equipment, environmental conditions, and active operations in close proximity. Coastal manages that risk through project-specific planning, qualified supervision, clear work controls, documented inspections, and stop-work authority at every level."
  },
  // The edit package (Section 07) is explicit: publish EMR / TRIR / DART and
  // work-hour figures only with verified, dated data and a named owner —
  // otherwise omit the metric panel and lead with systems and qualifications.
  // The previous "100% Safety Record" tile was never verified and is removed.
  // TODO(client): supply dated EMR, TRIR, DART and work-hour values, or leave
  // this describing programs rather than numbers.
  stats: [
    { value: "ADCI", label: "All Dive Teams", desc: "Association of Diving Contractors International" },
    { value: "OSHA 10/30", label: "Certified Personnel", desc: "Across field and supervisory staff" },
    { value: "EM 385-1-1", label: "Applicable Federal Work", desc: "U.S. Army Corps of Engineers safety standard" },
    { value: "Stop-Work", label: "Authority at Every Level", desc: "Any team member may halt unsafe work" }
  ],
  // Section 07: safety program elements. Only list a program Coastal actively
  // maintains — confirm before launch.
  programElements: [
    "Project-specific Accident Prevention Plans and Activity Hazard Analyses",
    "Commercial diving plans, emergency procedures, and qualified dive supervision",
    "EM 385-1-1 planning and execution for applicable federal work",
    "OSHA training and competent-person requirements",
    "HAZWOPER, confined-space, fall-protection, rigging, lifting, and marine operations controls as applicable",
    "Daily pre-task planning and stop-work authority",
    "Incident reporting, corrective action, and lessons learned",
  ],
  // Section 07: quality program elements.
  qualityElements: [
    "Project-specific Quality Control Plans",
    "USACE Construction Quality Management practices for applicable work",
    "Submittal, RFI, and design-document control",
    "Material certifications and receiving inspections",
    "Welding, coating, concrete, NDT, and installation documentation as applicable",
    "Daily quality reports and photographic records",
    "Deficiency tracking and corrective action",
    "As-built documentation and closeout packages",
    "Professional Engineer review where required",
  ],
  divingSafety: {
    h: "Commercial Diving Safety",
    p: "Coastal's diving operations are planned around the specific structure, waterbody, task, access, contamination potential, differential pressure hazards, vessel traffic, current, visibility, and emergency scenario. Dive plans define personnel, equipment, communications, decompression considerations, standby capability, and recovery procedures before the first diver enters the water.",
  },
  philosophyCards: [
    {
      title: "Pre-Dive Planning",
      body: "Job hazard analysis, dive plan review, environmental assessment, and equipment inspection before every operation."
    },
    {
      title: "Surface Support",
      body: "Fully equipped topside crew and standby diver on every job. No diver enters the water without backup ready."
    },
    {
      title: "Accident Prevention Plans",
      body: "We create full APPs for federal and state projects in compliance with EM385 and project-specific requirements."
    },
    {
      title: "Incident Reporting & Documentation",
      body: "All near-misses, incidents, and safety observations are documented and reviewed. Zero tolerance for underreporting."
    }
  ],
  qaqcCards: [
    {
      title: "Underwater QC Dive Teams (UWQC)",
      body: "PE-led, ADCI/OSHA-compliant dive teams monitoring and documenting underwater construction in real time. Services include surveillance dives, as-built verification, and detailed underwater inspection reports.",
      services: ["Underwater surveillance dives", "As-built condition verification", "Photographic & video documentation", "Deficiency reporting & tracking"],
      iconPath: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
    },
    {
      title: "Full-Time Structural QC Specialist",
      body: "On-site PE providing daily construction QC oversight. Monitors milestones, reviews submittals, attends weekly QC meetings, and maintains continuous documentation of construction progress and compliance.",
      services: ["Daily on-site QC inspections", "Milestone & submittal review", "Weekly QC reports", "APP and CQ plan creation"],
      iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    },
    {
      title: "Construction Management Inspection (CMI)",
      body: "Full construction management inspection services for complex marine projects. Covers plan review, schedule monitoring, issue resolution, and final punch-list coordination through project closeout.",
      services: ["Plan review & RFI support", "Production & schedule monitoring", "QC problem resolution", "Final inspection & closeout"],
      iconPath: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    }
  ],
  certs: {
    left: [
      { name: "ADCI Certified", desc: "American Diving Contractors International. All dive teams certified and operating under ADCI standards for commercial diving safety." },
      { name: "OSHA 10 / 30 / 40 / GHS", desc: "Field personnel, supervisors, and dive supervisors certified across all applicable OSHA training levels." },
      { name: "USACE CQM", desc: "US Army Corps of Engineers Construction Quality Management. Required for federal project QC roles." },
      { name: "NHI / FHWA", desc: "National Highway Institute / Federal Highway Administration bridge inspection certifications held by inspection divers." },
      { name: "EM385", desc: "US Army Corps of Engineers Safety and Health Requirements Manual. Full compliance on all federal and NAVFAC projects." }
    ],
    right: [
      { name: "ASDSO Dam Safety", desc: "Association of State Dam Safety Officials certification. Inspection teams trained in routine, standard, and special dam inspections." },
      { name: "ASCE Waterfront", desc: "American Society of Civil Engineers waterfront inspection and assessment certification." },
      { name: "US Navy / NAVFAC Standards", desc: "Familiar with NAVFAC project requirements, safety protocols, and federal contracting standards." },
      { name: "US Coast Guard", desc: "Operations conducted in compliance with applicable US Coast Guard regulations for marine operations." },
      { name: "American Water Works Association", desc: "Standards compliance for water tank, treatment facility, and potable water system work." }
    ]
  },
  project: {
    badge: "NAVFAC · Annapolis, Maryland",
    title: "US Naval Academy — Farragut Field Seawall Repair",
    desc: "Coastal Engineering Group provided dual QA/QC services for seawall and bulkhead repairs along the Santee River Basin at the US Naval Academy. Our team deployed a PE-led Underwater QC Dive Team (UWQC) performing weekly surveillance dives, photographic documentation, and as-built verification across all underwater construction phases — sheet pile installation, concrete fill, tieback installation, fender installation, and cathodic protection.\n\nSimultaneously, a Maryland-licensed Full-Time Structural QC Specialist was on-site daily monitoring above-water construction milestones including deadman pile installation, rebar placement, formwork, and tieback installation. CEG managed all CQ plans, weekly QC meetings, submittal reviews, and final inspection coordination through project closeout.",
    meta: [
      { label: "Scope", value: "Underwater QC + Full-Time Structural QC" },
      { label: "Client", value: "NAVFAC / Cianbro Corporation" },
      { label: "Location", value: "US Naval Academy, Annapolis, MD" },
      { label: "Certifications Applied", value: "ADCI · USACE CQM · EM385 · OSHA" }
    ]
  }
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
function SQHero() {
  return (
    <section className="sq-hero">
      <div className="ceg-container">
        <div className="sq-hero-inner">
          <div className="ceg-eyebrow sq-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>{SQ_DATA.hero.eyebrow}</span>
          </div>
          <h1 className="sq-hero-h1">{SQ_DATA.hero.headline}</h1>
          <p className="sq-hero-lede">{SQ_DATA.hero.lede}</p>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function SQStatsBar() {
  return (
    <div className="sq-stats-bar">
      <div className="ceg-container">
        <div className="sq-stats-inner">
          {SQ_DATA.stats.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="sq-stats-divider" aria-hidden="true" />}
              <div className="sq-stat">
                <div className="sq-stat-value">{s.value}</div>
                <div className="sq-stat-label">{s.label}</div>
                <div className="sq-stat-desc">{s.desc}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Safety Philosophy ────────────────────────────────────────────────────────
function SQPhilosophy() {
  return (
    <section className="sq-section sq-philosophy">
      <div className="ceg-container">
        <div className="sq-philosophy-layout">
          <div className="sq-philosophy-left">
            <div className="ceg-eyebrow sq-eyebrow-blue">
              <span className="ceg-eyebrow-mark" />
              <span>Our Approach</span>
            </div>
            <h2 className="sq-h2 sq-dark">Trained for the Conditions No One Else Will Enter</h2>
            <p className="sq-body-copy">
              Commercial diving is one of the most physically demanding and inherently hazardous occupations in the construction industry. Our safety program isn't built around meeting minimum requirements — it's built around the reality that our teams work in zero-visibility, high-current, and confined underwater environments where margins are thin and preparation is everything.
            </p>
            <p className="sq-body-copy">
              Every dive operation begins with a job hazard analysis, a detailed dive plan, and a pre-dive safety brief. We maintain fully equipped surface support at all times, and no diver enters the water without a standby diver ready to respond. Our safety officer reviews every project before mobilization.
            </p>
          </div>
          <div className="sq-philosophy-right">
            <div className="sq-protocol-grid">
              {SQ_DATA.philosophyCards.map((card, i) => (
                <div key={i} className="sq-protocol-card">
                  <h3 className="sq-protocol-title">{card.title}</h3>
                  <p className="sq-protocol-body">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── QA/QC Services ───────────────────────────────────────────────────────────
function SQQaqc() {
  return (
    <section className="sq-section sq-qaqc">
      <div className="ceg-container">
        <div className="sq-section-head">
          <div className="ceg-eyebrow sq-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>Quality Assurance</span>
          </div>
          <h2 className="sq-h2 sq-light">QA/QC &amp; Construction Management Inspection</h2>
          <p className="sq-subhead-light">
            CEG provides third-party and owner-representative QA/QC services for federal, state, and municipal marine construction projects. PE-led, ADCI-compliant, and built for NAVFAC and USACE project requirements.
          </p>
        </div>
        <div className="sq-qaqc-grid">
          {SQ_DATA.qaqcCards.map((card, i) => (
            <div key={i} className="sq-qaqc-card">
              <div className="sq-qaqc-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.iconPath} />
                </svg>
              </div>
              <h3 className="sq-qaqc-title">{card.title}</h3>
              <p className="sq-qaqc-body">{card.body}</p>
              <ul className="sq-qaqc-services">
                {card.services.map((s, j) => (
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

// ─── Certifications ───────────────────────────────────────────────────────────
function SQCerts() {
  return (
    <section className="sq-section sq-certs">
      <div className="ceg-container">
        <div className="sq-section-head sq-certs-head">
          <div className="ceg-eyebrow sq-eyebrow-blue">
            <span className="ceg-eyebrow-mark" />
            <span>Certifications &amp; Compliance</span>
          </div>
          <h2 className="sq-h2 sq-dark">The Standards We&apos;re Held To. And Exceed.</h2>
          <p className="sq-body-copy sq-certs-lede">
            Our teams hold certifications across every major federal, state, and industry safety standard governing commercial diving and marine construction.
          </p>
        </div>
        <div className="sq-certs-grid">
          <div className="sq-certs-col">
            {SQ_DATA.certs.left.map((c, i) => (
              <div key={i} className="sq-cert-row">
                <div className="sq-cert-name">{c.name}</div>
                <div className="sq-cert-desc">{c.desc}</div>
              </div>
            ))}
          </div>
          <div className="sq-certs-col">
            {SQ_DATA.certs.right.map((c, i) => (
              <div key={i} className="sq-cert-row">
                <div className="sq-cert-name">{c.name}</div>
                <div className="sq-cert-desc">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Featured Project ─────────────────────────────────────────────────────────
function SQFeaturedProject() {
  const p = SQ_DATA.project;
  return (
    <section className="sq-section sq-featured">
      <div className="ceg-container">
        <div className="sq-section-head">
          <div className="ceg-eyebrow sq-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>QA/QC In Action</span>
          </div>
        </div>
        <div className="sq-project-card">
          <span className="sq-project-badge">{p.badge}</span>
          <h3 className="sq-project-title">{p.title}</h3>
          {p.desc.split("\n\n").map((para, i) => (
            <p key={i} className="sq-project-desc">{para}</p>
          ))}
          <div className="sq-project-meta">
            {p.meta.map((m, i) => (
              <div key={i} className="sq-project-meta-item">
                <span className="sq-project-meta-label">{m.label}</span>
                <span className="sq-project-meta-value">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function SQCTA() {
  return (
    <section className="sq-cta">
      <div className="ceg-container">
        <div className="sq-cta-inner">
          <h2 className="sq-cta-h2">Need QA/QC Coverage on Your Next Project?</h2>
          <p className="sq-cta-lede">
            Federal, state, or private — we provide PE-led quality assurance that meets NAVFAC, USACE, and project-specific requirements.
          </p>
          <div className="sq-cta-btns">
            <a href="/contact" className="ceg-btn sq-btn-primary">Discuss a Project →</a>
            <a href="tel:8453283178" className="ceg-btn sq-btn-secondary">Call 845-328-3178</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
function SafetyQualityApp() {
  const theme = window.CEG_THEMES.drydock;
  const data = window.CEG_DATA;
  const [mobileOpen, setMobileOpen] = useS(false);

  useE(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = "safety-quality";
  }, []);

  const themeStyle = window.applyThemeVars(theme);

  return (
    <div className="ceg-app concept-drydock page-safety-quality" style={themeStyle}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        <SQHero />
        <SQStatsBar />
        <SQPhilosophy />
        <SQQaqc />
        <SQCerts />
        <SQFeaturedProject />
        <SQCTA />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<SafetyQualityApp />);
