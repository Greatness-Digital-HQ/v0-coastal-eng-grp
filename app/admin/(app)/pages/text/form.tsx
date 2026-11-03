"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, Loader2, Plus, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { PageText } from "@/lib/page-text"
import { cn } from "@/lib/utils"
import { controlCls } from "../../control"
import { LinesField, ParagraphsField, TextArea, TextField } from "../../fields"
import { Panel } from "../../ui"
import { useUnsavedGuard } from "../../unsaved"
import { savePageText } from "./actions"

type Pair = Record<string, string>

/** Rows of two short fields (value + label, abbreviation + name, heading + text). */
function PairRows<T extends Pair>({
  rows,
  onChange,
  keys,
  labels,
  max,
  long,
  empty,
}: {
  rows: T[]
  onChange: (rows: T[]) => void
  keys: [keyof T & string, keyof T & string]
  labels: [string, string]
  max: number
  long?: boolean
  empty: T
}) {
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className={cn("grid items-start gap-2", long ? "sm:grid-cols-[200px_1fr_auto]" : "sm:grid-cols-[1fr_1fr_auto]")}>
          <input aria-label={`${labels[0]} ${i + 1}`} placeholder={labels[0]} value={r[keys[0]]} onChange={(e) => onChange(rows.map((x, j) => (j === i ? { ...x, [keys[0]]: e.target.value } : x)))} className={cn(controlCls, "h-9 w-full font-medium")} />
          {long ? (
            <textarea aria-label={`${labels[1]} ${i + 1}`} placeholder={labels[1]} rows={2} value={r[keys[1]]} onChange={(e) => onChange(rows.map((x, j) => (j === i ? { ...x, [keys[1]]: e.target.value } : x)))} className={cn(controlCls, "w-full py-2")} />
          ) : (
            <input aria-label={`${labels[1]} ${i + 1}`} placeholder={labels[1]} value={r[keys[1]]} onChange={(e) => onChange(rows.map((x, j) => (j === i ? { ...x, [keys[1]]: e.target.value } : x)))} className={cn(controlCls, "h-9 w-full")} />
          )}
          <Button type="button" variant="ghost" size="icon" aria-label={`Remove row ${i + 1}`} className="text-rose-700" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
            <Trash2 />
          </Button>
        </div>
      ))}
      {rows.length < max && (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, { ...empty }])}>
          <Plus /> Add a row
        </Button>
      )}
    </div>
  )
}

function Section({ title, where, onReset, children }: { title: string; where: string; onReset: () => void; children: React.ReactNode }) {
  return (
    <Panel
      title={title}
      actions={
        <span className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <a href={where} target="_blank" rel="noreferrer">
              <ExternalLink /> <span className="hidden sm:inline">See it</span>
            </a>
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onReset} title="Put back the original text in this section (save to apply)">
            <RotateCcw /> <span className="hidden sm:inline">Original</span>
          </Button>
        </span>
      }
    >
      {children}
    </Panel>
  )
}

