// CEG Leadership Page
//
// Split out of the About page per Kevin's round 1 review (#10, #18): the
// flyout's Leadership link used to land on /about#leadership, which read as
// the same page as About.
//
// ⚠ PROVENANCE NOTE — only verified leadership is published. The prototype's
// placeholder executives (and their headshots in public/assets/leadership-*)
// were never supplied by Coastal and must not be used. Add further cards only
// once Coastal provides verified names, titles, credentials, and headshots.
// Order when added: CEO, COO or senior operations leader, then division
// leaders (Construction, Engineering, Dredging, Diving / Marine Operations),
// then shared services.

const { useState: useLS, useEffect: useLE } = React;

const LEADERSHIP_DATA = {
  headline: "Leadership",
  intro: "Coastal's leadership team combines engineering, construction, diving, dredging, project controls, and business operations. Each leader is presented with a clear area of responsibility — not only a title.",
  leaders: [
    {
      name: "Kevin Reinhard, P.E.",
      title: "Founder & Chief Executive Officer",
      image: null,
      bio: "Kevin leads Coastal's strategic growth, technical direction, and major client relationships. He holds a bachelor's degree in civil engineering and a master's degree in construction engineering and is licensed as a Professional Engineer in multiple states. His experience spans underwater inspection, marine construction, dredging, engineering, and federal contracting.",
      responsibility: "Corporate strategy, acquisitions, technical oversight, key clients, and executive leadership.",
    },
  ],
  pending: "Additional division and shared-services leadership profiles are being finalized.",
};
// Profiles published in the dashboard replace the built-in card (see data.jsx).
if (window.CEG_DB) LEADERSHIP_DATA.leaders = window.CEG_DB.leaders;

function LeadershipHero() {
  return (
    <section className="ceg-about-hero">
      <div className="ceg-container">
        <div className="ceg-about-hero-inner">
          <h1 className="ceg-h1 serif">{LEADERSHIP_DATA.headline}</h1>
          <p className="ceg-about-hero-lede">{LEADERSHIP_DATA.intro}</p>
        </div>
      </div>
      <div className="ceg-about-hero-accent" aria-hidden="true" />
    </section>
  );
}

function LeadershipGrid() {
  return (
    <section id="leadership" className="ceg-section ceg-about-leadership">
      <div className="ceg-container">
        <div className="ceg-leadership-grid">
          {LEADERSHIP_DATA.leaders.map((leader, i) => (
            <div key={i} className="ceg-leader-card">
              {leader.image && (
                <div className="ceg-leader-photo">
                  <img src={leader.image} alt={leader.name} loading="lazy" />
                </div>
              )}
              <div className="ceg-leader-info">
                <h2 className="ceg-leader-name">{leader.name}</h2>
                <span className="ceg-leader-title">{leader.title}</span>
                <p className="ceg-leader-bio">{leader.bio}</p>
                {leader.responsibility && (
                  <p className="ceg-leader-resp">
                    <strong>Responsibility:</strong> {leader.responsibility}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        {LEADERSHIP_DATA.pending && (
          <p className="ceg-leader-pending">{LEADERSHIP_DATA.pending}</p>
        )}
      </div>
    </section>
  );
}

function LeadershipApp() {
  const theme = window.CEG_THEMES.drydock;
  const data = window.CEG_DATA;
  const [mobileOpen, setMobileOpen] = useLS(false);

  useLE(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = "leadership";
  }, []);

  return (
    <div className="ceg-app concept-drydock page-about page-leadership" style={window.applyThemeVars(theme)}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        <LeadershipHero />
        <LeadershipGrid />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<LeadershipApp />);
