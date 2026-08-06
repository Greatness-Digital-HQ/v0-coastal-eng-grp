// CEG — Request a Bid (multi-step form)

const { useState: useB, useEffect: useBE } = React;

// ─── Form data ────────────────────────────────────────────────────────────────
const PROJECT_TYPES = [
  { key: "diving",          title: "Commercial Diving",   desc: "Inspection, repair & salvage" },
  { key: "engineering",     title: "Marine Engineering",  desc: "PE-stamped design & assessment" },
  { key: "construction",    title: "Marine Construction", desc: "Seawalls, piers & underwater repair" },
  { key: "dredging",        title: "Dredging",            desc: "Navigation & sediment management" },
  { key: "marine-services", title: "Marine Services",     desc: "Vessels, ROVs & equipment" },
  { key: "federal",         title: "Federal Contract",    desc: "NAVFAC / USACE task order" },
];

// "What can we help with?" — the inquiry router from Section 18 of the edit
// package. This governs which internal contact receives the submission, so it
// is asked before the discipline breakdown.
const INQUIRY_TYPES = [
  "Project opportunity",
  "Prime contractor / teaming inquiry",
  "Engineering or inspection need",
  "Emergency marine or underwater response",
  "Vendor / subcontractor inquiry",
  "Employment",
  "Media / general question",
];

const MARKETS   = ["Federal", "State & Local", "Commercial", "Energy", "Industrial"];
const TIMELINES = ["Immediate (ASAP)", "1–3 months", "3–6 months", "6–12 months", "Planning phase only"];
const REFERRALS = ["NAVFAC / USACE contractor list", "Referral", "Web search", "LinkedIn", "Conference / trade show", "Returning client", "Other"];

// ─── Service icons ────────────────────────────────────────────────────────────
const TYPE_ICONS = {
  diving: (
    <svg className="bid-type-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="10" r="4.5"/>
      <path d="M8 27c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
      <path d="M3 18 Q9 15 16 18 Q23 21 29 18"/>
    </svg>
  ),
  engineering: (
    <svg className="bid-type-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="11"/>
      <path d="M16 5 L19 13 L16 16 L13 13 Z"/>
      <line x1="16" y1="16" x2="24" y2="22"/>
    </svg>
  ),
  construction: (
    <svg className="bid-type-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3"  y1="9"  x2="29" y2="9"/>
      <line x1="8"  y1="9"  x2="8"  y2="26"/>
      <line x1="24" y1="9"  x2="24" y2="26"/>
      <path d="M12 9 L12 20 L20 20 L20 9"/>
      <path d="M3 26 Q16 22 29 26"/>
    </svg>
  ),
  dredging: (
    <svg className="bid-type-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12 Q16 8 29 12"/>
      <path d="M3 20 Q16 16 29 20"/>
      <line x1="16" y1="4" x2="16" y2="22"/>
      <polyline points="11,17 16,24 21,17"/>
    </svg>
  ),
  "marine-services": (
    <svg className="bid-type-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 20 L9 13 L23 13 L27 20 Z"/>
      <path d="M3 20 Q16 25 29 20"/>
      <line x1="16" y1="6" x2="16" y2="13"/>
      <line x1="16" y1="6" x2="22" y2="11"/>
    </svg>
  ),
  federal: (
    <svg className="bid-type-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 28 L4 13 L16 4 L28 13 L28 28"/>
      <line x1="4"  y1="28" x2="28" y2="28"/>
      <line x1="4"  y1="13" x2="28" y2="13"/>
      <rect x="12" y="18" width="8" height="10"/>
    </svg>
  ),
};

