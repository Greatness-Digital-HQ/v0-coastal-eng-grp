import { and, desc, eq, ilike, ne, or, type SQL } from "drizzle-orm"
import { db, schema } from "@/db"
import { INQUIRY_STATUSES } from "@/db/schema"
import { currentUser } from "@/lib/auth"

// CSV of the inquiries list, with the same filters as the page.
export async function GET(request: Request) {
  if (!(await currentUser())) return new Response("Sign in first", { status: 401 })
  const p = new URL(request.url).searchParams
  const status = p.get("status") ?? ""
  const type = p.get("type") ?? ""
  const q = (p.get("q") ?? "").trim()

  const where: SQL[] = []
  if ((INQUIRY_STATUSES as readonly string[]).includes(status)) where.push(eq(schema.inquiries.status, status as (typeof INQUIRY_STATUSES)[number]))
  else where.push(ne(schema.inquiries.status, "spam"))
  if (type) where.push(type === "short" ? eq(schema.inquiries.source, "contact_band") : eq(schema.inquiries.inquiryType, type))
  if (q) {
    const like = `%${q}%`
    where.push(or(ilike(schema.inquiries.name, like), ilike(schema.inquiries.org, like), ilike(schema.inquiries.email, like), ilike(schema.inquiries.ref, like))!)
  }
  const rows = await db().select().from(schema.inquiries).where(and(...where)).orderBy(desc(schema.inquiries.createdAt))

  const cols = ["ref", "received", "status", "inquiry type", "name", "title", "organization", "email", "phone", "services", "market", "state", "timeline", "found us via", "details", "notes"]
  const lines = rows.map((r) =>
    [r.ref, r.createdAt.toISOString(), r.status, r.inquiryType, r.name, r.title, r.org, r.email, r.phone, r.projectTypes.join("; "), r.market, r.state, r.timeline, r.referral, r.description, r.notes].map(csv).join(","),
  )
  const body = "﻿" + [cols.join(","), ...lines].join("\r\n")
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="coastal-inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}

function csv(v: string): string {
  // A leading = + - @ would run as a formula in Excel.
  const safe = /^[=+\-@]/.test(v) ? `'${v}` : v
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}
