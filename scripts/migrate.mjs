// Brings the database up to date: applies drizzle/ migrations, adds the owners
// named in OWNER_EMAILS (and gives any of them without a password the one in
// ADMIN_INITIAL_PASSWORD, if set), and on a brand-new database imports the content that
// used to be hard-coded in public/ceg (8 projects, 6 articles, open roles,
// Kevin's leadership card, contact details).
//
//   node scripts/migrate.mjs     (also run by vercel.json before next build)
//
// The import runs once per database (settings.seeded_at), so deleting every
// project in the dashboard never brings the prototype ones back.
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import vm from "node:vm"
import { fileURLToPath } from "node:url"
import { config } from "dotenv"
import pg from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
config({ path: path.join(ROOT, ".env.local"), quiet: true })

const url = process.env.DATABASE_URL
if (!url) {
  if (process.env.VERCEL) {
    console.error("migrate: DATABASE_URL is not set on this deployment")
    process.exit(1)
  }
  console.log("migrate: no DATABASE_URL, skipped (the site uses its built-in content)")
  process.exit(0)
}

const pool = new pg.Pool({ connectionString: url.replace(/sslmode=require\b/, "sslmode=verify-full"), max: 1 })

try {
  await migrate(drizzle(pool), { migrationsFolder: path.join(ROOT, "drizzle") })
  await addOwners()
  await seedOnce()
  await syncLibrary()
  console.log(`migrate: up to date (${new URL(url).host})`)
} finally {
  await pool.end()
}

async function addOwners() {
  const emails = (process.env.OWNER_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
  for (const email of emails) {
    await pool.query(
      `insert into users (email, role) values ($1, 'owner')
       on conflict (email) do update set role = 'owner', disabled_at = null`,
      [email],
    )
  }
  if (emails.length === 0) return
  await initialPassword(emails)
  await setupLinks(emails)
}

// A first password so an owner can sign in before email is set up. It never
// replaces a password someone has already set; change it on /admin/account
// and then remove the variable.
async function initialPassword(emails) {
  const initial = process.env.ADMIN_INITIAL_PASSWORD ?? ""
  if (!initial) return
  if (initial.length < 10) {
    console.warn("migrate: ADMIN_INITIAL_PASSWORD is shorter than 10 characters, ignored")
    return
  }
  const r = await pool.query(
    "update users set password_hash = $1, password_changed_at = now() where email = any($2) and password_hash is null",
    [hashPassword(initial), emails],
  )
  if (r.rowCount) console.log(`migrate: initial password set for ${r.rowCount} owner(s)`)
}

// For each owner who still has no password, prints a one-time link (valid 24
// hours) to choose one, so the first sign-in needs neither email nor a shared
// password. Only the token's hash is stored, as for emailed reset links, and
// the build log is visible to the Vercel team only.
async function setupLinks(emails) {
  const host = process.env.VERCEL_ENV === "production" ? process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL
  const origin = host ? `https://${host}` : "http://localhost:3000"
  const { rows } = await pool.query("select email from users where email = any($1) and password_hash is null and disabled_at is null", [emails])
  for (const { email } of rows) {
    const token = crypto.randomBytes(32).toString("base64url")
    const hash = crypto.createHash("sha256").update(token).digest("hex")
    await pool.query(
      "insert into login_tokens (token_hash, email, purpose, expires_at) values ($1, $2, 'reset', now() + interval '24 hours')",
      [hash, email],
    )
    console.log(`migrate: ${email} has no password yet. Set one within 24 hours: ${origin}/admin/login/reset?token=${token}`)
  }
}

/** Same format as lib/password.ts: scrypt$N$r$p$salt$hash. */
function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const key = crypto.scryptSync(password.normalize("NFKC"), salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
  return `scrypt$16384$8$1$${salt.toString("base64url")}$${key.toString("base64url")}`
}

/** Adds every photo the content uses to the photo library, so "From library" offers them too. */
async function syncLibrary() {
  await pool.query(`
    insert into media (url, kind, name, uploaded_by)
    select distinct on (url) url, kind, regexp_replace(url, '^.*/', ''), 'import' from (
      select image as url, 'project' as kind from projects where image <> ''
      union all select g->>'url', 'project' from projects, jsonb_array_elements(gallery) g
      union all select image, 'news' from news_articles where image <> ''
      union all select image, 'leader' from leaders where image <> ''
    ) u
    where url is not null and url <> ''
    on conflict (url) do nothing`)
}

/** Runs a public/ceg data file the way the browser would and returns its window globals. */
function loadSiteData(file) {
  const window = {}
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "public", "ceg", file), "utf8"), { window })
  return window
}

