"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db, schema } from "@/db"
import { requireOwner, requireUser } from "@/lib/auth"
import { contentChanged } from "@/lib/content"
import { INQUIRY_TYPES, type Routing } from "@/lib/inquiries"
import { audit } from "@/lib/server-utils"

const Contact = z.object({
  phone: z.string().trim().min(1, "Enter the main phone number.").max(40),
  email: z.string().trim().email("Enter a valid public email address.").max(200),
  linkedin: z.union([z.literal(""), z.string().trim().url("The LinkedIn address must start with https://").max(300)]),
  locations: z
    .array(z.object({ name: z.string().trim().max(80), line1: z.string().trim().max(120), line2: z.string().trim().max(120) }))
    .max(4),
})
export type ContactInput = z.infer<typeof Contact>

async function put(key: string, value: unknown, by: string) {
  await db()
    .insert(schema.settings)
    .values({ key, value, updatedBy: by })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value, updatedAt: new Date(), updatedBy: by } })
}

export async function saveContact(raw: ContactInput): Promise<{ ok: boolean; error?: string }> {
  const me = await requireUser()
  const parsed = Contact.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const c = { ...parsed.data, locations: parsed.data.locations.filter((l) => l.name || l.line1) }
  if (c.locations.length === 0) return { ok: false, error: "Keep at least one location." }
  await put("contact", c, me.email)
  await audit(me.email, "update", "settings", "contact", "contact details")
  contentChanged()
  revalidatePath("/admin/settings")
  return { ok: true }
}

const emails = (s: string) => s.split(/[,;\s]+/).map((e) => e.trim().toLowerCase()).filter(Boolean)
const valid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

export async function saveRouting(raw: { default: string; byType: Record<string, string> }): Promise<{ ok: boolean; error?: string }> {
  const me = await requireOwner()
  const routing: Routing = { default: emails(raw.default), byType: {} }
  for (const t of INQUIRY_TYPES) {
    const list = emails(raw.byType[t] ?? "")
    if (list.length) routing.byType[t] = list
  }
  const bad = [...routing.default, ...Object.values(routing.byType).flat()].find((e) => !valid(e))
  if (bad) return { ok: false, error: `“${bad}” is not a valid email address.` }
  await put("routing", routing, me.email)
  await audit(me.email, "update", "settings", "routing", "inquiry routing")
  revalidatePath("/admin/settings")
  return { ok: true }
}
