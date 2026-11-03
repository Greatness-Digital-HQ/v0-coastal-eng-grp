"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestLink, signInWithPassword, type LoginState } from "./actions"

function ErrorLine({ state }: { state: LoginState }) {
  return state.status === "error" ? (
    <p role="alert" className="text-sm text-destructive">
      {state.message}
    </p>
  ) : null
}

/** The main sign-in: email and password. */
export function PasswordForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signInWithPassword, { status: "idle" })
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} autoFocus />
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/admin/login/forgot" className="text-xs text-sky-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <ErrorLine state={state} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        No password yet?{" "}
        <Link href={`/admin/login?mode=link${next ? `&next=${encodeURIComponent(next)}` : ""}`} className="text-sky-700 hover:underline">
          Email me a sign-in link
        </Link>
      </p>
    </form>
  )
}

/** Sign-in by emailed link. */
export function LinkForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(requestLink, { status: "idle" })

  if (state.status === "sent") {
    return (
      <div className="space-y-3 text-sm">
        <p>
          If <strong>{state.email}</strong> has access, a sign-in link is on its way. It works once and expires in 15 minutes.
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
      <ErrorLine state={state} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
      <p className="text-center text-xs">
        <Link href="/admin/login" className="text-sky-700 hover:underline">
          Sign in with a password instead
        </Link>
      </p>
    </form>
  )
}
