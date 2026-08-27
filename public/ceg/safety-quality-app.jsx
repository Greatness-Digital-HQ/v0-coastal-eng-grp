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

// ─── CTA ──────────────────────────────────────────────────────────────────────
function SQCTA() {
  return (
    <section className="sq-cta">
      <div className="ceg-container">
        <div className="sq-cta-inner">
          <h2 className="sq-cta-h2">Have Safety or Quality Requirements to Discuss?</h2>
          <p className="sq-cta-lede">
            Federal, state, or private — we plan and document to NAVFAC, USACE, and project-specific requirements.
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
        <SQCTA />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<SafetyQualityApp />);
