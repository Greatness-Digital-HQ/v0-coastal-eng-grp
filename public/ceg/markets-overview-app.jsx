// CEG — Markets overview.
//
// One page, one tab-accordion (same shape as the Services hub) so each
// market's name and description appear exactly once. Kevin's round 1 review
// replaced the five original markets with six (#154-159), rewrote the intro
// (#153), removed the eyebrow and the closing CTA band (#151-152), and turned
// each market's "Discuss a … project" button into a link to that market's
// projects (#160). Federal & Defense still links to its deep-dive page,
// public/ceg/federal-app.jsx.

const { useState: useMOMobile, useState: useMOActive } = React;

// Closest-matching photography already on hand for each market.
const MARKET_PHOTOS = {
  federal: "/assets/federal-hero-bg.webp",
  transportation: "/assets/railroad-bridge-inspection.webp",
  ports: "/assets/marine-services.webp",
  water: "/assets/water-tank-repair.webp",
  dams: "/assets/federal-project-dam.webp",
  "energy-industrial": "/assets/cable-relocation.webp",
};

const projectsLink = (name) => `/projects/featured-work#market=${encodeURIComponent(name)}`;

const MARKET_COPY = {
  federal: {
    body: "Coastal supports federal agencies and their prime contractors with marine construction, engineering, dredging, and underwater services. As a veteran-owned small business, we bring coordinated field capabilities, detailed planning, and clear documentation to waterfront facilities, navigation structures, and other federal infrastructure.",
    cta: { label: "Explore our federal work", href: "/markets/federal" },
  },
  transportation: {
    body: "We help transportation agencies, rail operators, and their contractors inspect, maintain, and rehabilitate infrastructure over and adjacent to water. Our services include underwater inspections, substructure repairs, scour protection, and marine access support for work beneath bridges and along transportation corridors.",
    cta: { label: "View Bridges & Transportation projects", href: projectsLink("Bridges & Transportation") },
  },
  ports: {
    body: "We support port authorities, municipalities, terminal operators, and waterfront owners with construction, rehabilitation, dredging, and inspection services. Typical work includes piers, wharves, bulkheads, seawalls, mooring structures, and waterfront access improvements, coordinated around facility operations and marine traffic.",
    cta: { label: "View Ports, Harbors & Waterfronts projects", href: projectsLink("Ports, Harbors & Waterfronts") },
  },
  water: {
    body: "We help utilities and municipalities inspect, repair, and maintain infrastructure that collects, stores, treats, and conveys water. Our capabilities support intakes, outfalls, tanks, reservoirs, gates, and submerged piping through commercial diving, sediment removal, structural repairs, and engineering assessments.",
    cta: { label: "View Water & Wastewater projects", href: projectsLink("Water & Wastewater") },
  },
  dams: {
    body: "We support dam owners, water authorities, and public agencies with inspection, rehabilitation, and sediment management. Services include underwater assessments, concrete repairs, gate replacement, scour protection, and dredging to help maintain water-control structures and associated waterways.",
    cta: { label: "View Dams & Water Resources projects", href: projectsLink("Dams & Water Resources") },
  },
  "energy-industrial": {
    body: "We serve energy producers and industrial facility owners with inspection, maintenance, and construction support for marine and submerged infrastructure. Our work addresses cooling-water intakes, discharge structures, waterfront foundations, and corrosion protection, with execution planned around operating requirements and outage schedules.",
    cta: { label: "View Energy & Industrial projects", href: projectsLink("Energy & Industrial") },
  },
};

const MARKETS_INTRO = [
  "Coastal Engineering Group serves the agencies, owners, and contractors responsible for the infrastructure that connects communities, supports commerce, and manages essential water and energy resources.",
  "We combine marine construction, engineering and inspection, dredging, commercial diving, and marine support to address challenging conditions above and below the waterline. From bridges and dams to ports and treatment facilities, we help clients assess conditions, execute repairs, and build lasting improvements, with safety and accountability guiding every project.",
  "We work with federal, state, and local agencies, public authorities, private owners, and prime contractors, with the ability to mobilize throughout the United States.",
];

function MarketsOverviewHero() {
  return (
    <section className="prj-archive-hero">
      <div className="ceg-container">
        <div className="prj-archive-hero-inner">
          <h1 className="prj-archive-h1">Markets We Serve.</h1>
          {MARKETS_INTRO.map((p, i) => (
            <p key={i} className="prj-archive-lede">{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

// Single expandable section — same tab-accordion shape as the Services hub's
// Divisions component (photo | name, detail tag, one paragraph, CTA), so a
// market's name and description each appear exactly once on the page.
function MarketsAccordion({ data }) {
  const [active, setActive] = useMOActive(0);
  const m = data.MARKETS[active];
  const copy = MARKET_COPY[m.key];

  return (
    <section className="ceg-section ceg-divisions">
      <div className="ceg-container">
        <div className="ceg-divisions-grid">
          <div className="ceg-divisions-tabs">
            {data.MARKETS.map((mk, i) => (
              <button
                key={mk.key}
                className={`ceg-division-tab ${i === active ? "is-active" : ""}`}
                type="button"
                onClick={() => setActive(i)}
              >
                <span className="ceg-division-tab-num">0{i + 1}</span>
                <span className="ceg-division-tab-name">{mk.name}</span>
                <svg className="ceg-division-tab-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
            ))}
          </div>

          <div className="ceg-divisions-display">
            <div
              className="ceg-photo is-tall"
              style={{ backgroundImage: `url('${MARKET_PHOTOS[m.key]}')`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <div className="ceg-division-card">
              <div className="ceg-division-card-num">0{active + 1}</div>
              <div className="ceg-division-card-name">{m.name}</div>
              <p className="ceg-market-detail-tag">{m.detail}</p>
              <p className="ceg-division-card-blurb">{copy.body}</p>
              <a href={copy.cta.href} className="ceg-division-card-cta">
                <span className="ceg-division-card-cta-label">{copy.cta.label}</span>
                <span className="ceg-division-card-cta-arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/>
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketsOverviewApp() {
  const theme = window.CEG_THEMES.drydock;
  const data = window.CEG_DATA;
  const [mobileOpen, setMobileOpen] = useMOMobile(false);

  React.useEffect(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = "markets";
  }, []);

  const themeStyle = window.applyThemeVars(theme);

  return (
    <div className="ceg-app concept-drydock page-markets" style={themeStyle}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        <MarketsOverviewHero />
        <MarketsAccordion data={data} />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<MarketsOverviewApp />);
