import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { getSiteContent, toSiteProject } from "@/lib/content"
import { PreviewPage } from "../../preview-page"

export const metadata: Metadata = { title: "Preview" }
export const dynamic = "force-dynamic"

export default async function ProjectPreview({ params }: { params: Promise<{ slug: string }> }) {
  await requireUser()
  const { slug } = await params
  const [p] = await db().select().from(schema.projects).where(eq(schema.projects.slug, slug))
  if (!p) notFound()
  const content = await getSiteContent()
  const draft = toSiteProject(p)
  const projects = content?.projects ?? []
  const merged = projects.some((x) => x.slug === slug) ? projects.map((x) => (x.slug === slug ? draft : x)) : [...projects, draft]
  return (
    <PreviewPage
      content={content ? { ...content, projects: merged } : { projects: [draft], news: [], openRoles: [], leaders: [], contact: null, text: null }}
      app="project-detail-app"
      editHref={`/admin/projects/${p.id}`}
      status={p.status}
    />
  )
}
