"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { contentChanged } from "@/lib/content"
import { snapshot } from "@/lib/revisions"
import { audit } from "@/lib/server-utils"
import { HISTORY, type HistoryEntity } from "./config"


/** Puts any saved version back; the current one is kept in the history first. */
export async function restoreVersion(form: FormData): Promise<void> {
  const me = await requireUser()
  const [rev] = await db().select().from(schema.revisions).where(eq(schema.revisions.id, String(form.get("rev"))))
  if (!rev || !(rev.entity in HISTORY)) return
  const { table, edit } = HISTORY[rev.entity as HistoryEntity]
  const t = table as typeof schema.projects
  const data = rev.data as Record<string, unknown>
  const [current] = await db().select().from(t).where(eq(t.id, rev.entityId))
  if (current) await snapshot(rev.entity, rev.entityId, current, me.email)
  const row = { ...(data as typeof schema.projects.$inferInsert), createdAt: new Date(String(data.createdAt)), updatedAt: new Date(), updatedBy: me.email }
  if (current) await db().update(t).set(row).where(eq(t.id, rev.entityId))
  else await db().insert(t).values(row)
  await audit(me.email, "restore", rev.entity, rev.entityId, String(data.title ?? data.name ?? ""))
  contentChanged()
  revalidatePath(edit)
  redirect(`${edit}/${rev.entityId}`)
}
