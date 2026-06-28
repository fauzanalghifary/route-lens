import { Injectable, NotFoundException } from "@nestjs/common";
import type { JourneyResponse } from "../journeys/journeys.types";
import { toJourneyResponse } from "../journeys/journey-response.mapper";
import { parseRegenerateJourneyInput } from "./journey-regeneration-validation";
import { ScenesRepository } from "./scenes.repository";

@Injectable()
export class ScenesService {
  constructor(private readonly scenesRepository: ScenesRepository) {}

  async regenerateJourney(
    sessionId: string,
    journeyId: string,
    body: unknown
  ): Promise<JourneyResponse> {
    const input = parseRegenerateJourneyInput(body);
    const journey = await this.scenesRepository.regenerateJourneyImages({
      additionalPrompt: input.additionalPrompt,
      journeyId,
      sessionId
    });

    if (!journey) {
      throw new NotFoundException("Journey not found");
    }

    return toJourneyResponse(journey);
  }
}
