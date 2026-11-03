"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db, schema } from "@/db"
import { requireUser, setPasswordFor, startSession } from "@/lib/auth"
import { passwordProblem, verifyPassword } from "@/lib/password"
import { allow, audit } from "@/lib/server-utils"

export type AccountState = { ok?: boolean; error?: string }

export async function changePassword(_prev: AccountState, form: FormData): Promise<AccountState> {
  const me = await requireUser()
  const current = String(form.get("current") ?? "")
  const next = String(form.get("password") ?? "")
  if (next !== String(form.get("confirm") ?? "")) return { error: "The two new passwords don't match." }
  const problem = passwordProblem(next)
  if (problem) return { error: problem }
  if (me.passwordHash) {
    if (!(await allow(`pw-change:${me.id}`, 5, 900))) return { error: "Too many attempts. Wait 15 minutes." }
    if (!(await verifyPassword(current, me.passwordHash))) return { error: "Your current password is not right." }
  }
  await setPasswordFor(me, next)
  await startSession(me) // setPasswordFor signs out every session, including this one
  await audit(me.email, "update", "user", me.id, me.passwordHash ? "changed their password" : "set a password")
  return { ok: true }
}

export async function saveName(form: FormData): Promise<void> {
  const me = await requireUser()
  await db()
    .update(schema.users)
    .set({ name: String(form.get("name") ?? "").trim().slice(0, 120) })
    .where(eq(schema.users.id, me.id))
  revalidatePath("/admin", "layout")
}
