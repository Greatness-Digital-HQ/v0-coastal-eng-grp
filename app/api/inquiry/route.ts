import { after, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { db, schema } from "@/db"
import { newRef, notifyInquiry } from "@/lib/inquiries"
import { allow, ipHash, requestOrigin } from "@/lib/server-utils"

// Both public forms post here: the 3-step form on /contact (bid-app.jsx) and
// the short ContactBand form (components.jsx). Every submission is saved to
// the dashboard inbox; email goes out after the response.

const str = (max: number) => z.string().trim().max(max).optional().default("")

const Body = z.object({
  source: z.enum(["contact_page", "contact_band"]),
  inquiryType: str(120),
  projectTypes: z.array(z.string().max(40)).max(10).optional().default([]),
  market: str(120),
  state: str(60),
  timeline: str(60),
  description: str(5000),
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  title: str(120),
  org: str(200),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: str(40),
  referral: str(120),
  pageUrl: str(300),
  // Spam signals: the hidden field must stay empty, and people take longer than 3 seconds.
  website: z.string().optional().default(""),
  startedAt: z.number().optional(),
})

export async function POST(request: Request) {
  let body: z.infer<typeof Body>
  try {
    const parsed = Body.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 })
    }
    body = parsed.data
  } catch {
    return NextResponse.json({ ok: false, error: "Please check the form." }, { status: 400 })
  }
  if (body.source === "contact_band" && (!body.org || !body.description)) {
    return NextResponse.json({ ok: false, error: "Please fill in your company and a short scope summary." }, { status: 400 })
  }
  if (body.source === "contact_page" && !body.org) {
    return NextResponse.json({ ok: false, error: "Please enter your organization." }, { status: 400 })
  }

  const ip = await ipHash()
  if (!(await allow(`inquiry:${ip}`, 5, 600)) || !(await allow(`inquiry-day:${ip}`, 20, 86_400))) {
    return NextResponse.json({ ok: false, error: "Too many messages from this connection. Please call us instead." }, { status: 429 })
  }

  const spam = body.website !== "" || (body.startedAt !== undefined && Date.now() - body.startedAt < 3000)
  const { website: _w, startedAt: _s, ...fields } = body
  const userAgent = (await headers()).get("user-agent")?.slice(0, 300) ?? null

  let saved: typeof schema.inquiries.$inferSelect | undefined
  for (let attempt = 0; attempt < 5 && !saved; attempt++) {
    const rows = await db()
      .insert(schema.inquiries)
      .values({ ...fields, ref: newRef(), status: spam ? "spam" : "new", ipHash: ip, userAgent })
      .onConflictDoNothing({ target: schema.inquiries.ref })
      .returning()
    saved = rows[0]
  }
  if (!saved) return NextResponse.json({ ok: false, error: "Please try again." }, { status: 500 })

  if (!spam) {
    const inquiry = saved
    const origin = await requestOrigin()
    after(() => notifyInquiry(inquiry, origin).catch((e) => console.error("[inquiry] notify failed", e)))
  }
  return NextResponse.json({ ok: true, ref: saved.ref })
}
