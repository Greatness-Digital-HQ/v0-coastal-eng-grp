import type { Metadata } from "next"
import CegPage from "@/app/CegPage"
import { pageMetadata, breadcrumbJsonLd } from "@/app/seo"

export const metadata: Metadata = pageMetadata("markets")

export default function MarketsPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Markets", path: "/markets" },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CegPage app="markets-overview-app" label="Markets overview page" />
    </>
  )
}
