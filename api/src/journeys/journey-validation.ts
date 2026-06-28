import { BadRequestException } from "@nestjs/common";
import { RouteStyle } from "../generated/prisma/client";
import type { CoordinateInput, CreateJourneyInput } from "./journeys.types";

const SUPPORTED_STYLES = new Set<string>(Object.values(RouteStyle));

export function parseCreateJourneyInput(body: unknown): CreateJourneyInput {
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

function coordinatesAreSame(
  origin: CoordinateInput,
  destination: CoordinateInput
): boolean {
  return origin.lat === destination.lat && origin.lng === destination.lng;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
