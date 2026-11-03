"use client"

import { useState, useTransition } from "react"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { TextField } from "../fields"
import { saveContact, saveRouting, type ContactInput } from "./actions"

export function ContactForm({ initial }: { initial: ContactInput }) {
  const [c, setC] = useState(initial)
  const [pending, start] = useTransition()
  const setLoc = (i: number, k: "name" | "line1" | "line2", v: string) =>
    setC((prev) => ({ ...prev, locations: prev.locations.map((l, j) => (j === i ? { ...l, [k]: v } : l)) }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          const res = await saveContact(c)
          if (res.ok) toast.success("Saved. The header, footer and Contact page are updated.")
          else toast.error(res.error)
        })
      }}
      className="space-y-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="phone" label="Phone" required max={40} value={c.phone} onChange={(v) => setC({ ...c, phone: v })} />
        <TextField id="email" label="Public email" required max={200} value={c.email} onChange={(v) => setC({ ...c, email: v })} />
        <TextField id="linkedin" label="LinkedIn page" className="sm:col-span-2" hint="Leave empty to hide the LinkedIn links." value={c.linkedin} onChange={(v) => setC({ ...c, linkedin: v })} />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Locations</p>
        <div className="space-y-3">
          {c.locations.map((l, i) => (
            <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <input aria-label="Location name" placeholder="e.g. New York Headquarters" value={l.name} onChange={(e) => setLoc(i, "name", e.target.value)} className="h-9 rounded-md border px-3 text-sm" />
              <input aria-label="Street" placeholder="Street" value={l.line1} onChange={(e) => setLoc(i, "line1", e.target.value)} className="h-9 rounded-md border px-3 text-sm" />
              <input aria-label="City, state, ZIP" placeholder="City, State ZIP" value={l.line2} onChange={(e) => setLoc(i, "line2", e.target.value)} className="h-9 rounded-md border px-3 text-sm" />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove location" onClick={() => setC({ ...c, locations: c.locations.filter((_, j) => j !== i) })}>
                <X />
              </Button>
            </div>
          ))}
        </div>
        {c.locations.length < 4 && (
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setC({ ...c, locations: [...c.locations, { name: "", line1: "", line2: "" }] })}>
            <Plus /> Add a location
          </Button>
        )}
        <p className="mt-2 text-xs text-muted-foreground">The first location is the headquarters address in the footer.</p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save contact details"}
      </Button>
    </form>
  )
}

export function RoutingForm({ types, initial, fallback }: { types: readonly string[]; initial: { default: string; byType: Record<string, string> }; fallback: string }) {
  const [r, setR] = useState(initial)
  const [pending, start] = useTransition()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          const res = await saveRouting(r)
          if (res.ok) toast.success("Saved. New inquiries go to these addresses.")
          else toast.error(res.error)
        })
      }}
      className="space-y-4"
    >
      <TextField
        id="route-default"
        label="Everything not listed below"
        hint={`Separate several addresses with commas. Empty: ${fallback}.`}
        value={r.default}
        onChange={(v) => setR({ ...r, default: v })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {types.map((t) => (
          <TextField key={t} id={`route-${t}`} label={t} placeholder="Uses the address above" value={r.byType[t] ?? ""} onChange={(v) => setR({ ...r, byType: { ...r.byType, [t]: v } })} />
        ))}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save routing"}
      </Button>
    </form>
  )
}
