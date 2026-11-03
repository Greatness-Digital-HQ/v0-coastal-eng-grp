import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { latestRevision } from "@/lib/revisions"
import { Button } from "@/components/ui/button"
import { formatDate, PageHeader } from "../../ui"
import { deleteProject, restoreProject } from "../actions"
import { ProjectEditor } from "../editor"

export const metadata: Metadata = { title: "Edit project" }

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const [p] = await db().select().from(schema.projects).where(eq(schema.projects.id, id))
  if (!p) notFound()
  const rev = await latestRevision("project", id)

  return (
    <>
      <Link href="/admin/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All projects
      </Link>
      <PageHeader
        title={p.title}
        description={`Last saved ${formatDate(p.updatedAt, true)}${p.updatedBy && p.updatedBy !== "import" ? ` by ${p.updatedBy}` : ""}`}
        actions={
          p.status === "published" && (
            <Button asChild variant="outline" size="sm">
              <a href={`/projects/${p.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink /> View on site
              </a>
            </Button>
          )
        }
      />
      <ProjectEditor
        key={p.updatedAt.toISOString()}
        id={p.id}
        initial={{
          title: p.title,
          slug: p.slug,
          client: p.client,
          market: p.market,
          services: p.services,
          state: p.state,
          year: p.year,
          blurb: p.blurb,
          image: p.image,
          scope: p.scope,
          scopeStats: p.scopeStats,
          challenge: p.challenge,
          approach: p.approach,
          outcome: p.outcome,
          status: p.status,
          needsReview: p.needsReview,
        }}
      />
      <div className="mt-8 flex flex-wrap items-center gap-6 border-t pt-6 text-sm">
        {rev && (
          <form action={restoreProject}>
            <input type="hidden" name="id" value={p.id} />
            <button type="submit" className="text-sky-700 hover:underline">
              Undo the last save ({formatDate(rev.createdAt, true)})
            </button>
          </form>
        )}
        <form action={deleteProject}>
          <input type="hidden" name="id" value={p.id} />
          <button type="submit" className="text-rose-700 hover:underline">
            Delete this project
          </button>
        </form>
      </div>
    </>
  )
}
