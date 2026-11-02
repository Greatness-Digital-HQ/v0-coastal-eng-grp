// Compiles public/ceg/*.jsx ahead of time, so visitors' browsers no longer
// download Babel (3 MB) and compile the site on every page load.
//
// next.config.mjs runs this before every `next build` and `next dev`, whatever
// command started them (the Vercel project builds with its own v0 command,
// not `pnpm build`). It can also be run by hand: node scripts/build-ceg.mjs.
//
// For each file it writes public/ceg-dist/<name>.<hash>.js with the same Babel
// options the runtime loader used (presets env + react, script mode), and
// records the hashed names in app/ceg-manifest.json for app/CegPage.tsx. The
// hash changes with the content, so the files can be cached for a year
// (next.config.mjs). Both outputs are build artifacts and are git-ignored.
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import Babel from "@babel/standalone"

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const SRC = path.join(ROOT, "public", "ceg")
const OUT = path.join(ROOT, "public", "ceg-dist")
const MANIFEST = path.join(ROOT, "app", "ceg-manifest.json")

export function buildCeg() {
  // Next loads its config again in worker processes, which inherit this.
  if (process.env.CEG_BUILT) return
  process.env.CEG_BUILT = "1"
  fs.rmSync(OUT, { recursive: true, force: true })
  fs.mkdirSync(OUT, { recursive: true })

  const manifest = {}
  for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith(".jsx")).sort()) {
    const name = file.replace(/\.jsx$/, "")
    const source = fs.readFileSync(path.join(SRC, file), "utf8")
    const { code } = Babel.transform(source, {
      presets: ["env", "react"],
      sourceType: "script",
      filename: file,
      comments: false,
      compact: true,
    })
    const hash = crypto.createHash("sha256").update(code).digest("hex").slice(0, 10)
    const out = `${name}.${hash}.js`
    fs.writeFileSync(path.join(OUT, out), code)
    manifest[name] = `/ceg-dist/${out}`
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n")
  console.log(`build-ceg: compiled ${Object.keys(manifest).length} files to public/ceg-dist`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildCeg()
