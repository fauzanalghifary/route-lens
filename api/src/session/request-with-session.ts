import type { Request } from "express";

export interface RequestWithSession extends Request {
  routeLensSessionId: string;
}
