import Link from "next/link"
import { count, desc, eq, ne } from "drizzle-orm"
import { ArrowRight, Briefcase, FolderPlus, Inbox, PenLine, Settings } from "lucide-react"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { mailTransport } from "@/lib/mail"
import { Button } from "@/components/ui/button"
import { InquiryTrend } from "./inquiry-trend"
import { formatDate, Panel, Pill, timeAgo } from "./ui"

function greeting(): string {
  const hour = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/New_York" }))
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
}

function firstName(name: string, email: string): string {
  const raw = name.trim().split(/\s+/)[0] || email.split("@")[0].split(/[._-]/)[0]
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export default async function DashboardHome() {
  const user = await requireUser()
  const d = db()
  const n = (rows: { n: number }[]) => rows[0]?.n ?? 0
  const [newOnes, latest, projects, projectDrafts, articles, roles, leaders, review, activity] = await Promise.all([
    d.select().from(schema.inquiries).where(eq(schema.inquiries.status, "new")).orderBy(desc(schema.inquiries.createdAt)).limit(6),
    d.select().from(schema.inquiries).where(ne(schema.inquiries.status, "spam")).orderBy(desc(schema.inquiries.createdAt)).limit(4),
    d.select({ n: count() }).from(schema.projects).where(eq(schema.projects.status, "published")),
    d.select({ n: count() }).from(schema.projects).where(eq(schema.projects.status, "draft")),
    d.select({ n: count() }).from(schema.newsArticles).where(eq(schema.newsArticles.status, "published")),
    d.select({ n: count() }).from(schema.jobOpenings).where(eq(schema.jobOpenings.status, "published")),
    d.select({ n: count() }).from(schema.leaders).where(eq(schema.leaders.status, "published")),
    Promise.all([
      d.select({ n: count() }).from(schema.projects).where(eq(schema.projects.needsReview, true)),
      d.select({ n: count() }).from(schema.newsArticles).where(eq(schema.newsArticles.needsReview, true)),
    ]),
    d.select().from(schema.auditLog).where(ne(schema.auditLog.action, "sign_in")).orderBy(desc(schema.auditLog.createdAt)).limit(8),
  ])
  const newCount = await d.select({ n: count() }).from(schema.inquiries).where(eq(schema.inquiries.status, "new"))
  const reviewProjects = n(review[0])
  const reviewArticles = n(review[1])

  const live = [
    {
      label: "Projects",
      value: n(projects),
      note: n(projectDrafts) ? `${n(projectDrafts)} draft${n(projectDrafts) > 1 ? "s" : ""}` : "",
      href: "/admin/projects",
    },
    { label: "News articles", value: n(articles), note: "", href: "/admin/news" },
    { label: "Open roles", value: n(roles), note: "", href: "/admin/careers" },
    { label: "Leadership profiles", value: n(leaders), note: "", href: "/admin/leadership" },
  ]

  return (
    <>
      <header className="mb-7">
        <p className="text-sm text-muted-foreground">{formatDate(new Date())}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-balance">
          {greeting()}, {firstName(user.name, user.email)}
        </h1>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/admin/projects/new">
              <FolderPlus /> Add a project
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="bg-white">
            <Link href="/admin/news/new">
              <PenLine /> Write an article
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="bg-white">
            <Link href="/admin/careers">
              <Briefcase /> Post an open role
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="bg-white">
            <Link href="/admin/settings">
              <Settings /> Contact details
            </Link>
          </Button>
        </div>
      </header>

      {mailTransport() === "off" && (
        <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Email isn't set up yet. New inquiries are saved here, but nobody is emailed about them, and Forgot password can't send its link.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Panel
            title={n(newCount) ? `${n(newCount)} new ${n(newCount) === 1 ? "inquiry" : "inquiries"} waiting` : "Inquiries"}
            actions={
              <Link href="/admin/inquiries" className="flex items-center gap-1 text-sm text-sky-700 hover:underline">
                All inquiries <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            }
          >
            {newOnes.length === 0 && (
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm">
                <Inbox className="size-5 text-slate-400" aria-hidden />
                <span>
                  <strong className="font-semibold">You're all caught up.</strong> New messages from the website's contact forms show up here.
                </span>
              </div>
            )}
            {(newOnes.length ? newOnes : latest).length > 0 && (
              <ul className="-mx-5 -mb-5 divide-y border-t">
                {(newOnes.length ? newOnes : latest).map((q) => (
                  <li key={q.id}>
                    <Link href={`/admin/inquiries/${q.id}`} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50">
                      <span className={q.status === "new" ? "mt-1.5 size-2 shrink-0 rounded-full bg-sky-500" : "mt-1.5 size-2 shrink-0"} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="truncate font-medium">
                            {q.name}
                            {q.org && <span className="font-normal text-muted-foreground"> · {q.org}</span>}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{timeAgo(q.createdAt)}</span>
                        </span>
                        <span className="mt-0.5 block text-xs font-medium text-slate-600">{q.inquiryType || "Short form"}</span>
                        {q.description && <span className="mt-1 line-clamp-1 block text-sm text-muted-foreground">{q.description}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <InquiryTrend />
        </div>

        <div className="space-y-6">
          <Panel title="On the website now">
            <dl className="-my-1.5 divide-y">
              {live.map((s) => (
                <div key={s.label}>
                  <Link href={s.href} className="flex items-baseline justify-between gap-3 py-2.5 hover:text-sky-800">
                    <dt className="text-sm">
                      {s.label}
                      {s.note && <span className="ml-2 text-xs text-muted-foreground">{s.note}</span>}
                    </dt>
                    <dd className="font-display text-xl font-bold tabular-nums">{s.value}</dd>
                  </Link>
                </div>
              ))}
            </dl>
            {(reviewProjects > 0 || reviewArticles > 0) && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
                <Pill tone="amber" className="mr-1.5 align-[1px]">
                  Needs review
                </Pill>
                {[
                  reviewProjects && `${reviewProjects} project${reviewProjects > 1 ? "s" : ""}`,
                  reviewArticles && `${reviewArticles} article${reviewArticles > 1 ? "s" : ""}`,
                ]
                  .filter(Boolean)
                  .join(" and ")}{" "}
                came from the first version of the site. Check the facts in each, then untick Needs review.
              </p>
            )}
          </Panel>

          <Panel title="Recent changes">
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">Edits to the website will be listed here.</p>
            ) : (
              <ul className="-my-1 space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="text-sm leading-snug">
                    <span className="font-medium">{who(a.actor, user.email)}</span> {describe(a.action, a.entity, a.summary)}
                    <span className="block text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  )
}

function who(actor: string, me: string): string {
  if (actor === me) return "You"
  return actor === "import" ? "Setup" : actor.split("@")[0]
}

function describe(action: string, entity: string, summary: string): React.ReactNode {
  if (entity === "user" || entity === "settings") return summary
  if (summary === "changed the order") return `changed the order of the ${({ project: "projects", job: "open roles", leader: "leadership profiles" } as Record<string, string>)[entity] ?? entity}`
  const what = { project: "project", news: "article", job: "open role", leader: "profile", inquiry: "inquiry", media: "photo" }[entity] ?? entity
  const verb =
    {
      create: `added the ${what}`,
      update: `updated the ${what}`,
      delete: `deleted the ${what}`,
      publish: `published the ${what}`,
      unpublish: `unpublished the ${what}`,
      restore: `restored the ${what}`,
      status: `marked the ${what}`,
    }[action] ?? `${action} the ${what}`
  return (
    <>
      {verb} {summary && <span className="text-slate-700">“{summary}”</span>}
    </>
  )
}
