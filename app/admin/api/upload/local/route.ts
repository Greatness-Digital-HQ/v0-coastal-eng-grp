import { NextResponse } from "next/server"
import { currentUser } from "@/lib/auth"
import { blobEnabled, IMAGE_TYPES, MAX_UPLOAD_BYTES, storeImage, type ImageKind } from "@/lib/media"

// Local development only: the photo comes up in the request body and lands in
// public/uploads. Deployments always use the Blob store (../route.ts).
export async function POST(request: Request) {
  if (process.env.VERCEL || blobEnabled()) return NextResponse.json({ error: "Not available" }, { status: 404 })
  if (!(await currentUser())) return NextResponse.json({ error: "Sign in first" }, { status: 401 })
  const form = await request.formData()
  const file = form.get("file")
  const kind = String(form.get("kind")) as ImageKind
  if (!(file instanceof File) || !IMAGE_TYPES.includes(file.type)) return NextResponse.json({ error: "Upload a JPG, PNG or WebP photo." }, { status: 400 })
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "Photos can be up to 25 MB." }, { status: 400 })
  try {
    const url = await storeImage(Buffer.from(await file.arrayBuffer()), file.name, ["project", "news", "leader"].includes(kind) ? kind : "project")
    return NextResponse.json({ url })
  } catch (e) {
    return NextResponse.json({ error: `That photo could not be read: ${(e as Error).message}` }, { status: 400 })
  }
}
