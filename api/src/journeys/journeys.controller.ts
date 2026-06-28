import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import type { RequestWithSession } from "../session/request-with-session";
import { JourneysService } from "./journeys.service";
import type { JourneyResponse, JourneySummaryResponse } from "./journeys.types";

@Controller("journeys")
export class JourneysController {
  constructor(private readonly journeysService: JourneysService) {}

  @Post()
  createJourney(
    @Req() request: RequestWithSession,
    @Body() body: unknown
  ): Promise<JourneyResponse> {
    return this.journeysService.createJourney(
      request.routeLensSessionId,
      body
    );
  }

  @Get()
  listJourneys(
    @Req() request: RequestWithSession
  ): Promise<JourneySummaryResponse[]> {
    return this.journeysService.listJourneys(request.routeLensSessionId);
  }

  @Get(":id")
  getJourney(
    @Req() request: RequestWithSession,
    @Param("id") journeyId: string
  ): Promise<JourneyResponse> {
    return this.journeysService.getJourney(
      request.routeLensSessionId,
      journeyId
    );
  }
}
