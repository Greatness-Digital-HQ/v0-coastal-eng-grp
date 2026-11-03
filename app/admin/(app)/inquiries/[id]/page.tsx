import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { asc, eq, isNull } from "drizzle-orm"
import { ArrowLeft, Mail, Phone } from "lucide-react"
import { db, schema } from "@/db"
import { INQUIRY_STATUSES } from "@/db/schema"
import { requireUser } from "@/lib/auth"
import { inquiryRows } from "@/lib/inquiries"
import { mailTransport } from "@/lib/mail"
import { Button } from "@/components/ui/button"
import { ConfirmAction } from "../../confirm"
import { cn } from "@/lib/utils"
import { controlCls } from "../../control"
import { formatDate, Panel } from "../../ui"
import { AutoSelect } from "../../auto-select"
import { assignInquiry, deleteInquiry, saveInquiryNotes, setInquiryStatus } from "../actions"
import { ReplyForm } from "./reply-form"
import { InquiryStatus, STATUS_LABELS } from "../status"

export const metadata: Metadata = { title: "Inquiry" }

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireUser()
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const [q] = await db().select().from(schema.inquiries).where(eq(schema.inquiries.id, id))
  if (!q) notFound()
  const [messages, team] = await Promise.all([
    db().select().from(schema.inquiryMessages).where(eq(schema.inquiryMessages.inquiryId, q.id)).orderBy(asc(schema.inquiryMessages.createdAt)),
    db().select({ id: schema.users.id, name: schema.users.name, email: schema.users.email }).from(schema.users).where(isNull(schema.users.disabledAt)).orderBy(asc(schema.users.email)),
  ])

  return (
    <>
      <Link href="/admin/inquiries" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All inquiries
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{q.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            #{q.ref} · {q.inquiryType || "Short form"} · {formatDate(q.createdAt, true)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <a href={`mailto:${q.email}?subject=${encodeURIComponent(`Re: your inquiry #${q.ref}`)}`}>
              <Mail /> Reply by email
            </a>
          </Button>
          {q.phone && (
            <Button asChild size="sm" variant="outline">
              <a href={`tel:${q.phone}`}>
                <Phone /> Call
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <Panel title="Details">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[160px_1fr]">
              {inquiryRows(q).map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="break-words whitespace-pre-wrap">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title={messages.length ? `Replies (${messages.length})` : "Reply"}>
            {messages.length > 0 && (
              <ol className="mb-6 space-y-4">
                {messages.map((m) => (
                  <li key={m.id} className="rounded-lg border bg-slate-50/60 p-4">
                    <p className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        <strong className="font-semibold text-slate-800">{m.author === me.email ? "You" : m.author}</strong> to {m.sentTo}
                      </span>
                      <span>{formatDate(m.createdAt, true)}</span>
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
                    {m.emailError && <p className="mt-2 text-xs text-rose-700">Not sent: {m.emailError}</p>}
                  </li>
                ))}
              </ol>
            )}
            <ReplyForm id={q.id} to={q.email} disabledReason={mailTransport() === "off" ? "Email isn't set up yet, so replies can't be sent from here. Use Reply by email for now." : undefined} />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Status">
            <div className="mb-3">
              <InquiryStatus status={q.status} />
            </div>
            <div className="flex flex-wrap gap-2">
              {INQUIRY_STATUSES.filter((s) => s !== q.status).map((s) => (
                <form key={s} action={setInquiryStatus}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="status" value={s} />
                  <Button type="submit" size="sm" variant="outline">
                    Mark {STATUS_LABELS[s].toLowerCase()}
                  </Button>
                </form>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {q.notifiedTo.length
                ? `Emailed to ${q.notifiedTo.join(", ")}.`
                : q.emailError
                  ? `Not emailed: ${q.emailError}`
                  : q.status === "spam"
                    ? "Marked as spam automatically, so it was not emailed."
                    : "Email pending."}
            </p>
          </Panel>

          <Panel title="Assigned to">
            <form key={q.assignedTo ?? "none"} action={assignInquiry}>
              <input type="hidden" name="id" value={q.id} />
              <AutoSelect name="userId" defaultValue={q.assignedTo ?? ""} aria-label="Assigned to" className="w-full">
                <option value="">Nobody yet</option>
                {team.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.id === me.id ? `Me (${u.name || u.email})` : u.name || u.email}
                  </option>
                ))}
              </AutoSelect>
              <noscript>
                <Button type="submit" size="sm" className="mt-2">
                  Save
                </Button>
              </noscript>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">They get an email with a link to this inquiry.</p>
          </Panel>

          <Panel title="Internal notes">
            <form key={q.updatedAt.toISOString()} action={saveInquiryNotes} className="space-y-3">
              <input type="hidden" name="id" value={q.id} />
              <textarea name="notes" defaultValue={q.notes} rows={6} placeholder="Only your team sees these." className={cn(controlCls, "w-full py-2")} />
              <Button type="submit" size="sm">
                Save notes
              </Button>
            </form>
          </Panel>

          <ConfirmAction
            action={deleteInquiry}
            fields={{ id: q.id }}
            title="Delete this inquiry?"
            description={`The message from ${q.name} will be deleted for good. To keep it out of the list instead, mark it closed or spam.`}
            confirmLabel="Delete for good"
          >
            Delete this inquiry
          </ConfirmAction>
        </div>
      </div>
    </>
  )
}
