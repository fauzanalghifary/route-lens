import { describe, expect, it } from "vitest";
import { RouteStyle, SceneLabel } from "../generated/prisma/client";
import {
  buildFakeRouteGeojson,
  buildPlaceholderImageUrl,
  buildPlaceholderPrompt,
  buildScenePoints
} from "./fake-journey.factory";

const origin = {
  lat: -6.2088,
  lng: 106.8456
};

const destination = {
  lat: -6.1754,
  lng: 106.8272
};

describe("buildScenePoints", () => {
  it("returns departure, midway, and arrival scene points", () => {
    expect(buildScenePoints(origin, destination)).toEqual([
      {
        label: SceneLabel.departure,
        order: 1,
        lat: -6.2088,
        lng: 106.8456
      },
      {
        label: SceneLabel.midway,
        order: 2,
        lat: -6.1921,
        lng: 106.8364
      },
      {
        label: SceneLabel.arrival,
        order: 3,
        lat: -6.1754,
        lng: 106.8272
      }
    ]);
  });
});

describe("buildFakeRouteGeojson", () => {
  it("builds an approximate LineString route", () => {
    expect(buildFakeRouteGeojson(origin, destination)).toEqual({
      type: "Feature",
      properties: {
        mode: "approximate"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [106.8456, -6.2088],
          [106.8272, -6.1754]
        ]
      }
    });
  });
});

describe("buildPlaceholderPrompt", () => {
  it("includes scene, style, and accuracy disclaimer", () => {
    const prompt = buildPlaceholderPrompt(RouteStyle.manga, {
      label: SceneLabel.midway,
      order: 2,
      lat: -6.1921,
      lng: 106.8364
    });

    expect(prompt).toContain("Scene: midway.");
    expect(prompt).toContain("Style preset: manga.");
    expect(prompt).toContain("not an exact street-view reconstruction");
  });
});

describe("buildPlaceholderImageUrl", () => {
  it("builds a placeholder image URL for the scene label", () => {
    expect(buildPlaceholderImageUrl(SceneLabel.arrival)).toBe(
      "https://placehold.co/1024x768/png?text=RouteLens%20arrival"
    );
  });
});
