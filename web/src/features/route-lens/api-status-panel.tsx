"use client";

import { useEffect, useState } from "react";
import { JourneyList } from "./journey-list";
import { getApiHealth, listJourneys, type ApiResult } from "./route-lens.api";
import type { HealthResponse, JourneySummary } from "./route-lens.types";

type LoadState =
  | {
      status: "loading";
    }
  | {
      status: "ready";
      health: ApiResult<HealthResponse>;
      journeys: ApiResult<JourneySummary[]>;
    };

export function ApiStatusPanel() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let isActive = true;

    async function loadApiState() {
      const [health, journeys] = await Promise.all([
        getApiHealth(),
        listJourneys()
      ]);

      if (isActive) {
        setState({
          status: "ready",
          health,
          journeys
        });
      }
    }

    void loadApiState();

    return () => {
      isActive = false;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <section className="api-panel" aria-live="polite">
        <PanelHeader statusLabel="Loading" />
        <div className="empty-state">Checking the RouteLens API...</div>
      </section>
    );
  }

  const isHealthy = state.health.ok;
  const journeys = state.journeys.ok ? state.journeys.data : [];

  return (
    <section className="api-panel" aria-live="polite">
      <PanelHeader statusLabel={isHealthy ? "Connected" : "Offline"} />

      {!isHealthy ? (
        <div className="empty-state">{state.health.message}</div>
      ) : journeys.length === 0 ? (
        <div className="empty-state">
          API is reachable. No saved journeys for this anonymous session yet.
        </div>
      ) : (
        <JourneyList journeys={journeys} />
      )}

      {!state.journeys.ok ? (
        <div className="empty-state">{state.journeys.message}</div>
      ) : null}
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
