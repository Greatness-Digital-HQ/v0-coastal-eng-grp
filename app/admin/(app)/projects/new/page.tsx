import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { requireUser } from "@/lib/auth"
import { PageHeader } from "../../ui"
import { EMPTY_PROJECT } from "../defaults"
import { ProjectEditor } from "../editor"

export const metadata: Metadata = { title: "New project" }

export default async function NewProjectPage() {
  await requireUser()
  return (
    <>
      <Link href="/admin/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All projects
      </Link>
      <PageHeader title="New project" />
      <ProjectEditor id={null} initial={EMPTY_PROJECT} />
    </>
  )
}
