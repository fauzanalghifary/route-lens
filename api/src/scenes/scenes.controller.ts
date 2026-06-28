import { Body, Controller, Param, Post, Req } from "@nestjs/common";
import type { SceneResponse } from "../journeys/journeys.types";
import type { RequestWithSession } from "../session/request-with-session";
import { ScenesService } from "./scenes.service";

@Controller("scenes")
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  @Post(":id/regenerate")
  regenerateScene(
    @Req() request: RequestWithSession,
    @Param("id") sceneId: string,
    @Body() body: unknown
  ): Promise<SceneResponse> {
    return this.scenesService.regenerateScene(
      request.routeLensSessionId,
      sceneId,
      body
    );
  }
}
