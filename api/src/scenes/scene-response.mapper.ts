import type { SceneResponse } from "../journeys/journeys.types";
import { toSceneResponse } from "../journeys/journey-response.mapper";
import type { SceneWithImages } from "./scenes.prisma";

export function toRegeneratedSceneResponse(
  scene: SceneWithImages
): SceneResponse {
  return toSceneResponse(scene);
}
