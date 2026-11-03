import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { ArrowLeft, Eye } from "lucide-react"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { latestRevision } from "@/lib/revisions"
import { NEWS_CATEGORIES } from "@/lib/taxonomy"
import { ConfirmAction } from "../../confirm"
import { formatDate, PageHeader } from "../../ui"
import { deleteArticle, restoreArticle, type ArticleInput } from "../actions"
import { ArticleEditor } from "../editor"
import { ViewLink } from "../../view-link"

export const metadata: Metadata = { title: "Edit article" }

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const [a] = await db().select().from(schema.newsArticles).where(eq(schema.newsArticles.id, id))
  if (!a) notFound()
  const rev = await latestRevision("news", id)
  const category = (NEWS_CATEGORIES as readonly string[]).includes(a.category) ? (a.category as ArticleInput["category"]) : "News"

  return (
    <>
      <Link href="/admin/news" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All articles
      </Link>
      <PageHeader
        title={a.title}
        description={`Last saved ${formatDate(a.updatedAt, true)}${a.updatedBy && a.updatedBy !== "import" ? ` by ${a.updatedBy}` : ""}`}
        actions={
          a.status === "published" ? (
            <ViewLink href={`/insights/news/${a.slug}`} label="View on site" />
          ) : (
            <ViewLink href={`/admin/preview/news/${a.slug}`} label="Preview draft">
              <Eye />
            </ViewLink>
          )
        }
      />
      <ArticleEditor
        key={a.updatedAt.toISOString()}
        id={a.id}
        initial={{
          title: a.title,
          slug: a.slug,
          publishedOn: a.publishedOn,
          category,
          author: a.author,
          excerpt: a.excerpt,
          image: a.image,
          imageAlt: a.imageAlt,
          seoTitle: a.seoTitle,
          seoDescription: a.seoDescription,
          body: a.body,
          tags: a.tags,
          status: a.status,
          needsReview: a.needsReview,
        }}
      />
      <div className="mt-8 flex flex-wrap items-center gap-6 border-t pt-6 text-sm">
        <Link href={`/admin/history/news/${a.id}`} className="text-sky-700 hover:underline">
          Version history
        </Link>
        {rev && (
          <form action={restoreArticle}>
            <input type="hidden" name="id" value={a.id} />
            <button type="submit" className="text-sky-700 hover:underline">
              Undo the last save ({formatDate(rev.createdAt, true)})
            </button>
          </form>
        )}
        <ConfirmAction
          action={deleteArticle}
          fields={{ id: a.id }}
          title="Delete this article?"
          description={`“${a.title}” will be removed from the website and the dashboard. You can restore it later from “Recently deleted” on the News page.`}
          confirmLabel="Delete article"
        >
          Delete this article
        </ConfirmAction>
      </div>
    </>
  )
}
