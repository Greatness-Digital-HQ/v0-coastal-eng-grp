// CEG homepage components — concept-aware via theme prop.
// All components consume `theme` (resolved THEMES[key]) and `data` (CEG_DATA).

const { useState, useEffect, useRef } = React;

// ─── Reveal hook ─────────────────────────────────────────────────────────────
// Adds class "is-revealed" to the ref'd element when it enters the viewport.
// threshold: 0–1, delay: optional extra ms offset for the first fire.
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("is-revealed"); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── Utilities ──────────────────────────────────────────────────────────────
function applyThemeVars(theme) {
  const c = theme.colors;
  const t = theme.type;
  const f = theme.fonts;
  return {
    "--bg": c.bg,
    "--surface": c.surface,
    "--surface-alt": c.surfaceAlt,
    "--ink": c.ink,
    "--ink-soft": c.inkSoft,
    "--ink-mute": c.inkMute,
    "--rule": c.rule,
    "--brand": c.brand,
    "--brand-hi": c.brandHi,
    "--brand-soft": c.brandSoft,
    "--accent": c.accent,
    "--on-brand": c.onBrand,
    "--hero-overlay": c.heroOverlay,
    "--hero-bg": c.heroBg || c.brand,
    "--hero-ink": c.heroInk || c.onBrand,
    "--font-display": f.display,
    "--font-display-cond": f.displayCond || f.display,
    "--font-body": f.body,
    "--font-mono": f.mono,
    "--eyebrow-size": t.eyebrowSize,
    "--eyebrow-spacing": t.eyebrowSpacing,
    "--h1-size": t.h1,
    "--h1-weight": t.h1Weight,
    "--h1-lh": t.h1Lh,
    "--h2-size": t.h2,
    "--h2-weight": t.h2Weight,
    "--body-size": t.body,
    "--body-lh": t.bodyLh,
  };
}

// ─── Tiny atoms ─────────────────────────────────────────────────────────────
function Eyebrow({ children, mark = false }) {
  return (
    <div className="ceg-eyebrow">
      {mark && <span className="ceg-eyebrow-mark" />}
      <span>{children}</span>
    </div>
  );
}

function Btn({ children, variant = "primary", arrow = true, href = "#", onClick, className = "" }) {
  return (
    <a href={href} onClick={onClick} className={`ceg-btn ceg-btn-${variant} ${className}`.trim()}>
      <span>{children}</span>
      {arrow && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
      )}
    </a>
  );
}

// ─── Top utility bar ────────────────────────────────────────────────────────
function UtilityBar({ theme, data }) {
  return (
    <div className="ceg-util">
      <div className="ceg-container ceg-util-row">
        <div className="ceg-util-left">
          <span className="ceg-util-pill">
            <svg className="ceg-flag" viewBox="0 0 19 10" aria-hidden xmlns="http://www.w3.org/2000/svg">
              <rect width="19" height="10" fill="#B22234" />
              <rect y="0.77"  width="19" height="0.77" fill="#fff" />
              <rect y="2.31"  width="19" height="0.77" fill="#fff" />
              <rect y="3.85"  width="19" height="0.77" fill="#fff" />
              <rect y="5.39"  width="19" height="0.77" fill="#fff" />
              <rect y="6.93"  width="19" height="0.77" fill="#fff" />
              <rect y="8.47"  width="19" height="0.77" fill="#fff" />
              <rect width="7.6" height="5.39" fill="#3C3B6E" />
            </svg>
            Veteran-Owned Small Business
          </span>
          <span className="ceg-util-sep">·</span>
          <span>NAVFAC · USACE · USCG</span>
        </div>
        <div className="ceg-util-right">
          {/* Phone moved up here from the nav row per Kevin's ask — merges
              the old logo row + sticky nav bar into one, going from three
              stacked header bars down to two. */}
          <a href={`tel:${data.CONTACT.phone}`}>{data.CONTACT.phone}</a>
          <span className="ceg-util-sep">·</span>
          {/* Was "Emergency Marine Response" (a dead "#contact" anchor before
              that) — shortened to "Safety" per Kevin's review, still points
              at the real Safety & Quality page. data.CONTACT.emergency
              itself is untouched — it's still used, correctly, elsewhere
              (footer hours, contact page) to describe the actual 24/7
              emergency-response line. */}
          <a href="/safety-quality">Safety</a>
          <span className="ceg-util-sep">·</span>
          <a href="/careers">Careers</a>
          <a href="#partners">Partner Portal</a>
        </div>
      </div>
    </div>
  );
}

