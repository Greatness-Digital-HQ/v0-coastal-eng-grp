import type { Metadata } from "next"
import CegPage from "../CegPage"
import { pageMetadata, breadcrumbJsonLd } from "../seo"

export const metadata: Metadata = pageMetadata("careers")

export default function CareersPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Careers", path: "/careers" },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CegPage app="careers-app" label="Careers page" />
    </>
  )
}
