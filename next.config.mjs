/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
