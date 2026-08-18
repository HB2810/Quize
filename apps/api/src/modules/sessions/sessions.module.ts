import { Module } from "@nestjs/common";
import { JourneysModule } from "../journeys/journeys.module";
import { ScoringModule } from "../scoring/scoring.module";
import { ReportsModule } from "../reports/reports.module";
import { ShareModule } from "../share/share.module";
import { RecognitionModule } from "../recognition/recognition.module";
import { SessionsController } from "./sessions.controller";
import { SessionsService } from "./sessions.service";

/**
 * Participant session domain: session lifecycle, server-authoritative
 * progression, and answer responses (validation + evaluation snapshot).
 * The client never asserts position or correctness.
 */
@Module({
  imports: [
    JourneysModule,
    ScoringModule,
    ReportsModule,
    ShareModule,
    RecognitionModule,
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
