import type {
  JourneyStatus,
  RouteMode,
  RouteStyle,
  SceneImageStatus,
  SceneLabel
} from "../generated/prisma/client";

export interface CoordinateInput {
  lat: number;
  lng: number;
}

export interface CreateJourneyInput {
  origin: CoordinateInput;
  destination: CoordinateInput;
  style: RouteStyle;
}

export interface SceneImageResponse {
  id: string;
  prompt: string;
  imageUrl: string | null;
  storageKey: string | null;
  status: SceneImageStatus;
  errorCode: string | null;
  errorMessage: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SceneResponse {
  id: string;
  label: SceneLabel;
  order: number;
  lat: number;
  lng: number;
  placeLabel: string | null;
  activeImage: SceneImageResponse | null;
  images: SceneImageResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface JourneyResponse {
  id: string;
  status: JourneyStatus;
  routeMode: RouteMode | null;
  style: RouteStyle;
  origin: CoordinateInput;
  destination: CoordinateInput;
  routeGeojson: unknown;
  errorCode: string | null;
  errorMessage: string | null;
  completedImages: number;
  totalImages: number;
  scenes: SceneResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface JourneySummaryResponse {
  id: string;
  status: JourneyStatus;
  routeMode: RouteMode | null;
  style: RouteStyle;
  origin: CoordinateInput;
  destination: CoordinateInput;
  completedImages: number;
  totalImages: number;
  createdAt: string;
  updatedAt: string;
}
