"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { ROUTE_STYLE_PRESETS, SCENE_COUNT } from "./route-lens.constants";
import type { Coordinate, RouteStyle } from "./route-lens.types";

const RouteMap = dynamic(
  () => import("./route-map").then((mod) => mod.RouteMap),
  {
    ssr: false,
    loading: () => <div className="route-map-loading" />
  }
);

interface RouteSelection {
  destination: Coordinate | null;
  origin: Coordinate | null;
}

export function RouteLensWorkspace() {
  const [selection, setSelection] = useState<RouteSelection>({
    destination: null,
    origin: null
  });
  const [style, setStyle] = useState<RouteStyle>("cinematic");
  const isReady = Boolean(selection.origin && selection.destination);

  const activeStep = useMemo(() => {
    if (!selection.origin) {
      return "Origin";
    }

    if (!selection.destination) {
      return "Destination";
    }

    return "Ready";
  }, [selection.destination, selection.origin]);

  const pickCoordinate = useCallback((coordinate: Coordinate) => {
    setSelection((current) => {
      if (!current.origin) {
        return {
          ...current,
          origin: coordinate
        };
      }

      if (!current.destination) {
        return {
          ...current,
          destination: coordinate
        };
      }

      return current;
    });
  }, []);

  const resetSelection = useCallback(() => {
    setSelection({
      destination: null,
      origin: null
    });
  }, []);

  return (
    <section className="route-workbench" aria-label="Route builder">
      <div className="route-workbench-toolbar">
        <div>
          <p className="eyebrow">Route builder</p>
          <h2>Pick two points</h2>
        </div>
        <div className="selection-status" aria-label="Selection status">
          <span
            className={selection.origin ? "status-dot active" : "status-dot"}
          />
          <span
            className={
              selection.destination ? "status-dot active" : "status-dot"
            }
          />
          <span>{activeStep}</span>
        </div>
      </div>

      <div className="route-workbench-grid">
        <RouteMap
          destination={selection.destination}
          origin={selection.origin}
          onPick={pickCoordinate}
        />

        <aside className="confirmation-panel" aria-label="Journey confirmation">
          <div className="confirmation-section">
            <span className="panel-label">Origin</span>
            <strong>
              {selection.origin
                ? formatCoordinate(selection.origin)
                : "Not selected"}
            </strong>
          </div>

          <div className="confirmation-section">
            <span className="panel-label">Destination</span>
            <strong>
              {selection.destination
                ? formatCoordinate(selection.destination)
                : "Not selected"}
            </strong>
          </div>

          <div className="confirmation-section">
            <span className="panel-label">Scenes</span>
            <strong>{SCENE_COUNT} fixed scenes</strong>
          </div>

          <div className="confirmation-section">
            <span className="panel-label">Style</span>
            <div className="style-preset-grid">
              {ROUTE_STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  className={
                    preset.value === style
                      ? "style-preset selected"
                      : "style-preset"
                  }
                  type="button"
                  onClick={() => setStyle(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="confirmation-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={resetSelection}
            >
              Reset
            </button>
            <button
              className="primary-button"
              disabled={!isReady}
              type="button"
            >
              Generate journey
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function formatCoordinate(coordinate: Coordinate) {
  return `${coordinate.lat.toFixed(4)}, ${coordinate.lng.toFixed(4)}`;
}
