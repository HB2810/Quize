import { Controller, Get } from "@nestjs/common";
import type { HealthResponse } from "@stavya/contracts";

@Controller("health")
export class HealthController {
  @Get()
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "stavya-api",
      timestamp: new Date().toISOString(),
    };
  }
}
