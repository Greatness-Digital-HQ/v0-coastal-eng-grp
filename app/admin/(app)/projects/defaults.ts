import type { ProjectInput } from "./actions"

// A plain module (not "use client") so the server page can pass it as a prop.
export const EMPTY_PROJECT: ProjectInput = {
  title: "",
  slug: "",
  client: "",
  market: "",
  services: [],
  state: "",
  year: String(new Date().getFullYear()),
  blurb: "",
  image: "",
  imageAlt: "",
  gallery: [],
  seoTitle: "",
  seoDescription: "",
  scope: [],
  scopeStats: [],
  challenge: "",
  approach: "",
  outcome: "",
  status: "draft",
  needsReview: false,
}
