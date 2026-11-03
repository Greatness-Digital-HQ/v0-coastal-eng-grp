import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { ArrowLeft } from "lucide-react"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { latestRevision } from "@/lib/revisions"
import { ConfirmAction } from "../../confirm"
import { formatDate, PageHeader } from "../../ui"
import { deleteLeader, restoreLeader } from "../actions"
import { LeaderEditor } from "../editor"

export const metadata: Metadata = { title: "Edit leader" }

export default async function EditLeaderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const [l] = await db().select().from(schema.leaders).where(eq(schema.leaders.id, id))
  if (!l) notFound()
  const rev = await latestRevision("leader", id)
  return (
    <>
      <Link href="/admin/leadership" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Leadership
      </Link>
      <PageHeader title={l.name} description={`Last saved ${formatDate(l.updatedAt, true)}`} />
      <LeaderEditor
        key={l.updatedAt.toISOString()}
        id={l.id}
        initial={{ name: l.name, title: l.title, bio: l.bio, responsibility: l.responsibility, image: l.image, status: l.status }}
      />
      <div className="mt-8 flex flex-wrap items-center gap-6 border-t pt-6 text-sm">
        {rev && (
          <form action={restoreLeader}>
            <input type="hidden" name="id" value={l.id} />
            <button type="submit" className="text-sky-700 hover:underline">
              Undo the last save ({formatDate(rev.createdAt, true)})
            </button>
          </form>
        )}
        <ConfirmAction
          action={deleteLeader}
          fields={{ id: l.id }}
          title="Delete this profile?"
          description={`${l.name} will be removed from the Leadership page. You can restore the profile later from “Recently deleted”.`}
          confirmLabel="Delete profile"
        >
          Delete this profile
        </ConfirmAction>
      </div>
    </>
  )
}
