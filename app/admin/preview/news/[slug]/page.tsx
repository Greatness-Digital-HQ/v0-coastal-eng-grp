import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { getSiteContent, toSiteArticle } from "@/lib/content"
import { PreviewPage } from "../../preview-page"

export const metadata: Metadata = { title: "Preview" }
export const dynamic = "force-dynamic"

export default async function ArticlePreview({ params }: { params: Promise<{ slug: string }> }) {
  await requireUser()
  const { slug } = await params
  const [a] = await db().select().from(schema.newsArticles).where(eq(schema.newsArticles.slug, slug))
  if (!a) notFound()
  const content = await getSiteContent()
  const draft = toSiteArticle(a)
  const news = content?.news ?? []
  const merged = news.some((x) => x.slug === slug) ? news.map((x) => (x.slug === slug ? draft : x)) : [draft, ...news]
  return (
    <PreviewPage
      content={content ? { ...content, news: merged } : { projects: [], news: [draft], openRoles: [], leaders: [], contact: null, text: null }}
      app="news-detail-app"
      extraData={["news-data"]}
      editHref={`/admin/news/${a.id}`}
      status={a.status}
    />
  )
}
