import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { and, desc, eq } from "drizzle-orm"
import { ArrowLeft } from "lucide-react"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { ConfirmAction } from "../../../confirm"
import { formatDate, PageHeader, Pill, timeAgo } from "../../../ui"
import { restoreVersion } from "../../actions"
import { HISTORY, type HistoryEntity } from "../../config"

export const metadata: Metadata = { title: "Version history" }

// Plain names for the fields people edit, for "what changed" lines.
const LABELS: Record<string, string> = {
  title: "title",
  name: "name",
  slug: "web address",
  client: "client",
  market: "market",
  services: "services",
  state: "state",
  year: "year",
  blurb: "summary",
  excerpt: "summary",
  image: "photo",
  imageAlt: "photo description",
  gallery: "gallery",
  seoTitle: "search title",
  seoDescription: "search description",
  scope: "scope",
  scopeStats: "key numbers",
  challenge: "challenge",
  approach: "approach",
  outcome: "outcome",
  status: "status",
  needsReview: "needs review",
  publishedOn: "date",
  category: "category",
  author: "author",
  body: "article text",
  tags: "tags",
  bio: "bio",
  responsibility: "responsibility",
  sortOrder: "order",
}

function changed(a: Record<string, unknown>, b: Record<string, unknown>): string[] {
  return Object.keys(LABELS).filter((k) => k in a && JSON.stringify(a[k]) !== JSON.stringify(b[k]))
}

export default async function HistoryPage({ params }: { params: Promise<{ entity: string; id: string }> }) {
  await requireUser()
  const { entity, id } = await params
  if (!(entity in HISTORY) || !/^[0-9a-f-]{36}$/.test(id)) notFound()
  const { table, edit, noun } = HISTORY[entity as HistoryEntity]
  const t = table as typeof schema.projects
  const [current] = await db().select().from(t).where(eq(t.id, id))
  const revs = await db()
    .select()
    .from(schema.revisions)
    .where(and(eq(schema.revisions.entity, entity), eq(schema.revisions.entityId, id)))
    .orderBy(desc(schema.revisions.createdAt))
  if (!current && revs.length === 0) notFound()
  const cur = (current ?? {}) as unknown as Record<string, unknown>
  const title = String(cur.title ?? cur.name ?? (revs[0]?.data as Record<string, unknown>)?.title ?? "Untitled")

  return (
    <>
      <Link href={current ? `${edit}/${id}` : edit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {current ? `Back to the ${noun}` : "Back"}
      </Link>
      <PageHeader title="Version history" description={`${title}. Up to 10 earlier versions are kept (${revs.length} so far). Restoring one keeps the current version here too.`} />
      <ol className="divide-y overflow-hidden rounded-xl border bg-white">
        {current && (
          <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <span>
              <span className="font-medium">Current version</span> <Pill tone="green">Now</Pill>
              <span className="block text-xs text-muted-foreground">
                Saved {formatDate(current.updatedAt, true)}
                {current.updatedBy && current.updatedBy !== "import" ? ` by ${current.updatedBy}` : ""}
              </span>
            </span>
          </li>
        )}
        {revs.map((r, i) => {
          const data = r.data as Record<string, unknown>
          const newer = i === 0 ? cur : (revs[i - 1].data as Record<string, unknown>)
          const diff = changed(data, newer)
          return (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <span className="min-w-0">
                <span className="font-medium">{formatDate(new Date(String(data.updatedAt ?? r.createdAt)), true)}</span>
                <span className="block text-xs text-muted-foreground">
                  Replaced {timeAgo(r.createdAt)} by {r.actor ?? "someone"}
                  {diff.length > 0 && ` · then changed: ${diff.map((k) => LABELS[k]).join(", ")}`}
                </span>
              </span>
              <ConfirmAction
                variant="button"
                action={restoreVersion}
                fields={{ rev: r.id }}
                title="Restore this version?"
                description={`The ${noun} goes back to how it was on ${formatDate(new Date(String(data.updatedAt ?? r.createdAt)), true)}${data.status === "published" ? " and is published" : ""}. The current version stays in this history.`}
                confirmLabel="Restore"
                className="text-slate-800 hover:text-slate-900"
              >
                Restore
              </ConfirmAction>
            </li>
          )
        })}
      </ol>
      {revs.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No earlier versions yet. Each save keeps the version it replaces here.</p>}
    </>
  )
}
