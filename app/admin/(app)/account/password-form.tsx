"use client"

import { useActionState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changePassword, type AccountState } from "./actions"

export function PasswordForm({ email, hasPassword }: { email: string; hasPassword: boolean }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(changePassword, {})
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state.ok) {
      toast.success("Password saved. Other devices have been signed out.")
      ref.current?.reset()
    }
  }, [state])

  return (
    <form ref={ref} action={action} className="max-w-sm space-y-4">
      <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
      {hasPassword && (
        <div className="space-y-2">
          <Label htmlFor="current">Current password</Label>
          <Input id="current" name="current" type="password" autoComplete="current-password" required />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required />
        <p className="text-xs text-muted-foreground">At least 10 characters.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Type it again</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : hasPassword ? "Change password" : "Set password"}
      </Button>
    </form>
  )
}
