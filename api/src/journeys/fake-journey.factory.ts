import { Prisma, RouteStyle, SceneLabel } from "../generated/prisma/client";
import type { CoordinateInput } from "./journeys.types";

export interface ScenePoint {
  label: SceneLabel;
  order: number;
  lat: number;
  lng: number;
}

export function buildScenePoints(
  origin: CoordinateInput,
  destination: CoordinateInput
): ScenePoint[] {
  return [
    {
      label: SceneLabel.departure,
      order: 1,
      lat: origin.lat,
      lng: origin.lng
    },
    {
      label: SceneLabel.midway,
      order: 2,
      lat: midpoint(origin.lat, destination.lat),
      lng: midpoint(origin.lng, destination.lng)
    },
    {
      label: SceneLabel.arrival,
      order: 3,
      lat: destination.lat,
      lng: destination.lng
    }
  ];
}

export function buildFakeRouteGeojson(
  origin: CoordinateInput,
  destination: CoordinateInput
): Prisma.InputJsonObject {
  return {
    type: "Feature",
    properties: {
      mode: "approximate"
    },
    geometry: {
      type: "LineString",
      coordinates: [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat]
      ]
    }
  };
}

export function buildPlaceholderPrompt(
  style: RouteStyle,
  scenePoint: ScenePoint
): string {
  return [
    "AI-generated scene inspired by the geography along a route.",
    `Scene: ${scenePoint.label}.`,
    `Style preset: ${style}.`,
    "Visual impression only, not an exact street-view reconstruction.",
    "No text, labels, maps, UI, or watermarks."
  ].join(" ");
}

export function buildPlaceholderImageUrl(label: SceneLabel): string {
  const text = encodeURIComponent(`RouteLens ${label}`);
  return `https://placehold.co/1024x768/png?text=${text}`;
}

function midpoint(a: number, b: number): number {
  return Number(((a + b) / 2).toFixed(7));
}
