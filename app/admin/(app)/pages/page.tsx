import type { Metadata } from "next"
import Link from "next/link"
import { asc, desc } from "drizzle-orm"
import { Eye, PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { PAGE_GROUPS, SECTION_LABELS } from "@/lib/site-pages"
import { formatDate, PageHeader, StatusPill } from "../ui"
import { ViewLink } from "../view-link"

export const metadata: Metadata = { title: "Pages" }

export default async function PagesPage() {
  await requireUser()
  const [projects, articles] = await Promise.all([
    db().select().from(schema.projects).orderBy(asc(schema.projects.sortOrder)),
    db().select().from(schema.newsArticles).orderBy(desc(schema.newsArticles.publishedOn)),
  ])

  return (
    <>
      <PageHeader
        actions={
          <Button asChild>
            <Link href="/admin/pages/text">
              <PenLine /> Edit page text
            </Link>
          </Button>
        }
        title="Pages"
        description="Every page on the website and the dashboard sections that change it. The phone, email and addresses in every header and footer come from Site info. Other page text is part of the design; ask your web team to change it."
      />

      <div className="space-y-8">
        {PAGE_GROUPS.map((g) => (
          <section key={g.title} aria-labelledby={`g-${g.title}`}>
            <h2 id={`g-${g.title}`} className="mb-2 text-sm font-semibold text-slate-600">
              {g.title}
            </h2>
            <ul className="divide-y overflow-hidden rounded-xl border bg-white">
              {g.pages.map((p) => (
                <li key={p.path} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.path}
                      {p.note && <span className="hidden md:inline"> · {p.note}</span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.feeds.length === 0 && <span className="rounded-full px-2.5 py-0.5 text-xs text-muted-foreground ring-1 ring-slate-200 ring-inset">Fixed text</span>}
                    {p.feeds.map((f) => (
                      <Link
                        key={f}
                        href={SECTION_LABELS[f].href}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 ring-inset hover:bg-slate-200"
                      >
                        {SECTION_LABELS[f].label}
                      </Link>
                    ))}
                  </div>
                  <ViewLink href={p.path} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <DetailPages
          title={`Project pages (${projects.length})`}
          editBase="/admin/projects"
          items={projects.map((p) => ({ id: p.id, title: p.title, slug: p.slug, status: p.status, path: `/projects/${p.slug}`, preview: `/admin/preview/projects/${p.slug}`, date: p.year }))}
        />
        <DetailPages
          title={`Article pages (${articles.length})`}
          editBase="/admin/news"
          items={articles.map((a) => ({ id: a.id, title: a.title, slug: a.slug, status: a.status, path: `/insights/news/${a.slug}`, preview: `/admin/preview/news/${a.slug}`, date: formatDate(a.publishedOn) }))}
        />
      </div>
    </>
  )
}

type Item = { id: string; title: string; slug: string; status: "draft" | "published"; path: string; preview: string; date: string }

function DetailPages({ title, items, editBase }: { title: string; items: Item[]; editBase: string }) {
  return (
    <section aria-label={title}>
      <h2 className="mb-2 text-sm font-semibold text-slate-600">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-white px-4 py-6 text-center text-sm text-muted-foreground">None yet.</p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-white">
          {items.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap">
              <div className="min-w-0 flex-1">
                <Link href={`${editBase}/${i.id}`} className="font-medium hover:text-sky-800 hover:underline">
                  {i.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {i.path}
                  {i.date && ` · ${i.date}`}
                </p>
              </div>
              <StatusPill status={i.status} />
              {i.status === "published" ? (
                <ViewLink href={i.path} />
              ) : (
                <ViewLink href={i.preview} label="Preview">
                  <Eye />
                </ViewLink>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
