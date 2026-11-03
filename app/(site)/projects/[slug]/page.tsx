import type { Metadata } from "next"
import CegPage from "@/app/CegPage"
import { detailMetadata, breadcrumbJsonLd, PAGE_SEO } from "@/app/seo"
import { findProject } from "@/app/content-seo"

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const p = await findProject(slug)
  if (!p) return detailMetadata({ title: PAGE_SEO.projects.title, description: PAGE_SEO.projects.description, path: `/projects/${slug}` })
  return detailMetadata({
    title: p.metaTitle ?? `${p.title} | Coastal Engineering Group`,
    description: p.description,
    path: `/projects/${p.slug}`,
    image: p.image,
  })
}

export default async function ProjectDetailPage({ params }: Params) {
  const { slug } = await params
  const p = await findProject(slug)
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects/featured-work" },
    { name: p?.title ?? "Project", path: `/projects/${slug}` },
  ])
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CegPage app="project-detail-app" label="Project detail page" useSlug />
    </>
  )
}
