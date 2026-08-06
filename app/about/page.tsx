import type { Metadata } from "next"
import CegPage from "../CegPage"
import { pageMetadata, breadcrumbJsonLd } from "../seo"

export const metadata: Metadata = pageMetadata("about")

export default function AboutPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CegPage app="about-app" label="About page" />
    </>
  )
}
