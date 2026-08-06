import type { Metadata } from "next"
import CegPage from "../../CegPage"
import { pageMetadata, breadcrumbJsonLd } from "../../seo"

export const metadata: Metadata = pageMetadata("federal")

export default function FederalMarketPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Markets", path: "/markets/federal" },
    { name: "Federal", path: "/markets/federal" },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CegPage app="federal-app" label="Federal market page" />
    </>
  )
}
