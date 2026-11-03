"use client"

import { useEffect, useState, useTransition } from "react"
import { GripVertical } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { saveOrder, type Ordered } from "./order-actions"

/**
 * A list you can reorder by dragging the grip at the left of each row (mouse
 * or pen). Rows keep their own up/down buttons for keyboard and touch.
 */
export function SortableList({
  entity,
  items,
  className,
  itemClassName,
}: {
  entity: Ordered
  items: { id: string; content: React.ReactNode }[]
  className?: string
  itemClassName?: string
}) {
  const [order, setOrder] = useState(() => items.map((i) => i.id))
  const [armed, setArmed] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [, start] = useTransition()
  const byId = new Map(items.map((i) => [i.id, i]))

  // Server order wins whenever it changes (arrow buttons, other people).
  const serverKey = items.map((i) => i.id).join(",")
  useEffect(() => setOrder(serverKey.split(",").filter(Boolean)), [serverKey])

  function drop(target: string) {
    if (!dragging || dragging === target) return
    const next = order.filter((id) => id !== dragging)
    next.splice(next.indexOf(target) + (order.indexOf(dragging) < order.indexOf(target) ? 1 : 0), 0, dragging)
    setOrder(next)
    start(async () => {
      const res = await saveOrder(entity, next)
      if (res.ok) toast.success("New order saved. The website is updated.")
      else toast.error("The new order could not be saved.")
    })
  }

  return (
    <ul className={className}>
      {order.map((id) => {
        const item = byId.get(id)
        if (!item) return null
        return (
          <li
            key={id}
            draggable={armed === id}
            onDragStart={(e) => {
              setDragging(id)
              e.dataTransfer.effectAllowed = "move"
              e.dataTransfer.setData("text/plain", id)
            }}
            onDragEnd={() => {
              setDragging(null)
              setOver(null)
              setArmed(null)
            }}
            onDragOver={(e) => {
              if (!dragging) return
              e.preventDefault()
              setOver(id)
            }}
            onDrop={(e) => {
              e.preventDefault()
              drop(id)
            }}
            className={cn("relative flex items-stretch", itemClassName, dragging === id && "opacity-40", over === id && dragging !== id && "bg-sky-50 shadow-[inset_0_2px_0_#1c6fbf]")}
          >
            <span
              onPointerDown={() => setArmed(id)}
              onPointerUp={() => setArmed(null)}
              className="hidden w-7 shrink-0 cursor-grab items-center justify-center text-slate-300 hover:text-slate-500 active:cursor-grabbing md:flex"
              title="Drag to reorder"
              aria-hidden
            >
              <GripVertical className="size-4" />
            </span>
            <div className="min-w-0 flex-1">{item.content}</div>
          </li>
        )
      })}
    </ul>
  )
}
