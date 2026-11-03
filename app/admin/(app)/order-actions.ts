"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { contentChanged } from "@/lib/content"
import { audit } from "@/lib/server-utils"

const TABLES = { project: schema.projects, leader: schema.leaders, job: schema.jobOpenings } as const
const PATHS = { project: "/admin/projects", leader: "/admin/leadership", job: "/admin/careers" } as const
export type Ordered = keyof typeof TABLES

/** Saves a whole new order from a drag and drop: the list's ids, top first. */
export async function saveOrder(entity: Ordered, ids: string[]): Promise<{ ok: boolean }> {
  const me = await requireUser()
  const table = TABLES[entity]
  if (!table || !Array.isArray(ids) || ids.length > 500 || ids.some((i) => !/^[0-9a-f-]{36}$/.test(i))) return { ok: false }
  await db().transaction(async (tx) => {
    for (const [i, id] of ids.entries()) await tx.update(table).set({ sortOrder: (i + 1) * 10 }).where(eq(table.id, id))
  })
  await audit(me.email, "update", entity, null, "changed the order")
  contentChanged()
  revalidatePath(PATHS[entity])
  return { ok: true }
}
