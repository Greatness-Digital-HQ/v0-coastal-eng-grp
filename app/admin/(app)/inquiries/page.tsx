import type { Metadata } from "next"
import Link from "next/link"
import { and, desc, eq, ilike, isNull, ne, or, type SQL } from "drizzle-orm"
import { Download, Search } from "lucide-react"
import { db, schema } from "@/db"
import { INQUIRY_STATUSES } from "@/db/schema"
import { requireUser } from "@/lib/auth"
import { INQUIRY_TYPES } from "@/lib/inquiries"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AutoSelect } from "../auto-select"
import { controlCls } from "../control"
import { Empty, formatDate, PageHeader, timeAgo } from "../ui"
import { InquiryStatus, STATUS_LABELS } from "./status"

export const metadata: Metadata = { title: "Inquiries" }

type Search = { status?: string; type?: string; q?: string; who?: string }

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const me = await requireUser()
  const { status = "", type = "", q = "", who = "" } = await searchParams

  const where: SQL[] = []
  if ((INQUIRY_STATUSES as readonly string[]).includes(status)) where.push(eq(schema.inquiries.status, status as (typeof INQUIRY_STATUSES)[number]))
  else where.push(ne(schema.inquiries.status, "spam")) // spam only when asked for
  if (type) where.push(type === "short" ? eq(schema.inquiries.source, "contact_band") : eq(schema.inquiries.inquiryType, type))
  if (q.trim()) {
    const like = `%${q.trim()}%`
    where.push(or(ilike(schema.inquiries.name, like), ilike(schema.inquiries.org, like), ilike(schema.inquiries.email, like), ilike(schema.inquiries.ref, like), ilike(schema.inquiries.description, like))!)
  }
  if (who === "me") where.push(eq(schema.inquiries.assignedTo, me.id))
  if (who === "none") where.push(isNull(schema.inquiries.assignedTo))
  const [rows, team] = await Promise.all([
    db().select().from(schema.inquiries).where(and(...where)).orderBy(desc(schema.inquiries.createdAt)).limit(300),
    db().select({ id: schema.users.id, name: schema.users.name, email: schema.users.email }).from(schema.users),
  ])
  const nameOf = (uid: string | null) => {
    const u = uid ? team.find((t) => t.id === uid) : undefined
    return u ? (u.id === me.id ? "You" : u.name || u.email.split("@")[0]) : ""
  }

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
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input name="q" type="search" defaultValue={q} placeholder="Search name, company, email or ref" aria-label="Search inquiries" className={cn(controlCls, "h-9 w-full pl-9")} />
        </div>
        <AutoSelect name="status" defaultValue={status} aria-label="Status">
          <option value="">All except spam</option>
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </AutoSelect>
        <AutoSelect name="type" defaultValue={type} aria-label="Inquiry type" className="max-w-64">
          <option value="">All types</option>
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
          <option value="short">Short form (other pages)</option>
        </AutoSelect>
        <AutoSelect name="who" defaultValue={who} aria-label="Assigned to">
          <option value="">Anyone</option>
          <option value="me">Assigned to me</option>
          <option value="none">Not assigned</option>
        </AutoSelect>
        <Button type="submit" size="sm" variant="outline" className="h-9 bg-white">
          Search
        </Button>
        {(status || type || q || who) && (
          <Button asChild size="sm" variant="ghost" className="h-9">
            <Link href="/admin/inquiries">Clear</Link>
          </Button>
        )}
      </form>

      <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">
        {rows.length === 300 ? "Showing the latest 300" : `${rows.length} ${rows.length === 1 ? "inquiry" : "inquiries"}`}
        {status === "" && " · spam is hidden"}
      </p>

      {rows.length === 0 ? (
        <Empty>{status || type || q ? "No inquiries match these filters." : "No inquiries yet. Messages from the website's contact forms land here, and each one is emailed to your team."}</Empty>
      ) : (
        <>
          {/* Phones: one card per inquiry */}
          <ul className="space-y-2 md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/inquiries/${r.id}`} className={cn("block rounded-xl border bg-white px-4 py-3 active:bg-slate-50", r.status === "new" && "border-sky-200")}>
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{r.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{r.org || r.email}</span>
                    </span>
                    <InquiryStatus status={r.status} />
                  </span>
                  {r.assignedTo && <span className="mt-1 block text-xs text-muted-foreground">Assigned: {nameOf(r.assignedTo)}</span>}
                  <span className="mt-2 block text-sm">{r.inquiryType || "Short form"}</span>
                  {r.description && <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{r.description}</span>}
                  <span className="mt-2 block text-xs text-muted-foreground tabular-nums">
                    {timeAgo(r.createdAt)} · #{r.ref}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Tablets and up */}
          <div className="hidden overflow-hidden rounded-xl border bg-white md:block">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">From</th>
                  <th className="px-4 py-3 font-medium">Inquiry</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.id} className={cn("group relative hover:bg-slate-50", r.status === "new" && "bg-sky-50/50")}>
                    <td className="px-4 py-3">
                      {/* The whole row opens the inquiry; the name stays the real link for keyboard and screen readers. */}
                      <Link href={`/admin/inquiries/${r.id}`} className={cn("font-medium text-slate-900 after:absolute after:inset-0 group-hover:text-sky-800", r.status === "new" && "font-semibold")}>
                        {r.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{[r.org, r.email].filter(Boolean).join(" · ")}</p>
                    </td>
                    <td className="max-w-sm px-4 py-3">
                      <p>{r.inquiryType || "Short form"}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <InquiryStatus status={r.status} />
                      {r.assignedTo && <p className="mt-1 text-xs text-muted-foreground">{nameOf(r.assignedTo)}</p>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-muted-foreground tabular-nums">
                      <span title={formatDate(r.createdAt, true)}>{timeAgo(r.createdAt)}</span>
                      <p className="text-xs">#{r.ref}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}
