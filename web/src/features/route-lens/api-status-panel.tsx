"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { JourneyList } from "./journey-list";
import {
  createSampleJourney,
  getApiHealth,
  listJourneys,
  routeLensQueryKeys
} from "./route-lens.api";

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
      <section className="api-panel" aria-live="polite">
        <PanelHeader statusLabel="Loading" />
        <div className="empty-state">Checking the RouteLens API...</div>
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
    <section className="api-panel" aria-live="polite">
      <PanelHeader statusLabel={isHealthy ? "Connected" : "Offline"} />

      {!isHealthy ? (
        <div className="empty-state">
          {health?.ok === false ? health.message : "API request failed"}
        </div>
      ) : journeys.length === 0 ? (
        <div className="empty-state">
          API is reachable. No saved journeys for this anonymous session yet.
        </div>
      ) : (
        <JourneyList journeys={journeys} />
      )}

      <div className="panel-actions">
        <button
          className="primary-button"
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
        <div className="empty-state">{journeysResult.message}</div>
      ) : null}

      {createError ? <div className="empty-state">{createError}</div> : null}
    </section>
  );
}

interface PanelHeaderProps {
  statusLabel: "Connected" | "Loading" | "Offline";
}

function PanelHeader({ statusLabel }: PanelHeaderProps) {
  return (
    <div className="api-panel-header">
      <div>
        <h2>API connection</h2>
        <p>
          This scaffold checks the backend and reads saved journeys with the
          browser session cookie.
        </p>
      </div>
      <span
        className={
          statusLabel === "Offline" ? "status-pill error" : "status-pill"
        }
      >
        {statusLabel}
      </span>
    </div>
  );
}
