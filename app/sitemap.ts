import type { MetadataRoute } from "next"
import { SITE } from "./seo"
import { newsSeo, projectSeo } from "./content-seo"

// Canonical, indexable URLs only (Section 19-A). /request-a-bid is deliberately
// absent — it 301s to /contact and a redirect target must not be listed.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, news] = await Promise.all([projectSeo(), newsSeo()])
  const staticPaths = [
    "/",
    "/about",
    "/leadership",
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
    ...projects.map((p) => ({ url: `${SITE}/projects/${p.slug}` })),
    ...news.map((n) => ({ url: `${SITE}/insights/news/${n.slug}` })),
  ]
}
