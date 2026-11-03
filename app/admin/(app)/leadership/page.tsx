import type { Metadata } from "next"
import Link from "next/link"
import { asc } from "drizzle-orm"
import { ArrowDown, ArrowUp, Plus, UserRound } from "lucide-react"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { DeletedItems } from "../deleted-items"
import { Empty, PageHeader, StatusPill } from "../ui"
import { moveLeader, restoreLeader } from "./actions"

export const metadata: Metadata = { title: "Leadership" }

export default async function LeadershipPage() {
  await requireUser()
  const rows = await db().select().from(schema.leaders).orderBy(asc(schema.leaders.sortOrder))
  return (
    <>
      <PageHeader
        title="Leadership"
        description="Profiles on /leadership, in this order: CEO first, then operations, then division leaders."
        actions={
          <Button asChild>
            <Link href="/admin/leadership/new">
              <Plus /> Add a leader
            </Link>
          </Button>
        }
      />
      {rows.length === 0 ? (
        <Empty>No leadership profiles yet.</Empty>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-white">
          {rows.map((l, i) => (
            <li key={l.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex flex-col">
                {(["up", "down"] as const).map((dir) => (
                  <form key={dir} action={moveLeader}>
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="dir" value={dir} />
                    <button type="submit" aria-label={`Move ${dir}`} disabled={dir === "up" ? i === 0 : i === rows.length - 1} className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 disabled:invisible">
                      {dir === "up" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
                    </button>
                  </form>
                ))}
              </div>
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {l.image ? <img src={l.image} alt="" className="size-full object-cover" /> : <UserRound className="size-5 text-slate-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/leadership/${l.id}`} className="font-medium hover:text-sky-800 hover:underline">
                  {l.name}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{l.title}</p>
              </div>
              <StatusPill status={l.status} />
            </li>
          ))}
        </ul>
      )}
      <DeletedItems entity="leader" table={schema.leaders} restore={restoreLeader} titleKey="name" />
    </>
  )
}
