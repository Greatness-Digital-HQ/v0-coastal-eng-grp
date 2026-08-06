"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"

// Shared client loader for the CEG prototype runtime.
//
// Every route used to carry its own verbatim copy of this loader, which forced
// each `page.tsx` to be a client component — and a client component cannot
// export `metadata`, so only a handful of routes had a unique title. Hoisting
// the loader here lets each route become a thin server component that exports
// its own metadata and JSON-LD while this component does the mounting.
//
// NOTE: content is still rendered on the client from /public/ceg/*.jsx. Making
// the page HTML itself server-rendered is a separate, larger port.
//
// The React and Babel bundles are served from /public/vendor rather than unpkg
// — a third-party CDN outage used to take the whole site down. See
// public/vendor/README.md.

const RUNTIME_REACT     = "/vendor/react.js"
const RUNTIME_REACT_DOM = "/vendor/react-dom.js"
const RUNTIME_BABEL     = "/vendor/babel.js"

const BASE_FILES = ["/ceg/themes.jsx", "/ceg/components.jsx", "/ceg/drydock-body.jsx"]

function loadExternalScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-ceg-src="${src}"]`)
    if (existing) {
      if (existing.dataset.cegLoaded === "1") { resolve(); return }
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", reject, { once: true })
      return
    }
    const s = document.createElement("script")
    s.src = src; s.async = false; s.crossOrigin = "anonymous"; s.dataset.cegSrc = src
    s.addEventListener("load", () => { s.dataset.cegLoaded = "1"; resolve() }, { once: true })
    s.addEventListener("error", reject, { once: true })
    document.head.appendChild(s)
  })
}

async function runJsxFile(url: string): Promise<void> {
  const res = await fetch(url, { cache: "no-cache" })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const source = await res.text()
  // @ts-expect-error — Babel loaded at runtime
  const out = window.Babel.transform(source, {
    presets: ["env", "react"],
    sourceType: "script",
    filename: url.split("/").pop() || "anonymous.jsx",
  })
  const s = document.createElement("script")
  s.dataset.cegJsx = url
  s.text = `//# sourceURL=${url}\n${out.code}`
  document.head.appendChild(s)
}

type Props = {
  /** The page-specific app module, e.g. "careers-app". */
  app: string
  /** Human-readable page name, used only in the mount-failure message. */
  label: string
  /** Extra data modules to load before the app module (e.g. "news-data"). */
  extraData?: string[]
  /** Service key exposed as window.__CEG_SERVICE for the shared service template. */
  serviceKey?: string
  /** When true, the route's [slug] param is exposed as window.__CEG_SLUG. */
  useSlug?: boolean
}

export default function CegPage({ app, label, extraData = [], serviceKey, useSlug }: Props) {
  const mounted = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const slug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug ?? "")

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    let cancelled = false

    const w = window as unknown as Record<string, unknown>
    if (serviceKey) w.__CEG_SERVICE = serviceKey
    if (useSlug) {
      // The two detail templates read different globals: project-detail-app
      // uses __CEG_SLUG, news-detail-app uses __CEG_NEWS_SLUG. Set both.
      w.__CEG_SLUG = slug
      w.__CEG_NEWS_SLUG = slug
    }

    const files = ["/ceg/data.jsx", ...extraData.map((d) => `/ceg/${d}.jsx`), ...BASE_FILES, `/ceg/${app}.jsx`]

    ;(async () => {
      try {
        await loadExternalScript(RUNTIME_REACT)
        await loadExternalScript(RUNTIME_REACT_DOM)
        await loadExternalScript(RUNTIME_BABEL)
        for (const url of files) {
          if (cancelled) return
          await runJsxFile(url)
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (!cancelled) setError(msg)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <>
      {error && (
        <div role="alert" style={{ padding: 24, margin: 24, border: "1px solid #b00020",
          color: "#b00020", fontFamily: "ui-monospace, monospace", fontSize: 13, background: "#fff5f5" }}>
          <strong>Failed to mount {label}:</strong> {error}
        </div>
      )}
      <div id="root" />
    </>
  )
}
