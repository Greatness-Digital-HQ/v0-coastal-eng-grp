"use server"

import { revalidatePath } from "next/cache"
import { and, isNull } from "drizzle-orm"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db, schema } from "@/db"
import { INQUIRY_STATUSES } from "@/db/schema"
import { requireUser } from "@/lib/auth"
import { emailHtml, mailTransport, sendMail } from "@/lib/mail"
import { audit, requestOrigin } from "@/lib/server-utils"

const LABELS: Record<string, string> = { new: "New", in_progress: "In progress", closed: "Closed", spam: "Spam" }

export async function setInquiryStatus(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const status = String(form.get("status")) as (typeof INQUIRY_STATUSES)[number]
  if (!INQUIRY_STATUSES.includes(status)) return
  const [q] = await db().update(schema.inquiries).set({ status, updatedAt: new Date() }).where(eq(schema.inquiries.id, id)).returning()
  if (q) await audit(me.email, "status", "inquiry", q.id, `#${q.ref} as ${LABELS[status].toLowerCase()}`)
  revalidatePath("/admin/inquiries")
  revalidatePath(`/admin/inquiries/${id}`)
}

export async function saveInquiryNotes(form: FormData): Promise<void> {
  await requireUser()
  const id = String(form.get("id"))
  await db()
    .update(schema.inquiries)
    .set({ notes: String(form.get("notes") ?? "").slice(0, 10_000), updatedAt: new Date() })
    .where(eq(schema.inquiries.id, id))
  revalidatePath(`/admin/inquiries/${id}`)
}

export async function deleteInquiry(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const [q] = await db().delete(schema.inquiries).where(eq(schema.inquiries.id, id)).returning()
  if (q) await audit(me.email, "delete", "inquiry", q.id, `#${q.ref} from ${q.name}`)
  revalidatePath("/admin/inquiries")
  redirect("/admin/inquiries")
}

export type ReplyState = { ok?: boolean; error?: string }

/** Emails a reply to the person who sent the inquiry and keeps it on the inquiry. */
export async function sendReply(_prev: ReplyState, form: FormData): Promise<ReplyState> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const body = String(form.get("body") ?? "").trim()
  if (!body) return { error: "Write a reply first." }
  if (body.length > 10_000) return { error: "That reply is too long." }
  const [q] = await db().select().from(schema.inquiries).where(eq(schema.inquiries.id, id))
  if (!q) return { error: "This inquiry no longer exists." }
  if (mailTransport() === "off") return { error: "Email isn't set up yet, so replies can't be sent. Use Reply by email for now." }

  const signature = me.name ? `${me.name}\nCoastal Engineering Group` : "Coastal Engineering Group"
  const quoted = q.description ? `\n\n----\nYour inquiry #${q.ref}:\n${q.description}` : ""
  const sent = await sendMail({
    to: [q.email],
    replyTo: me.email,
    subject: `Re: your inquiry to Coastal Engineering Group (#${q.ref})`,
    text: `${body}\n\n${signature}${quoted}`,
    html: emailHtml(`Re: your inquiry #${q.ref}`, [...body.split(/\n\s*\n/), signature]),
  })
  await db()
    .insert(schema.inquiryMessages)
    .values({ inquiryId: q.id, body, author: me.email, sentTo: q.email, emailError: sent.ok ? null : sent.error })
  if (sent.ok && q.status === "new") await db().update(schema.inquiries).set({ status: "in_progress", updatedAt: new Date() }).where(eq(schema.inquiries.id, q.id))
  await audit(me.email, "update", "inquiry", q.id, `#${q.ref}: replied to ${q.name}`)
  revalidatePath(`/admin/inquiries/${id}`)
  revalidatePath("/admin/inquiries")
  if (!sent.ok) return { error: `The reply was saved but could not be sent: ${sent.error}` }
  return { ok: true }
}

/** Hands the inquiry to a team member (or nobody) and lets them know by email. */
export async function assignInquiry(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const userId = String(form.get("userId") ?? "")
  let assignee: typeof schema.users.$inferSelect | undefined
  if (userId) {
    ;[assignee] = await db().select().from(schema.users).where(and(eq(schema.users.id, userId), isNull(schema.users.disabledAt)))
    if (!assignee) return
  }
  const [q] = await db()
    .update(schema.inquiries)
    .set({ assignedTo: assignee?.id ?? null, updatedAt: new Date() })
    .where(eq(schema.inquiries.id, id))
    .returning()
  if (!q) return
  await audit(me.email, "update", "inquiry", q.id, assignee ? `#${q.ref} assigned to ${assignee.name || assignee.email}` : `#${q.ref} unassigned`)
  if (assignee && assignee.id !== me.id) {
    const link = `${await requestOrigin()}/admin/inquiries/${q.id}`
    await sendMail({
      to: [assignee.email],
      subject: `Inquiry #${q.ref} from ${q.name} is assigned to you`,
      text: `${me.name || me.email} assigned you inquiry #${q.ref} from ${q.name}${q.org ? ` (${q.org})` : ""}.\n\n${link}`,
      html: emailHtml(`Inquiry #${q.ref} is assigned to you`, [`${me.name || me.email} assigned you the inquiry from ${q.name}${q.org ? ` (${q.org})` : ""}.`], [], { href: link, label: "Open the inquiry" }),
    })
  }
  revalidatePath(`/admin/inquiries/${id}`)
  revalidatePath("/admin/inquiries")
}
