"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ImageField, TextArea, TextField } from "../fields"
import { EditorActions } from "../editor-actions"
import { Panel } from "../ui"
import { useUnsavedGuard } from "../unsaved"
import { saveLeader, type LeaderInput } from "./actions"

export function LeaderEditor({ id, initial }: { id: string | null; initial: LeaderInput }) {
  const [l, setL] = useState(initial)
  const [pending, start] = useTransition()
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(() => JSON.stringify(initial))
  const dirty = JSON.stringify(l) !== saved
  useUnsavedGuard(dirty)
  const router = useRouter()
  const set = <K extends keyof LeaderInput>(k: K, v: LeaderInput[K]) => setL((prev) => ({ ...prev, [k]: v }))

  function save(status: "draft" | "published") {
    setError("")
    start(async () => {
      const res = await saveLeader(id, { ...l, status })
      if (!res.ok) {
        setError(res.error)
        toast.error(res.error)
        return
      }
      set("status", status)
      setSaved(JSON.stringify({ ...l, status }))
      toast.success(status === "published" ? "Saved. It's on the Leadership page." : "Saved as a draft. It's not on the website.")
      if (!id) router.replace(`/admin/leadership/${res.id}`)
      else router.refresh()
    })
  }

  return (
    <form onSubmit={(e) => (e.preventDefault(), save(l.status))} className="grid gap-6 pb-32 xl:grid-cols-[1fr_300px] xl:pb-0">
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="name" label="Name and credentials" required max={100} value={l.name} onChange={(v) => set("name", v)} placeholder="e.g. Jane Smith, P.E." />
          <TextField id="title" label="Title" required max={120} value={l.title} onChange={(v) => set("title", v)} placeholder="e.g. Chief Operating Officer" />
          <TextArea id="bio" label="Bio" required max={2000} rows={6} className="sm:col-span-2" value={l.bio} onChange={(v) => set("bio", v)} />
          <TextArea id="resp" label="Area of responsibility" max={600} rows={2} className="sm:col-span-2" value={l.responsibility} onChange={(v) => set("responsibility", v)} />
          <ImageField id="photo" label="Headshot" kind="leader" className="sm:col-span-2" hint="Optional. A square photo works best." value={l.image} onChange={(v) => set("image", v)} />
        </div>
      </Panel>
      <EditorActions status={l.status} pending={pending} dirty={dirty} error={error} onSave={save} />
    </form>
  )
}
