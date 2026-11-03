import { and, eq, gt, isNull, lt } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { db, schema } from "@/db"
import type { User } from "@/db/schema"
import { emailHtml, sendMail } from "./mail"
import { hashPassword, passwordProblem, verifyPassword } from "./password"
import { allow, audit, ipHash, randomToken, requestOrigin, sha256 } from "./server-utils"

// Dashboard sign-in: email and password, or an emailed one-time link. Only
// addresses in `users` (not disabled) can sign in. Forgotten passwords are
// reset through an emailed link. The link opens a page with a "Sign in"
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
type Purpose = "login" | "reset"

const LINKS = {
  login: {
    minutes: LINK_MINUTES,
    path: "/admin/login/verify",
    subject: "Your sign-in link for the Coastal website dashboard",
    heading: "Sign in to the website dashboard",
    intro: "Use this link to sign in to the Coastal Engineering Group website dashboard:",
    button: "Sign in",
  },
  reset: {
    minutes: 30,
    path: "/admin/login/reset",
    subject: "Reset your Coastal website dashboard password",
    heading: "Reset your password",
    intro: "Use this link to choose a new password for the Coastal Engineering Group website dashboard:",
    button: "Choose a new password",
  },
} as const

/**
 * Emails a sign-in or password-reset link when the address has access. The
 * answer is the same either way, so the form never reveals who has an account.
 */
async function sendLink(email: string, purpose: Purpose, next?: string): Promise<LinkResult> {
  const addr = normalizeEmail(email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) return { ok: false, error: "Enter a valid email address." }
  const ip = await ipHash()
  if (!(await allow(`login-ip:${ip}`, 10, 3600)) || !(await allow(`login-email:${addr}`, 5, 3600))) {
    return { ok: false, error: "Too many emails requested. Try again in an hour." }
  }
  const user = await activeUser(addr)
  if (!user) return { ok: true }

  const l = LINKS[purpose]
  const token = randomToken()
  await db()
    .insert(schema.loginTokens)
    .values({ tokenHash: sha256(token), email: addr, purpose, next: safeNext(next), expiresAt: new Date(Date.now() + l.minutes * 60_000) })
  const link = `${await requestOrigin()}${l.path}?token=${token}`
  const sent = await sendMail({
    to: [addr],
    subject: l.subject,
    text: `${l.intro}\n\n${link}\n\nIt works once and expires in ${l.minutes} minutes. If you did not ask for it, ignore this email.`,
    html: emailHtml(l.heading, [`This link works once and expires in ${l.minutes} minutes. If you did not ask for it, you can ignore this email.`], [], {
      href: link,
      label: l.button,
    }),
  })
  if (!sent.ok) {
    console.error(`[auth] ${purpose} email failed:`, sent.error)
    return { ok: false, error: "The email could not be sent. Please contact your website administrator." }
  }
  return { ok: true }
}

export function sendLoginLink(email: string, next?: string): Promise<LinkResult> {
  return sendLink(email, "login", next)
}

export function sendResetLink(email: string): Promise<LinkResult> {
  return sendLink(email, "reset")
}

function liveToken(token: string, purpose: Purpose) {
  return and(
    eq(schema.loginTokens.tokenHash, sha256(token)),
    eq(schema.loginTokens.purpose, purpose),
    isNull(schema.loginTokens.usedAt),
    gt(schema.loginTokens.expiresAt, new Date()),
  )
}

/** Looks up an unused, unexpired link without spending it (for the confirm pages). */
export async function peekToken(token: string, purpose: Purpose = "login"): Promise<{ email: string } | null> {
  if (!token) return null
  const [row] = await db().select({ email: schema.loginTokens.email }).from(schema.loginTokens).where(liveToken(token, purpose))
  return row ?? null
}
export const peekLoginToken = (token: string) => peekToken(token, "login")

/** Spends the link and signs the browser in. Returns where to go, or null when the link is no good. */
export async function redeemLoginToken(token: string): Promise<string | null> {
  if (!token) return null
  const [row] = await db().update(schema.loginTokens).set({ usedAt: new Date() }).where(liveToken(token, "login")).returning()
  if (!row) return null
  const user = await activeUser(row.email)
  if (!user) return null
  await startSession(user)
  return safeNext(row.next)
}

/** Spends a reset link, sets the new password, signs out everywhere else and signs this browser in. */
export async function resetPassword(token: string, password: string): Promise<LinkResult> {
  const problem = passwordProblem(password)
  if (problem) return { ok: false, error: problem }
  const [row] = await db().update(schema.loginTokens).set({ usedAt: new Date() }).where(liveToken(token, "reset")).returning()
  if (!row) return { ok: false, error: "This reset link has expired or was already used. Request a new one." }
  const user = await activeUser(row.email)
  if (!user) return { ok: false, error: "This account no longer has access." }
  await setPasswordFor(user, password)
  await audit(user.email, "update", "user", user.id, "reset their password")
  await startSession(user)
  return { ok: true }
}

/** Sets a user's password and ends their other sessions. */
export async function setPasswordFor(user: User, password: string): Promise<void> {
  await db().update(schema.users).set({ passwordHash: await hashPassword(password), passwordChangedAt: new Date() }).where(eq(schema.users.id, user.id))
  await db().delete(schema.sessions).where(eq(schema.sessions.userId, user.id))
}

// A real hash of a throwaway password, so an unknown email takes as long to
// reject as a wrong password does.
let dummyHash: Promise<string> | undefined

/** Email and password sign-in. Returns where to go, or the message to show. */
export async function passwordLogin(email: string, password: string, next?: string): Promise<{ ok: true; next: string } | { ok: false; error: string }> {
  const addr = normalizeEmail(email)
  const ip = await ipHash()
  if (!(await allow(`pw-ip:${ip}`, 10, 900)) || !(await allow(`pw-email:${addr}`, 5, 900))) {
    return { ok: false, error: "Too many attempts. Wait 15 minutes, or use Forgot password." }
  }
  const user = addr ? await activeUser(addr) : null
  dummyHash ??= hashPassword(randomToken())
  const good = await verifyPassword(password, user?.passwordHash ?? (await dummyHash))
  if (!user || !user.passwordHash || !good) return { ok: false, error: "That email and password don't match." }
  await startSession(user)
  return { ok: true, next: safeNext(next) }
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
