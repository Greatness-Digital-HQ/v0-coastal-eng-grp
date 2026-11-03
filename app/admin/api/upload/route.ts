import { NextResponse } from "next/server"
import { issueSignedToken } from "@vercel/blob"
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client"
import { currentUser } from "@/lib/auth"
import { blobEnabled, IMAGE_TYPES, INCOMING_PREFIX, MAX_UPLOAD_BYTES } from "@/lib/media"

// GET tells the dashboard's photo field which upload path to use. POST is the
// presigned-upload handshake for @vercel/blob/client's uploadPresigned(): it
// only signs uploads into incoming/, for signed-in users, images only.

export async function GET() {
  if (!(await currentUser())) return NextResponse.json({ error: "Sign in first" }, { status: 401 })
  return NextResponse.json({ mode: blobEnabled() ? "blob" : "local" })
}

export async function POST(request: Request) {
  if (!(await currentUser())) return NextResponse.json({ error: "Sign in first" }, { status: 401 })
  const body = (await request.json()) as HandleUploadPresignedBody
  try {
    const result = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        if (!pathname.startsWith(INCOMING_PREFIX)) throw new Error("Uploads must go to incoming/")
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes: IMAGE_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          validUntil: Date.now() + 10 * 60_000,
        })
        return { token, urlOptions: { addRandomSuffix: true, allowedContentTypes: IMAGE_TYPES, maximumSizeInBytes: MAX_UPLOAD_BYTES } }
      },
    })
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
