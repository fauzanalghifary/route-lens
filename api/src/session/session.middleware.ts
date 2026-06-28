import { randomUUID } from "node:crypto";
import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import {
  SESSION_COOKIE_MAX_AGE_MS,
  SESSION_COOKIE_NAME
} from "./session.constants";
import type { RequestWithSession } from "./request-with-session";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const sessionId = getExistingSessionId(request) ?? randomUUID();

    (request as RequestWithSession).routeLensSessionId = sessionId;

    response.cookie(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      maxAge: SESSION_COOKIE_MAX_AGE_MS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    next();
  }
}

function getExistingSessionId(request: Request): string | null {
  const rawCookie = request.headers.cookie;

  if (!rawCookie) {
    return null;
  }

  const cookies = rawCookie.split(";");

  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.trim().split("=");

    if (rawName !== SESSION_COOKIE_NAME) {
      continue;
    }

    const value = decodeCookieValue(rawValueParts.join("="));
    return UUID_PATTERN.test(value) ? value : null;
  }

  return null;
}

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}
