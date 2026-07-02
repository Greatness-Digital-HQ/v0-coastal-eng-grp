// CEG — Vendor / Employee Portal (mockup)
// Both portals share the same shell (hero, single-password login gate,
// dashboard chrome) but render different widget content once "signed in."
// Active portal is chosen by window.__CEG_PORTAL ("vendor" | "employee"),
// set by each route before this file runs — same pattern as service-app.jsx.
//
// NOTE: this is a client-demo mockup, not a real auth system. The password
// check happens in the browser and is intentionally visible in source — do
// not wire real vendor/employee data behind this until proper auth exists.

const { useState: usePT, useEffect: usePE } = React;

const PORTAL_PAGES = {
  vendor: {
    key: "vendor",
    eyebrow: "Vendor Portal",
    h1: "Partner with Coastal Engineering Group.",
    lede: "A single place for subcontractors and suppliers to submit qualification documents, track active solicitations, and check payment status on work performed for CEG.",
    features: [
      { text: "Submit your W-9, COI, and capability statement", icon: "doc" },
      { text: "See open RFQs and bid opportunities", icon: "search" },
      { text: "Track invoice and payment status", icon: "check" },
    ],
    loginTitle: "Vendor Sign In",
    loginSub: "Enter the vendor portal password to view your dashboard.",
    password: "vendor2026",
    welcomeName: "Atlantic Marine Supply Co.",
    welcomeSub: "Vendor since 2022 · Approved Subcontractor",
  },
  employee: {
    key: "employee",
    eyebrow: "Employee Portal",
    h1: "Your work. Your team. One place.",
    lede: "Coastal Engineering Group employees can review timesheets, pay and benefits, safety certifications, and company announcements from a single dashboard.",
    features: [
      { text: "Submit timesheets and request PTO", icon: "clock" },
      { text: "View pay stubs and benefits enrollment", icon: "doc" },
      { text: "Track safety training and certifications", icon: "check" },
    ],
    loginTitle: "Employee Sign In",
    loginSub: "Enter the employee portal password to view your dashboard.",
    password: "employee2026",
    welcomeName: "Jordan Reyes",
    welcomeSub: "Field Operations · Marine Construction Division",
  },
};

// ─── Icons ──────────────────────────────────────────────────────────────────
const ICON = {
  doc: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  search: "M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z",
  check: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  lock: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z",
  upload: "M12 16V4m0 0L7 9m5-5l5 5M4 20h16",
  bell: "M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  phone: "M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
};

