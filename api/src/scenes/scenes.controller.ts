import { Body, Controller, Param, Post, Req } from "@nestjs/common";
import type { JourneyResponse } from "../journeys/journeys.types";
import type { RequestWithSession } from "../session/request-with-session";
import { ScenesService } from "./scenes.service";

@Controller("journeys")
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  @Post(":journeyId/regenerate")
  regenerateJourney(
    @Req() request: RequestWithSession,
    @Param("journeyId") journeyId: string,
    @Body() body: unknown
  ): Promise<JourneyResponse> {
    return this.scenesService.regenerateJourney(
      request.routeLensSessionId,
      journeyId,
      body
    );
  }
}
