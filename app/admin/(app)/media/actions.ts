"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db, schema } from "@/db"
import { requireUser } from "@/lib/auth"
import { deleteStoredImage } from "@/lib/media"
import { audit } from "@/lib/server-utils"
import { photoUses } from "./uses"

/** Deletes a library photo, but only when no project, article or profile uses it. */
export async function deletePhoto(form: FormData): Promise<void> {
  const me = await requireUser()
  const [m] = await db().select().from(schema.media).where(eq(schema.media.id, String(form.get("id"))))
  if (!m) return
  const uses = (await photoUses()).get(m.url) ?? []
  if (uses.length) return
  // The site's own built-in photos (/assets) stay; only the library entry goes.
  if (!m.url.startsWith("/assets/")) await deleteStoredImage(m.url).catch((e) => console.error("[media] delete failed", e))
  await db().delete(schema.media).where(eq(schema.media.id, m.id))
  await audit(me.email, "delete", "media", m.id, m.name || m.url)
  revalidatePath("/admin/media")
}
