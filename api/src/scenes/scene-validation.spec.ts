import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { parseRegenerateSceneInput } from "./scene-validation";

describe("parseRegenerateSceneInput", () => {
  it("trims and accepts a valid prompt", () => {
    expect(
      parseRegenerateSceneInput({
        prompt: "  A rainy cinematic scene near the destination  "
      })
    ).toEqual({
      prompt: "A rainy cinematic scene near the destination"
    });
  });

  it("rejects a missing prompt", () => {
    expect(() => parseRegenerateSceneInput({})).toThrow(BadRequestException);
  });

  it("rejects an empty prompt", () => {
    expect(() =>
      parseRegenerateSceneInput({
        prompt: "   "
      })
    ).toThrow("prompt must not be empty");
  });

  it("rejects a prompt over the maximum length", () => {
    expect(() =>
      parseRegenerateSceneInput({
        prompt: "a".repeat(1201)
      })
    ).toThrow("prompt must be 1200 characters or fewer");
  });
});
