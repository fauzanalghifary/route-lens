export interface HealthResponse {
  status: "ok";
  service: "route-lens-api";
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export type RouteStyle =
  | "cinematic"
  | "watercolor"
  | "manga"
  | "travel_poster"
  | "concept_art";

export interface CreateJourneyRequest {
  origin: Coordinate;
  destination: Coordinate;
  style: RouteStyle;
}

export interface JourneySummary {
  id: string;
  status: string;
  routeMode: string | null;
  style: RouteStyle;
  origin: Coordinate;
  destination: Coordinate;
  completedImages: number;
  totalImages: number;
  createdAt: string;
  updatedAt: string;
}

export interface SceneImage {
  id: string;
  prompt: string;
  imageUrl: string | null;
  storageKey: string | null;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface JourneyScene {
  id: string;
  label: "departure" | "midway" | "arrival";
  order: number;
  lat: number;
  lng: number;
  placeLabel: string | null;
  activeImage: SceneImage | null;
  images: SceneImage[];
  createdAt: string;
  updatedAt: string;
}

export interface JourneyDetail extends JourneySummary {
  routeGeojson: unknown;
  errorCode: string | null;
  errorMessage: string | null;
  scenes: JourneyScene[];
}
