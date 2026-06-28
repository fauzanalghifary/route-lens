import { afterEach, describe, expect, it } from "vitest";
import { getAllowedWebOrigins } from "./web-origins";

const originalWebOrigin = process.env.WEB_ORIGIN;
const originalWebOrigins = process.env.WEB_ORIGINS;

describe("getAllowedWebOrigins", () => {
  afterEach(() => {
    process.env.WEB_ORIGIN = originalWebOrigin;
    process.env.WEB_ORIGINS = originalWebOrigins;
  });

  it("falls back to localhost for development", () => {
    delete process.env.WEB_ORIGIN;
    delete process.env.WEB_ORIGINS;

    expect(getAllowedWebOrigins()).toEqual(["http://localhost:3000"]);
  });

  it("supports the legacy single WEB_ORIGIN variable", () => {
    delete process.env.WEB_ORIGINS;
    process.env.WEB_ORIGIN = "https://route-lens-web.fly.dev";

    expect(getAllowedWebOrigins()).toEqual(["https://route-lens-web.fly.dev"]);
  });

  it("supports multiple comma-separated WEB_ORIGINS", () => {
    process.env.WEB_ORIGINS =
      "https://route-lens.example.com, https://route-lens-web.fly.dev";
    process.env.WEB_ORIGIN = "https://ignored.example.com";

    expect(getAllowedWebOrigins()).toEqual([
      "https://route-lens.example.com",
      "https://route-lens-web.fly.dev"
    ]);
  });
});
