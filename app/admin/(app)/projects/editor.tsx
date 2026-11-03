"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { MARKETS, SERVICES, slugify, US_STATES } from "@/lib/taxonomy"
import { CheckboxGroup, ImageField, LinesField, SelectField, TextArea, TextField } from "../fields"
import { Panel } from "../ui"
import { saveProject, type ProjectInput } from "./actions"


export function ProjectEditor({ id, initial }: { id: string | null; initial: ProjectInput }) {
  const [p, setP] = useState(initial)
  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [pending, start] = useTransition()
  const [error, setError] = useState("")
  const router = useRouter()
  const set = <K extends keyof ProjectInput>(k: K, v: ProjectInput[K]) => setP((prev) => ({ ...prev, [k]: v }))
  const stats = [0, 1, 2].map((i) => p.scopeStats[i] ?? { value: "", label: "" })
  const setStat = (i: number, k: "value" | "label", v: string) => {
    const next = stats.map((s, j) => (j === i ? { ...s, [k]: v } : s))
    set("scopeStats", next)
  }

  function save(status: "draft" | "published") {
    setError("")
    start(async () => {
      const res = await saveProject(id, { ...p, status, scopeStats: stats })
      if (!res.ok) {
        setError(res.error)
        toast.error(res.error)
        return
      }
      setP((prev) => ({ ...prev, status }))
      toast.success(status === "published" ? (initial.status === "published" ? "Saved. The website is updated." : "Published. It's live on the website.") : "Saved as a draft. It's not on the website.")
      if (!id) router.replace(`/admin/projects/${res.id}`)
      else router.refresh()
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save(p.status)
      }}
      className="grid gap-6 xl:grid-cols-[1fr_300px]"
    >
      <div className="min-w-0 space-y-6">
        <Panel title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="title"
              label="Project title"
              required
              max={140}
              className="sm:col-span-2"
              value={p.title}
              onChange={(v) => {
                set("title", v)
                if (!slugTouched) set("slug", slugify(v))
              }}
            />
            <TextField
              id="slug"
              label="Web address"
              required
              max={80}
              className="sm:col-span-2"
              hint={`Page address: /projects/${p.slug || "…"}${id && initial.status === "published" ? ". Changing it breaks links people already have." : ""}`}
              value={p.slug}
              onChange={(v) => {
                setSlugTouched(true)
                set("slug", slugify(v))
              }}
            />
            <TextField id="client" label="Client" max={140} value={p.client} onChange={(v) => set("client", v)} hint="Use only with the client's permission." />
            <div className="grid grid-cols-2 gap-4">
              <SelectField id="state" label="State" value={p.state} onChange={(v) => set("state", v)} options={US_STATES.map((s) => ({ value: s, label: s }))} />
              <TextField id="year" label="Year" max={20} value={p.year} onChange={(v) => set("year", v)} />
            </div>
            <SelectField
              id="market"
              label="Market"
              required
              className="sm:col-span-2"
              value={p.market}
              onChange={(v) => set("market", v)}
              options={MARKETS.map((m) => ({ value: m.key, label: m.name }))}
            />
            <CheckboxGroup
              id="services"
              label="Services"
              required
              className="sm:col-span-2"
              hint={`Drives the Service filter and the service pages. Homepage card label: ${SERVICES.find((s) => s.key === p.services[0])?.tag ?? "none yet"} (the first one ticked).`}
              value={p.services}
              onChange={(v) => set("services", v)}
              options={SERVICES.map((s) => ({ value: s.key, label: s.name }))}
            />
            <TextArea id="blurb" label="One-line summary" required max={400} rows={2} className="sm:col-span-2" hint="Shown on project cards." value={p.blurb} onChange={(v) => set("blurb", v)} />
          </div>
        </Panel>

        <Panel title="Photo">
          <ImageField id="image" label="Main photo" kind="project" required value={p.image} onChange={(v) => set("image", v)} />
        </Panel>

        <Panel title="Project story">
          <div className="space-y-4">
            <TextArea id="challenge" label="The challenge" rows={4} max={3000} value={p.challenge} onChange={(v) => set("challenge", v)} />
            <TextArea id="approach" label="Our approach" rows={4} max={3000} value={p.approach} onChange={(v) => set("approach", v)} />
            <TextArea id="outcome" label="The outcome" rows={4} max={3000} value={p.outcome} onChange={(v) => set("outcome", v)} />
          </div>
        </Panel>

        <Panel title="Scope and numbers">
          <div className="space-y-5">
            <LinesField id="scope" label="Scope of work" hint="One item per line." value={p.scope} onChange={(v) => set("scope", v)} />
            <div>
              <p className="mb-1.5 text-sm font-medium">Key numbers (up to 3)</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((s, i) => (
                  <div key={i} className="space-y-2 rounded-lg border p-3">
                    <input aria-label={`Number ${i + 1}`} placeholder="e.g. 47" maxLength={30} value={s.value} onChange={(e) => setStat(i, "value", e.target.value)} className="w-full rounded-md border px-2 py-1.5 text-sm font-semibold" />
                    <input aria-label={`Label ${i + 1}`} placeholder="e.g. Piles inspected" maxLength={40} value={s.label} onChange={(e) => setStat(i, "label", e.target.value)} className="w-full rounded-md border px-2 py-1.5 text-sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
        <Panel title="Publish">
          <p className="mb-4 text-sm text-muted-foreground">
            {p.status === "published" ? "Live on the website. Saving updates it within seconds." : "Draft: only visible here in the dashboard."}
          </p>
          {error && (
            <p role="alert" className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-2">
            {p.status === "published" ? (
              <>
                <Button type="button" disabled={pending} onClick={() => save("published")}>
                  {pending ? "Saving…" : "Save changes"}
                </Button>
                <Button type="button" variant="outline" disabled={pending} onClick={() => save("draft")}>
                  Unpublish
                </Button>
              </>
            ) : (
              <>
                <Button type="button" disabled={pending} onClick={() => save("published")}>
                  {pending ? "Saving…" : "Publish"}
                </Button>
                <Button type="button" variant="outline" disabled={pending} onClick={() => save("draft")}>
                  Save draft
                </Button>
              </>
            )}
          </div>
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5 size-4" checked={p.needsReview} onChange={(e) => set("needsReview", e.target.checked)} />
            <span>
              Needs review
              <span className="block text-xs text-muted-foreground">A reminder for your team only; never shown on the site.</span>
            </span>
          </label>
        </Panel>
      </aside>
    </form>
  )
}
