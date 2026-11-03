"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db, schema } from "@/db"
import {
  devLoginEnabled,
  endSession,
  normalizeEmail,
  passwordLogin,
  redeemLoginToken,
  resetPassword,
  safeNext,
  sendLoginLink,
  sendResetLink,
  startSession,
} from "@/lib/auth"

export type LoginState = { status: "idle" | "sent" | "error"; message?: string; email?: string }

export async function signInWithPassword(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "")
  const result = await passwordLogin(email, String(form.get("password") ?? ""), String(form.get("next") ?? ""))
  if (!result.ok) return { status: "error", message: result.error, email }
  redirect(result.next)
}

export async function requestLink(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "")
  const result = await sendLoginLink(email, String(form.get("next") ?? ""))
  if (!result.ok) return { status: "error", message: result.error, email }
  return { status: "sent", email: normalizeEmail(email) }
}

export async function requestReset(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "")
  const result = await sendResetLink(email)
  if (!result.ok) return { status: "error", message: result.error, email }
  return { status: "sent", email: normalizeEmail(email) }
}

export async function confirmReset(_prev: LoginState, form: FormData): Promise<LoginState> {
  const password = String(form.get("password") ?? "")
  if (password !== String(form.get("confirm") ?? "")) return { status: "error", message: "The two passwords don't match." }
  const result = await resetPassword(String(form.get("token") ?? ""), password)
  if (!result.ok) return { status: "error", message: result.error }
  redirect("/admin")
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