/** The LEADERSHIP_DATA object literal from leadership-app.jsx (the rest of that file is JSX). */
function loadLeadership() {
  const src = fs.readFileSync(path.join(ROOT, "public", "ceg", "leadership-app.jsx"), "utf8")
  const m = src.match(/const LEADERSHIP_DATA = (\{[\s\S]*?\n\});/)
  return m ? vm.runInNewContext(`(${m[1]})`) : { leaders: [] }
}

async function seedOnce() {
  const done = await pool.query("select 1 from settings where key = 'seeded_at'")
  if (done.rowCount) return

  const { CEG_DATA } = loadSiteData("data.jsx")
  const { CEG_NEWS } = loadSiteData("news-data.jsx")
  const marketKey = Object.fromEntries(CEG_DATA.MARKETS.map((m) => [m.name, m.key]))

  const client = await pool.connect()
  try {
    await client.query("begin")
    for (const [i, p] of CEG_DATA.PROJECTS.entries()) {
      await client.query(
        `insert into projects (slug, title, client, market, services, state, year, blurb, image, scope, scope_stats,
           challenge, approach, outcome, status, sort_order, needs_review, updated_by)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'published',$15,true,'import')
         on conflict (slug) do nothing`,
        [p.slug, p.title, p.client ?? "", marketKey[p.market] ?? p.market, p.services ?? [], p.state ?? "", p.year ?? "",
          p.blurb ?? "", p.image ?? "", p.scope ?? [], JSON.stringify(p.scopeStats ?? []), p.challenge ?? "", p.approach ?? "",
          p.outcome ?? "", (i + 1) * 10],
      )
    }
    for (const a of CEG_NEWS) {
      await client.query(
        `insert into news_articles (slug, title, published_on, category, author, excerpt, body, image, tags, status, needs_review, updated_by)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'published',true,'import')
         on conflict (slug) do nothing`,
        [a.slug, a.title, a.dateISO, a.category, a.author ?? "", a.excerpt ?? "", a.body ?? [], a.image ?? "", a.tags ?? []],
      )
    }
    for (const [i, r] of CEG_DATA.CAREERS.openRoles.entries()) {
      await client.query(
        `insert into job_openings (title, division, location, type, status, sort_order, updated_by)
         values ($1,$2,$3,$4,'published',$5,'import')`,
        [r.title, r.division ?? "", r.location ?? "", r.type ?? "Full-time", (i + 1) * 10],
      )
    }
    for (const [i, l] of loadLeadership().leaders.entries()) {
      await client.query(
        `insert into leaders (name, title, bio, responsibility, image, status, sort_order, updated_by)
         values ($1,$2,$3,$4,$5,'published',$6,'import')`,
        [l.name, l.title ?? "", l.bio ?? "", l.responsibility ?? "", l.image ?? "", (i + 1) * 10],
      )
    }
    const c = CEG_DATA.CONTACT
    const contact = { phone: c.phone, email: c.email, locations: c.locations, linkedin: c.linkedin ?? "" }
    await client.query(
      `insert into settings (key, value, updated_by) values ('contact', $1, 'import') on conflict (key) do nothing`,
      [JSON.stringify(contact)],
    )
    await client.query(`insert into settings (key, value) values ('seeded_at', $1)`, [JSON.stringify(new Date().toISOString())])
    await client.query("commit")
    console.log(`migrate: imported ${CEG_DATA.PROJECTS.length} projects, ${CEG_NEWS.length} articles, ${CEG_DATA.CAREERS.openRoles.length} roles`)
  } catch (e) {
    await client.query("rollback")
    throw e
  } finally {
    client.release()
  }
}
