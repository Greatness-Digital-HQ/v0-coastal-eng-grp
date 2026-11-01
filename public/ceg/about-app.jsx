// CEG About Page
//
// Kevin's round 1 review cut this page to a single "Our Story" section: the
// eyebrow, the At a Glance, Who We Are, Veteran-Owned, and closing CTA
// sections were removed, and Leadership moved to its own page
// (public/ceg/leadership-app.jsx, /leadership).

const { useState: useS, useEffect: useE } = React;

// ─── About Page Data ─────────────────────────────────────────────────────────
const ABOUT_DATA = {
  hero: {
    headline: "OUR STORY",
    lede: [
      "Coastal Engineering Group was built on a straightforward principle: engineering knowledge and hands-on construction experience belong together. Understanding how a structure is built, and the conditions crews face in the field, helps us develop practical solutions to challenging marine infrastructure problems.",
      "As Coastal has grown, we have expanded our capabilities across marine construction, engineering, dredging, commercial diving, and marine support. We serve federal, state, and local government agencies, waterfront asset owners, and prime contractors, with the ability to mobilize for projects throughout the United States. Our teams help clients inspect, repair, build, and maintain critical infrastructure.",
      "Our veteran-owned roots shape how we work: prepare thoroughly, communicate directly, and take responsibility for the outcome. Safety is a core value that guides how we plan, make decisions, and execute every project, with the goal of sending every team member home safely each day. Whether assessing a submerged structure or executing a complex waterfront repair, we bring practical thinking, technical discipline, and a commitment to the people who depend on our work.",
    ],
  },
};

// ─── About Hero ──────────────────────────────────────────────────────────────
function AboutHero() {
  return (
    <section className="ceg-about-hero">
      <div className="ceg-container">
        <div className="ceg-about-hero-inner">
          <h1 className="ceg-h1 serif">{ABOUT_DATA.hero.headline}</h1>
          {ABOUT_DATA.hero.lede.map((p, i) => (
            <p key={i} className="ceg-about-hero-lede">{p}</p>
          ))}
        </div>
      </div>
      <div className="ceg-about-hero-accent" aria-hidden="true" />
    </section>
  );
}

// ─── About App ───────────────────────────────────────────────────────────────
function AboutApp() {
  const theme = window.CEG_THEMES.drydock;
  const data = window.CEG_DATA;
  const [mobileOpen, setMobileOpen] = useS(false);

  useE(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = "about";
  }, []);

  const themeStyle = window.applyThemeVars(theme);

  return (
    <div className="ceg-app concept-drydock page-about" style={themeStyle}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        <AboutHero />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AboutApp />);
