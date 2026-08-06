import type { Metadata } from "next"
import CegPage from "../../CegPage"
import { pageMetadata, breadcrumbJsonLd } from "../../seo"

export const metadata: Metadata = pageMetadata("projects")

export default function FeaturedWorkPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects/featured-work" },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CegPage app="projects-archive-app" label="Featured Work page" />
    </>
  )
}
