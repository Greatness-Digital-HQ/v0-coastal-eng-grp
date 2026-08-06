import type { MetadataRoute } from "next"
import { SITE } from "./seo"
import { PROJECT_SEO, NEWS_SEO } from "./content-seo"

// Canonical, indexable URLs only (Section 19-A). /request-a-bid is deliberately
// absent — it 301s to /contact and a redirect target must not be listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/about",
    "/services/construction",
    "/services/engineering",
    "/services/dredging",
    "/services/diving",
    "/services/marine-services",
    "/markets/federal",
    "/projects/featured-work",
    "/safety-quality",
    "/careers",
    "/insights/news",
    "/contact",
  ]

  return [
    ...staticPaths.map((path) => ({ url: `${SITE}${path}` })),
    ...PROJECT_SEO.map((p) => ({ url: `${SITE}/projects/${p.slug}` })),
    ...NEWS_SEO.map((n) => ({ url: `${SITE}/insights/news/${n.slug}` })),
  ]
}
