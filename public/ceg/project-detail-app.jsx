// CEG — Project detail / case study page

const { useState: usePD, useEffect: usePDE } = React;

const FALLBACK_IMGS = {
  Diving: "/assets/commercial-diving.webp",
  Engineering: "/assets/marine-engineering.webp",
  Construction: "/assets/marine-construction.webp",
  "Marine Services": "/assets/marine-services.webp",
  Dredging: "/assets/dredging.webp",
};

// Market badge color comes from the shared MARKETS list (data.jsx).
function marketColor(name) {
  const m = window.CEG_DATA.MARKETS.find((mk) => mk.name === name);
  return { bg: (m && m.color) || "#374151", text: "#fff" };
}

function imgFor(p) {
  return p.image || FALLBACK_IMGS[p.tag] || "/assets/commercial-diving.webp";
}

// ─── Not-found fallback ───────────────────────────────────────────────────────
function ProjectNotFound({ slug }) {
  return (
    <section style={{ padding: "120px 0", textAlign: "center", background: "#0b1929", minHeight: "60vh" }}>
      <div className="ceg-container">
        <p style={{ color: "#5b9bd5", fontFamily: "var(--font-inter)", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>Project Not Found</p>
        <h1 style={{ color: "#fff", fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,3rem)", marginBottom: 24 }}>"{slug}"</h1>
        <a href="/projects/featured-work" style={{ color: "#5b9bd5", fontFamily: "var(--font-inter)", fontSize: 14, textDecoration: "underline" }}>← Back to all projects</a>
      </div>
    </section>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function DetailHero({ project }) {
  const mc = marketColor(project.market);
  return (
    <section className="prj-detail-hero" style={{ "--hero-img": `url(${imgFor(project)})` }}>
      <div className="prj-detail-hero-scrim" />
      <div className="ceg-container prj-detail-hero-inner">
        <div className="prj-detail-hero-badges">
          <span className="prj-detail-market" style={{ background: mc.bg, color: mc.text }}>{project.market}</span>
          <span className="prj-detail-tag">{project.tag}</span>
        </div>
        <h1 className="prj-detail-h1">{project.title}</h1>
        <div className="prj-detail-meta-row">
          <span>{project.client}</span>
          <span className="prj-detail-dot">·</span>
          <span>{project.state}</span>
          <span className="prj-detail-dot">·</span>
          <span>{project.year}</span>
        </div>
      </div>
    </section>
  );
}

// ─── Scope stats band ─────────────────────────────────────────────────────────
function DetailStatBand({ project }) {
  if (!project.scopeStats) return null;
  return (
    <div className="prj-detail-stat-band">
      <div className="ceg-container prj-detail-stat-inner">
        {project.scopeStats.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="prj-detail-stat-divider" />}
            <div className="prj-detail-stat">
              <div className="prj-detail-stat-value">{s.value}</div>
              <div className="prj-detail-stat-label">{s.label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Content + sidebar ────────────────────────────────────────────────────────
function DetailContent({ project }) {
  return (
    <section className="prj-detail-content">
      <div className="ceg-container prj-detail-layout">

        {/* Main column */}
        <div className="prj-detail-main">
          <div className="prj-detail-section">
            <div className="ceg-eyebrow fed-eyebrow-blue"><span className="ceg-eyebrow-mark" /><span>The Challenge</span></div>
            <p className="prj-detail-body">{project.challenge || project.blurb}</p>
          </div>
          {project.approach && (
            <div className="prj-detail-section">
              <div className="ceg-eyebrow fed-eyebrow-blue"><span className="ceg-eyebrow-mark" /><span>Our Approach</span></div>
              <p className="prj-detail-body">{project.approach}</p>
            </div>
          )}
          {project.outcome && (
            <div className="prj-detail-section">
              <div className="ceg-eyebrow fed-eyebrow-blue"><span className="ceg-eyebrow-mark" /><span>The Outcome</span></div>
              <p className="prj-detail-body">{project.outcome}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="prj-detail-sidebar">
          {project.scope && (
            <div className="prj-detail-sidebar-card">
              <div className="prj-detail-sidebar-label">Scope of Work</div>
              <ul className="prj-detail-scope-list">
                {project.scope.map((s, i) => (
                  <li key={i}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="prj-detail-sidebar-card">
            <div className="prj-detail-sidebar-label">Project Details</div>
            <div className="prj-detail-sidebar-facts">
              <div className="prj-detail-fact"><span>Client</span><span>{project.client}</span></div>
              <div className="prj-detail-fact"><span>State</span><span>{project.state}</span></div>
              <div className="prj-detail-fact"><span>Year</span><span>{project.year}</span></div>
              <div className="prj-detail-fact"><span>Market</span><span>{project.market}</span></div>
              <div className="prj-detail-fact"><span>Division</span><span>{project.tag}</span></div>
            </div>
          </div>
          <div className="prj-detail-sidebar-cta">
            <p>Have a similar project?</p>
            <a href="#contact" className="fed-btn fed-btn-primary" style={{ width: "100%", justifyContent: "center" }}>Start a Conversation →</a>
          </div>
        </aside>
      </div>
    </section>
  );
}

// ─── Related projects ─────────────────────────────────────────────────────────
function RelatedProjects({ project, allProjects }) {
  const related = allProjects
    .filter(p => p.slug !== project.slug && (p.market === project.market || p.tag === project.tag))
    .slice(0, 3);
  if (!related.length) return null;

  return (
    <section className="prj-related">
      <div className="ceg-container">
        <div className="prj-related-head">
          <div className="ceg-eyebrow fed-eyebrow"><span className="ceg-eyebrow-mark" /><span>More Work</span></div>
          <h2 className="prj-related-h2">Related Projects</h2>
        </div>
        <div className="fed-projects-grid">
          {related.map((p) => (
            <a key={p.slug} href={`/projects/${p.slug}`} className="prj-card prj-card-sm">
              <div className="prj-card-media">
                <img src={imgFor(p)} alt={p.title} loading="lazy" />
              </div>
              <div className="prj-card-body">
                <div className="prj-card-meta">
                  <span>{p.client}</span><span className="prj-card-dot">·</span><span>{p.year}</span>
                </div>
                <h3 className="prj-card-title">{p.title}</h3>
                <span className="prj-card-cta">View Case Study →</span>
              </div>
            </a>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a href="/projects/featured-work" className="div-view-all">← All Featured Work</a>
        </div>
      </div>
    </section>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────
function ProjectDetailApp() {
  const data = window.CEG_DATA;
  const theme = window.CEG_THEMES.drydock;
  const [mobileOpen, setMobileOpen] = usePD(false);

  const slug = window.__CEG_SLUG || "";
  const project = data.PROJECTS.find(p => p.slug === slug);

  usePDE(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = "project-detail";
    if (project) document.title = `${project.title} — Coastal Engineering Group`;
  }, []);

  return (
    <div className="ceg-app concept-drydock page-project-detail" style={window.applyThemeVars(theme)}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        {project ? (
          <>
            <DetailHero project={project} />
            <DetailStatBand project={project} />
            <DetailContent project={project} />
            <RelatedProjects project={project} allProjects={data.PROJECTS} />
          </>
        ) : (
          <ProjectNotFound slug={slug} />
        )}
        <window.ContactBand theme={theme} data={data} />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ProjectDetailApp />);
