/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      // Compiled site scripts carry a content hash in their name (see
      // scripts/build-ceg.mjs), so browsers can keep them for good.
      {
        source: "/ceg-dist/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Photos and vendor bundles keep their names when replaced, so cache
      // them for a day and refresh in the background after that.
      {
        source: "/:dir(assets|vendor)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ]
  },
  async redirects() {
    return [
      // The inquiry page was renamed /request-a-bid -> /contact per the client
      // edit package (Section 18). Single-hop and query-preserving so campaign
      // parameters survive. `statusCode: 301` rather than `permanent: true`
      // because the latter emits a 308; the edit package specifies a 301, and
      // 301 is the more broadly understood permanent redirect for crawlers.
      { source: "/request-a-bid", destination: "/contact", statusCode: 301 },
    ]
  },
}

export default nextConfig
