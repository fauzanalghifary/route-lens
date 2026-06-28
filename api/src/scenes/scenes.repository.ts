import { Injectable } from "@nestjs/common";
import { SceneImageStatus } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SCENE_INCLUDE, SceneWithImages } from "./scenes.prisma";

interface RegenerateSceneImageInput {
  sceneId: string;
  sessionId: string;
  prompt: string;
}

@Injectable()
export class ScenesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async regenerateSceneImage({
    sceneId,
    sessionId,
    prompt
  }: RegenerateSceneImageInput): Promise<SceneWithImages | null> {
    return this.prisma.$transaction(async (tx) => {
      const scene = await tx.scene.findFirst({
        where: {
          id: sceneId,
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

      return tx.scene.update({
        where: {
          id: scene.id
        },
        data: {
          activeImageId: image.id
        },
        include: SCENE_INCLUDE
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
