import { Module } from "@nestjs/common";
import { ScoringService } from "./scoring.service";

/**
 * Scoring domain: evaluates completed sessions using the journey
 * version's scoringConfig (pluggable strategies; Healthy Bones uses
 * "correct-count" → awareness + discovery). Never UI-driven.
 */
@Module({
  providers: [ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
