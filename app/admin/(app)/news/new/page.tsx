import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { requireUser } from "@/lib/auth"
import { PageHeader } from "../../ui"
import { ArticleEditor } from "../editor"

export const metadata: Metadata = { title: "New article" }

export default async function NewArticlePage() {
  await requireUser()
  return (
    <>
      <Link href="/admin/news" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All articles
      </Link>
      <PageHeader title="New article" />
      <ArticleEditor
        id={null}
        initial={{
          title: "",
          slug: "",
          publishedOn: new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }),
          category: "News",
          author: "CEG Communications",
          excerpt: "",
          image: "",
          imageAlt: "",
          seoTitle: "",
          seoDescription: "",
          body: [],
          tags: [],
          status: "draft",
          needsReview: false,
        }}
      />
    </>
  )
}
