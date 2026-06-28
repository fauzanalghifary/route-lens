import { SceneImageStatus } from "../generated/prisma/client";
import type {
  JourneyResponse,
  JourneySummaryResponse,
  SceneImageResponse,
  SceneResponse
} from "./journeys.types";
import type { JourneyWithScenes } from "./journeys.prisma";

export function toJourneySummaryResponse(
  journey: JourneyWithScenes
): JourneySummaryResponse {
  const imageCounts = countImages(journey.scenes);

  return {
    id: journey.id,
    status: journey.status,
    routeMode: journey.routeMode,
    style: journey.style,
    origin: {
      lat: decimalToNumber(journey.originLat),
      lng: decimalToNumber(journey.originLng)
    },
    destination: {
      lat: decimalToNumber(journey.destinationLat),
      lng: decimalToNumber(journey.destinationLng)
    },
    completedImages: imageCounts.completed,
    totalImages: imageCounts.total,
    createdAt: journey.createdAt.toISOString(),
    updatedAt: journey.updatedAt.toISOString()
  };
}

export function toJourneyResponse(journey: JourneyWithScenes): JourneyResponse {
  const imageCounts = countImages(journey.scenes);

  return {
    ...toJourneySummaryResponse(journey),
    routeGeojson: journey.routeGeojson,
    errorCode: journey.errorCode,
    errorMessage: journey.errorMessage,
    completedImages: imageCounts.completed,
    totalImages: imageCounts.total,
    scenes: journey.scenes.map(toSceneResponse)
  };
}

function toSceneResponse(
  scene: JourneyWithScenes["scenes"][number]
): SceneResponse {
  return {
    id: scene.id,
    label: scene.label,
    order: scene.order,
    lat: decimalToNumber(scene.lat),
    lng: decimalToNumber(scene.lng),
    placeLabel: scene.placeLabel,
    activeImage: scene.activeImage ? toSceneImageResponse(scene.activeImage) : null,
    images: scene.images.map(toSceneImageResponse),
    createdAt: scene.createdAt.toISOString(),
    updatedAt: scene.updatedAt.toISOString()
  };
}

function toSceneImageResponse(
  image: JourneyWithScenes["scenes"][number]["images"][number]
): SceneImageResponse {
  return {
    id: image.id,
    prompt: image.prompt,
    imageUrl: image.imageUrl,
    storageKey: image.storageKey,
    status: image.status,
    errorCode: image.errorCode,
    errorMessage: image.errorMessage,
    version: image.version,
    createdAt: image.createdAt.toISOString(),
    updatedAt: image.updatedAt.toISOString()
  };
}

function countImages(scenes: JourneyWithScenes["scenes"]): {
  completed: number;
  total: number;
} {
  const images = scenes.flatMap((scene) => scene.images);

  return {
    completed: images.filter((image) => image.status === SceneImageStatus.completed)
      .length,
    total: images.length
  };
}

function decimalToNumber(value: { toString(): string }): number {
  return Number(value.toString());
}
