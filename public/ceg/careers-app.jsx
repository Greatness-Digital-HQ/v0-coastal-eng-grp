// CEG — Careers (dedicated page)
// Built from window.CEG_DATA.CAREERS (pitch, lede, benefits, openRoles) and
// reuses the shared shell components (UtilityBar, Nav, ContactBand, Footer,
// MobileMenu) so the page is consistent with the rest of the site.

const { useState: useCA } = React;

const PAYLOCITY_URL = "https://recruiting.paylocity.com";

// ─── Hero ───────────────────────────────────────────────────────────────────
function CareersHero({ data }) {
  const c = data.CAREERS;
  return (
    <section className="prj-archive-hero">
      <div className="ceg-container">
        <div className="prj-archive-hero-inner">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>Careers</span>
          </div>
          <h1 className="prj-archive-h1">{c.pitch}</h1>
          <p className="prj-archive-lede">{c.lede}</p>
          <div className="careers-hero-ctas">
            <a href={PAYLOCITY_URL} target="_blank" rel="noopener noreferrer" className="ceg-btn ceg-btn-primary">
              View Open Positions →
            </a>
            <a href="#open-roles" className="ceg-btn ceg-btn-ghost">
              See current roles →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Why build a career here (Section 16) ───────────────────────────────────
function CareersWhy({ data }) {
  const cards = data.CAREERS.whyCards || [];
  if (!cards.length) return null;
  return (
    <section className="ceg-section careers-why-section">
      <div className="ceg-container">
        <div className="careers-block-head">
          <Eyebrow mark>Why Coastal</Eyebrow>
          <h2 className="ceg-h2">Why Build a Career at Coastal?</h2>
        </div>
        <div className="careers-why-grid">
          {cards.map((c) => (
            <div key={c.h} className="careers-benefit-card">
              <h3 className="careers-benefit-h">{c.h}</h3>
              <p className="careers-benefit-v">{c.v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Career paths (Section 16) ──────────────────────────────────────────────
function CareersPaths({ data }) {
  const paths = data.CAREERS.paths || [];
  const vets = data.CAREERS.veterans;
  if (!paths.length) return null;
  return (
    <section className="ceg-section careers-paths-section">
      <div className="ceg-container">
        <div className="careers-block-head">
          <Eyebrow mark>Career Paths</Eyebrow>
          <h2 className="ceg-h2">Where You Could Fit</h2>
        </div>
        <div className="careers-paths-grid">
          {paths.map((p) => (
            <div key={p.h} className="careers-path-card">
              <h3 className="careers-path-h">{p.h}</h3>
              <p className="careers-path-v">{p.v}</p>
            </div>
          ))}
        </div>
        {vets && (
          <div className="careers-vets">
            <h3 className="careers-vets-h">{vets.h}</h3>
            <p className="careers-vets-p">{vets.p}</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Benefits ─────────────────────────────────────────────────────────────────
function CareersBenefits({ data }) {
  const c = data.CAREERS;
  return (
    <section className="ceg-section">
      <div className="ceg-container">
        <div className="careers-block-head">
          <Eyebrow mark>Benefits</Eyebrow>
          <h2 className="ceg-h2">Benefits and Support</h2>
        </div>
        <div className="careers-benefits-grid">
          {c.benefits.map((b) => (
            <div key={b.h} className="careers-benefit-card">
              <h3 className="careers-benefit-h">{b.h}</h3>
              <p className="careers-benefit-v">{b.v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Open roles ─────────────────────────────────────────────────────────────────
function CareersRoles({ data }) {
  const c = data.CAREERS;
  return (
    <section id="open-roles" className="ceg-section careers-roles-section">
      <div className="ceg-container">
        <div className="careers-block-head">
          <Eyebrow mark>Open Roles</Eyebrow>
          <h2 className="ceg-h2">Now Hiring Throughout the Eastern United States</h2>
        </div>
        <div className="careers-roles">
          {c.openRoles.map((r) => (
            <a
              key={r.title}
              href={PAYLOCITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="careers-role-row"
            >
              <div className="careers-role-main">
                <h3 className="careers-role-title">{r.title}</h3>
                <div className="careers-role-meta">
                  <span>{r.division}</span>
                  <span className="prj-card-dot">·</span>
                  <span>{r.location}</span>
                  <span className="prj-card-dot">·</span>
                  <span>{r.type}</span>
                </div>
              </div>
              <span className="careers-role-cta">Apply →</span>
            </a>
          ))}
        </div>
        <p className="careers-roles-foot">
          Don't see your role? We're always interested in experienced divers and
          engineers. <a href={PAYLOCITY_URL} target="_blank" rel="noopener noreferrer">Send us your résumé →</a>
        </p>
      </div>
    </section>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
function CareersApp() {
  const data = window.CEG_DATA;
  const theme = window.CEG_THEMES.drydock;
  const [mobileOpen, setMobileOpen] = useCA(false);

  React.useEffect(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = "careers";
    document.title = "Careers — Coastal Engineering Group";
  }, []);

  return (
    <div className="ceg-app concept-drydock page-careers" style={window.applyThemeVars(theme)}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        <CareersHero data={data} />
        <CareersWhy data={data} />
        <CareersPaths data={data} />
        <CareersBenefits data={data} />
        <CareersRoles data={data} />
        <window.ContactBand theme={theme} data={data} />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<CareersApp />);
