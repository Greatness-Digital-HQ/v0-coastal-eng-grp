// Re-encodes the site's photos in public/assets as WebP for the web.
//
//   node scripts/optimize-images.mjs            convert every .jpg/.jpeg in public/assets
//   node scripts/optimize-images.mjs a.jpg ...  convert only these files
//
// Photos are scaled down to fit inside 2400x2400 (never up), auto-rotated from
// their EXIF orientation, stripped of metadata, and written next to the source
// as <name>.webp at quality 82: visually the same as the original at a fraction
// of the size. The .jpg source is removed afterwards (it stays in git history),
// so update any /assets/<name>.jpg reference to .webp. Logos (.png/.avif) are
// left alone.
import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

const DIR = path.join(process.cwd(), "public", "assets")
const MAX = 2400
const QUALITY = 82

const args = process.argv.slice(2)
const files = (args.length ? args : fs.readdirSync(DIR)).filter((f) => /\.jpe?g$/i.test(f))

let before = 0
let after = 0
for (const f of files) {
  const src = path.join(DIR, f)
  const out = path.join(DIR, f.replace(/\.jpe?g$/i, ".webp"))
  const input = fs.readFileSync(src)
  await sharp(input)
    .rotate()
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(out)
  const a = fs.statSync(out).size
  before += input.length
  after += a
  fs.unlinkSync(src)
  const { width, height } = await sharp(out).metadata()
  console.log(`${f.padEnd(34)} ${Math.round(input.length / 1024)}KB -> ${Math.round(a / 1024)}KB  ${width}x${height}`)
}
console.log(`total ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`)
