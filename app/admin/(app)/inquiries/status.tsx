import { Pill } from "../ui"

export const STATUS_LABELS = { new: "New", in_progress: "In progress", closed: "Closed", spam: "Spam" } as const
const TONE = { new: "blue", in_progress: "amber", closed: "green", spam: "red" } as const

export function InquiryStatus({ status }: { status: keyof typeof STATUS_LABELS }) {
  return <Pill tone={TONE[status]}>{STATUS_LABELS[status]}</Pill>
}
