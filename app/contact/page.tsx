import type { Metadata } from "next"
import CegPage from "../CegPage"
import { pageMetadata, breadcrumbJsonLd } from "../seo"

export const metadata: Metadata = pageMetadata("contact")

export default function ContactPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CegPage app="bid-app" label="Contact page" />
    </>
  )
}
