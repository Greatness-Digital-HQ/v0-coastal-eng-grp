"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db, schema } from "@/db"
import { INQUIRY_STATUSES } from "@/db/schema"
import { requireUser } from "@/lib/auth"
import { audit } from "@/lib/server-utils"

const LABELS: Record<string, string> = { new: "New", in_progress: "In progress", closed: "Closed", spam: "Spam" }

export async function setInquiryStatus(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const status = String(form.get("status")) as (typeof INQUIRY_STATUSES)[number]
  if (!INQUIRY_STATUSES.includes(status)) return
  const [q] = await db().update(schema.inquiries).set({ status, updatedAt: new Date() }).where(eq(schema.inquiries.id, id)).returning()
  if (q) await audit(me.email, "status", "inquiry", q.id, `#${q.ref} → ${LABELS[status]}`)
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
