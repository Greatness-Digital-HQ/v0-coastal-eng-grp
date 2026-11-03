"use client"

import { useEffect, useRef, useState } from "react"
import { uploadPresigned } from "@vercel/blob/client"
import { ImagePlus, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { finishUpload } from "./media-actions"

// Form controls shared by the dashboard editors.

const inputCls =
  "w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:opacity-60"

type Base = { label: string; hint?: string; required?: boolean; className?: string; id: string }

function Wrap({ label, hint, required, className, id, children, count }: Base & { children: React.ReactNode; count?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-rose-600"> *</span>}
        </label>
        {count && <span className="text-xs tabular-nums text-muted-foreground">{count}</span>}
      </div>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function TextField({ value, onChange, max, placeholder, ...base }: Base & { value: string; onChange: (v: string) => void; max?: number; placeholder?: string }) {
  return (
    <Wrap {...base} count={max && value.length > max * 0.8 ? `${value.length}/${max}` : undefined}>
      <input id={base.id} className={inputCls} value={value} maxLength={max} placeholder={placeholder} required={base.required} onChange={(e) => onChange(e.target.value)} />
    </Wrap>
  )
}

export function TextArea({ value, onChange, max, rows = 4, placeholder, ...base }: Base & { value: string; onChange: (v: string) => void; max?: number; rows?: number; placeholder?: string }) {
  return (
    <Wrap {...base} count={max && value.length > max * 0.8 ? `${value.length}/${max}` : undefined}>
      <textarea id={base.id} className={cn(inputCls, "leading-relaxed")} rows={rows} value={value} maxLength={max} placeholder={placeholder} required={base.required} onChange={(e) => onChange(e.target.value)} />
    </Wrap>
  )
}

export function SelectField({ value, onChange, options, ...base }: Base & { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Wrap {...base}>
      <select id={base.id} className={cn(inputCls, "h-9 py-0")} value={value} required={base.required} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrap>
  )
}

/** A list of short strings edited as one line each. */
export function LinesField({ value, onChange, ...base }: Base & { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(value.join("\n"))
  return (
    <Wrap {...base}>
      <textarea
        id={base.id}
        className={inputCls}
        rows={Math.max(3, Math.min(10, value.length + 1))}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          onChange(e.target.value.split("\n").map((l) => l.trim()).filter(Boolean))
        }}
      />
    </Wrap>
  )
}

/** Long text split into paragraphs at blank lines. */
export function ParagraphsField({ value, onChange, ...base }: Base & { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(value.join("\n\n"))
  return (
    <Wrap {...base}>
      <textarea
        id={base.id}
        className={cn(inputCls, "leading-relaxed")}
        rows={14}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          onChange(e.target.value.split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, " ").trim()).filter(Boolean))
        }}
      />
    </Wrap>
  )
}

export function CheckboxGroup({ value, onChange, options, ...base }: Base & { value: string[]; onChange: (v: string[]) => void; options: { value: string; label: string }[] }) {
  return (
    <fieldset className={cn("space-y-1.5", base.className)}>
      <legend className="mb-1.5 text-sm font-medium">
        {base.label}
        {base.required && <span className="text-rose-600"> *</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value)
          return (
            <label key={o.value} className={cn("flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm", on ? "border-primary bg-primary/5" : "bg-white")}>
              <input type="checkbox" className="size-4" checked={on} onChange={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])} />
              {o.label}
            </label>
          )
        })}
      </div>
      {base.hint && <p className="text-xs text-muted-foreground">{base.hint}</p>}
    </fieldset>
  )
}

/** Photo picker: uploads, optimizes and previews. `value` is the stored URL. */
export function ImageField({ value, onChange, kind, ...base }: Base & { value: string; onChange: (v: string) => void; kind: "project" | "news" | "leader" }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"blob" | "local" | null>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/admin/api/upload")
      .then((r) => r.json())
      .then((b) => setMode(b.mode ?? "blob"))
      .catch(() => setMode("blob"))
  }, [])

  async function pick(file: File) {
    setError("")
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("Upload a JPG, PNG or WebP photo.")
    if (file.size > 25 * 1024 * 1024) return setError("Photos can be up to 25 MB.")
    try {
      if (mode === "local") {
        setBusy("Uploading…")
        const fd = new FormData()
        fd.set("file", file)
        fd.set("kind", kind)
        const res = await fetch("/admin/api/upload/local", { method: "POST", body: fd })
        const body = await res.json()
        if (!res.ok) throw new Error(body.error)
        onChange(body.url)
      } else {
        setBusy("Uploading 0%")
        const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-")
        const blob = await uploadPresigned(`incoming/${safe}`, file, {
          access: "public",
          handleUploadUrl: "/admin/api/upload",
          contentType: file.type,
          onUploadProgress: (p) => setBusy(`Uploading ${Math.round(p.percentage)}%`),
        })
        setBusy("Optimizing…")
        const done = await finishUpload(blob.url, kind)
        if ("error" in done) throw new Error(done.error)
        onChange(done.url)
      }
    } catch (e) {
      setError((e as Error).message || "The upload failed. Please try again.")
    } finally {
      setBusy(null)
      if (input.current) input.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-1.5", base.className)}>
      <p className="text-sm font-medium">
        {base.label}
        {base.required && <span className="text-rose-600"> *</span>}
      </p>
      <div className="flex flex-wrap items-start gap-4">
        <div className={cn("relative flex aspect-[4/3] w-56 items-center justify-center overflow-hidden rounded-lg border bg-slate-50", kind === "leader" && "aspect-square w-40")}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-8 text-slate-300" aria-hidden />
          )}
          {busy && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 text-sm font-medium">
              <Loader2 className="size-5 animate-spin" aria-hidden />
              {busy}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <input ref={input} id={base.id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
          <Button type="button" variant="outline" size="sm" disabled={!!busy || !mode} onClick={() => input.current?.click()}>
            <ImagePlus /> {value ? "Replace photo" : "Upload photo"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" disabled={!!busy} onClick={() => onChange("")}>
              <X /> Remove
            </Button>
          )}
          <p className="max-w-56 text-xs text-muted-foreground">{base.hint ?? "JPG, PNG or WebP up to 25 MB. Resized and compressed automatically, with no visible quality loss."}</p>
          {error && (
            <p role="alert" className="max-w-64 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
