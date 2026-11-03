"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestLink, type LoginState } from "./actions"

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(requestLink, { status: "idle" })

  if (state.status === "sent") {
    return (
      <div className="space-y-3 text-sm">
        <p>
          If <strong>{state.email}</strong> has access, a sign-in link is on its way. It works once and expires in 15
          minutes.
        </p>
        <p className="text-muted-foreground">Nothing after a few minutes? Check spam, or ask the dashboard owner to add you.</p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-muted-foreground">Enter your work email and we will send you a sign-in link.</p>
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.email} autoFocus />
      </div>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  )
}
