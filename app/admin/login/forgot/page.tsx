import type { Metadata } from "next"
import { AuthCard } from "../auth-card"
import { ForgotForm } from "../password-forms"

export const metadata: Metadata = { title: "Forgot password" }

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot password">
      <ForgotForm />
    </AuthCard>
  )
}
