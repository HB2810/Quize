import { Controller, Get } from "@nestjs/common";
import type { HealthResponse } from "@stavya/contracts";

@Controller()
export class HealthController {
  @Get()
  getRoot() {
    return {
      status: "ok",
      name: "Stavya Awareness Platform API",
      service: "stavya-api",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("health")
  getHealth(): HealthResponse {
    return {
      status: "ok",
      service: "stavya-api",
      timestamp: new Date().toISOString(),
    };
  }
}
