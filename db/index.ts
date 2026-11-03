import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

// node-postgres works against Neon (production, and a branch per preview
// deployment) and the local embedded Postgres (scripts/db-local.ts), and
// supports transactions. One pool per server instance.

const globalForDb = globalThis as unknown as { __cegPool?: Pool }

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

function pool(): Pool {
  if (!globalForDb.__cegPool) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("DATABASE_URL is not set")
    // Neon's URL says sslmode=require, which node-postgres treats as
    // verify-full and warns about; say verify-full outright.
    const p = new Pool({ connectionString: url.replace(/sslmode=require\b/, "sslmode=verify-full"), max: 5, idleTimeoutMillis: 10_000 })
    // An unreachable host must surface as a failed query, never a crash.
    p.on("error", (err) => console.error("[db] pool error", err.message))
    globalForDb.__cegPool = p
  }
  return globalForDb.__cegPool
}

export type Db = NodePgDatabase<typeof schema>
let cached: Db | undefined
export function db(): Db {
  cached ??= drizzle(pool(), { schema })
  return cached
}
export { schema }
