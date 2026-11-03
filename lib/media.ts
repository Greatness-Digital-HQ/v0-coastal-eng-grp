import { randomBytes } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { del, put } from "@vercel/blob"
import sharp from "sharp"
import { db, schema } from "@/db"

// Dashboard photo uploads. In production the browser uploads the original
// straight to the Blob store (coastal-eng-media, OIDC auth) through a
// presigned URL, which skips the 4.5 MB function body limit; the server then
// re-encodes it the same way scripts/optimize-images.mjs does the site's own
// photos and deletes the original. Without Blob credentials (local
// development) files go to public/uploads instead.

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024
export const INCOMING_PREFIX = "incoming/"

export type ImageKind = "project" | "news" | "leader"
const MAX_EDGE: Record<ImageKind, number> = { project: 2400, news: 2400, leader: 1200 }

export function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL))
}

function baseName(name: string): string {
  const stem = name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return (stem || "photo").slice(0, 60)
}

/**
 * Re-encodes a photo as WebP (quality 82, EXIF-rotated, metadata stripped),
 * stores it and records it in the photo library. Returns its public URL.
 */
export async function storeImage(input: Buffer, originalName: string, kind: ImageKind, uploadedBy: string): Promise<string> {
  const max = MAX_EDGE[kind]
  const { data: webp, info } = await sharp(input, { failOn: "error" })
    .rotate()
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toBuffer({ resolveWithObject: true })
  const url = await put_(webp, originalName, kind)
  await db()
    .insert(schema.media)
    .values({ url, kind, name: originalName.slice(0, 200), width: info.width, height: info.height, bytes: webp.length, uploadedBy })
    .onConflictDoNothing()
  return url
}

async function put_(webp: Buffer, originalName: string, kind: ImageKind): Promise<string> {
  const name = `${baseName(originalName)}-${randomBytes(4).toString("hex")}.webp`
  const folder = { project: "projects", news: "news", leader: "leadership" }[kind]

  if (blobEnabled()) {
    const blob = await put(`${folder}/${name}`, webp, { access: "public", contentType: "image/webp", cacheControlMaxAge: 31_536_000 })
    return blob.url
  }
  if (process.env.VERCEL) throw new Error("Blob storage is not connected to this deployment.")
  const dir = path.join(process.cwd(), "public", "uploads", folder)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, name), webp)
  return `/uploads/${folder}/${name}`
}

/** True for an original that the browser just uploaded to our store's incoming/ folder. */
export function isIncomingBlobUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com") && u.pathname.startsWith(`/${INCOMING_PREFIX}`)
  } catch {
    return false
  }
}

export async function processIncoming(url: string, kind: ImageKind, uploadedBy: string): Promise<string> {
  if (!isIncomingBlobUrl(url)) throw new Error("Unexpected upload address.")
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`Could not read the uploaded photo (${res.status}).`)
  const input = Buffer.from(await res.arrayBuffer())
  const out = await storeImage(input, decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "photo"), kind, uploadedBy)
  await del(url).catch((e) => console.error("[media] could not delete the original", e))
  return out
}

/** Deletes a stored photo file (Blob or public/uploads). */
export async function deleteStoredImage(url: string): Promise<void> {
  if (url.startsWith("https://")) {
    if (blobEnabled()) await del(url)
    return
  }
  if (url.startsWith("/uploads/") && !process.env.VERCEL) {
    const { unlink } = await import("node:fs/promises")
    await unlink(path.join(process.cwd(), "public", url)).catch(() => {})
  }
}