export function PageTextForm({ initial, defaults }: { initial: PageText; defaults: PageText }) {
  const [t, setT] = useState(initial)
  const [saved, setSaved] = useState(() => JSON.stringify(initial))
  const [pending, start] = useTransition()
  const [error, setError] = useState("")
  // Bumped on "Original" so the line and paragraph fields pick up the reset text.
  const [rev, setRev] = useState(0)
  const reset = (fn: (p: PageText) => PageText) => {
    setT(fn)
    setRev((r) => r + 1)
  }
  const router = useRouter()
  const dirty = JSON.stringify(t) !== saved
  useUnsavedGuard(dirty)
  const home = <K extends keyof PageText["home"]>(k: K, v: PageText["home"][K]) => setT((p) => ({ ...p, home: { ...p.home, [k]: v } }))
  const careers = <K extends keyof PageText["careers"]>(k: K, v: PageText["careers"][K]) => setT((p) => ({ ...p, careers: { ...p.careers, [k]: v } }))

  function save() {
    setError("")
    start(async () => {
      const res = await savePageText(t)
      if (!res.ok) {
        setError(res.error)
        toast.error(res.error)
        return
      }
      setSaved(JSON.stringify(t))
      toast.success("Saved. The website is updated.")
      router.refresh()
    })
  }

  const emphasisMissing = t.home.heroEmphasis && !t.home.heroLine2.includes(t.home.heroEmphasis)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
      className="space-y-6 pb-28"
    >
      <Section title="Homepage: headline" where="/" onReset={() => reset((p) => ({ ...p, home: { ...p.home, ...pick(defaults.home, ["heroLine1", "heroLine2", "heroEmphasis", "heroLede", "heroButton"]) } }))}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="h1" label="First line" max={80} value={t.home.heroLine1} onChange={(v) => home("heroLine1", v)} />
          <TextField id="h2" label="Second line" max={120} value={t.home.heroLine2} onChange={(v) => home("heroLine2", v)} />
          <TextField
            id="hem"
            label="Word in italics"
            max={40}
            value={t.home.heroEmphasis}
            onChange={(v) => home("heroEmphasis", v)}
            hint={emphasisMissing ? "This word isn't in the second line, so nothing is shown in italics." : "Must appear in the second line. Leave empty for none."}
          />
          <TextField id="hbtn" label="Button label" max={40} value={t.home.heroButton} onChange={(v) => home("heroButton", v)} hint="The button opens the Services page." />
          <TextArea id="hlede" label="Paragraph under the headline" max={400} rows={3} className="sm:col-span-2" value={t.home.heroLede} onChange={(v) => home("heroLede", v)} />
        </div>
        <div className="mt-5 rounded-lg bg-[#0a2540] px-5 py-6 text-white" aria-label="Headline preview">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-sky-200/70 uppercase">Preview</p>
          <p className="font-display text-2xl leading-tight font-bold text-balance sm:text-3xl">
            {t.home.heroLine1}
            <br />
            <Emphasis line={t.home.heroLine2} word={t.home.heroEmphasis} />
          </p>
          <p className="mt-3 max-w-2xl text-sm text-sky-50/85">{t.home.heroLede}</p>
        </div>
      </Section>

      <Section title="Homepage: introduction" where="/" onReset={() => reset((p) => ({ ...p, home: { ...p.home, ...pick(defaults.home, ["introHeading", "introParagraphs"]) } }))}>
        <div className="space-y-4">
          <TextField id="ih" label="Heading" max={120} value={t.home.introHeading} onChange={(v) => home("introHeading", v)} />
          <ParagraphsField key={`ip-${rev}`} id="ip" label="Paragraphs" hint="Leave a blank line between paragraphs. Up to 4." value={t.home.introParagraphs} onChange={(v) => home("introParagraphs", v.slice(0, 4))} />
        </div>
      </Section>

      <Section title="Proof points" where="/" onReset={() => reset((p) => ({ ...p, stats: defaults.stats }))}>
        <p className="mb-3 text-sm text-muted-foreground">The short facts shown on the homepage, for example “Veteran-Owned / Small Business”. Up to 6.</p>
        <PairRows rows={t.stats} onChange={(v) => setT((p) => ({ ...p, stats: v }))} keys={["value", "label"]} labels={["Big text", "Small text"]} max={6} empty={{ value: "", label: "" }} />
      </Section>

      <Section title="Certifications" where="/about" onReset={() => reset((p) => ({ ...p, certs: defaults.certs }))}>
        <p className="mb-3 text-sm text-muted-foreground">List only certifications Coastal currently holds. Up to 12.</p>
        <PairRows rows={t.certs} onChange={(v) => setT((p) => ({ ...p, certs: v }))} keys={["abbr", "full"]} labels={["Short name", "Full name"]} max={12} empty={{ abbr: "", full: "" }} />
      </Section>

      <Section title="Clients" where="/about" onReset={() => reset((p) => ({ ...p, clients: defaults.clients }))}>
        <LinesField key={`cl-${rev}`} id="clients" label="Client names" hint="One per line, only with the client's permission. Up to 24; the homepage shows the first 6." value={t.clients} onChange={(v) => setT((p) => ({ ...p, clients: v.slice(0, 24) }))} />
      </Section>

      <Section title="Careers page" where="/careers" onReset={() => reset((p) => ({ ...p, careers: defaults.careers }))}>
        <div className="space-y-4">
          <TextField id="cp" label="Headline" max={120} value={t.careers.pitch} onChange={(v) => careers("pitch", v)} />
          <TextArea id="cl" label="Introduction" max={900} rows={4} value={t.careers.lede} onChange={(v) => careers("lede", v)} />
          <div>
            <p className="mb-2 text-sm font-medium">Benefits</p>
            <PairRows rows={t.careers.benefits} onChange={(v) => careers("benefits", v)} keys={["h", "v"]} labels={["Heading", "Details"]} max={8} long empty={{ h: "", v: "" }} />
          </div>
        </div>
      </Section>

      <Section title="Office hours" where="/contact" onReset={() => reset((p) => ({ ...p, hours: defaults.hours }))}>
        <TextField id="hours" label="Hours" max={80} value={t.hours} onChange={(v) => setT((p) => ({ ...p, hours: v }))} hint="Shown next to the phone number in the contact sections." />
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgb(10_37_64/0.08)] backdrop-blur md:left-[240px] md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <p className={cn("text-sm", dirty ? "font-medium text-amber-800" : "text-muted-foreground")} aria-live="polite">
            {error ? <span className="text-rose-800">{error}</span> : dirty ? "Unsaved changes." : "All changes saved."}
          </p>
          <Button type="submit" disabled={pending || !dirty}>
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            Save page text
          </Button>
        </div>
      </div>
    </form>
  )
}

function Emphasis({ line, word }: { line: string; word: string }) {
  if (!word || !line.includes(word)) return <>{line}</>
  const [a, b] = line.split(word, 2)
  return (
    <>
      {a}
      <em className="text-sky-300">{word}</em>
      {b}
    </>
  )
}

function pick<T extends object, K extends keyof T>(o: T, keys: K[]): Pick<T, K> {
  return Object.fromEntries(keys.map((k) => [k, o[k]])) as Pick<T, K>
}
