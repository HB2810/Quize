import { Controller, Get, Param } from "@nestjs/common";
import type { PublicJourney } from "@stavya/contracts";
import { JourneysService } from "./journeys.service";

@Controller("journeys")
export class JourneysController {
  constructor(private readonly journeys: JourneysService) {}

  @Get(":slug")
  getJourney(@Param("slug") slug: string): Promise<PublicJourney> {
    return this.journeys.getPublicJourney(slug);
  }
}
