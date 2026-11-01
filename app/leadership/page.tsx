import type { Metadata } from "next"
import CegPage from "../CegPage"
import { pageMetadata, breadcrumbJsonLd } from "../seo"

export const metadata: Metadata = pageMetadata("leadership")

export default function LeadershipPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Leadership", path: "/leadership" },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CegPage app="leadership-app" label="Leadership page" />
    </>
  )
}
