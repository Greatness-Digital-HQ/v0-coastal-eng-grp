import type { Metadata } from "next"
import PortalClient from "../portal/PortalClient"

export const metadata: Metadata = {
  title: "Employee Portal — Coastal Engineering Group",
  description:
    "Employee portal for Coastal Engineering Group — timesheets, pay and benefits, safety certifications, and company announcements.",
  robots: { index: false, follow: false },
}

export default function EmployeePortalPage() {
  return <PortalClient portalKey="employee" />
}
