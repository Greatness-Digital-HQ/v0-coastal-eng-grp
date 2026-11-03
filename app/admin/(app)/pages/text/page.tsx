import type { Metadata } from "next"
import Link from "next/link"
import { eq } from "drizzle-orm"
import { ArrowLeft } from "lucide-react"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { PAGE_TEXT_DEFAULTS, withDefaults } from "@/lib/page-text"
import { formatDate, PageHeader } from "../../ui"
import { PageTextForm } from "./form"

export const metadata: Metadata = { title: "Page text" }

export default async function PageTextPage() {
  await requireUser()
  const [row] = await db().select().from(schema.settings).where(eq(schema.settings.key, "page_text"))
  return (
    <>
      <Link href="/admin/pages" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Pages
      </Link>
      <PageHeader
        title="Page text"
        description={
          row
            ? `The words on the homepage, Careers page and company facts. Last saved ${formatDate(row.updatedAt, true)}${row.updatedBy ? ` by ${row.updatedBy}` : ""}.`
            : "The words on the homepage, Careers page and company facts. Nothing has been changed yet; the site shows its original text."
        }
      />
      <PageTextForm initial={withDefaults(row?.value)} defaults={PAGE_TEXT_DEFAULTS} />
    </>
  )
}
