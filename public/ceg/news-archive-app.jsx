// CEG — Insights / News archive

const { useState: useNA } = React;

const CATEGORY_COLORS = {
  "Press Release":    { bg: "#1c6fbf", text: "#fff" },
  "News":             { bg: "#0f7b6c", text: "#fff" },
  "Industry Insight": { bg: "#7c3aed", text: "#fff" },
  "Project Update":   { bg: "#b45309", text: "#fff" },
};

// ─── Featured article (first in list) ────────────────────────────────────────
function FeaturedArticle({ article }) {
  const cc = CATEGORY_COLORS[article.category] || { bg: "#374151", text: "#fff" };
  return (
    <a href={`/insights/news/${article.slug}`} className="nws-featured">
      <div className="nws-featured-media">
        <img src={article.image} alt={article.title} loading="eager" />
      </div>
      <div className="nws-featured-body">
        <div className="nws-featured-top">
          <span className="nws-cat-badge" style={{ background: cc.bg, color: cc.text }}>{article.category}</span>
          <span className="nws-meta">{article.date} · {article.readTime}</span>
        </div>
        <h2 className="nws-featured-title">{article.title}</h2>
        <p className="nws-featured-excerpt">{article.excerpt}</p>
        <span className="nws-read-link">Read Article →</span>
      </div>
    </a>
  );
}

// ─── Standard card ────────────────────────────────────────────────────────────
function NewsCard({ article }) {
  const cc = CATEGORY_COLORS[article.category] || { bg: "#374151", text: "#fff" };
  return (
    <a href={`/insights/news/${article.slug}`} className="nws-card">
      <div className="nws-card-media">
        <img src={article.image} alt={article.title} loading="lazy" />
        <span className="nws-cat-badge nws-cat-badge-abs" style={{ background: cc.bg, color: cc.text }}>{article.category}</span>
      </div>
      <div className="nws-card-body">
        <div className="nws-meta">{article.date} · {article.readTime}</div>
        <h3 className="nws-card-title">{article.title}</h3>
        <p className="nws-card-excerpt">{article.excerpt}</p>
        <div className="nws-card-tags">
          {article.tags.map(t => <span key={t} className="nws-tag">{t}</span>)}
        </div>
      </div>
    </a>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────
function NewsFilterBar({ active, onChange, articles }) {
  const cats = ["All", ...Array.from(new Set(articles.map(a => a.category)))];
  return (
    <div className="prj-filter-bar">
      <div className="ceg-container">
        <div className="prj-filter-inner">
          {cats.map((c) => (
            <button
              key={c}
              className={`prj-filter-btn ${active === c ? "is-active" : ""}`}
              onClick={() => onChange(c)}
            >
              {c}
              <span className="prj-filter-count">
                {c === "All" ? articles.length : articles.filter(a => a.category === c).length}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Archive page ─────────────────────────────────────────────────────────────
function NewsArchive() {
  const articles = window.CEG_NEWS;
  const [activeFilter, setActiveFilter] = useNA("All");

  const filtered = activeFilter === "All"
    ? articles
    : articles.filter(a => a.category === activeFilter);

  const [featured, ...rest] = filtered;

  return (
    <>
      {/* Hero */}
      <section className="nws-hero">
        <div className="ceg-container nws-hero-inner">
          <div className="ceg-eyebrow fed-eyebrow">
            <span className="ceg-eyebrow-mark" />
            <span>News &amp; Insights</span>
          </div>
          <h1 className="prj-archive-h1">Projects, People, and Marine Infrastructure Knowledge</h1>
          <p className="prj-archive-lede">
            Follow Coastal Engineering Group&apos;s project awards, completions, growth, safety
            milestones, technical perspectives, equipment updates, and community involvement.
          </p>
        </div>
      </section>

      {/* Filter + content */}
      <div className="nws-body">
        <NewsFilterBar active={activeFilter} onChange={setActiveFilter} articles={articles} />
        <div className="ceg-container">
          {featured && (
            <div className="nws-featured-wrap">
              <FeaturedArticle article={featured} />
            </div>
          )}
          {rest.length > 0 && (
            <div className="nws-grid">
              {rest.map(a => <NewsCard key={a.slug} article={a} />)}
            </div>
          )}
          {filtered.length === 0 && (
            <p className="prj-empty">No articles in this category yet.</p>
          )}
        </div>
      </div>
    </>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
function NewsArchiveApp() {
  const data = window.CEG_DATA;
  const theme = window.CEG_THEMES.drydock;
  const [mobileOpen, setMobileOpen] = useNA(false);

  React.useEffect(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = "news-archive";
  }, []);

  return (
    <div className="ceg-app concept-drydock page-news-archive" style={window.applyThemeVars(theme)}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        <NewsArchive />
        <window.ContactBand theme={theme} data={data} />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<NewsArchiveApp />);
