import type { Metadata, Viewport } from "next"
import { Barlow, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { SITE } from "./seo"

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
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0a2540",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable}`}>
      <head>
        {/* CEG stylesheets */}
        <link rel="stylesheet" href="/ceg/styles.css" />
        <link rel="stylesheet" href="/ceg/drydock-body.css" />
      </head>
      <body className="antialiased" data-concept="drydock">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
