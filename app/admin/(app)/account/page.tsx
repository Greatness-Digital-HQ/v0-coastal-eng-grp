import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { requireUser } from "@/lib/auth"
import { formatDate, PageHeader, Panel } from "../ui"
import { cn } from "@/lib/utils"
import { controlCls } from "../control"
import { saveName } from "./actions"
import { PasswordForm } from "./password-form"

export const metadata: Metadata = { title: "My account" }

export default async function AccountPage() {
  const me = await requireUser()
  return (
    <>
      <PageHeader title="My account" description={`${me.email} · ${me.role === "owner" ? "Owner" : "Editor"}`} />
      <div className="space-y-6">
        <Panel title="Name">
          <form key={me.name} action={saveName} className="flex max-w-md gap-2">
            <input name="name" defaultValue={me.name} placeholder="Your name" aria-label="Your name" maxLength={120} className={cn(controlCls, "h-9 flex-1")} />
            <Button type="submit" variant="outline">
              Save
            </Button>
          </form>
        </Panel>
        <Panel title="Password">
          <p className="mb-4 text-sm text-muted-foreground">
            {me.passwordHash
              ? `Last changed ${me.passwordChangedAt ? formatDate(me.passwordChangedAt, true) : "earlier"}.`
              : "You don't have a password yet. Set one to sign in with your email and password."}
          </p>
          <PasswordForm email={me.email} hasPassword={Boolean(me.passwordHash)} />
        </Panel>
      </div>
    </>
  )
}
