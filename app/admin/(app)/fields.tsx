"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { controlCls } from "./control"

// Form controls shared by the dashboard editors. Photo controls: photo-fields.tsx.
export { GalleryField, ImageField } from "./photo-fields"

const inputCls = cn(controlCls, "w-full py-2")

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

/** Search-result title and description, with a preview of how Google shows them. */
export function SeoFields({
  title,
  description,
  onTitle,
  onDescription,
  fallbackTitle,
  fallbackDescription,
  path,
}: {
  title: string
  description: string
  onTitle: (v: string) => void
  onDescription: (v: string) => void
  fallbackTitle: string
  fallbackDescription: string
  path: string
}) {
  return (
    <div className="space-y-4">
      <TextField id="seo-title" label="Search title" max={70} value={title} onChange={onTitle} placeholder={fallbackTitle} hint="Leave empty to use the title. About 50–60 characters show in full." />
      <TextArea
        id="seo-desc"
        label="Search description"
        max={170}
        rows={3}
        value={description}
        onChange={onDescription}
        placeholder={fallbackDescription}
        hint="Leave empty to use the summary. About 150 characters show in full."
      />
      <div className="rounded-lg border bg-white p-4">
        <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">How it may look in Google</p>
        <p className="truncate text-xs text-slate-600">coastalengineeringgroup.com{path}</p>
        <p className="mt-0.5 line-clamp-1 text-lg leading-snug text-[#1a0dab]">{title || fallbackTitle || "Page title"}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{description || fallbackDescription || "Add a summary or a search description."}</p>
      </div>
    </div>
  )
}
