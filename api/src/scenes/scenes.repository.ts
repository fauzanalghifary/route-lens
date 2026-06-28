import { Injectable } from "@nestjs/common";
import { SceneImageStatus } from "../generated/prisma/client";
import { JOURNEY_INCLUDE, JourneyWithScenes } from "../journeys/journeys.prisma";
import { PrismaService } from "../prisma/prisma.service";

interface RegenerateSceneImageInput {
  journeyId: string;
  sceneId: string;
  sessionId: string;
  prompt: string;
}

@Injectable()
export class ScenesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async regenerateSceneImage({
    journeyId,
    sceneId,
    sessionId,
    prompt
  }: RegenerateSceneImageInput): Promise<JourneyWithScenes | null> {
    return this.prisma.$transaction(async (tx) => {
      const scene = await tx.scene.findFirst({
        where: {
          id: sceneId,
          journeyId,
          journey: {
            sessionId
          }
        },
        include: {
          images: {
            orderBy: {
              version: "desc"
            },
            take: 1
          }
        }
      });

      if (!scene) {
        return null;
      }

      const nextVersion = (scene.images[0]?.version ?? 0) + 1;
      const image = await tx.sceneImage.create({
        data: {
          sceneId: scene.id,
          prompt,
          imageUrl: buildRegeneratedPlaceholderImageUrl(
            scene.label,
            nextVersion
          ),
          storageKey: `placeholder/${scene.journeyId}/${scene.id}/v${nextVersion}`,
          status: SceneImageStatus.completed,
          version: nextVersion
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

      return tx.journey.findUniqueOrThrow({
        where: {
          id: journeyId
        },
        include: JOURNEY_INCLUDE
      });
    });
  }
}

function buildRegeneratedPlaceholderImageUrl(
  label: string,
  version: number
): string {
  const text = encodeURIComponent(`RouteLens ${label} v${version}`);
  return `https://placehold.co/1024x768/png?text=${text}`;
}
