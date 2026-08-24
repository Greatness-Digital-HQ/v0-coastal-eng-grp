// CEG — Capabilities / Services overview.
//
// Replaces the old "Capabilities" mega-menu (five links opening a dropdown).
// This single page carries the same five divisions plus a way to go deeper —
// the card grid links straight into the existing per-division pages
// (/services/construction, /services/diving, etc.), which stay live for
// anyone who wants the full detail; they're just no longer hung off the nav.
//
// Reuses window.Capabilities (card grid) and window.Divisions (tabbed detail)
// from components.jsx — both already built and styled, just not wired into
// any route before now — plus the shared archive-style hero already used by
// the Careers and Projects pages.

const { useState: useSVOMobile } = React;

function ServicesOverviewHero() {
  return (
    <section className="prj-archive-hero">
      <div className="ceg-container">
        <div className="prj-archive-hero-inner">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>Capabilities</span>
          </div>
          <h1 className="prj-archive-h1">Five Divisions, Self-Performed as One Team.</h1>
          <p className="prj-archive-lede">
            Marine construction, engineering &amp; inspection, dredging, commercial
            diving, and fleet &amp; marine support — coordinated through one
            accountable company. Explore a division below, or discuss a project
            that spans several.
          </p>
        </div>
      </div>
    </section>
  );
}

function ServicesOverviewApp() {
  const theme = window.CEG_THEMES.drydock;
  const data = window.CEG_DATA;
  const [mobileOpen, setMobileOpen] = useSVOMobile(false);

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
        <window.Capabilities theme={theme} data={data} />
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
