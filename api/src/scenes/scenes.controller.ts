import { Body, Controller, Param, Post, Req } from "@nestjs/common";
import type { JourneyResponse } from "../journeys/journeys.types";
import type { RequestWithSession } from "../session/request-with-session";
import { ScenesService } from "./scenes.service";

@Controller("journeys/:journeyId/scenes")
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  @Post(":sceneId/regenerate")
  regenerateScene(
    @Req() request: RequestWithSession,
    @Param("journeyId") journeyId: string,
    @Param("sceneId") sceneId: string,
    @Body() body: unknown
  ): Promise<JourneyResponse> {
    return this.scenesService.regenerateScene(
      request.routeLensSessionId,
      journeyId,
      sceneId,
      body
    );
  }
}
