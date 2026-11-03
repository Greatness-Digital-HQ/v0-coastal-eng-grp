import { unstable_cache, updateTag } from "next/cache"
import { asc, desc, eq, inArray } from "drizzle-orm"
import { db, hasDatabase, schema } from "@/db"
import { marketName, SERVICES } from "./taxonomy"

// The published site content, in the shapes public/ceg/*.jsx already use.
// (site)/layout.tsx renders it into every page as JSON; data.jsx,
// news-data.jsx and leadership-app.jsx read it in place of their built-in
// copies. Cached until the dashboard saves something (contentChanged()).

export const CONTENT_TAG = "ceg-content"

export type SiteProject = {
  slug: string
  title: string
  client: string
  market: string
  services: string[]
  state: string
  year: string
  tag: string
  blurb: string
  image: string
  scope: string[]
  scopeStats: { value: string; label: string }[]
  challenge: string
  approach: string
  outcome: string
}

export type SiteArticle = {
  slug: string
  title: string
  date: string
  dateISO: string
  category: string
  author: string
  readTime: string
  excerpt: string
  image: string
  tags: string[]
  body: string[]
}

export type SiteContact = { phone: string; email: string; locations: { name: string; line1: string; line2: string }[]; linkedin: string }

export type SiteContent = {
  projects: SiteProject[]
  news: SiteArticle[]
  openRoles: { title: string; division: string; location: string; type: string }[]
  leaders: { name: string; title: string; image: string | null; bio: string; responsibility: string }[]
  contact: SiteContact | null
}

function longDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
}

function readTime(body: string[]): string {
  const words = body.join(" ").split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

async function load(): Promise<SiteContent> {
  const d = db()
  const published = "published" as const
  const [projects, news, roles, leaders, contact] = await Promise.all([
    d.select().from(schema.projects).where(eq(schema.projects.status, published)).orderBy(asc(schema.projects.sortOrder), asc(schema.projects.createdAt)),
    d.select().from(schema.newsArticles).where(eq(schema.newsArticles.status, published)).orderBy(desc(schema.newsArticles.publishedOn)),
    d.select().from(schema.jobOpenings).where(eq(schema.jobOpenings.status, published)).orderBy(asc(schema.jobOpenings.sortOrder)),
    d.select().from(schema.leaders).where(eq(schema.leaders.status, published)).orderBy(asc(schema.leaders.sortOrder)),
    d.select().from(schema.settings).where(inArray(schema.settings.key, ["contact"])),
  ])
  return {
    projects: projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      client: p.client,
      market: marketName(p.market),
      services: p.services,
      state: p.state,
      year: p.year,
      tag: SERVICES.find((s) => s.key === p.services[0])?.tag ?? "",
      blurb: p.blurb,
      image: p.image,
      scope: p.scope,
      scopeStats: p.scopeStats,
      challenge: p.challenge,
      approach: p.approach,
      outcome: p.outcome,
    })),
    news: news.map((a) => ({
      slug: a.slug,
      title: a.title,
      date: longDate(a.publishedOn),
      dateISO: a.publishedOn,
      category: a.category,
      author: a.author,
      readTime: readTime(a.body),
      excerpt: a.excerpt,
      image: a.image,
      tags: a.tags,
      body: a.body,
    })),
    openRoles: roles.map((r) => ({ title: r.title, division: r.division, location: r.location, type: r.type })),
    leaders: leaders.map((l) => ({ name: l.name, title: l.title, image: l.image || null, bio: l.bio, responsibility: l.responsibility })),
    contact: (contact.find((c) => c.key === "contact")?.value as SiteContact | undefined) ?? null,
  }
}

const cached = unstable_cache(load, ["ceg-site-content-v1"], { tags: [CONTENT_TAG] })

/**
 * The published content, or null when there is no database or it can't be
 * reached; the site then shows the copy built into public/ceg.
 */
export async function getSiteContent(): Promise<SiteContent | null> {
  if (!hasDatabase()) return null
  try {
    return await cached()
  } catch (e) {
    console.error("[content] falling back to the built-in copy:", (e as Error).message)
    return null
  }
}

/** Call from a dashboard server action after any change to published content. */
export function contentChanged(): void {
  updateTag(CONTENT_TAG)
}
