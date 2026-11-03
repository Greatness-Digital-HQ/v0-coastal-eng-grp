// Metadata source for the two detail-page templates and the sitemap.
//
// Projects and articles come from the dashboard (lib/content.ts). The lists
// below are the fallback for when the database can't be reached, and mirror
// the built-in copies in /public/ceg/data.jsx and /public/ceg/news-data.jsx.
//
// ⚠ PROVENANCE: the client-named projects and dated announcements below were
// authored during the original v0 prototype build and have NOT been confirmed
// against Coastal's project record. Every client name, quantity, and award
// claim must be verified — or the entry removed — before production launch.
// See the Final Verification Gate in the client edit package.

import { getSiteContent } from "@/lib/content"

export type DetailSeo = { slug: string; title: string; description: string; metaTitle?: string; image?: string }

export const PROJECT_SEO: DetailSeo[] = [
  { slug: "railroad-bridge-inspection", title: "Railroad Bridge Inspection Over Open Water", description: "Underwater inspection of timber pile substructure on active overwater railroad bridge crossing." },
  { slug: "freshwater-utility-cable-relocation", title: "Freshwater Utility Cable Relocation", description: "Underwater installation and relocation of 3 miles of high-voltage transmission cable across Conowingo Lake." },
  { slug: "port-of-baltimore-water-tank-repair", title: "Port of Baltimore Water Tank Repair", description: "In-tank commercial dive operation for internal coating inspection, structural assessment, and weld repairs on a 1.5 million gallon elevated storage tank." },
  { slug: "delaware-river-bridge-inspection", title: "Delaware River Bridge Inspection", description: "Underwater inspection of substructure across four crossings." },
  { slug: "atlantic-shores-offshore-wind", title: "Atlantic Shores Offshore Wind", description: "Tug and barge support for cable lay vessel mobilization." },
  { slug: "port-newark-container-terminal", title: "Port Newark Container Terminal", description: "Condition assessment and rehabilitation design for 2,400 LF of wharf." },
  { slug: "mayport-naval-station-wharf-repair", title: "Mayport Naval Station Wharf Repair", description: "Underwater pile inspection and concrete jacket repair on active wharf." },
  { slug: "greenwood-lake-dam-rehabilitation", title: "Greenwood Lake Dam Rehabilitation", description: "Spillway redesign and embankment stabilization for aging dam structure." },
]

export const NEWS_SEO: DetailSeo[] = [
  { slug: "navfac-macc-award-2025", title: "Coastal Engineering Group Awarded NAVFAC Mid-Atlantic MACC Task Order", description: "Coastal Engineering Group has been awarded a NAVFAC Mid-Atlantic Multiple Award Construction Contract task order for waterfront rehabilitation at a Mid-Atlantic naval installation. Work begins Q3 2025." },
  { slug: "jacksonville-office-expansion", title: "CEG Opens Jacksonville Operations Hub to Support Southeast Growth", description: "Coastal Engineering Group has established a permanent operations base in Jacksonville, Florida, positioning the company to better serve NAVFAC Southeast, port authorities, and commercial clients across the Gulf Coast and Southeast Atlantic." },
  { slug: "pe-led-diving-roi", title: "Why PE-Led Diving Changes the ROI on Underwater Infrastructure Inspection", description: "When a Professional Engineer leads the dive rather than reviewing footage afterward, inspection cycles get shorter, repair decisions get faster, and mobilization costs drop. Here's how the math works." },
  { slug: "greenwood-lake-dam-complete", title: "Greenwood Lake Dam Rehabilitation Design Delivered, Construction Procurement Underway", description: "CEG has completed the spillway redesign and embankment stabilization design package for the Greenwood Lake Dam, with NYSDEC permits in hand and the Greenwood Lake Commission moving toward construction procurement." },
  { slug: "atlantic-shores-mobilization", title: "CEG Marine Services Supports Atlantic Shores Offshore Wind Cable Lay Operations", description: "CEG's marine services division is providing tug and deck barge support for Atlantic Shores Offshore Wind cable lay vessel operations off the New Jersey coast, supporting one of the region's largest offshore wind development projects." },
  { slug: "csx-bridge-inspection-complete", title: "Railroad Bridge Inspection for CSX Delivered with Zero Rail Service Disruption", description: "CEG completed a full structural underwater inspection of a CSX overwater railroad bridge in New York, delivering a PE-stamped condition report in 10 business days with no interruption to daily freight operations." },
]

export async function projectSeo(): Promise<DetailSeo[]> {
  const c = await getSiteContent()
  return c
    ? c.projects.map((p) => ({ slug: p.slug, title: p.title, description: p.seoDescription || p.blurb, metaTitle: p.seoTitle || undefined, image: p.image || undefined }))
    : PROJECT_SEO
}

export async function newsSeo(): Promise<DetailSeo[]> {
  const c = await getSiteContent()
  return c
    ? c.news.map((a) => ({ slug: a.slug, title: a.title, description: a.seoDescription || a.excerpt, metaTitle: a.seoTitle || undefined, image: a.image || undefined }))
    : NEWS_SEO
}

export async function findProject(slug: string): Promise<DetailSeo | undefined> {
  return (await projectSeo()).find((p) => p.slug === slug)
}

export async function findArticle(slug: string): Promise<DetailSeo | undefined> {
  return (await newsSeo()).find((n) => n.slug === slug)
}
