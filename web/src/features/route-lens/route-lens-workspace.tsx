"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { ROUTE_STYLE_PRESETS, SCENE_COUNT } from "./route-lens.constants";
import type { Coordinate, RouteStyle } from "./route-lens.types";

const RouteMap = dynamic(
  () => import("./route-map").then((mod) => mod.RouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-full min-h-[620px] w-full overflow-hidden bg-[#d9e6df] max-sm:min-h-[100svh]">
        <div className="absolute inset-[48%] h-9 w-9 animate-spin rounded-full border-3 border-[#315f5429] border-t-[#315f54]" />
      </div>
    )
  }
);

const eyebrowClassName =
  "m-0 mb-2.5 font-mono text-[0.72rem] font-bold uppercase tracking-normal text-[#5a6a60]";

const primaryButtonClassName =
  "min-h-[42px] border-0 bg-[#17211c] px-4 font-mono text-[0.72rem] font-bold uppercase text-[#fffdf6] hover:bg-[#24352b] disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClassName =
  "min-h-[42px] border border-[#17211c29] bg-[#fffdf6] px-3.5 font-mono text-[0.72rem] font-bold uppercase text-[#24352b]";

const panelLabelClassName =
  "font-mono text-[0.7rem] font-bold uppercase tracking-normal text-[#5a6a60]";

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
    <section
      className="relative h-screen min-h-[620px] w-screen overflow-hidden max-sm:min-h-[100svh]"
      aria-label="Route builder"
    >
      <RouteMap
        destination={selection.destination}
        origin={selection.origin}
        onPick={pickCoordinate}
      />

      <header className="absolute top-[18px] left-[18px] z-20 inline-flex items-center gap-3 border border-[#17211c21] bg-[#fffdf6] px-3 py-2.5 shadow-[0_18px_50px_-24px_rgba(23,33,28,0.42)] max-sm:top-3 max-sm:left-3">
        <span className="grid h-[34px] w-[34px] place-items-center bg-[#eef4df] text-xl">
          🌍
        </span>
        <div className="max-sm:hidden">
          <strong className="block text-base leading-[1.2] font-medium">
            RouteLens
          </strong>
          <span className="block font-mono text-[0.7rem] leading-[1.2] font-bold text-[#5a6a60] uppercase">
            AI route scenes
          </span>
        </div>
      </header>

      <div
        className="absolute top-[18px] left-1/2 z-20 inline-flex min-h-[42px] -translate-x-1/2 items-center gap-2 border border-[#17211c21] bg-[#fffdf6] px-3.5 font-mono text-[0.72rem] font-bold text-[#405047] uppercase shadow-[0_18px_50px_-24px_rgba(23,33,28,0.42)] max-sm:top-3 max-sm:right-3 max-sm:left-auto max-sm:translate-x-0"
        aria-live="polite"
      >
        <span
          className={
            selection.origin
              ? "h-[9px] w-[9px] rounded-full border border-[#216c2f] bg-[#216c2f]"
              : "h-[9px] w-[9px] rounded-full border border-[#216c2f6b]"
          }
        />
        <span
          className={
            selection.destination
              ? "h-[9px] w-[9px] rounded-full border border-[#216c2f] bg-[#216c2f]"
              : "h-[9px] w-[9px] rounded-full border border-[#216c2f6b]"
          }
        />
        <strong>{instructionLabel}</strong>
      </div>

      {isIntroOpen ? (
        <div
          className="absolute inset-0 z-30 grid place-items-center bg-[#17211c66] p-[18px]"
          role="presentation"
        >
          <section
            className="w-full max-w-[520px] border border-[#17211c21] bg-[#fffdf6] p-8 shadow-[0_24px_60px_-20px_rgba(23,33,28,0.35)] max-sm:p-[22px]"
            aria-labelledby="route-lens-intro-title"
            aria-modal="true"
            role="dialog"
          >
            <p className={eyebrowClassName}>RouteLens</p>
            <h1
              className="m-0 max-w-[460px] text-5xl leading-[0.98] font-medium max-sm:text-[2.4rem]"
              id="route-lens-intro-title"
            >
              Turn a route into visual scenes.
            </h1>
            <p className="mt-[18px] mb-0 text-[1.02rem] leading-[1.55] text-[#405047]">
              Pick an origin and destination on the map. RouteLens creates three
              AI-generated scenes inspired by the geography along your route.
            </p>
            <button
              className={`${primaryButtonClassName} mt-[22px]`}
              type="button"
              onClick={() => setIsIntroOpen(false)}
            >
              Start mapping
            </button>
          </section>
        </div>
      ) : null}

      {isReady ? (
        <aside
          className="absolute top-[18px] right-[18px] bottom-[18px] z-20 flex w-[min(390px,calc(100vw-36px))] flex-col gap-4 border border-[#17211c21] bg-[#fffdf6] p-5 shadow-[-18px_0_50px_-24px_rgba(23,33,28,0.42)] max-sm:top-auto max-sm:right-3 max-sm:bottom-3 max-sm:left-3 max-sm:max-h-[min(78vh,560px)] max-sm:w-auto max-sm:overflow-auto max-sm:p-4"
          aria-label="Journey confirmation"
        >
          <div className="grid gap-1">
            <p className={`${eyebrowClassName} mb-0`}>Review route</p>
            <h2 className="m-0 text-[1.6rem] leading-[1.05] font-medium">
              Ready to generate
            </h2>
          </div>

          <div className="grid gap-[7px]">
            <span className={panelLabelClassName}>Origin</span>
            <strong className="text-base leading-[1.45] font-medium text-[#17211c]">
              {selection.origin
                ? formatCoordinate(selection.origin)
                : "Not selected"}
            </strong>
          </div>

          <div className="grid gap-[7px]">
            <span className={panelLabelClassName}>Destination</span>
            <strong className="text-base leading-[1.45] font-medium text-[#17211c]">
              {selection.destination
                ? formatCoordinate(selection.destination)
                : "Not selected"}
            </strong>
          </div>

          <div className="grid gap-[7px]">
            <span className={panelLabelClassName}>Scenes</span>
            <strong className="text-base leading-[1.45] font-medium text-[#17211c]">
              {SCENE_COUNT} fixed scenes
            </strong>
          </div>

          <div className="grid gap-[7px]">
            <span className={panelLabelClassName}>Style</span>
            <div className="grid grid-cols-1 gap-2">
              {ROUTE_STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  className={
                    preset.value === style
                      ? "min-h-10 border border-[#216c2f] bg-[#eef4df] px-3 text-left font-mono text-[0.72rem] font-bold text-[#216c2f] uppercase"
                      : "min-h-10 border border-[#17211c21] bg-[#fffdf6] px-3 text-left font-mono text-[0.72rem] font-bold text-[#24352b] uppercase"
                  }
                  type="button"
                  onClick={() => setStyle(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto grid grid-cols-[104px_1fr] gap-2.5 max-sm:grid-cols-1">
            <button
              className={secondaryButtonClassName}
              type="button"
              onClick={resetSelection}
            >
              Reset
            </button>
            <button
              className={primaryButtonClassName}
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
