"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { NEWS_CATEGORIES, slugify } from "@/lib/taxonomy"
import { ImageField, ParagraphsField, SelectField, TextArea, TextField } from "../fields"
import { Panel } from "../ui"
import { saveArticle, type ArticleInput } from "./actions"

export function ArticleEditor({ id, initial }: { id: string | null; initial: ArticleInput }) {
  const [a, setA] = useState(initial)
  const [tags, setTags] = useState(initial.tags.join(", "))
  const [slugTouched, setSlugTouched] = useState(Boolean(id))
  const [pending, start] = useTransition()
  const [error, setError] = useState("")
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
      toast.success(status === "published" ? (initial.status === "published" ? "Saved. The website is updated." : "Published. It's live on the website.") : "Saved as a draft. It's not on the website.")
      if (!id) router.replace(`/admin/news/${res.id}`)
      else router.refresh()
    })
  }

  return (
    <form onSubmit={(e) => (e.preventDefault(), save(a.status))} className="grid gap-6 xl:grid-cols-[1fr_300px]">
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
              <input id="date" type="date" required value={a.publishedOn} onChange={(e) => set("publishedOn", e.target.value)} className="h-9 w-full rounded-md border bg-white px-3 text-sm" />
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

      <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
        <Panel title="Publish">
          <p className="mb-4 text-sm text-muted-foreground">{a.status === "published" ? "Live on the website. Saving updates it within seconds." : "Draft: only visible here in the dashboard."}</p>
          {error && (
            <p role="alert" className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Button type="button" disabled={pending} onClick={() => save("published")}>
              {pending ? "Saving…" : a.status === "published" ? "Save changes" : "Publish"}
            </Button>
            <Button type="button" variant="outline" disabled={pending} onClick={() => save("draft")}>
              {a.status === "published" ? "Unpublish" : "Save draft"}
            </Button>
          </div>
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5 size-4" checked={a.needsReview} onChange={(e) => set("needsReview", e.target.checked)} />
            <span>
              Needs review
              <span className="block text-xs text-muted-foreground">A reminder for your team only.</span>
            </span>
          </label>
        </Panel>
      </aside>
    </form>
  )
}
