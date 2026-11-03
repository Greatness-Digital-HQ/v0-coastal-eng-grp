"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { eq, max } from "drizzle-orm"
import { z } from "zod"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { contentChanged } from "@/lib/content"
import { moveRow } from "@/lib/ordering"
import { dropRevision, latestRevision, snapshot } from "@/lib/revisions"
import { audit } from "@/lib/server-utils"

const Input = z.object({
  name: z.string().trim().min(1, "Enter the person's name.").max(100),
  title: z.string().trim().max(120),
  bio: z.string().trim().max(2000),
  responsibility: z.string().trim().max(600),
  image: z.string().trim().max(500),
  status: z.enum(["draft", "published"]),
})
export type LeaderInput = z.infer<typeof Input>

function done() {
  contentChanged()
  revalidatePath("/admin/leadership")
}

export async function saveLeader(id: string | null, raw: LeaderInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const me = await requireUser()
  const parsed = Input.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const l = parsed.data
  if (l.status === "published" && (!l.title || !l.bio)) return { ok: false, error: "Add a title and a bio before publishing." }
  if (id) {
    const [before] = await db().select().from(schema.leaders).where(eq(schema.leaders.id, id))
    if (!before) return { ok: false, error: "This profile no longer exists." }
    await snapshot("leader", id, before, me.email)
    await db().update(schema.leaders).set({ ...l, updatedAt: new Date(), updatedBy: me.email }).where(eq(schema.leaders.id, id))
    await audit(me.email, before.status !== l.status ? (l.status === "published" ? "publish" : "unpublish") : "update", "leader", id, l.name)
    done()
    return { ok: true, id }
  }
  const [{ top }] = await db().select({ top: max(schema.leaders.sortOrder) }).from(schema.leaders)
  const [row] = await db().insert(schema.leaders).values({ ...l, sortOrder: (top ?? 0) + 10, updatedBy: me.email }).returning({ id: schema.leaders.id })
  await audit(me.email, "create", "leader", row.id, l.name)
  done()
  return { ok: true, id: row.id }
}

export async function deleteLeader(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const [before] = await db().select().from(schema.leaders).where(eq(schema.leaders.id, id))
  if (before) {
    await snapshot("leader", id, before, me.email)
    await db().delete(schema.leaders).where(eq(schema.leaders.id, id))
    await audit(me.email, "delete", "leader", id, before.name)
    done()
  }
  redirect("/admin/leadership")
}

export async function restoreLeader(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const rev = await latestRevision("leader", id)
  if (!rev) return
  const data = rev.data as Record<string, unknown>
  const row = { ...(data as typeof schema.leaders.$inferInsert), createdAt: new Date(String(data.createdAt)), updatedAt: new Date(), updatedBy: me.email }
  const [exists] = await db().select({ id: schema.leaders.id }).from(schema.leaders).where(eq(schema.leaders.id, id))
  if (exists) await db().update(schema.leaders).set(row).where(eq(schema.leaders.id, id))
  else await db().insert(schema.leaders).values(row)
  await dropRevision(rev.id)
  await audit(me.email, "restore", "leader", id, String(data.name))
  done()
  redirect(`/admin/leadership/${id}`)
}

export async function moveLeader(form: FormData): Promise<void> {
  const me = await requireUser()
  const name = await moveRow(schema.leaders, String(form.get("id")), form.get("dir") === "up")
  if (name) await audit(me.email, "update", "leader", String(form.get("id")), `${name} moved`)
  done()
}