function Icon({ d, className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────
function PortalHero({ d }) {
  return (
    <section className="portal-hero">
      <div className="ceg-container">
        <div className="portal-eyebrow">
          <span className="portal-eyebrow-mark" />
          <span>{d.eyebrow}</span>
        </div>
        <h1 className="portal-h1">{d.h1}</h1>
        <p className="portal-lead">{d.lede}</p>
        <div className="portal-hero-features">
          {d.features.map((f, i) => (
            <div key={i} className="portal-hero-feature">
              <Icon d={ICON[f.icon]} className="portal-hero-feature-icon" />
              <span className="portal-hero-feature-text">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Login gate ─────────────────────────────────────────────────────────────
function PortalLogin({ d, onSuccess }) {
  const [password, setPassword] = usePT("");
  const [error, setError] = usePT(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (password === d.password) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <div className="portal-auth-layout">
      <form className="portal-login-card" onSubmit={handleSubmit}>
        <div className="portal-login-icon">
          <Icon d={ICON.lock} className="ceg-icon" />
        </div>
        <h2 className="portal-login-h2">{d.loginTitle}</h2>
        <p className="portal-login-sub">{d.loginSub}</p>

        <div className="portal-field">
          <label className="portal-label" htmlFor="portal-password">Password</label>
          <input
            id="portal-password"
            type="password"
            className={`portal-input ${error ? "has-error" : ""}`}
            placeholder="Enter password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            autoFocus
          />
          {error && <p className="portal-error">Incorrect password. Please try again.</p>}
        </div>

        <button type="submit" className="portal-btn-submit">Sign In →</button>

        <p className="portal-login-hint">
          <strong>Demo access:</strong> this is a mockup for internal review — password is <strong>{d.password}</strong>.
        </p>

        <p className="portal-login-foot">
          Trouble signing in? <a href="/request-a-bid">Contact us</a> or call <a href="tel:8453283178">845-328-3178</a>.
        </p>
      </form>
    </div>
  );
}

// ─── Vendor dashboard ───────────────────────────────────────────────────────
function VendorDashboard() {
  const rfqs = [
    { title: "NAVFAC Mid-Atlantic — Pile Driving Subcontract", meta: "Due Jul 18, 2026", badge: "Open", badgeType: "good" },
    { title: "Port Newark Wharf Rehab — Steel Supply", meta: "Due Jul 24, 2026", badge: "Open", badgeType: "good" },
    { title: "Greenwood Lake Dam — Concrete Supply", meta: "Closes in 3 days", badge: "Closing Soon", badgeType: "warn" },
  ];
  const documents = [
    { title: "W-9", meta: "Updated Jan 2026", badge: "Approved", badgeType: "good" },
    { title: "Certificate of Insurance", meta: "Expires Sep 12, 2026", badge: "Expiring Soon", badgeType: "pend" },
    { title: "Capability Statement", meta: "Submitted Jun 2026", badge: "Approved", badgeType: "good" },
    { title: "Safety Program / EMR", meta: "Awaiting review", badge: "Pending", badgeType: "pend" },
  ];
  const invoices = [
    { title: "Invoice #CEG-10482 — Mayport Wharf", meta: "Paid Jun 28, 2026", value: "$18,400" },
    { title: "Invoice #CEG-10511 — Port Newark", meta: "Pending approval", value: "$9,760" },
    { title: "Invoice #CEG-10529 — Greenwood Lake", meta: "Submitted Jun 30, 2026", value: "$24,150" },
  ];
  const checklist = [
    { label: "SAM.gov registration current", done: true },
    { label: "W-9 on file", done: true },
    { label: "Certificate of Insurance", done: false },
    { label: "Signed subcontractor agreement", done: true },
  ];

  return (
    <div className="portal-dash">
      <div className="portal-stats">
        <div className="portal-stat-tile">
          <div className="portal-stat-value">3</div>
          <div className="portal-stat-label">Open RFQs</div>
        </div>
        <div className="portal-stat-tile">
          <div className="portal-stat-value">4</div>
          <div className="portal-stat-label">Documents on File</div>
        </div>
        <div className="portal-stat-tile">
          <div className="portal-stat-value">$52.3K</div>
          <div className="portal-stat-label">YTD Payments</div>
        </div>
        <div className="portal-stat-tile">
          <div className="portal-stat-value">75%</div>
          <div className="portal-stat-label">Compliance Complete</div>
        </div>
      </div>

      <div className="portal-grid">
        <div className="portal-widget">
          <div className="portal-widget-head">
            <h3 className="portal-widget-title">Active RFQs &amp; Bid Opportunities</h3>
            <a href="#" className="portal-widget-link" onClick={(e) => e.preventDefault()}>View all →</a>
          </div>
          <div className="portal-rows">
            {rfqs.map((r, i) => (
              <div key={i} className="portal-row">
                <div className="portal-row-main">
                  <p className="portal-row-title">{r.title}</p>
                  <span className="portal-row-meta">{r.meta}</span>
                </div>
                <span className={`portal-badge portal-badge-${r.badgeType}`}>{r.badge}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="portal-widget">
          <div className="portal-widget-head">
            <h3 className="portal-widget-title">Submitted Documents</h3>
            <a href="#" className="portal-widget-link" onClick={(e) => e.preventDefault()}>Upload new →</a>
          </div>
          <div className="portal-rows">
            {documents.map((doc, i) => (
              <div key={i} className="portal-row">
                <div className="portal-row-main">
                  <p className="portal-row-title">{doc.title}</p>
                  <span className="portal-row-meta">{doc.meta}</span>
                </div>
                <span className={`portal-badge portal-badge-${doc.badgeType}`}>{doc.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="portal-grid">
        <div className="portal-widget">
          <div className="portal-widget-head">
            <h3 className="portal-widget-title">Payment &amp; Invoice Status</h3>
            <a href="#" className="portal-widget-link" onClick={(e) => e.preventDefault()}>View all →</a>
          </div>
          <div className="portal-rows">
            {invoices.map((inv, i) => (
              <div key={i} className="portal-row">
                <div className="portal-row-main">
                  <p className="portal-row-title">{inv.title}</p>
                  <span className="portal-row-meta">{inv.meta}</span>
                </div>
                <span className="portal-row-value">{inv.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="portal-widget">
          <div className="portal-widget-head">
            <h3 className="portal-widget-title">Compliance Checklist</h3>
          </div>
          <div className="portal-checklist">
            {checklist.map((c, i) => (
              <div key={i} className={`portal-check-item ${c.done ? "is-done" : "is-pending"}`}>
                <div className={`portal-check-icon ${c.done ? "is-done" : "is-pending"}`}>
                  {c.done && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1.5,5 4,7.5 8.5,2" />
                    </svg>
                  )}
                </div>
                <span className="portal-check-label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="portal-widget">
        <div className="portal-widget-head">
          <h3 className="portal-widget-title">Quick Actions</h3>
        </div>
        <div className="portal-actions">
          <a className="portal-action-btn" href="#" onClick={(e) => e.preventDefault()}>
            <Icon d={ICON.upload} /> Upload a Document
          </a>
          <a className="portal-action-btn" href="#" onClick={(e) => e.preventDefault()}>
            <Icon d={ICON.doc} /> Submit Capability Statement
          </a>
          <a className="portal-action-btn" href="/request-a-bid">
            <Icon d={ICON.phone} /> Contact Procurement
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Employee dashboard ─────────────────────────────────────────────────────
function EmployeeDashboard() {
  const announcements = [
    { title: "Q3 Safety Stand-Down — July 14", meta: "All field personnel", badge: "Action Needed", badgeType: "warn" },
    { title: "Open Enrollment opens August 1", meta: "Benefits", badge: "Upcoming", badgeType: "info" },
    { title: "New ADCI refresher course available", meta: "Training", badge: "New", badgeType: "good" },
  ];
  const certs = [
    { title: "ADCI Commercial Diver Certification", meta: "Expires Nov 2026", badge: "Current", badgeType: "good" },
    { title: "OSHA 30 — Construction Safety", meta: "Expires Mar 2027", badge: "Current", badgeType: "good" },
    { title: "EM385 Site Safety Refresher", meta: "Due in 18 days", badge: "Renew Soon", badgeType: "pend" },
  ];
  const checklist = [
    { label: "Direct deposit on file", done: true },
    { label: "Emergency contact updated", done: true },
    { label: "Benefits enrollment confirmed", done: false },
    { label: "Handbook acknowledgment signed", done: true },
  ];

  return (
    <div className="portal-dash">
      <div className="portal-stats">
        <div className="portal-stat-tile">
          <div className="portal-stat-value">38.5</div>
          <div className="portal-stat-label">Hours This Week</div>
        </div>
        <div className="portal-stat-tile">
          <div className="portal-stat-value">12</div>
          <div className="portal-stat-label">PTO Days Available</div>
        </div>
        <div className="portal-stat-tile">
          <div className="portal-stat-value">Jul 15</div>
          <div className="portal-stat-label">Next Pay Date</div>
        </div>
        <div className="portal-stat-tile">
          <div className="portal-stat-value">2 of 3</div>
          <div className="portal-stat-label">Certs Current</div>
        </div>
      </div>

      <div className="portal-grid">
        <div className="portal-widget">
          <div className="portal-widget-head">
            <h3 className="portal-widget-title">Time &amp; Attendance</h3>
            <a href="#" className="portal-widget-link" onClick={(e) => e.preventDefault()}>Submit timesheet →</a>
          </div>
          <div className="portal-rows">
            <div className="portal-row">
              <div className="portal-row-main">
                <p className="portal-row-title">Week of Jun 30 – Jul 6</p>
                <span className="portal-row-meta">Submitted, awaiting approval</span>
              </div>
              <span className="portal-badge portal-badge-pend">Pending</span>
            </div>
            <div className="portal-row">
              <div className="portal-row-main">
                <p className="portal-row-title">Week of Jun 23 – Jun 29</p>
                <span className="portal-row-meta">40.0 hrs · approved</span>
              </div>
              <span className="portal-badge portal-badge-good">Approved</span>
            </div>
            <div className="portal-row">
              <div className="portal-row-main">
                <p className="portal-row-title">Week of Jun 16 – Jun 22</p>
                <span className="portal-row-meta">39.5 hrs · approved</span>
              </div>
              <span className="portal-badge portal-badge-good">Approved</span>
            </div>
          </div>
        </div>

        <div className="portal-widget">
          <div className="portal-widget-head">
            <h3 className="portal-widget-title">Pay &amp; Benefits</h3>
            <a href="#" className="portal-widget-link" onClick={(e) => e.preventDefault()}>View pay stubs →</a>
          </div>
          <div className="portal-rows">
            <div className="portal-row">
              <div className="portal-row-main">
                <p className="portal-row-title">Pay Stub — Jun 30, 2026</p>
                <span className="portal-row-meta">Direct deposit · Chase ••1234</span>
              </div>
              <span className="portal-row-value">View</span>
            </div>
            <div className="portal-row">
              <div className="portal-row-main">
                <p className="portal-row-title">Medical / Dental / Vision</p>
                <span className="portal-row-meta">Enrolled · Employer-paid plan</span>
              </div>
              <span className="portal-badge portal-badge-good">Active</span>
            </div>
            <div className="portal-row">
              <div className="portal-row-main">
                <p className="portal-row-title">401(k) Contribution</p>
                <span className="portal-row-meta">6% · company match applied</span>
              </div>
              <span className="portal-badge portal-badge-good">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="portal-grid">
        <div className="portal-widget">
          <div className="portal-widget-head">
            <h3 className="portal-widget-title">Safety &amp; Certifications</h3>
          </div>
          <div className="portal-rows">
            {certs.map((c, i) => (
              <div key={i} className="portal-row">
                <div className="portal-row-main">
                  <p className="portal-row-title">{c.title}</p>
                  <span className="portal-row-meta">{c.meta}</span>
                </div>
                <span className={`portal-badge portal-badge-${c.badgeType}`}>{c.badge}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="portal-widget">
          <div className="portal-widget-head">
            <h3 className="portal-widget-title">Company Announcements</h3>
          </div>
          <div className="portal-rows">
            {announcements.map((a, i) => (
              <div key={i} className="portal-row">
                <div className="portal-row-main">
                  <p className="portal-row-title">{a.title}</p>
                  <span className="portal-row-meta">{a.meta}</span>
                </div>
                <span className={`portal-badge portal-badge-${a.badgeType}`}>{a.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="portal-widget">
        <div className="portal-widget-head">
          <h3 className="portal-widget-title">Onboarding Checklist</h3>
        </div>
        <div className="portal-checklist" style={{ marginBottom: 22 }}>
          {checklist.map((c, i) => (
            <div key={i} className={`portal-check-item ${c.done ? "is-done" : "is-pending"}`}>
              <div className={`portal-check-icon ${c.done ? "is-done" : "is-pending"}`}>
                {c.done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1.5,5 4,7.5 8.5,2" />
                  </svg>
                )}
              </div>
              <span className="portal-check-label">{c.label}</span>
            </div>
          ))}
        </div>
        <div className="portal-actions">
          <a className="portal-action-btn" href="#" onClick={(e) => e.preventDefault()}>
            <Icon d={ICON.clock} /> Submit Timesheet
          </a>
          <a className="portal-action-btn" href="#" onClick={(e) => e.preventDefault()}>
            <Icon d={ICON.bell} /> Request PTO
          </a>
          <a className="portal-action-btn" href="#" onClick={(e) => e.preventDefault()}>
            <Icon d={ICON.doc} /> Employee Handbook
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
function PortalApp() {
  const data = window.CEG_DATA;
  const theme = window.CEG_THEMES.drydock;
  const key = window.__CEG_PORTAL === "employee" ? "employee" : "vendor";
  const d = PORTAL_PAGES[key];
  const [mobileOpen, setMobileOpen] = usePT(false);
  const [authed, setAuthed] = usePT(false);

  usePE(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = `portal-${key}`;
    document.title = `${d.eyebrow} — Coastal Engineering Group`;
  }, [key]);

  return (
    <div className="ceg-app concept-drydock page-portal" style={window.applyThemeVars(theme)}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main className="portal-page">
        <PortalHero d={d} />
        <div className="portal-body">
          <div className="ceg-container">
            {!authed ? (
              <PortalLogin d={d} onSuccess={() => setAuthed(true)} />
            ) : (
              <>
                <div className="portal-dash-head">
                  <div>
                    <h2 className="portal-dash-welcome">Welcome back, {d.welcomeName}</h2>
                    <p className="portal-dash-sub">{d.welcomeSub}</p>
                  </div>
                  <button type="button" className="portal-logout" onClick={() => setAuthed(false)}>
                    Log Out
                  </button>
                </div>
                {key === "vendor" ? <VendorDashboard /> : <EmployeeDashboard />}
                <p className="portal-mock-note">
                  This dashboard is a design mockup with sample data — no live vendor or employee records are connected yet.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<PortalApp />);
