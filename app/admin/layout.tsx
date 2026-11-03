import type { Metadata, Viewport } from "next"
import { Barlow, Inter } from "next/font/google"
import { Toaster } from "sonner"
import "../globals.css"

// The dashboard's own root layout: none of the public site's stylesheets,
// analytics or review widget, and never indexed.

const barlow = Barlow({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-barlow" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: { default: "Website dashboard | Coastal Engineering Group", template: "%s | Coastal dashboard" },
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
}

export const viewport: Viewport = { themeColor: "#0a2540", width: "device-width", initialScale: 1 }

const brand = {
  "--primary": "#0a2540",
  "--primary-foreground": "#ffffff",
  "--ring": "#1c6fbf",
  "--background": "#f6f7f9",
} as React.CSSProperties

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans antialiased" style={brand}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
