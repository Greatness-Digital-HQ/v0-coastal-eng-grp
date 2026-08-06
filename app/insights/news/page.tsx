import type { Metadata } from "next"
import CegPage from "../../CegPage"
import { pageMetadata, breadcrumbJsonLd } from "../../seo"

export const metadata: Metadata = pageMetadata("news")

export default function NewsArchivePage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "News & Insights", path: "/insights/news" },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CegPage app="news-archive-app" label="News &amp; Insights page" extraData={["news-data"]} />
    </>
  )
}
