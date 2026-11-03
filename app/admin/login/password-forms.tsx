"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { confirmReset, requestReset, type LoginState } from "./actions"

export function ForgotForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(requestReset, { status: "idle" })

  if (state.status === "sent") {
    return (
      <div className="space-y-3 text-sm">
        <p>
          If <strong>{state.email}</strong> has access, a link to choose a new password is on its way. It works once and expires in 30 minutes.
        </p>
        <p>
          <Link href="/admin/login" className="text-sky-700 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <p className="text-sm text-muted-foreground">Enter your work email and we will send you a link to choose a new password.</p>
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
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <p className="text-center text-xs">
        <Link href="/admin/login" className="text-sky-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}

export function ResetForm({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(confirmReset, { status: "idle" })
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {/* Lets password managers save the new password against the right account. */}
      <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required autoFocus />
        <p className="text-xs text-muted-foreground">At least 10 characters.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Type it again</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required />
      </div>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save password and sign in"}
      </Button>
    </form>
  )
}
