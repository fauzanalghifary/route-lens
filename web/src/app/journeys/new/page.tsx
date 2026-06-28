import { Suspense } from "react";

import { CreateJourneyRoute } from "@/features/route-lens/create-journey-route";
import { JourneyDetailScreen } from "@/features/route-lens/journey-detail-screen";

export default function NewJourneyPage() {
  return (
    <Suspense
      fallback={<JourneyDetailScreen journey={null} status="loading" />}
    >
      <CreateJourneyRoute />
    </Suspense>
  );
}
