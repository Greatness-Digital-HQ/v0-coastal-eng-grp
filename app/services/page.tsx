import type { Metadata } from "next"
import CegPage from "../CegPage"
import { pageMetadata, breadcrumbJsonLd } from "../seo"

export const metadata: Metadata = pageMetadata("services")

export default function ServicesOverviewPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Capabilities", path: "/services" },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CegPage app="services-overview-app" label="Capabilities overview page" />
    </>
  )
}
