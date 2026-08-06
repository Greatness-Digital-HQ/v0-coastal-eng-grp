import type { Metadata } from "next"
import CegPage from "../../../CegPage"
import { detailMetadata, breadcrumbJsonLd, PAGE_SEO } from "../../../seo"
import { findArticle } from "../../../content-seo"

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const a = findArticle(slug)
  if (!a) return detailMetadata({ title: PAGE_SEO.news.title, description: PAGE_SEO.news.description, path: `/insights/news/${slug}` })
  return detailMetadata({
    title: `${a.title} | Coastal Engineering Group`,
    description: a.description,
    path: `/insights/news/${a.slug}`,
    type: "article",
  })
}

export default async function NewsDetailPage({ params }: Params) {
  const { slug } = await params
  const a = findArticle(slug)
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "News & Insights", path: "/insights/news" },
    { name: a?.title ?? "Article", path: `/insights/news/${slug}` },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CegPage app="news-detail-app" label="Article page" extraData={["news-data"]} useSlug />
    </>
  )
}
