"use client"

import { useEffect } from "react"

const MESSAGE = "You have unsaved changes. Leave without saving?"

/**
 * Warns before leaving an editor with unsaved changes: on reload or closing
 * the tab, and on clicking a link to another dashboard page.
 */
export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return
    const onUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null
      if (!a || a.target === "_blank" || a.origin !== location.origin || a.pathname === location.pathname) return
      if (!window.confirm(MESSAGE)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener("beforeunload", onUnload)
    document.addEventListener("click", onClick, true)
    return () => {
      window.removeEventListener("beforeunload", onUnload)
      document.removeEventListener("click", onClick, true)
    }
  }, [dirty])
}
