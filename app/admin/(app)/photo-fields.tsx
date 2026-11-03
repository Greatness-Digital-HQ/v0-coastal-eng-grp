"use client"

import { useEffect, useRef, useState } from "react"
import { uploadPresigned } from "@vercel/blob/client"
import { ArrowDown, ArrowUp, Check, ImagePlus, Images, Loader2, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { GalleryPhoto } from "@/db/schema"
import { cn } from "@/lib/utils"
import { controlCls } from "./control"
import { finishUpload, listLibrary, type LibraryPhoto } from "./media-actions"

// Photo controls for the editors: single photo, gallery, and the library picker.

type Kind = "project" | "news" | "leader"
type Base = { label: string; hint?: string; required?: boolean; className?: string; id: string }
const TYPES = ["image/jpeg", "image/png", "image/webp"]

let modePromise: Promise<"blob" | "local"> | undefined
function uploadMode() {
  modePromise ??= fetch("/admin/api/upload")
    .then((r) => r.json())
    .then((b) => (b.mode === "local" ? "local" : "blob") as "blob" | "local")
    .catch(() => "blob" as const)
  return modePromise
}

/** Uploads one photo and returns its optimized URL. Throws with a message for the person. */
async function uploadPhoto(file: File, kind: Kind, progress: (msg: string) => void): Promise<string> {
  if (!TYPES.includes(file.type)) throw new Error(`“${file.name}” isn't a JPG, PNG or WebP photo.`)
  if (file.size > 25 * 1024 * 1024) throw new Error(`“${file.name}” is over 25 MB.`)
  if ((await uploadMode()) === "local") {
    progress("Uploading…")
    const fd = new FormData()
    fd.set("file", file)
    fd.set("kind", kind)
    const res = await fetch("/admin/api/upload/local", { method: "POST", body: fd })
    const body = await res.json()
    if (!res.ok) throw new Error(body.error)
    return body.url
  }
  progress("Uploading 0%")
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-")
  const blob = await uploadPresigned(`incoming/${safe}`, file, {
    access: "public",
    handleUploadUrl: "/admin/api/upload",
    contentType: file.type,
    onUploadProgress: (p) => progress(`Uploading ${Math.round(p.percentage)}%`),
  })
  progress("Optimizing…")
  const done = await finishUpload(blob.url, kind)
  if ("error" in done) throw new Error(done.error)
  return done.url
}

/** "From library": every photo uploaded before, newest first. Mounted only while open (see confirm.tsx). */
function LibraryPicker({ onClose, onPick, multiple }: { onClose: () => void; onPick: (urls: string[]) => void; multiple?: boolean }) {
  const [photos, setPhotos] = useState<LibraryPhoto[] | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  useEffect(() => {
    listLibrary()
      .then(setPhotos)
      .catch(() => setPhotos([]))
  }, [])
  const choose = (url: string) => {
    if (!multiple) return onPick([url])
    setPicked((p) => (p.includes(url) ? p.filter((u) => u !== url) : [...p, url]))
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose from the photo library</DialogTitle>
          <DialogDescription>Photos uploaded to the dashboard before. {multiple ? "Pick one or more." : "Pick one."}</DialogDescription>
        </DialogHeader>
        {photos === null ? (
          <p className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Loading photos…
          </p>
        ) : photos.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No photos yet. Photos you upload anywhere in the dashboard appear here.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {photos.map((p) => {
              const on = picked.includes(p.url)
              return (
                <li key={p.url}>
                  <button
                    type="button"
                    onClick={() => choose(p.url)}
                    aria-pressed={multiple ? on : undefined}
                    aria-label={p.name || "Photo"}
                    className={cn(
                      "group relative block aspect-[4/3] w-full overflow-hidden rounded-md bg-slate-100 ring-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      on && "ring-2 ring-primary",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" loading="lazy" className="size-full object-cover transition-transform duration-200 group-hover:scale-105" />
                    {on && (
                      <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="size-4" aria-hidden />
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {multiple && (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" disabled={picked.length === 0} onClick={() => onPick(picked)}>
              Add {picked.length || ""} photo{picked.length === 1 ? "" : "s"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Photo picker: uploads, optimizes and previews, or reuses a library photo. `value` is the stored URL. */
export function ImageField({
  value,
  onChange,
  kind,
  alt,
  onAltChange,
  ...base
}: Base & { value: string; onChange: (v: string) => void; kind: Kind; alt?: string; onAltChange?: (v: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [library, setLibrary] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  async function pick(file: File) {
    setError("")
    try {
      onChange(await uploadPhoto(file, kind, setBusy))
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
        <div className={cn("relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border bg-slate-50 sm:w-56", kind === "leader" && "aspect-square w-40 sm:w-40")}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={alt || ""} className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-8 text-slate-300" aria-hidden />
          )}
          {busy && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 text-sm font-medium" aria-live="polite">
              <Loader2 className="size-5 animate-spin" aria-hidden />
              {busy}
            </div>
          )}
        </div>
        <div className="min-w-[min(100%,16rem)] flex-1 space-y-2">
          <input ref={input} id={base.id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={!!busy} onClick={() => input.current?.click()}>
              <ImagePlus /> {value ? "Replace photo" : "Upload photo"}
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={!!busy} onClick={() => setLibrary(true)}>
              <Images /> From library
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" disabled={!!busy} onClick={() => onChange("")}>
                <X /> Remove
              </Button>
            )}
          </div>
          <p className="max-w-72 text-xs text-muted-foreground">{base.hint ?? "JPG, PNG or WebP up to 25 MB. Resized and compressed automatically, with no visible quality loss."}</p>
          {onAltChange && value && (
            <div className="max-w-md space-y-1 pt-1">
              <label htmlFor={`${base.id}-alt`} className="text-xs font-medium">
                Photo description
              </label>
              <input
                id={`${base.id}-alt`}
                className={cn(controlCls, "h-8 w-full")}
                value={alt ?? ""}
                maxLength={200}
                placeholder="e.g. Diver inspecting a timber pile under a rail bridge"
                onChange={(e) => onAltChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Read aloud to people using screen readers, and used by Google Images.</p>
            </div>
          )}
          {error && (
            <p role="alert" className="max-w-72 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
      {library && (
        <LibraryPicker
          onClose={() => setLibrary(false)}
          onPick={([url]) => {
            onChange(url)
            setLibrary(false)
          }}
        />
      )}
    </div>
  )
}

const GALLERY_MAX = 24

/** Extra photos for a project page: upload several at once, describe, reorder, remove. */
export function GalleryField({ value, onChange, ...base }: Base & { value: GalleryPhoto[]; onChange: (v: GalleryPhoto[]) => void }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [library, setLibrary] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  async function pick(files: FileList) {
    setError("")
    const list = Array.from(files).slice(0, GALLERY_MAX - value.length)
    let current = value
    try {
      for (const [i, f] of list.entries()) {
        const url = await uploadPhoto(f, "project", (m) => setBusy(`Photo ${i + 1} of ${list.length}: ${m}`))
        current = [...current, { url, alt: "" }]
        onChange(current)
      }
    } catch (e) {
      setError((e as Error).message || "An upload failed. Please try again.")
    } finally {
      setBusy(null)
      if (input.current) input.current.value = ""
    }
  }
  const move = (i: number, d: -1 | 1) => {
    const next = [...value]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    onChange(next)
  }

  return (
    <div className={cn("space-y-3", base.className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {base.label}{" "}
          <span className="font-normal text-muted-foreground tabular-nums">
            ({value.length}/{GALLERY_MAX})
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <input ref={input} id={base.id} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.length && pick(e.target.files)} />
          <Button type="button" variant="outline" size="sm" disabled={!!busy || value.length >= GALLERY_MAX} onClick={() => input.current?.click()}>
            <ImagePlus /> Upload photos
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!!busy || value.length >= GALLERY_MAX} onClick={() => setLibrary(true)}>
            <Images /> From library
          </Button>
        </div>
      </div>
      {base.hint && <p className="text-xs text-muted-foreground">{base.hint}</p>}
      {busy && (
        <p className="flex items-center gap-2 text-sm" aria-live="polite">
          <Loader2 className="size-4 animate-spin" aria-hidden /> {busy}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">No extra photos yet. The project page shows only the main photo until you add some.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {value.map((ph, i) => (
            <li key={ph.url} className="flex gap-3 rounded-lg border p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.url} alt="" className="aspect-[4/3] w-28 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  aria-label={`Description of photo ${i + 1}`}
                  className={cn(controlCls, "h-8 w-full")}
                  value={ph.alt}
                  maxLength={200}
                  placeholder="Describe the photo"
                  onChange={(e) => onChange(value.map((p, j) => (j === i ? { ...p, alt: e.target.value } : p)))}
                />
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Move photo ${i + 1} earlier`} disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Move photo ${i + 1} later`} disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                    <ArrowDown />
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove photo ${i + 1}`} className="ml-auto text-rose-700" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {library && (
        <LibraryPicker
          multiple
          onClose={() => setLibrary(false)}
          onPick={(urls) => {
            const have = new Set(value.map((p) => p.url))
            onChange([...value, ...urls.filter((u) => !have.has(u)).map((url) => ({ url, alt: "" }))].slice(0, GALLERY_MAX))
            setLibrary(false)
          }}
        />
      )}
    </div>
  )
}
