"use client"

import { useActionState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { inviteUser, type UserFormState } from "./actions"

export function InviteForm() {
  const [state, action, pending] = useActionState<UserFormState, FormData>(inviteUser, {})
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state.ok) {
      toast.success(state.message)
      ref.current?.reset()
    }
  }, [state])

  return (
    <form ref={ref} action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="inv-name">Name</Label>
        <Input id="inv-name" name="name" autoComplete="off" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inv-email">Email</Label>
        <Input id="inv-email" name="email" type="email" required autoComplete="off" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inv-role">Role</Label>
        <select id="inv-role" name="role" defaultValue="editor" className="h-9 w-full rounded-md border bg-white px-3 text-sm">
          <option value="editor">Editor: content and inquiries</option>
          <option value="owner">Owner: also manages users</option>
        </select>
      </div>
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input type="checkbox" name="send" defaultChecked className="size-4" />
        Email them a sign-in link now
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {state.error}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add user"}
        </Button>
      </div>
    </form>
  )
}
