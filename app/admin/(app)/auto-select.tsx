"use client"

import { cn } from "@/lib/utils"
import { controlCls } from "./control"

/** A filter <select> that applies itself as soon as it changes. */
export function AutoSelect({ className, ...props }: React.ComponentProps<"select">) {
  return <select {...props} className={cn(controlCls, "h-9 pr-8", className)} onChange={(e) => e.currentTarget.form?.requestSubmit()} />
}
