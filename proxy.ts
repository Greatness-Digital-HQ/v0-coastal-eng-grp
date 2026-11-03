import { NextResponse, type NextRequest } from "next/server"

// First line of defence for the dashboard: no session cookie, no page. Every
// dashboard page and server action still checks the session against the
// database (lib/auth.ts); this only keeps signed-out visitors on the login page.
export function proxy(request: NextRequest) {
  if (!request.cookies.has("ceg_admin")) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    url.search = request.nextUrl.pathname === "/admin" ? "" : `?next=${encodeURIComponent(request.nextUrl.pathname)}`
    return NextResponse.redirect(url)
  }
  const res = NextResponse.next()
  res.headers.set("X-Robots-Tag", "noindex, nofollow")
  return res
}

export const config = {
  // Everything under /admin except the sign-in pages.
  matcher: ["/admin", "/admin/((?!login).*)"],
}
