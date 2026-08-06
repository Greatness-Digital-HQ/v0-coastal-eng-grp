import type { Metadata } from "next"
import CegPage from "../../CegPage"
import { detailMetadata, breadcrumbJsonLd, PAGE_SEO } from "../../seo"
import { findProject } from "../../content-seo"

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const p = findProject(slug)
  if (!p) return detailMetadata({ title: PAGE_SEO.projects.title, description: PAGE_SEO.projects.description, path: `/projects/${slug}` })
  return detailMetadata({
    title: `${p.title} | Coastal Engineering Group`,
    description: p.description,
    path: `/projects/${p.slug}`,
  })
}

export default async function ProjectDetailPage({ params }: Params) {
  const { slug } = await params
  const p = findProject(slug)
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
