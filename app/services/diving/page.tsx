import type { Metadata } from "next"
import CegPage from "../../CegPage"
import { serviceMetadata, serviceJsonLd } from "../service-seo"

const SERVICE_KEY = "diving"

export const metadata: Metadata = serviceMetadata(SERVICE_KEY)

export default function CommercialDivingPage() {
  const jsonLd = serviceJsonLd(SERVICE_KEY)
  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <CegPage app="diving-app" label="Commercial Diving page" />
    </>
  )
}
