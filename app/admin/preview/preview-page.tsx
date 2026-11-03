import { ArrowLeft, Eye } from "lucide-react"
import CegPage from "@/app/CegPage"
import type { SiteContent } from "@/lib/content"

// Renders a website page from inside the dashboard, with draft content
// swapped in, so editors see exactly what publishing would show. It uses the
// site's own stylesheets and scripts; only the data differs. The banner forces
// its link colour because the site's stylesheet styles every <a>.

const EMPTY: SiteContent = { projects: [], news: [], openRoles: [], leaders: [], contact: null }

export function PreviewPage({
  content,
  app,
  extraData,
  editHref,
  status,
}: {
  content: SiteContent | null
  app: string
  extraData?: string[]
  editHref: string
  status: "draft" | "published"
}) {
  return (
    <>
      <link rel="stylesheet" href="/ceg/styles.css" precedence="default" />
      <link rel="stylesheet" href="/ceg/drydock-body.css" precedence="default" />
      <script id="ceg-content" type="application/json" dangerouslySetInnerHTML={{ __html: JSON.stringify(content ?? EMPTY).replace(/</g, "\\u003c") }} />
      <div
        role="status"
        className="fixed inset-x-0 bottom-0 z-[1000] flex flex-wrap items-center justify-between gap-3 bg-[#0a2540] px-4 py-3 font-sans text-sm text-white shadow-[0_-4px_20px_rgb(0_0_0/0.25)] sm:px-6"
      >
        <span className="flex items-center gap-2">
          <Eye className="size-4 text-sky-300" aria-hidden />
          <strong className="font-semibold">Preview</strong>
          <span className="text-sky-100/80">
            {status === "draft" ? "of a draft. It is not on the website until you publish it." : "of the last saved version."}
          </span>
        </span>
        <a href={editHref} className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 font-medium !text-[#0a2540] !no-underline hover:bg-sky-50">
          <ArrowLeft className="size-4" aria-hidden /> Back to the editor
        </a>
      </div>
      <CegPage app={app} label="Preview" extraData={extraData} useSlug />
    </>
  )
}
