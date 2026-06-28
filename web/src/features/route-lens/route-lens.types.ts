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
