import { and, eq, gt, isNull, lt } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db, schema } from "@/db"
import type { User } from "@/db/schema"
import { emailHtml, sendMail } from "./mail"
import { allow, audit, ipHash, randomToken, requestOrigin, sha256 } from "./server-utils"

// Dashboard sign-in: an emailed one-time link, no passwords. Only addresses in
// `users` (not disabled) get a link. The link opens a page with a "Sign in"
// button rather than signing in on the GET itself, because mail scanners
// (Outlook Safe Links and the like) open every link in an email.
//
// The session cookie holds a random token; the database keeps only its hash.

export const SESSION_COOKIE = "ceg_admin"
const LINK_MINUTES = 15
const SESSION_DAYS = 30

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Local-only sign-in without email, for development. Never on Vercel. */
export function devLoginEnabled(): boolean {
  return process.env.AUTH_DEV_LOGIN === "1" && !process.env.VERCEL
}

async function activeUser(email: string): Promise<User | null> {
  const [u] = await db()
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.email, normalizeEmail(email)), isNull(schema.users.disabledAt)))
  return u ?? null
}

/** A safe in-dashboard path to land on after sign-in. */
export function safeNext(next: unknown): string {
  return typeof next === "string" && /^\/admin(\/[\w\-/?=&%.]*)?$/.test(next) ? next : "/admin"
}

export type LinkResult = { ok: true } | { ok: false; error: string }

/**
 * Emails a sign-in link when the address has access. The answer is the same
 * either way, so the form never reveals who has an account.
 */
export async function sendLoginLink(email: string, next?: string): Promise<LinkResult> {
  const addr = normalizeEmail(email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) return { ok: false, error: "Enter a valid email address." }
  const ip = await ipHash()
  if (!(await allow(`login-ip:${ip}`, 10, 3600)) || !(await allow(`login-email:${addr}`, 5, 3600))) {
    return { ok: false, error: "Too many sign-in emails. Try again in an hour." }
  }
  const user = await activeUser(addr)
  if (!user) return { ok: true }

  const token = randomToken()
  await db()
    .insert(schema.loginTokens)
    .values({ tokenHash: sha256(token), email: addr, next: safeNext(next), expiresAt: new Date(Date.now() + LINK_MINUTES * 60_000) })
  const link = `${await requestOrigin()}/admin/login/verify?token=${token}`
  const sent = await sendMail({
    to: [addr],
    subject: "Your sign-in link for the Coastal website dashboard",
    text: `Use this link to sign in to the Coastal Engineering Group website dashboard:\n\n${link}\n\nIt works once and expires in ${LINK_MINUTES} minutes. If you did not ask for it, ignore this email.`,
    html: emailHtml(
      "Sign in to the website dashboard",
      [`This link works once and expires in ${LINK_MINUTES} minutes. If you did not ask for it, you can ignore this email.`],
      [],
      { href: link, label: "Sign in" },
    ),
  })
  if (!sent.ok) {
    console.error("[auth] sign-in email failed:", sent.error)
    return { ok: false, error: "The sign-in email could not be sent. Please contact your website administrator." }
  }
  return { ok: true }
}

/** Looks up an unused, unexpired link without spending it (for the confirm page). */
export async function peekLoginToken(token: string): Promise<{ email: string } | null> {
  if (!token) return null
  const [row] = await db()
    .select({ email: schema.loginTokens.email })
    .from(schema.loginTokens)
    .where(and(eq(schema.loginTokens.tokenHash, sha256(token)), isNull(schema.loginTokens.usedAt), gt(schema.loginTokens.expiresAt, new Date())))
  return row ?? null
}

/** Spends the link and signs the browser in. Returns where to go, or null when the link is no good. */
export async function redeemLoginToken(token: string): Promise<string | null> {
  if (!token) return null
  const [row] = await db()
    .update(schema.loginTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(schema.loginTokens.tokenHash, sha256(token)), isNull(schema.loginTokens.usedAt), gt(schema.loginTokens.expiresAt, new Date())))
    .returning()
  if (!row) return null
  const user = await activeUser(row.email)
  if (!user) return null
  await startSession(user)
  return safeNext(row.next)
}

export async function startSession(user: User): Promise<void> {
  const token = randomToken()
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000)
  await db().insert(schema.sessions).values({ idHash: sha256(token), userId: user.id, expiresAt })
  await db().update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id))
  // Housekeeping: old links and sessions.
  await db().delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()))
  await db().delete(schema.loginTokens).where(lt(schema.loginTokens.expiresAt, new Date(Date.now() - 86_400_000)))
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: (await requestOrigin()).startsWith("https:"),
    path: "/admin",
    expires: expiresAt,
  })
  await audit(user.email, "sign_in", "user", user.id)
}

export async function endSession(): Promise<void> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (token) await db().delete(schema.sessions).where(eq(schema.sessions.idHash, sha256(token)))
  jar.delete({ name: SESSION_COOKIE, path: "/admin" })
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return null
  const [row] = await db()
    .select({ user: schema.users })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.idHash, sha256(token)), gt(schema.sessions.expiresAt, new Date()), isNull(schema.users.disabledAt)))
  return row?.user ?? null
}

export async function requireUser(): Promise<User> {
  const user = await currentUser()
  if (!user) redirect("/admin/login")
  return user
}

export async function requireOwner(): Promise<User> {
  const user = await requireUser()
  if (user.role !== "owner") redirect("/admin")
  return user
}
