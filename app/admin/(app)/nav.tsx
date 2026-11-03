"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, Building2, FolderKanban, Home, Inbox, Newspaper, Settings, UserRound, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const ITEMS = [
  { href: "/admin", label: "Home", icon: Home, exact: true },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/careers", label: "Careers", icon: Briefcase },
  { href: "/admin/leadership", label: "Leadership", icon: Building2 },
  { href: "/admin/settings", label: "Site info", icon: Settings },
]

export function AdminNav({ isOwner, newInquiries }: { isOwner: boolean; newInquiries: number }) {
  const path = usePathname()
  const items = [...ITEMS, ...(isOwner ? [{ href: "/admin/users", label: "Users", icon: Users }] : [])]
  return (
    <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto px-2 pb-2 [scrollbar-width:none] md:flex-col md:overflow-visible md:px-3 md:pb-0">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? path === href : path === href || path.startsWith(`${href}/`)
        const badge = href === "/admin/inquiries" && newInquiries > 0 ? newInquiries : 0
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
              active ? "bg-white text-[#0a2540]" : "text-sky-100/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
            {badge > 0 && (
              <span
                className={cn("ml-auto min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold leading-5 tabular-nums", active ? "bg-[#0a2540] text-white" : "bg-sky-400 text-[#0a2540]")}
                aria-label={`${badge} new`}
              >
                {badge}
              </span>
            )}
          </Link>
        )
      })}
      <Link
        href="/admin/account"
        aria-current={path === "/admin/account" ? "page" : undefined}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium md:hidden",
          path === "/admin/account" ? "bg-white text-[#0a2540]" : "text-sky-100/80",
        )}
      >
        <UserRound className="size-4" aria-hidden />
        Account
      </Link>
    </nav>
  )
}
