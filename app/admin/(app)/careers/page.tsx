import type { Metadata } from "next"
import { asc } from "drizzle-orm"
import { ArrowDown, ArrowUp } from "lucide-react"
import { db, schema } from "@/db"
import type { JobOpening } from "@/db/schema"
import { requireUser } from "@/lib/auth"
import { DIVISION_LABELS } from "@/lib/taxonomy"
import { Button } from "@/components/ui/button"
import { DeletedItems } from "../deleted-items"
import { Empty, PageHeader, Panel, StatusPill } from "../ui"
import { addRole, deleteRole, moveRole, restoreRole, toggleRole, updateRole } from "./actions"

export const metadata: Metadata = { title: "Careers" }

const TYPES = ["Full-time", "Part-time", "Seasonal", "Contract", "Internship"]
const input = "h-9 w-full rounded-md border bg-white px-3 text-sm"

function RoleFields({ r }: { r?: JobOpening }) {
  return (
    <>
      <input name="title" required maxLength={120} defaultValue={r?.title} placeholder="Job title" aria-label="Job title" className={input} />
      <select name="division" defaultValue={r?.division ?? ""} aria-label="Division" className={input}>
        <option value="">Division…</option>
        {[...new Set([...DIVISION_LABELS, ...(r?.division ? [r.division] : [])])].map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
      <input name="location" maxLength={80} defaultValue={r?.location} placeholder="Location" aria-label="Location" className={input} />
      <select name="type" defaultValue={r?.type ?? "Full-time"} aria-label="Type" className={input}>
        {[...new Set([...TYPES, ...(r?.type ? [r.type] : [])])].map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
    </>
  )
}

export default async function CareersPage() {
  await requireUser()
  const roles = await db().select().from(schema.jobOpenings).orderBy(asc(schema.jobOpenings.sortOrder))

  return (
    <>
      <PageHeader title="Careers" description="The Open Roles list on /careers. Each role's Apply button opens your Paylocity job board." />
      <Panel title="Add an open role" className="mb-6">
        <form action={addRole} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <RoleFields />
          <Button type="submit">Add role</Button>
        </form>
      </Panel>

      {roles.length === 0 ? (
        <Empty>No open roles. The Careers page shows only the general “send us your résumé” line.</Empty>
      ) : (
        <ul className="space-y-3">
          {roles.map((r, i) => (
            <li key={r.id} className="flex items-start gap-3 rounded-xl border bg-white p-4">
              <div className="flex flex-col pt-1">
                {(["up", "down"] as const).map((dir) => (
                  <form key={dir} action={moveRole}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="dir" value={dir} />
                    <button type="submit" aria-label={`Move ${dir}`} disabled={dir === "up" ? i === 0 : i === roles.length - 1} className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 disabled:invisible">
                      {dir === "up" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
                    </button>
                  </form>
                ))}
              </div>
              <form action={updateRole} className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <input type="hidden" name="id" value={r.id} />
                <RoleFields r={r} />
                <Button type="submit" variant="outline">
                  Save
                </Button>
              </form>
              <div className="flex shrink-0 flex-col items-end gap-2 pt-1 text-sm">
                <StatusPill status={r.status} />
                <form action={toggleRole}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="text-sky-700 hover:underline">
                    {r.status === "published" ? "Hide" : "Show"}
                  </button>
                </form>
                <form action={deleteRole}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="text-rose-700 hover:underline">
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
      <DeletedItems entity="job" table={schema.jobOpenings} restore={restoreRole} titleKey="title" />
    </>
  )
}
