import { Prisma } from "../generated/prisma/client";

export const SCENE_INCLUDE = {
  activeImage: true,
  images: {
    orderBy: {
      version: "asc"
    }
  }
} satisfies Prisma.SceneInclude;

export type SceneWithImages = Prisma.SceneGetPayload<{
  include: typeof SCENE_INCLUDE;
}>;
