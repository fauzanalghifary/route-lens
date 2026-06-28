import type { CreateJourneyRequest, RouteStyle } from "@/lib/route-lens/types";

const pendingJourneyKeyPrefix = "route-lens:pending-journey:";

const routeStyles = new Set<RouteStyle>([
  "cinematic",
  "watercolor",
  "manga",
  "travel_poster",
  "concept_art"
]);

export function savePendingJourneyRequest(
  request: CreateJourneyRequest
): string {
  const draftId = crypto.randomUUID();

  sessionStorage.setItem(
    buildPendingJourneyKey(draftId),
    JSON.stringify(request)
  );

  return draftId;
}

export function consumePendingJourneyRequest(
  draftId: string
): CreateJourneyRequest | null {
  const key = buildPendingJourneyKey(draftId);
  const value = sessionStorage.getItem(key);

  if (!value) {
    return null;
  }

  sessionStorage.removeItem(key);

  return parsePendingJourneyRequest(value);
}

function buildPendingJourneyKey(draftId: string): string {
  return `${pendingJourneyKeyPrefix}${draftId}`;
}

function parsePendingJourneyRequest(
  value: string
): CreateJourneyRequest | null {
  try {
    const payload: unknown = JSON.parse(value);

    if (
      typeof payload === "object" &&
      payload !== null &&
      "origin" in payload &&
      "destination" in payload &&
      "style" in payload &&
      isCoordinate(payload.origin) &&
      isCoordinate(payload.destination) &&
      isRouteStyle(payload.style)
    ) {
      return {
        origin: payload.origin,
        destination: payload.destination,
        style: payload.style
      };
    }
  } catch {
    return null;
  }

  return null;
}

function isCoordinate(value: unknown): value is CreateJourneyRequest["origin"] {
  return (
    typeof value === "object" &&
    value !== null &&
    "lat" in value &&
    "lng" in value &&
    typeof value.lat === "number" &&
    typeof value.lng === "number" &&
    Number.isFinite(value.lat) &&
    Number.isFinite(value.lng)
  );
}

function isRouteStyle(value: unknown): value is RouteStyle {
  return typeof value === "string" && routeStyles.has(value as RouteStyle);
}
