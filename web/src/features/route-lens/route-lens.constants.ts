import type { RouteStyle } from "./route-lens.types";

export const SCENE_COUNT = 3;

export const ROUTE_STYLE_PRESETS = [
  {
    value: "cinematic",
    label: "Cinematic"
  },
  {
    value: "watercolor",
    label: "Watercolor"
  },
  {
    value: "manga",
    label: "Manga"
  },
  {
    value: "travel_poster",
    label: "Travel poster"
  },
  {
    value: "concept_art",
    label: "Concept art"
  }
] satisfies ReadonlyArray<{
  value: RouteStyle;
  label: string;
}>;
