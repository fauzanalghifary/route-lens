import { BadRequestException } from "@nestjs/common";

const MAX_ADDITIONAL_PROMPT_LENGTH = 500;

export interface RegenerateJourneyInput {
  additionalPrompt: string | null;
}

export function parseRegenerateJourneyInput(
  body: unknown
): RegenerateJourneyInput {
  if (body === undefined || body === null) {
    return {
      additionalPrompt: null
    };
  }

  if (!isRecord(body)) {
    throw new BadRequestException("Request body must be an object");
  }

  const additionalPrompt = body.additionalPrompt;

  if (additionalPrompt === undefined || additionalPrompt === null) {
    return {
      additionalPrompt: null
    };
  }

  if (typeof additionalPrompt !== "string") {
    throw new BadRequestException("additionalPrompt must be a string");
  }

  const trimmedPrompt = additionalPrompt.trim();

  if (!trimmedPrompt) {
    return {
      additionalPrompt: null
    };
  }

  if (trimmedPrompt.length > MAX_ADDITIONAL_PROMPT_LENGTH) {
    throw new BadRequestException(
      `additionalPrompt must be ${MAX_ADDITIONAL_PROMPT_LENGTH} characters or fewer`
    );
  }

  return {
    additionalPrompt: trimmedPrompt
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
