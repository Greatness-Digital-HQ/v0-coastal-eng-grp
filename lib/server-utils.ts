import { createHash, randomBytes } from "node:crypto"
import { headers } from "next/headers"
import { sql } from "drizzle-orm"
import { db, schema } from "@/db"

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url")
}

export function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex")
}

/** The address this request came in on, for links in emails (preview deployments link to themselves). */
export async function requestOrigin(): Promise<string> {
  if (process.env.SITE_ORIGIN) return process.env.SITE_ORIGIN.replace(/\/$/, "")
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https")
  return `${proto}://${host}`
}

/** A one-way hash of the visitor's IP, so rate limits and spam checks never store the address itself. */
export async function ipHash(): Promise<string> {
  const h = await headers()
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown"
  return sha256(`ceg:${ip}`).slice(0, 32)
}

/**
 * Fixed-window rate limit kept in Postgres. Returns false once `max` hits land
 * inside `windowSeconds`. A database hiccup lets the request through: a limiter
 * must never take the form down.
 */
export async function allow(key: string, max: number, windowSeconds: number): Promise<boolean> {
  try {
    const t = schema.rateLimits
    const rows = await db()
      .insert(t)
      .values({ key, count: 1 })
      .onConflictDoUpdate({
        target: t.key,
        set: {
          count: sql`case when ${t.windowStart} < now() - make_interval(secs => ${windowSeconds}) then 1 else ${t.count} + 1 end`,
          windowStart: sql`case when ${t.windowStart} < now() - make_interval(secs => ${windowSeconds}) then now() else ${t.windowStart} end`,
        },
      })
      .returning({ count: t.count })
    return (rows[0]?.count ?? 0) <= max
  } catch (e) {
    console.error("[rate-limit]", (e as Error).message)
    return true
  }
}

export async function audit(actor: string, action: string, entity: string, entityId: string | null, summary = ""): Promise<void> {
  try {
    await db().insert(schema.auditLog).values({ actor, action, entity, entityId, summary })
  } catch (e) {
    console.error("[audit]", (e as Error).message)
  }
}
