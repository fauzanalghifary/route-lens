import { JourneyDetailRoute } from "@/features/route-lens/journey-detail-route";

interface JourneyPageProps {
  params: Promise<{
    journeyId: string;
  }>;
}

export default async function JourneyPage({ params }: JourneyPageProps) {
  const { journeyId } = await params;

  return <JourneyDetailRoute journeyId={journeyId} />;
}
