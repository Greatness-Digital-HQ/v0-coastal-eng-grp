import type { Metadata } from "next"
import PortalClient from "../portal/PortalClient"

export const metadata: Metadata = {
  title: "Vendor Portal — Coastal Engineering Group",
  description:
    "Vendor and subcontractor portal for Coastal Engineering Group — submit qualification documents, track RFQs, and check payment status.",
  robots: { index: false, follow: false },
}

export default function VendorPortalPage() {
  return <PortalClient portalKey="vendor" />
}
