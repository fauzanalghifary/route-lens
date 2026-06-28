import { Injectable, NotFoundException } from "@nestjs/common";
import { JourneyStatus, RouteMode, SceneImageStatus } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  buildFakeRouteGeojson,
  buildPlaceholderImageUrl,
  buildPlaceholderPrompt,
  buildScenePoints
} from "./fake-journey.factory";
import { JOURNEY_INCLUDE } from "./journeys.prisma";
import type { JourneyResponse, JourneySummaryResponse } from "./journeys.types";
import { toJourneyResponse, toJourneySummaryResponse } from "./journey-response.mapper";
import { parseCreateJourneyInput } from "./journey-validation";

@Injectable()
export class JourneysService {
  constructor(private readonly prisma: PrismaService) {}

  async createJourney(
    sessionId: string,
    body: unknown
  ): Promise<JourneyResponse> {
    const input = parseCreateJourneyInput(body);
    const scenePoints = buildScenePoints(input.origin, input.destination);
    const routeGeojson = buildFakeRouteGeojson(input.origin, input.destination);

    const journey = await this.prisma.$transaction(async (tx) => {
      const createdJourney = await tx.journey.create({
        data: {
          sessionId,
          originLat: input.origin.lat,
          originLng: input.origin.lng,
          destinationLat: input.destination.lat,
          destinationLng: input.destination.lng,
          routeGeojson,
          routeMode: RouteMode.approximate,
          style: input.style,
          status: JourneyStatus.completed
        }
      });

      for (const scenePoint of scenePoints) {
        const scene = await tx.scene.create({
          data: {
            journeyId: createdJourney.id,
            label: scenePoint.label,
            order: scenePoint.order,
            lat: scenePoint.lat,
            lng: scenePoint.lng,
            placeLabel: null
          }
        });

        const image = await tx.sceneImage.create({
          data: {
            sceneId: scene.id,
            prompt: buildPlaceholderPrompt(input.style, scenePoint),
            imageUrl: buildPlaceholderImageUrl(scenePoint.label),
            storageKey: `placeholder/${createdJourney.id}/${scene.id}/v1`,
            status: SceneImageStatus.completed,
            version: 1
          }
        });

        await tx.scene.update({
          where: {
            id: scene.id
          },
          data: {
            activeImageId: image.id
          }
        });
      }

      return tx.journey.findUniqueOrThrow({
        where: {
          id: createdJourney.id
        },
        include: JOURNEY_INCLUDE
      });
    });

    return toJourneyResponse(journey);
  }

  async listJourneys(sessionId: string): Promise<JourneySummaryResponse[]> {
    const journeys = await this.prisma.journey.findMany({
      where: {
        sessionId
      },
      orderBy: {
        createdAt: "desc"
      },
      include: JOURNEY_INCLUDE
    });

    return journeys.map(toJourneySummaryResponse);
  }

  async getJourney(
    sessionId: string,
    journeyId: string
  ): Promise<JourneyResponse> {
    const journey = await this.prisma.journey.findFirst({
      where: {
        id: journeyId,
        sessionId
      },
      include: JOURNEY_INCLUDE
    });

    if (!journey) {
      throw new NotFoundException("Journey not found");
    }

    return toJourneyResponse(journey);
  }
}
