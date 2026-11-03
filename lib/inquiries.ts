import { randomInt } from "node:crypto"
import { and, eq, isNull } from "drizzle-orm"
import { db, schema } from "@/db"
import type { Inquiry } from "@/db/schema"
import { emailHtml, sendMail } from "./mail"

// The 7 "What can we help with?" answers on the Contact page (bid-app.jsx).
// The Site info page routes each one to its own people.
export const INQUIRY_TYPES = [
  "Project opportunity",
  "Prime contractor / teaming inquiry",
  "Engineering or inspection need",
  "Emergency marine or underwater response",
  "Vendor / subcontractor inquiry",
  "Employment",
  "Media / general question",
] as const

// The capability cards on step 1 of the Contact page form (bid-app.jsx PROJECT_TYPES).
const PROJECT_TYPE_LABELS: Record<string, string> = {
  diving: "Commercial Diving",
  engineering: "Marine Engineering",
  construction: "Marine Construction",
  dredging: "Dredging",
  "marine-services": "Marine Services",
  federal: "Federal Contract",
}

export type Routing = { default: string[]; byType: Record<string, string[]> }

export async function getRouting(): Promise<Routing> {
  const [row] = await db().select().from(schema.settings).where(eq(schema.settings.key, "routing"))
  const v = (row?.value ?? {}) as Partial<Routing>
  return { default: v.default ?? [], byType: v.byType ?? {} }
}

/** Who gets emailed: the type's own list, else the default list, else the dashboard owners. */
export async function recipientsFor(inquiryType: string): Promise<string[]> {
  const routing = await getRouting()
  const own = routing.byType[inquiryType] ?? []
  if (own.length) return own
  if (routing.default.length) return routing.default
  const owners = await db()
    .select({ email: schema.users.email })
    .from(schema.users)
    .where(and(eq(schema.users.role, "owner"), isNull(schema.users.disabledAt)))
  return owners.map((o) => o.email)
}

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O or 1/I
export function newRef(): string {
  return Array.from({ length: 6 }, () => REF_CHARS[randomInt(REF_CHARS.length)]).join("")
}

export function inquiryRows(q: Inquiry): [string, string][] {
  const rows: [string, string][] = [
    ["Inquiry", q.inquiryType || "General (short form)"],
    ["Name", q.name],
    ["Title", q.title],
    ["Organization", q.org],
    ["Email", q.email],
    ["Phone", q.phone],
    ["Services", q.projectTypes.map((k) => PROJECT_TYPE_LABELS[k] ?? k).join(", ")],
    ["Market", q.market],
    ["State", q.state],
    ["Timeline", q.timeline],
    ["Found us via", q.referral],
    ["Details", q.description],
    ["Sent from", q.pageUrl],
  ]
  return rows.filter(([, v]) => v)
}

/** Emails the routed team and the visitor, then records the outcome on the inquiry. */
export async function notifyInquiry(q: Inquiry, origin: string): Promise<void> {
  const to = await recipientsFor(q.inquiryType)
  const who = q.org ? `${q.name} (${q.org})` : q.name
  const link = `${origin}/admin/inquiries/${q.id}`
  const rows = inquiryRows(q)
  const team = await sendMail({
    to,
    replyTo: q.email,
    subject: `New website inquiry #${q.ref}: ${q.inquiryType || "General"} from ${who}`,
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nOpen in the dashboard: ${link}\nReply to this email to answer ${q.name} directly.`,
    html: emailHtml(`New inquiry #${q.ref}`, [`From ${who}. Reply to this email to answer them directly.`], rows, { href: link, label: "Open in the dashboard" }),
  })

  const first = q.name.split(" ")[0]
  await sendMail({
    to: [q.email],
    subject: `We received your inquiry (#${q.ref})`,
    text: `Hi ${first},\n\nThank you for contacting Coastal Engineering Group. Your inquiry #${q.ref} has been routed to the right member of our team, who will follow up at this address.\n\nCoastal Engineering Group`,
    html: emailHtml("Thank you, we received your inquiry", [
      `Hi ${first}, thank you for contacting Coastal Engineering Group.`,
      `Your inquiry #${q.ref} has been routed to the right member of our team, who will follow up at this email address.`,
    ]),
  })

  await db()
    .update(schema.inquiries)
    .set({ notifiedTo: team.ok ? to : [], emailError: team.ok ? null : team.error })
    .where(eq(schema.inquiries.id, q.id))
}
