// Every public page, for the dashboard's Pages list: where it lives and which
// dashboard sections feed it. Site info (phone, email, addresses) also feeds
// every page's header and footer. Keep in step with app/(site) and app/sitemap.ts.

export type Section = "projects" | "news" | "careers" | "leadership" | "settings" | "inquiries" | "text"

export type SitePage = { name: string; path: string; feeds: Section[]; note?: string }

export const PAGE_GROUPS: { title: string; pages: SitePage[] }[] = [
  {
    title: "Main pages",
    pages: [
      { name: "Home", path: "/", feeds: ["text", "projects"], note: "Project photos and the featured project come from Projects." },
      { name: "About", path: "/about", feeds: ["text"], note: "Certifications and clients come from Page text." },
      { name: "Leadership", path: "/leadership", feeds: ["leadership"] },
      { name: "Safety & Quality", path: "/safety-quality", feeds: [] },
      { name: "Careers", path: "/careers", feeds: ["text", "careers"], note: "Apply buttons open your Paylocity job board." },
      { name: "Contact", path: "/contact", feeds: ["settings", "inquiries"], note: "The form's messages arrive in Inquiries." },
    ],
  },
  {
    title: "Services",
    pages: [
      { name: "All services", path: "/services", feeds: [] },
      { name: "Marine Construction", path: "/services/construction", feeds: ["projects"] },
      { name: "Marine Engineering & Inspection", path: "/services/engineering", feeds: ["projects"] },
      { name: "Dredging", path: "/services/dredging", feeds: ["projects"] },
      { name: "Commercial Diving & Underwater Construction", path: "/services/diving", feeds: ["projects"] },
      { name: "Fleet & Marine Support", path: "/services/marine-services", feeds: ["projects"] },
    ],
  },
  {
    title: "Markets",
    pages: [
      { name: "Markets we serve", path: "/markets", feeds: [] },
      { name: "Federal & Defense", path: "/markets/federal", feeds: [] },
    ],
  },
  {
    title: "Portfolio and newsroom",
    pages: [
      { name: "Projects", path: "/projects/featured-work", feeds: ["projects"], note: "Filtered by the market and services set on each project." },
      { name: "News & Insights", path: "/insights/news", feeds: ["news"] },
    ],
  },
]

export const SECTION_LABELS: Record<Section, { label: string; href: string }> = {
  projects: { label: "Projects", href: "/admin/projects" },
  news: { label: "News", href: "/admin/news" },
  careers: { label: "Careers", href: "/admin/careers" },
  leadership: { label: "Leadership", href: "/admin/leadership" },
  settings: { label: "Site info", href: "/admin/settings" },
  inquiries: { label: "Inquiries", href: "/admin/inquiries" },
  text: { label: "Page text", href: "/admin/pages/text" },
}
