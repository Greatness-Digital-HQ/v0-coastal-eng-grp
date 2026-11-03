import { NextResponse } from "next/server"
import { and, asc, eq, lt } from "drizzle-orm"
import { db, schema } from "@/db"
import { recipientsFor } from "@/lib/inquiries"
import { emailHtml, sendMail } from "@/lib/mail"

// Morning reminder (vercel.json crons, 13:00 UTC = 8 or 9 am in New York):
// emails the inquiry recipients a list of inquiries still marked New after a
// day. Sends nothing when there are none. Vercel signs cron requests with
// CRON_SECRET when that variable exists; either way the job runs at most
// once every 20 hours, so a stray request can't flood anyone's inbox.

export const dynamic = "force-dynamic"

const ORIGIN = process.env.SITE_ORIGIN?.replace(/\/$/, "") || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "")

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret ? request.headers.get("authorization") !== `Bearer ${secret}` : !request.headers.get("user-agent")?.startsWith("vercel-cron")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 })
  }

  // Once per 20 hours: claim the slot before doing anything.
  const claimed = await db()
    .insert(schema.settings)
    .values({ key: "digest_sent_at", value: new Date().toISOString() })
    .onConflictDoUpdate({
      target: schema.settings.key,
      set: { value: new Date().toISOString(), updatedAt: new Date() },
      setWhere: lt(schema.settings.updatedAt, new Date(Date.now() - 20 * 3600_000)),
    })
    .returning()
  if (claimed.length === 0) return NextResponse.json({ ok: true, skipped: "already ran" })

  const waiting = await db()
    .select()
    .from(schema.inquiries)
    .where(and(eq(schema.inquiries.status, "new"), lt(schema.inquiries.createdAt, new Date(Date.now() - 24 * 3600_000))))
    .orderBy(asc(schema.inquiries.createdAt))
    .limit(50)
  if (waiting.length === 0) return NextResponse.json({ ok: true, sent: 0 })

  const to = await recipientsFor("")
  const days = (d: Date) => Math.max(1, Math.floor((Date.now() - d.getTime()) / 86_400_000))
  const rows: [string, string][] = waiting.map((q) => [`#${q.ref}`, `${q.name}${q.org ? ` (${q.org})` : ""} · ${q.inquiryType || "Short form"} · waiting ${days(q.createdAt)} day${days(q.createdAt) > 1 ? "s" : ""}`])
  const link = `${ORIGIN}/admin/inquiries?status=new`
  const n = waiting.length
  const result = await sendMail({
    to,
    subject: `${n} website ${n === 1 ? "inquiry is" : "inquiries are"} still waiting for an answer`,
    text: `These inquiries have been marked New for more than a day:\n\n${rows.map(([a, b]) => `${a}  ${b}`).join("\n")}\n\nOpen them: ${link}`,
    html: emailHtml(`${n} ${n === 1 ? "inquiry is" : "inquiries are"} still waiting`, ["These have been marked New for more than a day. Reply, assign or mark each one so it leaves this list."], rows, { href: link, label: "Open the inquiries" }),
  })
  return NextResponse.json({ ok: result.ok, sent: result.ok ? n : 0, error: result.ok ? undefined : result.error })
}
