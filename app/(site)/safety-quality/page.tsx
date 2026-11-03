import type { Metadata } from "next"
import CegPage from "@/app/CegPage"
import { pageMetadata, breadcrumbJsonLd } from "@/app/seo"

export const metadata: Metadata = pageMetadata("safetyQuality")

export default function SafetyQualityPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Safety & Quality", path: "/safety-quality" },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CegPage app="safety-quality-app" label="Safety &amp; Quality page" />
    </>
  )
}
