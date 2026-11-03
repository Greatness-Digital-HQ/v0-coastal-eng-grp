import { asc, desc, eq, gt, lt } from "drizzle-orm"
import { db, schema } from "@/db"

type Ordered = typeof schema.jobOpenings | typeof schema.leaders

/** Swaps a row with its neighbour by sort_order. Returns the row's title or name, or null when it didn't move. */
export async function moveRow(table: Ordered, id: string, up: boolean): Promise<string | null> {
  const [cur] = await db().select().from(table).where(eq(table.id, id))
  if (!cur) return null
  const [other] = await db()
    .select()
    .from(table)
    .where(up ? lt(table.sortOrder, cur.sortOrder) : gt(table.sortOrder, cur.sortOrder))
    .orderBy(up ? desc(table.sortOrder) : asc(table.sortOrder))
    .limit(1)
  if (!other) return null
  await db().update(table).set({ sortOrder: other.sortOrder }).where(eq(table.id, cur.id))
  await db().update(table).set({ sortOrder: cur.sortOrder }).where(eq(table.id, other.id))
  const row = cur as { title?: string; name?: string }
  return row.title ?? row.name ?? ""
}
