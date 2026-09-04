// CEG — Markets overview.
//
// Kevin's review, round 1: Markets shouldn't be a dropdown of five separate
// market pages — condense it into one page. Round 2 (after seeing it live):
// "the markets page has redundant sections" — the original build paired a
// card grid (window.Markets) with a second block below restating the same
// name/detail for each market, linked by an anchor jump. That's gone now:
// this page uses the same single tab-accordion pattern as the new Services
// hub (public/ceg/services-overview-app.jsx) — one place to see every
// market, nothing repeated. Federal is the one market with real depth
// already built (public/ceg/federal-app.jsx, with its own SEO/FAQ schema);
// that page stays live and the accordion's Federal tab links into it.

const { useState: useMOMobile, useState: useMOActive } = React;

// Real photos instead of the old hand-drawn placeholder illustration — only
// Federal has its own dedicated photography, so the other four reuse the
// closest-matching division photo already on hand.
const MARKET_PHOTOS = {
  federal: "/assets/federal-hero-bg.jpg",
  "state-local": "/assets/marine-construction.jpg",
  energy: "/assets/commercial-diving.jpg",
  commercial: "/assets/marine-services.jpg",
  industrial: "/assets/dredging.jpg",
};

const MARKET_COPY = {
  federal: {
    body: "As a veteran-owned small business, Coastal is positioned for direct teaming on NAVFAC and USACE set-aside opportunities — marine construction, dredging, commercial diving, and engineering support for federal waterfront and coastal-resilience programs.",
    cta: { label: "Explore our federal work", href: "/markets/federal" },
  },
  "state-local": {
    body: "Coastal supports state departments of transportation, port authorities, and municipal owners with bridge, pier, bulkhead, and waterway infrastructure — from underwater inspection through construction and repair.",
    cta: { label: "Discuss a state or local project", href: "/contact" },
  },
  energy: {
    body: "Coastal's marine construction and diving capabilities support offshore wind, LNG, and transmission infrastructure, including cable and pipeline installation, structural work, and underwater inspection.",
    cta: { label: "Discuss an energy project", href: "/contact" },
  },
  commercial: {
    body: "Coastal serves private waterfront owners and operators with construction, repair, and inspection of marinas, terminals, and piers.",
    cta: { label: "Discuss a commercial project", href: "/contact" },
  },
  industrial: {
    body: "Coastal supports industrial facility owners with waterfront construction, outfall and intake work, and underwater inspection for heavy industry operations.",
    cta: { label: "Discuss an industrial project", href: "/contact" },
  },
};

function MarketsOverviewHero() {
  return (
    <section className="prj-archive-hero">
      <div className="ceg-container">
        <div className="prj-archive-hero-inner">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>Markets</span>
          </div>
          <h1 className="prj-archive-h1">Markets We Serve.</h1>
          <p className="prj-archive-lede">
            Federal agencies, state and local owners, energy, commercial, and
            industrial clients — Coastal brings the same self-performed marine
            construction, engineering, dredging, and diving capability to
            each.
          </p>
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
        <window.FinalCTA data={data} />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<MarketsOverviewApp />);
