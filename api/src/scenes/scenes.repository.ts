import { Injectable } from "@nestjs/common";
import { SceneImageStatus } from "../generated/prisma/client";
import { JOURNEY_INCLUDE, JourneyWithScenes } from "../journeys/journeys.prisma";
import { PrismaService } from "../prisma/prisma.service";

interface RegenerateJourneyImagesInput {
  journeyId: string;
  sessionId: string;
}

@Injectable()
export class ScenesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async regenerateJourneyImages({
    journeyId,
    sessionId
  }: RegenerateJourneyImagesInput): Promise<JourneyWithScenes | null> {
    return this.prisma.$transaction(async (tx) => {
      const journey = await tx.journey.findFirst({
        where: {
          id: journeyId,
          sessionId
        },
        include: {
          scenes: {
            orderBy: {
              order: "asc"
            },
            include: {
              activeImage: true,
              images: {
                orderBy: {
                  version: "desc"
                },
                take: 1
              }
            }
          }
        }
      });

      if (!journey) {
        return null;
      }

      for (const scene of journey.scenes) {
        const nextVersion = (scene.images[0]?.version ?? 0) + 1;
        const prompt =
          scene.activeImage?.prompt ??
          `AI-generated ${scene.label} scene inspired by the geography along the route.`;
        const image = await tx.sceneImage.create({
          data: {
            sceneId: scene.id,
            prompt,
            imageUrl: buildRegeneratedPlaceholderImageUrl(
              scene.label,
              nextVersion
            ),
            storageKey: `placeholder/${journey.id}/${scene.id}/v${nextVersion}`,
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
      }

      return tx.journey.findUniqueOrThrow({
        where: {
          id: journey.id
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
