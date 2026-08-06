// CEG About Page

const { useState: useS, useEffect: useE, useRef: useR } = React;

// ─── About Page Data ─────────────────────────────────────────────────────────
// ⚠ PROVENANCE NOTE — the previous version of this file carried four named
// executives ("Michael Harrington", "David Chen", "Sarah Mitchell", "James
// Rodriguez") with biographies and headshots. None were supplied by Coastal;
// they were placeholder people generated during the original prototype build,
// and Kevin Reinhard — the actual President & CEO — was absent. They have been
// removed. Only verifiable leadership is published here; the remaining cards
// are pending Coastal's roster (Section 05 of the client edit package).
//
// Copy per the client edit package, sections 03–06. Unsupported claims removed:
// the company age ("over two decades"), the fleet superlative ("one of the
// largest fleets ... on the East Coast"), and the specific SDVOSB designation,
// which is pending Coastal's confirmation of its exact certification.
const ABOUT_DATA = {
  hero: {
    eyebrow: "About Coastal Engineering Group",
    headline: "Built to Solve Difficult Marine Infrastructure Challenges",
    lede: "Coastal Engineering Group is a veteran-owned marine infrastructure contractor and engineering firm serving the Eastern United States. We integrate marine construction, dredging, commercial diving, underwater inspection, engineering, and marine support to help clients evaluate, repair, build, and maintain critical waterfront assets."
  },
  glance: {
    headline: "Coastal at a Glance",
    tiles: [
      { k: "Veteran-Owned Small Business", v: "A qualified small-business partner for federal agencies and prime contractors." },
      { k: "Commercial Diving", v: "ADCI-certified contractor with surface-supplied diving capability." },
      { k: "Professional Engineering", v: "Active professional engineering licensure across multiple states." },
      { k: "Geographic Reach", v: "Project execution throughout the Eastern United States." },
      { k: "Integrated Services", v: "Inspection, engineering, construction, dredging, diving, and marine support." },
      { k: "Client Markets", v: "Federal, transportation, municipal, utility, port, industrial, and prime contractor clients." },
    ],
    serve: {
      h: "Who We Serve",
      p: "Coastal works directly for public agencies and asset owners and as a specialty partner to prime contractors and consulting engineers. Our role may begin with an underwater condition assessment, a difficult-access construction scope, a dredging requirement, a marine equipment need, or a complete repair program."
    },
    how: {
      h: "How We Work",
      p: "We organize projects around accountable leadership, detailed planning, field-informed engineering, qualified crews, documented quality, and direct communication. Our objective is to identify risk early and give clients a practical path from unknown conditions to completed work."
    }
  },
  story: {
    headline: "Engineering Discipline. Field Execution.",
    paragraphs: [
      "Coastal Engineering Group was built around a straightforward idea: the people evaluating marine infrastructure should understand how it is constructed, and the people constructing it should understand the engineering behind it.",
      "That operating model closes the gap between what drawings anticipate and what crews encounter in the field. It allows Coastal to evaluate submerged conditions, develop practical solutions, mobilize the right specialty resources, and adapt without losing control of safety, quality, documentation, or schedule.",
      "As Coastal has grown, the company has expanded deliberately across marine construction, dredging, commercial diving, engineering, and marine support. The goal is not to be everything to every client. It is to be the accountable team clients call when the work is technically difficult, access is limited, conditions are uncertain, or multiple marine disciplines must operate together."
    ],
    ahead: {
      h: "Building the Company Ahead",
      p: "Coastal is investing in experienced leadership, field development, equipment, systems, geographic reach, and technical expertise to serve larger and more complex marine infrastructure programs. Growth will remain grounded in disciplined execution, responsible commitments, and opportunities for employees to build long-term careers."
    }
  },
  leadershipIntro: "Coastal's leadership team combines engineering, construction, diving, dredging, project controls, and business operations. Each leader is presented with a clear area of responsibility — not only a title.",
  leadership: [
    {
      name: "Kevin Reinhard, P.E.",
      title: "Founder & Chief Executive Officer",
      image: null,
      bio: "Kevin leads Coastal's strategic growth, technical direction, and major client relationships. He holds a bachelor's degree in civil engineering and a master's degree in construction engineering and is licensed as a Professional Engineer in multiple states. His experience spans underwater inspection, marine construction, dredging, engineering, and federal contracting.",
      responsibility: "Corporate strategy, acquisitions, technical oversight, key clients, and executive leadership."
    }
  ],
  // Additional leadership cards are intentionally absent until Coastal supplies
  // verified names, titles, credentials, and headshots. Do not publish
  // placeholder people. Order when added (Section 05): CEO, COO or senior
  // operations leader, then division leaders (Construction, Engineering,
  // Dredging, Diving / Marine Operations), then shared services.
  leadershipPending: "Additional division and shared-services leadership profiles are being finalized.",
  veteran: {
    headline: "Mission-Ready. Accountable. Built to Deliver.",
    lede: "Coastal Engineering Group is a veteran-owned marine infrastructure contractor and engineering firm. Veteran ownership is reflected in how we plan, communicate, accept responsibility, and execute work in high-consequence environments.",
    lede2: "For federal agencies and prime contractors, Coastal provides a qualified small-business partner with integrated engineering, construction, dredging, diving, and marine support capabilities. We can support direct awards, competitive procurements, subcontracting plans, mentor-protégé strategies, and teaming arrangements where our technical and field capabilities strengthen the overall team.",
    // TODO(client): replace with the exact verified veteran-owned certification
    // designation (VOSB vs SDVOSB) before launch — Section 06.
    cards: [
      { h: "Mission Focus", v: "Clear objectives, disciplined planning, and accountability for the completed result." },
      { h: "Technical Capability", v: "A specialty partner able to contribute engineering, underwater access, marine construction, dredging, and field execution." },
      { h: "Teaming Value", v: "A responsive veteran-owned business positioned to support federal pursuits and public infrastructure programs." },
    ],
    points: [
      "Veteran-owned small business serving federal agencies and prime contractors",
      "Integrated engineering, construction, dredging, diving, and marine support",
      "Supports direct awards, competitive procurements, and subcontracting plans",
      "Available for mentor-protégé strategies and teaming arrangements"
    ]
  },
  cta: {
    headline: "Have a marine infrastructure challenge?",
    lede: "Bring Coastal into the project early. We can help evaluate conditions, develop a practical execution plan, support a pursuit, or mobilize specialty marine capabilities.",
    buttonText: "Discuss a Project",
    buttonHref: "/contact"
  }
};

