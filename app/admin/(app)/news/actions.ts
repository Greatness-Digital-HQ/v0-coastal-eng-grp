"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, eq, ne } from "drizzle-orm"
import { z } from "zod"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { contentChanged } from "@/lib/content"
import { dropRevision, latestRevision, snapshot } from "@/lib/revisions"
import { audit } from "@/lib/server-utils"
import { NEWS_CATEGORIES, SLUG_RE } from "@/lib/taxonomy"

const Input = z.object({
  title: z.string().trim().min(1, "Give the article a headline.").max(160),
  slug: z.string().trim().regex(SLUG_RE, "The web address may only use lowercase letters, numbers and dashes.").max(80),
  publishedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick the article's date."),
  category: z.enum(NEWS_CATEGORIES, { errorMap: () => ({ message: "Pick a category." }) }),
  author: z.string().trim().max(80),
  excerpt: z.string().trim().max(500),
  image: z.string().trim().max(500),
  imageAlt: z.string().trim().max(200),
  seoTitle: z.string().trim().max(70),
  seoDescription: z.string().trim().max(170),
  body: z.array(z.string().trim().max(6000)).max(60),
  tags: z.array(z.string().trim().max(40)).max(10),
  status: z.enum(["draft", "published"]),
  needsReview: z.boolean(),
})
export type ArticleInput = z.infer<typeof Input>
export type SaveResult = { ok: true; id: string } | { ok: false; error: string }

export async function saveArticle(id: string | null, raw: ArticleInput): Promise<SaveResult> {
  const me = await requireUser()
  const parsed = Input.safeParse(raw)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }
  const a = parsed.data
  if (a.status === "published") {
    if (!a.excerpt) return { ok: false, error: "Add a short summary before publishing." }
    if (!a.image) return { ok: false, error: "Add a cover photo before publishing." }
    if (a.body.length === 0) return { ok: false, error: "Write the article before publishing." }
  }
  const clash = await db()
    .select({ id: schema.newsArticles.id })
    .from(schema.newsArticles)
    .where(id ? and(eq(schema.newsArticles.slug, a.slug), ne(schema.newsArticles.id, id)) : eq(schema.newsArticles.slug, a.slug))
  if (clash.length) return { ok: false, error: "Another article already uses that web address." }

  let savedId = id
  if (id) {
    const [before] = await db().select().from(schema.newsArticles).where(eq(schema.newsArticles.id, id))
    if (!before) return { ok: false, error: "This article no longer exists." }
    await snapshot("news", id, before, me.email)
    await db().update(schema.newsArticles).set({ ...a, updatedAt: new Date(), updatedBy: me.email }).where(eq(schema.newsArticles.id, id))
    await audit(me.email, before.status !== a.status ? (a.status === "published" ? "publish" : "unpublish") : "update", "news", id, a.title)
  } else {
    const [row] = await db().insert(schema.newsArticles).values({ ...a, updatedBy: me.email }).returning({ id: schema.newsArticles.id })
    savedId = row.id
    await audit(me.email, "create", "news", row.id, a.title)
  }
  contentChanged()
  revalidatePath("/admin/news")
  return { ok: true, id: savedId! }
}

export async function deleteArticle(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const [before] = await db().select().from(schema.newsArticles).where(eq(schema.newsArticles.id, id))
  if (before) {
    await snapshot("news", id, before, me.email)
    await db().delete(schema.newsArticles).where(eq(schema.newsArticles.id, id))
    await audit(me.email, "delete", "news", id, before.title)
    contentChanged()
  }
  revalidatePath("/admin/news")
  redirect("/admin/news")
}

export async function restoreArticle(form: FormData): Promise<void> {
  const me = await requireUser()
  const id = String(form.get("id"))
  const rev = await latestRevision("news", id)
  if (!rev) return
  const data = rev.data as Record<string, unknown>
  const row = { ...(data as typeof schema.newsArticles.$inferInsert), createdAt: new Date(String(data.createdAt)), updatedAt: new Date(), updatedBy: me.email }
  const [exists] = await db().select({ id: schema.newsArticles.id }).from(schema.newsArticles).where(eq(schema.newsArticles.id, id))
  if (exists) await db().update(schema.newsArticles).set(row).where(eq(schema.newsArticles.id, id))
  else await db().insert(schema.newsArticles).values(row)
  await dropRevision(rev.id)
  await audit(me.email, "restore", "news", id, String(data.title))
  contentChanged()
  revalidatePath("/admin/news")
  redirect(`/admin/news/${id}`)
}
