import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Opens a page of the website (or a draft preview) in a new tab. */
export function ViewLink({ href, label = "View", children }: { href: string; label?: string; children?: React.ReactNode }) {
  return (
    <Button asChild variant="outline" size="sm" className="shrink-0 bg-white">
      <a href={href} target="_blank" rel="noreferrer" aria-label={`${label}: ${href} (opens in a new tab)`}>
        {children ?? <ExternalLink />}
        {label}
      </a>
    </Button>
  )
}
