"use server"

import { revalidatePath } from "next/cache"
import { and, count, eq, isNull, ne } from "drizzle-orm"
import { db, schema } from "@/db"
import { normalizeEmail, requireOwner, sendLoginLink } from "@/lib/auth"
import { audit } from "@/lib/server-utils"

export type UserFormState = { ok?: boolean; error?: string; message?: string }

export async function inviteUser(_prev: UserFormState, form: FormData): Promise<UserFormState> {
  const me = await requireOwner()
  const email = normalizeEmail(String(form.get("email") ?? ""))
  const name = String(form.get("name") ?? "").trim().slice(0, 120)
  const role = form.get("role") === "owner" ? "owner" : "editor"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." }

  const [existing] = await db().select().from(schema.users).where(eq(schema.users.email, email))
  if (existing && !existing.disabledAt) return { error: `${email} already has access.` }
  if (existing) {
    await db().update(schema.users).set({ disabledAt: null, role, name: name || existing.name }).where(eq(schema.users.id, existing.id))
  } else {
    await db().insert(schema.users).values({ email, name, role })
  }
  await audit(me.email, "invite", "user", email, email)

  const sent = form.get("send") === "on" ? await sendLoginLink(email) : null
  revalidatePath("/admin/users")
  if (sent && !sent.ok) return { ok: true, message: `Added ${email}, but the email could not be sent. They can request a link at /admin/login.` }
  return { ok: true, message: sent ? `Added ${email} and emailed them a sign-in link.` : `Added ${email}. They can sign in at /admin/login.` }
}

async function activeOwners(exceptId: string): Promise<number> {
  const [r] = await db()
    .select({ n: count() })
    .from(schema.users)
    .where(and(eq(schema.users.role, "owner"), isNull(schema.users.disabledAt), ne(schema.users.id, exceptId)))
  return r.n
}

export async function setRole(form: FormData): Promise<void> {
  const me = await requireOwner()
  const id = String(form.get("id"))
  const role = form.get("role") === "owner" ? "owner" : "editor"
  if (role === "editor" && (await activeOwners(id)) === 0) return
  const [u] = await db().update(schema.users).set({ role }).where(eq(schema.users.id, id)).returning()
  if (u) await audit(me.email, "update", "user", u.email, `${u.email} is now ${role}`)
  revalidatePath("/admin/users")
}

export async function setDisabled(form: FormData): Promise<void> {
  const me = await requireOwner()
  const id = String(form.get("id"))
  const disable = form.get("disable") === "1"
  if (disable && (id === me.id || (await activeOwners(id)) === 0)) return
  const [u] = await db()
    .update(schema.users)
    .set({ disabledAt: disable ? new Date() : null })
    .where(eq(schema.users.id, id))
    .returning()
  if (u) {
    if (disable) await db().delete(schema.sessions).where(eq(schema.sessions.userId, u.id))
    await audit(me.email, "update", "user", u.email, `${u.email} ${disable ? "removed" : "restored"}`)
  }
  revalidatePath("/admin/users")
}
