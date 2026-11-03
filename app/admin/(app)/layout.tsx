import { requireUser } from "@/lib/auth"
import { signOut } from "../login/actions"
import { AdminNav } from "./nav"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_1fr]">
      <aside className="border-b bg-white md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-r md:border-b-0">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:block md:px-5 md:py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-c-left.png" alt="Coastal Engineering Group" className="h-8 w-auto md:h-9" />
          <p className="hidden text-xs font-medium uppercase tracking-wide text-muted-foreground md:mt-2 md:block">Website dashboard</p>
        </div>
        <AdminNav isOwner={user.role === "owner"} />
        <div className="hidden border-t px-5 py-4 text-sm md:mt-auto md:block">
          <p className="truncate font-medium" title={user.email}>
            {user.name || user.email}
          </p>
          <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <a href="/admin/account" className="text-muted-foreground underline-offset-2 hover:underline">
              My account
            </a>
            <a href="/" target="_blank" rel="noreferrer" className="text-muted-foreground underline-offset-2 hover:underline">
              View site
            </a>
            <form action={signOut}>
              <button type="submit" className="text-muted-foreground underline-offset-2 hover:underline">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  )
}