// ─── Navigation ─────────────────────────────────────────────────────────────
function Nav({ theme, data, conceptKey, onMobileOpen }) {
  const [openKey, setOpenKey] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [panelLeft, setPanelLeft] = useState(null);
  const navRef = useRef(null);
  const triggerRefs = useRef({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isMega = theme.nav === "mega" || theme.nav === "mega-centered";
  const isCentered = theme.nav === "mega-centered";
  // Drydock concept: click-to-open with a single shared mega panel anchored to the nav row
  const isClickNav = conceptKey === "drydock";

  // Close on outside click / Escape when in click-nav mode
  useEffect(() => {
    if (!isClickNav || !openKey) return;
    const onDocClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenKey(null);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpenKey(null); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isClickNav, openKey]);

  // The shared panel is rendered once at the end of <nav>, not nested under
  // whichever item is open, so it needs its own left offset — otherwise it
  // just centers under the whole nav row instead of under the open trigger.
  const positionPanel = (key) => {
    const btn = triggerRefs.current[key];
    const navEl = navRef.current;
    if (btn && navEl) {
      const btnRect = btn.getBoundingClientRect();
      const navRect = navEl.getBoundingClientRect();
      setPanelLeft(btnRect.left - navRect.left + btnRect.width / 2);
    }
  };

  const handleTrigger = (key) => {
    if (isClickNav) {
      setOpenKey((cur) => {
        const next = cur === key ? null : key;
        if (next) positionPanel(next);
        return next;
      });
    }
  };

  // Keep it aligned if the viewport resizes while open.
  useEffect(() => {
    if (!isClickNav || !openKey) return;
    const onResize = () => positionPanel(openKey);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isClickNav, openKey]);

  const navItems = (
    <nav
      ref={navRef}
      className={`ceg-nav-main ${isClickNav ? "is-click-nav" : ""} ${openKey ? "has-open" : ""}`}
      onMouseLeave={isClickNav ? undefined : () => setOpenKey(null)}
    >
      {Object.entries(data.NAV).map(([key, item]) => {
        // Direct-link items (no `items`) render as a plain link — no dropdown,
        // no chevron. Keeps Projects / Careers a single click away.
        if (!item.items) {
          return (
            <div key={key} className="ceg-nav-item">
              <a className="ceg-nav-trigger ceg-nav-trigger-link" href={item.href}>
                <span>{item.label}</span>
              </a>
            </div>
          );
        }
        return (
          <div
            key={key}
            className={`ceg-nav-item ${openKey === key ? "is-open" : ""}`}
            onMouseEnter={isClickNav ? undefined : () => setOpenKey(key)}
          >
            <button
              className="ceg-nav-trigger"
              type="button"
              aria-expanded={openKey === key}
              aria-haspopup="true"
              onClick={() => handleTrigger(key)}
              ref={(el) => { triggerRefs.current[key] = el; }}
            >
              <span>{item.label}</span>
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
            {/* Per-item panels only when NOT in click-nav (shared panel) mode */}
            {!isClickNav && openKey === key && (
              isMega ? <MegaPanel navKey={key} item={item} data={data} /> : <SimplePanel item={item} navKey={key} data={data} />
            )}
          </div>
        );
      })}
      {/* Shared, nav-anchored dropdown for click-nav (Drydock). Plain list only
          — no featured column, no CTA card — per Kevin's review. */}
      {isClickNav && openKey && data.NAV[openKey] && data.NAV[openKey].items && (
        <SimplePanel
          navKey={openKey}
          item={data.NAV[openKey]}
          data={data}
          shared
          style={panelLeft != null ? { left: `${panelLeft}px` } : undefined}
        />
      )}
    </nav>
  );

  if (isCentered) {
    // Merged logo row + sticky menu bar into one container per Kevin's ask
    // (was two stacked bars here, plus the utility bar above = three total;
    // phone moved up into the utility bar, so this is now just one bar).
    return (
      <header className={`ceg-nav-shell ceg-nav-combined nav-${theme.nav} ${scrolled ? "is-scrolled" : ""}`}>
        <div className="ceg-container ceg-nav-combined-inner">
          <a href="/" className="ceg-logo ceg-logo-left">
            <img src="/assets/logo-horizontal.png" alt="Coastal Engineering Group" />
          </a>
          {navItems}
          <div className="ceg-nav-combined-right">
            <Btn href="/contact" variant="primary" arrow={false} className="ceg-nav-combined-cta">Discuss a Project</Btn>
            <button className="ceg-nav-burger" onClick={onMobileOpen} aria-label="Open menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`ceg-nav-shell nav-${theme.nav}`}>
      {/* Logo row — static, scrolls away */}
      <div className="ceg-nav-logo-row">
        <div className="ceg-container ceg-nav-logo-inner">
          <a href="/" className="ceg-logo">
            <img src="/assets/logo-horizontal.png" alt="Coastal Engineering Group" />
          </a>
          <a href="#contact" className="ceg-nav-phone">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 2h2l1.5 3-1.5 1c.7 1.4 1.6 2.3 3 3l1-1.5L12 9v2c0 .6-.4 1-1 1C6.6 12 2 7.4 2 3c0-.6.4-1 1-1z" stroke="currentColor" strokeWidth="1.3" fill="none"/>
            </svg>
            {data.CONTACT.phone}
          </a>
        </div>
      </div>

      {/* Menu bar — sticky */}
      <div className={`ceg-nav-menu-bar ${scrolled ? "is-scrolled" : ""}`}>
        <div className="ceg-container ceg-nav-row">
          {navItems}
          <div className="ceg-nav-right">
            <Btn href="/contact" variant="primary" arrow={false}>Discuss a Project</Btn>
            <button className="ceg-nav-burger" onClick={onMobileOpen} aria-label="Open menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function SimplePanel({ item, navKey, data, shared, style }) {
  return (
    <div className={`ceg-dropdown${shared ? " ceg-dropdown-shared" : ""}`} style={style}>
      <ul>
        {item.items.map((entry) => {
          const label = typeof entry === "string" ? entry : entry.label;
          const href  = typeof entry === "string" ? `#${navKey}-${label.toLowerCase().replace(/\s+/g, "-")}` : entry.href;
          return (
            <li key={label}>
              <a href={href}>
                <span>{label}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MegaPanel({ navKey, item, data, shared }) {
  // Richer panel: column 1 = list, column 2 = featured, column 3 = call-out
  const featured =
    navKey === "capabilities" ? data.DIVISIONS.slice(0, 3) :
    navKey === "markets"  ? data.MARKETS.slice(0, 3) :
    null;
  const showAboutPhoto = navKey === "about";

  return (
    <div className={`ceg-mega ${shared ? "ceg-mega-shared" : ""}`}>
      <div className="ceg-mega-grid">
        <div className="ceg-mega-col">
          <div className="ceg-mega-eyebrow">All {item.label}</div>
          <ul className="ceg-mega-list">
            {item.items.map((entry) => {
              const label = typeof entry === "string" ? entry : entry.label;
              const href  = typeof entry === "string" ? `#${navKey}-${label.toLowerCase().replace(/\s+/g, "-")}` : entry.href;
              return (
                <li key={label}>
                  <a href={href}>{label}</a>
                </li>
              );
            })}
          </ul>
        </div>

        {featured && (
          <div className="ceg-mega-col ceg-mega-feature">
            <div className="ceg-mega-eyebrow">Featured</div>
            {featured.map((f) => (
              <a key={f.key || f.name}
                href={
                  navKey === "capabilities"
                    ? `/services/${f.key}`
                    : navKey === "markets"
                      ? (f.key === "federal" ? "/markets/federal" : `/projects/featured-work#market=${encodeURIComponent(f.name)}`)
                      : "#"
                }
                className="ceg-mega-feature-card">
                <div className="ceg-mega-feature-title">{f.name}</div>
                <div className="ceg-mega-feature-blurb">{f.menuBlurb || f.blurb || f.detail}</div>
              </a>
            ))}
          </div>
        )}

        <div className="ceg-mega-col ceg-mega-cta">
          <div className="ceg-mega-eyebrow">Talk to us</div>
          <div className="ceg-mega-cta-text">
            Have a project on the drawing board? Our opportunity team responds within one business day.
          </div>
          <Btn href="/contact" arrow>Discuss a Project</Btn>
        </div>

        {showAboutPhoto && (
          <div className="ceg-mega-col ceg-mega-photo">
            <PlaceholderPhoto kind="construction" />
            <div className="ceg-mega-photo-caption">Veteran-owned marine infrastructure contractor</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HERO ───────────────────────────────────────────────────────────────────
function Hero({ theme, data, conceptKey }) {
  if (theme.hero === "stats") return <HeroStats theme={theme} data={data} />;
  if (theme.hero === "type")  return <HeroType theme={theme} data={data} />;
  return <HeroPhoto theme={theme} data={data} />;
}

// HERO A — photo-led
function HeroPhoto({ theme, data }) {
  return (
    <section className="ceg-hero hero-photo">
      <div className="ceg-hero-media">
        <PlaceholderPhoto kind="hero-diver" />
        <div className="ceg-hero-scrim" />
      </div>
      <div className="ceg-container">
        <div className="ceg-hero-inner">
        <Eyebrow mark>Coastal Engineering Group · Est. 1998</Eyebrow>
        <h1 className="ceg-h1">
          Heavy marine construction<br/>
          for the working waterfront.
        </h1>
        <p className="ceg-hero-lede">
          Five integrated divisions — construction, engineering, dredging, marine
          services, and commercial diving — delivering federal and commercial
          waterfront work from the Mid-Atlantic up the Eastern Seaboard.
        </p>
        <div className="ceg-hero-ctas">
          <Btn href="#projects" variant="primary">View our work</Btn>
          <Btn href="/contact" variant="ghost">Discuss a Project</Btn>
        </div>
        </div>
      </div>
      <HeroFooterStrip data={data} />
    </section>
  );
}

// HERO B — stats-led editorial, full-bleed image background.
// Restructured per Kevin's "identical to Ballard" ask: Ballard's hero is a
// left-aligned two-line headline (one word emphasized), a short paragraph,
// and a single pill CTA over a bright, barely-scrimmed photo — no eyebrow
// tag, no bottom proof/stat bar. That trust content already lives in the
// intro section and the final CTA chips elsewhere, so it isn't lost, just
// not duplicated here.
function HeroStats({ theme, data }) {
  return (
    <section className="ceg-hero hero-stats">
      <div className="ceg-hero-background" aria-hidden style={{backgroundImage: "url('/assets/hero-background.jpg')"}} />
      <div className="ceg-hero-video-scrim" />
      <div className="ceg-container ceg-hero-stats-center">
        <h1 className="ceg-h1 serif">
          Marine Infrastructure.<br /><em>Engineered</em>, Built, and Maintained.
        </h1>
        <p className="ceg-hero-lede">
          Coastal Engineering Group self-performs marine construction, dredging, commercial diving, underwater inspection, and waterfront engineering throughout the Eastern United States.
        </p>
        <div className="ceg-hero-ctas">
          <Btn href="/services" variant="hero-accent">Learn More</Btn>
        </div>
      </div>
    </section>
  );
}

// HERO C — type-driven, blueprint-style
function HeroType({ theme, data }) {
  return (
    <section className="ceg-hero hero-type">
      <div className="ceg-hero-type-photo" aria-hidden>
        <img
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1800&q=80"
          alt=""
          className="ceg-hero-type-photo-img"
          loading="eager"
        />
        <div className="ceg-hero-type-photo-scrim" />
      </div>
      <div className="ceg-blueprint-grid" aria-hidden />
      <div className="ceg-container">
        <div className="ceg-hero-type-inner">
          <div className="ceg-hero-type-meta">
            <span className="ceg-mono">N 36°50′ / W 76°17′</span>
            <span className="ceg-mono ceg-hero-type-meta-rule" aria-hidden />
            <span className="ceg-mono">EST · 1998</span>
            <span className="ceg-mono ceg-hero-type-meta-rule" aria-hidden />
            <span className="ceg-mono">VOSB · ADCI</span>
          </div>

          <h1 className="ceg-h1 ceg-h1-mega">
            <span className="ceg-h1-line">BUILT</span>
            <span className="ceg-h1-line ceg-h1-thinline">
              <span className="ceg-h1-thin">for the</span>
            </span>
            <span className="ceg-h1-line">WATERLINE.</span>
          </h1>

          <div className="ceg-hero-type-foot">
            <p className="ceg-hero-lede">
              Marine construction, engineering, dredging, a fleet of tugs and
              barges, and commercial diving — under one accountable
              veteran-owned company.
            </p>
            <div className="ceg-hero-ctas">
              <Btn href="#projects" variant="primary">View projects</Btn>
              <Btn href="/contact" variant="ghost">Discuss a Project</Btn>
            </div>
          </div>

          <div className="ceg-hero-type-tickers">
            {data.STATS.map((s, i) => (
              <div key={i} className="ceg-hero-type-tick">
                <div className="ceg-hero-type-tick-idx">0{i + 1}</div>
                <div className="ceg-hero-type-tick-v">{s.value}</div>
                <div className="ceg-hero-type-tick-l">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroFooterStrip({ data, subtle }) {
  return (
    <div className={`ceg-hero-foot ${subtle ? "is-subtle" : ""}`}>
      <div className="ceg-container ceg-hero-foot-row">
        <span className="ceg-hero-foot-eyebrow">Trusted partner</span>
        <div className="ceg-hero-foot-clients">
          {data.CLIENTS.slice(0, 6).map((c) => (
            <span key={c} className="ceg-hero-foot-client">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Photo URL maps ────────────────────────────────────────────────────────
// Direct Unsplash CDN URLs — verified popular long-lived photos.
// `?auto=format&fit=crop&w=1200&q=80` keeps file size reasonable.
const U = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const PHOTO_BY_KIND = {
  // hero
  "hero-diver": U("1544551763-46a013bb70d5"), // scuba diver in deep blue water
  // tag-driven kinds (Featured Work)
  seawall:      U("1473625247510-8ceb1760943f"), // wooden pier into water
  pier:         U("1518684079-3c830dcef090"),    // long pier perspective
  diver:        U("1582967788606-a171c1080cb0"), // scuba diver underwater
  dredge:       U("1494412519320-aa613dfb7738"), // working harbor
  barge:        U("1516937941344-00b4e0337589"), // tugboat
  bridge:       U("1486325212027-8081e485255e"), // bridge underside structure
  // division keys (Divisions display panel)
  construction: U("1504307651254-35680f356dfd"), // construction crane
  diving:       U("1582967788606-a171c1080cb0"), // scuba diver
  dredging:     U("1494412519320-aa613dfb7738"), // working harbor
  engineering:  U("1486325212027-8081e485255e"), // bridge engineering
  "marine-services": U("1516937941344-00b4e0337589"), // tugboat
};
const PHOTO_BY_MARKET = {
  federal:       U("1457449940276-e8deed18bfff"), // navy ship at sea
  "state-local": U("1473625247510-8ceb1760943f"), // pier
  energy:        U("1466611653911-95081537e5b7"), // offshore wind
  commercial:    U("1494412519320-aa613dfb7738"), // marina
  industrial:    U("1605281317010-fe5ffe798166"), // industrial port
};

// ─── Placeholder photo ──────────────────────────────────────────────────────
function PlaceholderPhoto({ kind = "seawall", small = false, tall = false }) {
  // SVG-based marine construction placeholder. Clearly labeled.
  const palette = {
    seawall: { sky: "#3a5870", sea: "#1a2f44", structure: "#2a3a4d", label: "SEAWALL · NAVFAC NORFOLK" },
    pier:    { sky: "#4a6275", sea: "#1d3349", structure: "#2d4156", label: "PIER REHABILITATION" },
    diver:   { sky: "#3a8aa8", sea: "#1a5070", structure: "#0d2030", label: "COMMERCIAL DIVING" },
    dredge:  { sky: "#3d5468", sea: "#1f2f42", structure: "#2c3d52", label: "DREDGING OPERATION" },
    barge:   { sky: "#36495a", sea: "#1a2837", structure: "#26384a", label: "MARINE SERVICES" },
    bridge:  { sky: "#42566a", sea: "#1d2e40", structure: "#2a3c4f", label: "BRIDGE SUBSTRUCTURE" },
  }[kind] || { sky: "#3a5870", sea: "#1a2f44", structure: "#2a3a4d", label: "MARINE CONSTRUCTION" };

  return (
    <div className={`ceg-photo ${small ? "is-small" : ""} ${tall ? "is-tall" : ""}`} data-kind={kind}>
      {PHOTO_BY_KIND[kind] && (
        <img
          src={PHOTO_BY_KIND[kind]}
          alt=""
          className="ceg-photo-img"
          loading="lazy"
          onLoad={(e) => { if (e.currentTarget.naturalWidth < 200) e.currentTarget.style.display = "none"; }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}
      <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        <defs>
          <linearGradient id={`sky-${kind}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.sky} stopOpacity="0.95"/>
            <stop offset="100%" stopColor={palette.sea} stopOpacity="1"/>
          </linearGradient>
          <linearGradient id={`sea-${kind}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.sea}/>
            <stop offset="100%" stopColor="#08111c"/>
          </linearGradient>
          <pattern id={`grain-${kind}`} width="3" height="3" patternUnits="userSpaceOnUse">
            <rect width="3" height="3" fill="transparent"/>
            <circle cx="1" cy="1" r="0.4" fill="white" opacity="0.025"/>
          </pattern>
        </defs>
        <rect width="800" height="500" fill={`url(#sky-${kind})`}/>
        <rect y="280" width="800" height="220" fill={`url(#sea-${kind})`}/>

        {kind === "seawall" && (
          <>
            <rect x="0" y="240" width="800" height="60" fill={palette.structure}/>
            {Array.from({ length: 40 }).map((_, i) => (
              <line key={i} x1={i * 20} y1="240" x2={i * 20} y2="300" stroke="#000" strokeOpacity="0.25" strokeWidth="1"/>
            ))}
            <rect x="0" y="235" width="800" height="6" fill="#000" fillOpacity="0.4"/>
            <rect x="60" y="180" width="40" height="80" fill={palette.structure} stroke="#000" strokeOpacity="0.3"/>
            <rect x="700" y="200" width="35" height="60" fill={palette.structure} stroke="#000" strokeOpacity="0.3"/>
          </>
        )}
        {kind === "pier" && (
          <>
            <rect x="0" y="270" width="800" height="20" fill={palette.structure}/>
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x={50 + i * 60} y="290" width="14" height="180" fill={palette.structure}/>
            ))}
            <rect x="100" y="240" width="180" height="40" fill={palette.structure} stroke="#000" strokeOpacity="0.25"/>
            <rect x="120" y="220" width="20" height="20" fill="#fff" fillOpacity="0.15"/>
            <rect x="150" y="215" width="20" height="25" fill="#fff" fillOpacity="0.18"/>
          </>
        )}
        {kind === "diver" && (
          <>
            {/* surface light rays */}
            <ellipse cx="400" cy="60" rx="280" ry="40" fill="#fff" fillOpacity="0.18"/>
            <path d="M250 60 L180 500 L260 500 L340 60 Z" fill="#fff" fillOpacity="0.06"/>
            <path d="M380 60 L340 500 L420 500 L460 60 Z" fill="#fff" fillOpacity="0.05"/>
            <path d="M520 60 L580 500 L620 500 L580 60 Z" fill="#fff" fillOpacity="0.07"/>
            {/* underwater wharf piles in distance */}
            <rect x="60" y="180" width="22" height="320" fill="#0d2030" opacity="0.85"/>
            <rect x="120" y="200" width="18" height="300" fill="#0d2030" opacity="0.7"/>
            <rect x="680" y="190" width="22" height="310" fill="#0d2030" opacity="0.85"/>
            <rect x="730" y="210" width="18" height="290" fill="#0d2030" opacity="0.7"/>
            {/* diver — silhouette with helmet, tank, fins */}
            <g transform="translate(390 290)">
              {/* tank on back */}
              <rect x="-8" y="-10" width="14" height="46" rx="6" fill="#0d2030"/>
              {/* body / suit */}
              <ellipse cx="0" cy="20" rx="22" ry="34" fill="#0d2030"/>
              {/* helmet */}
              <circle cx="0" cy="-18" r="22" fill="#0d2030"/>
              <circle cx="0" cy="-18" r="22" fill="none" stroke="#5fa6c4" strokeWidth="1.5" opacity="0.7"/>
              {/* helmet faceplate light */}
              <ellipse cx="-6" cy="-22" rx="9" ry="6" fill="#a8d8e8" opacity="0.85"/>
              <circle cx="-3" cy="-23" r="2" fill="#fff" opacity="0.95"/>
              {/* arm reaching to wharf */}
              <path d="M18 4 Q60 -10 95 -25" stroke="#0d2030" strokeWidth="10" strokeLinecap="round" fill="none"/>
              {/* umbilical/hose to surface */}
              <path d="M-4 -32 Q-30 -100 -10 -200 Q40 -300 0 -420" stroke="#d8a040" strokeWidth="2.5" fill="none" opacity="0.85"/>
              {/* fins */}
              <path d="M-12 50 Q-20 65 -28 70 L-14 58 Z" fill="#0d2030"/>
              <path d="M12 50 Q20 65 28 70 L14 58 Z" fill="#0d2030"/>
            </g>
            {/* bubbles */}
            {[
              [395,260,3],[388,235,2],[400,210,2.5],[392,180,1.8],[385,150,2.2],[400,120,1.6],[395,95,1.4],
              [410,250,2],[418,220,1.5],[412,190,1.8],[420,160,1.2],
              [378,275,2],[372,245,1.7],[380,215,1.4]
            ].map(([x,y,r],i)=>(
              <circle key={i} cx={x} cy={y} r={r} fill="#fff" fillOpacity="0.55" stroke="#fff" strokeOpacity="0.8" strokeWidth="0.5"/>
            ))}
            {/* foreground caustic shimmer */}
            <ellipse cx="400" cy="450" rx="180" ry="14" fill="#fff" fillOpacity="0.07"/>
          </>
        )}
        {kind === "dredge" && (
          <>
            <rect x="200" y="230" width="380" height="60" fill={palette.structure}/>
            <rect x="380" y="160" width="10" height="80" fill={palette.structure}/>
            <line x1="385" y1="170" x2="540" y2="280" stroke={palette.structure} strokeWidth="6"/>
            <rect x="535" y="270" width="30" height="20" fill={palette.structure}/>
          </>
        )}
        {kind === "barge" && (
          <>
            <rect x="100" y="260" width="500" height="40" fill={palette.structure}/>
            <rect x="610" y="240" width="100" height="60" fill={palette.structure}/>
            <rect x="640" y="200" width="30" height="40" fill={palette.structure}/>
          </>
        )}
        {kind === "bridge" && (
          <>
            <rect x="0" y="220" width="800" height="20" fill={palette.structure}/>
            <rect x="100" y="240" width="20" height="240" fill={palette.structure}/>
            <rect x="680" y="240" width="20" height="240" fill={palette.structure}/>
            <rect x="380" y="240" width="40" height="240" fill={palette.structure}/>
          </>
        )}

        <rect width="800" height="500" fill={`url(#grain-${kind})`}/>

        <g transform="translate(24,470)">
          <rect x="-4" y="-14" width="240" height="20" fill="#000" fillOpacity="0.5"/>
          <text x="0" y="0" fontFamily="ui-monospace, monospace" fontSize="10" fill="#fff" fillOpacity="0.85" letterSpacing="1.5">
            PLACEHOLDER · {palette.label}
          </text>
        </g>
      </svg>
    </div>
  );
}

// ─── Market action photo (unique scene per market) ──────────────────────────
function MarketPhoto({ marketKey }) {
  const scenes = {
    federal: {
      // Naval pier at dawn — battleship silhouette + crane
      sky1: "#7a9bbd", sky2: "#3d5e80", water: "#3a5878", structure: "#1c2e44", accent: "#e8b87a",
      label: "FEDERAL · NAVFAC",
      paint: (
        <g>
          {/* horizon glow */}
          <ellipse cx="600" cy="290" rx="320" ry="40" fill="#5b7aa0" opacity="0.18"/>
          {/* battleship silhouette */}
          <path d="M0 290 L120 290 L160 270 L520 270 L560 290 Z" fill="#0a1828"/>
          <rect x="280" y="220" width="60" height="50" fill="#0a1828"/>
          <rect x="290" y="190" width="14" height="35" fill="#0a1828"/>
          <rect x="320" y="200" width="10" height="25" fill="#0a1828"/>
          <line x1="295" y1="190" x2="295" y2="160" stroke="#0a1828" strokeWidth="2"/>
          {/* crane */}
          <rect x="660" y="140" width="6" height="160" fill="#1c2e44"/>
          <line x1="663" y1="140" x2="760" y2="200" stroke="#1c2e44" strokeWidth="3"/>
          <line x1="730" y1="180" x2="730" y2="270" stroke="#1c2e44" strokeWidth="1.5"/>
          {/* warning lights */}
          <circle cx="295" cy="158" r="2" fill="#ff5530" opacity="0.9"/>
          <circle cx="663" cy="138" r="2" fill="#ff5530" opacity="0.9"/>
          {/* water reflections */}
          {Array.from({length:14}).map((_,i)=>(
            <line key={i} x1={50+i*55} y1={310+(i%3)*8} x2={120+i*55} y2={310+(i%3)*8} stroke="#3a5a7a" strokeWidth="0.8" opacity="0.35"/>
          ))}
        </g>
      ),
    },
    "state-local": {
      // Bridge construction with rebar cage — clear daylight
      sky1: "#9bb4cd", sky2: "#5a7592", water: "#4a6480", structure: "#2a3d52", accent: "#d8a040",
      label: "STATE · DOT BRIDGE",
      paint: (
        <g>
          {/* bridge deck */}
          <rect x="0" y="200" width="800" height="22" fill="#2a3d52"/>
          <rect x="0" y="222" width="800" height="6" fill="#0c1622"/>
          {/* piers */}
          <rect x="120" y="222" width="34" height="260" fill="#2a3d52"/>
          <rect x="380" y="222" width="34" height="260" fill="#2a3d52"/>
          <rect x="640" y="222" width="34" height="260" fill="#2a3d52"/>
          {/* rebar cage on left pier */}
          <g opacity="0.9">
            <rect x="115" y="160" width="44" height="60" fill="none" stroke="#d8a040" strokeWidth="1"/>
            {[0,1,2,3,4].map(i=>(
              <line key={i} x1={120+i*9} y1="160" x2={120+i*9} y2="220" stroke="#d8a040" strokeWidth="1"/>
            ))}
            {[0,1,2,3].map(i=>(
              <line key={i} x1="115" y1={170+i*15} x2="159" y2={170+i*15} stroke="#d8a040" strokeWidth="0.8"/>
            ))}
          </g>
          {/* worker silhouette */}
          <g transform="translate(170,170)">
            <circle cx="0" cy="0" r="4" fill="#0c1622"/>
            <rect x="-3" y="4" width="6" height="14" fill="#0c1622"/>
            <rect x="-2" y="-7" width="4" height="3" fill="#d8a040"/>
          </g>
          {/* water */}
          <rect y="290" width="800" height="210" fill="url(#mp-water)"/>
        </g>
      ),
    },
    energy: {
      // Offshore wind turbine + jack-up vessel — bright open sea
      sky1: "#a8c2db", sky2: "#5e82a4", water: "#3a5876", structure: "#1c3147", accent: "#ffffff",
      label: "ENERGY · OFFSHORE WIND",
      paint: (
        <g>
          {/* sun/horizon */}
          <circle cx="650" cy="260" r="40" fill="#5b7aa0" opacity="0.25"/>
          {/* foreground turbine */}
          <rect x="395" y="80" width="10" height="220" fill="#1c3147"/>
          <circle cx="400" cy="80" r="8" fill="#1c3147"/>
          <line x1="400" y1="80" x2="460" y2="40" stroke="#1c3147" strokeWidth="6" strokeLinecap="round"/>
          <line x1="400" y1="80" x2="345" y2="50" stroke="#1c3147" strokeWidth="6" strokeLinecap="round"/>
          <line x1="400" y1="80" x2="395" y2="155" stroke="#1c3147" strokeWidth="6" strokeLinecap="round"/>
          {/* distant turbines */}
          {[100,180,560,720].map((x,i)=>(
            <g key={i} opacity="0.55">
              <rect x={x} y={140+i*4} width="3" height="140" fill="#1c3147"/>
              <line x1={x+1.5} y1={140+i*4} x2={x+22} y2={125+i*4} stroke="#1c3147" strokeWidth="2"/>
              <line x1={x+1.5} y1={140+i*4} x2={x-18} y2={130+i*4} stroke="#1c3147" strokeWidth="2"/>
            </g>
          ))}
          {/* jack-up vessel right */}
          <rect x="540" y="290" width="180" height="20" fill="#1c3147"/>
          <rect x="555" y="200" width="6" height="90" fill="#1c3147"/>
          <rect x="690" y="200" width="6" height="90" fill="#1c3147"/>
          <rect x="565" y="270" width="120" height="22" fill="#243b54"/>
          {/* water */}
          <rect y="310" width="800" height="190" fill="url(#mp-water)"/>
        </g>
      ),
    },
    commercial: {
      // Marina at golden hour with boats + dock
      sky1: "#e8b87a", sky2: "#a86c4a", water: "#3a4a64", structure: "#1a2638", accent: "#f5d8a8",
      label: "COMMERCIAL · MARINA",
      paint: (
        <g>
          {/* warm horizon */}
          <rect width="800" height="500" fill="url(#mp-sky)"/>
          <ellipse cx="500" cy="280" rx="400" ry="30" fill="#e8b87a" opacity="0.18"/>
          {/* main dock */}
          <rect x="0" y="295" width="800" height="14" fill="#293b50"/>
          {/* finger piers */}
          {[80,220,360,500,640].map((x,i)=>(
            <rect key={i} x={x} y="309" width="14" height="120" fill="#293b50"/>
          ))}
          {/* moored boats */}
          {[140,280,420,560,700].map((x,i)=>(
            <g key={i}>
              <path d={`M${x-30} 340 L${x+30} 340 L${x+22} 360 L${x-22} 360 Z`} fill="#1c2c40"/>
              <rect x={x-12} y="318" width="24" height="22" fill="#1c2c40"/>
              <rect x={x-3} y="305" width="2" height="14" fill="#1c2c40"/>
            </g>
          ))}
          {/* warm ripples */}
          {Array.from({length:10}).map((_,i)=>(
            <line key={i} x1={20+i*78} y1={400+(i%2)*10} x2={90+i*78} y2={400+(i%2)*10} stroke="#e8b87a" strokeWidth="0.8" opacity="0.3"/>
          ))}
          <rect y="430" width="800" height="70" fill="#0a1828" opacity="0.5"/>
        </g>
      ),
    },
    industrial: {
      // Refinery / heavy waterfront with stacks + barge — overcast steel
      sky1: "#8a929e", sky2: "#5a626e", water: "#3a424e", structure: "#22272f", accent: "#c84a26",
      label: "INDUSTRIAL · TERMINAL",
      paint: (
        <g>
          {/* smokestacks */}
          <rect x="120" y="100" width="22" height="180" fill="#22272f"/>
          <rect x="170" y="140" width="18" height="140" fill="#22272f"/>
          <rect x="210" y="120" width="22" height="160" fill="#22272f"/>
          {/* stack tops + smoke */}
          <ellipse cx="131" cy="100" rx="14" ry="4" fill="#22272f"/>
          <path d="M125 95 Q140 70 130 50 Q150 60 145 30" fill="none" stroke="#c84a26" strokeWidth="2" opacity="0.4"/>
          <path d="M180 135 Q200 110 185 85" fill="none" stroke="#3a3f48" strokeWidth="3" opacity="0.5"/>
          {/* tank */}
          <ellipse cx="500" cy="220" rx="120" ry="14" fill="#22272f"/>
          <rect x="380" y="220" width="240" height="80" fill="#22272f"/>
          <ellipse cx="500" cy="300" rx="120" ry="14" fill="#15181d"/>
          {/* loading arm */}
          <rect x="390" y="180" width="6" height="40" fill="#22272f"/>
          <line x1="393" y1="180" x2="350" y2="160" stroke="#22272f" strokeWidth="3"/>
          {/* barge */}
          <rect x="40" y="320" width="280" height="40" fill="#22272f"/>
          <rect x="280" y="300" width="60" height="30" fill="#2a3038"/>
          {/* warning beacon */}
          <circle cx="131" cy="98" r="2.5" fill="#c84a26"/>
          <circle cx="131" cy="98" r="5" fill="#c84a26" opacity="0.3"/>
          {/* dark water */}
          <rect y="360" width="800" height="140" fill="url(#mp-water)"/>
        </g>
      ),
    },
  };

  const s = scenes[marketKey] || scenes.federal;

  return (
    <div className="ceg-photo" data-market={marketKey}>
      {PHOTO_BY_MARKET[marketKey] && (
        <img
          src={PHOTO_BY_MARKET[marketKey]}
          alt=""
          className="ceg-photo-img"
          loading="lazy"
          onLoad={(e) => { if (e.currentTarget.naturalWidth < 200) e.currentTarget.style.display = "none"; }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}
      <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
        <defs>
          <linearGradient id="mp-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.sky1}/>
            <stop offset="100%" stopColor={s.sky2}/>
          </linearGradient>
          <linearGradient id="mp-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.water}/>
            <stop offset="100%" stopColor="#1c2c40"/>
          </linearGradient>
          <pattern id="mp-grain" width="3" height="3" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.4" fill="white" opacity="0.03"/>
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#mp-sky)"/>
        {s.paint}
        <rect width="800" height="500" fill="url(#mp-grain)"/>
        <g transform="translate(24,470)">
          <rect x="-4" y="-14" width="220" height="20" fill="#000" fillOpacity="0.5"/>
          <text x="0" y="0" fontFamily="ui-monospace, monospace" fontSize="10" fill="#fff" fillOpacity="0.85" letterSpacing="1.5">
            PLACEHOLDER · {s.label}
          </text>
        </g>
      </svg>
    </div>
  );
}

// ─── Capabilities section ─────────────────────���─────────────────────────────────
// Accordion layout per Kevin's reference (tab list + photo + detail panel),
// replacing the old 6-card grid. Reuses the .ceg-division-* CSS already
// built for this exact shape (tabs | photo | white card) — see the Divisions
// section below — since nothing else used it after the /services overview
// page was removed. Real photos (not the Unsplash PlaceholderPhoto
// placeholders) for the same five divisions, matching what the grid used.
const CAP_PHOTOS = {
  construction: "/assets/marine-construction.jpg",
  engineering: "/assets/marine-engineering.jpg",
  dredging: "/assets/dredging.jpg",
  diving: "/assets/commercial-diving.jpg",
  "marine-services": "/assets/marine-services.jpg",
};

function Capabilities({ theme, data }) {
  const headRef = useReveal(0.2);
  const [active, setActive] = useState(0);
  const cap = data.CAPABILITIES[active];
  const div = data.DIVISIONS.find((d) => d.key === cap.key);

  return (
    <section id="capabilities" className="ceg-section ceg-capabilities">
      <div className="ceg-container">
        <div className="ceg-section-head ceg-reveal-fade-up" ref={headRef}>
          <Eyebrow accent>What We Do</Eyebrow>
          <h2 className="ceg-h2">Integrated Marine Infrastructure Capabilities</h2>
          <p className="ceg-section-lede">
            Engineering, construction, dredging, commercial diving, and marine support — coordinated through one accountable, self-performing team.
          </p>
        </div>

        <div className="ceg-divisions-grid">
          <div className="ceg-divisions-tabs">
            {data.CAPABILITIES.map((c, i) => (
              <button
                key={c.key}
                className={`ceg-division-tab ${i === active ? "is-active" : ""}`}
                type="button"
                onClick={() => setActive(i)}
              >
                <span className="ceg-division-tab-num">0{i + 1}</span>
                <span className="ceg-division-tab-name">{c.title}</span>
                <svg className="ceg-division-tab-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
            ))}
          </div>

          <div className="ceg-divisions-display">
            <div
              className="ceg-photo is-tall"
              style={{ backgroundImage: `url('${CAP_PHOTOS[cap.key]}')`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <div className="ceg-division-card">
              <div className="ceg-division-card-num">0{active + 1}</div>
              <div className="ceg-division-card-name">{cap.title}</div>
              <p className="ceg-division-card-blurb">{cap.body}</p>
              {div && (
                <ul className="ceg-division-card-svc">
                  {div.services.map((s) => (
                    <li key={s}>
                      <svg className="ceg-division-svc-tick" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="M2 6.5l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter"/>
                      </svg>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              )}
              <a href={`/services/${cap.key}`} className="ceg-division-card-cta">
                <span className="ceg-division-card-cta-label">Explore {cap.title}</span>
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

// Simple line-icon per division, used only as a small badge on each tile —
// not the full ICON set from service-app.jsx (that file isn't loaded here).
const DIV_ICON = {
  construction: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  engineering: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  dredging: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M3 12h.01M3 8h.01M3 16h.01",
  diving: "M12 8a2 2 0 100-4 2 2 0 000 4zm0 0v13m0 0a8 8 0 01-8-8h2m6 8a8 8 0 008-8h-2",
  "marine-services": "M3 13l1.5 5.5a2 2 0 001.92 1.5h11.16a2 2 0 001.92-1.5L21 13M3 13l9-4 9 4M3 13h18M12 3v6",
};

// ─── Divisions section ──────────────────────────────────────────────────────────
// The all-services hub page's centerpiece: a grid of large, clickable photo
// tiles — one per division, straight to its real page. Per Kevin's direction
// this hub page should read as clickable tiles, not another accordion (the
// homepage's Capabilities section above keeps the tab-accordion shape).
function Divisions({ theme, data }) {
  return (
    <section id="services" className="ceg-section ceg-divisions">
      <div className="ceg-container">
        <div className="ceg-section-head">
          <Eyebrow mark>Five divisions · One company</Eyebrow>
          <h2 className="ceg-h2">
            From the {""}
            <span className="ceg-h2-em">drawing board</span>
            {" "}to the {""}
            <span className="ceg-h2-em">water column.</span>
          </h2>
          <p className="ceg-section-lede">
            We self-perform across every phase of marine work — eliminating the
            handoffs, schedule risk, and split accountability of multi-prime delivery.
          </p>
        </div>

        <div className="ceg-division-tiles">
          {data.DIVISIONS.map((d, i) => (
            <a key={d.key} href={`/services/${d.key}`} className="ceg-division-tile">
              <div
                className="ceg-division-tile-media"
                style={{ backgroundImage: `url('${CAP_PHOTOS[d.key]}')` }}
              >
                <span className="ceg-division-tile-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={DIV_ICON[d.key]} />
                  </svg>
                </span>
                <span className="ceg-division-tile-num">0{i + 1}</span>
              </div>
              <div className="ceg-division-tile-body">
                <div className="ceg-division-tile-name">{d.name}</div>
                <p className="ceg-division-tile-blurb">{d.blurb}</p>
                <span className="ceg-division-tile-cta">
                  <span>Explore {d.short}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/>
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Projects ─────────────────────────────────────────────────────────────���─
function Projects({ theme, data }) {
  // Featured case study (large) + category browser (side) + 3 case studies below.
  // No top-level filter chips per Kevin's review — category browser is the entry point.
  const [activeTag, setActiveTag] = useState("All");
  const tags = [
    { key: "All", label: "All work", count: data.PROJECTS.length, hint: "Across all five divisions" },
    { key: "Construction", label: "Construction", hint: "Piers, wharfs, seawalls, bridges" },
    { key: "Diving", label: "Commercial Diving", hint: "Inspection, repair, salvage" },
    { key: "Dredging", label: "Dredging", hint: "Mechanical & hydraulic" },
    { key: "Engineering", label: "Engineering", hint: "Design, assessment, permitting" },
    { key: "Marine Services", label: "Marine Services", hint: "Tug, barge & vessel support" },
  ].map(t => ({
    ...t,
    count: t.count ?? data.PROJECTS.filter(p => p.tag === t.key).length,
  }));

  // Featured = first project (always shown, regardless of filter).
  const featured = data.PROJECTS[0];
  // Supporting = next 3 matching the active tag (excluding the featured project).
  const pool = data.PROJECTS.slice(1).filter(p => activeTag === "All" || p.tag === activeTag);
  const supporting = pool.slice(0, 3);

  const photoFor = (p, i) => (
    p.tag === "Diving" ? "diver" :
    p.tag === "Dredging" ? "dredge" :
    p.tag === "Marine Services" ? "barge" :
    p.tag === "Engineering" ? "bridge" :
    i % 2 === 0 ? "seawall" : "pier"
  );

  const Card = (p, i, isFeature) => (
    <a key={p.title} href="#" className={`ceg-project-card ${isFeature ? "is-feature" : ""}`}>
      <div className="ceg-project-media">
        <PlaceholderPhoto kind={photoFor(p, i)}/>
        <div className="ceg-project-tag">{p.tag}</div>
      </div>
      <div className="ceg-project-body">
        <div className="ceg-project-meta">
          <span>{p.market}</span><span>·</span><span>{p.state}</span><span>·</span><span>{p.year}</span>
          {p.award && <><span>·</span><span className="ceg-project-award">★ {p.award}</span></>}
        </div>
        <div className="ceg-project-title">{p.title}</div>
        <div className="ceg-project-client">{p.client}</div>
        {isFeature && (
          <p className="ceg-project-blurb">{p.blurb}</p>
        )}
        <div className="ceg-project-cta">
          Read case study
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4"/></svg>
        </div>
      </div>
    </a>
  );

  return (
    <section id="projects" className="ceg-section ceg-projects">
      <div className="ceg-container">
        <div className="ceg-section-head">
          <Eyebrow mark>Featured work</Eyebrow>
          <h2 className="ceg-h2">A track record on the working coast.</h2>
        </div>

        <div className="ceg-featured-row">
          {Card(featured, 0, true)}

          {/* Category browser — replaces the second case-study card */}
          <aside className="ceg-cat-browser" aria-label="Browse case studies by expertise">
            <div className="ceg-cat-browser-h">
              <span className="ceg-cat-browser-eyebrow">Browse by expertise</span>
              <h3 className="ceg-cat-browser-title">Case studies, by what we do.</h3>
            </div>
            <ul className="ceg-cat-browser-list">
              {tags.map((t) => (
                <li key={t.key}>
                  <button
                    type="button"
                    className={`ceg-cat-browser-item ${activeTag === t.key ? "is-active" : ""}`}
                    onClick={() => setActiveTag(t.key)}
                    aria-pressed={activeTag === t.key}
                  >
                    <span className="ceg-cat-browser-row">
                      <span className="ceg-cat-browser-label">{t.label}</span>
                      <span className="ceg-cat-browser-count">{t.count}</span>
                    </span>
                    <span className="ceg-cat-browser-hint">{t.hint}</span>
                  </button>
                </li>
              ))}
            </ul>
            <a href="#all-projects" className="ceg-cat-browser-cta">
              All 180+ projects
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6"/>
              </svg>
            </a>
          </aside>
        </div>

        <div className="ceg-supporting-row">
          {supporting.length === 0 ? (
            <div className="ceg-supporting-empty">
              No additional case studies in <strong>{activeTag}</strong> to show here yet.
              <button className="ceg-link-btn" onClick={() => setActiveTag("All")}>
                Show all →
              </button>
            </div>
          ) : (
            supporting.map((p, i) => Card(p, i + 2, false))
          )}
        </div>
      </div>
    </section>
  );
}

// ─── VOSB band ─────────────────────────────────────────���───────────────────���
// ─── Careers ───────────��────────────────������──────────────────────────────
// Talent is a top business priority per Kevin — promote it on the homepage.
// JMT-leaning: pitch + benefits grid + open-roles teaser.
// NOTE: A duplicate `Careers` definition lived here previously. It was removed
// to avoid two functions with the same name (the second silently won). The
// canonical homepage Careers section is defined below, and the CAREERS data
// (pitch / lede / benefits / open roles) now powers the dedicated /careers page.

function VOSBBand({ theme, data }) {
  return (
    <section id="veteran" className="ceg-section ceg-vosb">
      <div className="ceg-container ceg-vosb-grid">
        <div className="ceg-vosb-text">
          <Eyebrow>Veteran-Owned Small Business</Eyebrow>
          <h2 className="ceg-h2 on-brand">Professional engineers and certified commercial divers — under one roof.</h2>
          <p className="ceg-vosb-lede">
            Our VOSB certification opens direct teaming opportunities on
            federal set-aside contracts — and brings a culture of mission
            ownership to every project we touch.
          </p>
          <div className="ceg-hero-ctas">
            <Btn href="#about-vosb" variant="onbrand">Our certifications</Btn>
            <Btn href="#partner" variant="ghost-onbrand">Partner with us</Btn>
          </div>
        </div>
        <div className="ceg-vosb-certs">
          {data.CERTS.map((c) => (
            <div key={c.abbr} className="ceg-cert">
              <div className="ceg-cert-abbr">{c.abbr}</div>
              <div className="ceg-cert-full">{c.full}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Clients strip ──────────────────────────────────────────────────────────
function ClientsStrip({ theme, data }) {
  return (
    <section className="ceg-section-tight ceg-clients">
      <div className="ceg-container">
        <div className="ceg-clients-row">
          <div className="ceg-clients-label">
            <Eyebrow>Selected clients</Eyebrow>
          </div>
          <div className="ceg-clients-list">
            {data.CLIENTS.map((c) => (
              <div key={c} className="ceg-client">{c}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Contact band + Footer �����─────────────────────────────────────────────────
function ContactBand({ theme, data }) {
  const [submitted, setSubmitted] = useState(false);
  const textRef = useReveal(0.15);
  const formRef = useReveal(0.15);
  return (
    <section id="contact" className="ceg-section ceg-contact">
      <div className="ceg-container ceg-contact-grid">
        <div className="ceg-contact-text ceg-reveal-fade-up" ref={textRef}>
          <Eyebrow mark>Start a project</Eyebrow>
          <h2 className="ceg-h2">
            Let's build it together.<br/>
            Tell us about your project.
          </h2>
          <p className="ceg-section-lede">
            Send us your scope, drawings, or RFP — our opportunity team
            responds within one business day.
          </p>

          <div className="ceg-contact-info">
            <div className="ceg-contact-info-row">
              <span className="ceg-contact-info-label">Phone</span>
              <a href={`tel:${data.CONTACT.phone}`} className="ceg-contact-info-val">{data.CONTACT.phone}</a>
            </div>
            <div className="ceg-contact-info-row">
              <span className="ceg-contact-info-label">Email</span>
              <a href={`mailto:${data.CONTACT.email}`} className="ceg-contact-info-val">{data.CONTACT.email}</a>
            </div>
            <div className="ceg-contact-info-row">
              <span className="ceg-contact-info-label">Hours</span>
              <span className="ceg-contact-info-val">{data.CONTACT.hours}</span>
            </div>
            <div className="ceg-contact-info-row">
              <span className="ceg-contact-info-label">Emergency</span>
              <span className="ceg-contact-info-val">{data.CONTACT.emergency}</span>
            </div>
          </div>
        </div>

        <form className="ceg-contact-form ceg-reveal-slide-right" ref={formRef} onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
          {submitted ? (
            <div className="ceg-contact-thanks">
              <div className="ceg-contact-thanks-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14.5l5 5 11-12" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
                </svg>
              </div>
              <div className="ceg-contact-thanks-title">Message received.</div>
              <div className="ceg-contact-thanks-body">
                We'll respond within one business day. For urgent
                response, call {data.CONTACT.phone}.
              </div>
            </div>
          ) : (
            <>
              <div className="ceg-form-row ceg-form-row-2">
                <Field label="Name" name="name" required />
                <Field label="Company" name="company" required />
              </div>
              <div className="ceg-form-row ceg-form-row-2">
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="phone" type="tel" />
              </div>
              <Field label="Project type" name="market" select options={["Federal", "State & Local", "Energy", "Commercial", "Industrial"]} />
              <Field label="Scope summary" name="summary" textarea required />
              <button className="ceg-btn ceg-btn-primary ceg-btn-full" type="submit">
                <span>Send to opportunity team</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/>
                </svg>
              </button>
              <p className="ceg-form-fine">
                By submitting you agree to our <a href="#">privacy notice</a>.
              </p>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

function Field({ label, name, type = "text", required, textarea, select, options = [] }) {
  const [val, setVal] = useState("");
  const [touched, setTouched] = useState(false);
  const id = `f-${name}`;
  return (
    <div className={`ceg-field ${val ? "has-value" : ""} ${touched && !val && required ? "is-error" : ""}`}>
      <label htmlFor={id}>{label}{required && <span className="ceg-field-req">*</span>}</label>
      {textarea ? (
        <textarea id={id} name={name} value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => setTouched(true)} rows={4} required={required}/>
      ) : select ? (
        <select id={id} name={name} value={val} onChange={(e) => setVal(e.target.value)}>
          <option value="">Select…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input id={id} name={name} type={type} value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => setTouched(true)} required={required}/>
      )}
    </div>
  );
}

// ─── Footer ─────���───────────────────────────────────────────────────────────
function Footer({ theme, data }) {
  return (
    <footer className="ceg-footer">
      <div className="ceg-container">
        <div className="ceg-footer-top">
          <div className="ceg-footer-brand">
            <img src="/assets/logo-horizontal.png" alt="Coastal Engineering Group" className="ceg-footer-logo"/>
            <p className="ceg-footer-tagline">
              Coastal Engineering Group is a veteran-owned marine infrastructure contractor and
              engineering firm serving public agencies, prime contractors, utilities, ports,
              transportation owners, and industrial clients throughout the Eastern United States.
              Our integrated capabilities include marine construction, dredging, commercial diving,
              underwater inspection, waterfront engineering, and marine support.
            </p>
            <div className="ceg-footer-certs">
              {data.CERTS.slice(0, 4).map((c) => (
                <span key={c.abbr} className="ceg-footer-cert">{c.abbr}</span>
              ))}
            </div>
          </div>
          {/* Two flat rows instead of one column per nav item — with only
              Services carrying a submenu, a per-item column grid left one
              tall column next to four mostly-empty ones. Primary links on
              their own row, the Services submenu on a second row below. */}
          <div className="ceg-footer-nav">
            <nav className="ceg-footer-nav-row ceg-footer-nav-primary" aria-label="Footer">
              {Object.entries(data.NAV).map(([k, item]) => {
                const href = item.href || (item.items && item.items[0] && item.items[0].href) || "#";
                return <a key={k} href={href}>{item.label}</a>;
              })}
            </nav>
            {data.NAV.capabilities.items && (
              <nav className="ceg-footer-nav-row ceg-footer-nav-sub" aria-label="Services">
                {data.NAV.capabilities.items.map((entry) => {
                  const label = typeof entry === "string" ? entry : entry.label;
                  const href  = typeof entry === "string" ? "#" : (entry.href || "#");
                  return <a key={label} href={href}>{label}</a>;
                })}
              </nav>
            )}
          </div>
        </div>

        <div className="ceg-footer-mid">
          <div className="ceg-footer-mid-block">
            <div className="ceg-footer-mid-h">Headquarters</div>
            <div className="ceg-footer-mid-v">
              {data.CONTACT.hq}<br/>
              {data.CONTACT.addressLine1}<br/>
              {data.CONTACT.addressLine2}
            </div>
          </div>
          <div className="ceg-footer-mid-block">
            <div className="ceg-footer-mid-h">Contact</div>
            <div className="ceg-footer-mid-v">
              <a href={`tel:${data.CONTACT.phone}`}>{data.CONTACT.phone}</a><br/>
              <a href={`mailto:${data.CONTACT.email}`}>{data.CONTACT.email}</a>
            </div>
          </div>
          <div className="ceg-footer-mid-block">
            <div className="ceg-footer-mid-h">Hours</div>
            <div className="ceg-footer-mid-v">
              {data.CONTACT.hours}<br/>
              {data.CONTACT.emergency}
            </div>
          </div>
          <div className="ceg-footer-mid-block">
            <div className="ceg-footer-mid-h">Careers</div>
            <div className="ceg-footer-mid-v">
              <a href="/careers">Open positions</a><br/>
              <a href="/careers">Why Coastal</a><br/>
              <a href="https://recruiting.paylocity.com" target="_blank" rel="noopener noreferrer">Apply via Paylocity</a>
            </div>
          </div>
          <div className="ceg-footer-mid-block ceg-footer-mid-cta ceg-footer-mid-cta--vendor">
            <div className="ceg-footer-mid-h">Vendor Portal</div>
            <div className="ceg-footer-mid-v">
              Submit W-9, certifications, and capability statements.
            </div>
            <a href="#vendor-portal" className="ceg-footer-cta-link">
              Partner with us
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
            </a>
          </div>
          <div className="ceg-footer-mid-block ceg-footer-mid-cta ceg-footer-mid-cta--employee">
            <div className="ceg-footer-mid-h">Employee Portal</div>
            <div className="ceg-footer-mid-v">
              Access timesheets, benefits, payroll, and internal resources.
            </div>
            <a href="#employee-portal" className="ceg-footer-cta-link">
              Sign in
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="ceg-footer-bottom">
          <div>© 2026 Coastal Engineering Group. All rights reserved.</div>
          <div className="ceg-footer-legal">
            <a href="/safety-quality">Safety &amp; Quality</a>
            <a href="#">Privacy</a>
            <a href="#">Accessibility</a>
            <a href="#">SAM.gov UEI</a>
            <a href="#">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Mobile menu ─────────────────────────────────────────�����──────────────────
function MobileMenu({ open, onClose, data }) {
  const [openSection, setOpenSection] = useState(null);
  if (!open) return null;
  return (
    <>
      <div className="ceg-mobile-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="ceg-mobile" role="dialog" aria-modal="true">
      <div className="ceg-mobile-head">
        <img src="/assets/logo-horizontal.png" alt="Coastal Engineering Group" className="ceg-mobile-logo"/>
        <button className="ceg-mobile-close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6"/></svg>
        </button>
      </div>
      <div className="ceg-mobile-body">
        {Object.entries(data.NAV).map(([k, item]) => {
          // Direct-link items (no `items`) render as a flat link, not an accordion.
          if (!item.items) {
            return (
              <div key={k} className="ceg-mobile-section ceg-mobile-section-link">
                <a className="ceg-mobile-section-h" href={item.href} onClick={onClose}>
                  <span>{item.label}</span>
                </a>
              </div>
            );
          }
          return (
            <div key={k} className={`ceg-mobile-section ${openSection === k ? "is-open" : ""}`}>
              <button className="ceg-mobile-section-h" onClick={() => setOpenSection(openSection === k ? null : k)}>
                <span>{item.label}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5"/></svg>
              </button>
              {openSection === k && (
                <ul>
                  {item.items.map((entry) => {
                    const label = typeof entry === "string" ? entry : entry.label;
                    const href  = typeof entry === "string" ? "#" : entry.href;
                    return <li key={label}><a href={href} onClick={onClose}>{label}</a></li>;
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      <div className="ceg-mobile-foot">
        <a href={`tel:${data.CONTACT.phone}`}>{data.CONTACT.phone}</a>
        <Btn href="/contact" onClick={onClose}>Discuss a Project</Btn>
      </div>
    </div>
    </>
  );
}

// ─��─ Why CEG section ──────────────���────��────────────────────────────�����───────────
const WHY_ITEMS = [
  {
    num: "01",
    title: "Self-Perform Capability",
    body: "Qualified field crews, commercial divers, engineers, operators, and marine equipment coordinated through one accountable team.",
  },
  {
    num: "02",
    title: "Engineering-Led Execution",
    body: "Constructability, documentation, risk, and field conditions are considered before work begins — not after problems arise.",
  },
  {
    num: "03",
    title: "Difficult-Access Experience",
    body: "Capabilities suited to active waterways, submerged structures, limited-access facilities, and projects that cannot be evaluated from land.",
  },
  {
    num: "04",
    title: "Public and Federal Readiness",
    body: "Experience with formal quality control, safety planning, submittals, daily reporting, government requirements, and multi-party coordination.",
  },
];

function WhyCEG({ theme, data }) {
  const rightRef = React.useRef(null);

  React.useEffect(() => {
    const el = rightRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("ceg-why-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="why-ceg" className="ceg-section ceg-why">
      <div className="ceg-container">
        <div className="ceg-why-layout">

          {/* Left column */}
          <div className="ceg-why-left ceg-reveal-fade-up" ref={useReveal(0.15)}>
            <div className="ceg-why-left-inner">
              <Eyebrow accent>Why CEG</Eyebrow>
              <h2 className="ceg-h2 ceg-why-heading">One Firm. Two Disciplines. Better Outcomes.</h2>
              <p className="ceg-why-subhead">
                Most projects require separate contracts for engineering and construction. Coastal Engineering Group delivers both — under one roof, on one timeline.
              </p>
              <a href="/contact" className="ceg-btn ceg-btn-primary ceg-why-cta">Discuss a Project →</a>
            </div>
            <img
              src="/assets/why-ceg-photo.jpg"
              alt="Commercial diver working on marine structure underwater"
              className="ceg-why-photo"
            />
          </div>

          {/* Right column — numbered differentiators */}
          <div className="ceg-why-right" ref={rightRef}>
            {WHY_ITEMS.map((item) => (
              <div key={item.num} className="ceg-why-item">
                <div className="ceg-why-num">{item.num}</div>
                <div className="ceg-why-content">
                  <h3 className="ceg-why-title">{item.title}</h3>
                  <p className="ceg-why-body">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Featured Projects section ──────────────────────────────────────────────────
// Photo-only masonry gallery, replacing the old filterable card grid — per
// Kevin's reference, no titles/blurbs/filters, just proof-of-work photos and
// one link out to the real projects page. Fixed 9-tile bento (3 columns x 3
// rows worth of tiles, some spanning) — 9 divides evenly into 3 columns with
// no leftover row, which 8 didn't. PROJECTS only has 8 real project photos
// today, so the 9th tile is a standalone decorative photo (not a fabricated
// project record — there's no real client/scope info behind this one).
const GALLERY_EXTRA_PHOTO = { image: "/assets/cta-diver-crane.jpg", title: "Marine construction fieldwork", slug: null };

function FeaturedProjects({ theme, data }) {
  const headRef = useReveal(0.2);
  const galleryRef = useReveal(0.1);
  const photos = [...data.PROJECTS.slice(0, 8), GALLERY_EXTRA_PHOTO];

  return (
    <section id="featured-projects" className="ceg-section ceg-featured-projects">
      <div className="ceg-container">

        {/* Section header — centered */}
        <div className="ceg-featured-projects-head ceg-reveal-fade-up" ref={headRef}>
          <Eyebrow accent>Projects</Eyebrow>
          <h2 className="ceg-h2">Selected Marine Infrastructure Projects</h2>
          <p className="ceg-featured-projects-subhead">
            Representative work across marine construction, dredging, engineering, underwater inspection, and commercial diving throughout the Eastern United States.
          </p>
        </div>

        {/* Pure photo showcase, not links to individual project pages — the
            one way out of this section is "View All Projects" below. */}
        <div className="ceg-project-gallery ceg-reveal-stagger-grid" ref={galleryRef}>
          {photos.map((project, i) => (
            <div key={project.slug || i} className={`ceg-gallery-tile ceg-gallery-tile-${i + 1}`}>
              <img src={project.image} alt={project.title} loading="lazy" />
            </div>
          ))}
        </div>

        {/* View All Projects link */}
        <div className="ceg-featured-projects-footer">
          <a href="/projects/featured-work" className="ceg-featured-projects-all">View All Projects →</a>
        </div>

      </div>
    </section>
  );
}

// ─── Careers section ────────────────────────────────────────────────────────────
const PILLARS = [
  {
    title: "Training & Certifications",
    body: "ADCI, OSHA 10/30/40, USACE CQM, NHI/FHWA, and more. We put in the hours so you're qualified for the work that others can't touch.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L4 6v4c0 4 8 7 8 7s8-3 8-7V6l-8-4z"/>
      <path d="M12 13v5"/>
      <path d="M9 15h6"/>
    </svg>`,
  },
  {
    title: "Clear Advancement Paths",
    body: "From tender to supervisor to PE diver — there's a defined path forward here. Growth is built into how we operate, not an afterthought.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 18V8"/>
      <path d="M8 12l4-4 4 4"/>
      <path d="M4 21h16"/>
    </svg>`,
  },
  {
    title: null, // photo card — rendered separately
  },
  {
    title: "Veteran-Led. Safety First.",
    body: "Our leadership comes from the armed forces and the field. That means discipline, accountability, and a crew that has each other's backs — above and below the waterline.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l8 4v5c0 6-8 8-8 8s-8-2-8-8V6l8-4z"/>
      <path d="M12 11l1.5 3 3.3.5-2.4 2 .6 3.3L12 16.5l-2.9 2.3.6-3.3-2.4-2 3.3-.5L12 11z"/>
    </svg>`,
  },
];

function Careers({ theme, data }) {
  return (
    <section id="careers" className="ceg-section ceg-careers">
      <div className="ceg-container">
        
        {/* Section header */}
        <div className="ceg-careers-head">
          <Eyebrow accent>Careers</Eyebrow>
          <h2 className="ceg-h2 ceg-careers-heading">Build the Next Generation of Marine Infrastructure</h2>
        </div>

        {/* Two-column layout */}
        <div className="ceg-careers-layout">
          
          {/* LEFT COLUMN — Pitch + CTAs */}
          <div className="ceg-careers-left">
            <p className="ceg-careers-body">
              Coastal is growing a team of engineers, project managers, divers, operators, and field professionals who want meaningful responsibility, challenging work, and a clear path to advance. You'll take on the kind of marine infrastructure work most firms can't handle — federal facilities, critical waterfront assets, and projects that matter.
            </p>
            <p className="ceg-careers-body-short">
              We're hiring across engineering, construction, dredging, commercial diving, and project delivery throughout the Eastern United States.
            </p>

            <div className="ceg-careers-ctas">
              <a href="https://recruiting.paylocity.com" target="_blank" rel="noopener noreferrer" className="ceg-btn ceg-btn-primary ceg-careers-btn">
                View Open Positions →
              </a>
              <a href="/careers" className="ceg-btn ceg-btn-ghost ceg-careers-btn">
                Learn About Careers →
              </a>
            </div>

            <div className="ceg-careers-trust">
              ADCI Certified · OSHA 10/30/40 · Veteran-Led Organization
            </div>
          </div>

          {/* RIGHT COLUMN — 2×2 Pillar Grid */}
          <div className="ceg-careers-right">
            <div className="ceg-careers-grid">
              {PILLARS.map((pillar, i) =>
                pillar.title === null ? (
                  <div key={i} className="ceg-career-pillar ceg-pillar-photo" />
                ) : (
                  <div key={i} className="ceg-career-pillar">
                    <div className="ceg-pillar-icon" dangerouslySetInnerHTML={{ __html: pillar.icon }} />
                    <h3 className="ceg-pillar-title">{pillar.title}</h3>
                    <p className="ceg-pillar-body">{pillar.body}</p>
                  </div>
                )
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

// ─── Certifications Bar ────────────���──────���───────────────────────────────���─────
const CERT_PILLS = [
  "ADCI Certified",
  "VOSB Certified",
  "USACE CQM",
  "NHI / FHWA",
  "ASDSO Dam Safety",
  "OSHA 10 / 30 / 40",
  "ASCE Waterfront",
  "PE Licensed · Multi-State",
];

function CertificationsBar() {
  return (
    <section className="ceg-certs-bar">
      <div className="ceg-container">
        <div className="ceg-certs-eyebrow">Certifications &amp; Standards</div>
        <div className="ceg-certs-pills">
          {CERT_PILLS.map((cert) => (
            <span key={cert} className="ceg-cert-pill">{cert}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Locations section ──────────────────────────────────────────────────────────
const MAP_PIN = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{display:"inline-block",verticalAlign:"middle",marginRight:"6px",flexShrink:0}}>
    <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.485-2.015-4.5-4.5-4.5z" fill="#1c6fbf"/>
    <circle cx="8" cy="6" r="1.5" fill="#fff"/>
  </svg>
);

const STATES = ["NY","NJ","PA","CT","DE","VA","MD","ME","NC","SC","OH","GA","FL"];

function Locations() {
  return (
    <section id="locations" className="ceg-section ceg-locations">
      <div className="ceg-container">

        {/* Header */}
        <div className="ceg-locations-head">
          <Eyebrow accent>Where We Work</Eyebrow>
          <h2 className="ceg-h2 ceg-locations-heading">East Coast Presence. National Reach.</h2>
          <p className="ceg-locations-subhead">
            Two offices. Thirteen licensed states. Deployed wherever the project demands.
          </p>
        </div>

        {/* Cards */}
        <div className="ceg-locations-cards">

          {/* HQ */}
          <div className="ceg-location-card">
            <div className="ceg-location-badge">Headquarters</div>
            <h3 className="ceg-location-name">{MAP_PIN}Greenwood Lake, NY</h3>
            <div className="ceg-location-divider" />
            <div className="ceg-location-details">
              <div>845-328-3178</div>
              <div>info@coastalenggroup.com</div>
            </div>
          </div>

          {/* Southeast */}
          <div className="ceg-location-card">
            <div className="ceg-location-badge">Southeast Operations</div>
            <h3 className="ceg-location-name">{MAP_PIN}Jacksonville, FL</h3>
            <div className="ceg-location-divider" />
            <div className="ceg-location-details">
              <div><em>Full address coming soon</em></div>
              <div>845-328-3178</div>
            </div>
          </div>

        </div>

        {/* States */}
        <div className="ceg-locations-states">
          <div className="ceg-locations-states-label">Licensed to Practice In:</div>
          <div className="ceg-locations-states-row">
            {STATES.map((s, i) => (
              <React.Fragment key={s}>
                <span className="ceg-state-item">{s}</span>
                {i < STATES.length - 1 && <span className="ceg-state-dot">·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

function FinalCTA({ data }) {
  const phone = data?.CONTACT?.phone || "845-328-3178";
  return (
    <section className="ceg-final-cta">
      <div className="ceg-final-cta-inner">
        <p className="ceg-final-cta-eyebrow">Discuss a Project</p>
        <h2 className="ceg-final-cta-heading">Have a Marine Infrastructure Challenge?</h2>
        <p className="ceg-final-cta-sub">
          Bring Coastal into the project early. We can help evaluate conditions, develop a practical execution plan, support a pursuit, or mobilize specialty marine capabilities.
        </p>
        <div className="ceg-final-cta-btns">
          <a href="/contact" className="ceg-final-cta-btn ceg-final-cta-btn-primary">Discuss a Project →</a>
          <a href={`tel:${phone}`} className="ceg-final-cta-btn ceg-final-cta-btn-secondary">Call {phone}</a>
        </div>
        <div className="ceg-final-cta-trust">
          <span>Veteran-Owned Small Business</span>
          <span className="ceg-final-cta-dot">·</span>
          <span>ADCI-Certified</span>
          <span className="ceg-final-cta-dot">·</span>
          <span>Multi-State PE Licensure</span>
          <span className="ceg-final-cta-dot">·</span>
          <span>Eastern U.S. Operations</span>
        </div>
      </div>
    </section>
  );
}

// ─── Homepage narrative intro (below hero) ───────────────────────────────────
// Homepage intro — per Kevin's "identical to Ballard" ask, this now mirrors
// the one continuous section on Ballard's homepage that (1) states who
// Coastal is in a two-column split (bold statement | paragraph), (2) teases
// Services with a short blurb + link out (their homepage has no services
// grid, just this), and (3) visualizes Markets as a radial diagram — the
// piece their homepage actually gives visual weight to, not services.
function NarrativeIntro({ data }) {
  const markets = (data && data.MARKETS) || [];
  const radius = 36;
  const startAngle = -90;
  const diagramRef = useReveal(0.25);

  return (
    <section className="ceg-section ceg-narrative-intro">
      <div className="ceg-container">
        <div className="ceg-narrative-split">
          <h2 className="ceg-h2 ceg-narrative-statement">
            One Team Above and Below the Waterline.
          </h2>
          <div className="ceg-narrative-copy">
            <p className="ceg-narrative-p">
              Marine infrastructure problems rarely fit within a single discipline. Coastal combines engineering judgment, specialty field crews, marine equipment, dredging capability, and commercial diving so clients can move from investigation to repair with fewer gaps between design and execution.
            </p>
            <p className="ceg-narrative-p">
              Our teams work in active waterways, restricted-access facilities, industrial environments, transportation corridors, and federal installations where planning, documentation, safety, and constructability are essential.
            </p>
          </div>
        </div>

        <div className="ceg-narrative-services">
          <h3 className="ceg-narrative-services-h3">Our Services</h3>
          <div className="ceg-services-grid">
            {data.DIVISIONS.map((d) => (
              <a
                key={d.key}
                href={`/services/${d.key}`}
                className="ceg-services-box"
                style={{ backgroundImage: `url('${CAP_PHOTOS[d.key]}')` }}
              >
                {/* Photo fades to a solid scrim on the left so the label
                    stays legible, showing through mostly on the right —
                    the same treatment as the footer's diver illustration. */}
                <div className="ceg-services-box-scrim" aria-hidden="true" />
                <div className="ceg-services-box-body">
                  <span className="ceg-services-box-name">{d.short}</span>
                  <span className="ceg-services-box-cta">
                    Learn More
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                    </svg>
                  </span>
                </div>
              </a>
            ))}
            <a href="/services" className="ceg-services-box ceg-services-box-all">
              <div className="ceg-services-box-body">
                <span className="ceg-services-box-name">All Services</span>
                <span className="ceg-services-box-cta">
                  Learn More
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                  </svg>
                </span>
              </div>
            </a>
          </div>
        </div>

        <div className="ceg-markets-diagram-wrap">
          <div className="ceg-markets-diagram-head">
            <h3 className="ceg-markets-diagram-h3">Markets Served by Coastal</h3>
            {/* Mobile-only: the center hex reads as a redundant repeat of the
                heading above once the diagram collapses to a stacked list,
                so it's swapped for this link there (hidden on desktop, where
                the hex still does that job). */}
            <a href="/markets" className="ceg-markets-diagram-head-link">
              View All Markets
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
              </svg>
            </a>
          </div>
          <div className="ceg-markets-diagram" ref={diagramRef}>
            <a href="/markets" className="ceg-markets-diagram-center" style={{ transitionDelay: "0.05s" }}>
              <svg className="ceg-markets-diagram-hex" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <polygon points="25,0 75,0 100,50 75,100 25,100 0,50" strokeLinejoin="round" />
              </svg>
              <span className="ceg-markets-diagram-center-label">Markets<br />We Serve</span>
            </a>
            {markets.map((m, i) => {
              const angle = (startAngle + (360 / markets.length) * i) * (Math.PI / 180);
              const x = 50 + radius * Math.cos(angle);
              const y = 50 + radius * Math.sin(angle);
              return (
                <a
                  key={m.key}
                  href="/markets"
                  className="ceg-markets-diagram-node"
                  style={{ left: `${x}%`, top: `${y}%`, transitionDelay: `${0.16 + i * 0.09}s` }}
                >
                  <svg className="ceg-markets-diagram-hex" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <polygon points="25,0 75,0 100,50 75,100 25,100 0,50" strokeLinejoin="round" />
                  </svg>
                  <span className="ceg-markets-diagram-node-name">{m.name}</span>
                  <span className="ceg-markets-diagram-node-detail">{m.detail}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Integrated delivery — Inspect. Engineer. Build. Maintain. ────────────────
function IntegratedDelivery() {
  const steps = [
    { k: "Inspect",  d: "Define existing conditions above and below the waterline." },
    { k: "Engineer", d: "Develop practical, constructable repair and execution approaches." },
    { k: "Build",    d: "Self-perform the work with qualified crews, divers, and marine equipment." },
    { k: "Maintain", d: "Document the completed result and support the asset over time." },
  ];
  return (
    <section className="ceg-section ceg-integrated">
      <div className="ceg-container">
        <div className="ceg-section-head">
          <Eyebrow accent>How We Deliver</Eyebrow>
          <h2 className="ceg-h2">Inspect. Engineer. Build. Maintain.</h2>
          <p className="ceg-section-lede">
            Coastal's integrated delivery model connects field observations with engineering decisions and construction execution — using the right combination of engineers, project managers, divers, operators, and marine crews.
          </p>
        </div>
        <div className="ceg-integrated-steps">
          {steps.map((s, i) => (
            <div key={i} className="ceg-integrated-step">
              <div className="ceg-integrated-step-num">0{i + 1}</div>
              <div className="ceg-integrated-step-k">{s.k}</div>
              <p className="ceg-integrated-step-d">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, {
  applyThemeVars,
  Eyebrow, Btn, UtilityBar, Nav, Hero, PlaceholderPhoto, MarketPhoto,
  Capabilities, WhyCEG, FeaturedProjects, Careers, CertificationsBar, Locations, Divisions, Projects, VOSBBand, ClientsStrip, ContactBand, FinalCTA, Footer, MobileMenu,
  NarrativeIntro, IntegratedDelivery,
});
