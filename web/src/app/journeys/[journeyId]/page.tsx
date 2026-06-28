"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { JourneyDetailScreen } from "../journey-detail-screen";
import { getJourney, routeLensQueryKeys } from "@/lib/route-lens/api";

export default function JourneyPage() {
  const params = useParams<{ journeyId: string }>();
  const journeyId = params.journeyId;
  const journeyQuery = useQuery({
    queryKey: routeLensQueryKeys.journey(journeyId),
    queryFn: () => getJourney(journeyId)
  });
  const result = journeyQuery.data;

  if (journeyQuery.isLoading) {
    return <JourneyDetailScreen journey={null} status="loading" />;
  }

  if (result?.ok === true) {
    return <JourneyDetailScreen journey={result.data} status="ready" />;
  }

  return (
    <JourneyDetailScreen
      errorMessage={
        result?.ok === false ? result.message : "Journey not found."
      }
      journey={null}
      status="error"
    />
  );
}
