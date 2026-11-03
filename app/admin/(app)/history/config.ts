import { schema } from "@/db"

// The kinds of content with a version history, and where each is edited.
export const HISTORY = {
  project: { table: schema.projects, edit: "/admin/projects", noun: "project" },
  news: { table: schema.newsArticles, edit: "/admin/news", noun: "article" },
  leader: { table: schema.leaders, edit: "/admin/leadership", noun: "profile" },
} as const
export type HistoryEntity = keyof typeof HISTORY
