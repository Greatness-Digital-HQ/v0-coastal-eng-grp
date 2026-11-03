import type { Metadata } from "next"

// Favicons for the site and the dashboard, cut from the logo's C mark.
export const SITE_ICONS: Metadata["icons"] = {
  icon: [
    { url: "/favicon.ico", sizes: "32x32 48x48" },
    { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
  ],
  apple: "/apple-icon.png",
}
