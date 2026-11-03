"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { NEWS_CATEGORIES, slugify } from "@/lib/taxonomy"
import { ImageField, ParagraphsField, SelectField, TextArea, TextField } from "../fields"
import { cn } from "@/lib/utils"
import { controlCls } from "../control"
import { EditorActions } from "../editor-actions"
import { Panel } from "../ui"
import { useUnsavedGuard } from "../unsaved"
import { saveArticle, type ArticleInput } from "./actions"

export function ArticleEditor({ id, initial }: { id: string | null; initial: ArticleInput }) {
  const [a, setA] = useState(initial)
  const [tags, setTags] = useState(initial.tags.join(", "))
  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [pending, start] = useTransition()
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(() => JSON.stringify([initial, initial.tags.join(", ")]))
  const dirty = JSON.stringify([a, tags]) !== saved
  useUnsavedGuard(dirty)
  const router = useRouter()
  const set = <K extends keyof ArticleInput>(k: K, v: ArticleInput[K]) => setA((prev) => ({ ...prev, [k]: v }))

  function save(status: "draft" | "published") {
    setError("")
    start(async () => {
      const res = await saveArticle(id, { ...a, status, tags: tags.split(",").map((t) => t.trim()).filter(Boolean) })
      if (!res.ok) {
        setError(res.error)
        toast.error(res.error)
        return
      }
      set("status", status)
      setSaved(JSON.stringify([{ ...a, status }, tags]))
      toast.success(status === "published" ? (initial.status === "published" ? "Saved. The website is updated." : "Published. It's live on the website.") : "Saved as a draft. It's not on the website.")
      if (!id) router.replace(`/admin/news/${res.id}`)
      else router.refresh()
    })
  }

  return (
    <form onSubmit={(e) => (e.preventDefault(), save(a.status))} className="grid gap-6 pb-32 xl:grid-cols-[1fr_300px] xl:pb-0">
      <div className="min-w-0 space-y-6">
        <Panel title="Article">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="title"
              label="Headline"
              required
              max={160}
              className="sm:col-span-2"
              value={a.title}
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
              hint={`Page address: /insights/news/${a.slug || "…"}`}
              value={a.slug}
              onChange={(v) => {
                setSlugTouched(true)
                set("slug", slugify(v))
              }}
            />
            <div className="space-y-1.5">
              <label htmlFor="date" className="text-sm font-medium">
                Date<span className="text-rose-600"> *</span>
              </label>
              <input id="date" type="date" required value={a.publishedOn} onChange={(e) => set("publishedOn", e.target.value)} className={cn(controlCls, "h-9 w-full")} />
            </div>
            <SelectField id="category" label="Category" required value={a.category} onChange={(v) => set("category", v as ArticleInput["category"])} options={NEWS_CATEGORIES.map((c) => ({ value: c, label: c }))} />
            <TextField id="author" label="Author" max={80} value={a.author} onChange={(v) => set("author", v)} placeholder="e.g. CEG Communications" />
            <TextField id="tags" label="Tags" value={tags} onChange={setTags} hint="Separate with commas." />
            <TextArea id="excerpt" label="Summary" required max={500} rows={3} className="sm:col-span-2" hint="Shown on the newsroom cards and in search results." value={a.excerpt} onChange={(v) => set("excerpt", v)} />
          </div>
        </Panel>
        <Panel title="Cover photo">
          <ImageField id="image" label="Cover photo" kind="news" required value={a.image} onChange={(v) => set("image", v)} />
        </Panel>
        <Panel title="Body">
          <ParagraphsField id="body" label="Article text" hint="Leave a blank line between paragraphs." value={a.body} onChange={(v) => set("body", v)} />
        </Panel>
      </div>

      <EditorActions status={a.status} pending={pending} dirty={dirty} error={error} onSave={save}>
        <label className="mt-4 flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-0.5 size-4" checked={a.needsReview} onChange={(e) => set("needsReview", e.target.checked)} />
          <span>
            Needs review
            <span className="block text-xs text-muted-foreground">A reminder for your team only.</span>
          </span>
        </label>
      </EditorActions>
    </form>
  )
}
