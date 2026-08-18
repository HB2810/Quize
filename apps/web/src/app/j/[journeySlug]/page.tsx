import { JourneyClient } from "@/engine/JourneyClient";

/**
 * The single dynamic journey route — every journey on the platform
 * renders here through the step-type registry. QR codes point at
 * /j/<slug> (e.g. /j/healthy-bones).
 */
export default async function JourneyPage({
  params,
}: {
  params: Promise<{ journeySlug: string }>;
}) {
  const { journeySlug } = await params;
  return <JourneyClient slug={journeySlug} />;
}
