import type {
  CreateJourneyRequest,
  JourneyDetail,
  JourneySummary,
  RegenerateSceneRequest
} from "./types";

export const routeLensQueryKeys = {
  journey: (journeyId: string) => ["route-lens", "journey", journeyId] as const,
  journeys: () => ["route-lens", "journeys"] as const
};

export type ApiResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
    };

export function getApiBaseUrl(): string {
  return normalizeApiBaseUrl(
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
  );
}

export function normalizeApiBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function listJourneys(): Promise<ApiResult<JourneySummary[]>> {
  return fetchJson<JourneySummary[]>("/journeys");
}

export function getJourney(
  journeyId: string
): Promise<ApiResult<JourneyDetail>> {
  return fetchJson<JourneyDetail>(`/journeys/${journeyId}`);
}

export function createJourney(
  request: CreateJourneyRequest
): Promise<ApiResult<JourneyDetail>> {
  return fetchJson<JourneyDetail>("/journeys", {
    method: "POST",
    body: JSON.stringify(request),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export function regenerateScene(
  journeyId: string,
  sceneId: string,
  request: RegenerateSceneRequest
): Promise<ApiResult<JourneyDetail>> {
  return fetchJson<JourneyDetail>(
    `/journeys/${journeyId}/scenes/${sceneId}/regenerate`,
    {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

async function fetchJson<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      credentials: "include",
      cache: "no-store",
      ...init
    });

    if (!response.ok) {
      return {
        ok: false,
        message: await getErrorMessage(response)
      };
    }

    const data = (await response.json()) as T;

    return {
      ok: true,
      data
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "API request failed"
    };
  }
}

async function getErrorMessage(response: Response): Promise<string> {
  const fallback = `API returned ${response.status}`;

  try {
    const payload: unknown = await response.json();

    if (
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
    ) {
      return payload.message;
    }
  } catch {
    return fallback;
  }

  return fallback;
}
