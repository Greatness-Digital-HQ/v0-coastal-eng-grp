import type { Metadata } from "next"
import Link from "next/link"
import { asc } from "drizzle-orm"
import { ArrowDown, ArrowUp, Plus } from "lucide-react"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { marketName, SERVICES } from "@/lib/taxonomy"
import { Button } from "@/components/ui/button"
import { DeletedItems } from "../deleted-items"
import { Empty, PageHeader, Pill, StatusPill } from "../ui"
import { moveProject, restoreProject } from "./actions"

export const metadata: Metadata = { title: "Projects" }

export default async function ProjectsPage() {
  await requireUser()
  const rows = await db().select().from(schema.projects).orderBy(asc(schema.projects.sortOrder), asc(schema.projects.createdAt))
  const firstPublished = rows.find((r) => r.status === "published")?.id

  return (
    <>
      <PageHeader
        title="Projects"
        description="The portfolio on /projects/featured-work, the service pages and the homepage. The first published project is the homepage feature; use the arrows to change the order."
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus /> New project
            </Link>
          </Button>
        }
      />
      {rows.length === 0 ? (
        <Empty>No projects yet.</Empty>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-white">
          {rows.map((p, i) => (
            <li key={p.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex flex-col">
                <MoveButton id={p.id} dir="up" disabled={i === 0} />
                <MoveButton id={p.id} dir="down" disabled={i === rows.length - 1} />
              </div>
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image && <img src={p.image} alt="" className="size-full object-cover" loading="lazy" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/projects/${p.id}`} className="font-medium hover:text-sky-800 hover:underline">
                  {p.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {[p.client, marketName(p.market), p.services.map((s) => SERVICES.find((x) => x.key === s)?.tag ?? s).join(", "), p.state, p.year].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5 sm:hidden">
                  <StatusPill status={p.status} />
                  {p.id === firstPublished && <Pill tone="blue">Homepage feature</Pill>}
                  {p.needsReview && <Pill tone="amber">Needs review</Pill>}
                </div>
              </div>
              <div className="hidden shrink-0 flex-wrap justify-end gap-1.5 sm:flex">
                {p.id === firstPublished && <Pill tone="blue">Homepage feature</Pill>}
                {p.needsReview && <Pill tone="amber">Needs review</Pill>}
                <StatusPill status={p.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <DeletedItems entity="project" table={schema.projects} restore={restoreProject} titleKey="title" />
    </>
  )
}

function MoveButton({ id, dir, disabled }: { id: string; dir: "up" | "down"; disabled: boolean }) {
  const Icon = dir === "up" ? ArrowUp : ArrowDown
  return (
    <form action={moveProject}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="dir" value={dir} />
      <button type="submit" disabled={disabled} aria-label={`Move ${dir}`} className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 disabled:invisible">
        <Icon className="size-4" />
      </button>
    </form>
  )
}
