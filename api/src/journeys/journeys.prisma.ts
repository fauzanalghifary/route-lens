import { Prisma } from "../generated/prisma/client";

export const JOURNEY_INCLUDE = {
  scenes: {
    orderBy: {
      order: "asc"
    },
    include: {
      activeImage: true,
      images: {
        orderBy: {
          version: "asc"
        }
      }
    }
  }
} satisfies Prisma.JourneyInclude;

export type JourneyWithScenes = Prisma.JourneyGetPayload<{
  include: typeof JOURNEY_INCLUDE;
}>;
