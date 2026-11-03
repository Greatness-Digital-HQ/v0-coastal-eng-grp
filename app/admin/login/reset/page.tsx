import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { peekToken } from "@/lib/auth"
import { AuthCard } from "../auth-card"
import { ResetForm } from "../password-forms"

export const metadata: Metadata = { title: "Choose a new password" }

// Like the sign-in link, opening the reset link only shows this form; the
// token is spent when the new password is submitted.
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams
  const link = await peekToken(token, "reset")

  if (!link) {
    return (
      <AuthCard title="Link expired">
        <p className="mb-4 text-sm text-muted-foreground">This password reset link has expired or was already used.</p>
        <Button asChild className="w-full">
          <Link href="/admin/login/forgot">Send a new link</Link>
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Choose a new password">
      <p className="mb-4 text-sm text-muted-foreground">
        For <strong className="text-foreground">{link.email}</strong>. You'll be signed out everywhere else.
      </p>
      <ResetForm token={token} email={link.email} />
    </AuthCard>
  )
}
