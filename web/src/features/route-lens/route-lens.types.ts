export interface HealthResponse {
  status: "ok";
  service: "route-lens-api";
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface JourneySummary {
  id: string;
  status: string;
  routeMode: string | null;
  style: string;
  origin: Coordinate;
  destination: Coordinate;
  completedImages: number;
  totalImages: number;
  createdAt: string;
  updatedAt: string;
}
