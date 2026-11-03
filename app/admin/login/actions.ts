"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db, schema } from "@/db"
import { devLoginEnabled, endSession, normalizeEmail, redeemLoginToken, safeNext, sendLoginLink, startSession } from "@/lib/auth"

export type LoginState = { status: "idle" | "sent" | "error"; message?: string; email?: string }

export async function requestLink(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "")
  const result = await sendLoginLink(email, String(form.get("next") ?? ""))
  if (!result.ok) return { status: "error", message: result.error, email }
  return { status: "sent", email: normalizeEmail(email) }
}

export async function confirmLink(form: FormData): Promise<void> {
  const next = await redeemLoginToken(String(form.get("token") ?? ""))
  redirect(next ?? "/admin/login?error=expired")
}

/** Development only: sign in as any existing user without an email. */
export async function devLogin(form: FormData): Promise<void> {
  if (!devLoginEnabled()) redirect("/admin/login")
  const [user] = await db().select().from(schema.users).where(eq(schema.users.email, normalizeEmail(String(form.get("email") ?? ""))))
  if (!user || user.disabledAt) redirect("/admin/login?error=unknown")
  await startSession(user)
  redirect(safeNext(form.get("next")))
}

export async function signOut(): Promise<void> {
  await endSession()
  redirect("/admin/login")
}
