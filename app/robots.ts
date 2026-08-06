import type { MetadataRoute } from "next"
import { SITE } from "./seo"

// Section 19-A: robots.txt references the production sitemap and does not block
// CSS, JavaScript, or images. Preview deployments are kept out of the index by
// Vercel's deployment protection rather than by a blanket disallow here.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE}/sitemap.xml`,
  }
}
