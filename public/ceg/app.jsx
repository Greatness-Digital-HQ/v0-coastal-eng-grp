// CEG Homepage — Drydock concept (final selection).

const { useState: useS, useEffect: useE } = React;

function App() {
  const theme = window.CEG_THEMES.drydock;
  const data = window.CEG_DATA;
  const [mobileOpen, setMobileOpen] = useS(false);

  useE(() => {
    document.body.dataset.concept = "drydock";
  }, []);

  const themeStyle = window.applyThemeVars(theme);

  return (
    <div className="ceg-app concept-drydock" style={themeStyle}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        {/* Restructured per Kevin's direct ask: "structure identical to
            ballardmc.com." Ballard's homepage is Hero -> one intro section
            (statement/paragraph split, a services teaser, a markets diagram)
            -> Featured Projects -> Footer. Nothing else. That means
            Capabilities (the services accordion), WhyCEG, and FinalCTA are
            off the homepage now — none of those exist on Ballard's homepage
            — but nothing was deleted from the codebase, just unused here;
            Capabilities/WhyCEG aren't rendered anywhere else, FinalCTA still
            is (services hub, markets page). */}
        <window.Hero theme={theme} data={data} conceptKey="drydock" />
        <window.NarrativeIntro data={data} />
        <window.FeaturedProjects theme={theme} data={data} />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
