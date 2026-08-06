import type { Metadata } from "next"
import CegPage from "./CegPage"
import { pageMetadata, organizationJsonLd, SITE, ORG_NAME } from "./seo"

export const metadata: Metadata = pageMetadata("home")

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      { "@type": "WebSite", url: SITE, name: ORG_NAME },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CegPage app="app" label="Homepage" />
    </>
  )
}
