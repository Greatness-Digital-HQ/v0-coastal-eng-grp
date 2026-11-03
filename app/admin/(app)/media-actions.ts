"use server"

import { requireUser } from "@/lib/auth"
import { processIncoming, type ImageKind } from "@/lib/media"

/** Turns a just-uploaded original into the optimized site photo. */
export async function finishUpload(url: string, kind: ImageKind): Promise<{ url: string } | { error: string }> {
  await requireUser()
  try {
    return { url: await processIncoming(url, kind) }
  } catch (e) {
    return { error: `That photo could not be processed: ${(e as Error).message}` }
  }
}
