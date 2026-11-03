"use client"

import { useActionState, useEffect, useRef } from "react"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { controlCls } from "../../control"
import { sendReply, type ReplyState } from "../actions"

export function ReplyForm({ id, to, disabledReason }: { id: string; to: string; disabledReason?: string }) {
  const [state, action, pending] = useActionState<ReplyState, FormData>(sendReply, {})
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state.ok) {
      toast.success(`Reply sent to ${to}.`)
      ref.current?.reset()
    }
  }, [state, to])

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <label htmlFor="reply" className="text-sm font-medium">
        Reply to {to}
      </label>
      <textarea
        id="reply"
        name="body"
        rows={6}
        required
        disabled={!!disabledReason}
        placeholder={disabledReason ?? "Write your reply. Your name and Coastal Engineering Group are added at the end, and their answer comes back to your own email."}
        className={cn(controlCls, "w-full py-2 leading-relaxed")}
      />
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending || !!disabledReason}>
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Send />}
        Send reply
      </Button>
    </form>
  )
}
