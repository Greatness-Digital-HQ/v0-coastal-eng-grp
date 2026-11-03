import { db, schema } from "@/db"

export type Use = { label: string; href: string }

/** Where each photo URL is used: projects (main photo and gallery), articles and leadership profiles. */
export async function photoUses(): Promise<Map<string, Use[]>> {
  const [projects, articles, leaders] = await Promise.all([
    db().select({ id: schema.projects.id, title: schema.projects.title, image: schema.projects.image, gallery: schema.projects.gallery }).from(schema.projects),
    db().select({ id: schema.newsArticles.id, title: schema.newsArticles.title, image: schema.newsArticles.image }).from(schema.newsArticles),
    db().select({ id: schema.leaders.id, name: schema.leaders.name, image: schema.leaders.image }).from(schema.leaders),
  ])
  const map = new Map<string, Use[]>()
  const add = (url: string, use: Use) => url && map.set(url, [...(map.get(url) ?? []), use])
  for (const p of projects) {
    add(p.image, { label: p.title, href: `/admin/projects/${p.id}` })
    for (const g of p.gallery) add(g.url, { label: `${p.title} (gallery)`, href: `/admin/projects/${p.id}` })
  }
  for (const a of articles) add(a.image, { label: a.title, href: `/admin/news/${a.id}` })
  for (const l of leaders) add(l.image, { label: l.name, href: `/admin/leadership/${l.id}` })
  return map
}