// ─── Step progress bar ────────────────────────────────────────────────────────
function BidProgress({ step }) {
  const steps = [
    { n: 1, label: "Project Type" },
    { n: 2, label: "Details" },
    { n: 3, label: "Contact" },
  ];
  return (
    <div className="bid-progress">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="bid-prog-step">
            <div className={`bid-prog-num ${step === s.n ? "is-active" : step > s.n ? "is-done" : ""}`}>
              {step > s.n
                ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,6.5 5.5,10 11,3"/></svg>
                : s.n}
            </div>
            <span className={`bid-prog-label ${step === s.n ? "is-active" : step > s.n ? "is-done" : ""}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`bid-prog-line ${step > s.n ? "is-done" : ""}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Left sidebar ─────────────────────────────────────────────────────────────
function BidSidebar() {
  const timeline = [
    { title: "Submit your brief",        sub: "Takes about 3 minutes" },
    { title: "Engineering review",       sub: "Qualified PE evaluates scope" },
    { title: "Bid delivered",            sub: "Typically within 24–48 hours" },
    { title: "Scope call if needed",     sub: "Scheduled at your convenience" },
  ];
  return (
    <aside className="bid-sidebar">
      <div className="bid-sidebar-label">What happens next</div>
      <div className="bid-sidebar-timeline">
        {timeline.map((item, i) => (
          <div key={i} className="bid-sidebar-item">
            <div className="bid-sidebar-item-track">
              <div className="bid-sidebar-item-dot" />
              {i < timeline.length - 1 && <div className="bid-sidebar-item-line" />}
            </div>
            <div className="bid-sidebar-item-body">
              <div className="bid-sidebar-item-title">{item.title}</div>
              <div className="bid-sidebar-item-sub">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bid-sidebar-rule" />

      <div className="bid-sidebar-creds">
        <div className="bid-sidebar-cred-label">Why CEG</div>
        {["PE-licensed divers — 13 states", "VOSB · NAVFAC MACC pre-qualified", "EM385 · ADCI · ASDSO certified", "PE-stamped deliverables, every project"].map(c => (
          <div key={c} className="bid-sidebar-cred">{c}</div>
        ))}
      </div>

      <div className="bid-sidebar-rule" />

      <div className="bid-sidebar-contact">
        <div className="bid-sidebar-label">Prefer to call?</div>
        <a href="tel:8453283178" className="bid-sidebar-phone">845-328-3178</a>
        <a href="mailto:info@coastalengineeringgroup.com" className="bid-sidebar-email">info@coastalengineeringgroup.com</a>
      </div>
    </aside>
  );
}

// ─── Step 1: Project type ─────────────────────────────────────────────────────
function Step1({ selected, onToggle, onNext, inquiryType, onInquiryType }) {
  return (
    <div className="bid-step-panel">
      <h2 className="bid-step-h2">What can we help with?</h2>
      <p className="bid-step-sub">This tells us who should pick up the inquiry.</p>
      <div className="bid-fields bid-inquiry-field">
        <div className="bid-field">
          <label className="bid-label" htmlFor="bid-inquiry-type">
            Inquiry type <span className="bid-req">*</span>
          </label>
          <select
            id="bid-inquiry-type"
            className="bid-select"
            value={inquiryType}
            required
            onChange={(e) => onInquiryType(e.target.value)}
          >
            <option value="">Select the type of inquiry</option>
            {INQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <h3 className="bid-step-h3">Which capabilities are involved?</h3>
      <p className="bid-step-sub">Select all that apply — most projects span multiple disciplines.</p>
      <div className="bid-type-grid">
        {PROJECT_TYPES.map(pt => (
          <div
            key={pt.key}
            className={`bid-type-card ${selected.includes(pt.key) ? "is-selected" : ""}`}
            onClick={() => onToggle(pt.key)}
          >
            {TYPE_ICONS[pt.key]}
            <div className="bid-type-title">{pt.title}</div>
            <div className="bid-type-desc">{pt.desc}</div>
            <div className="bid-type-check">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1.5,5 4,7.5 8.5,2"/>
              </svg>
            </div>
          </div>
        ))}
      </div>
      <div className="bid-nav bid-nav-end">
        <button className="bid-btn-next" onClick={onNext} disabled={!inquiryType || selected.length === 0}>
          Continue — Project Details →
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Project details ──────────────────────────────────────────────────
function Step2({ form, onChange, onNext, onBack }) {
  const canNext = form.market && form.description.trim().length > 15;
  const charsLeft = 500 - form.description.length;
  return (
    <div className="bid-step-panel">
      <h2 className="bid-step-h2">Tell us about the project.</h2>
      <p className="bid-step-sub">The more context you share, the faster we build an accurate bid.</p>

      <div className="bid-fields">
        <div className="bid-field">
          <label className="bid-label">Market Segment <span className="bid-req">*</span></label>
          <div className="bid-market-row">
            {MARKETS.map(m => (
              <button key={m} type="button"
                className={`bid-market-btn ${form.market === m ? "is-active" : ""}`}
                onClick={() => onChange("market", m)}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="bid-row-2">
          <div className="bid-field">
            <label className="bid-label">Project State / Location</label>
            <input className="bid-input" placeholder="e.g. New York, NJ, Florida" value={form.state} onChange={e => onChange("state", e.target.value)} />
          </div>
          <div className="bid-field">
            <label className="bid-label">Estimated Start</label>
            <select className="bid-select" value={form.timeline} onChange={e => onChange("timeline", e.target.value)}>
              <option value="">Select timeline</option>
              {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="bid-field">
          <label className="bid-label">Project Brief <span className="bid-req">*</span></label>
          <textarea
            className="bid-textarea"
            placeholder="Describe the scope of work — structure type, water depth, known conditions, special constraints, or anything else that shapes the bid..."
            value={form.description}
            maxLength={500}
            onChange={e => onChange("description", e.target.value)}
          />
          <div className="bid-char-count">{charsLeft} characters remaining</div>
        </div>
      </div>

      <div className="bid-nav">
        <button className="bid-btn-back" type="button" onClick={onBack}>← Back</button>
        <button className="bid-btn-next" type="button" onClick={onNext} disabled={!canNext}>
          Continue — Contact Info →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Contact info ─────────────────────────────────────────────────────
function Step3({ form, onChange, onSubmit, onBack, submitting }) {
  const canSubmit = form.name.trim() && form.email.trim() && form.org.trim();
  return (
    <div className="bid-step-panel">
      <h2 className="bid-step-h2">How do we reach you?</h2>
      <p className="bid-step-sub">Your information is never shared. Expect a response within one business day.</p>

      <div className="bid-fields">
        <div className="bid-row-2">
          <div className="bid-field">
            <label className="bid-label">Full Name <span className="bid-req">*</span></label>
            <input className="bid-input" placeholder="Your name" value={form.name} onChange={e => onChange("name", e.target.value)} />
          </div>
          <div className="bid-field">
            <label className="bid-label">Title</label>
            <input className="bid-input" placeholder="e.g. Project Manager" value={form.title} onChange={e => onChange("title", e.target.value)} />
          </div>
        </div>

        <div className="bid-field">
          <label className="bid-label">Organization <span className="bid-req">*</span></label>
          <input className="bid-input" placeholder="Agency, company, or municipality" value={form.org} onChange={e => onChange("org", e.target.value)} />
        </div>

        <div className="bid-row-2">
          <div className="bid-field">
            <label className="bid-label">Email <span className="bid-req">*</span></label>
            <input className="bid-input" type="email" placeholder="you@organization.gov" value={form.email} onChange={e => onChange("email", e.target.value)} />
          </div>
          <div className="bid-field">
            <label className="bid-label">Phone</label>
            <input className="bid-input" type="tel" placeholder="(000) 000-0000" value={form.phone} onChange={e => onChange("phone", e.target.value)} />
          </div>
        </div>

        <div className="bid-field">
          <label className="bid-label">How did you find CEG?</label>
          <select className="bid-select" value={form.referral} onChange={e => onChange("referral", e.target.value)}>
            <option value="">Select one</option>
            {REFERRALS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="bid-nav">
        <button className="bid-btn-back" type="button" onClick={onBack}>← Back</button>
        <button className="bid-btn-submit" type="button" onClick={onSubmit} disabled={!canSubmit || submitting}>
          {submitting
            ? <span className="bid-submitting">Submitting<span className="bid-dots" /></span>
            : "Submit Bid Request →"}
        </button>
      </div>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function BidSuccess({ refNum }) {
  return (
    <div className="bid-success">
      <div className="bid-success-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="#1c6fbf" strokeWidth="1.5"/>
          <polyline points="18,32 27,41 46,22" stroke="#1c6fbf" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="bid-success-ref">Request #{refNum}</div>
      <h2 className="bid-success-h2">Thank you. Your inquiry has been received.</h2>
      <p className="bid-success-body">
        Your inquiry has been routed to the appropriate Coastal team member, who will follow up
        at the email address provided. {/* TODO(client): add the verified time-sensitive
        response number here once Coastal confirms it — see Section 18 of the edit package. */}
      </p>
      <div className="bid-success-next-label">In the meantime</div>
      <div className="bid-success-links">
        <a href="/projects/featured-work" className="bid-success-link">View our project portfolio →</a>
        <a href="/insights/news" className="bid-success-link">Read our latest news →</a>
        <a href="/markets/federal" className="bid-success-link">Our federal capabilities →</a>
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
function BidRequestApp() {
  const data  = window.CEG_DATA;
  const theme = window.CEG_THEMES.drydock;
  const [mobileOpen, setMobileOpen] = useB(false);
  const [step,         setStep]         = useB(1);
  const [projectTypes, setProjectTypes] = useB([]);
  const [submitted,    setSubmitted]    = useB(false);
  const [submitting,   setSubmitting]   = useB(false);
  const [refNum]                        = useB(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const [form, setForm] = useB({
    inquiryType: "",
    market: "", state: "", timeline: "", description: "",
    name: "", title: "", org: "", email: "", phone: "", referral: "",
  });

  function toggleType(key) {
    setProjectTypes(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }
  function updateForm(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }
  // ⚠ PROTOTYPE STUB — this does not transmit the submission anywhere. It fakes
  // a network round-trip and shows the success screen. A real handler (server
  // endpoint, validation, spam protection, routing by inquiry type, and a
  // confirmation email) is required before launch — see Section 18 and the
  // launch checklist, Section 19-E.
  function handleSubmit() {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1600);
  }

  useBE(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page    = "contact";
    document.title = "Contact Coastal Engineering Group | Discuss a Marine Project";
  }, []);

  return (
    <div className="ceg-app concept-drydock page-bid-request" style={window.applyThemeVars(theme)}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main className="bid-page">

        {/* ── Page header ── */}
        <section className="bid-hero">
          <div className="ceg-container">
            <div className="bid-eyebrow">
              <span className="bid-eyebrow-mark" />
              Contact
            </div>
            <h1 className="bid-h1">Discuss a Marine<br />Infrastructure Project.</h1>
            <p className="bid-lead">
              Tell us what you are planning, pursuing, evaluating, or responding to. Coastal
              will route the inquiry to the appropriate construction, engineering, dredging,
              diving, marine operations, federal, or corporate contact.
            </p>
          </div>
        </section>

        {/* ── Form body ── */}
        <div className="bid-body">
          <div className="ceg-container">
            {submitted ? (
              <BidSuccess refNum={refNum} />
            ) : (
              <div className="bid-layout">
                <BidSidebar />
                <div className="bid-form-col">
                  <BidProgress step={step} />
                  {step === 1 && (
                    <Step1 selected={projectTypes} onToggle={toggleType} onNext={() => setStep(2)}
                      inquiryType={form.inquiryType} onInquiryType={(v) => updateForm("inquiryType", v)} />
                  )}
                  {step === 2 && (
                    <Step2 form={form} onChange={updateForm} onNext={() => setStep(3)} onBack={() => setStep(1)} />
                  )}
                  {step === 3 && (
                    <Step3 form={form} onChange={updateForm} onSubmit={handleSubmit} onBack={() => setStep(2)} submitting={submitting} />
                  )}
                </div>
              </div>
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
root.render(<BidRequestApp />);
