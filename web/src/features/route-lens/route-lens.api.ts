import type { HealthResponse, JourneySummary } from "./route-lens.types";

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

export function getApiHealth(): Promise<ApiResult<HealthResponse>> {
  return fetchJson<HealthResponse>("/health");
}

export function listJourneys(): Promise<ApiResult<JourneySummary[]>> {
  return fetchJson<JourneySummary[]>("/journeys");
}

async function fetchJson<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      credentials: "include",
      cache: "no-store"
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `API returned ${response.status}`
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
