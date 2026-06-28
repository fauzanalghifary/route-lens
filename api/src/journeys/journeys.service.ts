import { Injectable, NotFoundException } from "@nestjs/common";
import {
  buildFakeRouteGeojson,
  buildPlaceholderImageUrl,
  buildPlaceholderPrompt,
  buildScenePoints
} from "./fake-journey.factory";
import { JourneysRepository } from "./journeys.repository";
import type { JourneyResponse, JourneySummaryResponse } from "./journeys.types";
import { toJourneyResponse, toJourneySummaryResponse } from "./journey-response.mapper";
import { parseCreateJourneyInput } from "./journey-validation";

@Injectable()
export class JourneysService {
  constructor(private readonly journeysRepository: JourneysRepository) {}

  async createJourney(
    sessionId: string,
    body: unknown
  ): Promise<JourneyResponse> {
    const input = parseCreateJourneyInput(body);
    const scenePoints = buildScenePoints(input.origin, input.destination);
    const routeGeojson = buildFakeRouteGeojson(input.origin, input.destination);

    const journey = await this.journeysRepository.createJourneyWithScenes({
      sessionId,
      input,
      routeGeojson,
      scenes: scenePoints.map((scenePoint) => ({
        ...scenePoint,
        prompt: buildPlaceholderPrompt(input.style, scenePoint),
        imageUrl: buildPlaceholderImageUrl(scenePoint.label)
      }))
    });

    return toJourneyResponse(journey);
  }

  async listJourneys(sessionId: string): Promise<JourneySummaryResponse[]> {
    const journeys = await this.journeysRepository.listJourneysForSession(
      sessionId
    );

    return journeys.map(toJourneySummaryResponse);
  }

  async getJourney(
    sessionId: string,
    journeyId: string
  ): Promise<JourneyResponse> {
    const journey = await this.journeysRepository.findJourneyForSession(
      sessionId,
      journeyId
    );

    if (!journey) {
      throw new NotFoundException("Journey not found");
    }

    return toJourneyResponse(journey);
  }
}
