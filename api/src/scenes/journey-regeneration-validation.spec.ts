import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { parseRegenerateJourneyInput } from "./journey-regeneration-validation";

describe("parseRegenerateJourneyInput", () => {
  it("trims the additional prompt", () => {
    expect(
      parseRegenerateJourneyInput({
        additionalPrompt: "  make it rainy  "
      })
    ).toEqual({
      additionalPrompt: "make it rainy"
    });
  });

  it("treats an empty prompt as no additional prompt", () => {
    expect(
      parseRegenerateJourneyInput({
        additionalPrompt: "   "
      })
    ).toEqual({
      additionalPrompt: null
    });
  });

  it("rejects non-string additional prompts", () => {
    expect(() =>
      parseRegenerateJourneyInput({
        additionalPrompt: 123
      })
    ).toThrow(BadRequestException);
  });

  it("rejects overly long additional prompts", () => {
    expect(() =>
      parseRegenerateJourneyInput({
        additionalPrompt: "a".repeat(501)
      })
    ).toThrow("additionalPrompt must be 500 characters or fewer");
  });
});
