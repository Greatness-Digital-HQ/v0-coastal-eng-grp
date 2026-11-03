import { count, eq } from "drizzle-orm"
import { ExternalLink, LogOut } from "lucide-react"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { signOut } from "../login/actions"
import { AdminNav } from "./nav"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  const [{ n: newInquiries }] = await db().select({ n: count() }).from(schema.inquiries).where(eq(schema.inquiries.status, "new"))

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="bg-[#0a2540] text-white md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2 md:block md:px-5 md:pt-6 md:pb-5">
          {/* The site's own logo, turned white for the navy rail as the site header does over its hero. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-c-left.png" alt="Coastal Engineering Group" className="h-8 w-auto brightness-0 invert md:h-9" />
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-200/70 md:mt-3 md:block">Website dashboard</p>
          <form action={signOut} className="md:hidden">
            <button type="submit" aria-label="Sign out" className="rounded-md p-2 text-sky-100/80 hover:bg-white/10 hover:text-white">
              <LogOut className="size-4" aria-hidden />
            </button>
          </form>
        </div>
        <AdminNav isOwner={user.role === "owner"} newInquiries={newInquiries} />
        <div className="hidden border-t border-white/10 px-3 py-4 text-sm md:mt-auto md:block">
          <a href="/admin/account" className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-white/10">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold uppercase">
              {(user.name || user.email).slice(0, 1)}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium" title={user.email}>
                {user.name || user.email}
              </span>
              <span className="block text-xs text-sky-100/70">{user.role === "owner" ? "Owner" : "Editor"} · My account</span>
            </span>
          </a>
          <div className="mt-2 flex gap-1 px-1 text-xs">
            <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded px-1.5 py-1 text-sky-100/80 hover:bg-white/10 hover:text-white">
              <ExternalLink className="size-3.5" aria-hidden /> View website
            </a>
            <form action={signOut}>
              <button type="submit" className="flex items-center gap-1.5 rounded px-1.5 py-1 text-sky-100/80 hover:bg-white/10 hover:text-white">
                <LogOut className="size-3.5" aria-hidden /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 md:px-10 md:py-9">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}

