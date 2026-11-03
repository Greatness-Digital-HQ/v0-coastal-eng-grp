import type { Metadata } from "next"
import { eq } from "drizzle-orm"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import type { SiteContact } from "@/lib/content"
import { getRouting, INQUIRY_TYPES } from "@/lib/inquiries"
import { mailTransport } from "@/lib/mail"
import { PageHeader, Panel } from "../ui"
import { ContactForm, RoutingForm } from "./forms"

export const metadata: Metadata = { title: "Site info" }

export default async function SettingsPage() {
  const me = await requireUser()
  const [row] = await db().select().from(schema.settings).where(eq(schema.settings.key, "contact"))
  const contact = (row?.value as SiteContact | undefined) ?? { phone: "", email: "", linkedin: "", locations: [] }
  const routing = await getRouting()

  return (
    <>
      <PageHeader title="Site info" description="Contact details shown across the website, and where inquiries are emailed." />
      <div className="space-y-6">
        <Panel title="Contact details">
          <ContactForm initial={{ ...contact, linkedin: contact.linkedin ?? "", locations: contact.locations.length ? contact.locations : [{ name: "", line1: "", line2: "" }] }} />
        </Panel>
        {me.role === "owner" ? (
          <Panel title="Inquiry routing">
            <p className="mb-4 text-sm text-muted-foreground">
              Who is emailed when someone picks each answer to “What can we help with?” on the Contact page. The short form on other pages uses the first address.
              {mailTransport() === "off" && " Email is not set up on this deployment yet, so nothing is sent for now."}
            </p>
            <RoutingForm
              types={INQUIRY_TYPES}
              fallback="the dashboard owners"
              initial={{ default: routing.default.join(", "), byType: Object.fromEntries(Object.entries(routing.byType).map(([k, v]) => [k, v.join(", ")])) }}
            />
          </Panel>
        ) : (
          <p className="text-sm text-muted-foreground">Inquiry routing is managed by the dashboard owners.</p>
        )}
      </div>
    </>
  )
}
