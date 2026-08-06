// CEG — Projects / Featured Work archive

const { useState: usePA } = React;

const FALLBACK_IMGS = {
  Diving: "/assets/commercial-diving.jpg",
  Engineering: "/assets/marine-engineering.jpg",
  Construction: "/assets/marine-construction.jpg",
  "Marine Services": "/assets/marine-services.jpg",
  Dredging: "/assets/dredging.jpg",
};

const MARKET_COLORS = {
  Federal:       { bg: "#1c6fbf", text: "#fff" },
  "State & Local": { bg: "#0f7b6c", text: "#fff" },
  Commercial:    { bg: "#7c3aed", text: "#fff" },
  Energy:        { bg: "#b45309", text: "#fff" },
  Utility:       { bg: "#374151", text: "#fff" },
};

function imgFor(p) {
  return p.image || FALLBACK_IMGS[p.tag] || "/assets/commercial-diving.jpg";
}

// ─── Filter bar ───────────────────────────────────────────────────────────────
function FilterBar({ active, onChange, projects }) {
  const markets = ["All", ...Array.from(new Set(projects.map(p => p.market))).sort()];
  return (
    <div className="prj-filter-bar">
      <div className="ceg-container">
        <div className="prj-filter-inner">
          {markets.map((m) => (
            <button
              key={m}
              className={`prj-filter-btn ${active === m ? "is-active" : ""}`}
              onClick={() => onChange(m)}
            >
              {m}
              <span className="prj-filter-count">
                {m === "All" ? projects.length : projects.filter(p => p.market === m).length}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────
function ProjectCard({ p }) {
  const mc = MARKET_COLORS[p.market] || { bg: "#374151", text: "#fff" };
  return (
    <a href={`/projects/${p.slug}`} className="prj-card">
      <div className="prj-card-media">
        <img src={imgFor(p)} alt={p.title} loading="lazy" />
        <span
          className="prj-card-market"
          style={{ background: mc.bg, color: mc.text }}
        >{p.market}</span>
      </div>
      <div className="prj-card-body">
        <div className="prj-card-meta">
          <span>{p.client}</span>
          <span className="prj-card-dot">·</span>
          <span>{p.state}</span>
          <span className="prj-card-dot">·</span>
          <span>{p.year}</span>
        </div>
        <h3 className="prj-card-title">{p.title}</h3>
        <p className="prj-card-blurb">{p.blurb}</p>
        <div className="prj-card-foot">
          <span className="prj-card-tag">{p.tag}</span>
          <span className="prj-card-cta">View Case Study →</span>
        </div>
      </div>
    </a>
  );
}

// Read an initial market filter from the URL hash (e.g. #market=Energy), so the
// Markets nav dropdown can deep-link straight into the relevant portfolio view.
// Falls back to "All" if the hash is missing or names a market with no projects.
function initialMarketFromHash(projects) {
  if (typeof window === "undefined") return "All";
  const m = /[#&]market=([^&]+)/.exec(window.location.hash || "");
  if (!m) return "All";
  const want = decodeURIComponent(m[1]);
  const known = new Set(projects.map((p) => p.market));
  return known.has(want) ? want : "All";
}

// ─── Archive page ─────────────────────────────────────────────────────────────
function ProjectsArchive() {
  const data = window.CEG_DATA;
  const [activeFilter, setActiveFilter] = usePA(() => initialMarketFromHash(data.PROJECTS));

  const filtered = activeFilter === "All"
    ? data.PROJECTS
    : data.PROJECTS.filter(p => p.market === activeFilter);

  return (
    <>
      {/* Hero */}
      <section className="prj-archive-hero">
        <div className="ceg-container">
          <div className="prj-archive-hero-inner">
            <div className="ceg-eyebrow fed-eyebrow">
              <span className="ceg-eyebrow-mark" />
              <span>Projects</span>
            </div>
            <h1 className="prj-archive-h1">Selected Marine Infrastructure Projects</h1>
            <p className="prj-archive-lede">
              Coastal Engineering Group supports critical waterfront infrastructure from initial investigation through construction and closeout. Explore representative projects across marine construction, dredging, engineering, underwater inspection, and commercial diving.
            </p>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <div className="prj-archive-body">
        <FilterBar active={activeFilter} onChange={setActiveFilter} projects={data.PROJECTS} />
        <div className="ceg-container">
          <div className="prj-grid">
            {filtered.map((p) => (
              <ProjectCard key={p.slug} p={p} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="prj-empty">No projects found for this filter.</p>
          )}
        </div>
      </div>
    </>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
function ProjectsArchiveApp() {
  const data = window.CEG_DATA;
  const theme = window.CEG_THEMES.drydock;
  const [mobileOpen, setMobileOpen] = usePA(false);

  React.useEffect(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = "projects-archive";
  }, []);

  return (
    <div className="ceg-app concept-drydock page-projects-archive" style={window.applyThemeVars(theme)}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        <ProjectsArchive />
        <window.ContactBand theme={theme} data={data} />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ProjectsArchiveApp />);
