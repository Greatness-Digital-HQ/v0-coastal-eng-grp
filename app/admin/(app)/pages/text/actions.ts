"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { contentChanged } from "@/lib/content"
import { PageText } from "@/lib/page-text"
import { snapshot } from "@/lib/revisions"
import { audit } from "@/lib/server-utils"

export async function savePageText(raw: PageText): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await requireUser()
  const parsed = PageText.safeParse(raw)
  if (!parsed.success) {
    const i = parsed.error.issues[0]
    return { ok: false, error: `${i.path.join(" › ")}: ${i.message}` }
  }
  const t = parsed.data
  const clean = {
    ...t,
    home: { ...t.home, introParagraphs: t.home.introParagraphs.filter(Boolean) },
    stats: t.stats.filter((x) => x.value || x.label),
    certs: t.certs.filter((x) => x.abbr || x.full),
    clients: t.clients.filter(Boolean),
    careers: { ...t.careers, benefits: t.careers.benefits.filter((b) => b.h || b.v) },
  }
  if (!clean.home.heroLine1 && !clean.home.heroLine2) return { ok: false, error: "The homepage headline can't be empty." }

  const [before] = await db().select().from(schema.settings).where(eq(schema.settings.key, "page_text"))
  if (before) await snapshot("page_text", "page_text", before.value, me.email)
  await db()
    .insert(schema.settings)
    .values({ key: "page_text", value: clean, updatedBy: me.email })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: clean, updatedAt: new Date(), updatedBy: me.email } })
  await audit(me.email, "update", "settings", "page_text", "updated the page text")
  contentChanged()
  revalidatePath("/admin/pages/text")
  return { ok: true }
}
