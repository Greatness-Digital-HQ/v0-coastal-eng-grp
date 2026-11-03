"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Panel } from "./ui"

type Props = {
  status: "draft" | "published"
  pending: boolean
  dirty: boolean
  error: string
  onSave: (status: "draft" | "published") => void
  /** Extra controls under the buttons, e.g. the Needs review checkbox. */
  children?: React.ReactNode
}

function statusLine(status: Props["status"], dirty: boolean) {
  if (dirty) return status === "published" ? "Unsaved changes. The website shows the last saved version." : "Unsaved changes."
  return status === "published" ? "Live on the website. Saving updates it within seconds." : "Draft: only visible here in the dashboard."
}

function Buttons({ status, pending, onSave, compact }: Pick<Props, "status" | "pending" | "onSave"> & { compact?: boolean }) {
  const live = status === "published"
  return (
    <>
      <Button type="button" disabled={pending} onClick={() => onSave("published")} className={compact ? "flex-1" : undefined}>
        {pending && <Loader2 className="animate-spin" aria-hidden />}
        {live ? "Save changes" : "Publish"}
      </Button>
      <Button type="button" variant="outline" disabled={pending} onClick={() => onSave("draft")} className={compact ? "flex-1" : undefined}>
        {live ? "Unpublish" : "Save draft"}
      </Button>
    </>
  )
}

/**
 * The Publish panel beside every editor on wide screens, and a bar pinned to
 * the bottom of the screen on phones and tablets so saving never means
 * scrolling to the end of a long form.
 */
export function EditorActions(props: Props) {
  const { status, dirty, error, children } = props
  return (
    <>
      <aside className="hidden space-y-4 xl:sticky xl:top-8 xl:block xl:self-start">
        <Panel title="Publish">
          <p className={cn("mb-4 text-sm", dirty ? "font-medium text-amber-800" : "text-muted-foreground")} aria-live="polite">
            {statusLine(status, dirty)}
          </p>
          {error && (
            <p role="alert" className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Buttons {...props} />
          </div>
          {children}
        </Panel>
      </aside>

      {/* Phones and tablets */}
      <div className="xl:hidden">{children && <div className="rounded-xl border bg-white px-5 pb-4">{children}</div>}</div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgb(10_37_64/0.08)] backdrop-blur xl:hidden">
        {error && (
          <p role="alert" className="mb-2 text-sm text-rose-800">
            {error}
          </p>
        )}
        <p className={cn("mb-2 text-xs", dirty ? "font-medium text-amber-800" : "text-muted-foreground")}>{statusLine(status, dirty)}</p>
        <div className="flex gap-2">
          <Buttons {...props} compact />
        </div>
      </div>
    </>
  )
}
