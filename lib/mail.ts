import { randomBytes } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

/**
 * Transactional email: Mailgun in production, a local file outbox in
 * development (never on Vercel), or off. Same setup as our review tool.
 *
 *   MAIL_TRANSPORT   mailgun | file | off   (default: mailgun when MAILGUN_* are set, else file locally, off on Vercel)
 *   MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_REGION (us | eu), MAILGUN_TEST_MODE=1
 *   MAIL_FROM        e.g. "Coastal Engineering Group <website@mg.example.com>"
 *   MAIL_FILE_DIR    where the file transport writes (default .mail)
 */
export interface MailMessage {
  to: string[]
  subject: string
  text: string
  html: string
  replyTo?: string
}

export type MailResult = { ok: true; id: string | null } | { ok: false; error: string; skipped?: boolean }

export type Transport = "mailgun" | "file" | "off"

export function mailTransport(): Transport {
  const onVercel = Boolean(process.env.VERCEL)
  const configured = process.env.MAIL_TRANSPORT as Transport | undefined
  if (configured === "file") return onVercel ? "off" : "file"
  if (configured === "mailgun" || configured === "off") return configured
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) return "mailgun"
  return onVercel ? "off" : "file"
}

export async function sendMail(msg: MailMessage): Promise<MailResult> {
  const transport = mailTransport()
  if (msg.to.length === 0) return { ok: false, error: "no recipients", skipped: true }
  if (transport === "off") return { ok: false, error: "email is not set up yet (MAILGUN_* missing)", skipped: true }
  if (transport === "file") return writeToFile(msg)
  return sendWithMailgun(msg)
}

async function sendWithMailgun(msg: MailMessage): Promise<MailResult> {
  const key = process.env.MAILGUN_API_KEY
  const domain = process.env.MAILGUN_DOMAIN
  const from = process.env.MAIL_FROM
  if (!key || !domain || !from) return { ok: false, error: "MAILGUN_API_KEY, MAILGUN_DOMAIN and MAIL_FROM must be set" }
  const base = process.env.MAILGUN_REGION === "eu" ? "https://api.eu.mailgun.net" : "https://api.mailgun.net"
  const form = new URLSearchParams({ from, to: msg.to.join(", "), subject: msg.subject, text: msg.text, html: msg.html })
  if (msg.replyTo) form.set("h:Reply-To", msg.replyTo)
  if (process.env.MAILGUN_TEST_MODE === "1") form.set("o:testmode", "yes")
  try {
    const res = await fetch(`${base}/v3/${encodeURIComponent(domain)}/messages`, {
      method: "POST",
      headers: { authorization: `Basic ${Buffer.from(`api:${key}`).toString("base64")}` },
      body: form,
      signal: AbortSignal.timeout(10_000),
    })
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string }
    if (!res.ok) return { ok: false, error: `Mailgun ${res.status}: ${body.message ?? res.statusText}`.slice(0, 500) }
    return { ok: true, id: body.id ?? null }
  } catch (e) {
    return { ok: false, error: `Mailgun request failed: ${(e as Error).message}`.slice(0, 500) }
  }
}

async function writeToFile(msg: MailMessage): Promise<MailResult> {
  const dir = process.env.MAIL_FILE_DIR || path.join(process.cwd(), ".mail")
  await mkdir(dir, { recursive: true })
  const name = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomBytes(3).toString("hex")}.json`
  await writeFile(path.join(dir, name), JSON.stringify({ from: process.env.MAIL_FROM ?? "(MAIL_FROM unset)", ...msg }, null, 2))
  return { ok: true, id: `file:${name}` }
}

/** Escapes text for the HTML half of an email. */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

/** A plain, Coastal-branded email body. `rows` render as a label/value table. */
export function emailHtml(heading: string, paragraphs: string[], rows: [string, string][] = [], button?: { href: string; label: string }): string {
  const p = paragraphs.map((t) => `<p style="margin:0 0 14px;line-height:1.5">${esc(t)}</p>`).join("")
  const table = rows.length
    ? `<table style="border-collapse:collapse;margin:8px 0 18px;width:100%">${rows
        .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#5b6676;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`)
        .join("")}</table>`
    : ""
  const btn = button
    ? `<p style="margin:22px 0"><a href="${esc(button.href)}" style="background:#0a2540;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600">${esc(button.label)}</a></p>`
    : ""
  return `<div style="font-family:Inter,Arial,sans-serif;font-size:15px;color:#0a2540;max-width:600px">
<p style="font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:12px;color:#5b6676;margin:0 0 18px">Coastal Engineering Group</p>
<h1 style="font-size:20px;margin:0 0 16px">${esc(heading)}</h1>${p}${table}${btn}</div>`
}
