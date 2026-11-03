import { boolean, date, index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

// Tables behind the /admin dashboard (plan: .work/dashboard/PLAN.md).
// Markets and divisions stay in public/ceg/data.jsx: they define the site's
// URLs and filters, so projects store their keys and the loader maps them.

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()

// ─── People and sign-in ──────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(), // always lower-case
  name: text("name").notNull().default(""),
  /** owner: everything, including Users. editor: content and inquiries. */
  role: text("role", { enum: ["owner", "editor"] }).notNull().default("editor"),
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: createdAt(),
})

/** Emailed sign-in links. Only the SHA-256 of the token is stored. */
export const loginTokens = pgTable("login_tokens", {
  tokenHash: text("token_hash").primaryKey(),
  email: text("email").notNull(),
  next: text("next"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: createdAt(),
})

/** Signed-in browsers. The cookie holds a random token; the row keys on its hash. */
export const sessions = pgTable(
  "sessions",
  {
    idHash: text("id_hash").primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
)

// ─── Site content ────────────────────────────────────────────────────────────

const status = () => text("status", { enum: ["draft", "published"] }).notNull().default("draft")

export type ScopeStat = { value: string; label: string }

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  client: text("client").notNull().default(""),
  /** MARKETS[].key in data.jsx */
  market: text("market").notNull(),
  /** DIVISIONS[].key in data.jsx; the first one is the project's headline service. */
  services: text("services").array().notNull().default([]),
  state: text("state").notNull().default(""),
  year: text("year").notNull().default(""),
  blurb: text("blurb").notNull().default(""),
  image: text("image").notNull().default(""),
  scope: text("scope").array().notNull().default([]),
  scopeStats: jsonb("scope_stats").$type<ScopeStat[]>().notNull().default([]),
  challenge: text("challenge").notNull().default(""),
  approach: text("approach").notNull().default(""),
  outcome: text("outcome").notNull().default(""),
  status: status(),
  /** Lower first. The first published project is the homepage feature. */
  sortOrder: integer("sort_order").notNull().default(0),
  /** Prototype content Coastal has not confirmed yet. Shown as a badge in the dashboard only. */
  needsReview: boolean("needs_review").notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  updatedBy: text("updated_by"),
})

export const newsArticles = pgTable("news_articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  publishedOn: date("published_on").notNull(),
  category: text("category").notNull(),
  author: text("author").notNull().default(""),
  excerpt: text("excerpt").notNull().default(""),
  /** One entry per paragraph. */
  body: text("body").array().notNull().default([]),
  image: text("image").notNull().default(""),
  tags: text("tags").array().notNull().default([]),
  status: status(),
  needsReview: boolean("needs_review").notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  updatedBy: text("updated_by"),
})

export const jobOpenings = pgTable("job_openings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  division: text("division").notNull().default(""),
  location: text("location").notNull().default(""),
  type: text("type").notNull().default("Full-time"),
  status: status(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  updatedBy: text("updated_by"),
})

export const leaders = pgTable("leaders", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  title: text("title").notNull().default(""),
  bio: text("bio").notNull().default(""),
  responsibility: text("responsibility").notNull().default(""),
  image: text("image").notNull().default(""),
  status: status(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  updatedBy: text("updated_by"),
})

/** Small key/value settings: `contact` (phone, email, locations, LinkedIn) and `routing`. */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: updatedAt(),
  updatedBy: text("updated_by"),
})

/** The row as it was before each edit or delete, for one-step undo. */
export const revisions = pgTable(
  "revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    data: jsonb("data").notNull(),
    actor: text("actor"),
    createdAt: createdAt(),
  },
  (t) => [index("revisions_entity_idx").on(t.entity, t.entityId, t.createdAt)],
)

// ─── Inquiries ───────────────────────────────────────────────────────────────

export const INQUIRY_STATUSES = ["new", "in_progress", "closed", "spam"] as const

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** The reference the visitor sees on the success screen and in their email. */
    ref: text("ref").notNull().unique(),
    /** contact_page: the 3-step form on /contact. contact_band: the short form on other pages. */
    source: text("source", { enum: ["contact_page", "contact_band"] }).notNull(),
    inquiryType: text("inquiry_type").notNull().default(""),
    projectTypes: text("project_types").array().notNull().default([]),
    market: text("market").notNull().default(""),
    state: text("state").notNull().default(""),
    timeline: text("timeline").notNull().default(""),
    description: text("description").notNull().default(""),
    name: text("name").notNull(),
    title: text("title").notNull().default(""),
    org: text("org").notNull().default(""),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    referral: text("referral").notNull().default(""),
    pageUrl: text("page_url").notNull().default(""),
    status: text("status", { enum: INQUIRY_STATUSES }).notNull().default("new"),
    notes: text("notes").notNull().default(""),
    /** Who it was emailed to, and whether that worked. */
    notifiedTo: text("notified_to").array().notNull().default([]),
    emailError: text("email_error"),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("inquiries_created_idx").on(t.createdAt), index("inquiries_status_idx").on(t.status)],
)

// ─── Housekeeping ────────────────────────────────────────────────────────────

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    summary: text("summary").notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
)

/** Fixed-window counters for the public form and sign-in emails. */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
})

export type Project = typeof projects.$inferSelect
export type NewsArticle = typeof newsArticles.$inferSelect
export type JobOpening = typeof jobOpenings.$inferSelect
export type Leader = typeof leaders.$inferSelect
export type Inquiry = typeof inquiries.$inferSelect
export type User = typeof users.$inferSelect
