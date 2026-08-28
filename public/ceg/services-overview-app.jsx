// CEG — All Services hub page.
//
// Kevin asked us to look at how Ballard structures theirs: lean at the top,
// a full list of services with expandable categories in ONE place, then
// photos. He was explicit that he does NOT want that full expandable list
// repeated on every individual service page — just here, once, as the map
// of everything Coastal does. This page reuses window.Divisions (the
// tab-accordion already built for the homepage's Capabilities section) as
// that single expandable list, with a lean hero above it and nothing else
// competing for attention below.

const { useState: useSOMobile } = React;

function ServicesOverviewHero() {
  return (
    <section className="prj-archive-hero">
      <div className="ceg-container">
        <div className="prj-archive-hero-inner">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>Services</span>
          </div>
          <h1 className="prj-archive-h1">Five Divisions. One Accountable Team.</h1>
          <p className="prj-archive-lede">
            Marine construction, engineering and inspection, dredging, commercial
            diving and underwater construction, and fleet and marine support —
            self-performed by one company so nothing gets lost between design,
            equipment, and the water.
          </p>
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
        <window.FinalCTA data={data} />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ServicesOverviewApp />);
