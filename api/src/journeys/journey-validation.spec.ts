import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { RouteStyle } from "../generated/prisma/client";
import { parseCreateJourneyInput } from "./journey-validation";

describe("parseCreateJourneyInput", () => {
  it("accepts a valid journey request", () => {
    const input = parseCreateJourneyInput({
      origin: {
        lat: -6.2088,
        lng: 106.8456
      },
      destination: {
        lat: -6.1754,
        lng: 106.8272
      },
      style: RouteStyle.travel_poster
    });

    expect(input).toEqual({
      origin: {
        lat: -6.2088,
        lng: 106.8456
      },
      destination: {
        lat: -6.1754,
        lng: 106.8272
      },
      style: RouteStyle.travel_poster
    });
  });

  it("rejects an unsupported style", () => {
    expect(() =>
      parseCreateJourneyInput({
        origin: {
          lat: -6.2088,
          lng: 106.8456
        },
        destination: {
          lat: -6.1754,
          lng: 106.8272
        },
        style: "oil_painting"
      })
    ).toThrow(BadRequestException);
  });

  it("rejects matching origin and destination", () => {
    expect(() =>
      parseCreateJourneyInput({
        origin: {
          lat: -6.2088,
          lng: 106.8456
        },
        destination: {
          lat: -6.2088,
          lng: 106.8456
        },
        style: RouteStyle.cinematic
      })
    ).toThrow("Origin and destination must be different");
  });

  it("rejects coordinates outside valid latitude and longitude ranges", () => {
    expect(() =>
      parseCreateJourneyInput({
        origin: {
          lat: -91,
          lng: 106.8456
        },
        destination: {
          lat: -6.1754,
          lng: 181
        },
        style: RouteStyle.cinematic
      })
    ).toThrow("origin.lat must be between -90 and 90");
  });
});
