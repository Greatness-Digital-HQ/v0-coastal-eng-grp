import Link from "next/link"
import { count, desc, eq } from "drizzle-orm"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { mailTransport } from "@/lib/mail"
import { Empty, formatDate, PageHeader, Panel, Pill } from "./ui"

export default async function DashboardHome() {
  const user = await requireUser()
  const d = db()
  const [newInquiries, projects, drafts, articles, recent, activity] = await Promise.all([
    d.select({ n: count() }).from(schema.inquiries).where(eq(schema.inquiries.status, "new")),
    d.select({ n: count() }).from(schema.projects).where(eq(schema.projects.status, "published")),
    d.select({ n: count() }).from(schema.projects).where(eq(schema.projects.status, "draft")),
    d.select({ n: count() }).from(schema.newsArticles).where(eq(schema.newsArticles.status, "published")),
    d.select().from(schema.inquiries).orderBy(desc(schema.inquiries.createdAt)).limit(5),
    d.select().from(schema.auditLog).orderBy(desc(schema.auditLog.createdAt)).limit(8),
  ])

  const stats = [
    { label: "New inquiries", value: newInquiries[0].n, href: "/admin/inquiries?status=new" },
    { label: "Published projects", value: projects[0].n, href: "/admin/projects" },
    { label: "Project drafts", value: drafts[0].n, href: "/admin/projects" },
    { label: "Published articles", value: articles[0].n, href: "/admin/news" },
  ]

  return (
    <>
      <PageHeader title={`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}`} description="Manage the website's projects, news, careers and inquiries. Changes appear on the site within a few seconds." />

      {mailTransport() === "off" && (
        <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Email is not set up yet, so new inquiries are saved here but not emailed to anyone.
        </p>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl border bg-white px-5 py-4 transition-colors hover:border-slate-300">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Latest inquiries" actions={<Link href="/admin/inquiries" className="text-sm text-sky-700 hover:underline">All inquiries</Link>}>
          {recent.length === 0 ? (
            <Empty>No inquiries yet. Submissions from the Contact page land here.</Empty>
          ) : (
            <ul className="-my-2 divide-y">
              {recent.map((q) => (
                <li key={q.id}>
                  <Link href={`/admin/inquiries/${q.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-sky-800">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {q.name}
                        {q.org && <span className="font-normal text-muted-foreground"> · {q.org}</span>}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">{q.inquiryType || "General inquiry"}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {q.status === "new" && <Pill tone="blue">New</Pill>}
                      <span className="text-xs text-muted-foreground">{formatDate(q.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent activity">
          {activity.length === 0 ? (
            <Empty>Nothing yet.</Empty>
          ) : (
            <ul className="-my-2 divide-y">
              {activity.map((a) => (
                <li key={a.id} className="py-2.5 text-sm">
                  <span className="font-medium">{a.actor}</span> <span className="text-muted-foreground">{describe(a.action, a.entity)}</span>
                  {a.summary && <span> {a.summary}</span>}
                  <span className="block text-xs text-muted-foreground">{formatDate(a.createdAt, true)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  )
}

function describe(action: string, entity: string): string {
  const what = { project: "project", news: "article", job: "open role", leader: "leader", settings: "site info", user: "user", inquiry: "inquiry" }[entity] ?? entity
  return {
    sign_in: "signed in",
    create: `added the ${what}`,
    update: `updated the ${what}`,
    delete: `deleted the ${what}`,
    publish: `published the ${what}`,
    unpublish: `unpublished the ${what}`,
    restore: `restored the ${what}`,
    invite: "invited",
    status: `changed the ${what} status:`,
  }[action] ?? `${action} ${what}`
}
