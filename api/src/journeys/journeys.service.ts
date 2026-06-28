import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  JourneyStatus,
  Prisma,
  RouteMode,
  RouteStyle,
  SceneImageStatus,
  SceneLabel
} from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type {
  CoordinateInput,
  CreateJourneyInput,
  JourneyResponse,
  JourneySummaryResponse,
  SceneImageResponse,
  SceneResponse
} from "./journeys.types";

const SUPPORTED_STYLES = new Set<string>(Object.values(RouteStyle));

const JOURNEY_INCLUDE = {
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

type JourneyWithScenes = Prisma.JourneyGetPayload<{
  include: typeof JOURNEY_INCLUDE;
}>;

interface ScenePoint {
  label: SceneLabel;
  order: number;
  lat: number;
  lng: number;
}

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

function parseCreateJourneyInput(body: unknown): CreateJourneyInput {
  if (!isRecord(body)) {
    throw new BadRequestException("Request body must be an object");
  }

  const origin = parseCoordinate(body.origin, "origin");
  const destination = parseCoordinate(body.destination, "destination");
  const style = parseStyle(body.style);

  if (coordinatesAreSame(origin, destination)) {
    throw new BadRequestException("Origin and destination must be different");
  }

  return {
    origin,
    destination,
    style
  };
}

function parseCoordinate(value: unknown, fieldName: string): CoordinateInput {
  if (!isRecord(value)) {
    throw new BadRequestException(`${fieldName} must be an object`);
  }

  const { lat, lng } = value;

  if (!isNumber(lat) || lat < -90 || lat > 90) {
    throw new BadRequestException(`${fieldName}.lat must be between -90 and 90`);
  }

  if (!isNumber(lng) || lng < -180 || lng > 180) {
    throw new BadRequestException(
      `${fieldName}.lng must be between -180 and 180`
    );
  }

  return {
    lat,
    lng
  };
}

function parseStyle(value: unknown): RouteStyle {
  if (typeof value !== "string" || !SUPPORTED_STYLES.has(value)) {
    throw new BadRequestException(
      `style must be one of: ${Array.from(SUPPORTED_STYLES).join(", ")}`
    );
  }

  return value as RouteStyle;
}

function buildScenePoints(
  origin: CoordinateInput,
  destination: CoordinateInput
): ScenePoint[] {
  return [
    {
      label: SceneLabel.departure,
      order: 1,
      lat: origin.lat,
      lng: origin.lng
    },
    {
      label: SceneLabel.midway,
      order: 2,
      lat: midpoint(origin.lat, destination.lat),
      lng: midpoint(origin.lng, destination.lng)
    },
    {
      label: SceneLabel.arrival,
      order: 3,
      lat: destination.lat,
      lng: destination.lng
    }
  ];
}

function buildFakeRouteGeojson(
  origin: CoordinateInput,
  destination: CoordinateInput
): Prisma.InputJsonObject {
  return {
    type: "Feature",
    properties: {
      mode: "approximate"
    },
    geometry: {
      type: "LineString",
      coordinates: [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat]
      ]
    }
  };
}

function buildPlaceholderPrompt(style: RouteStyle, scenePoint: ScenePoint): string {
  return [
    "AI-generated scene inspired by the geography along a route.",
    `Scene: ${scenePoint.label}.`,
    `Style preset: ${style}.`,
    "Visual impression only, not an exact street-view reconstruction.",
    "No text, labels, maps, UI, or watermarks."
  ].join(" ");
}

function buildPlaceholderImageUrl(label: SceneLabel): string {
  const text = encodeURIComponent(`RouteLens ${label}`);
  return `https://placehold.co/1024x768/png?text=${text}`;
}

function midpoint(a: number, b: number): number {
  return Number(((a + b) / 2).toFixed(7));
}

function coordinatesAreSame(
  origin: CoordinateInput,
  destination: CoordinateInput
): boolean {
  return origin.lat === destination.lat && origin.lng === destination.lng;
}

function toJourneySummaryResponse(
  journey: JourneyWithScenes
): JourneySummaryResponse {
  const imageCounts = countImages(journey.scenes);

  return {
    id: journey.id,
    status: journey.status,
    routeMode: journey.routeMode,
    style: journey.style,
    origin: {
      lat: decimalToNumber(journey.originLat),
      lng: decimalToNumber(journey.originLng)
    },
    destination: {
      lat: decimalToNumber(journey.destinationLat),
      lng: decimalToNumber(journey.destinationLng)
    },
    completedImages: imageCounts.completed,
    totalImages: imageCounts.total,
    createdAt: journey.createdAt.toISOString(),
    updatedAt: journey.updatedAt.toISOString()
  };
}

function toJourneyResponse(journey: JourneyWithScenes): JourneyResponse {
  const imageCounts = countImages(journey.scenes);

  return {
    ...toJourneySummaryResponse(journey),
    routeGeojson: journey.routeGeojson,
    errorCode: journey.errorCode,
    errorMessage: journey.errorMessage,
    completedImages: imageCounts.completed,
    totalImages: imageCounts.total,
    scenes: journey.scenes.map(toSceneResponse)
  };
}

function toSceneResponse(
  scene: JourneyWithScenes["scenes"][number]
): SceneResponse {
  return {
    id: scene.id,
    label: scene.label,
    order: scene.order,
    lat: decimalToNumber(scene.lat),
    lng: decimalToNumber(scene.lng),
    placeLabel: scene.placeLabel,
    activeImage: scene.activeImage ? toSceneImageResponse(scene.activeImage) : null,
    images: scene.images.map(toSceneImageResponse),
    createdAt: scene.createdAt.toISOString(),
    updatedAt: scene.updatedAt.toISOString()
  };
}

function toSceneImageResponse(
  image: JourneyWithScenes["scenes"][number]["images"][number]
): SceneImageResponse {
  return {
    id: image.id,
    prompt: image.prompt,
    imageUrl: image.imageUrl,
    storageKey: image.storageKey,
    status: image.status,
    errorCode: image.errorCode,
    errorMessage: image.errorMessage,
    version: image.version,
    createdAt: image.createdAt.toISOString(),
    updatedAt: image.updatedAt.toISOString()
  };
}

function countImages(scenes: JourneyWithScenes["scenes"]): {
  completed: number;
  total: number;
} {
  const images = scenes.flatMap((scene) => scene.images);

  return {
    completed: images.filter((image) => image.status === SceneImageStatus.completed)
      .length,
    total: images.length
  };
}

function decimalToNumber(value: { toString(): string }): number {
  return Number(value.toString());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
