import type { Metadata } from "next"
import CegPage from "../../CegPage"
import { serviceMetadata, serviceJsonLd } from "../service-seo"

const SERVICE_KEY = "engineering"

export const metadata: Metadata = serviceMetadata(SERVICE_KEY)

export default function ServicePage() {
  const jsonLd = serviceJsonLd(SERVICE_KEY)
  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <CegPage app="service-app" label="Service page" serviceKey={SERVICE_KEY} />
    </>
  )
}
