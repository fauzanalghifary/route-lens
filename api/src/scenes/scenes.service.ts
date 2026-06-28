import { Injectable, NotFoundException } from "@nestjs/common";
import type { JourneyResponse } from "../journeys/journeys.types";
import { toJourneyResponse } from "../journeys/journey-response.mapper";
import { parseRegenerateSceneInput } from "./scene-validation";
import { ScenesRepository } from "./scenes.repository";

@Injectable()
export class ScenesService {
  constructor(private readonly scenesRepository: ScenesRepository) {}

  async regenerateScene(
    sessionId: string,
    journeyId: string,
    sceneId: string,
    body: unknown
  ): Promise<JourneyResponse> {
    const input = parseRegenerateSceneInput(body);
    const journey = await this.scenesRepository.regenerateSceneImage({
      journeyId,
      sceneId,
      sessionId,
      prompt: input.prompt
    });

    if (!journey) {
      throw new NotFoundException("Scene not found");
    }

    return toJourneyResponse(journey);
  }
}
