"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, asc, eq, gt, lt, ne, desc, max } from "drizzle-orm"
import { z } from "zod"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { contentChanged } from "@/lib/content"
import { dropRevision, latestRevision, snapshot } from "@/lib/revisions"
import { audit } from "@/lib/server-utils"
import { MARKETS, SERVICES, SLUG_RE } from "@/lib/taxonomy"

const Input = z.object({
  title: z.string().trim().min(1, "Give the project a title.").max(140),
  slug: z.string().trim().regex(SLUG_RE, "The web address may only use lowercase letters, numbers and dashes.").max(80),
  client: z.string().trim().max(140),
  market: z.string(),
  services: z.array(z.string()).max(5),
  state: z.string().trim().max(40),
  year: z.string().trim().max(20),
  blurb: z.string().trim().max(400),
  image: z.string().trim().max(500),
  scope: z.array(z.string().trim().max(160)).max(20),
  scopeStats: z.array(z.object({ value: z.string().trim().max(30), label: z.string().trim().max(40) })).max(3),
  challenge: z.string().trim().max(3000),
  approach: z.string().trim().max(3000),
  outcome: z.string().trim().max(3000),
  status: z.enum(["draft", "published"]),
  needsReview: z.boolean(),
})
export type ProjectInput = z.infer<typeof Input>
export type SaveResult = { ok: true; id: string } | { ok: false; error: string }

function publishProblems(p: ProjectInput): string | null {
  if (!MARKETS.some((m) => m.key === p.market)) return "Choose the project's market."
  if (p.services.length === 0) return "Choose at least one service."
  if (!p.image) return "Add a photo before publishing."
  if (!p.blurb) return "Add a one-line summary before publishing."
  return null
}

export async function saveProject(id: string | null, raw: ProjectInput): Promise<SaveResult> {
  const me = await requireUser()
  const parsed = Input.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const p = { ...parsed.data, services: parsed.data.services.filter((s) => SERVICES.some((x) => x.key === s)), scopeStats: parsed.data.scopeStats.filter((s) => s.value && s.label) }
  if (p.status === "published") {
    const problem = publishProblems(p)
    if (problem) return { ok: false, error: problem }
  }
  const clash = await db()
    .select({ id: schema.projects.id })
    .from(schema.projects)
    .where(id ? and(eq(schema.projects.slug, p.slug), ne(schema.projects.id, id)) : eq(schema.projects.slug, p.slug))
  if (clash.length) return { ok: false, error: "Another project already uses that web address." }

  let saved
  if (id) {
    const [before] = await db().select().from(schema.projects).where(eq(schema.projects.id, id))
    if (!before) return { ok: false, error: "This project no longer exists." }
    await snapshot("project", id, before, me.email)
    ;[saved] = await db().update(schema.projects).set({ ...p, updatedAt: new Date(), updatedBy: me.email }).where(eq(schema.projects.id, id)).returning()
    const action = before.status !== p.status ? (p.status === "published" ? "publish" : "unpublish") : "update"
    await audit(me.email, action, "project", id, p.title)
  } else {
    const [{ top }] = await db().select({ top: max(schema.projects.sortOrder) }).from(schema.projects)
    ;[saved] = await db()
      .insert(schema.projects)
      .values({ ...p, sortOrder: (top ?? 0) + 10, updatedBy: me.email })
      .returning()
    await audit(me.email, "create", "project", saved.id, p.title)
  }
  contentChanged()
  revalidatePath("/admin/projects")
  return { ok: true, id: saved.id }
}

export async function deleteProject(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const [before] = await db().select().from(schema.projects).where(eq(schema.projects.id, id))
  if (before) {
    await snapshot("project", id, before, me.email)
    await db().delete(schema.projects).where(eq(schema.projects.id, id))
    await audit(me.email, "delete", "project", id, before.title)
    contentChanged()
  }
  revalidatePath("/admin/projects")
  redirect("/admin/projects")
}

/** Swaps a project with its neighbour in the display order. */
export async function moveProject(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const up = form.get("dir") === "up"
  const [cur] = await db().select().from(schema.projects).where(eq(schema.projects.id, id))
  if (!cur) return
  const [other] = await db()
    .select()
    .from(schema.projects)
    .where(up ? lt(schema.projects.sortOrder, cur.sortOrder) : gt(schema.projects.sortOrder, cur.sortOrder))
    .orderBy(up ? desc(schema.projects.sortOrder) : asc(schema.projects.sortOrder))
    .limit(1)
  if (!other) return
  await db().update(schema.projects).set({ sortOrder: other.sortOrder }).where(eq(schema.projects.id, cur.id))
  await db().update(schema.projects).set({ sortOrder: cur.sortOrder }).where(eq(schema.projects.id, other.id))
  await audit(me.email, "update", "project", id, `${cur.title} moved ${up ? "up" : "down"}`)
  contentChanged()
  revalidatePath("/admin/projects")
}

/** Puts back the version from before the last save (or the deleted project). */
export async function restoreProject(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const rev = await latestRevision("project", id)
  if (!rev) return
  const data = rev.data as Record<string, unknown>
  const row = {
    ...(data as typeof schema.projects.$inferInsert),
    createdAt: new Date(String(data.createdAt)),
    updatedAt: new Date(),
    updatedBy: me.email,
  }
  const [exists] = await db().select({ id: schema.projects.id }).from(schema.projects).where(eq(schema.projects.id, id))
  if (exists) await db().update(schema.projects).set(row).where(eq(schema.projects.id, id))
  else await db().insert(schema.projects).values(row)
  await dropRevision(rev.id)
  await audit(me.email, "restore", "project", id, String(data.title))
  contentChanged()
  revalidatePath("/admin/projects")
  redirect(`/admin/projects/${id}`)
}
