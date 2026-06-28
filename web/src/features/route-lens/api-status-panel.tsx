"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { JourneyList } from "./journey-list";
import {
  createSampleJourney,
  getApiHealth,
  listJourneys,
  routeLensQueryKeys
} from "./route-lens.api";

const apiPanelClassName =
  "mt-[22px] grid gap-5 border border-[#20231f24] bg-[#ffffffb8] p-[22px] shadow-[0_20px_50px_rgba(32,35,31,0.08)]";

const emptyStateClassName =
  "border border-dashed border-[#20231f38] bg-[#ffffff73] p-[18px] text-[#666c65]";

const primaryButtonClassName =
  "min-h-[42px] border-0 bg-[#17211c] px-4 font-mono text-[0.72rem] font-bold uppercase text-[#fffdf6] hover:bg-[#24352b] disabled:cursor-not-allowed disabled:opacity-60";

export function ApiStatusPanel() {
  const queryClient = useQueryClient();
  const healthQuery = useQuery({
    queryKey: routeLensQueryKeys.health(),
    queryFn: getApiHealth
  });
  const journeysQuery = useQuery({
    queryKey: routeLensQueryKeys.journeys(),
    queryFn: listJourneys
  });
  const createJourneyMutation = useMutation({
    mutationFn: createSampleJourney,
    onSuccess: async (result) => {
      if (result.ok) {
        await queryClient.invalidateQueries({
          queryKey: routeLensQueryKeys.journeys()
        });
      }
    }
  });

  if (healthQuery.isLoading || journeysQuery.isLoading) {
    return (
      <section className={apiPanelClassName} aria-live="polite">
        <PanelHeader statusLabel="Loading" />
        <div className={emptyStateClassName}>Checking the RouteLens API...</div>
      </section>
    );
  }

  const health = healthQuery.data;
  const journeysResult = journeysQuery.data;
  const isHealthy = health?.ok === true;
  const journeys = journeysResult?.ok === true ? journeysResult.data : [];
  const createError =
    createJourneyMutation.data?.ok === false
      ? createJourneyMutation.data.message
      : null;

  return (
    <section className={apiPanelClassName} aria-live="polite">
      <PanelHeader statusLabel={isHealthy ? "Connected" : "Offline"} />

      {!isHealthy ? (
        <div className={emptyStateClassName}>
          {health?.ok === false ? health.message : "API request failed"}
        </div>
      ) : journeys.length === 0 ? (
        <div className={emptyStateClassName}>
          API is reachable. No saved journeys for this anonymous session yet.
        </div>
      ) : (
        <JourneyList journeys={journeys} />
      )}

      <div className="flex justify-start">
        <button
          className={primaryButtonClassName}
          disabled={createJourneyMutation.isPending}
          type="button"
          onClick={() => createJourneyMutation.mutate()}
        >
          {createJourneyMutation.isPending
            ? "Creating journey..."
            : "Create sample journey"}
        </button>
      </div>

      {journeysResult?.ok === false ? (
        <div className={emptyStateClassName}>{journeysResult.message}</div>
      ) : null}

      {createError ? (
        <div className={emptyStateClassName}>{createError}</div>
      ) : null}
    </section>
  );
}

interface PanelHeaderProps {
  statusLabel: "Connected" | "Loading" | "Offline";
}

function PanelHeader({ statusLabel }: PanelHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-[18px] max-sm:flex-col">
      <div>
        <h2 className="m-0 text-[1.05rem]">API connection</h2>
        <p className="mt-1.5 mb-0 leading-[1.6] text-[#666c65]">
          This scaffold checks the backend and reads saved journeys with the
          browser session cookie.
        </p>
      </div>
      <span
        className={
          statusLabel === "Offline"
            ? "inline-flex min-w-[88px] justify-center bg-[#f7e3dc] px-2.5 py-1.5 font-mono text-[0.78rem] font-extrabold text-[#9a412a] uppercase"
            : "inline-flex min-w-[88px] justify-center bg-[#e8eee9] px-2.5 py-1.5 font-mono text-[0.78rem] font-extrabold text-[#315f54] uppercase"
        }
      >
        {statusLabel}
      </span>
    </div>
  );
}
