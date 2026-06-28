import { Controller, Get } from "@nestjs/common";

interface HealthResponse {
  status: "ok";
  service: "route-lens-api";
}

@Controller("health")
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "route-lens-api"
    };
  }
}
