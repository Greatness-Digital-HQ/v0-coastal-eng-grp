import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { currentUser, devLoginEnabled } from "@/lib/auth"
import { devLogin } from "./actions"
import { AuthCard } from "./auth-card"
import { LinkForm, PasswordForm } from "./login-form"

export const metadata: Metadata = { title: "Sign in" }

const ERRORS: Record<string, string> = {
  expired: "That sign-in link has expired or was already used. Request a new one below.",
  unknown: "That email has no dashboard access.",
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; mode?: string }> }) {
  if (await currentUser()) redirect("/admin")
  const { next, error, mode } = await searchParams

  return (
    <AuthCard title="Sign in">
      {error && ERRORS[error] && (
        <p role="alert" className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {ERRORS[error]}
        </p>
      )}
      {mode === "link" || error === "expired" ? <LinkForm next={next} /> : <PasswordForm next={next} />}
      {devLoginEnabled() && (
        <form action={devLogin} className="mt-6 space-y-2 border-t pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Local development only</p>
          <input type="hidden" name="next" value={next ?? ""} />
          <input name="email" type="email" placeholder="user email" required className="w-full rounded-md border px-3 py-2 text-sm" />
          <Button type="submit" variant="outline" size="sm" className="w-full">
            Sign in without email
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
