import type { Metadata, Viewport } from "next"
import { Barlow, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../globals.css"
import { SITE_ICONS } from "@/app/icons"
import { SITE } from "@/app/seo"
import { getSiteContent } from "@/lib/content"

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-barlow",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  // Each route supplies its own title; `default` only covers routes that don't.
  title: {
    default: "Coastal Engineering Group | Marine Construction, Dredging & Engineering",
    template: "%s",
  },
  description:
    "Marine construction, dredging, commercial diving, underwater inspection and waterfront engineering throughout the Eastern United States.",
  generator: "v0.app",
  // The logo's C mark on a white tile (public/favicon.ico, icon-*.png), so it
  // reads on light and dark browser tabs alike.
  icons: SITE_ICONS,
}

export const viewport: Viewport = {
  themeColor: "#0a2540",
  width: "device-width",
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Dashboard content for public/ceg/data.jsx and friends; without it they
  // show their built-in copy.
  const content = await getSiteContent()
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable}`}>
      <head>
        {/* CEG stylesheets */}
        <link rel="stylesheet" href="/ceg/styles.css" />
        <link rel="stylesheet" href="/ceg/drydock-body.css" />
      </head>
      <body className="antialiased" data-concept="drydock">
        {content && (
          <script
            id="ceg-content"
            type="application/json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(content).replace(/</g, "\\u003c") }}
          />
        )}
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
        {/* Greatness Digital client-review widget, for the client's site review pass. */}
        <script src="https://feedback.greatnessdigital.com/r/v1/embed.js" data-project="pk_EeajXfbnnhbDdj6v" async />
      </body>
    </html>
  )
}
