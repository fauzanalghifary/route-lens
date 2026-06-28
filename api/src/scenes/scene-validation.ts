import { BadRequestException } from "@nestjs/common";

const MAX_PROMPT_LENGTH = 1200;

export interface RegenerateSceneInput {
  prompt: string;
}

export function parseRegenerateSceneInput(
  body: unknown
): RegenerateSceneInput {
  if (!isRecord(body)) {
    throw new BadRequestException("Request body must be an object");
  }

  const { prompt } = body;

  if (typeof prompt !== "string") {
    throw new BadRequestException("prompt must be a string");
  }

  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    throw new BadRequestException("prompt must not be empty");
  }

  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    throw new BadRequestException(
      `prompt must be ${MAX_PROMPT_LENGTH} characters or fewer`
    );
  }

  return {
    prompt: trimmedPrompt
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
