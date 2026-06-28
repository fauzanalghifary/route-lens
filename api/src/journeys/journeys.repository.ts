import { Injectable } from "@nestjs/common";
import {
  JourneyStatus,
  Prisma,
  RouteMode,
  SceneImageStatus
} from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateJourneyInput } from "./journeys.types";
import { JOURNEY_INCLUDE, JourneyWithScenes } from "./journeys.prisma";
import type { ScenePoint } from "./fake-journey.factory";

interface CreateJourneySceneInput extends ScenePoint {
  prompt: string;
  imageUrl: string;
}

interface CreateJourneyWithScenesInput {
  sessionId: string;
  input: CreateJourneyInput;
  routeGeojson: Prisma.InputJsonObject;
  scenes: CreateJourneySceneInput[];
}

@Injectable()
export class JourneysRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createJourneyWithScenes({
    sessionId,
    input,
    routeGeojson,
    scenes
  }: CreateJourneyWithScenesInput): Promise<JourneyWithScenes> {
    return this.prisma.$transaction(async (tx) => {
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

      for (const sceneInput of scenes) {
        const scene = await tx.scene.create({
          data: {
            journeyId: createdJourney.id,
            label: sceneInput.label,
            order: sceneInput.order,
            lat: sceneInput.lat,
            lng: sceneInput.lng,
            placeLabel: null
          }
        });

        const image = await tx.sceneImage.create({
          data: {
            sceneId: scene.id,
            prompt: sceneInput.prompt,
            imageUrl: sceneInput.imageUrl,
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
  }

  async listJourneysForSession(sessionId: string): Promise<JourneyWithScenes[]> {
    return this.prisma.journey.findMany({
      where: {
        sessionId
      },
      orderBy: {
        createdAt: "desc"
      },
      include: JOURNEY_INCLUDE
    });
  }

  async findJourneyForSession(
    sessionId: string,
    journeyId: string
  ): Promise<JourneyWithScenes | null> {
    return this.prisma.journey.findFirst({
      where: {
        id: journeyId,
        sessionId
      },
      include: JOURNEY_INCLUDE
    });
  }
}
