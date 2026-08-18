import { Module } from "@nestjs/common";
import { JourneysController } from "./journeys.controller";
import { JourneysService } from "./journeys.service";

/**
 * Journey content domain: journeys, versions, languages, pathways,
 * questions, options, translations. Owns version lifecycle
 * (DRAFT → REVIEW → PUBLISHED → ARCHIVED); the public API serves only
 * PUBLISHED versions.
 */
@Module({
  controllers: [JourneysController],
  providers: [JourneysService],
  exports: [JourneysService],
})
export class JourneysModule {}
