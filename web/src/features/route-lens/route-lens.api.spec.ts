import { describe, expect, it } from "vitest";
import { normalizeApiBaseUrl, routeLensQueryKeys } from "./route-lens.api";

describe("normalizeApiBaseUrl", () => {
  it("removes trailing slashes", () => {
    expect(normalizeApiBaseUrl("http://localhost:3001///")).toBe(
      "http://localhost:3001"
    );
  });

  it("keeps a URL without trailing slash unchanged", () => {
    expect(normalizeApiBaseUrl("https://route-lens-api.fly.dev")).toBe(
      "https://route-lens-api.fly.dev"
    );
  });
});

describe("routeLensQueryKeys", () => {
  it("keeps journey query keys stable", () => {
    expect(routeLensQueryKeys.journeys()).toEqual(["route-lens", "journeys"]);
  });
});
