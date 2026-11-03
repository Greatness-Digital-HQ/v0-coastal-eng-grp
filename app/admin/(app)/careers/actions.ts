"use server"

import { revalidatePath } from "next/cache"
import { eq, max } from "drizzle-orm"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { contentChanged } from "@/lib/content"
import { moveRow } from "@/lib/ordering"
import { dropRevision, latestRevision, snapshot } from "@/lib/revisions"
import { audit } from "@/lib/server-utils"

function fields(form: FormData) {
  const s = (k: string, n: number) => String(form.get(k) ?? "").trim().slice(0, n)
  return { title: s("title", 120), division: s("division", 60), location: s("location", 80), type: s("type", 40) || "Full-time" }
}

function done() {
  contentChanged()
  revalidatePath("/admin/careers")
}

export async function addRole(form: FormData): Promise<void> {
  const me = await requireUser()
  const f = fields(form)
  if (!f.title) return
  const [{ top }] = await db().select({ top: max(schema.jobOpenings.sortOrder) }).from(schema.jobOpenings)
  const [row] = await db()
    .insert(schema.jobOpenings)
    .values({ ...f, status: "published", sortOrder: (top ?? 0) + 10, updatedBy: me.email })
    .returning()
  await audit(me.email, "create", "job", row.id, f.title)
  done()
}

export async function updateRole(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const f = fields(form)
  if (!f.title) return
  const [before] = await db().select().from(schema.jobOpenings).where(eq(schema.jobOpenings.id, id))
  if (!before) return
  await snapshot("job", id, before, me.email)
  await db().update(schema.jobOpenings).set({ ...f, updatedAt: new Date(), updatedBy: me.email }).where(eq(schema.jobOpenings.id, id))
  await audit(me.email, "update", "job", id, f.title)
  done()
}

export async function toggleRole(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const [r] = await db().select().from(schema.jobOpenings).where(eq(schema.jobOpenings.id, id))
  if (!r) return
  const status = r.status === "published" ? "draft" : "published"
  await db().update(schema.jobOpenings).set({ status, updatedAt: new Date(), updatedBy: me.email }).where(eq(schema.jobOpenings.id, id))
  await audit(me.email, status === "published" ? "publish" : "unpublish", "job", id, r.title)
  done()
}

export async function deleteRole(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const [r] = await db().select().from(schema.jobOpenings).where(eq(schema.jobOpenings.id, id))
  if (!r) return
  await snapshot("job", id, r, me.email)
  await db().delete(schema.jobOpenings).where(eq(schema.jobOpenings.id, id))
  await audit(me.email, "delete", "job", id, r.title)
  done()
}

export async function restoreRole(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const rev = await latestRevision("job", id)
  if (!rev) return
  const data = rev.data as Record<string, unknown>
  await db()
    .insert(schema.jobOpenings)
    .values({ ...(data as typeof schema.jobOpenings.$inferInsert), createdAt: new Date(String(data.createdAt)), updatedAt: new Date(), updatedBy: me.email })
    .onConflictDoNothing()
  await dropRevision(rev.id)
  await audit(me.email, "restore", "job", id, String(data.title))
  done()
}

export async function moveRole(form: FormData): Promise<void> {
  const me = await requireUser()
  const title = await moveRow(schema.jobOpenings, String(form.get("id")), form.get("dir") === "up")
  if (title) await audit(me.email, "update", "job", String(form.get("id")), `${title} moved`)
  done()
}
