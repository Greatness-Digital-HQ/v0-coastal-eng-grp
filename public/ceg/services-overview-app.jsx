// CEG — All Services hub page.
//
// Kevin asked us to look at how Ballard structures theirs: lean at the top,
// a full list of services in ONE place, then photos. He was explicit that
// he does NOT want a full list repeated on every individual service page —
// just here, once, as the map of everything Coastal does. He later asked
// for two more changes to this page specifically: (1) the same brightened
// hero-photo treatment as the individual service pages, applied here too,
// and (2) window.Divisions changed from a tab-accordion into a grid of
// large clickable tiles — the accordion shape stays on the homepage's
// Capabilities section, not here.

const { useState: useSOMobile } = React;

function ServicesOverviewHero() {
  return (
    <section className="div-hero svc-hero">
      <div className="svc-hero-photo" aria-hidden="true" style={{ backgroundImage: "url('/assets/hero-background.webp')" }} />
      <div className="ceg-container">
        {/* Round 1 (Kevin): the visible H1, paragraph, and button are gone —
            the hero is just the photo and the "Services" eyebrow. The H1
            stays for search engines and screen readers, visually hidden. */}
        <div className="div-hero-inner">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>Services</span>
          </div>
          <h1 className="ceg-sr-only">Marine Construction, Engineering, Dredging &amp; Diving Services</h1>
        </div>
      </div>
    </section>
  );
}

function ServicesOverviewApp() {
  const theme = window.CEG_THEMES.drydock;
  const data = window.CEG_DATA;
  const [mobileOpen, setMobileOpen] = useSOMobile(false);

  React.useEffect(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = "services";
  }, []);

  const themeStyle = window.applyThemeVars(theme);

  return (
    <div className="ceg-app concept-drydock page-services" style={themeStyle}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        <ServicesOverviewHero />
        <window.Divisions theme={theme} data={data} />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ServicesOverviewApp />);
