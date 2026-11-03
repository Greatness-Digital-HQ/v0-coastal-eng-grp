import { sql } from "drizzle-orm"
import { db } from "@/db"
import { Panel } from "./ui"

// Inquiries per month for the last six months (spam left out), as plain bars
// with the number on each, plus the most common inquiry types this period.

type Row = { month: string; n: number }

export async function InquiryTrend() {
  const months = (
    await db().execute<Row>(sql`
      select to_char(date_trunc('month', created_at at time zone 'America/New_York'), 'YYYY-MM') as month, count(*)::int as n
      from inquiries
      where status <> 'spam' and created_at >= date_trunc('month', now() at time zone 'America/New_York') - interval '5 months'
      group by 1`)
  ).rows
  const types = (
    await db().execute<{ t: string; n: number }>(sql`
      select coalesce(nullif(inquiry_type, ''), 'Short form') as t, count(*)::int as n
      from inquiries
      where status <> 'spam' and created_at >= date_trunc('month', now() at time zone 'America/New_York') - interval '5 months'
      group by 1 order by 2 desc limit 4`)
  ).rows

  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }))
  const series = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    return { key, label: d.toLocaleString("en-US", { month: "short" }), n: months.find((m) => m.month === key)?.n ?? 0 }
  })
  const max = Math.max(1, ...series.map((s) => s.n))
  const total = series.reduce((a, s) => a + s.n, 0)

  return (
    <Panel title="Inquiries, last 6 months" actions={<span className="text-sm text-muted-foreground tabular-nums">{total} total</span>}>
      <figure>
        <div className="flex h-36 items-end gap-2 sm:gap-3" role="img" aria-label={series.map((s) => `${s.label}: ${s.n}`).join(", ")}>
          {series.map((s, i) => (
            <div key={s.key} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-xs font-medium tabular-nums text-slate-700">{s.n}</span>
              <div
                className={i === series.length - 1 ? "w-full max-w-12 rounded-t-[4px] bg-[#1c6fbf]" : "w-full max-w-12 rounded-t-[4px] bg-[#9cc2e6]"}
                style={{ height: `${Math.max(s.n ? 6 : 2, (s.n / max) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2 border-t pt-2 sm:gap-3" aria-hidden>
          {series.map((s) => (
            <span key={s.key} className="flex-1 text-center text-xs text-muted-foreground">
              {s.label}
            </span>
          ))}
        </div>
        <figcaption className="sr-only">Number of inquiries received each month, this month last.</figcaption>
      </figure>
      {types.length > 0 && (
        <dl className="mt-5 space-y-1.5 text-sm">
          {types.map((t) => (
            <div key={t.t} className="flex items-baseline justify-between gap-3">
              <dt className="truncate text-slate-600">{t.t}</dt>
              <dd className="font-medium tabular-nums">{t.n}</dd>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  )
}
