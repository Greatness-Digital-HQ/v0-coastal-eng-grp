"use client"

import { useRef, useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * A button that asks before running a server action, for anything that
 * deletes or takes access away. `fields` become hidden form inputs.
 */
export function ConfirmAction({
  action,
  fields,
  title,
  description,
  confirmLabel,
  children,
  className,
  variant = "link",
}: {
  action: (form: FormData) => Promise<void>
  fields: Record<string, string>
  title: string
  description: string
  confirmLabel: string
  children: React.ReactNode
  className?: string
  /** "link": a red text button. "button": an outline button. */
  variant?: "link" | "button"
}) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const form = useRef<HTMLFormElement>(null)

  return (
    <>
      <form ref={form} action={(fd) => start(async () => action(fd))} className="contents">
        {Object.entries(fields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      </form>
      {variant === "button" ? (
        <Button type="button" variant="outline" size="sm" className={cn("text-rose-700 hover:text-rose-800", className)} onClick={() => setOpen(true)}>
          {children}
        </Button>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={cn("rounded-sm text-sm text-rose-700 underline-offset-2 hover:underline", className)}>
          {children}
        </button>
      )}
      {/* Mounted only while open: unmounting on close skips Radix's exit
          animation, which left the page inert (pointer-events: none) here. */}
      {open && (
        <AlertDialog open onOpenChange={(o) => !pending && setOpen(o)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <Button type="button" variant="destructive" disabled={pending} onClick={() => form.current?.requestSubmit()}>
                {pending && <Loader2 className="animate-spin" aria-hidden />}
                {confirmLabel}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
