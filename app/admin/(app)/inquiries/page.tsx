import type { Metadata } from "next"
import Link from "next/link"
import { and, desc, eq, ilike, ne, or, type SQL } from "drizzle-orm"
import { Download } from "lucide-react"
import { db, schema } from "@/db"
import { INQUIRY_STATUSES } from "@/db/schema"
import { requireUser } from "@/lib/auth"
import { INQUIRY_TYPES } from "@/lib/inquiries"
import { Button } from "@/components/ui/button"
import { Empty, formatDate, PageHeader } from "../ui"
import { InquiryStatus, STATUS_LABELS } from "./status"

export const metadata: Metadata = { title: "Inquiries" }

type Search = { status?: string; type?: string; q?: string }

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireUser()
  const { status = "", type = "", q = "" } = await searchParams

  const where: SQL[] = []
  if ((INQUIRY_STATUSES as readonly string[]).includes(status)) where.push(eq(schema.inquiries.status, status as (typeof INQUIRY_STATUSES)[number]))
  else where.push(ne(schema.inquiries.status, "spam")) // spam only when asked for
  if (type) where.push(type === "short" ? eq(schema.inquiries.source, "contact_band") : eq(schema.inquiries.inquiryType, type))
  if (q.trim()) {
    const like = `%${q.trim()}%`
    where.push(or(ilike(schema.inquiries.name, like), ilike(schema.inquiries.org, like), ilike(schema.inquiries.email, like), ilike(schema.inquiries.ref, like), ilike(schema.inquiries.description, like))!)
  }
  const rows = await db().select().from(schema.inquiries).where(and(...where)).orderBy(desc(schema.inquiries.createdAt)).limit(300)

  const exportHref = `/admin/inquiries/export?${new URLSearchParams({ status, type, q }).toString()}`

  return (
    <>
      <PageHeader
        title="Inquiries"
        description="Every message sent from the website's contact forms."
        actions={
          <Button asChild variant="outline" size="sm">
            <a href={exportHref}>
              <Download /> Export CSV
            </a>
          </Button>
        }
      />

      <form className="mb-4 flex flex-wrap gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Search name, company, email, ref…" className="h-9 min-w-56 flex-1 rounded-md border bg-white px-3 text-sm" />
        <select name="status" defaultValue={status} className="h-9 rounded-md border bg-white px-2 text-sm" aria-label="Status">
          <option value="">All except spam</option>
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={type} className="h-9 max-w-64 rounded-md border bg-white px-2 text-sm" aria-label="Inquiry type">
          <option value="">All types</option>
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
          <option value="short">Short form (other pages)</option>
        </select>
        <Button type="submit" size="sm" className="h-9">
          Filter
        </Button>
      </form>

      {rows.length === 0 ? (
        <Empty>{status || type || q ? "No inquiries match these filters." : "No inquiries yet. Submissions from the website's contact forms land here."}</Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Inquiry</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className={r.status === "new" ? "bg-sky-50/40" : undefined}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/inquiries/${r.id}`} className="font-medium text-slate-900 hover:text-sky-800 hover:underline">
                      {r.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{[r.org, r.email].filter(Boolean).join(" · ")}</p>
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    <p>{r.inquiryType || "Short form"}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <InquiryStatus status={r.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(r.createdAt, true)}
                    <p className="text-xs">#{r.ref}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
