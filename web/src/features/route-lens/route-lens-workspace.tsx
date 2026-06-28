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
  const [isIntroOpen, setIsIntroOpen] = useState(true);
  const [style, setStyle] = useState<RouteStyle>("cinematic");
  const isReady = Boolean(selection.origin && selection.destination);

  const instructionLabel = useMemo(() => {
    if (!selection.origin) {
      return "Pick origin";
    }

    if (!selection.destination) {
      return "Pick destination";
    }

    return "Review journey";
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
    <section className="route-workspace" aria-label="Route builder">
      <RouteMap
        destination={selection.destination}
        origin={selection.origin}
        onPick={pickCoordinate}
      />

      <header className="map-brand">
        <span className="brand-mark">🌍</span>
        <div>
          <strong>RouteLens</strong>
          <span>AI route scenes</span>
        </div>
      </header>

      <div className="map-instruction" aria-live="polite">
        <span
          className={selection.origin ? "status-dot active" : "status-dot"}
        />
        <span
          className={selection.destination ? "status-dot active" : "status-dot"}
        />
        <strong>{instructionLabel}</strong>
      </div>

      {isIntroOpen ? (
        <div className="intro-modal-backdrop" role="presentation">
          <section
            className="intro-modal"
            aria-labelledby="route-lens-intro-title"
            role="dialog"
          >
            <p className="eyebrow">RouteLens</p>
            <h1 id="route-lens-intro-title">
              Turn a route into visual scenes.
            </h1>
            <p>
              Pick an origin and destination on the map. RouteLens creates three
              AI-generated scenes inspired by the geography along your route.
            </p>
            <button
              className="primary-button"
              type="button"
              onClick={() => setIsIntroOpen(false)}
            >
              Start mapping
            </button>
          </section>
        </div>
      ) : null}

      {isReady ? (
        <aside className="confirmation-panel" aria-label="Journey confirmation">
          <div className="confirmation-heading">
            <p className="eyebrow">Review route</p>
            <h2>Ready to generate</h2>
          </div>

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
      ) : null}
    </section>
  );
}

function formatCoordinate(coordinate: Coordinate) {
  return `${coordinate.lat.toFixed(4)}, ${coordinate.lng.toFixed(4)}`;
}
