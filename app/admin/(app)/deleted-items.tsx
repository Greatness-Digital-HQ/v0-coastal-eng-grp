import { and, desc, eq, notInArray } from "drizzle-orm"
import { db, schema } from "@/db"
import { formatDate } from "./ui"

/** "Recently deleted" under a content list, with a Restore button for each. */
export async function DeletedItems({
  entity,
  table,
  restore,
  titleKey,
}: {
  entity: string
  table: typeof schema.projects | typeof schema.newsArticles | typeof schema.jobOpenings | typeof schema.leaders
  restore: (form: FormData) => Promise<void>
  titleKey: string
}) {
  const live = (await db().select({ id: table.id }).from(table as typeof schema.projects)).map((r) => r.id)
  const revs = await db()
    .select()
    .from(schema.revisions)
    .where(live.length ? and(eq(schema.revisions.entity, entity), notInArray(schema.revisions.entityId, live)) : eq(schema.revisions.entity, entity))
    .orderBy(desc(schema.revisions.createdAt))
    .limit(30)
  const seen = new Set<string>()
  const deleted = revs.filter((r) => !seen.has(r.entityId) && seen.add(r.entityId)).slice(0, 5)
  if (!deleted.length) return null

  return (
    <details className="mt-6 rounded-xl border bg-white px-5 py-3 text-sm">
      <summary className="cursor-pointer font-medium text-muted-foreground">Recently deleted ({deleted.length})</summary>
      <ul className="mt-3 divide-y">
        {deleted.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 py-2">
            <span>
              {String((r.data as Record<string, unknown>)[titleKey] ?? "Untitled")}
              <span className="text-xs text-muted-foreground"> · deleted {formatDate(r.createdAt, true)} by {r.actor}</span>
            </span>
            <form action={restore}>
              <input type="hidden" name="id" value={r.entityId} />
              <button type="submit" className="text-sky-700 hover:underline">
                Restore
              </button>
            </form>
          </li>
        ))}
      </ul>
    </details>
  )
}
