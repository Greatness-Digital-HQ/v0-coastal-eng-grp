// CEG — Insights / News detail / single article

const { useState: useND, useEffect: useNDE } = React;

const CATEGORY_COLORS = {
  "Press Release":    { bg: "#1c6fbf", text: "#fff" },
  "News":             { bg: "#0f7b6c", text: "#fff" },
  "Industry Insight": { bg: "#7c3aed", text: "#fff" },
  "Project Update":   { bg: "#b45309", text: "#fff" },
};

// ─── Related articles (bottom row) ───────────────────────────────────────────
function RelatedArticles({ current, all }) {
  const related = all
    .filter(a => a.slug !== current.slug && (
      a.category === current.category ||
      a.tags.some(t => current.tags.includes(t))
    ))
    .slice(0, 3);

  if (!related.length) return null;
  return (
    <section className="nws-detail-related">
      <div className="ceg-container">
        <div className="nws-detail-related-inner">
          <div className="nws-detail-sidebar-label">Related Articles</div>
          <div className="nws-detail-related-list">
            {related.map(a => {
              const cc = CATEGORY_COLORS[a.category] || { bg: "#374151", text: "#fff" };
              return (
                <a key={a.slug} href={`/insights/news/${a.slug}`} className="nws-related-item">
                  <div className="nws-related-img">
                    <img src={a.image} alt={a.title} loading="lazy" />
                  </div>
                  <div className="nws-related-text">
                    <span className="nws-cat-badge nws-cat-badge-sm" style={{ background: cc.bg, color: cc.text }}>{a.category}</span>
                    <div className="nws-related-title">{a.title}</div>
                    <div className="nws-meta">{a.date}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Article not found ────────────────────────────────────────────────────────
function ArticleNotFound({ slug }) {
  return (
    <section style={{ padding: "120px 0", textAlign: "center", background: "#0b1929", minHeight: "60vh" }}>
      <div className="ceg-container">
        <p style={{ color: "#5b9bd5", fontFamily: "var(--font-inter)", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>Article Not Found</p>
        <h1 style={{ color: "#fff", fontFamily: "var(--font-barlow)", fontWeight: 900, fontSize: "clamp(1.8rem,4vw,2.6rem)", marginBottom: 24 }}>"{slug}"</h1>
        <a href="/insights/news" style={{ color: "#5b9bd5", fontFamily: "var(--font-inter)", fontSize: 14, textDecoration: "underline" }}>← Back to News</a>
      </div>
    </section>
  );
}

// ─── Article detail ───────────────────────────────────────────────────────────
function ArticleDetail({ article, all }) {
  const cc = CATEGORY_COLORS[article.category] || { bg: "#374151", text: "#fff" };
  return (
    <>
      {/* Hero */}
      <section className="nws-detail-hero" style={{ "--hero-img": `url(${article.image})` }}>
        <div className="prj-detail-hero-scrim" />
        <div className="ceg-container nws-detail-hero-inner">
          <span className="nws-cat-badge" style={{ background: cc.bg, color: cc.text }}>{article.category}</span>
          <h1 className="nws-detail-h1">{article.title}</h1>
          <div className="nws-detail-byline">
            <span>{article.author}</span>
            <span className="prj-detail-dot">·</span>
            <span>{article.date}</span>
            <span className="prj-detail-dot">·</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="nws-detail-content">
        <div className="ceg-container">
          <article className="nws-detail-article">
            <p className="nws-detail-lede">{article.excerpt}</p>
            {article.body.map((para, i) => (
              <p key={i} className="nws-detail-body">{para}</p>
            ))}
            <div className="nws-detail-tags">
              {article.tags.map(t => <span key={t} className="nws-tag">{t}</span>)}
            </div>
            <div className="nws-detail-back">
              <a href="/insights/news" className="div-view-all">← Back to News</a>
            </div>
          </article>
        </div>
      </section>

      {/* Related articles row */}
      <RelatedArticles current={article} all={all} />
    </>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
function NewsDetailApp() {
  const data = window.CEG_DATA;
  const theme = window.CEG_THEMES.drydock;
  const [mobileOpen, setMobileOpen] = useND(false);

  const slug = window.__CEG_NEWS_SLUG || "";
  const article = window.CEG_NEWS.find(a => a.slug === slug);

  useNDE(() => {
    document.body.dataset.concept = "drydock";
    document.body.dataset.page = "news-detail";
    if (article) document.title = `${article.title} | Coastal Engineering Group`;
  }, []);

  return (
    <div className="ceg-app concept-drydock page-news-detail" style={window.applyThemeVars(theme)}>
      <window.UtilityBar theme={theme} data={data} />
      <window.Nav theme={theme} data={data} conceptKey="drydock" onMobileOpen={() => setMobileOpen(true)} />
      <main>
        {article
          ? <ArticleDetail article={article} all={window.CEG_NEWS} />
          : <ArticleNotFound slug={slug} />
        }
        <window.ContactBand theme={theme} data={data} />
      </main>
      <window.Footer theme={theme} data={data} />
      <window.MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} data={data} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<NewsDetailApp />);
