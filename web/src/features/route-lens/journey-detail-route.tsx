"use client";

import { useQuery } from "@tanstack/react-query";
import { JourneyDetailScreen } from "./journey-detail-screen";
import { getJourney, routeLensQueryKeys } from "./route-lens.api";

interface JourneyDetailRouteProps {
  journeyId: string;
}

export function JourneyDetailRoute({ journeyId }: JourneyDetailRouteProps) {
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
