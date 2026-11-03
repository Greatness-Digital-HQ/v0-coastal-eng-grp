/**
 * Local Postgres for development: real Postgres binaries from `embedded-postgres`,
 * data in .local-db (gitignored). No service, no Docker. Stop with Ctrl+C.
 *
 *   pnpm db:local            start (creating it on first run) and keep running
 *   pnpm db:local -- --reset throw the data away first
 *
 * Then put DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5443/coastal
 * in .env.local and run pnpm db:migrate.
 */
import { existsSync, rmSync } from "node:fs"
import path from "node:path"
import EmbeddedPostgres from "embedded-postgres"

const LOCAL_DB = { port: 5443, user: "postgres", password: "postgres", database: "coastal" }
const dir = path.join(process.cwd(), ".local-db", "data")

async function main() {
  if (process.argv.includes("--reset")) rmSync(path.dirname(dir), { recursive: true, force: true })
  const fresh = !existsSync(path.join(dir, "PG_VERSION"))
  const pg = new EmbeddedPostgres({
    databaseDir: dir,
    port: LOCAL_DB.port,
    user: LOCAL_DB.user,
    password: LOCAL_DB.password,
    authMethod: "scram-sha-256",
    persistent: true,
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
    postgresFlags: ["-c", "listen_addresses=127.0.0.1"],
    onLog: () => {},
    onError: (e) => console.error(String(e)),
  })
  if (fresh) await pg.initialise()
  await pg.start()
  const admin = pg.getPgClient()
  await admin.connect()
  const r = await admin.query("select 1 from pg_database where datname = $1", [LOCAL_DB.database])
  if (r.rowCount === 0) await pg.createDatabase(LOCAL_DB.database)
  await admin.end()
  console.log(`postgres ready on 127.0.0.1:${LOCAL_DB.port}/${LOCAL_DB.database}${fresh ? " (new)" : ""}`)
  const stop = async () => {
    await pg.stop().catch(() => {})
    process.exit(0)
  }
  process.on("SIGINT", stop)
  process.on("SIGTERM", stop)
  setInterval(() => {}, 1 << 30)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
