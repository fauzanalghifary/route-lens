import { Injectable, NotFoundException } from "@nestjs/common";
import type { SceneResponse } from "../journeys/journeys.types";
import { parseRegenerateSceneInput } from "./scene-validation";
import { toRegeneratedSceneResponse } from "./scene-response.mapper";
import { ScenesRepository } from "./scenes.repository";

@Injectable()
export class ScenesService {
  constructor(private readonly scenesRepository: ScenesRepository) {}

  async regenerateScene(
    sessionId: string,
    sceneId: string,
    body: unknown
  ): Promise<SceneResponse> {
    const input = parseRegenerateSceneInput(body);
    const scene = await this.scenesRepository.regenerateSceneImage({
      sceneId,
      sessionId,
      prompt: input.prompt
    });

    if (!scene) {
      throw new NotFoundException("Scene not found");
    }

    return toRegeneratedSceneResponse(scene);
  }
}
