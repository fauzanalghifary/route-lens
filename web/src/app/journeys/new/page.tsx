"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { consumePendingJourneyRequest } from "../../pending-journey-storage";
import { JourneyDetailScreen } from "../journey-detail-screen";
import { createJourney, routeLensQueryKeys } from "@/lib/route-lens/api";
import type { CreateJourneyRequest } from "@/lib/route-lens/types";

export default function NewJourneyPage() {
  return (
    <Suspense
      fallback={<JourneyDetailScreen journey={null} status="loading" />}
    >
      <CreateJourneyContent />
    </Suspense>
  );
}

function CreateJourneyContent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft");
  const hasStartedRef = useRef(false);
  const [pendingRequest, setPendingRequest] =
    useState<CreateJourneyRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const displayErrorMessage =
    errorMessage ??
    (draftId ? null : "Missing journey draft. Start again from the map.");

  const startJourneyCreation = useCallback(
    async (draftId: string) => {
      const request = consumePendingJourneyRequest(draftId);

      if (!request) {
        setErrorMessage("Journey draft expired. Start again from the map.");
        return;
      }

      setPendingRequest(request);

      const result = await createJourney(request);

      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: routeLensQueryKeys.journeys()
      });
      queryClient.setQueryData(
        routeLensQueryKeys.journey(result.data.id),
        result
      );
      router.replace(`/journeys/${result.data.id}`);
    },
    [queryClient, router]
  );

  useEffect(() => {
    if (!draftId) {
      return;
    }

    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    void startJourneyCreation(draftId);
  }, [draftId, startJourneyCreation]);

  return (
    <JourneyDetailScreen
      errorMessage={displayErrorMessage}
      journey={null}
      pendingRequest={pendingRequest}
      status={displayErrorMessage ? "error" : "loading"}
    />
  );
}
