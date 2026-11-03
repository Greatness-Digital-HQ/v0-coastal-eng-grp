import { and, desc, eq } from "drizzle-orm"
import { db, schema } from "@/db"

// One-step undo for dashboard edits: the row as it was before each save or
// delete. Ten are kept per item.

export async function snapshot(entity: string, entityId: string, row: unknown, actor: string): Promise<void> {
  await db().insert(schema.revisions).values({ entity, entityId, data: row as object, actor })
  const old = await db()
    .select({ id: schema.revisions.id })
    .from(schema.revisions)
    .where(and(eq(schema.revisions.entity, entity), eq(schema.revisions.entityId, entityId)))
    .orderBy(desc(schema.revisions.createdAt))
    .offset(10)
  for (const r of old) await db().delete(schema.revisions).where(eq(schema.revisions.id, r.id))
}

export async function latestRevision(entity: string, entityId: string) {
  const [r] = await db()
    .select()
    .from(schema.revisions)
    .where(and(eq(schema.revisions.entity, entity), eq(schema.revisions.entityId, entityId)))
    .orderBy(desc(schema.revisions.createdAt))
    .limit(1)
  return r ?? null
}

export async function dropRevision(id: string): Promise<void> {
  await db().delete(schema.revisions).where(eq(schema.revisions.id, id))
}
