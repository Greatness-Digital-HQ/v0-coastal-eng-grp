"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, Building2, FolderKanban, Home, Inbox, LogOut, Newspaper, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "../login/actions"

const ITEMS = [
  { href: "/admin", label: "Home", icon: Home, exact: true },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/careers", label: "Careers", icon: Briefcase },
  { href: "/admin/leadership", label: "Leadership", icon: Building2 },
  { href: "/admin/settings", label: "Site info", icon: Settings },
]

export function AdminNav({ isOwner }: { isOwner: boolean }) {
  const path = usePathname()
  const items = isOwner ? [...ITEMS, { href: "/admin/users", label: "Users", icon: Users }] : ITEMS
  return (
    <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible md:px-3 md:pb-0">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? path === href : path === href || path.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        )
      })}
      <form action={signOut} className="md:hidden">
        <button type="submit" className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600">
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </form>
    </nav>
  )
}
