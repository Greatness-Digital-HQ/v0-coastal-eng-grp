import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { requireUser } from "@/lib/auth"
import { PageHeader } from "../../ui"
import { LeaderEditor } from "../editor"

export const metadata: Metadata = { title: "Add a leader" }

export default async function NewLeaderPage() {
  await requireUser()
  return (
    <>
      <Link href="/admin/leadership" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Leadership
      </Link>
      <PageHeader title="Add a leader" />
      <LeaderEditor id={null} initial={{ name: "", title: "", bio: "", responsibility: "", image: "", status: "draft" }} />
    </>
  )
}