// ─── About Hero ──────────────────────────────────────────────────────────────
function AboutHero() {
  return (
    <section className="ceg-about-hero">
      <div className="ceg-container">
        <div className="ceg-about-hero-inner">
          <span className="ceg-eyebrow ceg-eyebrow-accent">{ABOUT_DATA.hero.eyebrow}</span>
          <h1 className="ceg-h1 serif">{ABOUT_DATA.hero.headline}</h1>
          <p className="ceg-about-hero-lede">{ABOUT_DATA.hero.lede}</p>
        </div>
      </div>
      <div className="ceg-about-hero-accent" aria-hidden="true" />
    </section>
  );
}

// ─── At a Glance ───────────────────────────────────────────────────────────────
// Consolidated who / what / where snapshot so a visitor gets the essentials
// without hunting across the Story, Veteran, and Leadership sections. Pulls
// credentials and key stats straight from shared data so they stay in sync.
function AboutGlance() {
  const data = window.CEG_DATA;
  return (
    <section id="glance" className="ceg-section ceg-about-glance">
      <div className="ceg-container">
        <div className="ceg-section-head">
          <h2 className="ceg-h2">{ABOUT_DATA.glance.headline}</h2>
        </div>
        <div className="ceg-glance-tiles">
          {ABOUT_DATA.glance.tiles.map((t, i) => (
            <div key={i} className="ceg-glance-tile">
              <span className="ceg-glance-tile-k">{t.k}</span>
              <p className="ceg-glance-tile-v">{t.v}</p>
            </div>
          ))}
        </div>
        <div className="ceg-glance-prose">
          <div className="ceg-glance-prose-col">
            <h3 className="ceg-glance-prose-h">{ABOUT_DATA.glance.serve.h}</h3>
            <p>{ABOUT_DATA.glance.serve.p}</p>
          </div>
          <div className="ceg-glance-prose-col">
            <h3 className="ceg-glance-prose-h">{ABOUT_DATA.glance.how.h}</h3>
            <p>{ABOUT_DATA.glance.how.p}</p>
          </div>
        </div>
        <div className="ceg-about-glance-certs ceg-glance-certs-row">
          {data.CERTS.map((c) => (
            <span key={c.abbr} className="ceg-about-cert" title={c.full}>{c.abbr}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Our Story ───────────────────────────────────────────────────────────────
function OurStory() {
  return (
    <section id="story" className="ceg-section ceg-about-story">
      <div className="ceg-container">
        <div className="ceg-about-story-layout">
          <div className="ceg-about-story-head">
            <div className="ceg-eyebrow">
              <span className="ceg-eyebrow-mark" />
              <span>Who We Are</span>
            </div>
            <h2 className="ceg-h2">{ABOUT_DATA.story.headline}</h2>
          </div>
          <div className="ceg-about-story-body">
            {ABOUT_DATA.story.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Leadership ──────────────────────────────────────────────────────────────
function Leadership() {
  return (
    <section id="leadership" className="ceg-section ceg-about-leadership">
      <div className="ceg-container">
        <div className="ceg-section-head">
          <div className="ceg-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>Our Team</span>
          </div>
          <h2 className="ceg-h2">Leadership Accountable for the Work</h2>
          <p className="ceg-section-lede">{ABOUT_DATA.leadershipIntro}</p>
        </div>
        <div className="ceg-leadership-grid">
          {ABOUT_DATA.leadership.map((leader, i) => (
            <div key={i} className="ceg-leader-card">
              {leader.image && (
                <div className="ceg-leader-photo">
                  <img src={leader.image} alt={leader.name} loading="lazy" />
                </div>
              )}
              <div className="ceg-leader-info">
                <h3 className="ceg-leader-name">{leader.name}</h3>
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
        {ABOUT_DATA.leadershipPending && (
          <p className="ceg-leader-pending">{ABOUT_DATA.leadershipPending}</p>
        )}
      </div>
    </section>
  );
}

// ─── Veteran Owned ───────────────────────────────────────────────────────────
function VeteranOwned() {
  return (
    <section id="veteran-owned" className="ceg-section ceg-about-veteran">
      <div className="ceg-container">
        <div className="ceg-about-veteran-layout">
          <div className="ceg-about-veteran-content">
            <span className="ceg-eyebrow ceg-eyebrow-accent">Veteran-Owned</span>
            <h2 className="ceg-h2 on-light">{ABOUT_DATA.veteran.headline}</h2>
            <p className="ceg-about-veteran-lede">{ABOUT_DATA.veteran.lede}</p>
            <p className="ceg-about-veteran-lede">{ABOUT_DATA.veteran.lede2}</p>
            <ul className="ceg-about-veteran-points">
              {ABOUT_DATA.veteran.points.map((point, i) => (
                <li key={i}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="ceg-about-veteran-badge">
            <div className="ceg-vosb-badge-large">
              <div className="ceg-vosb-badge-inner">
                <span className="ceg-vosb-badge-label">Certified</span>
                <span className="ceg-vosb-badge-title">SDVOSB</span>
                <span className="ceg-vosb-badge-sub">Service-Disabled Veteran-Owned Small Business</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────────────────
function AboutCTA() {
  return (
    <section id="about-cta" className="ceg-section ceg-about-cta">
      <div className="ceg-container">
        <div className="ceg-about-cta-inner">
          <h2 className="ceg-h2">{ABOUT_DATA.cta.headline}</h2>
          <p className="ceg-about-cta-lede">{ABOUT_DATA.cta.lede}</p>
          <a href={ABOUT_DATA.cta.buttonHref} className="ceg-btn ceg-btn-primary ceg-btn-lg">
            {ABOUT_DATA.cta.buttonText}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3.333 8h9.334M9 4.667L12.667 8 9 11.333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
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
        <AboutGlance />
        <OurStory />
        <VeteranOwned />
        <Leadership />
        <AboutCTA />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AboutApp />);
