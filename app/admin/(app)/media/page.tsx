import type { Metadata } from "next"
import Link from "next/link"
import { desc } from "drizzle-orm"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { ConfirmAction } from "../confirm"
import { Empty, formatDate, PageHeader, Pill } from "../ui"
import { deletePhoto } from "./actions"
import { photoUses } from "./uses"

export const metadata: Metadata = { title: "Photo library" }

function size(bytes: number | null): string {
  if (!bytes) return ""
  return bytes > 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`
}

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireUser()
  const { show = "" } = await searchParams
  const [photos, uses] = await Promise.all([db().select().from(schema.media).orderBy(desc(schema.media.createdAt)), photoUses()])
  const unused = photos.filter((p) => !(uses.get(p.url) ?? []).length)
  const list = show === "unused" ? unused : photos

  return (
    <>
      <PageHeader
        title="Photo library"
        description="Every photo on the website and every photo uploaded to the dashboard. Pick any of them from an editor with “From library”. Photos in use can't be deleted."
      />
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/media" aria-current={show === "" ? "page" : undefined} className={show === "" ? "rounded-full bg-primary px-3 py-1 text-white" : "rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 hover:bg-slate-50"}>
          All ({photos.length})
        </Link>
        <Link href="/admin/media?show=unused" aria-current={show === "unused" ? "page" : undefined} className={show === "unused" ? "rounded-full bg-primary px-3 py-1 text-white" : "rounded-full bg-white px-3 py-1 ring-1 ring-slate-200 hover:bg-slate-50"}>
          Not used ({unused.length})
        </Link>
      </div>
      {list.length === 0 ? (
        <Empty>{show === "unused" ? "Every photo is in use." : "No photos yet. Photos you upload in any editor appear here."}</Empty>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => {
            const used = uses.get(p.url) ?? []
            return (
              <li key={p.id} className="flex flex-col overflow-hidden rounded-xl border bg-white">
                <a href={p.url} target="_blank" rel="noreferrer" className="block aspect-[4/3] bg-slate-100" aria-label={`Open ${p.name || "photo"} full size`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" loading="lazy" className="size-full object-cover" />
                </a>
                <div className="flex flex-1 flex-col gap-2 p-3 text-xs">
                  <p className="truncate text-sm font-medium" title={p.name}>
                    {p.name || p.url.split("/").pop()}
                  </p>
                  <p className="text-muted-foreground tabular-nums">
                    {[p.width && p.height ? `${p.width}×${p.height}` : "", size(p.bytes), p.uploadedBy === "import" ? "on the site from the start" : formatDate(p.createdAt)].filter(Boolean).join(" · ")}
                  </p>
                  {used.length ? (
                    <ul className="space-y-0.5">
                      {used.slice(0, 3).map((u) => (
                        <li key={u.href + u.label} className="truncate">
                          <Link href={u.href} className="text-sky-700 hover:underline">
                            {u.label}
                          </Link>
                        </li>
                      ))}
                      {used.length > 3 && <li className="text-muted-foreground">and {used.length - 3} more</li>}
                    </ul>
                  ) : (
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <Pill>Not used</Pill>
                      <ConfirmAction
                        action={deletePhoto}
                        fields={{ id: p.id }}
                        title="Delete this photo?"
                        description="It is removed from the library for good. Nothing on the website uses it."
                        confirmLabel="Delete photo"
                        className="text-xs"
                      >
                        Delete
                      </ConfirmAction>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
