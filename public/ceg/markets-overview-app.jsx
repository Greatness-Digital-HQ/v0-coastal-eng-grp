// CEG — Markets overview.
//
// Kevin's review: Markets shouldn't be a dropdown of five separate market
// pages — condense it into one page. This reuses window.Markets (the card
// grid already built in components.jsx, previously unused) as the top
// section, then gives each market a short anchor block below. Federal is
// the one market with real depth already built (public/ceg/federal-app.jsx,
// with its own SEO/FAQ schema) — that page stays live and this overview
// links into it — the other four markets don't have dedicated pages, so
// their anchor block below is the whole story for now.

const { useState: useMOMobile } = React;

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

function MarketDetail({ m }) {
  const copy = MARKET_COPY[m.key];
  return (
    <div id={`market-${m.key}`} className="ceg-market-detail-card">
      <h3 className="ceg-market-detail-name">{m.name}</h3>
      <p className="ceg-market-detail-tag">{m.detail}</p>
      <p className="ceg-market-detail-body">{copy.body}</p>
      <a href={copy.cta.href} className="ceg-division-card-cta">
        <span className="ceg-division-card-cta-label">{copy.cta.label}</span>
        <span className="ceg-division-card-cta-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/>
          </svg>
        </span>
      </a>
    </div>
  );
}

function MarketsDetailSection({ data }) {
  return (
    <section className="ceg-section ceg-markets-detail-section">
      <div className="ceg-container">
        <div className="ceg-markets-detail-grid">
          {data.MARKETS.map((m) => <MarketDetail key={m.key} m={m} />)}
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
        <window.Markets theme={theme} data={data} />
        <MarketsDetailSection data={data} />
        <window.FinalCTA data={data} />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<MarketsOverviewApp />);
