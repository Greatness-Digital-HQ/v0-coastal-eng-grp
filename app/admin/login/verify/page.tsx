import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { peekLoginToken } from "@/lib/auth"
import { confirmLink } from "../actions"
import { AuthCard } from "../auth-card"

export const metadata: Metadata = { title: "Sign in" }

// Opening the link only shows this page; the button spends the token. Mail
// scanners that open every link therefore can't use it up.
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams
  const link = await peekLoginToken(token)

  if (!link) {
    return (
      <AuthCard title="Link expired">
        <p className="mb-4 text-sm text-muted-foreground">This sign-in link has expired or was already used.</p>
        <Button asChild className="w-full">
          <Link href="/admin/login">Get a new link</Link>
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Sign in">
      <p className="mb-4 text-sm text-muted-foreground">
        Signing in as <strong className="text-foreground">{link.email}</strong>.
      </p>
      <form action={confirmLink}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit" className="w-full">
          Sign in to the dashboard
        </Button>
      </form>
    </AuthCard>
  )
}
