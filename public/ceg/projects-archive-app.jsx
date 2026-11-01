// CEG — Projects / Featured Work archive

const { useState: usePA } = React;

const FALLBACK_IMGS = {
  Diving: "/assets/commercial-diving.jpg",
  Engineering: "/assets/marine-engineering.jpg",
  Construction: "/assets/marine-construction.jpg",
  "Marine Services": "/assets/marine-services.jpg",
  Dredging: "/assets/dredging.jpg",
};

function imgFor(p) {
  return p.image || FALLBACK_IMGS[p.tag] || "/assets/commercial-diving.jpg";
}

function marketColor(data, name) {
  const m = data.MARKETS.find((mk) => mk.name === name);
  return { bg: (m && m.color) || "#374151", text: "#fff" };
}

// ─── Filter bars ──────────────────────────────────────────────────────────────
// Two rows per Kevin's round 1 review (#164, #167): Market (the six markets)
// and Service (the five divisions). Every option is shown so the structure is
// visible even where no project is tagged yet; empty ones are disabled.
function FilterRow({ label, options, active, onChange, countFor }) {
  return (
    <div className="prj-filter-inner prj-filter-row">
      <span className="prj-filter-label">{label}</span>
      {options.map(([value, text]) => {
        const count = countFor(value);
        return (
          <button
            key={value}
            className={`prj-filter-btn ${active === value ? "is-active" : ""}`}
            onClick={() => onChange(value)}
            disabled={count === 0 && active !== value}
          >
            {text}
            <span className="prj-filter-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function FilterBar({ data, market, service, onMarket, onService }) {
  const projects = data.PROJECTS;
  const marketOptions = [["All", "All"], ...data.MARKETS.map((m) => [m.name, m.name])];
  const serviceOptions = [["All", "All"], ...data.DIVISIONS.map((d) => [d.key, d.name])];
  // Counts respect the other row's active filter, so the numbers always match
  // what a click would show.
  const inService = (p) => service === "All" || (p.services || []).includes(service);
  const inMarket = (p) => market === "All" || p.market === market;
  return (
    <div className="prj-filter-bar">
      <div className="ceg-container">
        <FilterRow
          label="Market" options={marketOptions} active={market} onChange={onMarket}
          countFor={(v) => projects.filter((p) => inService(p) && (v === "All" || p.market === v)).length}
        />
        <FilterRow
          label="Service" options={serviceOptions} active={service} onChange={onService}
          countFor={(v) => projects.filter((p) => inMarket(p) && (v === "All" || (p.services || []).includes(v))).length}
        />
      </div>
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────
function ProjectCard({ p, data }) {
  const mc = marketColor(data, p.market);
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

// Read initial filters from the URL hash (e.g. #market=Water%20%26%20Wastewater
// or #service=diving), so the Markets page and the service pages can deep-link
// straight into the relevant portfolio view. Values with no tagged project yet
// fall back to "All" rather than landing on an empty grid.
function initialFromHash(key, known) {
  if (typeof window === "undefined") return "All";
  const m = new RegExp(`[#&]${key}=([^&]+)`).exec(window.location.hash || "");
  if (!m) return "All";
  const want = decodeURIComponent(m[1]);
  return known.includes(want) ? want : "All";
}

// ─── Archive page ─────────────────────────────────────────────────────────────
function ProjectsArchive() {
  const data = window.CEG_DATA;
  const [market, setMarket] = usePA(() => initialFromHash("market", data.PROJECTS.map((p) => p.market)));
  const [service, setService] = usePA(() => initialFromHash("service", data.PROJECTS.flatMap((p) => p.services || [])));

  const filtered = data.PROJECTS.filter((p) =>
    (market === "All" || p.market === market) &&
    (service === "All" || (p.services || []).includes(service))
  );

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
            <h1 className="prj-archive-h1">Our Work Above and Below the Waterline</h1>
            <p className="prj-archive-lede">
              Explore Coastal Engineering Group’s work across marine construction, engineering and inspection, dredging, and commercial diving. From bridges and dams to ports and waterfront facilities, these projects demonstrate how we bring technical expertise, practical field solutions, and a commitment to safety to challenging infrastructure assignments.
            </p>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <div className="prj-archive-body">
        <FilterBar data={data} market={market} service={service} onMarket={setMarket} onService={setService} />
        <div className="ceg-container">
          <div className="prj-grid">
            {filtered.map((p) => (
              <ProjectCard key={p.slug} p={p} data={data} />
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
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ProjectsArchiveApp />);
