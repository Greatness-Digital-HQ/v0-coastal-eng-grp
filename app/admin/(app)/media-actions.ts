"use server"

import { desc, eq } from "drizzle-orm"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { processIncoming, type ImageKind } from "@/lib/media"

/** Turns a just-uploaded original into the optimized site photo. */
export async function finishUpload(url: string, kind: ImageKind): Promise<{ url: string } | { error: string }> {
  const me = await requireUser()
  try {
    return { url: await processIncoming(url, kind, me.email) }
  } catch (e) {
    return { error: `That photo could not be processed: ${(e as Error).message}` }
  }
}

export type LibraryPhoto = { url: string; name: string; width: number | null; height: number | null }

/** The photo library, newest first, for the "Choose from library" picker. */
export async function listLibrary(kind?: ImageKind): Promise<LibraryPhoto[]> {
  await requireUser()
  const q = db().select({ url: schema.media.url, name: schema.media.name, width: schema.media.width, height: schema.media.height }).from(schema.media)
  return (kind ? q.where(eq(schema.media.kind, kind)) : q).orderBy(desc(schema.media.createdAt)).limit(300)
}
