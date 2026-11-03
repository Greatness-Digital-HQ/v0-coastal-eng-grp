import type { Metadata } from "next"
import Link from "next/link"
import { desc } from "drizzle-orm"
import { ExternalLink, Eye, Plus } from "lucide-react"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { DeletedItems } from "../deleted-items"
import { Empty, formatDate, PageHeader, Pill, StatusPill } from "../ui"
import { restoreArticle } from "./actions"

export const metadata: Metadata = { title: "News" }

export default async function NewsPage() {
  await requireUser()
  const rows = await db().select().from(schema.newsArticles).orderBy(desc(schema.newsArticles.publishedOn))
  return (
    <>
      <PageHeader
        title="News"
        description="Articles on /insights/news, newest first."
        actions={
          <Button asChild>
            <Link href="/admin/news/new">
              <Plus /> New article
            </Link>
          </Button>
        }
      />
      {rows.length === 0 ? (
        <Empty>No articles yet.</Empty>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-white">
          {rows.map((a) => (
            <li key={a.id} className="flex items-center gap-4 px-4 py-3">
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {a.image && <img src={a.image} alt="" className="size-full object-cover" loading="lazy" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/news/${a.id}`} className="font-medium hover:text-sky-800 hover:underline">
                  {a.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(a.publishedOn)} · {a.category}
                  {a.author && ` · ${a.author}`}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5 sm:hidden">
                  <StatusPill status={a.status} />
                  {a.needsReview && <Pill tone="amber">Needs review</Pill>}
                </div>
              </div>
              <div className="hidden shrink-0 gap-1.5 sm:flex">
                {a.needsReview && <Pill tone="amber">Needs review</Pill>}
                <StatusPill status={a.status} />
              </div>
              <a
                href={a.status === "published" ? `/insights/news/${a.slug}` : `/admin/preview/news/${a.slug}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`${a.status === "published" ? "View" : "Preview"} ${a.title} (opens in a new tab)`}
                title={a.status === "published" ? "View on the website" : "Preview the draft"}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-500 ring-1 ring-slate-200 ring-inset hover:bg-slate-50 hover:text-slate-900"
              >
                {a.status === "published" ? <ExternalLink className="size-4" /> : <Eye className="size-4" />}
              </a>
            </li>
          ))}
        </ul>
      )}
      <DeletedItems entity="news" table={schema.newsArticles} restore={restoreArticle} titleKey="title" />
    </>
  )
}
