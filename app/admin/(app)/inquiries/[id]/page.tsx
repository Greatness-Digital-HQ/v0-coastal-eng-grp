import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { ArrowLeft, Mail, Phone } from "lucide-react"
import { db, schema } from "@/db"
import { INQUIRY_STATUSES } from "@/db/schema"
import { requireUser } from "@/lib/auth"
import { inquiryRows } from "@/lib/inquiries"
import { Button } from "@/components/ui/button"
import { formatDate, Panel } from "../../ui"
import { deleteInquiry, saveInquiryNotes, setInquiryStatus } from "../actions"
import { InquiryStatus, STATUS_LABELS } from "../status"

export const metadata: Metadata = { title: "Inquiry" }

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const [q] = await db().select().from(schema.inquiries).where(eq(schema.inquiries.id, id))
  if (!q) notFound()

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
        <Panel title="Details">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[160px_1fr]">
            {inquiryRows(q).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="whitespace-pre-wrap break-words">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>

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

          <Panel title="Internal notes">
            <form action={saveInquiryNotes} className="space-y-3">
              <input type="hidden" name="id" value={q.id} />
              <textarea name="notes" defaultValue={q.notes} rows={6} placeholder="Only your team sees these." className="w-full rounded-md border px-3 py-2 text-sm" />
              <Button type="submit" size="sm">
                Save notes
              </Button>
            </form>
          </Panel>

          <form action={deleteInquiry}>
            <input type="hidden" name="id" value={q.id} />
            <button type="submit" className="text-sm text-rose-700 hover:underline">
              Delete this inquiry
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
